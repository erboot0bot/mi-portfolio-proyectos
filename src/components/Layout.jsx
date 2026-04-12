/*
 * Layout.jsx — shell wrapper for all pages
 *
 * Structure:
 *   <header>  — logo/name + nav links + hamburger (mobile)
 *   <main>    — {children}
 *   <footer>  — copyright + links
 *
 * Mobile nav: hamburger button toggles a dropdown panel (useState).
 * Closes on route change via useEffect watching location.pathname.
 */

import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="font-semibold text-lg tracking-tight hover:text-white transition-colors"
          >
            H3nky
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-6 text-sm text-zinc-400">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'text-white' : 'hover:text-white transition-colors'
              }
            >
              Proyectos
            </NavLink>
            <a
              href="https://github.com/H3nky"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            <span className="block w-5 h-0.5 bg-current mb-1.5 transition-transform" />
            <span className="block w-5 h-0.5 bg-current mb-1.5 transition-transform" />
            <span className="block w-5 h-0.5 bg-current transition-transform" />
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-4 flex flex-col gap-4 text-sm text-zinc-400">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'text-white' : 'hover:text-white transition-colors'
              }
            >
              Proyectos
            </NavLink>
            <a
              href="https://github.com/H3nky"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
        {children}
      </main>

      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} H3nky — Construido con React + Vite + Tailwind
      </footer>
    </div>
  )
}
