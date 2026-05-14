import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead } from '../../../data/demo/index.js'

export default function ProductosLimpieza() {
  const { app, modules } = useOutletContext()
  const { mode } = useMode()

  const [productos, setProductos] = useState(() =>
    mode === 'demo' ? (demoRead(app.type ?? 'hogar', 'productos_limpieza') ?? []) : []
  )
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ nombre: '', cantidad: '', unidad: 'bote', minimo: '' })

  function ajustar(id, delta) {
    setProductos(prev => prev.map(p =>
      p.id === id ? { ...p, cantidad: Math.max(0, +(p.cantidad + delta).toFixed(1)) } : p
    ))
  }

  function handleAdd() {
    if (!form.nombre.trim()) return
    const nuevo = {
      id: crypto.randomUUID(),
      nombre: form.nombre.trim(),
      icon: '🧴',
      cantidad: Number(form.cantidad) || 0,
      unidad: form.unidad,
      minimo: Number(form.minimo) || 0,
      categoria: 'otros',
    }
    setProductos(prev => [...prev, nuevo])
    setForm({ nombre: '', cantidad: '', unidad: 'bote', minimo: '' })
    setShowAdd(false)
  }

  function eliminar(id) {
    setProductos(prev => prev.filter(p => p.id !== id))
  }

  const bajoStock = productos.filter(p => p.cantidad < p.minimo)

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Productos de limpieza</h1>
          <p style={{ fontSize: 13, color: bajoStock.length > 0 ? '#ef4444' : 'var(--text-muted)', margin: '4px 0 0' }}>
            {bajoStock.length > 0
              ? `⚠️ ${bajoStock.length} producto${bajoStock.length !== 1 ? 's' : ''} bajo mínimo`
              : `${productos.length} productos`}
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
            <input
              value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre del producto *"
              autoFocus
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Cantidad</label>
                <input type="number" min="0" step="0.5" value={form.cantidad}
                  onChange={e => setForm(p => ({ ...p, cantidad: e.target.value }))}
                  placeholder="0"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Unidad</label>
                <select value={form.unidad} onChange={e => setForm(p => ({ ...p, unidad: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
                  <option>bote</option>
                  <option>L</option>
                  <option>ud</option>
                  <option>par</option>
                  <option>kg</option>
                  <option>rollo</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Mínimo</label>
                <input type="number" min="0" step="0.5" value={form.minimo}
                  onChange={e => setForm(p => ({ ...p, minimo: e.target.value }))}
                  placeholder="0"
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
      {productos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>🧴</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin productos registrados</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade los productos de limpieza que usas habitualmente</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {productos.map(p => {
            const bajo = p.cantidad < p.minimo
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 12,
                  border: `1px solid ${bajo ? 'rgba(239,68,68,.4)' : 'var(--border)'}`,
                  background: 'var(--bg-card)',
                }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{p.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{p.nombre}</p>
                  {bajo && (
                    <p style={{ margin: '1px 0 0', fontSize: 11, color: '#ef4444' }}>⚠️ Bajo mínimo ({p.minimo} {p.unidad})</p>
                  )}
                </div>
                {/* Controles cantidad */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => ajustar(p.id, -0.5)}
                    style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontSize: 13, fontWeight: 700, color: bajo ? '#ef4444' : 'var(--text)', minWidth: 40, textAlign: 'center' }}>
                    {p.cantidad} {p.unidad}
                  </span>
                  <button onClick={() => ajustar(p.id, 0.5)}
                    style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                <button className="del-btn" onClick={() => eliminar(p.id)}
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
