import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'
import { addCalendarEvent } from '../../../../utils/calendarUtils'

const PRESETS = [
  { nombre: 'Netflix',         icono: '🎬', coste: 15.99, periodicidad: 'mensual' },
  { nombre: 'Spotify',         icono: '🎵', coste: 9.99,  periodicidad: 'mensual' },
  { nombre: 'Disney+',         icono: '🏰', coste: 11.99, periodicidad: 'mensual' },
  { nombre: 'Amazon Prime',    icono: '📦', coste: 49.90, periodicidad: 'anual'   },
  { nombre: 'YouTube Premium', icono: '▶️', coste: 13.99, periodicidad: 'mensual' },
  { nombre: 'HBO Max',         icono: '🎭', coste: 8.99,  periodicidad: 'mensual' },
  { nombre: 'iCloud',          icono: '☁️', coste: 2.99,  periodicidad: 'mensual' },
  { nombre: 'Office 365',      icono: '📊', coste: 9.99,  periodicidad: 'mensual' },
]

const ESTADO_CYCLE = { activa: 'pausada', pausada: 'cancelada', cancelada: 'activa' }
const ESTADO_COLOR = { activa: 'var(--accent)', pausada: '#f59e0b', cancelada: 'var(--text-faint)' }

const BLANK = { nombre: '', icono: '📦', coste: '', periodicidad: 'mensual', compartida: false }

function mensualEquiv(sub) {
  if (sub.estado !== 'activa') return 0
  return sub.periodicidad === 'anual' ? sub.coste / 12 : sub.coste
}

export default function Suscripciones() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'finanzas'

  const [subs, setSubs] = useState(() => demoRead(appType, 'suscripciones') ?? [])
  const [form, setForm] = useState(BLANK)
  const [showForm, setShowForm] = useState(false)

  const save = (next) => { setSubs(next); demoWrite(appType, 'suscripciones', next) }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.coste) return
    const today = new Date()
    const renovacion = new Date(today)
    renovacion.setMonth(renovacion.getMonth() + (form.periodicidad === 'anual' ? 12 : 1))
    const entry = {
      id: crypto.randomUUID(),
      nombre: form.nombre.trim(),
      icono: form.icono || '📦',
      coste: parseFloat(form.coste),
      periodicidad: form.periodicidad,
      fecha_renovacion: renovacion.toISOString().slice(0, 10),
      estado: 'activa',
      compartida: form.compartida,
    }
    save([...subs, entry])
    setForm(BLANK)
    setShowForm(false)
  }

  const toggleEstado = (id) => {
    save(subs.map(s => s.id === id ? { ...s, estado: ESTADO_CYCLE[s.estado] } : s))
  }

  const deleteSub = (id) => save(subs.filter(s => s.id !== id))

  const applyPreset = (p) => {
    setForm({ nombre: p.nombre, icono: p.icono, coste: String(p.coste), periodicidad: p.periodicidad, compartida: false })
    setShowForm(true)
  }

  const totalMensual = subs.reduce((acc, s) => acc + mensualEquiv(s), 0)

  function addSubToCalendar(sub) {
    addCalendarEvent(appType, {
      event_type: 'subscription_renewal',
      title: `${sub.icono} ${sub.nombre} — renovación`,
      start_time: new Date(sub.fecha_renovacion + 'T08:00:00').toISOString(),
      all_day: true,
      recurrence: sub.periodicidad === 'mensual' ? 'monthly' : 'none',
      metadata: { sub_id: sub.id, coste: sub.coste, periodicidad: sub.periodicidad },
    })
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Suscripciones</h2>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total mensual activo</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
            {totalMensual.toFixed(2).replace('.', ',')} €
          </div>
        </div>
      </div>

      {/* Presets */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Añadir rápido:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {PRESETS.map(p => (
            <button key={p.nombre} onClick={() => applyPreset(p)}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.25rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text)' }}>
              {p.icono} {p.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Subscription list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {subs.map(sub => (
          <div key={sub.id}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: sub.estado === 'cancelada' ? 0.5 : 1 }}>
            <span style={{ fontSize: '2rem' }}>{sub.icono}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>{sub.nombre}</span>
                {sub.compartida && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>👥 compartida</span>}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Renovación: {sub.fecha_renovacion}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '1.1rem' }}>
                {sub.coste.toFixed(2).replace('.', ',')} €
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.periodicidad}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <button onClick={() => toggleEstado(sub.id)}
                style={{ background: 'none', border: `1px solid ${ESTADO_COLOR[sub.estado]}`, borderRadius: 6, padding: '0.2rem 0.5rem', cursor: 'pointer', color: ESTADO_COLOR[sub.estado], fontSize: '0.75rem', minWidth: 72 }}>
                {sub.estado}
              </button>
              <button onClick={() => addSubToCalendar(sub)} title="Añadir al calendario"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem' }}>📅</button>
              <button onClick={() => deleteSub(sub.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '0.9rem' }}>🗑</button>
            </div>
          </div>
        ))}
        {subs.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin suscripciones. Añade una arriba.</p>
        )}
      </div>

      {/* Add form toggle */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: `1px dashed var(--border)`, borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>
          + Añadir suscripción personalizada
        </button>
      ) : (
        <form onSubmit={handleAdd}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.5rem 1fr', gap: '0.5rem' }}>
            <input value={form.icono} onChange={e => setForm(f => ({ ...f, icono: e.target.value }))} maxLength={2}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem', color: 'var(--text)', textAlign: 'center', fontSize: '1.2rem' }} />
            <input placeholder="Nombre del servicio" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <input type="number" step="0.01" min="0" placeholder="Coste (€)" value={form.coste} onChange={e => setForm(f => ({ ...f, coste: e.target.value }))} required
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)' }} />
            <select value={form.periodicidad} onChange={e => setForm(f => ({ ...f, periodicidad: e.target.value }))}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)' }}>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.compartida} onChange={e => setForm(f => ({ ...f, compartida: e.target.checked }))} />
            Suscripción compartida
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit"
              style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              Añadir
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(BLANK) }}
              style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center' }}>
        💡 Demo — los cambios se guardan en esta sesión
      </p>
    </div>
  )
}
