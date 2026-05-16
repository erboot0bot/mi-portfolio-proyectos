import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { initDemoData, demoRead } from '../data/demo/index.js'
import { getDemoTodayItems, getActiveItem } from '../data/demo/getDemoTodayItems.js'

const MONTHLY_BUDGET = 2750

;['hogar', 'personal', 'finanzas', 'ocio'].forEach(initDemoData)

// ── Module cards config ───────────────────────────────────────────
const MODULE_CARDS = [
  { type: 'hogar',    label: 'Hogar',    icon: '🏠', color: '#ff8a1f', sub: 'Gestión del hogar y cocina',      tags: ['Menú', 'Lista', 'Nevera'],           href: '/demo/hogar',     version: 'v0.4.0' },
  { type: 'personal', label: 'Personal', icon: '👤', color: '#9a4efb', sub: 'Tareas, notas y objetivos',        tags: ['Tareas', 'Notas', 'Hábitos'],        href: '/demo/personal',  version: 'v1.2.0' },
  { type: 'ocio',     label: 'Ocio',     icon: '🎭', color: '#a855f7', sub: 'Restaurantes, viajes y eventos',   tags: ['Viajes', 'Eventos', 'Resto.'],       href: '/demo/ocio',      version: 'v0.1.0' },
  { type: 'finanzas', label: 'Finanzas', icon: '💰', color: '#1f8a5b', sub: 'Gastos, ingresos y presupuestos',  tags: ['Gastos', 'Presupuestos', 'Seguros'], href: '/demo/finanzas',  version: 'v0.3.0' },
  { type: 'settings', label: 'Ajustes',  icon: '⚙️', color: '#64748b', sub: 'Configuración del sistema',       tags: ['Perfil', 'Notif.', 'Privacidad'],    href: '/demo/settings',  version: 'v1.0.0' },
]

const RECENT_ACTIVITY = [
  { icon: '💰', iconBg: 'rgba(34,197,94,0.12)',  iconColor: '#22c55e', title: 'Ingreso mensual',   sub: '+2.750 € · Nómina',        time: 'Hace 2h' },
  { icon: '🛒', iconBg: 'rgba(239,68,68,0.12)',  iconColor: '#ef4444', title: 'Compra Mercadona',  sub: '-42 € · 18 productos',     time: 'Hoy 10:32' },
  { icon: '📋', iconBg: 'rgba(154,78,251,0.12)', iconColor: '#9a4efb', title: 'Sprint review',     sub: 'Personal · Tarea cerrada', time: 'Ayer' },
  { icon: '📝', iconBg: 'rgba(42,111,219,0.12)', iconColor: '#2a6fdb', title: 'Nueva nota',        sub: 'Personal · Ideas proyecto', time: 'Ayer' },
]

const SPARKLINE_PTS = [40, 55, 48, 62, 51, 70, 58, 72, 65, 80]

// ── Sparkline SVG ─────────────────────────────────────────────────
function Sparkline({ pts, color = '#16a34a', width = 100, height = 40 }) {
  const max = Math.max(...pts), min = Math.min(...pts), range = max - min || 1
  const step = width / (pts.length - 1)
  const toY = v => height - ((v - min) / range) * (height - 4) - 2
  const points = pts.map((v, i) => `${i * step},${toY(v)}`).join(' ')
  const areaPoints = `0,${height} ${points} ${(pts.length - 1) * step},${height}`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible', flexShrink: 0 }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#sparkGrad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(pts.length - 1) * step} cy={toY(pts[pts.length - 1])} r="3" fill={color} />
    </svg>
  )
}

