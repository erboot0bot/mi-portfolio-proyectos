import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { format, differenceInMonths, startOfWeek, addDays, isSameDay, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { initDemoData, demoRead } from '../data/demo/index.js'
import { getDemoTodayItems, getActiveItem } from '../data/demo/getDemoTodayItems.js'

;['hogar', 'personal', 'finanzas'].forEach(initDemoData)

const APP_CONFIG = [
  { type: 'hogar',    label: 'HOGAR',    icon: '🏠', color: '#f97316', version: 'v0.4.0' },
  { type: 'personal', label: 'PERSONAL', icon: '👤', color: '#38bdf8', version: 'v1.2.0' },
  { type: 'finanzas', label: 'FINANZAS', icon: '💰', color: '#22c55e', version: 'v0.3.0' },
]

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const BAR_HEIGHTS = [6, 10, 8, 12, 7, 9, 11, 5]

function getAppStats(type, data) {
  const { hogarEvents, shoppingItems, personalTasks, personalNotes,
    personalEvents, transactions } = data
  switch (type) {
    case 'hogar': {
      const now = new Date()
      const tc = hogarEvents.filter(e => {
        const d = new Date(e.start_time)
        return d.getFullYear() === now.getFullYear()
          && d.getMonth() === now.getMonth()
          && d.getDate() === now.getDate()
      }).length
      const pending = shoppingItems.filter(i => !i.checked).length
      return [`${tc} tarea${tc !== 1 ? 's' : ''} hoy`, `${pending} en lista`]
    }
    case 'personal': {
      const tasks = personalTasks.filter(t => t.status !== 'done').length
      const notes = personalNotes.length
      return [`${tasks} tarea${tasks !== 1 ? 's' : ''}`, `${notes} notas`]
    }
    case 'finanzas': {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
      const total = transactions.filter(t => t.type === 'expense' && new Date(t.date) >= weekAgo)
        .reduce((s, t) => s + t.amount, 0)
      const budgets = demoRead('finanzas', 'fin_budgets').length
      return [`${total.toFixed(0)}€ esta semana`, `${budgets} presupuestos`]
    }
    default: return ['—', '']
  }
}

// ── Sidebar icon ──────────────────────────────────────────────────
function SidebarIcon({ children, active, title }) {
  return (
    <button title={title} style={{
      width: 36, height: 36, borderRadius: 8, border: 'none',
      background: active ? 'rgba(254,112,0,0.15)' : 'transparent',
      color: active ? 'var(--accent)' : 'var(--text-faint)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 16, transition: 'background 0.15s, color 0.15s',
    }}>
      {children}
    </button>
  )
}

// ── SVG icons ─────────────────────────────────────────────────────
const IconHome = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
)
const IconStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
)
const IconBell = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
)
const IconPerson = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)

// ── Sidebar app icons (SVG) ───────────────────────────────────────
const IconHogarSvg = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>
  </svg>
)
const IconPersonalSvg = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)
const IconMascotasSvg = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="4" cy="9" r="2"/>
    <path d="M12 18c-3.5 0-6-2-6-5 0-1.7 1.2-3.2 3-4 1-.4 2-.6 3-.6s2 .2 3 .6c1.8.8 3 2.3 3 4 0 3-2.5 5-6 5z"/>
    <circle cx="19" cy="15" r="2"/>
  </svg>
)
const IconVehiculoSvg = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14l4 4v4a2 2 0 01-2 2h-2"/>
    <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
    <path d="M3 11h16"/>
  </svg>
)
const IconFinanzasSvg = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
  </svg>
)
const IconSettingsSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
)

const APP_SIDEBAR_ITEMS = [
  { type: 'hogar',    label: 'Hogar',    color: '#f97316', Icon: IconHogarSvg },
  { type: 'personal', label: 'Personal',  color: '#38bdf8', Icon: IconPersonalSvg },
  { type: 'finanzas', label: 'Finanzas',  color: '#22c55e', Icon: IconFinanzasSvg },
]

