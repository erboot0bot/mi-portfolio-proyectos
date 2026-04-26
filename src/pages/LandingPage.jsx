import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLang } from '../contexts/LanguageContext'

gsap.registerPlugin(ScrollTrigger)

// Leído una vez al cargar el módulo — no cambia durante la sesión
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const SECTIONS = [
  {
    key: 'apps',
    title: 'My Apps',
    description: 'Herramientas web personales. Accede con tu cuenta de Google y úsalas desde cualquier dispositivo.',
    icon: '⚡',
    href: '/apps',
    status: 'active',
    cta: 'Explorar apps',
    accentColor: 'var(--accent)',
  },
  {
    key: 'projects',
    title: 'Documentación',
    description: 'Portfolio de todo lo que he construido: apps, scripts, setups y experimentos con IA.',
    icon: '🛠️',
    href: '/projects',
    status: 'active',
    cta: 'Ver documentación',
    accentColor: '#6366f1',
  },
  {
    key: 'courses',
    title: 'Cursos',
    description: 'Formación técnica: IA aplicada, flujos de desarrollo y herramientas que multiplican la productividad.',
    icon: '📚',
    href: '/courses',
    status: 'coming_soon',
    cta: 'Próximamente',
    accentColor: '#10b981',
  },
  {
    key: 'store',
    title: 'Tienda',
    description: 'Recursos digitales, templates y herramientas. En construcción.',
    icon: '🛒',
    href: '/store',
    status: 'coming_soon',
    cta: 'Próximamente',
    accentColor: '#8b5cf6',
  },
]

// Estado inicial oculto — solo si el usuario no prefiere motion reducido
const hidden = prefersReducedMotion ? {} : { opacity: 0 }
const hiddenUp = (px) => prefersReducedMotion ? {} : { opacity: 0, transform: `translateY(${px}px)` }

export default function LandingPage() {
  return (
    <div>
      <title>H3nky | Portfolio</title>
      <HeroSection />
      <SectionsGrid />
      <AboutSection />
    </div>
  )
}

function HeroSection() {
  const { t } = useLang()
  const containerRef = useRef(null)

  useGSAP(() => {
    if (prefersReducedMotion) return

    // gsap.to() — el estado inicial ya está en el style prop del JSX
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.to('[data-hero-badge]',    { opacity: 1, y: 0, duration: 0.5 })
      .to('[data-hero-title]',    { opacity: 1, y: 0, duration: 0.6 }, '-=0.25')
      .to('[data-hero-sub]',      { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
      .to('[data-hero-ctas] > *', { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }, '-=0.25')
  }, { scope: containerRef })

  return (
    <section className="relative overflow-hidden" ref={containerRef}>
      <div className="absolute inset-0 hidden dark:block pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(249,115,22,0.07) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 dark:hidden pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.13) 0%, transparent 55%)' }} />

      <div className="relative z-10 pt-16 pb-20 px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto">
        <p data-hero-badge style={hiddenUp(12)}
          className="font-mono text-xs tracking-widest uppercase mb-4
            text-[var(--text-faint)] dark:text-orange-300/60">
          H3nky · dev
        </p>
        <h1 data-hero-title style={hiddenUp(24)}
          className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-none mb-5
            text-[var(--text)]">
          {t('heroTitle')}
        </h1>
        <p data-hero-sub style={hiddenUp(16)}
          className="text-lg leading-relaxed font-light max-w-xl mb-10
            text-[var(--text-muted)]">
          {t('heroSubtitle')}
        </p>
        <div data-hero-ctas className="flex flex-wrap gap-3">
          <Link to="/apps"
            style={{ ...hiddenUp(12), background: 'var(--accent)' }}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm text-white
              transition-all hover:opacity-90 active:scale-95">
            Explorar Apps →
          </Link>
          <Link to="/projects" style={hiddenUp(12)}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all
              border border-[var(--border)] text-[var(--text)]
              hover:bg-[var(--bg-card)] active:scale-95">
            Documentación
          </Link>
        </div>
      </div>
    </section>
  )
}

function SectionsGrid() {
  const containerRef = useRef(null)

  useGSAP(() => {
    if (prefersReducedMotion) return

    gsap.to('[data-section-card]', {
      opacity: (_, target) => target.dataset.active === 'true' ? 1 : 0.6,
      y: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out',
      clearProps: 'transform',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
        once: true,
      },
    })
  }, { scope: containerRef })

  return (
    <section ref={containerRef}
      className="px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto py-12">
      <h2 className="text-xl font-bold text-[var(--text)] mb-1">Qué hay aquí</h2>
      <p className="text-sm text-[var(--text-muted)] mb-8">Una plataforma en constante construcción.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {SECTIONS.map(s => <SectionCard key={s.key} section={s} />)}
      </div>
    </section>
  )
}

function SectionCard({ section }) {
  const isActive = section.status === 'active'

  const initialStyle = prefersReducedMotion
    ? {}
    : { opacity: 0, transform: 'translateY(32px)' }

  const inner = (
    <div
      data-section-card
      data-active={String(isActive)}
      style={initialStyle}
      className={`
        rounded-xl border border-[var(--border)] bg-[var(--bg-card)]
        p-6 flex flex-col gap-3 h-full transition-colors duration-200
        ${isActive ? 'hover:border-[var(--accent)] hover:shadow-md cursor-pointer' : 'cursor-default'}
      `}
    >
      <span className="text-3xl">{section.icon}</span>
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="font-bold text-[var(--text)]">{section.title}</h3>
        {!isActive && (
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--text-faint)]">
            En desarrollo
          </span>
        )}
      </div>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-1">{section.description}</p>
      <span className="text-sm font-semibold mt-1"
        style={{ color: isActive ? section.accentColor : 'var(--text-faint)' }}>
        {section.cta}{isActive ? ' →' : ''}
      </span>
    </div>
  )
  return isActive
    ? <Link to={section.href} className="h-full block">{inner}</Link>
    : <div className="h-full">{inner}</div>
}

function AboutSection() {
  const containerRef = useRef(null)

  useGSAP(() => {
    if (prefersReducedMotion) return

    gsap.to('[data-about-content] > *', {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
      clearProps: 'transform',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 88%',
        once: true,
      },
    })
  }, { scope: containerRef })

  return (
    <section ref={containerRef}
      className="px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto py-16
        border-t border-[var(--border)] mt-8">
      <div data-about-content className="max-w-2xl">
        <p style={hiddenUp(20)} className="font-mono text-xs tracking-widest uppercase mb-4 text-[var(--text-faint)]">
          Sobre el creador
        </p>
        <h2 style={hiddenUp(20)} className="text-2xl font-extrabold text-[var(--text)] mb-4">Hola, soy H3nky</h2>
        <p style={hiddenUp(20)} className="text-[var(--text-muted)] leading-relaxed mb-6">
          Informático apasionado por la IA y las herramientas que multiplican lo que uno solo puede hacer.
          Construyo esto sin ser "desarrollador profesional" — usando Claude Code, Supabase y el stack
          moderno de React para demostrar que los límites técnicos ya no son excusa.
        </p>
        <a href="https://github.com/H3nky" target="_blank" rel="noreferrer"
          style={hiddenUp(20)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
            border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-card)] transition-colors">
          GitHub →
        </a>
      </div>
    </section>
  )
}
