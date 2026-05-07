import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") ?? "";

// ─── Telegram helpers ────────────────────────────────────────

async function sendMessage(
  chatId: number,
  text: string,
  botToken: string,
  replyMarkup?: object
): Promise<void> {
  const body: Record<string, unknown> = { chat_id: chatId, text, parse_mode: "HTML" };
  if (replyMarkup) body.reply_markup = replyMarkup;
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) console.error(`sendMessage failed: ${res.status}`, await res.text());
}

async function answerCallbackQuery(id: string, botToken: string, text?: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: id, text }),
  });
}

// ─── Transcripción de voz con Groq Whisper ───────────────────

async function transcribeVoice(fileId: string, botToken: string): Promise<string | null> {
  // 1. Obtener ruta del archivo en Telegram
  const fileRes = await fetch(
    `https://api.telegram.org/bot${botToken}/getFile?file_id=${encodeURIComponent(fileId)}`
  );
  const fileData = await fileRes.json();
  if (!fileData.ok) {
    console.error("getFile failed:", fileData);
    return null;
  }

  // 2. Descargar el audio (OGG/Opus)
  const filePath = fileData.result.file_path as string;
  const audioRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`);
  if (!audioRes.ok) {
    console.error("Audio download failed:", audioRes.status);
    return null;
  }
  const audioBuffer = await audioRes.arrayBuffer();

  // 3. Transcribir con Groq Whisper large-v3-turbo (rápido, preciso en español)
  const formData = new FormData();
  formData.append("file", new Blob([audioBuffer], { type: "audio/ogg" }), "voice.ogg");
  formData.append("model", "whisper-large-v3-turbo");
  formData.append("language", "es");
  formData.append("response_format", "text");

  const transcribeRes = await fetch(
    "https://api.groq.com/openai/v1/audio/transcriptions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
      body: formData,
    }
  );

  if (!transcribeRes.ok) {
    console.error("Groq transcription failed:", transcribeRes.status, await transcribeRes.text());
    return null;
  }

  return (await transcribeRes.text()).trim();
}

// ─── Teclado inline de supermercados ────────────────────────

const STORE_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "🛒 Mercadona", callback_data: "store:Mercadona" },
      { text: "🛒 Lidl",      callback_data: "store:Lidl"      },
    ],
    [
      { text: "🛒 Carrefour",  callback_data: "store:Carrefour"  },
      { text: "🐟 La Sirena",  callback_data: "store:La Sirena"  },
    ],
    [
      { text: "📋 General (sin super)", callback_data: "store:General" },
    ],
  ],
};

// ─── Context de usuario ──────────────────────────────────────

interface UserContext {
  userId: string;
  appId: string | null;
  householdId: string | null;
}

async function getUserContext(telegramId: number): Promise<UserContext | null> {
  const { data: link, error: linkError } = await supabase
    .from("user_telegram_links")
    .select("user_id")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (linkError) { console.error("getUserContext link error:", linkError); return null; }
  if (!link) return null;

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("owner_id", link.user_id)
    .eq("name", "Hogar")
    .maybeSingle();

  const { data: member } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", link.user_id)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

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
  code: string,
  botToken: string
): Promise<void> {
  const { data: linkCode } = await supabase
    .from("telegram_link_codes")
    .select("id, user_id, expires_at")
    .eq("code", code.toUpperCase().trim())
    .eq("used", false)
    .maybeSingle();

  if (!linkCode) {
    await sendMessage(chatId, "❌ Código inválido o expirado.\nGenera uno nuevo en la app → Hogar → Ajustes → Conectar Telegram.", botToken);
    return;
  }
  if (new Date(linkCode.expires_at) < new Date()) {
    await supabase.from("telegram_link_codes").update({ used: true }).eq("id", linkCode.id);
    await sendMessage(chatId, "⏰ El código ha expirado (validez 10 min).\nGenera uno nuevo en la app.", botToken);
    return;
  }

  const { data: existingLink } = await supabase
    .from("user_telegram_links")
    .select("user_id")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (existingLink && existingLink.user_id !== linkCode.user_id) {
    await sendMessage(chatId, "⚠️ Este Telegram ya está vinculado a otra cuenta.\nDesvincula primero desde la app.", botToken);
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
    await sendMessage(chatId, "❌ Error al vincular. Inténtalo de nuevo.", botToken);
    return;
  }

  await supabase.from("telegram_link_codes").update({ used: true }).eq("id", linkCode.id);
  await sendMessage(chatId, `✅ <b>¡Telegram vinculado correctamente!</b>\n\nYa puedes gestionar tu lista de la compra desde aquí.\nEscribe /help para ver los comandos disponibles.`, botToken);
}

// ─── Comando /unlink ─────────────────────────────────────────

async function handleUnlink(chatId: number, telegramId: number, botToken: string): Promise<void> {
  const { error } = await supabase.from("user_telegram_links").delete().eq("telegram_id", telegramId);
  if (error) { await sendMessage(chatId, "❌ Error al desvincular.", botToken); return; }
  await sendMessage(chatId, "🔓 Cuenta de Telegram desvinculada correctamente.", botToken);
}

// ─── Parsear texto en items ──────────────────────────────────

const FILLER = /\b(a\s+la\s+lista(\s+de\s+la\s+compra)?|en\s+la\s+lista|a\s+mi\s+lista|de\s+la\s+compra|al\s+carrito)\b/gi;

function splitItems(text: string): string[] {
  return text
    .split(/[,\n]|\sy\s/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 1 && s.length < 80);
}

function parseItems(text: string): string[] {
  // Cubre conjugaciones: añade/añada/añadir, agrega/agregue, compra/compre, etc.
  const buyVerbs = /\b(añad[aeiou]r?|agreg[aeo]r?|compr[aeo]r?|pone?|necesit[ao]|falt[ao]n?)\b/i;

  if (buyVerbs.test(text)) {
    const afterVerb = text
      .replace(buyVerbs, "")
      .replace(FILLER, "")
      .replace(/\b(y|,)\b/g, ",")
      .trim();
    return splitItems(afterVerb);
  }

  if (!text.startsWith("/")) {
    return splitItems(text);
  }

  return [];
}

// ─── Comando /add y texto libre ──────────────────────────────

async function handleAdd(
  chatId: number,
  ctx: UserContext,
  items: string[],
  botToken: string,
  forcePrivate?: boolean,
  transcription?: string  // para mostrar qué entendió del audio
): Promise<void> {
  if (items.length === 0) {
    await sendMessage(chatId, "¿Qué quieres añadir?\nEjemplo: <code>leche pan yogur</code> o <code>/add leche</code>", botToken);
    return;
  }
  if (!ctx.appId) {
    await sendMessage(chatId, "❌ No se encontró tu app Hogar. Abre la app una vez para inicializarla.", botToken);
    return;
  }

  // Deduplicar: no añadir items que ya están en la lista sin marcar
  const { data: existing } = await supabase
    .from("items")
    .select("title")
    .eq("app_id", ctx.appId)
    .eq("module", "supermercado")
    .eq("checked", false);

  const existingTitles = new Set((existing ?? []).map((i) => i.title.toLowerCase().trim()));
  const toAdd      = items.filter((i) => !existingTitles.has(i.toLowerCase().trim()));
  const duplicates = items.filter((i) =>  existingTitles.has(i.toLowerCase().trim()));

  const prefix = transcription ? `🎙️ <i>"${transcription}"</i>\n\n` : "";

  if (toAdd.length === 0) {
    const dupList = duplicates.map((i) => `• ${i}`).join("\n");
    await sendMessage(chatId, `${prefix}⚠️ Ya estaba en la lista:\n${dupList}`, botToken);
    return;
  }

  const householdId = forcePrivate ? null : ctx.householdId;
  const rows = toAdd.map((name) => ({
    title: name,
    app_id: ctx.appId,
    module: "supermercado",
    type: "product",
    checked: false,
    household_id: householdId,
    source: "telegram",
    metadata: { quantity: 1, unit: null, category: "otros", store: null, price_unit: null },
  }));

  const { error } = await supabase.from("items").insert(rows);
  if (error) {
    console.error("Insert items error:", error);
    await sendMessage(chatId, "❌ Error al añadir los items.", botToken);
    return;
  }

  const addedList = toAdd.map((i) => `• ${i}`).join("\n");
  const dupNote   = duplicates.length > 0
    ? `\n\n⚠️ Ya estaba: ${duplicates.join(", ")}`
    : "";

  await sendMessage(
    chatId,
    `${prefix}✅ Añadido:\n${addedList}${dupNote}\n\n¿A qué supermercado?`,
    botToken,
    STORE_KEYBOARD
  );
}

// ─── Callback: selección de supermercado ─────────────────────

async function handleStoreCallback(
  callbackQueryId: string,
  chatId: number,
  telegramId: number,
  store: string,
  botToken: string
): Promise<void> {
  const ctx = await getUserContext(telegramId);
  if (!ctx?.appId) {
    await answerCallbackQuery(callbackQueryId, botToken, "❌ No se encontró tu app");
    return;
  }

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: recentItems } = await supabase
    .from("items")
    .select("id, metadata")
    .eq("app_id", ctx.appId)
    .eq("source", "telegram")
    .gte("created_at", tenMinutesAgo);

  const pending = (recentItems ?? []).filter((i) => !i.metadata?.store);

  if (pending.length === 0) {
    await answerCallbackQuery(callbackQueryId, botToken, "No hay items recientes para asignar");
    return;
  }

  const storeValue = store === "General" ? null : store;
  await Promise.all(
    pending.map((item) =>
      supabase.from("items").update({
        metadata: { ...item.metadata, store: storeValue },
      }).eq("id", item.id)
    )
  );

  const storeLabel = store === "General" ? "General (sin super)" : store;
  await answerCallbackQuery(callbackQueryId, botToken, `✅ ${storeLabel}`);
  await sendMessage(chatId, `🛒 Supermercado asignado: <b>${storeLabel}</b>`, botToken);
}

// ─── Comando /list ───────────────────────────────────────────

async function handleList(chatId: number, ctx: UserContext, botToken: string): Promise<void> {
  if (!ctx.appId) { await sendMessage(chatId, "❌ No se encontró tu app Hogar.", botToken); return; }

  const { data, error } = await supabase
    .from("items")
    .select("title, metadata")
    .eq("app_id", ctx.appId)
    .eq("module", "supermercado")
    .eq("checked", false)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error || !data) { await sendMessage(chatId, "❌ Error al leer la lista.", botToken); return; }
  if (data.length === 0) { await sendMessage(chatId, "📋 La lista está vacía.", botToken); return; }

  const byStore: Record<string, string[]> = {};
  for (const item of data) {
    const store = item.metadata?.store ?? "General";
    if (!byStore[store]) byStore[store] = [];
    byStore[store].push(item.title);
  }

  let msg = "📋 <b>Lista de la compra</b>\n";
  for (const [store, items] of Object.entries(byStore)) {
    msg += `\n<b>${store}</b>\n` + items.map((i) => `• ${i}`).join("\n") + "\n";
  }

  await sendMessage(chatId, msg.trim(), botToken);
}

// ─── Comando /check ──────────────────────────────────────────

async function handleCheck(chatId: number, ctx: UserContext, itemName: string, botToken: string): Promise<void> {
  if (!ctx.appId) { await sendMessage(chatId, "❌ No se encontró tu app Hogar.", botToken); return; }

  const safeName = itemName.replace(/[%_\\]/g, "\\$&");
  const { data: found } = await supabase
    .from("items")
    .select("id, title")
    .eq("app_id", ctx.appId)
    .eq("module", "supermercado")
    .eq("checked", false)
    .ilike("title", `%${safeName}%`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!found) { await sendMessage(chatId, `❓ No encontré "<b>${safeName}</b>" en la lista.`, botToken); return; }

  const { error } = await supabase
    .from("items")
    .update({ checked: true, checked_at: new Date().toISOString() })
    .eq("id", found.id);

  if (error) { await sendMessage(chatId, "❌ Error al marcar el item.", botToken); return; }
  await sendMessage(chatId, `✅ Marcado como comprado: ${found.title}`, botToken);
}

// ─── Comando /help ───────────────────────────────────────────

async function handleHelp(chatId: number, botToken: string): Promise<void> {
  await sendMessage(
    chatId,
    `🏠 <b>Hogar Bot</b>\n\n` +
    `<b>Lista de la compra:</b>\n` +
    `leche pan yogur → añade items\n` +
    `🎙️ Nota de voz → transcribe y añade\n` +
    `/add leche pan → igual que texto\n` +
    `/addprivado leche → solo tuyo\n` +
    `/list → ver lista (agrupada por super)\n` +
    `/check leche → marcar comprado\n\n` +
    `<b>Cuenta:</b>\n` +
    `/status → estado de tu cuenta\n` +
    `/unlink → desvincular Telegram`,
    botToken
  );
}

// ─── Handler principal ───────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secretHeader = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (!secretHeader) return new Response("Forbidden", { status: 403 });

  const { data: botConfig, error: botConfigError } = await supabase
    .from("telegram_bot_config")
    .select("bot_token, user_id")
    .eq("webhook_secret", secretHeader)
    .maybeSingle();

  if (botConfigError || !botConfig) {
    console.error("Bot config lookup failed:", botConfigError);
    return new Response("Forbidden", { status: 403 });
  }

  const botToken = botConfig.bot_token;

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return new Response("Bad request", { status: 400 }); }

  // ── Callback query (botones de super) ───────────────────────
  const callbackQuery = body?.callback_query as Record<string, unknown> | undefined;
  if (callbackQuery) {
    const cbId    = callbackQuery.id as string;
    const cbFrom  = callbackQuery.from as Record<string, unknown>;
    const cbMsg   = callbackQuery.message as Record<string, unknown>;
    const cbData  = callbackQuery.data as string;
    const cbChatId = (cbMsg?.chat as Record<string, unknown>)?.id as number;
    const cbFromId = cbFrom?.id as number;

    if (cbData?.startsWith("store:")) {
      await handleStoreCallback(cbId, cbChatId, cbFromId, cbData.replace("store:", ""), botToken);
    } else {
      await answerCallbackQuery(cbId, botToken);
    }
    return new Response("OK", { status: 200 });
  }

  // ── Message ──────────────────────────────────────────────────
  const message = body?.message as Record<string, unknown> | undefined;
  if (!message) return new Response("OK", { status: 200 });

  const chatId            = (message.chat as Record<string, unknown>)?.id as number;
  const from              = message.from as Record<string, unknown> | undefined;
  const fromId            = from?.id as number;
  const telegramUsername  = from?.username as string | undefined;
  const telegramFirstName = from?.first_name as string | undefined;

  if (!chatId || !fromId) return new Response("OK", { status: 200 });

  // ── Nota de voz ──────────────────────────────────────────────
  const voice = message.voice as Record<string, unknown> | undefined;
  const audio = message.audio as Record<string, unknown> | undefined;
  const voiceFileId = (voice?.file_id ?? audio?.file_id) as string | undefined;

  if (voiceFileId) {
    // Requiere vínculo previo
    const ctx = await getUserContext(fromId);
    if (!ctx) {
      await sendMessage(chatId,
        `👋 Primero vincula tu cuenta:\n` +
        `Hogar → Ajustes → Conectar Telegram → envía <code>/link XXXXXX</code>`,
        botToken
      );
      return new Response("OK", { status: 200 });
    }

    await sendMessage(chatId, "🎙️ Transcribiendo...", botToken);
    const transcription = await transcribeVoice(voiceFileId, botToken);

    if (!transcription) {
      await sendMessage(chatId, "❌ No pude transcribir el audio. Inténtalo de nuevo.", botToken);
      return new Response("OK", { status: 200 });
    }

    const items = parseItems(transcription);
    if (items.length > 0) {
      await handleAdd(chatId, ctx, items, botToken, false, transcription);
    } else {
      await sendMessage(
        chatId,
        `🎙️ Entendí: "<i>${transcription}</i>"\n\nNo detecté productos. Di algo como: "añade leche y pan".`,
        botToken
      );
    }
    return new Response("OK", { status: 200 });
  }

  // ── Mensaje de texto ─────────────────────────────────────────
  const text = ((message.text as string) ?? "").trim();
  if (!text) return new Response("OK", { status: 200 });

  // /link y /start no requieren vínculo
  const linkMatch = text.match(/^\/link\s+([A-Z0-9]{6})/i);
  if (linkMatch) {
    await handleLink(chatId, fromId, telegramUsername, telegramFirstName, linkMatch[1], botToken);
    return new Response("OK", { status: 200 });
  }
  const startLinkMatch = text.match(/^\/start\s+link_([A-Z0-9]{6})/i);
  if (startLinkMatch) {
    await handleLink(chatId, fromId, telegramUsername, telegramFirstName, startLinkMatch[1], botToken);
    return new Response("OK", { status: 200 });
  }

  const ctx = await getUserContext(fromId);
  if (!ctx) {
    await sendMessage(
      chatId,
      `👋 Hola${telegramFirstName ? ` ${telegramFirstName}` : ""}!\n\n` +
      `Para usar el bot, primero vincula tu cuenta:\n` +
      `1. Abre la app Hogar\n` +
      `2. Ve a Hogar → Ajustes → Conectar Telegram\n` +
      `3. Envía el código con <code>/link XXXXXX</code>`,
      botToken
    );
    return new Response("OK", { status: 200 });
  }

  try {
    if (text === "/help" || text === "/start") {
      await handleHelp(chatId, botToken);
    } else if (text === "/list") {
      await handleList(chatId, ctx, botToken);
    } else if (text === "/unlink") {
      await handleUnlink(chatId, fromId, botToken);
    } else if (/^\/add\s+/i.test(text)) {
      await handleAdd(chatId, ctx, splitItems(text.replace(/^\/add\s+/i, "")), botToken);
    } else if (/^\/addprivado\s+/i.test(text)) {
      await handleAdd(chatId, ctx, splitItems(text.replace(/^\/addprivado\s+/i, "")), botToken, true);
    } else if (/^\/check\s+/i.test(text)) {
      await handleCheck(chatId, ctx, text.replace(/^\/check\s+/i, "").trim(), botToken);
    } else if (text === "/status") {
      await sendMessage(
        chatId,
        `👤 Telegram vinculado ✅\n` +
        `🏠 App Hogar: ${ctx.appId ? "encontrada" : "no encontrada — abre la app una vez"}\n` +
        `👥 Hogar compartido: ${ctx.householdId ? "configurado" : "sin hogar (lista personal)"}`,
        botToken
      );
    } else {
      const items = parseItems(text);
      if (items.length > 0) {
        await handleAdd(chatId, ctx, items, botToken);
      } else {
        await sendMessage(chatId, `No entendí "<b>${text}</b>"\nEscribe /help para ver los comandos.`, botToken);
      }
    }
  } catch (err) {
    console.error("Handler error:", err);
    await sendMessage(chatId, "❌ Error interno.", botToken);
  }

  return new Response("OK", { status: 200 });
});
