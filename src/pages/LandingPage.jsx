import { Link } from 'react-router-dom'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars

const SECTIONS = [
  {
    key: 'apps',
    title: 'My Apps',
    description:
      'Herramientas web personales. Accede con tu cuenta de Google y úsalas desde cualquier dispositivo.',
    icon: '⚡',
    href: '/apps',
    status: 'active',
    cta: 'Explorar apps',
    accentColor: 'var(--accent)',
  },
  {
    key: 'projects',
    title: 'Proyectos',
    description:
      'Portfolio de todo lo que he construido: apps, scripts, setups y experimentos con IA.',
    icon: '🛠️',
    href: '/projects',
    status: 'active',
    cta: 'Ver proyectos',
    accentColor: '#6366f1',
  },
  {
    key: 'courses',
    title: 'Cursos',
    description:
      'Formación técnica: IA aplicada, flujos de desarrollo y herramientas que multiplican la productividad.',
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
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 hidden dark:block pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(249,115,22,0.07) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 dark:hidden pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.13) 0%, transparent 55%)' }} />

      <div className="relative z-10 pt-16 pb-20 px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto">
        <p className="font-mono text-xs tracking-widest uppercase mb-4
          text-[var(--text-faint)] dark:text-orange-300/60">
          H3nky · dev
        </p>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-none mb-5
          text-[var(--text)]">
          Herramientas reales,<br />
          <span style={{ color: 'var(--accent)' }}>construidas de verdad.</span>
        </h1>
        <p className="text-lg leading-relaxed font-light max-w-xl mb-10
          text-[var(--text-muted)]">
          Apps, proyectos y recursos construidos por un solo desarrollador
          usando IA como equipo completo.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/apps"
            className="px-5 py-2.5 rounded-lg font-semibold text-sm text-white
              transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'var(--accent)' }}>
            Explorar Apps →
          </Link>
          <Link to="/projects"
            className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all
              border border-[var(--border)] text-[var(--text)]
              hover:bg-[var(--bg-card)] active:scale-95">
            Ver Proyectos
          </Link>
        </div>
      </div>
    </section>
  )
}

function SectionsGrid() {
  return (
    <section className="px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto py-12">
      <h2 className="text-xl font-bold text-[var(--text)] mb-1">Qué hay aquí</h2>
      <p className="text-sm text-[var(--text-muted)] mb-8">Una plataforma en constante construcción.</p>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        initial="hidden"
        animate="show"
      >
        {SECTIONS.map(s => <SectionCard key={s.key} section={s} />)}
      </motion.div>
    </section>
  )
}

function SectionCard({ section }) {
  const isActive = section.status === 'active'
  const inner = (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className={`
        rounded-xl border border-[var(--border)] bg-[var(--bg-card)]
        p-6 flex flex-col gap-3 h-full transition-all duration-200
        ${isActive ? 'hover:border-[var(--accent)] hover:shadow-md cursor-pointer' : 'opacity-60 cursor-default'}
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
    </motion.div>
  )
  return isActive
    ? <Link to={section.href} className="h-full block">{inner}</Link>
    : <div className="h-full">{inner}</div>
}

function AboutSection() {
  return (
    <section className="px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto py-16
      border-t border-[var(--border)] mt-8">
      <div className="max-w-2xl">
        <p className="font-mono text-xs tracking-widest uppercase mb-4 text-[var(--text-faint)]">
          Sobre el creador
        </p>
        <h2 className="text-2xl font-extrabold text-[var(--text)] mb-4">Hola, soy H3nky</h2>
        <p className="text-[var(--text-muted)] leading-relaxed mb-6">
          Informático apasionado por la IA y las herramientas que multiplican lo que uno solo puede hacer.
          Construyo esto sin ser "desarrollador profesional" — usando Claude Code, Supabase y el stack
          moderno de React para demostrar que los límites técnicos ya no son excusa.
        </p>
        <a href="https://github.com/H3nky" target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
            border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-card)] transition-colors">
          GitHub →
        </a>
      </div>
    </section>
  )
}
