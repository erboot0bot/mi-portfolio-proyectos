import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function TelegramLinkCard() {
  const [status, setStatus]         = useState('loading') // loading | linked | unlinked
  const [linkData, setLinkData]     = useState(null)      // { telegram_username, telegram_first_name }
  const [code, setCode]             = useState(null)      // { code, expires_at, bot_username }
  const [countdown, setCountdown]   = useState(null)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState(null)
  const channelRef = useRef(null)

  useEffect(() => {
    checkLinkStatus()
  }, [])

  // Realtime: escucha cuando el bot confirma la vinculación
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

  // Countdown del código (actualiza cada segundo)
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
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setStatus('unlinked'); return }

      const { data } = await supabase
        .from('user_telegram_links')
        .select('telegram_username, telegram_first_name')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (data) {
        setLinkData(data)
        setStatus('linked')
      } else {
        setStatus('unlinked')
      }
    } catch (err) {
      console.error('checkLinkStatus error:', err)
      setStatus('unlinked')
    }
  }

  async function generateCode() {
    setGenerating(true)
    setGenerateError(null)
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
      setCountdown(Math.floor((new Date(data.expires_at) - Date.now()) / 1000))
    } catch (err) {
      console.error('Error generating code:', err)
      setGenerateError('No se pudo generar el código. Inténtalo de nuevo.')
    } finally {
      setGenerating(false)
    }
  }

  async function unlink() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { error } = await supabase
      .from('user_telegram_links')
      .delete()
      .eq('user_id', session.user.id)
    if (error) {
      console.error('unlink error:', error)
      return
    }
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
            onClick={() => {
              if (window.confirm('¿Desvincular Telegram? Tendrás que volver a vincular para usar el bot.')) {
                unlink()
              }
            }}
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
        <>
          {generateError && (
            <p className="text-xs text-red-500">{generateError}</p>
          )}
          <button
            onClick={generateCode}
            disabled={generating}
            className="w-full py-2 px-4 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
          >
            {generating ? 'Generando...' : 'Generar código de vinculación'}
          </button>
        </>
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
