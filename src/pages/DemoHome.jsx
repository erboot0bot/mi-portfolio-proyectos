import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format, differenceInMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { initDemoData, demoRead } from '../data/demo/index.js'
import { getDemoTodayItems, getActiveItem } from '../data/demo/getDemoTodayItems.js'

const APP_CONFIG = [
  { type: 'hogar',    label: 'HOGAR',    icon: '🏠', color: '#f97316' },
  { type: 'personal', label: 'PERSONAL', icon: '🗂️', color: '#38bdf8' },
  { type: 'mascotas', label: 'MASCOTAS', icon: '🐾', color: '#a855f7' },
  { type: 'vehiculo', label: 'VEHÍCULO', icon: '🚗', color: '#ef4444' },
  { type: 'finanzas', label: 'FINANZAS', icon: '💰', color: '#22c55e' },
]

function getAppStats(type) {
  switch (type) {
    case 'hogar': {
      const now = new Date()
      const events = demoRead('hogar', 'events')
      const todayCount = events.filter(e => {
        const d = new Date(e.start_time)
        return d.getFullYear() === now.getFullYear()
          && d.getMonth() === now.getMonth()
          && d.getDate() === now.getDate()
      }).length
      const pending = demoRead('hogar', 'items_supermercado').filter(i => !i.checked).length
      return [`${todayCount} tarea${todayCount !== 1 ? 's' : ''} hoy`, `${pending} en lista`]
    }
    case 'personal': {
      const tasks = demoRead('personal', 'personal_tasks').filter(t => t.status !== 'done').length
      const notes = demoRead('personal', 'personal_notes').length
      return [`${tasks} tarea${tasks !== 1 ? 's' : ''}`, `${notes} notas`]
    }
    case 'mascotas': {
      const pets = demoRead('mascotas', 'pets')
      if (!pets.length) return ['Sin mascotas', '']
      const pet = pets[0]
      const months = differenceInMonths(new Date(), new Date(pet.birth_date))
      const yrs = Math.floor(months / 12)
      const age = months < 12 ? `${months} meses` : `${yrs} año${yrs !== 1 ? 's' : ''}`
      const now2 = new Date()
      const mascEvents = demoRead('mascotas', 'events') ?? []
      const todayEvent = mascEvents.find(e => {
        const d = new Date(e.start_time)
        return d.getFullYear() === now2.getFullYear()
          && d.getMonth() === now2.getMonth()
          && d.getDate() === now2.getDate()
      })
      const line2 = todayEvent
        ? `${todayEvent.title} ${format(new Date(todayEvent.start_time), 'HH:mm')}`
        : 'Sin eventos hoy'
      return [`${pet.name} · ${age}`, line2]
    }
    case 'vehiculo': {
      const vehicles = demoRead('vehiculo', 'vehicles')
      if (!vehicles.length) return ['Sin vehículos', '']
      const v = vehicles[0]
      const logs = demoRead('vehiculo', 'fuel_logs')
      const lastKm = logs.length
        ? Math.max(...logs.map(l => l.km_at_fill))
        : v.initial_km
      return [`${v.brand} ${v.model}`, `${lastKm.toLocaleString('es-ES')} km`]
    }
    case 'finanzas': {
      const txs = demoRead('finanzas', 'fin_transactions')
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const total = txs
        .filter(t => t.type === 'expense' && new Date(t.date) >= weekAgo)
        .reduce((sum, t) => sum + t.amount, 0)
      const budgets = demoRead('finanzas', 'fin_budgets').length
      return [`${total.toFixed(0)}€ esta semana`, `${budgets} presupuestos`]
    }
    default: return ['—', '']
  }
}

