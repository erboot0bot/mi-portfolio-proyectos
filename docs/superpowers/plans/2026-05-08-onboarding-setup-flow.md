# Onboarding Setup Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a setup banner to `/apps` and a conversational Telegram onboarding that collects user profile data and pre-populates the app modules.

**Architecture:** Web banner in `AppsHub.jsx` reads 4 status signals from Supabase (Telegram link, API keys, onboarding state); dismissals stored in `user_onboarding_dismissals`. Telegram webhook gains a full state-machine onboarding flow stored in `user_onboarding_state`, triggered automatically after `/link` and via `/onboarding`. On confirm, webhook writes directly to `pets`, `vehicles`, and `fin_transactions` using the service role key.

**Tech Stack:** React + Supabase client (banner), Deno edge function + Supabase service role (webhook), Vitest + React Testing Library (tests), TypeScript (webhook).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `supabase/migrations/20260508_onboarding_tables.sql` | Create | `user_onboarding_state` + `user_onboarding_dismissals` tables |
| `src/components/SetupBanner.jsx` | Create | Onboarding progress banner for `/apps` |
| `src/components/SetupBanner.test.jsx` | Create | Unit tests for banner |
| `src/pages/AppsHub.jsx` | Modify | Add `<SetupBanner />` between header and grid |
| `supabase/functions/telegram-webhook/index.ts` | Modify | Onboarding state machine, confirm handler, auto-trigger |

---

## Task 1: DB Migration

**Files:**
- Create: `supabase/migrations/20260508_onboarding_tables.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260508_onboarding_tables.sql
BEGIN;

-- Estado del onboarding conversacional (Telegram)
CREATE TABLE IF NOT EXISTS user_onboarding_state (
  user_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  step         TEXT NOT NULL DEFAULT 'vivienda_tipo',
  data         JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_onboarding_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_onboarding_state" ON user_onboarding_state
  FOR ALL USING (auth.uid() = user_id);

-- Dismissals del banner web
CREATE TABLE IF NOT EXISTS user_onboarding_dismissals (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step    TEXT NOT NULL,
  PRIMARY KEY (user_id, step)
);

ALTER TABLE user_onboarding_dismissals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_dismissals" ON user_onboarding_dismissals
  FOR ALL USING (auth.uid() = user_id);

COMMIT;
```

- [ ] **Step 2: Deploy the migration**

```bash
cd /home/user/mi-portfolio-proyectos
npx supabase db push
```

Expected: migration applied without errors.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260508_onboarding_tables.sql
git commit -m "feat(db): add user_onboarding_state and user_onboarding_dismissals tables"
```

---

## Task 2: SetupBanner Component

**Files:**
- Create: `src/components/SetupBanner.jsx`
- Create: `src/components/SetupBanner.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/SetupBanner.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SetupBanner } from './SetupBanner'

vi.mock('../lib/supabase', () => {
  const mockFrom = vi.fn()
  const supabase = {
    auth: { getSession: vi.fn() },
    from: mockFrom,
  }
  return { supabase }
})

import { supabase } from '../lib/supabase'

function makeChain(result) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq:     vi.fn().mockReturnThis(),
    upsert: vi.fn().mockResolvedValue({ error: null }),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
  return chain
}

