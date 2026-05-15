import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../../contexts/ModeContext'
import { demoRead, demoWrite } from '../../../../data/demo/index.js'

const TIPO_CONFIG = {
  medico_cabecera: { label: 'Médico de cabecera', icono: '👨‍⚕️' },
  dentista:        { label: 'Dentista',            icono: '🦷'    },
  especialista:    { label: 'Especialista',        icono: '🏥'    },
}

function diasHasta(fechaStr) {
  if (!fechaStr) return null
  return Math.round((new Date(fechaStr) - new Date()) / (1000 * 60 * 60 * 24))
}

export default function Salud() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const [contactos] = useState(() =>
    mode === 'demo' ? (demoRead(app.type ?? 'personal', 'salud_contactos') ?? []) : []
  )

  const [habitos, setHabitos] = useState(() =>
    mode === 'demo' ? (demoRead(app.type ?? 'personal', 'habitos') ?? []) : []
  )

  function toggleHabito(id) {
    setHabitos(prev => {
      const next = prev.map(h => {
        if (h.id !== id) return h
        const completado_hoy = !h.completado_hoy
        const racha = completado_hoy ? h.racha + 1 : Math.max(0, h.racha - 1)
        return { ...h, completado_hoy, racha }
      })
      if (mode === 'demo') demoWrite(app.type ?? 'personal', 'habitos', next)
      return next
    })
  }

  const completadosHoy = habitos.filter(h => h.completado_hoy).length
  const todosCompletos = habitos.length > 0 && completadosHoy === habitos.length

  return (
    <div style={{ padding: '20px', maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>🏥 Salud</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
          Contactos médicos y seguimiento diario de hábitos
        </p>
      </div>

      {/* Contactos */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            Contactos médicos
          </p>
        </div>
        {contactos.length === 0 ? (
          <p style={{ margin: 0, padding: '16px 20px', fontSize: 13, color: 'var(--text-faint)' }}>Sin contactos registrados</p>
        ) : contactos.map((c, i) => {
          const cfg = TIPO_CONFIG[c.tipo] ?? { label: c.tipo, icono: '👤' }
          const diasProx = diasHasta(c.proxima_visita)
          const alertaProx = diasProx !== null && diasProx < 30
          return (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 20px',
              borderBottom: i < contactos.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{cfg.icono}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{c.nombre}</p>
                <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                  {cfg.label}{c.especialidad ? ` · ${c.especialidad}` : ''} · {c.centro}
                </p>
                {c.proxima_visita && (
                  <p style={{ margin: '3px 0 0', fontSize: 11, color: alertaProx ? '#f59e0b' : 'var(--text-faint)' }}>
                    {alertaProx ? '⚠️ ' : ''}Próxima: {c.proxima_visita}
                  </p>
                )}
              </div>
              <a href={`tel:${c.telefono}`}
                style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', flexShrink: 0, marginTop: 2 }}>
                📞 {c.telefono}
              </a>
            </div>
          )
        })}
      </div>

      {/* Hábitos */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{
          padding: '12px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            Hábitos de hoy
          </p>
          <span style={{ fontSize: 12, fontWeight: 700, color: todosCompletos ? '#22c55e' : 'var(--text-muted)' }}>
            {completadosHoy}/{habitos.length}
          </span>
        </div>
        {habitos.length === 0 ? (
          <p style={{ margin: 0, padding: '16px 20px', fontSize: 13, color: 'var(--text-faint)' }}>Sin hábitos configurados</p>
        ) : habitos.map((h, i) => (
          <div key={h.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 20px',
            borderBottom: i < habitos.length - 1 ? '1px solid var(--border)' : 'none',
            opacity: h.completado_hoy ? 0.7 : 1,
            transition: 'opacity .2s',
          }}>
            {/* Toggle */}
            <button
              onClick={() => toggleHabito(h.id)}
              style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${h.completado_hoy ? '#22c55e' : 'var(--border)'}`,
                background: h.completado_hoy ? '#22c55e' : 'transparent',
                color: '#fff', cursor: 'pointer', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .15s',
              }}
            >
              {h.completado_hoy ? '✓' : ''}
            </button>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{h.icono}</span>
            <span style={{
              flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text)',
              textDecoration: h.completado_hoy ? 'line-through' : 'none',
            }}>
              {h.nombre}
            </span>
            {/* Historial (últimos 7 días como dots) */}
            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              {(h.historial ?? []).slice(-7).map((done, idx) => (
                <div key={idx} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: done ? '#22c55e' : 'var(--border)',
                }} />
              ))}
            </div>
            {/* Racha */}
            {h.racha > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', flexShrink: 0 }}>
                🔥 {h.racha}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
