import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ── Hero ─────────────────────────────────────────────────────────────────
function HeroSection() {
  const containerRef = useRef(null)

  useGSAP(() => {
    if (prefersReducedMotion) return
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
    tl.fromTo('[data-hero-lockup]',  { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.8 })
      .fromTo('[data-hero-kicker]',  { opacity: 0, y: 12 },       { opacity: 1, y: 0, duration: 0.5 }, '-=0.5')
      .fromTo('[data-hero-tagline]', { opacity: 0, y: 16 },       { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('[data-hero-ctas] > *',{ opacity: 0, y: 12 },       { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }, '-=0.35')
  }, { scope: containerRef })

  const hidden = prefersReducedMotion ? {} : { opacity: 0 }

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden"
      style={{
        padding: 'clamp(60px, 8vw, 100px) var(--page-px) 140px',
        background: 'linear-gradient(110deg, #ea580c 0%, #7c2d12 28%, #4c1d95 52%, #0a0a0f 78%)',
      }}
    >
      {/* Bottom fade into page bg */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '140px', background: 'linear-gradient(to bottom, transparent, var(--bg))' }}
      />

      <div
        className="relative flex flex-col items-center text-center"
        style={{ zIndex: 2, maxWidth: 'var(--max-width)', margin: '0 auto' }}
      >
        {/* Kicker */}
        <p
          data-hero-kicker
          style={{
            ...hidden,
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '36px',
          }}
        >
          <span style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
          H3NKY · DEV · 2026
          <span style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
        </p>

        {/* Logo lockup */}
        <div
          data-hero-lockup
          style={{ ...hidden, width: '100%', maxWidth: '760px', margin: '0 auto' }}
        >
          <img
            src="/logo-horizontal.png"
            alt="H3nky"
            style={{ width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(0 12px 50px rgba(0,0,0,0.45))' }}
          />
        </div>

        {/* Tagline */}
        <p
          data-hero-tagline
          style={{
            ...hidden,
            fontFamily: 'var(--font-body)',
            fontSize: '19px',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.82)',
            maxWidth: '580px',
            lineHeight: 1.6,
            margin: '40px 0 44px',
          }}
        >
          Construyo aplicaciones reales con IA y documento exactamente cómo lo hago.
        </p>

        {/* CTAs */}
        <div data-hero-ctas className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/apps"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 28px', borderRadius: 'var(--radius-md)',
              background: 'var(--accent)', color: '#fff',
              fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
              textDecoration: 'none', border: '1px solid transparent',
              boxShadow: 'var(--shadow-cta)', transition: 'all var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = '' }}
          >
            Ver mis apps →
          </Link>
          <Link
            to="/projects"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 28px', borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.06)', color: '#fff',
              fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
              textDecoration: 'none', border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)', transition: 'all var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
          >
            Ver el portfolio →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── Stats ─────────────────────────────────────────────────────────────────
const STATS = [
  { num: '4',  suffix: '+', label: 'Apps en producción',     color: 'var(--accent)' },
  { num: '100%',             label: 'Código asistido por IA', color: 'var(--brand-green)' },
  { num: '27.5', suffix: 'K', label: 'Líneas de código',       color: 'var(--text)' },
  { num: 'Open',             label: 'Código fuente público',  color: 'var(--brand-purple)', small: true },
]

function StatsSection() {
  const containerRef = useRef(null)

  useGSAP(() => {
    if (prefersReducedMotion) return
    gsap.fromTo('[data-stat-card]',
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 90%', once: true },
      }
    )
  }, { scope: containerRef })

  return (
    <section
      ref={containerRef}
      style={{
        maxWidth: 'var(--max-width)', margin: '-68px auto 0',
        padding: '0 var(--page-px)', position: 'relative', zIndex: 10,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
        }}
      >
        {STATS.map(({ num, suffix, label, color, small }) => (
          <div
            key={label}
            data-stat-card
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px 24px',
              boxShadow: 'var(--shadow-card)',
              transition: 'all var(--transition)',
              textAlign: 'center',
              ...(prefersReducedMotion ? {} : { opacity: 0 }),
            }}
          >
            <div style={{
              fontFamily: 'var(--font-tech)',
              fontSize: small ? '44px' : '56px',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color,
            }}>
              {num}{suffix && <span style={{ color: 'var(--accent)' }}>{suffix}</span>}
            </div>
            <div style={{
              fontFamily: 'var(--font-tech)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
              marginTop: '14px',
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Pillars ───────────────────────────────────────────────────────────────
const PILLARS = [
  {
    num: '01 / Apps',
    title: 'My Apps',
    desc: 'Aplicaciones reales en producción. Hogar, herramientas internas, prototipos funcionando.',
    accent: 'var(--brand-orange)',
    iconBg: 'rgba(254,112,0,0.12)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    href: '/apps',
  },
  {
    num: '02 / Docs',
    title: 'Documentación',
    desc: 'Guías paso a paso, decisiones técnicas, errores. Todo público para que otros aprendan.',
    accent: 'var(--brand-green)',
    iconBg: 'rgba(33,235,63,0.12)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    href: '/projects',
  },
  {
    num: '03 / Demo',
    title: 'Demo',
    desc: 'Experimentos, ideas en construcción y exploración técnica sin filtrar.',
    accent: 'var(--brand-purple)',
    iconBg: 'rgba(154,78,251,0.12)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2v6l-4 8a4 4 0 0 0 4 6h6a4 4 0 0 0 4-6l-4-8V2" />
        <path d="M9 2h6" />
      </svg>
    ),
    href: '/demo',
  },
]

function PillarsSection() {
  const containerRef = useRef(null)

  useGSAP(() => {
    if (prefersReducedMotion) return
    gsap.fromTo('[data-pillar-card]',
      { y: 32, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 85%', once: true },
      }
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '112px var(--page-px)' }}>
      <div style={{ marginBottom: '56px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', color: 'var(--accent)', marginBottom: '12px', textTransform: 'uppercase' }}>
          // Plataforma
        </div>
        <h2 style={{ fontFamily: 'var(--font-hero)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 14px', color: 'var(--text)' }}>
          Qué hay aquí
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '17px', fontWeight: 300, color: 'var(--text-muted)', maxWidth: '540px', lineHeight: 1.6, margin: 0 }}>
          Una plataforma en constante construcción.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {PILLARS.map(({ num, title, desc, accent, iconBg, icon, href }) => (
          <Link
            key={num}
            to={href}
            data-pillar-card
            style={{
              ...(prefersReducedMotion ? {} : { opacity: 0 }),
              display: 'block',
              background: 'var(--bg-card)',
              border: `1px solid var(--border)`,
              borderTop: `3px solid ${accent}`,
              borderRadius: 'var(--radius-lg)',
              padding: '36px 32px',
              boxShadow: 'var(--shadow-card)',
              transition: 'all var(--transition)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-card)' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
              {icon}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', color: accent, marginBottom: '10px' }}>
              {num}
            </div>
            <h3 style={{ fontFamily: 'var(--font-hero)', fontSize: '19px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 12px', color: 'var(--text)' }}>
              {title}
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
              {desc}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ── Apps Showcase ─────────────────────────────────────────────────────────
const APPS = [
  {
    id: 'hogar',
    label: '01 / Hogar',
    title: 'Hogar',
    desc: 'Calendario familiar, lista de la compra y recetas generadas con IA.',
    accent: 'var(--accent)',
    iconBg: 'rgba(254,112,0,0.12)',
    status: 'Producción',
    statusColor: 'var(--brand-green)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    href: '/apps',
  },
  {
    id: 'finanzas',
    label: '02 / Finanzas',
    title: 'Finanzas',
    desc: 'Control de gastos e ingresos con categorías automáticas y resumen mensual.',
    accent: 'var(--brand-green)',
    iconBg: 'rgba(33,235,63,0.12)',
    status: 'Beta',
    statusColor: 'var(--brand-orange)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    href: '/apps',
  },
  {
    id: 'mascotas',
    label: '03 / Mascotas',
    title: 'Mascotas',
    desc: 'Seguimiento de vacunas, visitas al veterinario y recordatorios automáticos.',
    accent: 'var(--brand-purple)',
    iconBg: 'rgba(154,78,251,0.12)',
    status: 'En desarrollo',
    statusColor: 'var(--text-faint)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    href: '/apps',
  },
]

function AppsShowcaseSection() {
  const containerRef = useRef(null)

  useGSAP(() => {
    if (prefersReducedMotion) return
    gsap.fromTo('[data-app-card]',
      { y: 32, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 85%', once: true },
      }
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 var(--page-px) 112px' }}>
      <div style={{ marginBottom: '56px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', color: 'var(--accent)', marginBottom: '12px', textTransform: 'uppercase' }}>
          // Aplicaciones
        </div>
        <h2 style={{ fontFamily: 'var(--font-hero)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 14px', color: 'var(--text)' }}>
          Mis Apps
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '17px', fontWeight: 300, color: 'var(--text-muted)', maxWidth: '540px', lineHeight: 1.6, margin: 0 }}>
          Herramientas reales para el día a día, construidas con IA y código abierto.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {APPS.map(({ id, label, title, desc, accent, iconBg, icon, status, statusColor, href }) => (
          <Link
            key={id}
            to={href}
            data-app-card
            style={{
              ...(prefersReducedMotion ? {} : { opacity: 0 }),
              display: 'block',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderTop: `3px solid ${accent}`,
              borderRadius: 'var(--radius-lg)',
              padding: '36px 32px',
              boxShadow: 'var(--shadow-card)',
              transition: 'all var(--transition)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-card)' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: statusColor, background: `${statusColor}18`, padding: '4px 10px', borderRadius: '99px', border: `1px solid ${statusColor}30` }}>
                {status}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', color: accent, marginBottom: '10px' }}>
              {label}
            </div>
            <h3 style={{ fontFamily: 'var(--font-hero)', fontSize: '19px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 12px', color: 'var(--text)' }}>
              {title}
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
              {desc}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ── Auth Section ──────────────────────────────────────────────────────────
function AuthSection() {
  return (
    <div style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '96px var(--page-px)' }}>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 460px', gap: '64px', alignItems: 'center' }}
          className="lg:grid-cols-[1fr_460px] grid-cols-1"
        >
          {/* Copy */}
          <div>
            <div style={{ fontFamily: 'var(--font-tech)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '14px' }}>
              // Acceso
            </div>
            <h2 style={{ fontFamily: 'var(--font-hero)', fontSize: 'clamp(28px, 3.4vw, 40px)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 16px', color: 'var(--text)' }}>
              Entra a tus apps
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1.65, margin: '0 0 24px' }}>
              El acceso a las aplicaciones de H3nky es privado. Cada módulo usa el mismo login con Google.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-faint)', lineHeight: 1.55, margin: 0 }}>
              Solo se usa para autenticación. No compartimos tus datos con nadie.
            </p>
          </div>

          {/* Login card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px 28px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Mini logo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
              <img src="/logo-horizontal.png" alt="H3nky" style={{ height: '52px', width: 'auto', display: 'block' }} />
              <div style={{ fontFamily: 'var(--font-tech)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
                Creo · Aprendo · Comparto
              </div>
            </div>

            {/* Hogar module badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(254,112,0,0.06)', border: '1px solid rgba(254,112,0,0.18)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(254,112,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-hero)', fontSize: '13px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text)' }}>Hogar</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Calendario, lista de la compra y recetas con IA</div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--border)' }} />

            {/* Google button — links to /login */}
            <Link
              to="/login"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '14px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, textDecoration: 'none', transition: 'all var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </Link>

            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-faint)', textAlign: 'center', lineHeight: 1.55, margin: 0 }}>
              Solo se usa para autenticación.<br />No compartimos tus datos.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div>
      <title>H3nky | Portfolio</title>
      <HeroSection />
      <StatsSection />
      <PillarsSection />
      <AppsShowcaseSection />
      <AuthSection />
    </div>
  )
}
