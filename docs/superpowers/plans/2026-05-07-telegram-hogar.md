# Telegram Bot — Hogar Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conectar la app Hogar con un bot de Telegram para gestionar la lista de la compra mediante comandos de texto, con vinculación segura por código de un solo uso.

**Architecture:** El usuario genera un código de 6 caracteres en la app → lo envía al bot → el bot lo valida contra `telegram_link_codes` y crea el vínculo persistente en `user_telegram_links`. A partir de ahí, el bot resuelve `telegram_id → user_id → hogar app_id` para leer/escribir items en la tabla `items` del módulo `supermercado`. Los hogares compartidos (Phase 2) se modelan con las tablas `households`/`household_members` que se crean desde ya pero no se exponen en UI hasta la siguiente fase.

**Tech Stack:** React 19 + React Router v7 + Supabase (PostgreSQL, RLS, Edge Functions Deno, Realtime) + Telegram Bot API

---

## ⚠️ Adaptaciones críticas del spec al codebase real

El spec usa nombres de tabla que difieren del schema real:

| Spec | Codebase real |
|------|---------------|
| `shopping_list_items` | `items` (con `module='supermercado'`, `type='product'`) |
| `apps` | `projects` |
| `name` (campo item) | `title` |
| `user_id` directo en items | `app_id` → `projects.owner_id` |

El bot para añadir un item necesita: lookup `telegram_id → user_id → projects WHERE owner_id=user_id AND name='Hogar' → app_id`, y luego insertar en `items` con `{ title, app_id, module: 'supermercado', type: 'product', metadata: { quantity, unit, category, store, price_unit } }`.

---

## File Map

### Crear
- `supabase/migrations/20260507_telegram_households.sql` — Tablas nuevas + ALTER items
- `supabase/functions/generate-telegram-code/index.ts` — Edge Function vinculación
- `supabase/functions/telegram-webhook/index.ts` — Edge Function bot (ADAPTADA)
- `src/components/TelegramLinkCard.jsx` — UI vinculación
- `src/pages/app/modules/HogarAjustes.jsx` — Módulo settings de Hogar

### Modificar
- `src/pages/app/AppLayout.jsx` — Añadir módulo `ajustes` a `HOGAR_MODULES`
- `src/App.jsx` — Añadir lazy import + ruta `/app/hogar/ajustes`

---

## Task 1: Migración SQL — Tablas nuevas + ALTER items

**Files:**
- Create: `supabase/migrations/20260507_telegram_households.sql`

- [ ] **Step 1: Crear el archivo de migración**

```sql
-- supabase/migrations/20260507_telegram_households.sql

-- ============================================================
-- 1. HOUSEHOLDS (para fase 2 — se crea ahora, UI después)
-- ============================================================
CREATE TABLE IF NOT EXISTS households (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. HOUSEHOLD MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS household_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (household_id, user_id)
);

-- ============================================================
-- 3. TELEGRAM LINK CODES (código de un solo uso, expira 10 min)
-- ============================================================
CREATE TABLE IF NOT EXISTS telegram_link_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telegram_link_codes_code
  ON telegram_link_codes(code)
  WHERE used = FALSE;

-- ============================================================
-- 4. USER TELEGRAM LINKS (vínculo persistente)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_telegram_links (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_id         BIGINT NOT NULL UNIQUE,
  telegram_username   TEXT,
  telegram_first_name TEXT,
  linked_at           TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. ALTER items — campos Telegram + household
-- ============================================================
ALTER TABLE items
  ADD COLUMN IF NOT EXISTS household_id      UUID REFERENCES households(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS source            TEXT DEFAULT 'web' CHECK (source IN ('web', 'telegram')),
  ADD COLUMN IF NOT EXISTS added_by_telegram BIGINT;

-- ============================================================
-- 6. FUNCIÓN limpieza automática de códigos expirados
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_expired_link_codes()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM telegram_link_codes
  WHERE expires_at < now() AND used = FALSE;
$$;
```

- [ ] **Step 2: Ejecutar en Supabase Dashboard → SQL Editor**

  Copiar el contenido del archivo y ejecutarlo. Verificar en Table Editor que aparecen las tablas `households`, `household_members`, `telegram_link_codes`, `user_telegram_links` y que la tabla `items` tiene las columnas `household_id`, `source`, `added_by_telegram`.

