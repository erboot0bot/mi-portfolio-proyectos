import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead } from '../../../data/demo/index.js'

const UNIDADES = ['ud', 'bote', 'lata', 'tarro', 'kg', 'g', 'L', 'bolsa', 'rollo']

export default function Despensa() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const [items, setItems] = useState(() =>
    mode === 'demo' ? (demoRead(app.type ?? 'hogar', 'despensa_items') ?? []) : []
  )
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ nombre: '', cantidad: '', unidad: 'bote', minimo: '' })

  function ajustar(id, delta) {
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, cantidad: Math.max(0, +(i.cantidad + delta).toFixed(1)) } : i
    ))
  }

  function handleAdd() {
    if (!form.nombre.trim()) return
    const nuevo = {
      id: crypto.randomUUID(),
      nombre: form.nombre.trim(),
      icono: '🥫',
      cantidad: Number(form.cantidad) || 0,
      unidad: form.unidad,
      minimo: Number(form.minimo) || 0,
      categoria: 'otros',
    }
    setItems(prev => [...prev, nuevo])
    setForm({ nombre: '', cantidad: '', unidad: 'bote', minimo: '' })
    setShowAdd(false)
  }

  function eliminar(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const bajoStock = items.filter(i => i.cantidad < i.minimo)

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>🥫 Despensa</h1>
          <p style={{ fontSize: 13, margin: '4px 0 0',
            color: bajoStock.length > 0 ? '#ef4444' : 'var(--text-muted)' }}>
            {bajoStock.length > 0
              ? `⚠️ ${bajoStock.length} producto${bajoStock.length !== 1 ? 's' : ''} bajo mínimo`
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
              placeholder="Nombre del producto *" autoFocus
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Cantidad</label>
                <input type="number" min="0" step="0.5" value={form.cantidad}
                  onChange={e => setForm(p => ({ ...p, cantidad: e.target.value }))} placeholder="0"
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
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Mínimo</label>
                <input type="number" min="0" step="0.5" value={form.minimo}
                  onChange={e => setForm(p => ({ ...p, minimo: e.target.value }))} placeholder="0"
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
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>🥫</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Despensa vacía</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade tus secos, conservas y básicos de cocina</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map(item => {
            const bajo = item.cantidad < item.minimo
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 12,
                  border: `1px solid ${bajo ? 'rgba(239,68,68,.4)' : 'var(--border)'}`,
                  background: 'var(--bg-card)',
                }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icono}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.nombre}</p>
                  {bajo && (
                    <p style={{ margin: '1px 0 0', fontSize: 11, color: '#ef4444' }}>⚠️ Bajo mínimo ({item.minimo} {item.unidad})</p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => ajustar(item.id, -0.5)}
                    style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontSize: 13, fontWeight: 700, color: bajo ? '#ef4444' : 'var(--text)', minWidth: 48, textAlign: 'center' }}>
                    {item.cantidad} {item.unidad}
                  </span>
                  <button onClick={() => ajustar(item.id, 0.5)}
                    style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
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
