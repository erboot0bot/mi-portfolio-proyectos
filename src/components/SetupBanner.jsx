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
    if (!session) return

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
