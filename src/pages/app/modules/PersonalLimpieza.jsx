import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead } from '../../../data/demo/index.js'

const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

export default function PersonalLimpieza() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const [personal, setPersonal] = useState(() =>
    mode === 'demo' ? (demoRead(app.type ?? 'hogar', 'personal_limpieza') ?? []) : []
  )
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ nombre: '', telefono: '', dias: [], hora: '10:00', tarifa: '', horas: '', notas: '' })

  function handleAdd() {
    if (!form.nombre.trim()) return
    const nuevo = {
      id: crypto.randomUUID(),
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      dias: form.dias,
      hora: form.hora,
      tarifa: Number(form.tarifa) || 0,
      unidad_tarifa: '€/hora',
      horas_por_sesion: Number(form.horas) || 2,
      notas: form.notas.trim(),
      tareas: [],
      activo: true,
    }
    setPersonal(prev => [...prev, nuevo])
    setForm({ nombre: '', telefono: '', dias: [], hora: '10:00', tarifa: '', horas: '', notas: '' })
    setShowAdd(false)
  }

  function toggleDia(dia) {
    setForm(p => ({
      ...p,
      dias: p.dias.includes(dia) ? p.dias.filter(d => d !== dia) : [...p.dias, dia],
    }))
  }

  function eliminar(id) {
    setPersonal(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Personal de limpieza</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {personal.length === 0 ? 'Sin personal registrado' : `${personal.length} persona${personal.length !== 1 ? 's' : ''}`}
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
          <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Nueva persona</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre *" autoFocus
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
              placeholder="Teléfono"
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 6 }}>Días que viene</label>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {DIAS_SEMANA.map(dia => (
                  <button key={dia} onClick={() => toggleDia(dia)}
                    style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      background: form.dias.includes(dia) ? 'var(--accent)' : 'var(--bg)',
                      color: form.dias.includes(dia) ? '#fff' : 'var(--text-muted)',
                      border: form.dias.includes(dia) ? 'none' : '1px solid var(--border)',
                    }}>
                    {dia.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Hora llegada</label>
                <input type="time" value={form.hora} onChange={e => setForm(p => ({ ...p, hora: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>€/hora</label>
                <input type="number" min="0" value={form.tarifa} onChange={e => setForm(p => ({ ...p, tarifa: e.target.value }))}
                  placeholder="12"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Horas/sesión</label>
                <input type="number" min="1" value={form.horas} onChange={e => setForm(p => ({ ...p, horas: e.target.value }))}
                  placeholder="3"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
            </div>
            <textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
              placeholder="Notas (tiene llave, trae productos...)" rows={2}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', resize: 'vertical' }} />
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
      {personal.length === 0 && !showAdd ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>👷</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin personal registrado</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade a las personas que te ayudan con la limpieza</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {personal.map(p => {
            const costeSession = (p.tarifa ?? 0) * (p.horas_por_sesion ?? 0)
            const costeMes = costeSession * (p.dias?.length ?? 0) * 4
            return (
              <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>👤 {p.nombre}</p>
                    {p.telefono && <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>📞 {p.telefono}</p>}
                  </div>
                  <button className="del-btn" onClick={() => eliminar(p.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
                  >×</button>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {(p.dias ?? []).map(dia => (
                    <span key={dia} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(254,112,0,0.1)', color: 'var(--accent)' }}>
                      {dia}
                    </span>
                  ))}
                  {p.hora && <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>🕙 {p.hora}</span>}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                  {p.tarifa > 0 && <span>💶 {p.tarifa}€/h · {p.horas_por_sesion}h = <strong style={{ color: 'var(--text)' }}>{costeSession}€/sesión</strong></span>}
                  {costeMes > 0 && <span>≈ <strong style={{ color: 'var(--text)' }}>{costeMes}€/mes</strong></span>}
                </div>
                {p.notas && <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>💬 {p.notas}</p>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
