import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead } from '../../../data/demo/index.js'

function diasDesde(fechaStr) {
  if (!fechaStr) return null
  const diff = Math.round((new Date() - new Date(fechaStr)) / (1000 * 60 * 60 * 24))
  return diff
}

function diasPara(fechaStr) {
  if (!fechaStr) return null
  const diff = Math.round((new Date(fechaStr) - new Date()) / (1000 * 60 * 60 * 24))
  return diff
}

export default function Roomba() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const initial = mode === 'demo' ? (demoRead(app.type ?? 'hogar', 'roomba') ?? null) : null
  const [roomba, setRoomba] = useState(initial)
  const [consumibles, setConsumibles] = useState(initial?.consumibles ?? [])

  if (!roomba) {
    return (
      <div style={{ padding: '20px', maxWidth: 640 }}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: 48, margin: '0 0 12px' }}>🤖</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>Sin Roomba configurado</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade tu robot aspirador para gestionar sus mantenimientos</p>
        </div>
      </div>
    )
  }

  function marcarConsumible(id) {
    setConsumibles(prev => prev.map(c =>
      c.id === id ? { ...c, ultimo_cambio: new Date().toISOString().slice(0, 10) } : c
    ))
  }

  const proximoPase = diasPara(roomba.proximo_pase)
  const ultimoPase  = diasDesde(roomba.ultimo_pase)

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>🤖 Roomba</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>{roomba.modelo}</p>
      </div>

      {/* Estado */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
        <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Estado</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-tech)' }}>
              {ultimoPase === 0 ? 'Hoy' : `${ultimoPase}d`}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>Último pase</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: proximoPase <= 0 ? '#ef4444' : 'var(--accent)', fontFamily: 'var(--font-tech)' }}>
              {proximoPase <= 0 ? '¡Hoy!' : `En ${proximoPase}d`}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>Próximo pase</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-tech)' }}>
              {roomba.duracion_ultimo}m
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>Duración último</p>
          </div>
        </div>
      </div>

      {/* Consumibles */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
        <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Consumibles</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {consumibles.map(c => {
            const dias = diasDesde(c.ultimo_cambio)
            const pendiente = dias >= c.cada_dias
            const porcentaje = Math.min(100, Math.round((dias / c.cada_dias) * 100))
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{c.icono}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: pendiente ? '#ef4444' : 'var(--text)' }}>{c.nombre}</span>
                    <span style={{ fontSize: 11, color: pendiente ? '#ef4444' : 'var(--text-muted)' }}>
                      {pendiente ? '¡Cambiar ya!' : `${dias}/${c.cada_dias} días`}
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, width: `${porcentaje}%`, background: pendiente ? '#ef4444' : 'var(--accent)', transition: 'width .3s' }} />
                  </div>
                </div>
                {pendiente && (
                  <button onClick={() => marcarConsumible(c.id)}
                    style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
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
