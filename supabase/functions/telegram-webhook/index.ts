import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TELEGRAM_TOKEN  = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const WEBHOOK_SECRET  = Deno.env.get("TELEGRAM_WEBHOOK_SECRET")!;
const TELEGRAM_API    = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// Service-role client: bypasses RLS intentionally.
// All reads/writes are scoped to the authenticated user via explicit filters.
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ─── Telegram helpers ────────────────────────────────────────

async function sendMessage(chatId: number, text: string): Promise<void> {
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  if (!res.ok) {
    console.error(`sendMessage failed: ${res.status}`, await res.text());
  }
}

// ─── Context de usuario ──────────────────────────────────────
// Resuelve: telegram_id → user_id → app_id (tabla 'projects', name='Hogar')

interface UserContext {
  userId: string;
  appId: string | null;       // ID del proyecto Hogar del usuario
  householdId: string | null; // Primer hogar del usuario (Phase 2)
}

async function getUserContext(telegramId: number): Promise<UserContext | null> {
  // 1. Buscar el user_id vinculado a este telegram_id
  const { data: link, error: linkError } = await supabase
    .from("user_telegram_links")
    .select("user_id")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (linkError) {
    console.error("getUserContext: link lookup error:", linkError);
    return null;
  }
  if (!link) return null;

  // 2. Encontrar la app Hogar del usuario (tabla 'projects', name='Hogar')
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("owner_id", link.user_id)
    .eq("name", "Hogar")
    .maybeSingle();

  if (projectError) {
    console.error("getUserContext: project lookup error:", projectError);
  }

  // 3. Obtener household (Phase 2 — puede ser null)
  const { data: member, error: memberError } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", link.user_id)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (memberError) {
    console.error("getUserContext: member lookup error:", memberError);
  }

  return {
    userId: link.user_id,
    appId: project?.id ?? null,
    householdId: member?.household_id ?? null,
  };
}

// ─── Comando /link ───────────────────────────────────────────

