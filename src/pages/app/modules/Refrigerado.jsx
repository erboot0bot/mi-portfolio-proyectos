import { useState, useMemo, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead, demoWrite } from '../../../data/demo/index.js'

const UNIDADES = ['ud', 'L', 'g', 'kg', 'bolsa', 'tarro', 'paquete', 'bote']

// Fix 4 — keyframes at module level
const KEYFRAMES = `@keyframes ref-up { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } } @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`

// Fix 5 — normalize to local midnight to avoid UTC offset issues
function diasHasta(fechaStr) {
  if (!fechaStr) return null
  const [y, m, d] = fechaStr.split('-').map(Number)
  const target = new Date(y, m - 1, d) // local midnight
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

function diasCongelado(fechaStr) {
  if (!fechaStr) return 0
  return Math.round((new Date() - new Date(fechaStr)) / (1000 * 60 * 60 * 24))
}

function calcDaysLeft(item) {
  if (item.loc === 'nevera') return diasHasta(item.caducidad)
  const used = diasCongelado(item.fecha_congelado)
  const max = item.tiempo_max ?? 90
  return max - used
}

function badgeInfo(daysLeft) {
  if (daysLeft === null)  return { label: '—',                              color: 'var(--text-faint)', borderColor: 'var(--border)',              bg: 'transparent' }
  if (daysLeft < 0)      return { label: `Caducado hace ${Math.abs(daysLeft)}d`, color: '#dc2626',  borderColor: 'rgba(239,68,68,0.45)',   bg: 'rgba(239,68,68,0.15)' }
  if (daysLeft === 0)    return { label: 'Caduca hoy',                      color: '#ea580c',          borderColor: 'rgba(254,112,0,0.4)',    bg: 'rgba(254,112,0,0.12)' }
  if (daysLeft <= 7)     return { label: `${daysLeft}d`,                    color: '#d97706',          borderColor: 'rgba(245,158,11,0.4)',   bg: 'rgba(245,158,11,0.12)' }
  return                        { label: `${daysLeft}d`,                    color: 'var(--text-faint)', borderColor: 'var(--border)',              bg: 'transparent' }
}

export default function Refrigerado() {
  const { app } = useOutletContext()
  const { mode } = useMode()
  const appType = app?.type ?? 'hogar'

  const [items, setItems] = useState(() => {
    if (mode !== 'demo') return []
    const nevera    = (demoRead(appType, 'nevera')     ?? []).map(i => ({ ...i, loc: 'nevera' }))
    const congelador = (demoRead(appType, 'congelador') ?? []).map(i => ({ ...i, loc: 'congelador' }))
    return [...nevera, ...congelador]
  })

  const [filter, setFilter] = useState('all') // all | nevera | congelador | soon
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [addLoc, setAddLoc]  = useState('nevera')
  // Fix 1 — React state for hover instead of direct DOM mutation
  const [hoveredId, setHoveredId] = useState(null)
  const [form, setForm] = useState({
    nombre: '', cantidad: '', unidad: 'ud',
    caducidad: '', fecha_congelado: new Date().toISOString().slice(0, 10), tiempo_max: '90',
  })

  // Fix 4 — inject keyframes once via useEffect
  useEffect(() => {
    if (document.getElementById('ref-up-style')) return
    const style = document.createElement('style')
    style.id = 'ref-up-style'
    style.textContent = KEYFRAMES
    document.head.appendChild(style)
  }, [])

  const sorted = useMemo(() =>
    [...items].sort((a, b) => {
      const da = calcDaysLeft(a) ?? 9999
      const db = calcDaysLeft(b) ?? 9999
      return da - db
    })
  , [items])

  const filtered = useMemo(() => sorted.filter(item => {
    if (filter === 'nevera'     && item.loc !== 'nevera')     return false
    if (filter === 'congelador' && item.loc !== 'congelador') return false
    if (filter === 'soon') {
      const d = calcDaysLeft(item)
      if (d === null || d > 7) return false
    }
    if (search) return item.nombre.toLowerCase().includes(search.toLowerCase())
    return true
  }), [sorted, filter, search])

  // Fix 3 — memoized stats
  const stats = useMemo(() => {
    let neveraCount = 0, congeladorCount = 0, caducados = 0, caducaHoy = 0, pronto = 0
    for (const item of items) {
      if (item.loc === 'nevera') neveraCount++
      else congeladorCount++
      const d = calcDaysLeft(item)
      if (d !== null) {
        if (d < 0) caducados++
        if (d === 0) caducaHoy++
        if (d >= 0 && d <= 3) pronto++
      }
    }
    return { neveraCount, congeladorCount, caducados, caducaHoy, pronto }
  }, [items])

  function handleAdd() {
    if (!form.nombre.trim()) return
    const id = crypto.randomUUID()
    if (addLoc === 'nevera') {
      const nuevo = { id, nombre: form.nombre.trim(), icono: '🍱', cantidad: Number(form.cantidad) || 1, unidad: form.unidad, caducidad: form.caducidad || null, categoria: 'otros', loc: 'nevera' }
      if (mode === 'demo') {
        const raw = demoRead(appType, 'nevera') ?? []
        demoWrite(appType, 'nevera', [...raw, { id, nombre: nuevo.nombre, icono: nuevo.icono, cantidad: nuevo.cantidad, unidad: nuevo.unidad, caducidad: nuevo.caducidad, categoria: nuevo.categoria }])
      }
      setItems(p => [...p, nuevo])
    } else {
      const nuevo = { id, nombre: form.nombre.trim(), icono: '❄️', cantidad: Number(form.cantidad) || 1, unidad: form.unidad, fecha_congelado: form.fecha_congelado, tiempo_max: Number(form.tiempo_max) || 90, categoria: 'otros', loc: 'congelador' }
      if (mode === 'demo') {
        const raw = demoRead(appType, 'congelador') ?? []
        demoWrite(appType, 'congelador', [...raw, { id, nombre: nuevo.nombre, icono: nuevo.icono, cantidad: nuevo.cantidad, unidad: nuevo.unidad, fecha_congelado: nuevo.fecha_congelado, tiempo_max: nuevo.tiempo_max, categoria: nuevo.categoria }])
      }
      setItems(p => [...p, nuevo])
    }
    setForm({ nombre: '', cantidad: '', unidad: 'ud', caducidad: '', fecha_congelado: new Date().toISOString().slice(0, 10), tiempo_max: '90' })
    setShowAdd(false)
  }

  function eliminar(id, loc) {
    if (mode === 'demo') {
      const key = loc === 'nevera' ? 'nevera' : 'congelador'
      demoWrite(appType, key, (demoRead(appType, key) ?? []).filter(i => i.id !== id))
    }
    setItems(p => p.filter(i => i.id !== id))
  }

  const FILTER_CHIPS = [
    { key: 'all',        label: `Todo ${items.length}` },
    { key: 'nevera',     label: '🧊 Nevera' },
    { key: 'congelador', label: '❄️ Congelador' },
    { key: 'soon',       label: '⏰ Caducan pronto' },
  ]

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '20px 28px 40px', maxWidth: 860 }}>
      {/* Page head */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, animation: 'ref-up 0.35s ease both' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', margin: '0 0 6px' }}>🧊 Refrigerado</h1>
          {(stats.caducados > 0 || stats.caducaHoy > 0) && (
            <p style={{ fontSize: 13, color: '#dc2626', margin: 0, fontWeight: 600 }}>
              ⚠️{stats.caducados > 0 ? ` ${stats.caducados} caducado${stats.caducados !== 1 ? 's' : ''}` : ''}{stats.caducados > 0 && stats.caducaHoy > 0 ? ' · ' : ''}{stats.caducaHoy > 0 ? ` ${stats.caducaHoy} caduca${stats.caducaHoy !== 1 ? 'n' : ''} hoy` : ''} · {items.length} items total
            </p>
          )}
        </div>
        <button type="button"
          onClick={() => setShowAdd(p => !p)}
          style={{ padding: '8px 18px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, flexShrink: 0 }}
        >＋ Añadir</button>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', animation: 'ref-up 0.35s ease 0.04s both' }}>
        {[
          { label: 'Nevera',        value: stats.neveraCount,     color: '#1d4ed8', bg: 'rgba(29,78,216,0.1)' },
          { label: 'Congelador',    value: stats.congeladorCount, color: '#0369a1', bg: 'rgba(3,105,161,0.1)' },
          { label: 'Caducados',     value: stats.caducados,       color: '#dc2626', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Caducan en 3d', value: stats.pronto,          color: '#d97706', bg: 'rgba(245,158,11,0.1)' },
        ].map(s => (
          <div key={s.label} style={{ padding: '8px 14px', borderRadius: 999, background: s.bg, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: 'var(--font-tech)' }}>{s.value}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: s.color, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-tech)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap', animation: 'ref-up 0.35s ease 0.06s both' }}>
        {FILTER_CHIPS.map(chip => (
          <button type="button" key={chip.key} onClick={() => setFilter(chip.key)} style={{
            padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500,
            border: `1px solid ${filter === chip.key ? 'var(--accent)' : 'var(--border)'}`,
            background: filter === chip.key ? 'var(--accent)' : 'transparent',
            color: filter === chip.key ? '#fff' : 'var(--text-muted)',
            cursor: 'pointer', transition: 'all 200ms',
          }}>{chip.label}</button>
        ))}
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar..."
          style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 999, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', width: 160 }}
        />
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, marginBottom: 16, animation: 'ref-up 0.25s ease both' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {['nevera', 'congelador'].map(l => (
              <button type="button" key={l} onClick={() => setAddLoc(l)} style={{
                padding: '5px 14px', borderRadius: 999, border: `1px solid ${addLoc === l ? 'var(--accent)' : 'var(--border)'}`,
                cursor: 'pointer', fontSize: 12, fontWeight: 600,
                background: addLoc === l ? 'var(--accent)' : 'transparent',
                color: addLoc === l ? '#fff' : 'var(--text-muted)',
              }}>{l === 'nevera' ? '🧊 Nevera' : '❄️ Congelador'}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre *" autoFocus
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" min="0" step="0.5" value={form.cantidad}
                onChange={e => setForm(p => ({ ...p, cantidad: e.target.value }))} placeholder="Cant."
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              <select value={form.unidad} onChange={e => setForm(p => ({ ...p, unidad: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
                {UNIDADES.map(u => <option key={u}>{u}</option>)}
              </select>
              {addLoc === 'nevera'
                ? <input type="date" value={form.caducidad} onChange={e => setForm(p => ({ ...p, caducidad: e.target.value }))}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                : <input type="number" min="1" value={form.tiempo_max} onChange={e => setForm(p => ({ ...p, tiempo_max: e.target.value }))}
                    placeholder="Máx días"
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              }
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowAdd(false)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              <button type="button" onClick={handleAdd} disabled={!form.nombre.trim()} style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: form.nombre.trim() ? 1 : 0.4 }}>Añadir</button>
            </div>
          </div>
        </div>
      )}

      {/* Items list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-faint)', fontSize: 14 }}>
          {search ? 'Sin resultados para tu búsqueda' : 'Sin productos — pulsa ＋ Añadir'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((item, i) => {
            const daysLeft  = calcDaysLeft(item)
            const badge     = badgeInfo(daysLeft)
            const isAlert   = daysLeft !== null && daysLeft <= 7
            const locColor  = item.loc === 'nevera' ? '#1d4ed8' : '#0369a1'
            const locBg     = item.loc === 'nevera' ? 'rgba(29,78,216,0.12)' : 'rgba(3,105,161,0.12)'

            return (
              <div key={item.id} style={{
                display: 'grid', gridTemplateColumns: '56px 1fr auto auto', alignItems: 'center',
                padding: '14px 18px', borderRadius: 14,
                border: `1px solid ${isAlert && daysLeft < 0 ? 'rgba(239,68,68,0.45)' : isAlert ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
                background: 'var(--bg-card)',
                animation: `ref-up 0.3s ease ${i * 0.03}s both`,
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  {item.icono}
                </div>
                <div style={{ padding: '0 14px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{item.nombre}</span>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: locBg, color: locColor, fontWeight: 700, flexShrink: 0 }}>
                      {item.loc === 'nevera' ? 'Nevera' : 'Congelador'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {item.cantidad} {item.unidad}
                    {item.loc === 'congelador' && item.fecha_congelado && ` · ${diasCongelado(item.fecha_congelado)}d congelado`}
                  </div>
                </div>
                <div style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${badge.borderColor}`, background: badge.bg, textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, fontFamily: 'var(--font-mono)', color: badge.color, whiteSpace: 'nowrap' }}>{badge.label}</span>
                </div>
                {/* Fix 1 & 2 — React state for opacity, aria-label, type="button" */}
                <button
                  type="button"
                  aria-label={`Eliminar ${item.nombre}`}
                  onClick={() => eliminar(item.id, item.loc)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: hoveredId === item.id ? 1 : 0, transition: 'opacity .15s', marginLeft: 8 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
                >×</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
