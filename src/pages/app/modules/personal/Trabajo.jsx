import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../../contexts/ModeContext'
import { demoRead } from '../../../../data/demo/index.js'

const DIAS_LABEL = {
  lunes: 'L', martes: 'M', miércoles: 'X',
  jueves: 'J', viernes: 'V', sábado: 'S', domingo: 'D',
}
const TODOS_DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

export default function Trabajo() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const raw    = mode === 'demo' ? demoRead(app.type ?? 'personal', 'trabajo') : null
  const trabajo = Array.isArray(raw) ? null : raw

  if (!trabajo) return (
    <div style={{ padding: '20px', maxWidth: 560 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>💼 Trabajo</h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
        Configura tu horario laboral para ver los bloques de trabajo en el Calendario.
      </p>
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>💼 Trabajo</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
          Tu configuración laboral. Los bloques aparecen en el Calendario.
        </p>
      </div>

      {/* Empresa */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <span style={{ fontSize: 32 }}>🏢</span>
        <div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{trabajo.empresa}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>📍 {trabajo.municipio}</p>
        </div>
      </div>

      {/* Horario */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          Horario
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text)' }}>Horas</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            {trabajo.horario.inicio} – {trabajo.horario.fin}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text)' }}>Modalidad</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', textTransform: 'capitalize' }}>
            {trabajo.horario.modalidad}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text)' }}>Días</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {TODOS_DIAS.map(d => {
              const activo = trabajo.horario.dias.includes(d)
              return (
                <span key={d} style={{
                  width: 24, height: 24, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                  background: activo ? 'var(--accent)' : 'var(--bg)',
                  color: activo ? '#fff' : 'var(--text-faint)',
                  border: `1px solid ${activo ? 'var(--accent)' : 'var(--border)'}`,
                }}>
                  {DIAS_LABEL[d]}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* Trayecto */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          Trayecto
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text)' }}>Tiempo estimado</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{trabajo.trayecto.tiempo_min} min</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text)' }}>Transporte</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{trabajo.trayecto.transporte}</span>
        </div>
      </div>

      {/* Demo note */}
      {mode === 'demo' && (
        <p style={{ fontSize: 12, color: 'var(--text-faint)', fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
          En la demo los datos son de ejemplo. En producción configurarías tu propio horario.
        </p>
      )}
    </div>
  )
}
