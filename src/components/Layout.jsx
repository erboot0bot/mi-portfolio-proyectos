import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LanguageContext'
import { projects } from '../data/projects'

gsap.registerPlugin(ScrollTrigger)

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  )
}

function UserAvatar({ user, onSignOut }) {
  const [open, setOpen] = useState(false)
  const initials = user.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-full bg-[var(--accent)] text-white text-xs font-bold
          flex items-center justify-center hover:opacity-80 transition-opacity overflow-hidden"
        aria-label="Menú de usuario"
      >
        {user.user_metadata?.avatar_url
          ? <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
          : initials
        }
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 w-48 rounded-xl border border-[var(--border)]
            bg-[var(--bg-card)] shadow-lg py-1 z-50">
            <p className="px-4 py-2 text-xs text-[var(--text-faint)] truncate">{user.email}</p>
            <hr className="border-[var(--border)] my-1" />
            <button
              onClick={() => { onSignOut(); setOpen(false) }}
              className="w-full text-left px-4 py-2 text-sm text-[var(--text-muted)]
                hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { lang, setLang, t } = useLang()
  const headerRef = useRef(null)

  useGSAP(() => {
    const header = headerRef.current
    if (!header) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    ScrollTrigger.create({
      start: 'top top-=64',
      onEnter: () => gsap.to(header, {
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        duration: 0.3,
        ease: 'power2.out',
        overwrite: true,
      }),
      onLeaveBack: () => gsap.to(header, {
        boxShadow: '0 0px 0px rgba(0,0,0,0)',
        duration: 0.3,
        ease: 'power2.out',
        overwrite: true,
      }),
    })
  }, { scope: headerRef })

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved ? saved === 'dark' : prefersDark
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'text-[var(--accent)] font-semibold'
      : 'text-[var(--text-muted)] hover:text-[var(--text)] transition-colors'

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <header ref={headerRef} className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="font-bold text-lg tracking-tight text-[var(--text)] hover:text-[var(--accent)] transition-colors"
          >
            H3nky
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <NavLink to="/" className={navLinkClass}>Inicio</NavLink>
            <NavLink to="/projects" className={navLinkClass}>{t('documentation')}</NavLink>
            <NavLink to="/apps" className={navLinkClass}>Apps</NavLink>
            <NavLink to="/lab" className={navLinkClass}>Lab</NavLink>
            <NavLink to="/courses" className={navLinkClass}>Cursos</NavLink>
            <NavLink to="/store" className={navLinkClass}>Tienda</NavLink>
            <NavLink to="/contact" className={navLinkClass}>Contacto</NavLink>
            <a
              href="https://github.com/H3nky"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              GitHub
            </a>
            <div className="flex items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => setLang('es')}
                className={lang === 'es' ? 'text-[var(--accent)]' : 'text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors'}
              >ES</button>
              <span className="text-[var(--border)]">|</span>
              <button
                onClick={() => setLang('en')}
                className={lang === 'en' ? 'text-[var(--accent)]' : 'text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors'}
              >EN</button>
            </div>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
            {user
              ? <UserAvatar user={user} onSignOut={signOut} />
              : (
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-sm
                    font-medium hover:opacity-90 transition-opacity"
                >
                  Entrar
                </Link>
              )
            }
          </nav>

          {/* Mobile: theme toggle + hamburger */}
          <div className="sm:hidden flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              aria-label={dark ? 'Modo claro' : 'Modo oscuro'}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
            >
              <span className="block w-5 h-0.5 bg-current mb-1.5" />
              <span className="block w-5 h-0.5 bg-current mb-1.5" />
              <span className="block w-5 h-0.5 bg-current" />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden border-t border-[var(--border)] bg-[var(--bg)] px-4 py-4 flex flex-col gap-4 text-sm">
            <NavLink to="/" className={navLinkClass}>Inicio</NavLink>
            <NavLink to="/projects" className={navLinkClass}>{t('documentation')}</NavLink>
            <NavLink to="/apps" className={navLinkClass}>Apps</NavLink>
            <NavLink to="/lab" className={navLinkClass}>Lab</NavLink>
            <NavLink to="/courses" className={navLinkClass}>Cursos</NavLink>
            <NavLink to="/store" className={navLinkClass}>Tienda</NavLink>
            <NavLink to="/contact" className={navLinkClass}>Contacto</NavLink>
            <a
              href="https://github.com/H3nky"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              GitHub
            </a>
            {user
              ? (
                <button
                  onClick={signOut}
                  className="text-left text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  Cerrar sesión ({user.email})
                </button>
              )
              : <Link to="/login" className="text-[var(--accent)] font-semibold">Entrar</Link>
            }
          </div>
        )}
      </header>

      <main className="flex-1 w-full pt-10 pb-20">
        {children}
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--bg-card)]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-10 pb-8
          grid grid-cols-1 sm:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <div className="text-xl font-black tracking-tight mb-2" style={{letterSpacing: '-0.04em'}}>
              H3nky<span style={{color: 'var(--accent)'}}>.</span>
            </div>
            <p className="text-sm text-[var(--text-faint)] leading-relaxed max-w-[260px]">
              Construyendo con IA como copiloto. Documentando cada paso del camino.
            </p>
            <a
              href="https://github.com/H3nky"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 mt-5 px-3.5 py-1.5 rounded-lg text-xs font-medium
                border border-[var(--border)] text-[var(--text-muted)]
                hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              @H3nky
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-1.5 rounded-lg text-xs font-medium
                border border-[var(--border)] text-[var(--text-muted)]
                hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
            >
              ✉️ Contacto
            </Link>
          </div>

          {/* Projects */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-faint)] mb-4">Proyectos</div>
            <ul className="flex flex-col gap-2.5">
              {projects.map(p => (
                <li key={p.slug}>
                  <Link
                    to={`/projects/${p.slug}`}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stack */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-faint)] mb-4">Construido con</div>
            <ul className="flex flex-col gap-2.5">
              {['React', 'Vite', 'Tailwind v4', 'Supabase', 'Claude AI', 'Vercel'].map(t => (
                <li key={t} className="text-sm text-[var(--text-muted)]">{t}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-4
          flex items-center justify-between">
          <span className="text-xs text-[var(--text-faint)]">© {new Date().getFullYear()} H3nky</span>
          <div className="flex items-center gap-4 text-xs text-[var(--text-faint)]">
            <a href="https://github.com/H3nky" target="_blank" rel="noreferrer"
              className="hover:text-[var(--accent)] transition-colors">GitHub</a>
            <span>mi-portfolio-proyectos-five.vercel.app</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