- [ ] **Step 3: Commit**

```bash
cd /home/user/mi-portfolio-proyectos
git add supabase/migrations/20260507_telegram_households.sql
git commit -m "feat(db): add households, telegram_link_codes, user_telegram_links tables"
```

---

## Task 2: RLS Policies

**Files:**
- Modify: `supabase/migrations/20260507_telegram_households.sql` (añadir al final) — o ejecutar en SQL Editor directamente

- [ ] **Step 1: Añadir políticas al final del archivo de migración**

```sql
-- ============================================================
-- RLS — HOUSEHOLDS
-- ============================================================
ALTER TABLE households ENABLE ROW LEVEL SECURITY;

CREATE POLICY "households_select" ON households
  FOR SELECT USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM household_members
      WHERE household_id = households.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "households_insert" ON households
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "households_update" ON households
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "households_delete" ON households
  FOR DELETE USING (created_by = auth.uid());

-- ============================================================
-- RLS — HOUSEHOLD MEMBERS
-- ============================================================
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hm_select" ON household_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM household_members hm2
      WHERE hm2.household_id = household_members.household_id
        AND hm2.user_id = auth.uid()
    )
  );

-- Primer miembro (el creador) o admin del hogar puede añadir
CREATE POLICY "hm_insert" ON household_members
  FOR INSERT WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM household_members
      WHERE household_id = household_members.household_id
    )
    OR EXISTS (
      SELECT 1 FROM household_members
      WHERE household_id = household_members.household_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "hm_delete" ON household_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM household_members
      WHERE household_id = household_members.household_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- ============================================================
-- RLS — USER TELEGRAM LINKS
-- Solo el propio usuario ve/elimina su vínculo.
-- INSERT/UPDATE solo desde Edge Functions (service role).
-- ============================================================
ALTER TABLE user_telegram_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tg_links_select" ON user_telegram_links
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "tg_links_delete" ON user_telegram_links
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- RLS — TELEGRAM LINK CODES
-- ============================================================
ALTER TABLE telegram_link_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tg_codes_select" ON telegram_link_codes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "tg_codes_insert" ON telegram_link_codes
  FOR INSERT WITH CHECK (user_id = auth.uid());
```

- [ ] **Step 2: Ejecutar en Supabase SQL Editor**

  Ejecutar el bloque de políticas. Si alguna política ya existía (re-run), usar `DROP POLICY IF EXISTS "nombre" ON tabla;` antes del `CREATE POLICY`.

- [ ] **Step 3: Verificar**

  En Supabase Dashboard → Authentication → Policies, confirmar que las 4 tablas nuevas tienen RLS activado y sus políticas listadas.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260507_telegram_households.sql
git commit -m "feat(db): add RLS policies for telegram and household tables"
```

---

## Task 3: Edge Function — generate-telegram-code

**Files:**
- Create: `supabase/functions/generate-telegram-code/index.ts`

- [ ] **Step 1: Crear el directorio y archivo**

```bash
mkdir -p /home/user/mi-portfolio-proyectos/supabase/functions/generate-telegram-code
```

```typescript
// supabase/functions/generate-telegram-code/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function generateCode(): string {
  // 6 caracteres alfanuméricos, sin ambiguos (0/O, 1/I)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) {
    code += chars[b % chars.length];
  }
  return code;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "No authorization header" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verificar JWT del usuario
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Invalidar códigos anteriores no usados del mismo usuario
  await supabase
    .from("telegram_link_codes")
    .update({ used: true })
    .eq("user_id", user.id)
    .eq("used", false);

  // Generar nuevo código
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error: insertError } = await supabase
    .from("telegram_link_codes")
    .insert({ code, user_id: user.id, expires_at: expiresAt });

  if (insertError) {
    console.error("Insert code error:", insertError);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      code,
      expires_at: expiresAt,
      bot_username: Deno.env.get("TELEGRAM_BOT_USERNAME") ?? "tu_hogar_bot",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
});
```

- [ ] **Step 2: Añadir secrets en Supabase Dashboard → Edge Functions → Secrets**

  Valores necesarios (los `SUPABASE_*` suelen existir por defecto):
  - `TELEGRAM_BOT_USERNAME` — username del bot sin `@` (ej. `hogar_bot`)
  - Verificar que `SUPABASE_ANON_KEY` existe

- [ ] **Step 3: Desplegar**

```bash
cd /home/user/mi-portfolio-proyectos
supabase functions deploy generate-telegram-code
# Esta función SÍ verifica JWT — NO usar --no-verify-jwt
```

  Salida esperada: `Deployed Function generate-telegram-code`

- [ ] **Step 4: Test manual (requiere token de sesión)**

```bash
# Obtener el access_token desde la app (DevTools → Application → localStorage → supabase.auth.token)
curl -X POST \
  "https://<PROJECT_REF>.supabase.co/functions/v1/generate-telegram-code" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json"
