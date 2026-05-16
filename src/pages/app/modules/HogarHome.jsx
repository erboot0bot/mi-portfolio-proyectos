import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { format, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { initDemoData, demoRead } from '../../../data/demo/index.js'

initDemoData('hogar')

const MEALS = [
  { key: 'desayuno', label: 'Desayuno', icon: '☀️' },
  { key: 'almuerzo', label: 'Almuerzo', icon: '🍎' },
  { key: 'comida',   label: 'Comida',   icon: '🍽️' },
  { key: 'cena',     label: 'Cena',     icon: '🌙' },
]

export default function HogarHome() {
  const { pathname } = useLocation()
  const basePath = pathname.split('/').slice(0, 3).join('/')

  const events    = useMemo(() => demoRead('hogar', 'events'), [])
  const shopping  = useMemo(() => demoRead('hogar', 'items_supermercado'), [])
  const inventory = useMemo(() => demoRead('hogar', 'inventory'), [])

  const now        = new Date()
  const dayLabel   = format(now, 'EEE', { locale: es }).toUpperCase()
  const dayNum     = format(now, 'd')
  const monthLabel = format(now, 'MMMM', { locale: es }).toUpperCase()
  const year       = format(now, 'yyyy')

  const todayMeals = useMemo(() => {
    const map = {}
    events
      .filter(e => e.event_type === 'meal' && isToday(new Date(e.start_time)))
      .forEach(e => { if (e.metadata?.meal_type) map[e.metadata.meal_type] = e })
    return map
  }, [events])

  const pendingShop  = useMemo(() => shopping.filter(i => !i.checked), [shopping])
  const stockAlerts  = useMemo(() => inventory.filter(i => i.current_stock < i.min_stock), [inventory])


  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '24px 28px 40px' }}>
      <style>{`
        @keyframes hh-up { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .hh-link { transition: transform 0.15s, box-shadow 0.15s; cursor: pointer; }
        .hh-link:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
      `}</style>

      {/* Date header */}
      <div style={{ marginBottom: 24, animation: 'hh-up 0.35s ease both' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '2px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
          {dayLabel} · {year}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontSize: 72, fontWeight: 900, lineHeight: 1, fontFamily: 'var(--font-hero)', color: 'var(--text)' }}>
            {dayNum}
          </span>
          <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '5px', color: 'var(--text)', fontFamily: 'var(--font-tech)' }}>
            {monthLabel}
          </span>
        </div>
      </div>

      {/* Menú del día */}
      <div style={{ marginBottom: 20, animation: 'hh-up 0.35s ease 0.06s both' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
            MENÚ DE HOY
          </span>
          <Link to={`${basePath}/menu`} style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)', textDecoration: 'none', letterSpacing: '1px' }}>
            VER SEMANA →
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {MEALS.map((meal, i) => {
            const ev = todayMeals[meal.key]
            return (
              <Link
                key={meal.key}
                to={`${basePath}/menu`}
                className="hh-link"
                style={{
                  display: 'block', textDecoration: 'none',
                  padding: '12px 10px',
                  background: 'var(--bg-card)',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  borderTop: `2px solid ${ev ? '#f59e0b' : 'var(--border)'}`,
                  animation: `hh-up 0.3s ease ${0.08 + i * 0.04}s both`,
                }}
              >
                <div style={{ fontSize: 18, marginBottom: 6 }}>{meal.icon}</div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginBottom: 5 }}>
                  {meal.label.toUpperCase()}
                </div>
                {ev ? (
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>
                    {ev.metadata?.custom_name || ev.title}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: 'var(--text-faint)', fontStyle: 'italic' }}>Sin planificar</div>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Lista de la compra preview */}
      {pendingShop.length > 0 && (
        <div style={{ marginBottom: 20, animation: 'hh-up 0.35s ease 0.2s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
              LISTA DE LA COMPRA
            </span>
            <Link to={`${basePath}/shopping`} style={{ fontSize: 9, fontWeight: 700, color: '#f97316', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}>
              VER LISTA →
            </Link>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {pendingShop.slice(0, 9).map(item => (
              <span key={item.id} style={{
                fontSize: 11, padding: '4px 11px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 99, color: 'var(--text-muted)',
              }}>
                {item.title}
              </span>
            ))}
            {pendingShop.length > 9 && (
              <span style={{ fontSize: 11, padding: '4px 8px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                +{pendingShop.length - 9}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stock alerts */}
      {stockAlerts.length > 0 && (
        <div style={{ animation: 'hh-up 0.35s ease 0.25s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
              STOCK BAJO
            </span>
            <Link to={`${basePath}/inventario`} style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}>
              VER INVENTARIO →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {stockAlerts.slice(0, 5).map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px',
                background: 'var(--bg-card)',
                borderRadius: 8,
                border: '1px solid var(--border)',
                borderLeft: '2px solid #ef4444',
              }}>
                <span style={{ fontSize: 12, color: 'var(--text)' }}>{item.product?.name}</span>
                <span style={{ fontSize: 11, color: '#ef4444', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {item.current_stock} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
