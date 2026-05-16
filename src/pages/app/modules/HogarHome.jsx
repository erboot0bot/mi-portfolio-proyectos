import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { format, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { initDemoData, demoRead, demoWrite } from '../../../data/demo/index.js'

initDemoData('hogar')

const MEAL_COLORS = {
  desayuno: { accent: '#f59e0b', bg: '#fff4d6', icon: '🥐' },
  almuerzo: { accent: '#ef4444', bg: '#ffe1e1', icon: '🥑' },
  comida:   { accent: '#7c3aed', bg: '#efe6ff', icon: '🍗' },
  cena:     { accent: '#2a6fdb', bg: '#e0ecff', icon: '🥘' },
}

const MEALS = [
  { key: 'desayuno', label: 'Desayuno' },
  { key: 'almuerzo', label: 'Almuerzo' },
  { key: 'comida',   label: 'Comida'   },
  { key: 'cena',     label: 'Cena'     },
]

const I18N = {
  es: {
    greeting_kicker: 'Hoy · Buenas tardes',
    greeting_title: 'Bienvenido a tu',
    greeting_highlight: 'Hogar.',
    stats_list: 'En la lista',
    stats_stock: 'Stock bajo',
    stats_tasks: 'Tareas hoy',
    stats_meals: 'Comidas planif.',
    menu_title: 'Menú de hoy',
    menu_link: 'Ver semana →',
    tasks_title: 'Tareas del día',
    stock_title: 'Stock bajo',
    add_to_list: '+ lista',
    no_planned: 'Sin planificar',
    done: 'Hecho',
  },
  en: {
    greeting_kicker: 'Today · Good afternoon',
    greeting_title: 'Welcome to your',
    greeting_highlight: 'Home.',
    stats_list: 'In list',
    stats_stock: 'Low stock',
    stats_tasks: 'Tasks today',
    stats_meals: 'Planned meals',
    menu_title: "Today's menu",
    menu_link: 'See week →',
    tasks_title: "Today's tasks",
    stock_title: 'Low stock',
    add_to_list: '+ list',
    no_planned: 'Not planned',
    done: 'Done',
  },
}

const STORES_ASK = ['Mercadona', 'Lidl', 'Carrefour', 'La Sirena', 'General']

function StoreAskModal({ itemName, onSelect, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, width: 280 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>¿A qué supermercado?</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Añadir <strong>{itemName}</strong> a la lista</div>
        {STORES_ASK.map(s => (
          <button type="button" key={s} onClick={() => onSelect(s)}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, background: 'transparent', color: 'var(--text)', marginBottom: 4 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >{s}</button>
        ))}
        <button type="button" onClick={onClose} style={{ marginTop: 8, width: '100%', padding: 8, borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
      </div>
    </div>
  )
}

export default function HogarHome() {
  const { pathname } = useLocation()
  const basePath = pathname.split('/').slice(0, 3).join('/')

  const [lang, setLang] = useState('es')
  const [checkedTasks, setCheckedTasks] = useState(new Set())
  const [storeModal, setStoreModal] = useState(null) // null | { itemName: string }
  const t = I18N[lang]

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

  const todayTasks = useMemo(() =>
    events.filter(e => e.event_type === 'task' && isToday(new Date(e.start_time))).slice(0, 5)
  , [events])

  function handleAddToList(store, itemName) {
    const appType = 'hogar'
    const raw = demoRead(appType, 'items_supermercado') ?? []
    const nuevo = { id: crypto.randomUUID(), title: itemName, type: 'product', checked: false, checked_at: null, metadata: { store, category: 'otros' } }
    demoWrite(appType, 'items_supermercado', [...raw, nuevo])
    setStoreModal(null)
  }

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '24px 28px 40px' }}>
      <style>{`
        @keyframes hh-up { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .hh-check:hover { border-color: var(--accent) !important; }
        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>

      {/* Hero card */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center',
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16,
        padding: '24px 28px', marginBottom: 20, animation: 'hh-up 0.4s ease both',
      }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-tech)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 8 }}>
            {t.greeting_kicker}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 8px', color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
            {t.greeting_title} <span style={{ color: 'var(--accent)' }}>{t.greeting_highlight}</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 14px' }}>
            Todo lo que necesitas para tu hogar, en un solo lugar.
          </p>
          {/* Lang toggle */}
          <div style={{ display: 'flex', gap: 2 }}>
            {['es','en'].map((l, i) => (
              <button type="button" key={l} onClick={() => setLang(l)} style={{
                fontSize: 11, fontWeight: lang === l ? 700 : 400, background: 'none', border: 'none',
                cursor: 'pointer', color: lang === l ? 'var(--accent)' : 'var(--text-muted)', padding: '2px 4px',
              }}>{l.toUpperCase()}{i === 0 ? ' |' : ''}</button>
            ))}
          </div>
        </div>
        {/* Date block */}
        <div style={{ textAlign: 'center', borderLeft: '3px solid var(--accent)', paddingLeft: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.04em', color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
            {dayNum}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 6, gap: 2 }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-tech)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{monthLabel}</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-tech)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{dayLabel}</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-tech)', fontWeight: 600, color: 'var(--text-faint)' }}>{year}</span>
          </div>
        </div>
      </div>

      {/* Quick stats — 4 chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24, animation: 'hh-up 0.4s ease 0.04s both' }}>
        {[
          { label: t.stats_list,  value: pendingShop.length,              color: 'var(--accent)' },
          { label: t.stats_stock, value: stockAlerts.length,              color: '#ef4444' },
          { label: t.stats_tasks, value: todayTasks.length,               color: '#2a6fdb' },
          { label: t.stats_meals, value: `${Object.keys(todayMeals).length} / 4`, color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: '-0.01em', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-tech)', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Menú de hoy */}
      <div style={{ marginBottom: 24, animation: 'hh-up 0.4s ease 0.08s both' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{t.menu_title}</span>
          <Link to={`${basePath}/menu`} style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-tech)', letterSpacing: '0.1em' }}>{t.menu_link}</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {MEALS.map((meal, i) => {
            const ev = todayMeals[meal.key]
            const mc = MEAL_COLORS[meal.key]
            const hour = ev ? format(new Date(ev.start_time), 'HH:mm') : null
            return (
              <Link key={meal.key} to={`${basePath}/menu`} style={{
                display: 'block', textDecoration: 'none',
                background: 'var(--bg-card)', borderRadius: 14, overflow: 'hidden',
                border: '1px solid var(--border)', borderTop: `4px solid ${mc.accent}`,
                transition: 'transform 0.15s, box-shadow 0.15s',
                animation: `hh-up 0.35s ease ${0.1 + i * 0.04}s both`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${mc.accent}22` }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                <div style={{ padding: '14px 14px 12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: mc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 8 }}>{mc.icon}</div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-tech)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 5 }}>{meal.label}</div>
                  {ev ? (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.35, marginBottom: 6 }}>{ev.metadata?.custom_name || ev.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {hour && <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>{hour}</span>}
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: `${mc.accent}18`, color: mc.accent, fontWeight: 700 }}>{t.done}</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-faint)', fontStyle: 'italic' }}>{t.no_planned}</div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Two-col: Tareas | Stock */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20, animation: 'hh-up 0.4s ease 0.14s both' }}>

        {/* Tareas del día */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>{t.tasks_title}</div>
          {todayTasks.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-faint)', padding: '12px 0', textAlign: 'center' }}>Sin tareas hoy</div>
          ) : todayTasks.map(task => {
            const done = checkedTasks.has(task.id)
            return (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <button
                  type="button"
                  className="hh-check"
                  onClick={() => setCheckedTasks(p => { const n = new Set(p); done ? n.delete(task.id) : n.add(task.id); return n })}
                  style={{
                    width: 22, height: 22, borderRadius: '50%',
                    border: `2px solid ${done ? 'var(--accent)' : 'var(--border)'}`,
                    background: done ? 'var(--accent)' : 'transparent',
                    cursor: 'pointer', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s', padding: 0,
                  }}
                >
                  {done && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2">
                      <polyline points="1.5,5 4,7.5 8.5,2.5"/>
                    </svg>
                  )}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: done ? 'var(--text-faint)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.title}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                    {task.metadata?.room && (
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 999, background: 'rgba(254,112,0,0.1)', color: 'var(--accent)', fontWeight: 600 }}>{task.metadata.room}</span>
                    )}
                    {task.start_time && (
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>{format(new Date(task.start_time), 'HH:mm')}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Stock bajo */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>{t.stock_title}</div>
          {stockAlerts.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-faint)', padding: '12px 0', textAlign: 'center' }}>Todo en orden ✓</div>
          ) : stockAlerts.slice(0, 5).map(item => {
            const pct = item.min_stock > 0 ? Math.min(100, Math.round((item.current_stock / item.min_stock) * 100)) : 0
            const barColor = pct < 30 ? '#ef4444' : pct < 70 ? '#f59e0b' : '#22c55e'
            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{item.product?.icon ?? '📦'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product?.name}</span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>{item.current_stock} {item.unit}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 2, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
                <button type="button"
                  onClick={() => setStoreModal({ itemName: item.product?.name })}
                  style={{ flexShrink: 0, padding: '4px 10px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                >{t.add_to_list}</button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Lista compra preview (si hay items pendientes) */}
      {pendingShop.length > 0 && (
        <div style={{ animation: 'hh-up 0.4s ease 0.2s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
              LISTA DE LA COMPRA
            </span>
            <Link to={`${basePath}/shopping`} style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}>
              VER LISTA →
            </Link>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {pendingShop.slice(0, 9).map(item => (
              <span key={item.id} style={{ fontSize: 11, padding: '4px 11px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 99, color: 'var(--text-muted)' }}>
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

      {storeModal && (
        <StoreAskModal
          itemName={storeModal.itemName}
          onSelect={store => handleAddToList(store, storeModal.itemName)}
          onClose={() => setStoreModal(null)}
        />
      )}
    </div>
  )
}