export default function DemoHome() {
  // Inicializar datos de las 5 apps
  useEffect(() => {
    ['hogar', 'personal', 'mascotas', 'vehiculo', 'finanzas'].forEach(initDemoData)
  }, [])

  // Tema por defecto según dispositivo (solo si no hay preferencia guardada)
  useEffect(() => {
    if (localStorage.getItem('theme')) return
    const isMobile = window.innerWidth < 768
    document.documentElement.classList.toggle('dark', isMobile)
    localStorage.setItem('theme', isMobile ? 'dark' : 'light')
  }, [])

  const now = new Date()
  const dayLabel   = format(now, 'EEE', { locale: es }).toUpperCase()
  const dayNum     = format(now, 'd')
  const monthLabel = format(now, 'MMMM', { locale: es }).toUpperCase()
  const year       = format(now, 'yyyy')

  const todayItems = useMemo(() => getDemoTodayItems(), [])
  const activeItem = useMemo(() => getActiveItem(todayItems), [todayItems])

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 20px 56px' }}>

      <style>{`
        @keyframes dh-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Fecha ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '1.5px',
          color: 'var(--text-muted)', marginBottom: 6,
        }}>
          {dayLabel} · {dayNum} {monthLabel.slice(0, 3)} {year}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <div style={{
            fontSize: 80, fontWeight: 900, lineHeight: 1,
            color: 'var(--text)',
            fontFamily: 'var(--font-display, system-ui)',
            animation: 'dh-up 0.4s ease both',
          }}>
            {dayNum}
          </div>
          <div style={{
            fontSize: 24, fontWeight: 700, letterSpacing: '4px',
            color: 'var(--text)', marginBottom: 8,
            animation: 'dh-up 0.4s ease 0.05s both',
          }}>
            {monthLabel}
          </div>
        </div>
      </div>

      {/* ── Hoy ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '1.5px',
          color: 'var(--text-faint)', marginBottom: 8,
        }}>
          HOY · {todayItems.length} ITEMS
        </div>

        {todayItems.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-faint)', padding: '8px 0' }}>
            Sin eventos hoy
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {todayItems.map((item, i) => {
              const isActive = item.id === activeItem?.id
              return (
                <div
                  key={item.id}
                  style={{
                    padding: '10px 12px',
                    background: isActive
                      ? `color-mix(in srgb, ${item.appColor} 10%, transparent)`
                      : 'var(--bg-card)',
                    borderRadius: 8,
                    borderLeft: `3px solid ${item.appColor}`,
                    animation: `dh-up 0.35s ease ${i * 0.04}s both`,
                  }}
                >
                  <div style={{
                    fontSize: 10, marginBottom: 2,
                    color: isActive ? item.appColor : 'var(--text-muted)',
                    fontWeight: isActive ? 700 : 400,
                    letterSpacing: isActive ? '0.5px' : 0,
                  }}>
                    {isActive
                      ? '● AHORA'
                      : item.allDay
                        ? 'Todo el día'
                        : format(new Date(item.time), 'HH:mm')}
                  </div>
                  <div style={{
                    fontSize: 13, marginBottom: 2,
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? item.appColor : 'var(--text)',
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.5px',
                    color: item.appColor, opacity: 0.85,
                  }}>
                    {item.appLabel}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Apps ── */}
      <div>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '1.5px',
          color: 'var(--text-faint)', marginBottom: 8,
        }}>
          TUS APPS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {APP_CONFIG.map((app, i) => {
            const [line1, line2] = getAppStats(app.type)
            return (
              <Link
                key={app.type}
                to={`/demo/${app.type}`}
                style={{
                  display: 'block', textDecoration: 'none',
                  padding: '12px 14px',
                  background: 'var(--bg-card)',
                  borderRadius: 8,
                  borderTop: `2px solid ${app.color}`,
                  animation: `dh-up 0.35s ease ${(todayItems.length + i) * 0.04}s both`,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: app.color, marginBottom: 4 }}>
                  {app.icon} {app.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{line1}</div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{line2}</div>
              </Link>
            )
          })}

          {/* Tarjeta IA */}
          <div style={{
            padding: '12px 14px',
            background: '#7c3aed',
            borderRadius: 8,
            animation: `dh-up 0.35s ease ${(todayItems.length + 5) * 0.04}s both`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 4 }}>
              ✦ IA
            </div>
            <div style={{ fontSize: 11, color: '#ddd6fe', lineHeight: 1.5 }}>
              Gastas un 18% más los jueves en gasolina
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
