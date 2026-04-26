import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function ComingSoonPage({ title, icon }) {
  const containerRef = useRef(null)

  useGSAP(() => {
    if (prefersReducedMotion) return

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.to('[data-cs-icon]',    { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' })
      .to('[data-cs-heading]', { opacity: 1, y: 0, duration: 0.4 }, '-=0.2')
      .to('[data-cs-body]',    { opacity: 1, y: 0, duration: 0.35 }, '-=0.2')
      .to('[data-cs-back]',    { opacity: 1, duration: 0.3 }, '-=0.1')
  }, { scope: containerRef })

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

      <div data-cs-back style={prefersReducedMotion ? {} : { opacity: 0 }}>
        <Link to="/" className="text-sm text-[var(--text-faint)] hover:text-[var(--text)]
          underline underline-offset-4 transition-colors">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  )
}
