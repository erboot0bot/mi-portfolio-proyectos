import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects, CHAPTERS, CHAPTER_BY_NAME } from '../data/projects'

gsap.registerPlugin(ScrollTrigger)

// Enrich each project with chapter + display metadata
const CHAPTER_META = {
  hogar: {
    kicker: 'Apps · Hogar',
    blurb: 'Calendario, compra, menú semanal y recetas con IA. Full-stack personal en producción.',
    chapterIndex: 1,
    metrics: [
      { label: 'Módulos', value: '4' },
      { label: 'Tablas Postgres', value: '7' },
      { label: 'Políticas RLS', value: '10' },
      { label: 'LOC', value: '~1.9K' },
    ],
  },
  'portfolio-personal': {
    kicker: 'Web · Portfolio',
    blurb: 'Esta misma web: animaciones GSAP, sistema de temas, documentación técnica completa.',
    chapterIndex: 2,
    metrics: [
      { label: 'Páginas', value: '8' },
      { label: 'Tests', value: '40+' },
      { label: 'Animaciones', value: 'GSAP' },
      { label: 'LOC', value: '~5K' },
    ],
  },
  'portfolio-config': {
    kicker: 'Web · Config',
    blurb: 'React + Vite + Tailwind v4: decisiones de arquitectura, bundle splitting, PWA.',
    chapterIndex: 2,
    metrics: [
      { label: 'Build time', value: '1.6s' },
      { label: 'Bundle split', value: 'Lazy' },
      { label: 'PWA', value: 'Sí' },
      { label: 'Cobertura', value: 'Vitest' },
    ],
  },
  'ai-dev-setup': {
    kicker: 'Setup · IA',
    blurb: 'Claude Code + gstack para desarrollar como un equipo de 20. Configuración completa.',
    chapterIndex: 3,
    metrics: [
      { label: 'Agentes', value: 'Claude Code' },
      { label: 'Browser', value: 'gstack' },
      { label: 'Skills', value: '30+' },
      { label: 'Workflows', value: 'CI/CD' },
    ],
  },
  'vercel-deploy': {
    kicker: 'Infra · CI/CD',
    blurb: 'De git push a producción en 90 segundos. Deploy automático, previews y SSL.',
    chapterIndex: 4,
    metrics: [
      { label: 'Deploy', value: '~90s' },
      { label: 'Build', value: '1.62s' },
      { label: 'Entornos', value: '3' },
      { label: 'Uptime', value: '99.9%' },
    ],
  },
}

function buildCoverUrl(project) {
  // Try local asset first (pre-generated), fall back to Pollinations.ai
  return `/projects/${project.slug}/cover.jpg`
}