# Esperado: { "code": "A3F9KQ", "expires_at": "...", "bot_username": "..." }
```

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/generate-telegram-code/index.ts
git commit -m "feat(bot): add generate-telegram-code edge function"
```

---

## Task 4: Edge Function — telegram-webhook (adaptada al schema real)

**Files:**
- Create: `supabase/functions/telegram-webhook/index.ts`

> **Diferencia clave del spec:** Los items se guardan en la tabla `items` (no `shopping_list_items`), con `title` (no `name`), `app_id` (no `user_id`), y `metadata` JSONB. El bot necesita resolver `telegram_id → user_id → projects WHERE name='Hogar' AND owner_id=user_id → app_id`.

- [ ] **Step 1: Crear el directorio y archivo**

```bash
mkdir -p /home/user/mi-portfolio-proyectos/supabase/functions/telegram-webhook
```

```typescript
// supabase/functions/telegram-webhook/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TELEGRAM_TOKEN  = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const WEBHOOK_SECRET  = Deno.env.get("TELEGRAM_WEBHOOK_SECRET")!;
const TELEGRAM_API    = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ─── Telegram helpers ────────────────────────────────────────

async function sendMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

// ─── Context de usuario ──────────────────────────────────────
// ADAPTADO: resuelve telegram_id → user_id → app_id (tabla 'projects')

interface UserContext {
  userId: string;
  appId: string | null;      // ID del proyecto Hogar del usuario
  householdId: string | null; // Primer hogar del usuario (Phase 2)
}

async function getUserContext(telegramId: number): Promise<UserContext | null> {
  // 1. Buscar el user_id vinculado a este telegram_id
  const { data: link } = await supabase
    .from("user_telegram_links")
    .select("user_id")
    .eq("telegram_id", telegramId)
    .single();

  if (!link) return null;

  // 2. Encontrar la app Hogar del usuario (tabla 'projects', name='Hogar')
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("owner_id", link.user_id)
    .eq("name", "Hogar")
    .single();

  // 3. Obtener household (Phase 2 — puede ser null)
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
  code: string
) {
  const { data: linkCode } = await supabase
    .from("telegram_link_codes")
    .select("id, user_id, expires_at")
    .eq("code", code.toUpperCase().trim())
    .eq("used", false)
    .single();

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

async function handleUnlink(chatId: number, telegramId: number) {
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
// ADAPTADO: inserta en tabla 'items' con estructura del codebase real

async function handleAdd(
  chatId: number,
  ctx: UserContext,
  items: string[],
  forcePrivate?: boolean
) {
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
    added_by_telegram: null, // se podría usar el telegramId si se pasa
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

async function handleList(chatId: number, ctx: UserContext) {
  if (!ctx.appId) {
    await sendMessage(chatId, "❌ No se encontró tu app Hogar.");
    return;
  }

  const { data, error } = await supabase
    .from("items")
    .select("title, checked, household_id, metadata")
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

async function handleCheck(chatId: number, ctx: UserContext, itemName: string) {
  if (!ctx.appId) {
    await sendMessage(chatId, "❌ No se encontró tu app Hogar.");
    return;
  }

  const { data, error } = await supabase
    .from("items")
    .update({ checked: true, checked_at: new Date().toISOString() })
    .eq("app_id", ctx.appId)
    .eq("module", "supermercado")
    .eq("checked", false)
    .ilike("title", `%${itemName}%`)
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

async function handleHelp(chatId: number, hasHousehold: boolean) {
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

  const chatId           = (message.chat as Record<string, unknown>)?.id as number;
  const from             = message.from as Record<string, unknown> | undefined;
  const fromId           = from?.id as number;
  const telegramUsername = from?.username as string | undefined;
  const telegramFirstName = from?.first_name as string | undefined;
  const text             = ((message.text as string) ?? "").trim();

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
```