async function handleLink(
  chatId: number,
  telegramId: number,
  telegramUsername: string | undefined,
  telegramFirstName: string | undefined,
  code: string
): Promise<void> {
  const { data: linkCode } = await supabase
    .from("telegram_link_codes")
    .select("id, user_id, expires_at")
    .eq("code", code.toUpperCase().trim())
    .eq("used", false)
    .maybeSingle();

  if (!linkCode) {
    await sendMessage(chatId, "❌ Código inválido o expirado.\nGenera uno nuevo en la app → Hogar → Ajustes → Conectar Telegram.");
    return;
  }

  if (new Date(linkCode.expires_at) < new Date()) {
    await supabase.from("telegram_link_codes").update({ used: true }).eq("id", linkCode.id);
    await sendMessage(chatId, "⏰ El código ha expirado (validez 10 min).\nGenera uno nuevo en la app.");
    return;
  }

  // Verificar si este telegram_id ya está vinculado a OTRO usuario
  const { data: existingLink } = await supabase
    .from("user_telegram_links")
    .select("user_id")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (existingLink && existingLink.user_id !== linkCode.user_id) {
    await sendMessage(chatId, "⚠️ Este Telegram ya está vinculado a otra cuenta.\nDesvincula primero desde la app del otro usuario.");
    return;
  }

  const { error } = await supabase
    .from("user_telegram_links")
    .upsert({
      user_id: linkCode.user_id,
      telegram_id: telegramId,
      telegram_username: telegramUsername ?? null,
      telegram_first_name: telegramFirstName ?? null,
      linked_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (error) {
    console.error("Upsert link error:", error);
    await sendMessage(chatId, "❌ Error al vincular. Inténtalo de nuevo.");
    return;
  }

  await supabase.from("telegram_link_codes").update({ used: true }).eq("id", linkCode.id);

  await sendMessage(
    chatId,
    `✅ <b>¡Telegram vinculado correctamente!</b>\n\nYa puedes gestionar tu lista de la compra desde aquí.\nEscribe /help para ver los comandos disponibles.`
  );
}

// ─── Comando /unlink ─────────────────────────────────────────

async function handleUnlink(chatId: number, telegramId: number): Promise<void> {
  const { error } = await supabase
    .from("user_telegram_links")
    .delete()
    .eq("telegram_id", telegramId);

  if (error) {
    await sendMessage(chatId, "❌ Error al desvincular.");
    return;
  }
  await sendMessage(chatId, "🔓 Cuenta de Telegram desvinculada correctamente.");
}

// ─── Parsear texto libre en items ────────────────────────────

function splitItems(text: string): string[] {
  return text
    .split(/[,\n]|\sy\s|\so\s/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 1 && s.length < 80);
}

// ─── Comando /add y texto libre ──────────────────────────────
// Inserta en tabla 'items' con estructura real del codebase:
// { title, app_id, module: 'supermercado', type: 'product', metadata: JSONB }

async function handleAdd(
  chatId: number,
  ctx: UserContext,
  items: string[],
  forcePrivate?: boolean
): Promise<void> {
  if (items.length === 0) {
    await sendMessage(chatId, "¿Qué quieres añadir?\nEjemplo: <code>leche pan yogur</code> o <code>/add leche</code>");
    return;
  }

  if (!ctx.appId) {
    await sendMessage(chatId, "❌ No se encontró tu app Hogar. ¿Está creada? Abre la app una vez para inicializarla.");
    return;
  }

  const householdId = forcePrivate ? null : ctx.householdId;

  const rows = items.map((name) => ({
    title: name,
    app_id: ctx.appId,
    module: "supermercado",
    type: "product",
    checked: false,
    household_id: householdId,
    source: "telegram",
    metadata: {
      quantity: 1,
      unit: null,
      category: "otros",
      store: null,
      price_unit: null,
    },
  }));

  const { error } = await supabase.from("items").insert(rows);

  if (error) {
    console.error("Insert items error:", error);
    await sendMessage(chatId, "❌ Error al añadir los items.");
    return;
  }

  const scope = householdId ? "lista del hogar 🏠" : "lista de la compra";
  const list = items.map((i) => `• ${i}`).join("\n");
  await sendMessage(chatId, `✅ Añadido a la ${scope}:\n${list}`);
}

// ─── Comando /list ───────────────────────────────────────────

async function handleList(chatId: number, ctx: UserContext): Promise<void> {
  if (!ctx.appId) {
    await sendMessage(chatId, "❌ No se encontró tu app Hogar.");
    return;
  }

  const { data, error } = await supabase
    .from("items")
    .select("title, checked, household_id")
    .eq("app_id", ctx.appId)
    .eq("module", "supermercado")
    .eq("checked", false)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error || !data) {
    await sendMessage(chatId, "❌ Error al leer la lista.");
    return;
  }

  if (data.length === 0) {
    await sendMessage(chatId, "📋 La lista está vacía.");
    return;
  }

  const privateItems = data.filter((i) => !i.household_id);
  const sharedItems  = data.filter((i) => i.household_id);

  let msg = "📋 <b>Lista de la compra</b>\n";
  if (sharedItems.length > 0) {
    msg += "\n🏠 <b>Compartida</b>\n";
    msg += sharedItems.map((i) => `• ${i.title}`).join("\n");
  }
  if (privateItems.length > 0) {
    if (sharedItems.length > 0) msg += "\n\n";
    msg += "\n👤 <b>Personal</b>\n";
    msg += privateItems.map((i) => `• ${i.title}`).join("\n");
  }

  await sendMessage(chatId, msg);
}

// ─── Comando /check ──────────────────────────────────────────

async function handleCheck(chatId: number, ctx: UserContext, itemName: string): Promise<void> {
  if (!ctx.appId) {
    await sendMessage(chatId, "❌ No se encontró tu app Hogar.");
    return;
  }

  // Escape LIKE wildcards to prevent /check % from matching all items
  const safeName = itemName.replace(/[%_\\]/g, "\\$&");

  const { data, error } = await supabase
    .from("items")
    .update({ checked: true, checked_at: new Date().toISOString() })
    .eq("app_id", ctx.appId)
    .eq("module", "supermercado")
    .eq("checked", false)
    .ilike("title", `%${safeName}%`)
    .select("title");

  if (error) {
    await sendMessage(chatId, "❌ Error al marcar el item.");
    return;
  }

  if (!data || data.length === 0) {
    await sendMessage(chatId, `❓ No encontré "<b>${itemName}</b>" en la lista.`);
  } else {
    await sendMessage(chatId, `✅ Marcado como comprado: ${data.map((d) => d.title).join(", ")}`);
  }
}

// ─── Comando /help ───────────────────────────────────────────

async function handleHelp(chatId: number, hasHousehold: boolean): Promise<void> {
  await sendMessage(
    chatId,
    `🏠 <b>Hogar Bot</b>\n\n` +
    `<b>Lista de la compra:</b>\n` +
    `leche pan yogur → añade items\n` +
    `/add leche pan → igual\n` +
    `/addprivado leche → solo tuyo\n` +
    `/list → ver lista pendiente\n` +
    `/check leche → marcar comprado\n\n` +
    `<b>Cuenta:</b>\n` +
    `/status → ver estado de tu cuenta\n` +
    `/unlink → desvincular Telegram`
  );
}

// ─── Handler principal ───────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const secretHeader = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (secretHeader !== WEBHOOK_SECRET) {
    return new Response("Forbidden", { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const message = body?.message as Record<string, unknown> | undefined;
  if (!message) return new Response("OK", { status: 200 });

  const chatId            = (message.chat as Record<string, unknown>)?.id as number;
  const from              = message.from as Record<string, unknown> | undefined;
  const fromId            = from?.id as number;
  const telegramUsername  = from?.username as string | undefined;
  const telegramFirstName = from?.first_name as string | undefined;
  const text              = ((message.text as string) ?? "").trim();

  if (!chatId || !fromId || !text) return new Response("OK", { status: 200 });

  // /link <CÓDIGO> — no requiere estar vinculado previamente
  const linkMatch = text.match(/^\/link\s+([A-Z0-9]{6})/i);
  if (linkMatch) {
    await handleLink(chatId, fromId, telegramUsername, telegramFirstName, linkMatch[1]);
    return new Response("OK", { status: 200 });
  }

  // /start link_XXXXXX — deep link desde la app
  const startLinkMatch = text.match(/^\/start\s+link_([A-Z0-9]{6})/i);
  if (startLinkMatch) {
    await handleLink(chatId, fromId, telegramUsername, telegramFirstName, startLinkMatch[1]);
    return new Response("OK", { status: 200 });
  }

  // Todos los demás comandos requieren vínculo
  const ctx = await getUserContext(fromId);

  if (!ctx) {
    await sendMessage(
      chatId,
      `👋 Hola${telegramFirstName ? ` ${telegramFirstName}` : ""}!\n\n` +
      `Para usar el bot, primero vincula tu cuenta:\n` +
      `1. Abre la app Hogar\n` +
      `2. Ve a Hogar → Ajustes → Conectar Telegram\n` +
      `3. Envía el código aquí con <code>/link XXXXXX</code>`
    );
    return new Response("OK", { status: 200 });
  }

  try {
    if (text === "/help" || text === "/start") {
      await handleHelp(chatId, !!ctx.householdId);
    } else if (text === "/list") {
      await handleList(chatId, ctx);
    } else if (text === "/unlink") {
      await handleUnlink(chatId, fromId);
    } else if (/^\/add\s+/i.test(text)) {
      const payload = text.replace(/^\/add\s+/i, "");
      await handleAdd(chatId, ctx, splitItems(payload));
    } else if (/^\/addprivado\s+/i.test(text)) {
      const payload = text.replace(/^\/addprivado\s+/i, "");
      await handleAdd(chatId, ctx, splitItems(payload), true);
    } else if (/^\/check\s+/i.test(text)) {
      const itemName = text.replace(/^\/check\s+/i, "").trim();
      await handleCheck(chatId, ctx, itemName);
    } else if (text === "/status") {
      await sendMessage(
        chatId,
        `👤 Telegram vinculado ✅\n` +
        `🏠 App Hogar: ${ctx.appId ? "encontrada" : "no encontrada — abre la app una vez"}\n` +
        `👥 Hogar compartido: ${ctx.householdId ? "configurado" : "sin hogar (lista personal)"}`
      );
    } else {
      // Texto libre → parsear como items de la compra
      const buyVerbs = /\b(añade?|agrega?|compra?|pon|necesito|falta|faltan)\b/i;
      let items: string[] = [];

      if (buyVerbs.test(text)) {
        const afterVerb = text.replace(buyVerbs, "").replace(/\b(y|,)\b/g, ",").trim();
        items = splitItems(afterVerb);
      } else if (!text.startsWith("/")) {
        items = splitItems(text);
      }

      if (items.length > 0) {
        await handleAdd(chatId, ctx, items);
      } else {
        await sendMessage(chatId, `No entendí "<b>${text}</b>"\nEscribe /help para ver los comandos.`);
      }
    }
  } catch (err) {
    console.error("Handler error:", err);
    await sendMessage(chatId, "❌ Error interno.");
  }

  return new Response("OK", { status: 200 });
});