function setupMocks({ telegram = null, groq = null, claude = null, profile = null, dismissals = [], botUsername = null } = {}) {
  supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } })
  supabase.from.mockImplementation((table) => {
    if (table === 'user_telegram_links') return makeChain({ data: telegram ? { id: '1' } : null })
    if (table === 'user_api_keys')       return makeChain({ data: { groq_key_enc: groq, anthropic_key_enc: claude } })
    if (table === 'user_onboarding_state') return makeChain({ data: profile ? { completed_at: '2026-01-01' } : null })
    if (table === 'telegram_bot_config') return makeChain({ data: botUsername ? { bot_username: botUsername } : null })
    if (table === 'user_onboarding_dismissals') {
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: dismissals.map(s => ({ step: s })) }), upsert: vi.fn().mockResolvedValue({ error: null }) }
    }
    return makeChain({ data: null })
  })
}

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('SetupBanner', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders nothing while loading (no session)', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    const { container } = wrap(<SetupBanner />)
    await waitFor(() => {})
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when all steps are complete', async () => {
    setupMocks({ telegram: true, groq: 'key', claude: 'key', profile: true })
    const { container } = wrap(<SetupBanner />)
    await waitFor(() => {})
    expect(container.firstChild).toBeNull()
  })

  it('shows Telegram step when not linked', async () => {
    setupMocks({ telegram: false })
    wrap(<SetupBanner />)
    await waitFor(() => {
      expect(screen.getByText('Conectar Telegram')).toBeInTheDocument()
    })
  })

  it('shows Groq and Claude steps when Telegram is linked but keys missing', async () => {
    setupMocks({ telegram: true, groq: null, claude: null })
    wrap(<SetupBanner />)
    await waitFor(() => {
      expect(screen.getByText('Añadir Groq key')).toBeInTheDocument()
      expect(screen.getByText('Añadir Claude key')).toBeInTheDocument()
    })
  })

  it('shows profile step only after Telegram is linked', async () => {
    setupMocks({ telegram: false })
    wrap(<SetupBanner />)
    await waitFor(() => {})
    expect(screen.queryByText(/Completar perfil/)).toBeNull()
  })

  it('shows profile step when Telegram is linked and profile not complete', async () => {
    setupMocks({ telegram: true, groq: 'k', claude: 'k', profile: false, botUsername: 'mybot' })
    wrap(<SetupBanner />)
    await waitFor(() => {
      expect(screen.getByText(/Completar perfil/)).toBeInTheDocument()
      expect(screen.getByText(/@mybot/)).toBeInTheDocument()
    })
  })

  it('hides a step after dismiss', async () => {
    setupMocks({ telegram: true, groq: null })
    wrap(<SetupBanner />)
    await waitFor(() => expect(screen.getByText('Añadir Groq key')).toBeInTheDocument())
    const dismissBtn = screen.getAllByTitle('Omitir')[0]
    fireEvent.click(dismissBtn)
    await waitFor(() => {
      expect(screen.queryByText('Añadir Groq key')).toBeNull()
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run src/components/SetupBanner.test.jsx
```

Expected: FAIL — "SetupBanner" module not found.

- [ ] **Step 3: Create the SetupBanner component**

Create `src/components/SetupBanner.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function SetupBanner() {
  const [status, setStatus]       = useState(null)
  const [dismissals, setDismissals] = useState(null)
  const [botUsername, setBotUsername] = useState(null)

  useEffect(() => { loadStatus() }, [])

  async function loadStatus() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setStatus({}); setDismissals(new Set()); return }

    const uid = session.user.id
    const [apiKeys, telegramLink, onboardingState, dismissalRows, botConfig] = await Promise.all([
      supabase.from('user_api_keys').select('groq_key_enc,anthropic_key_enc').eq('user_id', uid).maybeSingle(),
      supabase.from('user_telegram_links').select('id').eq('user_id', uid).maybeSingle(),
      supabase.from('user_onboarding_state').select('completed_at').eq('user_id', uid).maybeSingle(),
      supabase.from('user_onboarding_dismissals').select('step').eq('user_id', uid),
      supabase.from('telegram_bot_config').select('bot_username').eq('user_id', uid).maybeSingle(),
    ])

    setStatus({
      telegram: !!telegramLink.data,
      groq:     !!apiKeys.data?.groq_key_enc,
      claude:   !!apiKeys.data?.anthropic_key_enc,
      profile:  !!onboardingState.data?.completed_at,
    })
    setDismissals(new Set((dismissalRows.data ?? []).map(r => r.step)))
    setBotUsername(botConfig.data?.bot_username ?? null)
  }

  async function dismiss(step) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from('user_onboarding_dismissals').upsert({ user_id: session.user.id, step })
    setDismissals(prev => new Set([...prev, step]))
  }

  if (!status || !dismissals) return null

  const steps = [
    {
      key: 'telegram',
      label: 'Conectar Telegram',
      icon: '✈️',
      href: '/app/settings',
      dismissible: false,
      hint: null,
    },
    {
      key: 'groq',
      label: 'Añadir Groq key',
      icon: '🎙️',
      href: '/app/settings',
      dismissible: true,
      hint: 'Para transcripción de voz',
    },
    {
      key: 'claude',
      label: 'Añadir Claude key',
      icon: '🤖',
      href: '/app/settings',
      dismissible: true,
      hint: 'Para IA avanzada',
    },
    {
      key: 'profile',
      label: 'Completar perfil',
      icon: '👤',
      href: null,
      dismissible: true,
      hint: botUsername ? `Escribe /onboarding a @${botUsername}` : 'Escribe /onboarding a tu bot',
      requiresTelegram: true,
    },
  ]

  const visibleSteps = steps.filter(s => {
    if (status[s.key]) return false
    if (dismissals.has(s.key)) return false
    if (s.requiresTelegram && !status.telegram) return false
    return true
  })

  if (visibleSteps.length === 0) return null

  return (
    <div className="mb-6 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-4">
      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
        Configura tu espacio
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {visibleSteps.map(step => (
          <div
            key={step.key}
            className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] shrink-0 min-w-[160px]"
          >
            <span className="text-base mt-0.5">{step.icon}</span>
            <div className="flex-1 min-w-0">
              {step.href ? (
                <Link
                  to={step.href}
                  className="text-sm font-medium text-[var(--accent)] hover:underline block leading-tight"
                >
                  {step.label}
                </Link>
              ) : (
                <span className="text-sm font-medium text-[var(--text)] block leading-tight">
                  {step.label}
                </span>
              )}
              {step.hint && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-tight">{step.hint}</p>
              )}
            </div>
            {step.dismissible && (
              <button
                onClick={() => dismiss(step.key)}
                title="Omitir"
                className="text-[var(--text-faint)] hover:text-[var(--text)] transition-colors text-sm leading-none mt-0.5 shrink-0"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run src/components/SetupBanner.test.jsx
```

Expected: all 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/SetupBanner.jsx src/components/SetupBanner.test.jsx
git commit -m "feat: add SetupBanner component with onboarding step tracking"
```

---

## Task 3: Wire SetupBanner into AppsHub

**Files:**
- Modify: `src/pages/AppsHub.jsx`

- [ ] **Step 1: Add the import**

In `src/pages/AppsHub.jsx`, add to the imports:

```jsx
import { SetupBanner } from '../components/SetupBanner'
```

- [ ] **Step 2: Insert banner between header and grid**

In `AppsHub`, locate the `<header>` closing tag and the `<motion.div className="grid ...">` opening. Insert `<SetupBanner />` between them:

```jsx
  </header>

  <SetupBanner />

  <motion.div
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
```

- [ ] **Step 3: Run all tests**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run
```

Expected: all existing tests pass, no regressions.

- [ ] **Step 4: Commit**

```bash
git add src/pages/AppsHub.jsx
git commit -m "feat(apps): add SetupBanner to AppsHub page"
```

---

## Task 4: Telegram Webhook — Onboarding Helpers

**Files:**
- Modify: `supabase/functions/telegram-webhook/index.ts`

Add the following helpers and types to the webhook file, after the existing `answerCallbackQuery` function and before `transcribeVoice`.

- [ ] **Step 1: Add OnboardingState interface and helpers**

Insert after the `answerCallbackQuery` function (around line 82):

```typescript
// ─── Onboarding types & helpers ─────────────────────────────

interface OnboardingData {
  vivienda_tipo?:     string | null;
  vivienda_importe?:  number | null;
  vivienda_ciudad?:   string | null;
  vehiculo_tiene?:    boolean;
  vehiculo_combustible?: string | null;
  vehiculo_marca?:    string | null;
  vehiculo_modelo?:   string | null;
  mascotas?:          Array<{ nombre: string; especie: string; nacimiento: string | null }>;
  mascota_actual?:    { nombre?: string; especie?: string };
  nombre_preferido?:  string | null;
}

interface OnboardingState {
  step: string;
  data: OnboardingData;
}

async function getOnboardingState(userId: string): Promise<OnboardingState | null> {
  const { data } = await supabase
    .from("user_onboarding_state")
    .select("step, data, completed_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data || data.completed_at) return null;
  return { step: data.step, data: data.data as OnboardingData };
}

async function saveOnboardingState(userId: string, step: string, data: OnboardingData): Promise<void> {
  await supabase.from("user_onboarding_state").upsert(
    { user_id: userId, step, data, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
}

async function markOnboardingComplete(userId: string, data: OnboardingData): Promise<void> {
  await supabase.from("user_onboarding_state").upsert(
    { user_id: userId, step: "done", data, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
}

async function getProjectId(userId: string, projectName: string): Promise<string | null> {
  const { data } = await supabase
    .from("projects")
    .select("id")
    .eq("owner_id", userId)
    .eq("name", projectName)
    .maybeSingle();
  return data?.id ?? null;
}
```

- [ ] **Step 2: Add sendOnboardingQuestion function**

Insert after the helpers above:

```typescript
async function sendOnboardingQuestion(
  chatId: number,
  step: string,
  data: OnboardingData,
  botToken: string
): Promise<void> {
  switch (step) {
    case "vivienda_tipo":
      await sendMessage(chatId,
        "🏠 Vamos a configurar tu espacio. Puedes saltar cualquier pregunta con /skip\n\n¿Tienes alquiler o hipoteca?",
        botToken,
        { inline_keyboard: [[
          { text: "Alquiler",  callback_data: "ob:vivienda_tipo:alquiler" },
          { text: "Hipoteca",  callback_data: "ob:vivienda_tipo:hipoteca" },
          { text: "No tengo",  callback_data: "ob:vivienda_tipo:skip" },
        ]]}
      );
      break;

    case "vivienda_importe":
      await sendMessage(chatId,
        "💶 ¿Cuánto pagas al mes? (escribe solo el número en €, ej: 850)\nPuedes usar también una nota de voz 🎙️",
        botToken
      );
      break;

    case "vivienda_ciudad":
      await sendMessage(chatId,
        "📍 ¿En qué ciudad vives? (o /skip para omitir)",
        botToken
      );
      break;

    case "vehiculo_tiene":
      await sendMessage(chatId,
        "🚗 ¿Tienes coche?",
        botToken,
        { inline_keyboard: [[
          { text: "Sí", callback_data: "ob:vehiculo_tiene:si" },
          { text: "No", callback_data: "ob:vehiculo_tiene:no" },
        ]]}
      );
      break;

    case "vehiculo_combustible":
      await sendMessage(chatId,
        "⛽ ¿Qué combustible usa?",
        botToken,
        { inline_keyboard: [[
          { text: "Gasolina",  callback_data: "ob:vehiculo_combustible:gasolina" },
          { text: "Diésel",    callback_data: "ob:vehiculo_combustible:diesel" },
          { text: "Eléctrico", callback_data: "ob:vehiculo_combustible:electrico" },
          { text: "Híbrido",   callback_data: "ob:vehiculo_combustible:hibrido" },
        ]]}
      );
      break;

    case "vehiculo_marca_modelo":
      await sendMessage(chatId,
        "🔑 ¿Marca y modelo? (ej: Volkswagen Golf)\nPuedes usar una nota de voz 🎙️",
        botToken
      );
      break;

    case "mascotas_tiene":
      await sendMessage(chatId,
        "🐾 ¿Tienes mascotas?",
        botToken,
        { inline_keyboard: [[
          { text: "Sí", callback_data: "ob:mascotas_tiene:si" },
          { text: "No", callback_data: "ob:mascotas_tiene:no" },
        ]]}
      );
      break;

    case "mascota_nombre": {
      const idx = (data.mascotas?.length ?? 0) + 1;
      const prefix = idx === 1 ? "¿Cómo se llama tu mascota?" : `¿Y cómo se llama la ${idx}ª mascota?`;
      await sendMessage(chatId, `🐾 ${prefix}\nPuedes usar una nota de voz 🎙️`, botToken);
      break;
    }

    case "mascota_especie":
      await sendMessage(chatId,
        `¿Qué es ${data.mascota_actual?.nombre ?? "tu mascota"}?`,
        botToken,
        { inline_keyboard: [[
          { text: "Perro",  callback_data: "ob:mascota_especie:perro" },
          { text: "Gato",   callback_data: "ob:mascota_especie:gato" },
          { text: "Conejo", callback_data: "ob:mascota_especie:conejo" },
          { text: "Otro",   callback_data: "ob:mascota_especie:otro" },
        ]]}
      );
      break;

    case "mascota_nacimiento":
      await sendMessage(chatId,
        `¿Cuándo nació ${data.mascota_actual?.nombre ?? "tu mascota"}? (aproximado vale, ej: enero 2020)\nO /skip si no lo sabes`,
        botToken
      );
      break;

    case "mascota_mas":
      await sendMessage(chatId,
        "¿Tienes otra mascota?",
        botToken,
        { inline_keyboard: [[
          { text: "Sí, tengo otra",  callback_data: "ob:mascota_mas:si" },
          { text: "No, terminar",    callback_data: "ob:mascota_mas:no" },
        ]]}
      );
      break;

    case "nombre":
      await sendMessage(chatId,
        "👤 ¿Cómo quieres que te llame? (o /skip para omitir)\nPuedes usar una nota de voz 🎙️",
        botToken
      );
      break;

    case "resumen": {
      const lines: string[] = ["📋 <b>Esto es lo que voy a guardar:</b>\n"];
      if (data.vivienda_tipo) {
        const tipo = data.vivienda_tipo === "alquiler" ? "Alquiler" : "Hipoteca";
        const importe = data.vivienda_importe ? `${data.vivienda_importe}€/mes` : "";
        const ciudad = data.vivienda_ciudad ? ` — ${data.vivienda_ciudad}` : "";
        lines.push(`🏠 Vivienda: ${tipo}${importe ? ` — ${importe}` : ""}${ciudad}`);
      }
      if (data.vehiculo_tiene && data.vehiculo_marca) {
        const combustible = data.vehiculo_combustible ?? "";
        lines.push(`🚗 Vehículo: ${data.vehiculo_marca} ${data.vehiculo_modelo ?? ""} (${combustible})`);
      }
      if (data.mascotas?.length) {
        const mList = data.mascotas.map(m => `${m.nombre} (${m.especie})`).join(", ");
        lines.push(`🐾 Mascotas: ${mList}`);
      }
      if (data.nombre_preferido) lines.push(`👤 Nombre: ${data.nombre_preferido}`);
      if (lines.length === 1) lines.push("(nada que guardar — todo omitido)");
      await sendMessage(chatId,
        lines.join("\n"),
        botToken,
        { inline_keyboard: [[
          { text: "✅ Confirmar y guardar", callback_data: "ob:resumen:confirmar" },
          { text: "🔄 Empezar de nuevo",   callback_data: "ob:resumen:reiniciar" },
        ]]}
      );
      break;
    }
  }
}
```

- [ ] **Step 3: Add startOnboarding function**

Insert after `sendOnboardingQuestion`:

```typescript
async function startOnboarding(chatId: number, userId: string, botToken: string): Promise<void> {
  const fresh: OnboardingData = {};
  await saveOnboardingState(userId, "vivienda_tipo", fresh);
  await sendMessage(chatId,
    "👋 ¡Genial! Voy a hacerte unas preguntas rápidas para configurar tu espacio personal.\nTodo es opcional — puedes saltar cualquier paso con /skip.\n",
    botToken
  );
  await sendOnboardingQuestion(chatId, "vivienda_tipo", fresh, botToken);
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /home/user/mi-portfolio-proyectos
npx supabase functions serve telegram-webhook --no-verify-jwt 2>&1 | head -20
```

Expected: no TypeScript errors printed (or function starts serving). Press Ctrl+C to stop.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/telegram-webhook/index.ts
git commit -m "feat(telegram): add onboarding state machine helpers and question sender"
```

---

## Task 5: Telegram Webhook — State Machine

**Files:**
- Modify: `supabase/functions/telegram-webhook/index.ts`

Add the two handler functions that drive the conversation state machine.

- [ ] **Step 1: Add handleOnboardingText function**

Insert after `startOnboarding`:

```typescript
async function handleOnboardingText(
  chatId: number,
  userId: string,
  text: string,
  state: OnboardingState,
  botToken: string
): Promise<void> {
  const { step, data } = state;
  const isSkip = text.trim().toLowerCase() === "/skip";

  switch (step) {
    case "vivienda_importe": {
      if (isSkip) {
        const next = { ...data, vivienda_tipo: null, vivienda_importe: null, vivienda_ciudad: null };
        await saveOnboardingState(userId, "vehiculo_tiene", next);
        await sendOnboardingQuestion(chatId, "vehiculo_tiene", next, botToken);
        return;
      }
      const raw = text.replace(/[€\s]/g, "").replace(",", ".");
      const amount = parseFloat(raw);
      if (isNaN(amount) || amount <= 0) {
        await sendMessage(chatId, "⚠️ No entendí la cantidad. Escribe solo el número, ej: 850", botToken);
        return;
      }
      const next = { ...data, vivienda_importe: amount };
      await saveOnboardingState(userId, "vivienda_ciudad", next);
      await sendOnboardingQuestion(chatId, "vivienda_ciudad", next, botToken);
      break;
    }

    case "vivienda_ciudad": {
      const next = { ...data, vivienda_ciudad: isSkip ? null : text.trim() };
      await saveOnboardingState(userId, "vehiculo_tiene", next);
      await sendOnboardingQuestion(chatId, "vehiculo_tiene", next, botToken);
      break;
    }

    case "vehiculo_marca_modelo": {
      if (isSkip) {
        const next = { ...data, vehiculo_marca: null, vehiculo_modelo: null };
        await saveOnboardingState(userId, "mascotas_tiene", next);
        await sendOnboardingQuestion(chatId, "mascotas_tiene", next, botToken);
        return;
      }
      // Split "Volkswagen Golf" → brand="Volkswagen", model="Golf"
      const parts = text.trim().split(/\s+/);
      const marca = parts[0] ?? text.trim();
      const modelo = parts.slice(1).join(" ") || null;
      const next = { ...data, vehiculo_marca: marca, vehiculo_modelo: modelo };
      await saveOnboardingState(userId, "mascotas_tiene", next);
      await sendOnboardingQuestion(chatId, "mascotas_tiene", next, botToken);
      break;
    }

    case "mascota_nombre": {
      if (isSkip) {
        const next = { ...data, mascota_actual: undefined };
        await saveOnboardingState(userId, "nombre", next);
        await sendOnboardingQuestion(chatId, "nombre", next, botToken);
        return;
      }
      const next = { ...data, mascota_actual: { nombre: text.trim() } };
      await saveOnboardingState(userId, "mascota_especie", next);
      await sendOnboardingQuestion(chatId, "mascota_especie", next, botToken);
      break;
    }

    case "mascota_nacimiento": {
      const nombre = data.mascota_actual?.nombre ?? "sin nombre";
      const especie = data.mascota_actual?.especie ?? "otro";
      const mascota = { nombre, especie, nacimiento: isSkip ? null : text.trim() };
      const mascotas = [...(data.mascotas ?? []), mascota];
      const next = { ...data, mascotas, mascota_actual: undefined };
      await saveOnboardingState(userId, "mascota_mas", next);
      await sendOnboardingQuestion(chatId, "mascota_mas", next, botToken);
      break;
    }

    case "nombre": {
      const next = { ...data, nombre_preferido: isSkip ? null : text.trim() };
      await saveOnboardingState(userId, "resumen", next);
      await sendOnboardingQuestion(chatId, "resumen", next, botToken);
      break;
    }

    default:
      // In button-only steps, unexpected text → re-send the question
      await sendOnboardingQuestion(chatId, step, data, botToken);
  }
}
```

- [ ] **Step 2: Add handleOnboardingCallback function**

Insert after `handleOnboardingText`:

```typescript
async function handleOnboardingCallback(
  cbId: string,
  chatId: number,
  userId: string,
  cbValue: string,  // format: "step:value"
  botToken: string
): Promise<void> {
  await answerCallbackQuery(cbId, botToken);

  const colonIdx = cbValue.indexOf(":");
  const step  = cbValue.slice(0, colonIdx);
  const value = cbValue.slice(colonIdx + 1);

  const stateRow = await supabase
    .from("user_onboarding_state")
    .select("step, data")
    .eq("user_id", userId)
    .maybeSingle();
  const data: OnboardingData = (stateRow.data?.data as OnboardingData) ?? {};

  switch (step) {
    case "vivienda_tipo": {
      if (value === "skip") {
        const next = { ...data, vivienda_tipo: null, vivienda_importe: null, vivienda_ciudad: null };
        await saveOnboardingState(userId, "vehiculo_tiene", next);
        await sendOnboardingQuestion(chatId, "vehiculo_tiene", next, botToken);
      } else {
        const next = { ...data, vivienda_tipo: value };
        await saveOnboardingState(userId, "vivienda_importe", next);
        await sendOnboardingQuestion(chatId, "vivienda_importe", next, botToken);
      }
      break;
    }

    case "vehiculo_tiene": {
      if (value === "no") {
        const next = { ...data, vehiculo_tiene: false };
        await saveOnboardingState(userId, "mascotas_tiene", next);
        await sendOnboardingQuestion(chatId, "mascotas_tiene", next, botToken);
      } else {
        const next = { ...data, vehiculo_tiene: true };
        await saveOnboardingState(userId, "vehiculo_combustible", next);
        await sendOnboardingQuestion(chatId, "vehiculo_combustible", next, botToken);
      }
      break;
    }

    case "vehiculo_combustible": {
      const next = { ...data, vehiculo_combustible: value };
      await saveOnboardingState(userId, "vehiculo_marca_modelo", next);
      await sendOnboardingQuestion(chatId, "vehiculo_marca_modelo", next, botToken);
      break;
    }

    case "mascotas_tiene": {
      if (value === "no") {
        const next = { ...data };
        await saveOnboardingState(userId, "nombre", next);
        await sendOnboardingQuestion(chatId, "nombre", next, botToken);
      } else {
        const next = { ...data, mascotas: data.mascotas ?? [] };
        await saveOnboardingState(userId, "mascota_nombre", next);
        await sendOnboardingQuestion(chatId, "mascota_nombre", next, botToken);
      }
      break;
    }

    case "mascota_especie": {
      const next = { ...data, mascota_actual: { ...data.mascota_actual, especie: value } };
      await saveOnboardingState(userId, "mascota_nacimiento", next);
      await sendOnboardingQuestion(chatId, "mascota_nacimiento", next, botToken);
      break;
    }

    case "mascota_mas": {
      if (value === "si") {
        const next = { ...data, mascota_actual: undefined };
        await saveOnboardingState(userId, "mascota_nombre", next);
        await sendOnboardingQuestion(chatId, "mascota_nombre", next, botToken);
      } else {
        const next = { ...data, mascota_actual: undefined };
        await saveOnboardingState(userId, "nombre", next);
        await sendOnboardingQuestion(chatId, "nombre", next, botToken);
      }
      break;
    }

    case "resumen": {
      if (value === "reiniciar") {
        await saveOnboardingState(userId, "vivienda_tipo", {});
        await sendOnboardingQuestion(chatId, "vivienda_tipo", {}, botToken);
      } else {
        await confirmOnboarding(chatId, userId, data, botToken);
      }
      break;
    }
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /home/user/mi-portfolio-proyectos
npx supabase functions serve telegram-webhook --no-verify-jwt 2>&1 | head -20
```

Expected: no TypeScript errors. Press Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/telegram-webhook/index.ts
git commit -m "feat(telegram): add onboarding state machine text and callback handlers"
```

---

## Task 6: Telegram Webhook — Confirm & Write to Modules

**Files:**
- Modify: `supabase/functions/telegram-webhook/index.ts`

- [ ] **Step 1: Add confirmOnboarding function**

Insert after `handleOnboardingCallback`:

```typescript
async function confirmOnboarding(
  chatId: number,
  userId: string,
  data: OnboardingData,
  botToken: string
): Promise<void> {
  const writes: Promise<unknown>[] = [];

  // ── Vivienda → fin_transactions ──────────────────────────────
  if (data.vivienda_tipo && data.vivienda_importe) {
    const finAppId = await getProjectId(userId, "Finanzas");
    if (finAppId) {
      const desc = `${data.vivienda_tipo === "alquiler" ? "Alquiler" : "Hipoteca"}${data.vivienda_ciudad ? ` — ${data.vivienda_ciudad}` : ""}`;
      writes.push(
        supabase.from("fin_transactions").insert({
          app_id:      finAppId,
          type:        "expense",
          amount:      data.vivienda_importe,
          description: desc,
          date:        new Date().toISOString().slice(0, 10),
        })
      );
    }
  }

  // ── Vehículo → vehicles ──────────────────────────────────────
  if (data.vehiculo_tiene && data.vehiculo_marca) {
    const vehiculoAppId = await getProjectId(userId, "Vehículo");
    if (vehiculoAppId) {
      const name = `${data.vehiculo_marca} ${data.vehiculo_modelo ?? ""}`.trim();
      const { data: existing } = await supabase
        .from("vehicles").select("id")
        .eq("app_id", vehiculoAppId)
        .ilike("name", name)
        .maybeSingle();
      if (existing) {
        writes.push(supabase.from("vehicles").update({ fuel_type: data.vehiculo_combustible }).eq("id", existing.id));
      } else {
        writes.push(supabase.from("vehicles").insert({
          app_id:    vehiculoAppId,
          name,
          type:      "coche",
          brand:     data.vehiculo_marca,
          model:     data.vehiculo_modelo ?? "",
          fuel_type: data.vehiculo_combustible ?? "gasolina",
        }));
      }
    }
  }

  // ── Mascotas → pets ──────────────────────────────────────────
  if (data.mascotas?.length) {
    const mascotasAppId = await getProjectId(userId, "Mascotas");
    if (mascotasAppId) {
      for (const m of data.mascotas) {
        const { data: existing } = await supabase
          .from("pets").select("id")
          .eq("app_id", mascotasAppId)
          .ilike("name", m.nombre)
          .maybeSingle();
        if (existing) {
          writes.push(supabase.from("pets").update({ species: m.especie, birth_date: m.nacimiento ?? null }).eq("id", existing.id));
        } else {
          writes.push(supabase.from("pets").insert({
            app_id:     mascotasAppId,
            name:       m.nombre,
            species:    m.especie,
            birth_date: m.nacimiento ?? null,
          }));
        }
      }
    }
  }

  await Promise.all(writes);
  await markOnboardingComplete(userId, data);

  const nombre = data.nombre_preferido ? `, ${data.nombre_preferido}` : "";
  await sendMessage(
    chatId,
    `✅ <b>¡Todo guardado${nombre}!</b>\n\nTus datos ya están en la app. Puedes verlos en cada módulo.\n\nEscribe /help para ver todo lo que puedo hacer.`,
    botToken
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/user/mi-portfolio-proyectos
npx supabase functions serve telegram-webhook --no-verify-jwt 2>&1 | head -20
```

Expected: no TypeScript errors. Press Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/telegram-webhook/index.ts
git commit -m "feat(telegram): add onboarding confirm handler with module writes"
```

---

## Task 7: Telegram Webhook — Wire Into Main Handler

**Files:**
- Modify: `supabase/functions/telegram-webhook/index.ts`

This task connects all the new functions into the main `Deno.serve` handler.

- [ ] **Step 1: Intercept onboarding callbacks**

In the callback query block (around line 480, where `cbData?.startsWith("store:")` is checked), add a new branch **before** the store check:

```typescript
  // ── Callback query (botones de super) ───────────────────────
  const callbackQuery = body?.callback_query as Record<string, unknown> | undefined;
  if (callbackQuery) {
    const cbId    = callbackQuery.id as string;
    const cbFrom  = callbackQuery.from as Record<string, unknown>;
    const cbMsg   = callbackQuery.message as Record<string, unknown>;
    const cbData  = callbackQuery.data as string;
    const cbChatId = (cbMsg?.chat as Record<string, unknown>)?.id as number;
    const cbFromId = cbFrom?.id as number;

    // ── Onboarding callbacks ─────────────────────────────────
    if (cbData?.startsWith("ob:")) {
      const cbCtx = await getUserContext(cbFromId);
      if (cbCtx) {
        const obValue = cbData.slice(3); // strip "ob:"
        await handleOnboardingCallback(cbId, cbChatId, cbCtx.userId, obValue, botToken);
      } else {
        await answerCallbackQuery(cbId, botToken);
      }
      return new Response("OK", { status: 200 });
    }

    if (cbData?.startsWith("store:")) {
```

- [ ] **Step 2: Add /onboarding command and active-onboarding intercept**

In the text message handler, locate the block `if (text === "/help" || text === "/start")` and add `/onboarding` handling. Also add the active-onboarding intercept BEFORE the normal command dispatch. Replace the command dispatch try/catch block with:

```typescript
  try {
    // ── /onboarding command ──────────────────────────────────
    if (text === "/onboarding") {
      await startOnboarding(chatId, ctx.userId, botToken);
      return new Response("OK", { status: 200 });
    }

    // ── Active onboarding intercept ──────────────────────────
    const obState = await getOnboardingState(ctx.userId);
    if (obState) {
      await handleOnboardingText(chatId, ctx.userId, text, obState, botToken);
      return new Response("OK", { status: 200 });
    }

    // ── Normal commands ──────────────────────────────────────
    if (text === "/help" || text === "/start") {
      await handleHelp(chatId, botToken);
    } else if (text === "/list") {
```

- [ ] **Step 3: Auto-trigger onboarding after /link**

In `handleLink`, find the success message (something like `"✅ ¡Vinculado!"`) and add the onboarding trigger after the Supabase insert. Locate the end of the `handleLink` function and insert before the final return:

```typescript
  // Auto-start onboarding on first link
  await startOnboarding(chatId, userId, botToken);
```

The `handleLink` function should already have access to `userId` from the upsert. Find the line where it sends the success message and add the call right after. The exact location depends on the current code — look for where `"vinculad"` or `"✅"` appears in the handleLink function.

- [ ] **Step 4: Run full test suite**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run
```

Expected: all tests pass.

- [ ] **Step 5: Verify TypeScript compiles cleanly**

```bash
cd /home/user/mi-portfolio-proyectos
npx supabase functions serve telegram-webhook --no-verify-jwt 2>&1 | head -30
```

Expected: function starts, no TypeScript errors. Press Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add supabase/functions/telegram-webhook/index.ts
git commit -m "feat(telegram): wire onboarding into main handler with auto-trigger on link"
```

---

## Task 8: Deploy

- [ ] **Step 1: Deploy the edge function**

```bash
cd /home/user/mi-portfolio-proyectos
npx supabase functions deploy telegram-webhook
```

Expected: deployment successful.

- [ ] **Step 2: Smoke test — banner**

Open the app at `/apps`. Verify the SetupBanner appears with the pending steps for your account.

- [ ] **Step 3: Smoke test — Telegram onboarding**

1. Unlink your Telegram account from Settings (or use `/unlink` in the bot).
2. Re-link with `/link XXXXXX`.
3. Verify the bot immediately starts the onboarding flow with the vivienda question.
4. Complete the flow and verify the confirm message appears.
5. Check the Mascotas module — pets created.
6. Check the Vehículo module — vehicle created.
7. Check the Finanzas module — housing transaction created.
8. Go to `/apps` — SetupBanner should be gone (profile step complete).

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: onboarding setup flow — banner + telegram conversation"
```

---

## Self-Review Notes

- **Spec coverage:** Banner (4 steps, dismiss, auto-hide) ✅ | Telegram flow (full step sequence, /skip, voice note intercept, auto-trigger on /link, /onboarding command) ✅ | Module writes (pets, vehicles, fin_transactions, idempotency) ✅ | New tables (user_onboarding_state, user_onboarding_dismissals) ✅
- **Voice notes:** The active-onboarding intercept in Task 7 Step 2 catches text messages. Voice notes during onboarding are handled by the existing voice pipeline (`transcribeVoice` → text), which then falls through to the normal text handler. Since we intercept there, voice works automatically with no extra code.
- **Type consistency:** `OnboardingData` interface defined in Task 4 Step 1 is used consistently across Tasks 4–6. `getOnboardingState` returns `OnboardingState | null`.
- **handleLink location:** Task 7 Step 3 requires reading the handleLink function to find the exact insertion point. It's around line 200 of the current webhook.
