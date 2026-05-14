import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead } from '../../../data/demo/index.js'

function diasCongelado(fechaStr) {
  if (!fechaStr) return 0
  return Math.round((new Date() - new Date(fechaStr)) / (1000 * 60 * 60 * 24))
}

const UNIDADES = ['ud', 'g', 'kg', 'L', 'bolsa', 'bote']

export default function Congelador() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const [items, setItems] = useState(() =>
    mode === 'demo' ? (demoRead(app.type ?? 'hogar', 'congelador') ?? []) : []
  )
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ nombre: '', cantidad: '', unidad: 'ud', tiempo_max: '90' })

  const sorted = [...items].sort((a, b) => {
    const da = diasCongelado(a.fecha_congelado) / (a.tiempo_max || 90)
    const db = diasCongelado(b.fecha_congelado) / (b.tiempo_max || 90)
    return db - da
  })

  const criticos = items.filter(i => diasCongelado(i.fecha_congelado) >= (i.tiempo_max ?? 90))

  function handleAdd() {
    if (!form.nombre.trim()) return
    const nuevo = {
      id: crypto.randomUUID(),
      nombre: form.nombre.trim(),
      icono: '❄️',
      cantidad: Number(form.cantidad) || 1,
      unidad: form.unidad,
      fecha_congelado: new Date().toISOString().slice(0, 10),
      tiempo_max: Number(form.tiempo_max) || 90,
      categoria: 'otros',
    }
    setItems(prev => [...prev, nuevo])
    setForm({ nombre: '', cantidad: '', unidad: 'ud', tiempo_max: '90' })
    setShowAdd(false)
  }

  function eliminar(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>❄️ Congelador</h1>
          <p style={{ fontSize: 13, margin: '4px 0 0',
            color: criticos.length > 0 ? '#ef4444' : 'var(--text-muted)' }}>
            {criticos.length > 0
              ? `⚠️ ${criticos.length} producto${criticos.length !== 1 ? 's' : ''} superado${criticos.length !== 1 ? 's' : ''} el límite`
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
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Máx. días</label>
                <input type="number" min="1" value={form.tiempo_max}
                  onChange={e => setForm(p => ({ ...p, tiempo_max: e.target.value }))} placeholder="90"
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
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>❄️</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Congelador vacío</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade lo que tienes congelado y cuándo lo congelaste</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sorted.map(item => {
            const dias = diasCongelado(item.fecha_congelado)
            const max  = item.tiempo_max ?? 90
            const pct  = Math.min(100, Math.round((dias / max) * 100))
            const superado = dias >= max
            const barColor = superado ? '#ef4444' : pct > 75 ? '#f59e0b' : 'var(--accent)'
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 12,
                  border: `1px solid ${superado ? 'rgba(239,68,68,.4)' : 'var(--border)'}`,
                  background: 'var(--bg-card)',
                }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icono}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.nombre}</p>
                    <span style={{ fontSize: 12, color: superado ? '#ef4444' : 'var(--text-muted)', fontWeight: superado ? 700 : 400 }}>
                      {superado ? `¡Supera ${max}d!` : `${dias}/${max} días`}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 5px', fontSize: 12, color: 'var(--text-muted)' }}>{item.cantidad} {item.unidad}</p>
                  <div style={{ height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, width: `${pct}%`, background: barColor, transition: 'width .3s' }} />
                  </div>
                </div>
                <button className="del-btn" onClick={() => eliminar(item.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s', marginLeft: 8 }}
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