function buildFallbackUrl(project) {
  const prompt = [
    'Cinematic dark tech portfolio cover.',
    project.title + '.',
    'Stack: ' + project.technologies.slice(0, 3).join(', ') + '.',
    'Abstract visualization, no text, no logos, dark background, moody lighting.',
  ].join(' ')
  const seed = project.slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=550&nologo=true&seed=${seed}`
}

// ─── ProjectCover ──────────────────────────────────────────────────────────────
function ProjectCover({ project }) {
  const [src, setSrc] = useState(() => buildCoverUrl(project))
  const [tried, setTried] = useState(0)
  const isWip = project.status === 'wip'

  function handleError() {
    if (tried === 0) {
      setSrc(buildFallbackUrl(project))
      setTried(1)
    } else {
      setSrc(null)
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '16 / 11',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${project.gradientFrom}, ${project.gradientVia || project.gradientFrom}, ${project.gradientTo})`,
        flexShrink: 0,
      }}
    >
      {src && (
        <img
          src={src}
          alt={project.title}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Status ribbon — top left */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-full)',
          padding: '4px 10px',
          fontFamily: 'var(--font-tech)',
          fontSize: '11px',
          fontWeight: 600,
          color: isWip ? '#ff8c33' : '#4ade80',
          letterSpacing: '0.04em',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isWip ? '#fe7000' : '#21eb3f',
            flexShrink: 0,
          }}
        />
        {isWip ? 'En desarrollo' : 'Completado'}
      </div>

      {/* Date + chapter index — bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.65)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {project.date} · {String(project.chapterIndex || meta.chapterIndex || 1).padStart(2, '0')}
      </div>
    </div>
  )
}

// ─── EntryCard ─────────────────────────────────────────────────────────────────
function EntryCard({ project, index }) {
  const [hovered, setHovered] = useState(false)
  const meta = CHAPTER_META[project.slug] || {}
  const isFlipped = index % 2 === 1

  return (
    <article
      data-anim="fade-up"
      className="entry-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: 0,
        transform: 'translateY(28px)',
        display: 'grid',
        gap: '40px',
        alignItems: 'start',
        padding: '32px',
        background: 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--border-hover)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: hovered ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        marginBottom: '24px',
      }}
    >
      {/* Cover side */}
      <div style={{ order: isFlipped ? 1 : 0 }}>
        <ProjectCover project={project} />
      </div>

      {/* Body side */}
      <div style={{ order: isFlipped ? 0 : 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Kicker */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0,
          }}
        >
          <span style={{ width: '20px', height: '1px', background: 'var(--accent)', flexShrink: 0 }} />
          {project.kicker || meta.kicker || project.shortTitle}
        </p>

        {/* Title */}
        <h3
          style={{
            fontFamily: 'var(--font-hero)',
            fontSize: 'clamp(18px, 2vw, 24px)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text)',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {project.shortTitle || project.title}
        </h3>

        {/* Blurb */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--text-muted)',
            margin: 0,
            lineHeight: 1.65,
          }}
        >
          {project.blurb || meta.blurb || project.description}
        </p>

        {/* Status pill + tech tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-tech)',
              fontSize: '11px',
              fontWeight: 600,
              background: project.status === 'wip' ? 'var(--status-wip-bg)' : 'var(--status-done-bg)',
              color: project.status === 'wip' ? 'var(--status-wip-text)' : 'var(--status-done-text)',
              border: `1px solid ${project.status === 'wip' ? 'var(--status-wip-border)' : 'var(--status-done-border)'}`,
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: 'currentColor',
              }}
            />
            {project.status === 'wip' ? 'En desarrollo' : 'Completado'}
          </span>

          {project.technologies.slice(0, 3).map((tech) => (
            <span
              key={tech}
              style={{
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 600,
                background: 'var(--bg-subtle)',
                color: 'var(--text-faint)',
                border: '1px solid var(--border)',
              }}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Metrics grid */}
        {((project.metrics || meta.metrics) || []).length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              padding: '16px',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}
          >
            {(project.metrics || meta.metrics || []).map((m) => (
              <div key={m.label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-tech)',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--text)',
                    lineHeight: 1.1,
                  }}
                >
                  {m.value}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-tech)',
                    fontSize: '9px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--text-faint)',
                    marginTop: '3px',
                  }}
                >
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action button */}
        <Link
          to={`/documentacion/${project.slug}`}
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent)',
            color: '#fff',
            fontFamily: 'var(--font-tech)',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            letterSpacing: '0.03em',
            transition: 'background 0.2s ease, transform 0.1s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          Leer documentación →
        </Link>
      </div>
    </article>
  )
}

// ─── ChapterSection ────────────────────────────────────────────────────────────
function ChapterSection({ chapter, chapterProjects, chapterNum, totalChapters }) {
  return (
    <section id={chapter.id} style={{ marginBottom: '80px' }}>
      {/* Chapter header */}
      <div
        data-anim="fade-up"
        style={{
          opacity: 0,
          transform: 'translateY(28px)',
          borderTop: `2px solid ${chapter.color}`,
          paddingTop: '32px',
          marginBottom: '40px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
            margin: '0 0 12px',
          }}
        >
          {String(chapterNum).padStart(2, '0')} / {String(totalChapters).padStart(2, '0')}
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-hero)',
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text)',
            margin: '0 0 12px',
            lineHeight: 1.1,
          }}
        >
          {chapter.title}
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            color: 'var(--text-muted)',
            margin: 0,
            maxWidth: '600px',
          }}
        >
          {chapter.blurb}
        </p>
      </div>

      {/* Project entries */}
      {chapterProjects.map((project, i) => (
        <EntryCard key={project.slug} project={project} index={i} />
      ))}
    </section>
  )
}

