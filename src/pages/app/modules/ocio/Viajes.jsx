import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'
import { addCalendarEvent } from '../../../../utils/calendarUtils'

const inp = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }
const ESTADO_STYLE = {
  completado:  { bg: '#22c55e22', color: '#22c55e', label: 'Completado' },
  planificado: { bg: '#f59e0b22', color: '#f59e0b', label: 'Planificado' },
  cancelado:   { bg: '#ef444422', color: '#ef4444', label: 'Cancelado' },
}
const BLANK = { destino: '', pais: '', estado: 'planificado', fecha_inicio: '', fecha_fin: '', presupuesto: '', notas: '' }

export default function Viajes() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'ocio'
  const [items, setItems] = useState(() => demoRead(appType, 'viajes') ?? [])
  const [selectedId, setSelectedId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(BLANK)

  const save = next => { setItems(next); demoWrite(appType, 'viajes', next) }

  function addViajeToCalendar(viaje) {
    if (!viaje.fecha_inicio) return
    addCalendarEvent(appType, {
      event_type: 'travel_checkin',
      title: `✈️ Salida — ${viaje.destino}`,
      start_time: new Date(viaje.fecha_inicio + 'T00:00:00').toISOString(),
      all_day: true,
      metadata: { viaje_id: viaje.id, destino: viaje.destino },
    })
    if (viaje.fecha_fin && viaje.fecha_fin !== viaje.fecha_inicio) {
      addCalendarEvent(appType, {
        event_type: 'travel_checkout',
        title: `🏠 Vuelta — ${viaje.destino}`,
        start_time: new Date(viaje.fecha_fin + 'T00:00:00').toISOString(),
        all_day: true,
        metadata: { viaje_id: viaje.id, destino: viaje.destino },
      })
    }
  }

  function addViaje(e) {
    e.preventDefault()
    if (!form.destino.trim()) return
    save([...items, {
      id: crypto.randomUUID(), ...form,
      presupuesto: parseFloat(form.presupuesto) || 0,
      gasto_real: 0,
      alojamiento: { nombre: '', tipo: 'hotel', confirmacion: '', direccion: '' },
      transporte: [],
    }])
    setForm(BLANK); setShowAdd(false)
  }

  const selected = items.find(v => v.id === selectedId) ?? null

  if (selected) {
    const est = ESTADO_STYLE[selected.estado] ?? ESTADO_STYLE.planificado
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button onClick={() => setSelectedId(null)} style={{ marginBottom: 16, background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 14, padding: 0 }}>← Viajes</button>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: '2px solid #a855f7', borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{selected.destino}</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{selected.pais} · {selected.fecha_inicio} → {selected.fecha_fin}</p>
            </div>
            <span style={{ fontSize: 12, background: est.bg, color: est.color, borderRadius: 20, padding: '4px 12px', fontWeight: 600 }}>{est.label}</span>
          </div>
          {(selected.fecha_inicio || selected.fecha_fin) && (
            <button
              onClick={() => addViajeToCalendar(selected)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}
            >📅 Fechas al calendario</button>
          )}

          {/* Alojamiento */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Alojamiento</p>
            {selected.alojamiento.nombre
              ? <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{selected.alojamiento.nombre}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{selected.alojamiento.tipo} · {selected.alojamiento.direccion}</div>
                  {selected.alojamiento.confirmacion && <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>Ref: {selected.alojamiento.confirmacion}</div>}
                </div>
              : <p style={{ fontSize: 13, color: 'var(--text-faint)', fontStyle: 'italic' }}>Sin alojamiento registrado</p>
            }
          </div>

          {/* Transporte */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Transporte</p>
            {selected.transporte.length === 0
              ? <p style={{ fontSize: 13, color: 'var(--text-faint)', fontStyle: 'italic' }}>Sin transporte registrado</p>
              : selected.transporte.map(t => (
                <div key={t.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{t.tipo.charAt(0).toUpperCase() + t.tipo.slice(1)}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{t.origen} → {t.destino} · {t.referencia} · {t.fecha}</span>
                </div>
              ))
            }
          </div>

          {/* Presupuesto */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Presupuesto</p>
            <div style={{ display: 'flex', gap: 24 }}>
              <div><div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Estimado</div><div style={{ fontSize: 18, fontWeight: 700 }}>{selected.presupuesto}€</div></div>
              {selected.gasto_real > 0 && <div><div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Real</div><div style={{ fontSize: 18, fontWeight: 700, color: selected.gasto_real > selected.presupuesto ? '#ef4444' : '#22c55e' }}>{selected.gasto_real}€</div></div>}
            </div>
          </div>

          {selected.notas && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Notas</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{selected.notas}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>✈️ Viajes</h2>
        <button onClick={() => setShowAdd(v => !v)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Añadir</button>
      </div>
      {showAdd && (
        <form onSubmit={addViaje} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16, display: 'grid', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input placeholder="Destino *" value={form.destino} onChange={e => setForm(f => ({ ...f, destino: e.target.value }))} required style={inp} />
            <input placeholder="País" value={form.pais} onChange={e => setForm(f => ({ ...f, pais: e.target.value }))} style={inp} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <input type="date" value={form.fecha_inicio} onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))} style={inp} />
            <input type="date" value={form.fecha_fin} onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))} style={inp} />
            <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} style={inp}>
              <option value="planificado">Planificado</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <input type="number" placeholder="Presupuesto (€)" value={form.presupuesto} onChange={e => setForm(f => ({ ...f, presupuesto: e.target.value }))} style={inp} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAdd(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>Cancelar</button>
            <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
          </div>
        </form>
      )}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-faint)' }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>✈️</p>
          <p style={{ fontSize: 14 }}>Sin viajes registrados aún</p>
        </div>
      ) : items.map(v => {
        const est = ESTADO_STYLE[v.estado] ?? ESTADO_STYLE.planificado
        return (
          <div key={v.id} onClick={() => setSelectedId(v.id)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 10, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{v.destino} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>— {v.pais}</span></div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{v.fecha_inicio} → {v.fecha_fin}</div>
              </div>
              <span style={{ fontSize: 11, background: est.bg, color: est.color, borderRadius: 20, padding: '3px 10px', fontWeight: 600 }}>{est.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
