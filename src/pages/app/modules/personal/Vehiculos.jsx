import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const MANT_TYPES = ['ITV', 'aceite', 'ruedas', 'frenos', 'bateria', 'filtro', 'correa', 'otro']
const MANT_ICONS = { ITV: '📋', aceite: '🛢️', ruedas: '🔄', frenos: '⚙️', bateria: '🔋', filtro: '🌀', correa: '⛓️', otro: '🔧' }
const BLANK_VEH  = { marca: '', modelo: '', anio: new Date().getFullYear(), matricula: '', color: '', itv_proxima: '', seguro_compania: '', seguro_vencimiento: '', taller: '' }
const BLANK_MANT = { type: 'aceite', date: new Date().toISOString().slice(0, 10), km: '', description: '', cost: '', next_km: '', next_date: '' }

function diasHasta(f) {
  if (!f) return null
  return Math.ceil((new Date(f + 'T12:00:00') - new Date(new Date().toDateString())) / 86400000)
}
function semaforo(dias, label) {
  if (dias === null) return { color: 'var(--text-faint)', text: `${label}: —` }
  if (dias < 0)  return { color: '#ef4444', text: `${label}: vencido` }
  if (dias < 30) return { color: '#ef4444', text: `${label}: ${dias} días` }
  if (dias < 90) return { color: '#f59e0b', text: `${label}: ${dias} días` }
  return { color: '#22c55e', text: `${label}: ${dias} días` }
}
const inp = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }
function TabBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '8px 14px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: active ? 700 : 500, color: active ? 'var(--accent)' : 'var(--text-muted)', background: 'none', border: 'none', borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer' }}>{label}</button>
  )
}