// ── ModuleCard ────────────────────────────────────────────────────
function ModuleCard({ card, liveStats }) {
  return (
    <Link
      to={card.href}
      style={{
        display: 'block', textDecoration: 'none',
        background: 'var(--bg-card)', borderRadius: 14,
        border: '1px solid var(--border)', borderTop: `4px solid ${card.color}`,
        overflow: 'hidden',
        transition: 'border-color 200ms ease-out, box-shadow 200ms ease-out, transform 200ms ease-out',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = `0 4px 20px ${card.color}22`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${card.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{card.icon}</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{card.label}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>{card.sub}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
            <div style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>{card.version}</div>
            <div style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: 'rgba(34,197,94,0.1)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)', display: 'inline-block', marginTop: 3, fontWeight: 600 }}>Activo</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          {card.tags.map(t => (
            <span key={t} style={{ fontSize: 11.5, padding: '2px 9px', borderRadius: 999, background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{t}</span>
          ))}
        </div>
        {liveStats && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{liveStats}</div>}
        <div style={{ fontSize: 13, fontWeight: 600, color: card.color }}>Abrir →</div>
      </div>
    </Link>
  )
}

// ── Desktop layout ────────────────────────────────────────────────
function DesktopLayout({ data }) {
  const {
    now,
    todayItems, activeItem,
    hogarEvents, shoppingItems, personalNotes, personalEvents,
    transactions, ocioRestaurantes, ocioViajes,
  } = data

  const [showShortcuts, setShowShortcuts] = useState(false)

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'
  const eventsCount = todayItems.length

  // Month expense calculation
  const monthStart = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth(), 1)
    return d
  }, [now])

  const monthExpense = useMemo(() =>
    transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= monthStart)
      .reduce((s, t) => s + t.amount, 0)
  , [transactions, monthStart])

  const budgetPct = Math.min(100, (monthExpense / MONTHLY_BUDGET) * 100)

  const totalIncome = useMemo(() =>
    transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  , [transactions])

  // Live stats for module cards
  const hogarTasksToday = useMemo(() => hogarEvents.filter(e => {
    const d = new Date(e.start_time)
    return d.getFullYear() === now.getFullYear()
      && d.getMonth() === now.getMonth()
      && d.getDate() === now.getDate()
  }).length, [hogarEvents, now])

  const pendingItems = useMemo(() => shoppingItems.filter(i => !i.checked).length, [shoppingItems])

  const liveStats = {
    hogar: `${hogarTasksToday} tareas hoy · ${pendingItems} en lista`,
    personal: `${personalEvents.length} eventos · ${personalNotes.length} notas`,
    ocio: `${ocioRestaurantes.filter(r => r.visitas?.length > 0).length} restaurantes · ${ocioViajes.filter(v => v.estado === 'planificado').length} viajes`,
    finanzas: `${monthExpense.toFixed(0)}€ / ${MONTHLY_BUDGET.toLocaleString('es-ES')}€ este mes`,
    settings: null,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)', overflow: 'hidden' }}>

      <style>{`
        @keyframes dh-up {
          from { opacity: 0; transform: translateY(12px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: .9 }
          100% { transform: scale(2.4); opacity: 0 }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
        .dh-nav-link {
          font-size: 14px;
          color: var(--text-muted);
          text-decoration: none;
          padding: 4px 2px;
          transition: color 0.15s;
          white-space: nowrap;
        }
        .dh-nav-link:hover { color: var(--text); }
        .dh-nav-link.active {
          color: var(--accent);
          border-bottom: 2px solid var(--accent);
          font-weight: 600;
        }
      `}</style>

      {/* ── Top Nav (64px sticky) ── */}
      <nav style={{
        height: 64, flexShrink: 0,
        backdropFilter: 'blur(12px)',
        background: 'var(--nav-bg, rgba(255,252,249,0.88))',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        padding: '0 clamp(1.5rem, 4vw, 4rem)',
        gap: 32, position: 'sticky', top: 0, zIndex: 50,
      }}>
        {/* Brand */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <img src="/logo-horizontal.png" height={34} alt="H3nky" style={{ display: 'block' }} />
        </Link>

        {/* Center nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1, justifyContent: 'center' }}>
          {[
            { to: '/',          label: 'Inicio' },
            { to: '/documentacion', label: 'Documentación' },
            { to: '/apps',          label: 'Apps' },
            { to: '/demo',          label: 'Demo' },
            { to: '/store',         label: 'Tienda' },
            { to: '/contact',       label: 'Contacto' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/demo' || to === '/'}
              className={({ isActive }) => `dh-nav-link${isActive ? ' active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
          {/* GitHub */}
          <a href="https://github.com/H3nky" target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            GitHub
          </a>

          {/* Language */}
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>ES</span>
            {' | '}
            <span>EN</span>
          </div>

          {/* Avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #334155, #1e293b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 14, fontWeight: 700, flexShrink: 0,
            cursor: 'pointer',
          }}>
            E
          </div>
        </div>
      </nav>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: 24,
          padding: 'clamp(1.5rem, 4vw, 4rem)',
          maxWidth: 1600,
          margin: '0 auto',
          alignItems: 'start',
        }}>

          {/* ── Left column ── */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* Greeting row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 230px 230px', gap: 16, animation: 'dh-up 0.45s cubic-bezier(.2,.7,.2,1) both' }}>

              {/* Greeting */}
              <div>
                <div style={{
                  fontSize: 12, fontFamily: 'var(--font-tech)', color: 'var(--text-muted)',
                  letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6,
                }}>
                  {format(now, "EEEE, d 'de' MMMM", { locale: es })} ☀️
                </div>
                <h1 style={{
                  fontSize: 'clamp(24px, 3vw, 30px)', fontWeight: 800, lineHeight: 1.2,
                  color: 'var(--text)', margin: '0 0 10px', letterSpacing: '-0.01em',
                  fontFamily: 'var(--font-body)',
                }}>
                  {greeting}, <span style={{ color: 'var(--accent)' }}>Eric.</span>
                </h1>
                <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 18, maxWidth: 340 }}>
                  Tienes{' '}
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>{eventsCount} evento{eventsCount !== 1 ? 's' : ''}</span>{' '}
                  en marcha.{activeItem && (
                    <> <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{activeItem.title}</span> está activa ahora.</>
                  )}
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowShortcuts(v => !v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px',
                      background: 'var(--accent)', border: 'none', borderRadius: 9,
                      color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'var(--font-body)', transition: 'opacity 0.15s',
                    }}
                  >
                    ⚡ Acción rápida
                  </button>
                  {showShortcuts && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, marginTop: 8,
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '10px 14px', zIndex: 20,
                      minWidth: 200, boxShadow: 'var(--shadow-dropdown)',
                    }}>
                      {[
                        ['G', 'Ir a Hogar'],
                        ['N', 'Nueva nota'],
                        ['T', 'Nueva tarea'],
                        ['L', 'Añadir a lista'],
                        ['R', 'Ver recetas'],
                      ].map(([k, label]) => (
                        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', fontSize: 12, color: 'var(--text-muted)' }}>
                          <kbd style={{ fontSize: 10, padding: '2px 6px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 4, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{k}</kbd>
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                  <button type="button" style={{
                    display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px',
                    background: 'transparent', border: '1px solid var(--border)', borderRadius: 9,
                    color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer',
                    fontFamily: 'var(--font-body)', transition: 'border-color 0.15s, color 0.15s',
                  }}>
                    ＋ Añadir evento
                  </button>
                </div>
              </div>

              {/* Stat: Gasto del mes */}
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14,
                padding: 18, display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Gasto del mes</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', lineHeight: 1, fontFamily: 'var(--font-hero)' }}>
                  {monthExpense.toFixed(0)}<span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 600 }}>€</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-subtle)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${budgetPct}%`,
                    background: 'linear-gradient(90deg, var(--accent), #ff8c33)',
                    borderRadius: 999, transition: 'width 0.6s ease',
                  }} />
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>
                  {budgetPct.toFixed(0)}% del presupuesto mensual
                </div>
              </div>

              {/* Stat: Saldo total */}
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14,
                padding: 18, display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Saldo total</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#16a34a', lineHeight: 1, fontFamily: 'var(--font-hero)' }}>
                    {totalIncome.toFixed(0)}<span style={{ fontSize: 16, fontWeight: 600 }}>€</span>
                  </div>
                  <Sparkline pts={SPARKLINE_PTS} color="#16a34a" width={90} height={38} />
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>
                  Actualizado hoy · +4,2% · 7d
                </div>
              </div>
            </div>

            {/* Tu universo */}
            <div style={{ animation: 'dh-up 0.45s cubic-bezier(.2,.7,.2,1) 0.08s both' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Tu universo</span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>5 apps · DEMO</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {MODULE_CARDS.map((card, i) => (
                  <div key={card.type} style={{ animation: `dh-up 0.45s cubic-bezier(.2,.7,.2,1) ${0.08 + i * 0.04}s both` }}>
                    <ModuleCard card={card} liveStats={liveStats[card.type]} />
                  </div>
                ))}
              </div>
            </div>

            {/* Actividad reciente */}
            <div style={{ animation: 'dh-up 0.45s cubic-bezier(.2,.7,.2,1) 0.28s both' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>Actividad reciente</span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>Últimas 24h</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {RECENT_ACTIVITY.map((act, i) => (
                  <div key={act.title} style={{
                    padding: 14, background: 'var(--bg-card)', borderRadius: 12,
                    border: '1px solid var(--border)',
                    animation: `dh-up 0.45s cubic-bezier(.2,.7,.2,1) ${0.28 + i * 0.04}s both`,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9,
                      background: act.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, marginBottom: 10,
                    }}>
                      {act.icon}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{act.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{act.sub}</div>
                    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>{act.time}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Right rail ── */}
          <aside style={{
            position: 'sticky', top: 88,
            maxHeight: 'calc(100dvh - 120px)', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>

            {/* Tu día card */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14,
              display: 'flex', flexDirection: 'column',
              animation: 'dh-up 0.45s cubic-bezier(.2,.7,.2,1) 0.12s both',
            }}>
              {/* Header */}
              <div style={{ padding: '18px 18px 12px' }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-tech)', color: 'var(--text-faint)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 2 }}>TU DÍA</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{eventsCount} evento{eventsCount !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Timeline */}
              <div style={{ padding: '0 12px 16px' }}>
                {todayItems.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--text-faint)', padding: '4px 6px' }}>Sin eventos hoy</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {todayItems.map((item, i) => {
                      const isActive = item.id === activeItem?.id
                      return (
                        <div key={item.id} style={{
                          display: 'grid', gridTemplateColumns: '56px 1fr',
                          padding: '9px 8px',
                          background: isActive
                            ? `linear-gradient(90deg, ${item.appColor}18, transparent)`
                            : 'transparent',
                          borderRadius: 8,
                          borderLeft: isActive ? `3px solid ${item.appColor}` : '3px solid transparent',
                          position: 'relative',
                          animation: `dh-up 0.3s cubic-bezier(.2,.7,.2,1) ${i * 0.04}s both`,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {isActive && (
                              <div style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
                                <div style={{
                                  position: 'absolute', inset: 0, borderRadius: '50%',
                                  background: item.appColor, animation: 'pulse-ring 1.2s ease-out infinite',
                                }} />
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.appColor, position: 'relative', zIndex: 1 }} />
                              </div>
                            )}
                            <span style={{
                              fontSize: 12.5, fontFamily: 'var(--font-mono)',
                              color: isActive ? item.appColor : 'var(--text-muted)',
                              fontWeight: isActive ? 700 : 400,
                            }}>
                              {isActive ? 'AHORA' : item.allDay ? 'todo' : format(new Date(item.time), 'HH:mm')}
                            </span>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.title}
                            </div>
                            <span style={{
                              fontSize: 10, fontWeight: 700, letterSpacing: '0.5px',
                              color: item.appColor, fontFamily: 'var(--font-mono)',
                              padding: '1px 6px', background: `${item.appColor}18`, borderRadius: 999,
                            }}>
                              {item.appLabel}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* IA asistente card */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14,
              padding: 18,
              animation: 'dh-up 0.45s cubic-bezier(.2,.7,.2,1) 0.2s both',
            }}>
              <div style={{
                background: 'rgba(154,78,251,0.08)', borderRadius: 10, padding: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ position: 'relative', width: 8, height: 8 }}>
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      background: '#9a4efb', animation: 'pulse-ring 1.6s ease-out infinite',
                    }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9a4efb', position: 'relative', zIndex: 1 }} />
                  </div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#9a4efb', letterSpacing: '0.14em', fontWeight: 700, textTransform: 'uppercase' }}>✦ IA Asistente</div>
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 12 }}>
                  Detectamos que gastas un 18% más los jueves por gasolina. ¿Reagendar la revisión del Golf al sábado?
                </p>
                <button type="button" style={{
                  fontSize: 12, fontWeight: 600, color: '#9a4efb',
                  background: 'transparent', border: '1px solid rgba(154,78,251,0.3)', borderRadius: 7,
                  cursor: 'pointer', padding: '6px 12px', fontFamily: 'var(--font-body)',
                  transition: 'background 0.15s',
                }}>
                  Aplicar sugerencia →
                </button>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  )
}

// ── Mobile layout ─────────────────────────────────────────────────
function MobileLayout({ data }) {
  const {
    now, dayNum, dayLabel, monthLabel, year,
    todayItems, activeItem, hogarEvents, shoppingItems,
    personalNotes, personalEvents, transactions, ocioRestaurantes, ocioViajes,
  } = data

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthExpense = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= monthStart)
    .reduce((s, t) => s + t.amount, 0)

  const hogarTasksToday = hogarEvents.filter(e => {
    const d = new Date(e.start_time)
    return d.getFullYear() === now.getFullYear()
      && d.getMonth() === now.getMonth()
      && d.getDate() === now.getDate()
  }).length
  const pendingItems = shoppingItems.filter(i => !i.checked).length

  const liveStats = {
    hogar: `${hogarTasksToday} tareas hoy · ${pendingItems} en lista`,
    personal: `${personalEvents.length} eventos · ${personalNotes.length} notas`,
    ocio: `${ocioRestaurantes.filter(r => r.visitas?.length > 0).length} restaurantes · ${ocioViajes.filter(v => v.estado === 'planificado').length} viajes`,
    finanzas: `${monthExpense.toFixed(0)}€ / ${MONTHLY_BUDGET.toLocaleString('es-ES')}€ este mes`,
    settings: null,
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 20px 56px', fontFamily: 'var(--font-body)' }}>
      <style>{`
        @keyframes dh-up { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: .9 }
          100% { transform: scale(2.4); opacity: 0 }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Greeting */}
      <div style={{ marginBottom: 24, animation: 'dh-up 0.4s ease both' }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-tech)', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
          {dayLabel} · {dayNum} {monthLabel.slice(0, 3)} {year}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', margin: '0 0 6px' }}>
          {greeting}, <span style={{ color: 'var(--accent)' }}>Eric.</span>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
          {todayItems.length} evento{todayItems.length !== 1 ? 's' : ''} en marcha hoy.
        </p>
      </div>

      {/* Tu universo */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>Tu universo</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {MODULE_CARDS.map((card, i) => (
            <div key={card.type} style={{ animation: `dh-up 0.35s ease ${i * 0.05}s both` }}>
              <Link
                to={card.href}
                style={{
                  display: 'block', textDecoration: 'none', padding: '14px',
                  background: 'var(--bg-card)', borderRadius: 12,
                  border: '1px solid var(--border)', borderTop: `4px solid ${card.color}`,
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{card.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{card.label}</div>
                {liveStats[card.type] && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{liveStats[card.type]}</div>
                )}
                <div style={{ fontSize: 12, fontWeight: 600, color: card.color, marginTop: 8 }}>Abrir →</div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Tu día */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--text-faint)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
          TU DÍA · {todayItems.length} ITEMS
        </div>
        {todayItems.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-faint)', padding: '8px 0' }}>Sin eventos hoy</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {todayItems.map((item, i) => {
              const isActive = item.id === activeItem?.id
              return (
                <div key={item.id} style={{
                  padding: '10px 12px', background: isActive
                    ? `color-mix(in srgb, ${item.appColor} 10%, var(--bg-card))` : 'var(--bg-card)',
                  borderRadius: 8, borderLeft: `3px solid ${item.appColor}`,
                  animation: `dh-up 0.35s ease ${i * 0.04}s both`,
                }}>
                  <div style={{ fontSize: 10, marginBottom: 2, color: isActive ? item.appColor : 'var(--text-muted)', fontWeight: isActive ? 700 : 400, fontFamily: 'var(--font-mono)' }}>
                    {isActive ? '● AHORA' : item.allDay ? 'Todo el día' : format(new Date(item.time), 'HH:mm')}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? item.appColor : 'var(--text)', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.5px', color: item.appColor, opacity: 0.85, fontFamily: 'var(--font-mono)' }}>{item.appLabel}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────
export default function DemoHome() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const [now] = useState(() => new Date())
  const dayLabel   = format(now, 'EEE', { locale: es }).toUpperCase()
  const dayNum     = format(now, 'd')
  const monthLabel = format(now, 'MMMM', { locale: es }).toUpperCase()
  const year       = format(now, 'yyyy')

  const hogarEvents      = useMemo(() => demoRead('hogar', 'events'), [])
  const shoppingItems    = useMemo(() => demoRead('hogar', 'items_supermercado'), [])
  const personalEvents   = useMemo(() => demoRead('personal', 'events'), [])
  const personalNotes    = useMemo(() => demoRead('personal', 'personal_notes'), [])
  const transactions     = useMemo(() => demoRead('finanzas', 'fin_transactions'), [])
  const ocioRestaurantes = useMemo(() => demoRead('ocio', 'restaurantes'), [])
  const ocioViajes       = useMemo(() => demoRead('ocio', 'viajes'), [])

  const todayItems = useMemo(() => getDemoTodayItems(), [])
  const activeItem = useMemo(() => getActiveItem(todayItems), [todayItems])

  const sharedData = {
    now, dayNum, dayLabel, monthLabel, year,
    todayItems, activeItem,
    hogarEvents, shoppingItems, personalNotes, personalEvents,
    transactions, ocioRestaurantes, ocioViajes,
  }

  return isMobile
    ? <MobileLayout data={sharedData} />
    : <DesktopLayout data={sharedData} />
}