// ── Desktop layout ────────────────────────────────────────────────
function DesktopLayout({ data }) {
  const {
    now, dayNum, dayLabel, monthLabel, year, weekLabel,
    weekActivity, todayItems, activeItem,
    hogarEvents, shoppingItems, personalNotes, personalEvents,
    recipes, transactions,
  } = data

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'
  const eventsCount = todayItems.length

  const weekAgo = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - 7); return d }, [])

  const dailyExpenses = useMemo(() => {
    const map = {}
    transactions.forEach(t => {
      if (t.type === 'expense') map[t.date] = (map[t.date] || 0) + t.amount
    })
    return map
  }, [transactions])
  const weeklyExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= weekAgo)
    .reduce((s, t) => s + t.amount, 0)

  const now2 = new Date()
  const hogarTasksToday = hogarEvents.filter(e => {
    const d = new Date(e.start_time)
    return d.getFullYear() === now2.getFullYear()
      && d.getMonth() === now2.getMonth()
      && d.getDate() === now2.getDate()
  }).length
  const pendingItems = shoppingItems.filter(i => !i.checked).length
  const firstNote = personalNotes.find(n => n.pinned) || personalNotes[0]

  const recipeChips = recipes.slice(0, 4).map(r => r.title.split(' ')[0])

  const dateLabel = format(now, 'd MMM', { locale: es }).toUpperCase()

  return (
    <div style={{ display: 'flex', height: 'calc(100dvh - 60px)', background: 'var(--bg)', color: 'var(--text)', overflow: 'hidden', fontFamily: 'var(--font-body)' }}>

      <style>{`
        @keyframes dh-up { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .dh-link { transition: opacity 0.15s, transform 0.15s; }
        .dh-link:hover { opacity: 0.82; transform: translateY(-1px); }
        .dh-btn:hover { opacity: 0.85; }
      `}</style>

      {/* ── Sidebar ── */}
      <nav style={{
        width: 64, background: 'var(--bg-subtle)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '14px 0', gap: 4, flexShrink: 0,
      }}>
        {/* Logo */}
        <Link to="/" title="H3nky" style={{
          width: 38, height: 38, overflow: 'hidden',
          display: 'block', textDecoration: 'none', marginBottom: 14, flexShrink: 0,
        }}>
          <img src="/logo-horizontal.png" alt="H3nky" style={{ height: 38, maxWidth: 'none', display: 'block' }} />
        </Link>

        {/* App links */}
        {APP_SIDEBAR_ITEMS.map(({ type, label, color, Icon }) => (
          <NavLink
            key={type}
            to={`/demo/${type}`}
            title={label}
            style={({ isActive }) => ({
              width: 48, height: 48, borderRadius: 12, border: 'none',
              background: isActive ? `${color}22` : 'transparent',
              color: isActive ? color : 'var(--text-faint)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', transition: 'background 0.15s, color 0.15s',
              outline: isActive ? `1.5px solid ${color}44` : 'none',
            })}
          >
            <Icon />
          </NavLink>
        ))}

        <div style={{ flex: 1 }} />

        {/* Settings */}
        <NavLink
          to="/demo/settings"
          title="Configuración"
          style={({ isActive }) => ({
            width: 48, height: 48, borderRadius: 12, border: 'none',
            background: isActive ? 'rgba(254,112,0,0.15)' : 'transparent',
            color: isActive ? 'var(--accent)' : 'var(--text-faint)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', transition: 'background 0.15s, color 0.15s',
          })}
        >
          <IconSettingsSvg />
        </NavLink>
      </nav>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top bar */}
        <div style={{
          padding: '0 32px', height: 44, flexShrink: 0,
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 11, fontWeight: 600, letterSpacing: '1.5px',
          color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
        }}>
          <span>{dayLabel} · {dateLabel} · <span style={{ color: 'var(--accent)' }}>DEMO</span></span>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px 40px' }}>

          {/* Fecha + Week strip — misma fila */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'stretch', marginBottom: 24 }}>

            {/* Date + greeting */}
            <div style={{ flexShrink: 0, animation: 'dh-up 0.4s ease both' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 10 }}>
                <span style={{
                  fontSize: 108, fontWeight: 900, lineHeight: 1,
                  fontFamily: 'var(--font-hero)', color: 'var(--text)',
                }}>
                  {dayNum}
                </span>
                <div style={{ marginBottom: 10 }}>
                  <div style={{
                    fontSize: 30, fontWeight: 700, letterSpacing: '5px',
                    color: 'var(--text)', fontFamily: 'var(--font-tech)', lineHeight: 1.1,
                  }}>
                    {monthLabel}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '1px', marginTop: 2 }}>
                    {year} · {dayLabel}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: 340, marginBottom: 16 }}>
                {greeting}, Eric.{' '}
                <span style={{ color: 'var(--text)' }}>{eventsCount} evento{eventsCount !== 1 ? 's' : ''}</span>{' '}
                en marcha entre tus apps.
                {activeItem && (
                  <> <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{activeItem.title}</span> está activa ahora mismo.</>
                )}
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="dh-btn" style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--text-muted)', fontSize: 12,
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}>
                  <IconSearch /> Buscar entre apps
                </button>
                <button className="dh-btn" style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                  background: 'var(--accent)', border: 'none', borderRadius: 8,
                  color: 'white', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}>
                  + Acción rápida
                </button>
              </div>
            </div>

            {/* Week strip */}
            <div style={{
              flex: 1, padding: '14px 18px',
              background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)',
              animation: 'dh-up 0.4s ease 0.06s both',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                SEMANA · {weekLabel}
              </span>
              <div style={{ display: 'flex', gap: 12 }}>
                {APP_CONFIG.map(app => (
                  <span key={app.type} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: app.color, display: 'inline-block' }} />
                    {app.label}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {weekActivity.map((activity, i) => {
                const isCurrent = isToday(activity.day)
                const activeApps = APP_CONFIG.filter(app => activity[app.type])
                const dayKey = format(activity.day, 'yyyy-MM-dd')
                const expense = dailyExpenses[dayKey]
                return (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '8px 4px', borderRadius: 8,
                    background: isCurrent ? 'rgba(254,112,0,0.12)' : 'transparent',
                    border: isCurrent ? '1px solid rgba(254,112,0,0.25)' : '1px solid transparent',
                  }}>
                    <span style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                      {DAY_LABELS[i]}
                    </span>
                    <span style={{
                      fontSize: 14, lineHeight: 1,
                      fontWeight: isCurrent ? 700 : 400,
                      color: isCurrent ? 'var(--accent)' : 'var(--text-muted)',
                      fontFamily: isCurrent ? 'var(--font-hero)' : 'var(--font-body)',
                    }}>
                      {format(activity.day, 'd')}
                    </span>
                    <div style={{ display: 'flex', gap: 3, height: 28, alignItems: 'flex-end' }}>
                      {activeApps.length === 0
                        ? <div style={{ width: 4, height: 4, background: 'var(--border)', borderRadius: 2 }} />
                        : activeApps.slice(0, 4).map((app, j) => (
                          <div key={app.type} style={{
                            width: 5,
                            height: BAR_HEIGHTS[(i * 4 + j) % BAR_HEIGHTS.length] * 2,
                            background: app.color, borderRadius: 3, opacity: 0.8,
                          }} />
                        ))
                      }
                    </div>
                    <span style={{
                      fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 600,
                      color: expense ? '#ef4444' : 'var(--border)',
                      letterSpacing: '0.5px', lineHeight: 1,
                    }}>
                      {expense ? `-${expense.toFixed(0)}€` : '·'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          </div>{/* fin fila fecha+semana */}

          {/* TU UNIVERSO */}
          <div style={{ animation: 'dh-up 0.4s ease 0.1s both' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '1px', color: 'var(--text)', fontFamily: 'var(--font-tech)' }}>
                TU UNIVERSO
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                APPs · 5 APPS · <span style={{ color: 'var(--accent)' }}>DEMO</span>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {/* HOGAR */}
              <Link to="/demo/hogar" className="dh-link" style={{
                display: 'block', textDecoration: 'none', padding: '13px',
                background: 'var(--bg-card)', borderRadius: 10,
                border: '1px solid var(--border)', borderTop: '2px solid #f97316',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f97316', letterSpacing: '0.5px' }}>🏠 HOGAR</span>
                  <span style={{ fontSize: 9, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>v0.4.0</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {hogarTasksToday} tareas hoy · {pendingItems} en lista
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  {recipeChips.map(chip => (
                    <span key={chip} style={{
                      fontSize: 10, padding: '2px 8px',
                      background: 'rgba(249,115,22,0.12)', color: '#f97316',
                      borderRadius: 99, fontWeight: 500,
                    }}>
                      {chip}
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>PROBAR →</span>
              </Link>

              {/* PERSONAL */}
              <Link to="/demo/personal" className="dh-link" style={{
                display: 'block', textDecoration: 'none', padding: '13px',
                background: 'var(--bg-card)', borderRadius: 10,
                border: '1px solid var(--border)', borderTop: '2px solid #38bdf8',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <IconPerson size={13} /> PERSONAL
                  </span>
                  <span style={{ fontSize: 9, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>v1.2.0</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                  {personalEvents.length} eventos · {personalNotes.length} notas
                </div>
                {firstNote?.content && (
                  <p style={{
                    fontSize: 11, color: 'var(--text-faint)', fontStyle: 'italic',
                    lineHeight: 1.5, marginBottom: 8,
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    "{firstNote.content.slice(0, 70)}..."
                  </p>
                )}
                <span style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>PROBAR →</span>
              </Link>

              {/* FINANZAS — fila completa */}
              <Link to="/demo/finanzas" className="dh-link" style={{
                display: 'flex', textDecoration: 'none', padding: '13px',
                background: 'var(--bg-card)', borderRadius: 10,
                border: '1px solid var(--border)', borderTop: '2px solid #22c55e',
                gridColumn: '1 / -1', gap: 24, alignItems: 'center',
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', letterSpacing: '0.5px' }}>💰 FINANZAS</span>
                    <span style={{ fontSize: 9, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>v0.3.0</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {demoRead('finanzas', 'fin_budgets').length} presupuestos activos
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 20, flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-hero)', lineHeight: 1 }}>
                      {weeklyExpenses.toFixed(0)}€
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-faint)', marginTop: 2 }}>esta semana</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#22c55e', fontFamily: 'var(--font-hero)', lineHeight: 1 }}>
                      {transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0).toFixed(0)}€
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-faint)', marginTop: 2 }}>ingresos mes</div>
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>PROBAR →</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel: Tu Día ── */}
      <aside style={{
        width: 268, background: 'var(--bg-subtle)', borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0,
      }}>
        {/* Header */}
        <div style={{ padding: '28px 20px 16px', flexShrink: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '2px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
            HOY · {todayItems.length} ITEMS
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '1px', color: 'var(--text)', fontFamily: 'var(--font-tech)' }}>
            TU DÍA
          </div>
        </div>

        {/* Timeline */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 20px', paddingBottom: 16 }}>
          {todayItems.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-faint)', padding: '8px 0' }}>Sin eventos hoy</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {todayItems.map((item, i) => {
                const isActive = item.id === activeItem?.id
                return (
                  <div key={item.id} style={{
                    display: 'flex', gap: 10, alignItems: 'center',
                    padding: '9px 12px',
                    background: isActive
                      ? `color-mix(in srgb, ${item.appColor} 12%, var(--bg-card))`
                      : 'var(--bg-card)',
                    borderRadius: 8,
                    borderLeft: `2px solid ${item.appColor}`,
                    animation: `dh-up 0.3s ease ${i * 0.04}s both`,
                  }}>
                    <div style={{ width: 40, flexShrink: 0, textAlign: 'right' }}>
                      <span style={{
                        fontSize: 10, fontFamily: 'var(--font-mono)',
                        color: isActive ? item.appColor : 'var(--text-muted)',
                        fontWeight: isActive ? 700 : 400,
                      }}>
                        {isActive ? '● AHORA' : item.allDay ? 'todo' : format(new Date(item.time), 'HH:mm')}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1px', color: item.appColor, fontFamily: 'var(--font-mono)' }}>
                        {item.appLabel}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ✦ IA insight */}
        <div style={{ padding: '16px 20px', flexShrink: 0 }}>
          <div style={{
            padding: '14px', background: 'linear-gradient(135deg, #3b0764, #6d28d9)',
            borderRadius: 10, animation: 'dh-up 0.4s ease 0.42s both',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: '#c4b5fd', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
              ✦ IA
            </div>
            <p style={{ fontSize: 11, color: '#e9d5ff', lineHeight: 1.65, marginBottom: 12 }}>
              Detectamos que gastas un 18% más los jueves por gasolina. ¿Reagendar la revisión del Golf al sábado para evitar dos paradas?
            </p>
            <button style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '1px', color: '#c4b5fd',
              fontFamily: 'var(--font-mono)', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}>
              APLICAR SUGERENCIA →
            </button>
          </div>
        </div>
      </aside>

    </div>
  )
}

// ── Mobile layout ─────────────────────────────────────────────────
function MobileLayout({ data }) {
  const { now, dayNum, dayLabel, monthLabel, year, todayItems, activeItem } = data

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 20px 56px' }}>
      <style>{`
        @keyframes dh-up { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      {/* Date */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: 6 }}>
          {dayLabel} · {dayNum} {monthLabel.slice(0, 3)} {year}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <div style={{
            fontSize: 80, fontWeight: 900, lineHeight: 1, color: 'var(--text)',
            fontFamily: 'var(--font-hero)', animation: 'dh-up 0.4s ease both',
          }}>
            {dayNum}
          </div>
          <div style={{
            fontSize: 24, fontWeight: 700, letterSpacing: '4px', color: 'var(--text)', marginBottom: 8,
            animation: 'dh-up 0.4s ease 0.05s both',
          }}>
            {monthLabel}
          </div>
        </div>
      </div>

      {/* Hoy */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--text-faint)', marginBottom: 8 }}>
          HOY · {todayItems.length} ITEMS
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
                  <div style={{ fontSize: 10, marginBottom: 2, color: isActive ? item.appColor : 'var(--text-muted)', fontWeight: isActive ? 700 : 400 }}>
                    {isActive ? '● AHORA' : item.allDay ? 'Todo el día' : format(new Date(item.time), 'HH:mm')}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? item.appColor : 'var(--text)', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.5px', color: item.appColor, opacity: 0.85 }}>{item.appLabel}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Apps */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--text-faint)', marginBottom: 8 }}>
          TUS APPS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {APP_CONFIG.map((app, i) => {
            const [line1, line2] = getAppStats(app.type, data)
            return (
              <Link key={app.type} to={`/demo/${app.type}`} style={{
                display: 'block', textDecoration: 'none', padding: '12px 14px',
                background: 'var(--bg-card)', borderRadius: 8,
                borderTop: `2px solid ${app.color}`,
                animation: `dh-up 0.35s ease ${(todayItems.length + i) * 0.04}s both`,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: app.color, marginBottom: 4 }}>
                  {app.icon} {app.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{line1}</div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{line2}</div>
              </Link>
            )
          })}
          {/* IA card */}
          <div style={{
            padding: '12px 14px', background: '#4c1d95', borderRadius: 8,
            animation: `dh-up 0.35s ease ${(todayItems.length + 5) * 0.04}s both`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 4 }}>✦ IA</div>
            <div style={{ fontSize: 11, color: '#ddd6fe', lineHeight: 1.5 }}>
              Gastas un 18% más los jueves en gasolina
            </div>
          </div>
        </div>
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

  const now = new Date()
  const dayLabel   = format(now, 'EEE', { locale: es }).toUpperCase()
  const dayNum     = format(now, 'd')
  const monthLabel = format(now, 'MMMM', { locale: es }).toUpperCase()
  const year       = format(now, 'yyyy')

  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), [])
  const weekEnd   = addDays(weekStart, 6)
  const weekLabel = `${format(weekStart, 'd')}-${format(weekEnd, 'd')} ${format(weekStart, 'MMM', { locale: es }).toUpperCase()}`

  const hogarEvents    = useMemo(() => demoRead('hogar', 'events'), [])
  const shoppingItems  = useMemo(() => demoRead('hogar', 'items_supermercado'), [])
  const personalEvents = useMemo(() => demoRead('personal', 'events'), [])
  const personalTasks  = useMemo(() => demoRead('personal', 'personal_tasks'), [])
  const personalNotes  = useMemo(() => demoRead('personal', 'personal_notes'), [])
  const recipes        = useMemo(() => demoRead('hogar', 'recipes'), [])
  const transactions   = useMemo(() => demoRead('finanzas', 'fin_transactions'), [])

  const todayItems = useMemo(() => getDemoTodayItems(), [])
  const activeItem = useMemo(() => getActiveItem(todayItems), [todayItems])

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  , [weekStart])

  const weekActivity = useMemo(() => weekDays.map(day => ({
    day,
    hogar:    hogarEvents.some(e => isSameDay(new Date(e.start_time), day)),
    personal: personalEvents.some(e => isSameDay(new Date(e.start_time), day))
              || personalTasks.some(t => t.due_date && isSameDay(new Date(t.due_date + 'T12:00:00'), day)),
    finanzas: transactions.some(t => isSameDay(new Date(t.date + 'T12:00:00'), day)),
  })), [weekDays, hogarEvents, personalEvents, personalTasks, transactions])

  const sharedData = {
    now, dayNum, dayLabel, monthLabel, year, weekLabel,
    weekActivity, todayItems, activeItem,
    hogarEvents, shoppingItems, personalNotes, personalEvents,
    personalTasks, recipes, transactions,
  }

  return isMobile
    ? <MobileLayout data={sharedData} />
    : <DesktopLayout data={sharedData} />
}