- [ ] **Step 2: Añadir secrets en Supabase Dashboard → Edge Functions → Secrets**

  Valores obligatorios:
  - `TELEGRAM_BOT_TOKEN` — Obtenido de @BotFather al crear el bot
  - `TELEGRAM_WEBHOOK_SECRET` — Generar con: `openssl rand -hex 16`

- [ ] **Step 3: Desplegar**

```bash
cd /home/user/mi-portfolio-proyectos
supabase functions deploy telegram-webhook --no-verify-jwt
```

  Salida esperada: `Deployed Function telegram-webhook`

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/telegram-webhook/index.ts
git commit -m "feat(bot): add telegram-webhook edge function with items table adapter"
```

---

## Task 5: Componente TelegramLinkCard

**Files:**
- Create: `src/components/TelegramLinkCard.jsx`

- [ ] **Step 1: Crear el componente**

```jsx
// src/components/TelegramLinkCard.jsx
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function TelegramLinkCard() {
  const [status, setStatus]       = useState('loading') // loading | linked | unlinked
  const [linkData, setLinkData]   = useState(null)      // { telegram_username, telegram_first_name }
  const [code, setCode]           = useState(null)      // { code, expires_at, bot_username }
  const [countdown, setCountdown] = useState(null)
  const [generating, setGenerating] = useState(false)
  const channelRef = useRef(null)

  useEffect(() => {
    checkLinkStatus()
  }, [])

  // Realtime: escucha cuando se vincula vía Telegram
  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(({ data }) => {
      const userId = data.session?.user?.id
      if (!userId || cancelled) return

      channelRef.current = supabase
        .channel('telegram-link-status')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'user_telegram_links',
          filter: `user_id=eq.${userId}`,
        }, (payload) => {
          setLinkData(payload.new)
          setStatus('linked')
          setCode(null)
        })
        .subscribe()
    })

    return () => {
      cancelled = true
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  // Countdown del código
  useEffect(() => {
    if (!code) return
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(code.expires_at) - Date.now()) / 1000)
      )
      setCountdown(remaining)
      if (remaining === 0) {
        setCode(null)
        setCountdown(null)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [code])

  async function checkLinkStatus() {
    const { data } = await supabase
      .from('user_telegram_links')
      .select('telegram_username, telegram_first_name')
      .maybeSingle()

    if (data) {
      setLinkData(data)
      setStatus('linked')
    } else {
      setStatus('unlinked')
    }
  }

  async function generateCode() {
    setGenerating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-telegram-code`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      setCode(data)
      setCountdown(600) // 10 min
    } catch (err) {
      console.error('Error generating code:', err)
    } finally {
      setGenerating(false)
    }
  }

  async function unlink() {
    const { data: { session } } = await supabase.auth.getSession()
    await supabase
      .from('user_telegram_links')
      .delete()
      .eq('user_id', session?.user?.id)
    setStatus('unlinked')
    setLinkData(null)
    setCode(null)
  }

  // ── Render ──────────────────────────────────────────────────

  if (status === 'loading') {
    return (
      <div className="rounded-xl border border-[var(--border)] p-4">
        <div className="h-4 bg-[var(--bg-card)] rounded w-1/3 mb-2 animate-pulse" />
        <div className="h-3 bg-[var(--bg-card)] rounded w-1/2 animate-pulse" />
      </div>
    )
  }

  if (status === 'linked') {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm text-[var(--text)]">Telegram conectado ✅</p>
            {linkData?.telegram_username && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                @{linkData.telegram_username}
              </p>
            )}
          </div>
          <button
            onClick={unlink}
            className="text-xs text-red-500 hover:underline"
          >
            Desvincular
          </button>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Envía mensajes al bot para gestionar tu lista de la compra.
        </p>
      </div>
    )
  }

  // status === 'unlinked'
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-4">
      <div>
        <p className="font-semibold text-sm text-[var(--text)]">Conectar Telegram</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Añade items a la lista de la compra enviando un mensaje al bot.
        </p>
      </div>

      {!code ? (
        <button
          onClick={generateCode}
          disabled={generating}
          className="w-full py-2 px-4 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
        >
          {generating ? 'Generando...' : 'Generar código de vinculación'}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-[var(--bg)] rounded-lg p-4 text-center space-y-2 border border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)]">
              Envía este mensaje a{' '}
              <a
                href={`https://t.me/${code.bot_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--accent)]"
              >
                @{code.bot_username}
              </a>
            </p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-xl font-mono font-bold tracking-widest text-[var(--text)] select-all">
                /link {code.code}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(`/link ${code.code}`)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                title="Copiar"
              >
                📋
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {countdown !== null && countdown > 0
                ? `Expira en ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`
                : 'Código expirado'}
            </p>
          </div>

          <a
            href={`https://t.me/${code.bot_username}?start=link_${code.code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-[var(--border)] text-sm text-[var(--text)] hover:bg-[var(--bg-card)] transition-colors"
          >
            Abrir en Telegram →
          </a>

          <button
            onClick={() => setCode(null)}
            className="w-full text-xs text-[var(--text-muted)] hover:underline"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar que `VITE_SUPABASE_URL` está en `.env`**

```bash
grep VITE_SUPABASE_URL /home/user/mi-portfolio-proyectos/.env
# Debe mostrar: VITE_SUPABASE_URL=https://xxxx.supabase.co
```

- [ ] **Step 3: Commit**

```bash
git add src/components/TelegramLinkCard.jsx
git commit -m "feat(ui): add TelegramLinkCard component with realtime link detection"
```

---

## Task 6: Módulo HogarAjustes (Settings page)

**Files:**
- Create: `src/pages/app/modules/HogarAjustes.jsx`
- Modify: `src/pages/app/AppLayout.jsx` (añadir módulo a HOGAR_MODULES)
- Modify: `src/App.jsx` (añadir lazy import + ruta)

- [ ] **Step 1: Crear el componente HogarAjustes**

```jsx
// src/pages/app/modules/HogarAjustes.jsx
import { useOutletContext } from 'react-router-dom'
import { TelegramLinkCard } from '../../../components/TelegramLinkCard'

export default function HogarAjustes() {
  const { app } = useOutletContext()

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="text-lg font-bold text-[var(--text)] mb-1">Ajustes</h2>
        <p className="text-sm text-[var(--text-muted)]">{app.name}</p>
      </div>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          Integraciones
        </h3>
        <TelegramLinkCard />
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Añadir el módulo `ajustes` a HOGAR_MODULES en AppLayout.jsx**

  Abrir `src/pages/app/AppLayout.jsx` y localizar `HOGAR_MODULES`. Añadir al final:

```js
// En HOGAR_MODULES (src/pages/app/AppLayout.jsx)
const HOGAR_MODULES = [
  { path: 'calendar',   label: 'Calendario', icon: '📅' },
  { path: 'shopping',   label: 'Lista',       icon: '🛒' },
  { path: 'menu',       label: 'Menú',        icon: '🍽️' },
  { path: 'recipes',    label: 'Recetas',     icon: '👨‍🍳' },
  { path: 'inventario', label: 'Inventario',  icon: '📦' },
  { path: 'limpieza',   label: 'Limpieza',    icon: '🧹' },
  { path: 'ajustes',    label: 'Ajustes',     icon: '⚙️' },  // ← AÑADIR
]
```

- [ ] **Step 3: Añadir lazy import y ruta en App.jsx**

  En `src/App.jsx`, añadir el import junto a los demás módulos de Hogar:

```js
// Al final del bloque de imports de Hogar (junto a Limpieza)
const HogarAjustes = React.lazy(() => import('./pages/app/modules/HogarAjustes'))
```

  Y dentro de la ruta `/app/hogar`, añadir la ruta `ajustes`:

```jsx
// Dentro de <Route path="/app/hogar" ...>
<Route path="ajustes" element={<HogarAjustes />} />
```

  El bloque completo queda:

```jsx
<Route path="/app/hogar" element={
  <ProtectedRoute><AppLayout /></ProtectedRoute>
}>
  <Route index                    element={<Welcome />} />
  <Route path="calendar"          element={<Calendar />} />
  <Route path="shopping"          element={<ShoppingList />} />
  <Route path="menu"              element={<Menu />} />
  <Route path="recipes"           element={<Recipes />} />
  <Route path="recipes/:recipeId" element={<RecipeDetail />} />
  <Route path="inventario"        element={<Inventario />} />
  <Route path="limpieza"          element={<Limpieza />} />
  <Route path="ajustes"           element={<HogarAjustes />} />  {/* ← AÑADIR */}
</Route>
```

- [ ] **Step 4: Verificar en el navegador**

  Ir a `http://localhost:5173/app/hogar` — debe aparecer "⚙️ Ajustes" en el sidebar.
  Hacer clic → debe cargar la vista con la card de Telegram.

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/modules/HogarAjustes.jsx src/pages/app/AppLayout.jsx src/App.jsx
git commit -m "feat(ui): add HogarAjustes module with Telegram link card"
```

---

## Task 7: Registrar el webhook en Telegram

> Este paso es manual — no genera archivos. Ejecutar UNA VEZ tras el deploy de las edge functions.

- [ ] **Step 1: Obtener los valores necesarios**

  - `TELEGRAM_BOT_TOKEN` — Obtenido de @BotFather
  - `PROJECT_REF` — El ID de tu proyecto Supabase (en Dashboard → Settings → General)
  - `TELEGRAM_WEBHOOK_SECRET` — El valor que pusiste en los secrets (`openssl rand -hex 16`)

- [ ] **Step 2: Registrar el webhook**

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://<PROJECT_REF>.supabase.co/functions/v1/telegram-webhook",
    "secret_token": "<TELEGRAM_WEBHOOK_SECRET>",
    "allowed_updates": ["message"]
  }'
# Respuesta esperada: {"ok":true,"result":true,"description":"Webhook was set"}
```

- [ ] **Step 3: Verificar el webhook**

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
# Verificar que "url" apunta a tu función y "pending_update_count" es 0
```

---

## Task 8: Smoke Test E2E

- [ ] Abrir `http://localhost:5173/app/hogar/ajustes`
- [ ] Hacer clic en "Generar código de vinculación" → aparece código de 6 caracteres con countdown
- [ ] Enviar `/link XXXXXX` al bot en Telegram → bot responde "✅ ¡Telegram vinculado!"
- [ ] La card en la app debe cambiar automáticamente a "Telegram conectado ✅" (vía Realtime)
- [ ] Enviar "leche pan yogur" al bot → bot responde "✅ Añadido a la lista de la compra"
- [ ] Verificar en `http://localhost:5173/app/hogar/shopping` que aparecen los 3 items
- [ ] Verificar en Supabase → Table Editor → `items` que los items tienen `source = 'telegram'`
- [ ] Enviar `/list` al bot → responde con los items pendientes
- [ ] Enviar `/check leche` al bot → bot confirma y el item desaparece de la lista
- [ ] Enviar `/unlink` al bot → bot confirma desvinculación
- [ ] La card en la app vuelve a mostrar "Conectar Telegram" (puede requerir refresh)

---

## Variables de entorno — resumen

| Variable | Dónde | Cómo obtenerla |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Supabase Secrets | @BotFather → /newbot |
| `TELEGRAM_WEBHOOK_SECRET` | Supabase Secrets | `openssl rand -hex 16` |
| `TELEGRAM_BOT_USERNAME` | Supabase Secrets | Elegido al crear el bot (sin @) |
| `SUPABASE_URL` | Auto en Edge Functions | — |
| `SUPABASE_ANON_KEY` | Auto en Edge Functions | Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto en Edge Functions | Dashboard → Settings → API ⚠️ |
| `VITE_SUPABASE_URL` | `.env` del proyecto | Ya existe |

---

## Phase 2 — Household UI (fuera de scope de este plan)

Las tablas ya están creadas. Lo que falta para la siguiente fase:
- `CreateHouseholdModal` — crear un hogar y unirse como admin
- Flujo de invitación de miembros (código similar al de Telegram)
- UI en Ajustes para ver miembros del hogar
- Toggle en la lista de la compra para elegir destino (privado vs compartido)
