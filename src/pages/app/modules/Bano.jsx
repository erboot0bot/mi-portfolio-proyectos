import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead } from '../../../data/demo/index.js'

function diasDesde(fechaStr) {
  if (!fechaStr) return 0
  return Math.round((new Date() - new Date(fechaStr)) / (1000 * 60 * 60 * 24))
}

export default function Bano() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const initial = mode === 'demo' ? (demoRead(app.type ?? 'hogar', 'bano') ?? {}) : {}
  const [consumibles, setConsumibles] = useState(initial.consumibles ?? [])
  const [durables,    setDurables]    = useState(initial.durables    ?? [])

  function ajustar(id, delta) {
    setConsumibles(prev => prev.map(c =>
      c.id === id ? { ...c, cantidad: Math.max(0, +(c.cantidad + delta).toFixed(1)) } : c
    ))
  }

  function marcarCambiado(id) {
    setDurables(prev => prev.map(d =>
      d.id === id ? { ...d, ultimo_cambio: new Date().toISOString().slice(0, 10) } : d
    ))
  }

  const bajoStock = consumibles.filter(c => c.cantidad < c.minimo)
  const pendientes = durables.filter(d => diasDesde(d.ultimo_cambio) >= d.intervalo_dias)

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>🪥 Baño</h1>
        <p style={{ fontSize: 13, margin: '4px 0 0',
          color: (bajoStock.length > 0 || pendientes.length > 0) ? '#ef4444' : 'var(--text-muted)' }}>
          {bajoStock.length > 0 || pendientes.length > 0
            ? `⚠️ ${bajoStock.length > 0 ? `${bajoStock.length} bajo stock` : ''}${bajoStock.length > 0 && pendientes.length > 0 ? ' · ' : ''}${pendientes.length > 0 ? `${pendientes.length} pendiente${pendientes.length !== 1 ? 's' : ''} de cambio` : ''}`
            : 'Todo al día'}
        </p>
      </div>

      {/* Consumibles */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
        <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Stock</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {consumibles.map(c => {
            const bajo = c.cantidad < c.minimo
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{c.icono}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{c.nombre}</p>
                  {bajo && <p style={{ margin: '1px 0 0', fontSize: 11, color: '#ef4444' }}>⚠️ Bajo mínimo</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => ajustar(c.id, -1)}
                    style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontSize: 13, fontWeight: 700, color: bajo ? '#ef4444' : 'var(--text)', minWidth: 56, textAlign: 'center' }}>
                    {c.cantidad} {c.unidad}
                  </span>
                  <button onClick={() => ajustar(c.id, 1)}
                    style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Durables */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
        <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Cambio periódico</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {durables.map(d => {
            const dias      = diasDesde(d.ultimo_cambio)
            const pendiente = dias >= d.intervalo_dias
            const pct       = Math.min(100, Math.round((dias / d.intervalo_dias) * 100))
            const barColor  = pendiente ? '#ef4444' : pct > 75 ? '#f59e0b' : 'var(--accent)'
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{d.icono}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: pendiente ? '#ef4444' : 'var(--text)' }}>{d.nombre}</span>
                    <span style={{ fontSize: 11, color: pendiente ? '#ef4444' : 'var(--text-muted)' }}>
                      {pendiente ? '¡Cambiar ya!' : `${dias}/${d.intervalo_dias} días`}
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, width: `${pct}%`, background: barColor, transition: 'width .3s' }} />
                  </div>
                </div>
                {pendiente && (
                  <button onClick={() => marcarCambiado(d.id)}
                    style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0, marginLeft: 8 }}>
                    ✓ Cambiado
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