export default function Vehiculos() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'personal'

  const [vehiculos, setVehiculos]         = useState(() => demoRead(appType, 'vehiculos') ?? [])
  const [mantenimiento, setMantenimiento] = useState(() => demoRead(appType, 'vehiculos_mantenimiento') ?? [])
  const [selectedId, setSelectedId]       = useState(null)
  const [activeTab, setActiveTab]         = useState('ficha')

  const [showAdd, setShowAdd]         = useState(false)
  const [form, setForm]               = useState(BLANK_VEH)
  const [showMantForm, setShowMantForm] = useState(false)
  const [mantForm, setMantForm]       = useState(BLANK_MANT)
  const [incForms, setIncForms]       = useState({})
  const [mantCalLog, setMantCalLog]   = useState(null)
  const [mantCalDate, setMantCalDate] = useState('')

  const saveVehiculos     = (next) => { setVehiculos(next);     demoWrite(appType, 'vehiculos', next) }
  const saveMantenimiento = (next) => { setMantenimiento(next); demoWrite(appType, 'vehiculos_mantenimiento', next) }

  const selectedVeh = vehiculos.find(v => v.id === selectedId) ?? null
  const vehMant     = selectedVeh ? mantenimiento.filter(m => m.vehicle_id === selectedVeh.id).sort((a, b) => b.date.localeCompare(a.date)) : []
  const upcoming    = vehMant.filter(m => { const d = diasHasta(m.next_date); return d !== null && d <= 30 && d >= 0 })

  function handleAddVehicle(e) {
    e.preventDefault()
    if (!form.marca.trim() || !form.matricula.trim()) return
    saveVehiculos([...vehiculos, { ...form, id: crypto.randomUUID(), anio: Number(form.anio), incidencias: [] }])
    setForm(BLANK_VEH); setShowAdd(false)
  }
  function addIncidencia(vehId) {
    const desc = (incForms[vehId] ?? '').trim()
    if (!desc) return
    saveVehiculos(vehiculos.map(v => v.id === vehId ? { ...v, incidencias: [...(v.incidencias ?? []), { id: crypto.randomUUID(), fecha: new Date().toISOString().slice(0, 10), descripcion: desc }] } : v))
    setIncForms(f => ({ ...f, [vehId]: '' }))
  }
  function addMantLog() {
    if (!mantForm.type || !mantForm.date) return
    saveMantenimiento([{ id: crypto.randomUUID(), vehicle_id: selectedVeh.id, type: mantForm.type, date: mantForm.date, km: mantForm.km ? Number(mantForm.km) : null, description: mantForm.description.trim() || null, cost: mantForm.cost ? Number(mantForm.cost) : null, next_km: mantForm.next_km ? Number(mantForm.next_km) : null, next_date: mantForm.next_date || null, created_at: new Date().toISOString() }, ...mantenimiento])
    setMantForm(BLANK_MANT); setShowMantForm(false)
  }
  function addMantCalReminder() {
    if (!mantCalLog || !mantCalDate) return
    const events = demoRead(appType, 'events') ?? []
    demoWrite(appType, 'events', [...events, { id: crypto.randomUUID(), app_id: `demo-${appType}`, event_type: 'reminder', title: `Revisión ${mantCalLog.type} — ${selectedVeh.marca} ${selectedVeh.modelo}`, color: '#f59e0b', all_day: true, start_time: new Date(mantCalDate + 'T09:00:00').toISOString(), end_time: new Date(mantCalDate + 'T10:00:00').toISOString(), recurrence: null, metadata: { tipo: 'mantenimiento_vehiculo', vehicle_id: selectedVeh.id }, created_at: new Date().toISOString() }])
    setMantCalLog(null); setMantCalDate('')
  }

  // ── LIST VIEW ────────────────────────────────────────────────────
  if (!selectedVeh) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: 640 }}>
        <h2 style={{ margin: '0 0 1.25rem' }}>Vehículos</h2>
        {vehiculos.map(v => {
          const itv = semaforo(diasHasta(v.itv_proxima), 'ITV')
          const seg = semaforo(diasHasta(v.seguro_vencimiento), 'Seguro')
          return (
            <div key={v.id} onClick={() => { setSelectedId(v.id); setActiveTab('ficha') }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'border-color .15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <span style={{ fontSize: '2rem', flexShrink: 0 }}>🚗</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{v.marca} {v.modelo} <span style={{ color: 'var(--text-faint)', fontWeight: 400, fontSize: '0.9rem' }}>({v.anio})</span></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}><span>{v.matricula}</span> · <span>{v.color}</span></div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                  <span style={{ color: itv.color, fontWeight: 600 }}>{itv.text}</span>
                  <span style={{ color: seg.color, fontWeight: 600 }}>{seg.text}</span>
                </div>
              </div>
              <span style={{ color: 'var(--text-faint)', fontSize: 18 }}>›</span>
            </div>
          )
        })}
        {vehiculos.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin vehículos registrados.</p>}
        {!showAdd ? (
          <button onClick={() => setShowAdd(true)} style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>+ Añadir vehículo</button>
        ) : (
          <form onSubmit={handleAddVehicle} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 5rem', gap: '0.5rem' }}>
              <input placeholder="Marca *" value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))} required style={inp} autoFocus />
              <input placeholder="Modelo" value={form.modelo} onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))} style={inp} />
              <input type="number" placeholder="Año" value={form.anio} onChange={e => setForm(f => ({ ...f, anio: e.target.value }))} style={inp} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input placeholder="Matrícula *" value={form.matricula} onChange={e => setForm(f => ({ ...f, matricula: e.target.value }))} required style={inp} />
              <input placeholder="Color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={inp} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>ITV próxima</label><input type="date" value={form.itv_proxima} onChange={e => setForm(f => ({ ...f, itv_proxima: e.target.value }))} style={inp} /></div>
              <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Seguro vencimiento</label><input type="date" value={form.seguro_vencimiento} onChange={e => setForm(f => ({ ...f, seguro_vencimiento: e.target.value }))} style={inp} /></div>
            </div>
            <input placeholder="Compañía seguro" value={form.seguro_compania} onChange={e => setForm(f => ({ ...f, seguro_compania: e.target.value }))} style={inp} />
            <input placeholder="Taller de confianza" value={form.taller} onChange={e => setForm(f => ({ ...f, taller: e.target.value }))} style={inp} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Añadir</button>
              <button type="button" onClick={() => { setShowAdd(false); setForm(BLANK_VEH) }} style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    )
  }

  // ── DETAIL VIEW ──────────────────────────────────────────────────
  const v   = selectedVeh
  const itv = semaforo(diasHasta(v.itv_proxima), 'ITV')
  const seg = semaforo(diasHasta(v.seguro_vencimiento), 'Seguro')

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem 0' }}>
        <button onClick={() => setSelectedId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 22, padding: '0 4px' }}>‹</button>
        <span style={{ fontSize: '2rem' }}>🚗</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{v.marca} {v.modelo} <span style={{ color: 'var(--text-faint)', fontWeight: 400, fontSize: '0.9rem' }}>({v.anio})</span></div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><span>{v.matricula}</span> · <span>{v.color}</span></div>
        </div>
        <button onClick={() => { saveVehiculos(vehiculos.filter(x => x.id !== v.id)); setSelectedId(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: 16 }}>🗑</button>
      </div>
      <div style={{ display: 'flex', padding: '0 1.5rem', borderBottom: '1px solid var(--border)', marginTop: '0.5rem' }}>
        <TabBtn label="Ficha" active={activeTab === 'ficha'} onClick={() => setActiveTab('ficha')} />
        <TabBtn label="Mantenimiento" active={activeTab === 'mantenimiento'} onClick={() => setActiveTab('mantenimiento')} />
      </div>

      <div style={{ padding: '1.25rem 1.5rem' }}>

        {/* FICHA */}
        {activeTab === 'ficha' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Estado</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ color: itv.color, fontWeight: 600, fontSize: '0.85rem' }}>{itv.text}</span>
                  <span style={{ color: seg.color, fontWeight: 600, fontSize: '0.85rem' }}>{seg.text}</span>
                </div>
              </div>
              {v.seguro_compania && <div><div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Seguro</div><div style={{ fontSize: '0.85rem' }}>{v.seguro_compania}</div></div>}
              {v.taller && <div><div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Taller</div><div style={{ fontSize: '0.85rem' }}>🔧 {v.taller}</div></div>}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Incidencias</div>
              {(v.incidencias ?? []).map(inc => <div key={inc.id} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}><span style={{ color: 'var(--text-faint)', marginRight: '0.5rem' }}>{inc.fecha}</span>{inc.descripcion}</div>)}
              {(v.incidencias ?? []).length === 0 && <div style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>Sin incidencias.</div>}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <input placeholder="Nueva incidencia…" value={incForms[v.id] ?? ''} onChange={e => setIncForms(f => ({ ...f, [v.id]: e.target.value }))} style={{ ...inp, flex: 1 }} />
                <button onClick={() => addIncidencia(v.id)} style={{ padding: '0.5rem 0.75rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap', fontSize: 13 }}>+ Añadir</button>
              </div>
            </div>
          </div>
        )}

        {/* MANTENIMIENTO */}
        {activeTab === 'mantenimiento' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {upcoming.length > 0 && (
              <div style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.4)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 6 }}>⏰ Próximas revisiones</div>
                {upcoming.map(m => { const d = diasHasta(m.next_date); return <div key={m.id} style={{ fontSize: 12, color: 'var(--text-muted)' }}>{MANT_ICONS[m.type]} {m.type} — {d === 0 ? 'hoy' : `en ${d} días`}</div> })}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{vehMant.length} registro{vehMant.length !== 1 ? 's' : ''}</div>
              <button onClick={() => setShowMantForm(f => !f)} style={{ padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Mantenimiento</button>
            </div>
            {showMantForm && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select value={mantForm.type} onChange={e => setMantForm(f => ({ ...f, type: e.target.value }))} style={{ ...inp, flex: 1 }}>{MANT_TYPES.map(t => <option key={t} value={t}>{MANT_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}</select>
                    <input type="date" value={mantForm.date} onChange={e => setMantForm(f => ({ ...f, date: e.target.value }))} style={{ ...inp, flex: 1 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" min="0" value={mantForm.km} onChange={e => setMantForm(f => ({ ...f, km: e.target.value }))} placeholder="Km actuales" style={{ ...inp, flex: 1 }} />
                    <input type="number" min="0" step="0.01" value={mantForm.cost} onChange={e => setMantForm(f => ({ ...f, cost: e.target.value }))} placeholder="Coste (€)" style={{ ...inp, flex: 1 }} />
                  </div>
                  <input value={mantForm.description} onChange={e => setMantForm(f => ({ ...f, description: e.target.value }))} placeholder="Descripción" style={inp} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" min="0" value={mantForm.next_km} onChange={e => setMantForm(f => ({ ...f, next_km: e.target.value }))} placeholder="Próx. revisión (km)" style={{ ...inp, flex: 1 }} />
                    <input type="date" value={mantForm.next_date} onChange={e => setMantForm(f => ({ ...f, next_date: e.target.value }))} style={{ ...inp, flex: 1 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowMantForm(false)} style={{ padding: '7px 14px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
                    <button onClick={addMantLog} style={{ padding: '7px 14px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Guardar</button>
                  </div>
                </div>
              </div>
            )}
            {mantCalLog && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--accent)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📅 Recordatorio: {mantCalLog.type} — {v.marca} {v.modelo}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="date" value={mantCalDate} onChange={e => setMantCalDate(e.target.value)} style={{ ...inp, flex: 1 }} />
                  <button onClick={addMantCalReminder} disabled={!mantCalDate} style={{ padding: '8px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: mantCalDate ? 1 : 0.4 }}>Añadir</button>
                  <button onClick={() => { setMantCalLog(null); setMantCalDate('') }} style={{ padding: '8px 10px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              </div>
            )}
            {vehMant.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🔧</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Sin registros</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Registra el primer mantenimiento</div>
              </div>
            ) : vehMant.map(log => {
              const nextDays = diasHasta(log.next_date)
              const isNear   = nextDays !== null && nextDays <= 30 && nextDays >= 0
              return (
                <div key={log.id} style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${isNear ? 'rgba(245,158,11,.5)' : 'var(--border)'}`, background: isNear ? 'rgba(245,158,11,.05)' : 'var(--bg-card)' }}
                  onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-log'); if (b) b.style.opacity = '1' }}
                  onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-log'); if (b) b.style.opacity = '0' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{MANT_ICONS[log.type]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{log.type.charAt(0).toUpperCase() + log.type.slice(1)}</span>
                        {log.cost != null && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{Number(log.cost).toFixed(2)} €</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                        {new Date(log.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}{log.km ? ` · ${log.km.toLocaleString()} km` : ''}
                      </div>
                      {log.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{log.description}</div>}
                      {log.next_date && (
                        <div style={{ fontSize: 11, color: isNear ? '#f59e0b' : 'var(--text-faint)', marginTop: 4 }}>
                          Próx.: {new Date(log.next_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {nextDays !== null && ` (${nextDays === 0 ? 'hoy' : nextDays < 0 ? `hace ${Math.abs(nextDays)}d` : `en ${nextDays}d`})`}
                        </div>
                      )}
                      <button onClick={() => { setMantCalLog(log); setMantCalDate(log.next_date || new Date().toISOString().slice(0, 10)) }}
                        style={{ marginTop: 6, padding: '3px 8px', background: 'none', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11 }}>📅 Recordatorio</button>
                    </div>
                    <button className="del-log" onClick={() => saveMantenimiento(mantenimiento.filter(m => m.id !== log.id))}
                      style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}>×</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
