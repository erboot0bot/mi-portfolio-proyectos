import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead } from '../../../data/demo/index.js'

function diasHasta(fechaStr) {
  if (!fechaStr) return null
  return Math.round((new Date(fechaStr) - new Date()) / (1000 * 60 * 60 * 24))
}

function semaforo(dias) {
  if (dias === null) return { color: 'var(--text-faint)', label: '—' }
  if (dias < 0)  return { color: '#ef4444', label: `Caducado hace ${Math.abs(dias)}d` }
  if (dias === 0) return { color: '#ef4444', label: 'Caduca hoy' }
  if (dias <= 3)  return { color: '#f59e0b', label: `${dias}d` }
  return { color: '#22c55e', label: `${dias}d` }
}

const UNIDADES = ['ud', 'L', 'g', 'kg', 'bolsa', 'tarro', 'paquete', 'bote']

export default function Nevera() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const [items, setItems] = useState(() =>
    mode === 'demo' ? (demoRead(app.type ?? 'hogar', 'nevera') ?? []) : []
  )
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ nombre: '', cantidad: '', unidad: 'ud', caducidad: '' })

  const sorted = [...items].sort((a, b) => {
    const da = diasHasta(a.caducidad)
    const db = diasHasta(b.caducidad)
    if (da === null) return 1
    if (db === null) return -1
    return da - db
  })
  const caducados = items.filter(i => diasHasta(i.caducidad) !== null && diasHasta(i.caducidad) < 0)
  const proximos  = items.filter(i => { const d = diasHasta(i.caducidad); return d !== null && d >= 0 && d <= 3 })

  function handleAdd() {
    if (!form.nombre.trim()) return
    const nuevo = {
      id: crypto.randomUUID(),
      nombre: form.nombre.trim(),
      icono: '🍱',
      cantidad: Number(form.cantidad) || 1,
      unidad: form.unidad,
      caducidad: form.caducidad || null,
      categoria: 'otros',
    }
    setItems(prev => [...prev, nuevo])
    setForm({ nombre: '', cantidad: '', unidad: 'ud', caducidad: '' })
    setShowAdd(false)
  }

  function eliminar(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>🧊 Nevera</h1>
          <p style={{ fontSize: 13, margin: '4px 0 0',
            color: caducados.length > 0 ? '#ef4444' : proximos.length > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
            {caducados.length > 0
              ? `⚠️ ${caducados.length} producto${caducados.length !== 1 ? 's' : ''} caducado${caducados.length !== 1 ? 's' : ''}`
              : proximos.length > 0
                ? `⏰ ${proximos.length} caduca${proximos.length !== 1 ? 'n' : ''} pronto`
                : `${items.length} productos`}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(p => !p)}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >+ Añadir</button>
      </div>

      {/* Formulario */}
      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Nuevo producto</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre *" autoFocus
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Cantidad</label>
                <input type="number" min="0" step="0.5" value={form.cantidad}
                  onChange={e => setForm(p => ({ ...p, cantidad: e.target.value }))} placeholder="1"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Unidad</label>
                <select value={form.unidad} onChange={e => setForm(p => ({ ...p, unidad: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
                  {UNIDADES.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Caduca</label>
                <input type="date" value={form.caducidad} min={today}
                  onChange={e => setForm(p => ({ ...p, caducidad: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                Cancelar
              </button>
              <button onClick={handleAdd} disabled={!form.nombre.trim()}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: form.nombre.trim() ? 1 : 0.4 }}>
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>🧊</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Nevera vacía</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade los productos que tienes ahora mismo</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sorted.map(item => {
            const dias = diasHasta(item.caducidad)
            const { color: semColor, label: semLabel } = semaforo(dias)
            const isAlert = dias !== null && dias <= 3
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 12,
                  border: `1px solid ${isAlert ? (dias < 0 ? 'rgba(239,68,68,.4)' : 'rgba(245,158,11,.4)') : 'var(--border)'}`,
                  background: 'var(--bg-card)',
                }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icono}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.nombre}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                    {item.cantidad} {item.unidad}
                  </p>
                </div>
                {item.caducidad && (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: semColor }}>{semLabel}</span>
                  </div>
                )}
                <button className="del-btn" onClick={() => eliminar(item.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}
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
