import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ─────────────────────────────────────────────────────────────
// Estado global de la integración Telegram:
//
//   botStatus:     'loading' | 'no_bot' | 'has_bot'
//   accountStatus: 'loading' | 'unlinked' | 'linked'
//
// Flujo visible:
//   Paso 1 → Configura tu bot   (botStatus === 'no_bot')
//   Paso 2 → Vincula tu cuenta  (botStatus === 'has_bot' && accountStatus !== 'linked')
//   ✅     → Conectado           (accountStatus === 'linked')
// ─────────────────────────────────────────────────────────────

export function TelegramLinkCard() {
  // Bot config
  const [botStatus, setBotStatus]       = useState('loading') // loading | no_bot | has_bot
  const [botUsername, setBotUsername]   = useState(null)
  const [tokenInput, setTokenInput]     = useState('')
  const [setupLoading, setSetupLoading] = useState(false)
  const [setupError, setSetupError]     = useState(null)

  // Account link
  const [accountStatus, setAccountStatus] = useState('loading') // loading | unlinked | linked
  const [linkData, setLinkData]           = useState(null)
  const [code, setCode]                   = useState(null)      // { code, expires_at, bot_username }
  const [countdown, setCountdown]         = useState(null)
  const [generating, setGenerating]       = useState(false)
  const [generateError, setGenerateError] = useState(null)

  const channelRef = useRef(null)

  // ── Carga inicial: verificar bot config y estado de vínculo ─

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setBotStatus('no_bot')
      setAccountStatus('unlinked')
      return
    }

    // Ambas consultas en paralelo
    const [botRes, linkRes] = await Promise.all([
      supabase
        .from('telegram_bot_config')
        .select('bot_username')
        .eq('user_id', session.user.id)
        .maybeSingle(),
      supabase
        .from('user_telegram_links')
        .select('telegram_username, telegram_first_name')
        .eq('user_id', session.user.id)
        .maybeSingle(),
    ])

    if (botRes.data?.bot_username) {
      setBotUsername(botRes.data.bot_username)
      setBotStatus('has_bot')
    } else {
      setBotStatus('no_bot')
    }

    if (linkRes.data) {
      setLinkData(linkRes.data)
      setAccountStatus('linked')
    } else {
      setAccountStatus('unlinked')
    }
  }

  // ── Realtime: escucha vinculación desde el bot ───────────────

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
          setAccountStatus('linked')
          setCode(null)
        })
        .subscribe()
    })

    return () => {
      cancelled = true
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [])

  // ── Countdown del código ─────────────────────────────────────

  useEffect(() => {
    if (!code) return
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(code.expires_at) - Date.now()) / 1000))
      setCountdown(remaining)
      if (remaining === 0) { setCode(null); setCountdown(null) }
    }, 1000)
    return () => clearInterval(interval)
  }, [code])

  // ── Acciones ─────────────────────────────────────────────────

  async function setupBot() {
    const token = tokenInput.trim()
    if (!token) return

    setSetupLoading(true)
    setSetupError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/setup-telegram-bot`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bot_token: token }),
        }
      )
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Error configurando el bot')
      setBotUsername(data.bot_username)
      setBotStatus('has_bot')
      setTokenInput('')
    } catch (err) {
      console.error('setupBot error:', err)
      setSetupError(err.message || 'No se pudo configurar el bot. Verifica el token.')
    } finally {
      setSetupLoading(false)
    }
  }

  async function generateCode() {
    setGenerating(true)
    setGenerateError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-telegram-code`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setCode({ ...data, bot_username: botUsername })
      setCountdown(Math.floor((new Date(data.expires_at) - Date.now()) / 1000))
    } catch (err) {
      console.error('generateCode error:', err)
      setGenerateError('No se pudo generar el código. Inténtalo de nuevo.')
    } finally {
      setGenerating(false)
    }
  }

  async function unlink() {
    if (!window.confirm('¿Desvincular Telegram? Tendrás que volver a vincular para usar el bot.')) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { error } = await supabase
      .from('user_telegram_links')
      .delete()
      .eq('user_id', session.user.id)
    if (error) { console.error('unlink error:', error); return }
    setAccountStatus('unlinked')
    setLinkData(null)
    setCode(null)
  }

  async function resetBot() {
    if (!window.confirm('¿Cambiar el bot? Tendrás que configurar uno nuevo y volver a vincular tu cuenta.')) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    // Desvincular cuenta primero
    await supabase.from('user_telegram_links').delete().eq('user_id', session.user.id)
    // Borrar config del bot (usando service-role no disponible en cliente, así que solo limpiamos UI)
    // El usuario deberá configurar un nuevo bot — el upsert en setup-telegram-bot sobreescribirá la config anterior
    setBotStatus('no_bot')
    setBotUsername(null)
    setAccountStatus('unlinked')
    setLinkData(null)
    setCode(null)
  }

  // ── Render helpers ───────────────────────────────────────────

  const isLoading = botStatus === 'loading' || accountStatus === 'loading'

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[var(--border)] p-4 space-y-2">
        <div className="h-4 bg-[var(--bg-card)] rounded w-1/3 animate-pulse" />
        <div className="h-3 bg-[var(--bg-card)] rounded w-1/2 animate-pulse" />
      </div>
    )
  }

  // ── Estado: Cuenta vinculada ✅ ──────────────────────────────

  if (accountStatus === 'linked') {
    return (
      <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm text-[var(--text)]">✅ Telegram conectado</p>
            {linkData?.telegram_first_name && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {linkData.telegram_first_name}
                {linkData.telegram_username ? ` · @${linkData.telegram_username}` : ''}
              </p>
            )}
          </div>
          {botUsername && (
            <a
              href={`https://t.me/${botUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-[var(--accent)] hover:underline"
            >
              @{botUsername} →
            </a>
          )}
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          Envía mensajes al bot para gestionar tu lista de la compra desde Telegram.
        </p>

        <div className="flex gap-3 pt-1">
          <button
            onClick={unlink}
            className="text-xs text-red-500 hover:underline"
          >
            Desvincular cuenta
          </button>
          <span className="text-xs text-[var(--border)]">·</span>
          <button
            onClick={resetBot}
            className="text-xs text-[var(--text-muted)] hover:underline"
          >
            Cambiar bot
          </button>
        </div>
      </div>
    )
  }

  // ── Paso 1: Configura tu bot ─────────────────────────────────

  if (botStatus === 'no_bot') {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold shrink-0">1</span>
            <p className="font-semibold text-sm text-[var(--text)]">Configura tu bot de Telegram</p>
          </div>
          <p className="text-xs text-[var(--text-muted)] pl-7">
            Crea un bot gratuito con @BotFather y conéctalo a tu app Hogar.
          </p>
        </div>

        {/* Instrucciones */}
        <ol className="space-y-2 pl-7">
          {[
            <>Abre Telegram y busca <span className="font-semibold text-[var(--text)]">@BotFather</span></>,
            <>Envía <code className="bg-[var(--bg)] px-1 py-0.5 rounded text-xs">/newbot</code> y sigue los pasos</>,
            <>Copia el token que te da (empieza por números y tiene dos partes separadas por <code className="bg-[var(--bg)] px-1 py-0.5 rounded text-xs">:</code>)</>,
            <>Pégalo aquí abajo y pulsa <span className="font-semibold text-[var(--text)]">Configurar</span></>,
          ].map((step, i) => (
            <li key={i} className="flex gap-2 text-xs text-[var(--text-muted)]">
              <span className="shrink-0 text-[var(--text-faint)]">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        {/* Input del token */}
        <div className="space-y-2">
          <input
            type="text"
            value={tokenInput}
            onChange={e => { setTokenInput(e.target.value); setSetupError(null) }}
            onKeyDown={e => e.key === 'Enter' && setupBot()}
            placeholder="123456789:AAFxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] focus:outline-none focus:border-[var(--accent)] font-mono"
          />
          {setupError && (
            <p className="text-xs text-red-500">{setupError}</p>
          )}
          <button
            onClick={setupBot}
            disabled={setupLoading || !tokenInput.trim()}
            className="w-full py-2 px-4 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
          >
            {setupLoading ? 'Configurando...' : 'Configurar bot'}
          </button>
        </div>
      </div>
    )
  }

  // ── Paso 2: Vincula tu cuenta ────────────────────────────────

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-4">
      {/* Cabecera: bot configurado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold shrink-0">2</span>
          <div>
            <p className="font-semibold text-sm text-[var(--text)]">Vincula tu cuenta</p>
            {botUsername && (
              <p className="text-xs text-[var(--text-muted)]">
                Bot: <span className="font-medium text-[var(--text)]">@{botUsername}</span> ✅
              </p>
            )}
          </div>
        </div>
        <button
          onClick={resetBot}
          className="text-xs text-[var(--text-muted)] hover:underline shrink-0"
        >
          Cambiar bot
        </button>
      </div>

      {/* Código de vinculación */}
      {!code ? (
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-muted)] pl-7">
            Genera un código y envíaselo al bot para vincular tu cuenta de Telegram.
          </p>
          {generateError && (
            <p className="text-xs text-red-500 pl-7">{generateError}</p>
          )}
          <button
            onClick={generateCode}
            disabled={generating}
            className="w-full py-2 px-4 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
          >
            {generating ? 'Generando...' : 'Generar código de vinculación'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-[var(--bg)] rounded-lg p-4 text-center space-y-2 border border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)]">
              Envía este mensaje a{' '}
              <a
                href={`https://t.me/${botUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--accent)]"
              >
                @{botUsername}
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
            href={`https://t.me/${botUsername}?start=link_${code.code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-[var(--border)] text-sm text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
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
