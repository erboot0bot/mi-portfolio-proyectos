// src/components/ComingSoonPage.jsx
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function isValidEmail(email) {
  return /^[^@]+@[^@]+\.[^@]+$/.test(email.trim())
}

export default function ComingSoonPage({ title, icon, waitlistKey }) {
  const containerRef = useRef(null)
  const [email, setEmail]           = useState('')
  const [submitted, setSubmitted]   = useState(false)
  const [emailError, setEmailError] = useState('')

  useGSAP(() => {
    if (prefersReducedMotion) return

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.to('[data-cs-icon]',    { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' })
      .to('[data-cs-heading]', { opacity: 1, y: 0, duration: 0.4 }, '-=0.2')
      .to('[data-cs-body]',    { opacity: 1, y: 0, duration: 0.35 }, '-=0.2')
      .to('[data-cs-form]',    { opacity: 1, y: 0, duration: 0.3 }, '-=0.1')
      .to('[data-cs-back]',    { opacity: 1, duration: 0.3 }, '-=0.1')
  }, { scope: containerRef })

  function handleNotify(e) {
    e.preventDefault()
    setEmailError('')
    if (!isValidEmail(email)) {
      setEmailError('Introduce un email válido.')
      return
    }
    const key      = `waitlist_${waitlistKey}`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    if (!existing.includes(email.trim())) {
      localStorage.setItem(key, JSON.stringify([...existing, email.trim()]))
    }
    setSubmitted(true)
  }

  return (
    <div ref={containerRef}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 gap-5">
      <title>{title} | H3nky</title>

      <div data-cs-icon
        style={prefersReducedMotion ? {} : { opacity: 0, transform: 'scale(0.7)' }}
        className="text-6xl">{icon}</div>

      <div data-cs-heading
        style={prefersReducedMotion ? {} : { opacity: 0, transform: 'translateY(14px)' }}
        className="flex flex-col gap-2 items-center">
        <h1 className="text-3xl font-extrabold text-[var(--text)]">{title}</h1>
        <span className="font-mono text-xs px-3 py-1 rounded-full bg-[var(--border)] text-[var(--text-faint)]">
          En desarrollo
        </span>
      </div>

      <p data-cs-body
        style={prefersReducedMotion ? {} : { opacity: 0, transform: 'translateY(10px)' }}
        className="text-sm text-[var(--text-muted)] max-w-sm">
        Esta sección está en construcción. Las cosas buenas tardan un poco.
      </p>

      {waitlistKey && (
        <div data-cs-form
          style={prefersReducedMotion ? {} : { opacity: 0, transform: 'translateY(10px)' }}
          className="w-full max-w-sm">
          {submitted ? (
            <p role="status" className="text-sm font-medium text-emerald-500">
              ✅ Te avisamos cuando esté listo.
            </p>
          ) : (
            <form onSubmit={handleNotify} noValidate className="flex flex-col gap-2">
              <div className="flex gap-2">
                <label
                  htmlFor={`waitlist-${waitlistKey}`}
                  className="sr-only"
                >
                  Email para recibir novedades de {title}
                </label>
                <input
                  id={`waitlist-${waitlistKey}`}
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? `waitlist-error-${waitlistKey}` : undefined}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border)]
                    bg-[var(--bg)] text-[var(--text)] outline-none
                    focus:ring-2 focus:ring-[var(--accent)]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--accent)]
                    text-white hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
                >
                  Notificarme
                </button>
              </div>
              {emailError && (
                <p
                  id={`waitlist-error-${waitlistKey}`}
                  role="alert"
                  className="text-xs text-red-500 text-left"
                >
                  {emailError}
                </p>
              )}
            </form>
          )}
        </div>
      )}

      <div data-cs-back style={prefersReducedMotion ? {} : { opacity: 0 }}>
        <Link to="/"
          className="text-sm text-[var(--text-faint)] hover:text-[var(--text)]
            underline underline-offset-4 transition-colors">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  )
}
