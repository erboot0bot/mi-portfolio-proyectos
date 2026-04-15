/*
 * Layout.jsx — shell wrapper for all pages
 *
 * Theme: class-based light/dark on <html>. Persists to localStorage.
 * Default: light mode. Toggle button in nav (sun/moon icon).
 */

import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

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

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const location = useLocation()

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
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? 'text-[var(--accent)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] transition-colors'
              }
            >
              Proyectos
            </NavLink>
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
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? 'text-[var(--accent)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] transition-colors'
              }
            >
              Proyectos
            </NavLink>
            <a
              href="https://github.com/H3nky"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              GitHub
            </a>
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