// ─── ChapterRail ───────────────────────────────────────────────────────────────
function ChapterRail({ chapters, activeChapter, scrollProgress, projectsByChapter }) {
  return (
    <aside
      style={{
        position: 'sticky',
        top: 'calc(var(--nav-height) + 32px)',
        height: 'fit-content',
        paddingRight: '16px',
      }}
      className="hidden lg:block"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {chapters.map((ch) => {
          const isActive = activeChapter === ch.id
          const count = (projectsByChapter[ch.id] || []).length
          return (
            <a
              key={ch.id}
              href={`#${ch.id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(ch.id)?.scrollIntoView({ behavior: 'smooth' })
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                background: isActive ? 'var(--bg-subtle)' : 'transparent',
                borderLeft: `3px solid ${isActive ? ch.color : 'transparent'}`,
                transition: 'background 0.2s, border-color 0.2s',
                position: 'relative',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-tech)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--text)' : 'var(--text-muted)',
                  flex: 1,
                  letterSpacing: '0.02em',
                }}
              >
                {ch.label}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--text-faint)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-full)',
                  padding: '2px 7px',
                }}
              >
                {count}
              </span>
            </a>
          )
        })}
      </div>

      {/* Scroll progress bar */}
      <div
        style={{
          marginTop: '20px',
          padding: '0 14px',
        }}
      >
        <div
          style={{
            height: '3px',
            background: 'var(--border)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${scrollProgress}%`,
              background: 'linear-gradient(90deg, var(--brand-orange), var(--brand-purple))',
              borderRadius: '2px',
              transition: 'width 0.1s linear',
            }}
          />
        </div>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            color: 'var(--text-faint)',
            margin: '6px 0 0',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {Math.round(scrollProgress)}% leído
        </p>
      </div>
    </aside>
  )
}

// ─── SearchOverlay ─────────────────────────────────────────────────────────────
function SearchOverlay({ isOpen, onClose, allProjects }) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef(null)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return allProjects.filter((p) => {
      const meta = CHAPTER_META[p.slug] || {}
      return (
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        (p.blurb || meta.blurb || '').toLowerCase().includes(q) ||
        p.technologies.some((t) => t.toLowerCase().includes(q)) ||
        (p.kicker || meta.kicker || '').toLowerCase().includes(q) ||
        (p.chapter || '').toLowerCase().includes(q)
      )
    })
  }, [query, allProjects])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60)
      setQuery('')
      setCursor(0)
    }
  }, [isOpen])

  useEffect(() => {
    setCursor(0)
  }, [results.length])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)) }
      if (e.key === 'Enter' && results[cursor]) {
        window.location.href = `/documentacion/${results[cursor].slug}`
        onClose()
      }
    },
    [results, cursor, onClose]
  )

  if (!isOpen) return null

  const grouped = CHAPTERS.map((ch) => ({
    chapter: ch,
    items: results.filter((p) => CHAPTER_BY_NAME[p.chapter] === ch.id),
  })).filter((g) => g.items.length > 0)

  let flatIndex = 0

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          margin: '0 24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar proyectos, tecnologías…"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              color: 'var(--text)',
            }}
          />
          <kbd
            onClick={onClose}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-faint)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '2px 7px',
              cursor: 'pointer',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
          {query.trim() === '' && (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-faint)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
              Escribe para buscar proyectos
            </div>
          )}
          {query.trim() !== '' && results.length === 0 && (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-faint)', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
              Sin resultados para "{query}"
            </div>
          )}
          {grouped.map(({ chapter, items }) => (
            <div key={chapter.id}>
              <div
                style={{
                  padding: '8px 20px 4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: chapter.color,
                }}
              >
                {chapter.label}
              </div>
              {items.map((p) => {
                const idx = flatIndex++
                const isActive = idx === cursor
                const meta = CHAPTER_META[p.slug] || {}
                const kicker = p.kicker || meta.kicker || p.chapter || ''
                const blurb = p.blurb || meta.blurb || p.description || ''
                return (
                  <Link
                    key={p.slug}
                    to={`/documentacion/${p.slug}`}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px 24px',
                      textDecoration: 'none',
                      background: isActive ? 'var(--bg-subtle)' : 'transparent',
                      borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                      transition: 'background 0.1s',
                    }}
                  >
                    {/* Cover thumbnail */}
                    <div
                      style={{
                        width: '72px',
                        height: '52px',
                        borderRadius: '8px',
                        background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientVia || p.gradientFrom}, ${p.gradientTo})`,
                        flexShrink: 0,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={`/projects/${p.slug}/cover.jpg`}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    </div>
                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-tech)', fontSize: '15px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.shortTitle || p.title}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {kicker && <span style={{ color: chapter.color, fontWeight: 600, marginRight: '6px' }}>{kicker}</span>}
                        {blurb.slice(0, 80)}{blurb.length > 80 ? '…' : ''}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Documentacion (main page) ─────────────────────────────────────────────────
export default function Documentacion() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeChapter, setActiveChapter] = useState(CHAPTERS[0].id)
  const [scrollProgress, setScrollProgress] = useState(0)
  const bodyRef = useRef(null)

  // Group projects by chapter, preserving order
  const projectsByChapter = useMemo(() => {
    const map = {}
    for (const ch of CHAPTERS) map[ch.id] = []
    for (const p of projects) {
      const chId = CHAPTER_BY_NAME[p.chapter]
      if (chId && map[chId]) map[chId].push(p)
    }
    return map
  }, [])

  const totalProjects = useMemo(
    () => Object.values(projectsByChapter).reduce((acc, arr) => acc + arr.length, 0),
    [projectsByChapter]
  )

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Scroll progress
  useEffect(() => {
    const update = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setScrollProgress(total > 0 ? (scrolled / total) * 100 : 0)
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  // GSAP: scroll reveals + active chapter detection
  useGSAP(() => {
    // Fade-up reveals
    const elements = document.querySelectorAll('[data-anim="fade-up"]')
    elements.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: 'power2.out',
          })
        },
      })
    })

    // Active chapter detection
    CHAPTERS.forEach((ch) => {
      const section = document.getElementById(ch.id)
      if (!section) return
      ScrollTrigger.create({
        trigger: section,
        start: 'top 40%',
        end: 'bottom 40%',
        onToggle: (self) => {
          if (self.isActive) setActiveChapter(ch.id)
        },
      })
    })

    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, { scope: bodyRef })

  return (
    <>
      {/* Search trigger — floating top right */}
      <button
        onClick={() => setSearchOpen(true)}
        style={{
          position: 'fixed',
          top: 'calc(var(--nav-height) + 16px)',
          right: 'var(--page-px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-tech)',
          fontSize: '13px',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-card)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        Buscar…
        <kbd
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '1px 5px',
          }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Hero */}
      <section
        className="docs-hero"
        style={{
          padding: '120px var(--page-px) 100px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gradient background */}
        <div
          className="dark:hidden absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(115deg, rgba(254,112,0,0.13) 0%, rgba(154,78,251,0.07) 35%, transparent 70%)' }}
        />
        <div
          className="hidden dark:block absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(115deg, rgba(254,112,0,0.18) 0%, rgba(154,78,251,0.10) 35%, transparent 70%)' }}
        />

        <div
          className="docs-hero-inner relative"
          style={{
            maxWidth: 'var(--max-width)',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: '80px',
            alignItems: 'center',
          }}
        >
          {/* Left: headline */}
          <div>
            {/* Kicker */}
            <p
              style={{
                fontFamily: 'var(--font-tech)',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.22em',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                margin: '0 0 24px',
              }}
            >
              <span style={{ width: '24px', height: '1px', background: 'var(--accent)', flexShrink: 0 }} />
              Documentación · H3nky
            </p>

            {/* H1 with gradient */}
            <h1
              style={{
                fontFamily: 'var(--font-hero)',
                fontSize: 'clamp(40px, 6vw, 80px)',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                lineHeight: 1,
                margin: '0 0 28px',
                background: 'linear-gradient(135deg, var(--brand-orange) 0%, var(--brand-purple) 50%, var(--brand-green) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              KNOWLEDGE BASE
            </h1>

            {/* Lede */}
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(15px, 1.4vw, 18px)',
                color: 'var(--text-muted)',
                lineHeight: 1.7,
                margin: '0 0 40px',
                maxWidth: '520px',
              }}
            >
              Cuatro capítulos. Apps en uso real, la web que estás leyendo, el setup con IA detrás de todo y la infraestructura que lo mantiene en producción.
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              {[
                { value: String(totalProjects), label: 'Proyectos' },
                { value: String(CHAPTERS.length), label: 'Capítulos' },
                { value: '100%', label: 'Documentados' },
                { value: '1', label: 'Repositorio' },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    style={{
                      fontFamily: 'var(--font-hero)',
                      fontSize: 'clamp(28px, 3vw, 40px)',
                      fontWeight: 800,
                      color: 'var(--text)',
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-tech)',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: 'var(--text-faint)',
                      marginTop: '4px',
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: TOC card */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Triple gradient border-top */}
            <div
              style={{
                height: '3px',
                background: 'linear-gradient(90deg, var(--brand-orange), var(--brand-purple), var(--brand-green))',
              }}
            />

            <div style={{ padding: '24px' }}>
              <p
                style={{
                  fontFamily: 'var(--font-tech)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: 'var(--text-faint)',
                  margin: '0 0 16px',
                }}
              >
                Índice
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {CHAPTERS.map((ch, i) => {
                  const count = (projectsByChapter[ch.id] || []).length
                  return (
                    <a
                      key={ch.id}
                      href={`#${ch.id}`}
                      onClick={(e) => {
                        e.preventDefault()
                        document.getElementById(ch.id)?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        textDecoration: 'none',
                        background: 'transparent',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: ch.color,
                          opacity: 0.8,
                          minWidth: '24px',
                        }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-tech)',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: 'var(--text)',
                          flex: 1,
                        }}
                      >
                        {ch.label}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '10px',
                          color: 'var(--text-faint)',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-full)',
                          padding: '2px 7px',
                        }}
                      >
                        {count}
                      </span>
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body: rail + chapters */}
      <div
        ref={bodyRef}
        className="docs-body"
        style={{
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
          padding: '80px var(--page-px) 120px',
          display: 'grid',
          gridTemplateColumns: 'var(--docs-grid-cols, 1fr)',
          gap: '64px',
          alignItems: 'start',
        }}
      >
        <ChapterRail
          chapters={CHAPTERS}
          activeChapter={activeChapter}
          scrollProgress={scrollProgress}
          projectsByChapter={projectsByChapter}
        />

        {/* Chapter sections */}
        <div>
          {CHAPTERS.map((ch, i) => (
            <ChapterSection
              key={ch.id}
              chapter={ch}
              chapterProjects={projectsByChapter[ch.id] || []}
              chapterNum={i + 1}
              totalChapters={CHAPTERS.length}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '32px var(--page-px)',
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-faint)',
            letterSpacing: '0.08em',
            textAlign: 'center',
          }}
        >
          H3nky · Knowledge Base · {totalProjects} proyectos · {CHAPTERS.length} capítulos
        </p>
      </footer>

      {/* Search overlay */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        allProjects={projects}
      />
    </>
  )
}
