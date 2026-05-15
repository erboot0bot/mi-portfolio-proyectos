import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead, demoWrite } from '../../../data/demo/index.js'

const NIVELES = ['editar', 'ver', 'privado']

const NIVEL_CONFIG = {
  editar:  { icono: '🔓', label: 'Editar',  color: '#22c55e', bg: 'rgba(34,197,94,.12)'  },
  ver:     { icono: '👁️', label: 'Ver',     color: '#f59e0b', bg: 'rgba(245,158,11,.12)' },
  privado: { icono: '🔒', label: 'Privado', color: '#ef4444', bg: 'rgba(239,68,68,.12)'  },
}

const DEFAULT = {
  personas: [
    { id: 'maria', nombre: 'María', avatar: '👩', relacion: 'Pareja', color: '#8b5cf6' },
  ],
  secciones: [
    { id: 'lista-compra', label: 'Lista de compra',  icono: '🛒', nivel: 'editar'  },
    { id: 'nevera',       label: 'Nevera',            icono: '🧊', nivel: 'ver'     },
    { id: 'congelador',   label: 'Congelador',         icono: '❄️', nivel: 'ver'     },
    { id: 'despensa',     label: 'Despensa',           icono: '🥫', nivel: 'ver'     },
    { id: 'menu',         label: 'Menú',               icono: '🍽️', nivel: 'editar'  },
    { id: 'recetas',      label: 'Recetas',            icono: '👨‍🍳', nivel: 'editar'  },
    { id: 'limpieza',     label: 'Tareas de limpieza', icono: '🧹', nivel: 'editar'  },
    { id: 'bano',         label: 'Baño',               icono: '🪥', nivel: 'privado' },
    { id: 'finanzas',     label: 'Finanzas',           icono: '💰', nivel: 'privado' },
  ],
}

export default function ComparticionPanel() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const [data, setData] = useState(() => {
    if (mode !== 'demo') return DEFAULT
    const stored = demoRead(app.type ?? 'hogar', 'comparticion')
    return Array.isArray(stored) ? DEFAULT : (stored || DEFAULT)
  })

  function toggleNivel(seccionId) {
    setData(prev => {
      const secciones = prev.secciones.map(s => {
        if (s.id !== seccionId) return s
        const idx = NIVELES.indexOf(s.nivel)
        return { ...s, nivel: NIVELES[(idx + 1) % NIVELES.length] }
      })
      const next = { ...prev, secciones }
      if (mode === 'demo') demoWrite(app.type ?? 'hogar', 'comparticion', next)
      return next
    })
  }

  const persona  = data.personas[0]
  const editando = data.secciones.filter(s => s.nivel === 'editar').length
  const viendo   = data.secciones.filter(s => s.nivel === 'ver').length

  return (
    <div style={{ padding: '20px', maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>👥 Compartición</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
          Gestiona qué secciones compartes y con quién
        </p>
      </div>

      {/* Persona card */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
          background: `${persona.color}22`, border: `2px solid ${persona.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
        }}>
          {persona.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{persona.nombre}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{persona.relacion}</p>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'right', lineHeight: 1.7 }}>
          <div>🔓 {editando} secciones — editar</div>
          <div>👁️ {viendo} secciones — ver</div>
        </div>
      </div>

      {/* Secciones */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            Permisos por sección — pulsa para cambiar
          </p>
        </div>
        {data.secciones.map((s, i) => {
          const cfg = NIVEL_CONFIG[s.nivel]
          return (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 20px',
              borderBottom: i < data.secciones.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icono}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{s.label}</span>
              <button
                onClick={() => toggleNivel(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px', borderRadius: 20,
                  border: `1px solid ${cfg.color}55`,
                  background: cfg.bg, color: cfg.color,
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  transition: 'opacity .15s', fontFamily: 'var(--font-body)',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.7' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                {cfg.icono} {cfg.label}
              </button>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {Object.entries(NIVEL_CONFIG).map(([key, cfg]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span>{cfg.icono}</span>
            <strong style={{ color: cfg.color }}>{cfg.label}</strong>
            <span style={{ color: 'var(--text-faint)' }}>
              — {key === 'editar' ? 'puede añadir y editar' : key === 'ver' ? 'solo lectura' : 'no ve esta sección'}
            </span>
          </div>
        ))}
      </div>

      {/* Demo note */}
      {mode === 'demo' && (
        <p style={{ fontSize: 12, color: 'var(--text-faint)', fontStyle: 'italic', margin: 0, textAlign: 'center' }}>
          En la demo los cambios persisten durante la sesión. En producción se sincronizaría con la cuenta real de {persona.nombre}.
        </p>
      )}
    </div>
  )
}
