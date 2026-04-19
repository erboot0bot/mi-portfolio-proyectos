import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

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
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="font-bold text-lg tracking-tight text-[var(--text)] hover:text-[var(--accent)] transition-colors"
          >
            H3nky
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <NavLink to="/" className={navLinkClass}>Proyectos</NavLink>
            <NavLink to="/hogar" className={navLinkClass}>Hogar</NavLink>
            <a
              href="https://github.com/H3nky"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              GitHub
            </a>
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
            <NavLink to="/" className={navLinkClass}>Proyectos</NavLink>
            <NavLink to="/hogar" className={navLinkClass}>Hogar</NavLink>
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

      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--text-faint)]">
        © {new Date().getFullYear()} H3nky — Construido con React + Vite + Tailwind
      </footer>
    </div>
  )
}
