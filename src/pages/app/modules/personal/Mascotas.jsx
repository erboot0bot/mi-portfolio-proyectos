import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

// ── Constants ──────────────────────────────────────────────────────
const ESPECIE_ICON = { perro: '🐕', gato: '🐈', conejo: '🐇', otro: '🐾' }
const SALUD_TIPOS = {
  vaccination: { label: 'Vacuna',     icon: '💉' },
  vet_visit:   { label: 'Visita vet', icon: '🩺' },
  medication:  { label: 'Medicación', icon: '💊' },
}

// ── Helpers ────────────────────────────────────────────────────────
function diasHasta(f) {
  if (!f) return null
  return Math.ceil((new Date(f.slice(0, 10) + 'T12:00:00') - new Date(new Date().toDateString())) / 86400000)
}
function semVac(dias) {
  if (dias === null) return { color: 'var(--text-faint)', label: '—' }
  if (dias < 0)  return { color: '#ef4444', label: 'Vencida' }
  if (dias < 30) return { color: '#ef4444', label: `${dias}d` }
  if (dias < 90) return { color: '#f59e0b', label: `${dias}d` }
  return { color: '#22c55e', label: `${dias}d` }
}
function fmtSaludDue(isoStr) {
  const dias = diasHasta(isoStr)
  if (dias < 0) return { label: `Hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`, overdue: true }
  if (dias === 0) return { label: 'Hoy', overdue: false }
  if (dias === 1) return { label: 'Mañana', overdue: false }
  return { label: `En ${dias} días`, overdue: false }
}
function fmtWalkTime(isoStr) {
  const d = new Date(isoStr)
  const diff = Math.round((new Date(new Date().toDateString()) - new Date(d.toDateString())) / 86400000)
  const time = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  if (diff === 0) return `Hoy · ${time}`
  if (diff === 1) return `Ayer · ${time}`
  return `${d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })} · ${time}`
}
const inp = {
  background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
  padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none',
  width: '100%', boxSizing: 'border-box',
}
function TabBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 12px', borderRadius: '8px 8px 0 0', fontSize: 13,
      fontWeight: active ? 700 : 500,
      color: active ? 'var(--accent)' : 'var(--text-muted)',
      background: 'none', border: 'none',
      borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
      cursor: 'pointer', whiteSpace: 'nowrap',
    }}>{label}</button>
  )
}

// ── AlimentaciónTab sub-component ──────────────────────────────────
function AlimentacionTab({ pet, onUpdatePet }) {
  const stock = pet.alimentacion_stock ?? []
  const sched = pet.alimentacion_schedule ?? []
  const lowStock = stock.filter(i => i.min_stock > 0 && (i.current_stock ?? 0) <= i.min_stock)

  const [showAddItem, setShowAddItem] = useState(false)
  const [itemForm, setItemForm] = useState({ nombre: '', current_stock: '', min_stock: '', unit: 'g' })
  const [showAddToma, setShowAddToma] = useState(false)
  const [tomaForm, setTomaForm] = useState({ time: '08:00', amount: '', label: 'Mañana' })

  function adjustStock(itemId, delta) {
    onUpdatePet({ alimentacion_stock: stock.map(i => i.id === itemId ? { ...i, current_stock: Math.max(0, (i.current_stock ?? 0) + delta) } : i) })
  }
  function handleAddItem() {
    if (!itemForm.nombre.trim()) return
    onUpdatePet({ alimentacion_stock: [...stock, { id: crypto.randomUUID(), nombre: itemForm.nombre.trim(), current_stock: Number(itemForm.current_stock) || 0, min_stock: Number(itemForm.min_stock) || 0, unit: itemForm.unit || 'g' }] })
    setItemForm({ nombre: '', current_stock: '', min_stock: '', unit: 'g' }); setShowAddItem(false)
  }
  function handleAddToma() {
    if (!tomaForm.amount.trim()) return
    onUpdatePet({ alimentacion_schedule: [...sched, { time: tomaForm.time, amount: tomaForm.amount.trim(), label: tomaForm.label.trim() || tomaForm.time }] })
    setTomaForm({ time: '08:00', amount: '', label: 'Mañana' }); setShowAddToma(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stock */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>🏪 Stock de alimento</div>
          <button onClick={() => setShowAddItem(f => !f)} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Añadir</button>
        </div>
        {lowStock.length > 0 && (
          <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>⚠ Stock bajo</div>
            {lowStock.map(i => <div key={i.id} style={{ fontSize: 12, color: 'var(--text-muted)' }}>{i.nombre} — {i.current_stock} {i.unit} (mín. {i.min_stock})</div>)}
          </div>
        )}
        {showAddItem && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input value={itemForm.nombre} onChange={e => setItemForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Nombre del alimento *" autoFocus style={inp} />
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" min="0" value={itemForm.current_stock} onChange={e => setItemForm(f => ({ ...f, current_stock: e.target.value }))} placeholder="Stock" style={{ ...inp, flex: 1 }} />
                <input type="number" min="0" value={itemForm.min_stock} onChange={e => setItemForm(f => ({ ...f, min_stock: e.target.value }))} placeholder="Mínimo" style={{ ...inp, flex: 1 }} />
                <input value={itemForm.unit} onChange={e => setItemForm(f => ({ ...f, unit: e.target.value }))} placeholder="Unidad" style={{ ...inp, width: 70 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAddItem(false)} style={{ padding: '6px 12px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
                <button onClick={handleAddItem} disabled={!itemForm.nombre.trim()} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: itemForm.nombre.trim() ? 1 : 0.4 }}>Añadir</button>
              </div>
            </div>
          </div>
        )}
        {stock.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>Sin alimentos registrados.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {stock.map(item => {
              const isLow = item.min_stock > 0 && (item.current_stock ?? 0) <= item.min_stock
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${isLow ? 'rgba(239,68,68,.4)' : 'var(--border)'}`, background: 'var(--bg-card)' }}
                  onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-item'); if (b) b.style.opacity = '1' }}
                  onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-item'); if (b) b.style.opacity = '0' }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isLow ? '#ef4444' : 'var(--text)' }}>{isLow ? '⚠ ' : ''}{item.nombre}</div>
                    {item.min_stock > 0 && <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>mín. {item.min_stock} {item.unit}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => adjustStock(item.id, -1)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>−</button>
                    <span style={{ minWidth: 48, textAlign: 'center', fontSize: 14, fontWeight: 700 }}>{item.current_stock ?? 0}<span style={{ fontSize: 10, color: 'var(--text-faint)', marginLeft: 2 }}>{item.unit}</span></span>
                    <button onClick={() => adjustStock(item.id, 1)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>+</button>
                  </div>
                  <button className="del-item" onClick={() => onUpdatePet({ alimentacion_stock: stock.filter(i => i.id !== item.id) })}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 17, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}>×</button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Horario de tomas */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>🕐 Horario de tomas</div>
          <button onClick={() => setShowAddToma(f => !f)} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Añadir</button>
        </div>
        {showAddToma && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Hora</label><input type="time" value={tomaForm.time} onChange={e => setTomaForm(f => ({ ...f, time: e.target.value }))} style={inp} /></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Cantidad *</label><input value={tomaForm.amount} onChange={e => setTomaForm(f => ({ ...f, amount: e.target.value }))} placeholder="200g" style={inp} /></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Etiqueta</label><input value={tomaForm.label} onChange={e => setTomaForm(f => ({ ...f, label: e.target.value }))} placeholder="Mañana" style={inp} /></div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAddToma(false)} style={{ padding: '6px 12px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
                <button onClick={handleAddToma} disabled={!tomaForm.amount.trim()} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: tomaForm.amount.trim() ? 1 : 0.4 }}>Guardar</button>
              </div>
            </div>
          </div>
        )}
        {sched.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>Sin tomas programadas.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sched.map((toma, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)' }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-toma'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-toma'); if (b) b.style.opacity = '0' }}
              >
                <span style={{ fontSize: 20 }}>🕐</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{toma.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{toma.time} · {toma.amount}</div>
                </div>
                <button className="del-toma" onClick={() => onUpdatePet({ alimentacion_schedule: sched.filter((_, i) => i !== idx) })}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 17, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────
export default function Mascotas() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'personal'

  const [mascotas, setMascotas] = useState(() => demoRead(appType, 'mascotas') ?? [])
  const [eventos, setEventos]   = useState(() => demoRead(appType, 'mascotas_eventos') ?? [])
  const [selectedId, setSelectedId] = useState(null)
  const [activeTab, setActiveTab]   = useState('ficha')

  // Add-pet form
  const BLANK = { icono: '🐾', nombre: '', especie: 'perro', raza: '', edad_anios: '', notas: '' }
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState(BLANK)

  // Salud form
  const BLANK_SAL = { titulo: '', tipo: 'vet_visit', date: '', notes: '', interval_days: '' }
  const [showSaludForm, setShowSaludForm] = useState(false)
  const [saludForm, setSaludForm]         = useState(BLANK_SAL)

  // Walk form
  const [showWalkForm, setShowWalkForm] = useState(false)
  const [walkForm, setWalkForm]         = useState({ duration: '', notes: '' })

  // Cage maintenance form
  const BLANK_MANT = { titulo: '', date: '', interval_days: '', products: '' }
  const [showMantForm, setShowMantForm] = useState(false)
  const [mantForm, setMantForm]         = useState(BLANK_MANT)

  // Calendar reminder
  const [calForm, setCalForm] = useState(null) // { titulo, date } | null

  // Writers
  const saveMascotas = (next) => { setMascotas(next); demoWrite(appType, 'mascotas', next) }
  const saveEventos  = (next) => { setEventos(next);  demoWrite(appType, 'mascotas_eventos', next) }
  const updatePet    = (id, patch) => saveMascotas(mascotas.map(m => m.id === id ? { ...m, ...patch } : m))

  // Derived
  const selectedPet = mascotas.find(m => m.id === selectedId) ?? null
  const petEventos  = selectedPet ? eventos.filter(e => e.pet_id === selectedPet.id) : []
  const saludEvs    = petEventos.filter(e => ['vaccination', 'vet_visit', 'medication'].includes(e.tipo)).sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
  const weekAgo     = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
  const paseos      = petEventos.filter(e => e.tipo === 'walk' && new Date(e.start_time) >= weekAgo).sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
  const mantTasks   = petEventos.filter(e => e.tipo === 'cage_maintenance').sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
  const todayStart  = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayPaseos = paseos.filter(p => new Date(p.start_time) >= todayStart)
  const todayMins   = todayPaseos.reduce((acc, p) => acc + (p.metadata?.duration_minutes ?? 0), 0)
  const isPerro     = selectedPet?.especie === 'perro'
  const tabs        = isPerro
    ? [['ficha', 'Ficha'], ['alimentacion', 'Alimentación'], ['salud', 'Salud'], ['paseos', '🦮 Paseos']]
    : [['ficha', 'Ficha'], ['alimentacion', 'Alimentación'], ['salud', 'Salud'], ['mantenimiento', '🏠 Mantenim.']]

  // Handlers
  function handleAddPet(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return
    saveMascotas([...mascotas, { ...form, id: crypto.randomUUID(), edad_anios: Number(form.edad_anios) || 0, vacunas: [], medicacion: [], alimentacion_stock: [], alimentacion_schedule: [] }])
    setForm(BLANK); setShowAdd(false)
  }
  function addSaludEvent() {
    if (!saludForm.titulo.trim() || !saludForm.date) return
    saveEventos([...eventos, {
      id: crypto.randomUUID(), pet_id: selectedPet.id,
      tipo: saludForm.tipo, titulo: saludForm.titulo.trim(),
      start_time: new Date(saludForm.date + 'T09:00:00').toISOString(),
      all_day: true,
      metadata: { notes: saludForm.notes.trim() || null, interval_days: saludForm.interval_days && Number(saludForm.interval_days) > 0 ? Number(saludForm.interval_days) : null, duration_minutes: null },
      created_at: new Date().toISOString(),
    }])
    setSaludForm(BLANK_SAL); setShowSaludForm(false)
  }
  function markSaludDone(ev) {
    const rest = eventos.filter(e => e.id !== ev.id)
    if (ev.metadata?.interval_days) {
      const next = new Date(); next.setDate(next.getDate() + Number(ev.metadata.interval_days))
      saveEventos([...rest, { ...ev, id: crypto.randomUUID(), start_time: new Date(next.toISOString().slice(0, 10) + 'T09:00:00').toISOString(), created_at: new Date().toISOString() }])
    } else {
      saveEventos(rest)
    }
  }
  function registerWalk() {
    saveEventos([...eventos, { id: crypto.randomUUID(), pet_id: selectedPet.id, tipo: 'walk', titulo: 'Paseo', start_time: new Date().toISOString(), all_day: false, metadata: { duration_minutes: walkForm.duration ? Number(walkForm.duration) : null, notes: walkForm.notes.trim() || null, interval_days: null }, created_at: new Date().toISOString() }])
    setWalkForm({ duration: '', notes: '' }); setShowWalkForm(false)
  }
  function addMantTask() {
    if (!mantForm.titulo.trim() || !mantForm.date) return
    saveEventos([...eventos, { id: crypto.randomUUID(), pet_id: selectedPet.id, tipo: 'cage_maintenance', titulo: mantForm.titulo.trim(), start_time: new Date(mantForm.date + 'T09:00:00').toISOString(), all_day: true, metadata: { interval_days: mantForm.interval_days && Number(mantForm.interval_days) > 0 ? Number(mantForm.interval_days) : null, products: mantForm.products.trim() || null, duration_minutes: null, notes: null }, created_at: new Date().toISOString() }])
    setMantForm(BLANK_MANT); setShowMantForm(false)
  }
  function markMantDone(ev) {
    const rest = eventos.filter(e => e.id !== ev.id)
    if (ev.metadata?.interval_days) {
      const next = new Date(); next.setDate(next.getDate() + Number(ev.metadata.interval_days))
      saveEventos([...rest, { ...ev, id: crypto.randomUUID(), start_time: new Date(next.toISOString().slice(0, 10) + 'T09:00:00').toISOString(), created_at: new Date().toISOString() }])
    } else {
      saveEventos(rest)
    }
  }
  function addCalReminder() {
    if (!calForm?.date) return
    const events = demoRead(appType, 'events') ?? []
    demoWrite(appType, 'events', [...events, { id: crypto.randomUUID(), app_id: `demo-${appType}`, event_type: 'reminder', title: calForm.titulo, color: '#a855f7', all_day: true, start_time: new Date(calForm.date + 'T09:00:00').toISOString(), end_time: new Date(calForm.date + 'T10:00:00').toISOString(), recurrence: null, metadata: { tipo: 'veterinario', pet_id: selectedPet.id }, created_at: new Date().toISOString() }])
    setCalForm(null)
  }

  // ── LIST VIEW ────────────────────────────────────────────────────
  if (!selectedPet) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: 640 }}>
        <h2 style={{ margin: '0 0 1.25rem' }}>Mascotas</h2>
        {mascotas.map(m => {
          const icon = m.icono || ESPECIE_ICON[m.especie] || '🐾'
          const hasUrgent = (m.vacunas ?? []).some(v => { const d = diasHasta(v.proxima); return d !== null && d < 30 })
          return (
            <div key={m.id} onClick={() => { setSelectedId(m.id); setActiveTab('ficha') }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'border-color .15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <span style={{ fontSize: '2.5rem', flexShrink: 0 }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{m.nombre}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{m.raza} · {m.edad_anios} {m.edad_anios === 1 ? 'año' : 'años'}</div>
                {hasUrgent && <div style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 2 }}>⚠ Vacuna próxima</div>}
              </div>
              <span style={{ color: 'var(--text-faint)', fontSize: 18 }}>›</span>
            </div>
          )
        })}
        {mascotas.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin mascotas.</p>}
        {!showAdd ? (
          <button onClick={() => setShowAdd(true)} style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>+ Añadir mascota</button>
        ) : (
          <form onSubmit={handleAddPet} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2.5rem 1fr 1fr', gap: '0.5rem' }}>
              <input value={form.icono} onChange={e => setForm(f => ({ ...f, icono: e.target.value }))} maxLength={2} style={{ ...inp, textAlign: 'center', fontSize: '1.2rem', padding: '0.5rem' }} />
              <input placeholder="Nombre *" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required style={inp} autoFocus />
              <select value={form.especie} onChange={e => setForm(f => ({ ...f, especie: e.target.value }))} style={inp}>
                <option value="perro">🐕 Perro</option><option value="gato">🐈 Gato</option><option value="conejo">🐇 Conejo</option><option value="otro">🐾 Otro</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 4rem', gap: '0.5rem' }}>
              <input placeholder="Raza" value={form.raza} onChange={e => setForm(f => ({ ...f, raza: e.target.value }))} style={inp} />
              <input type="number" min="0" placeholder="Edad" value={form.edad_anios} onChange={e => setForm(f => ({ ...f, edad_anios: e.target.value }))} style={inp} />
            </div>
            <input placeholder="Notas" value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} style={inp} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Añadir</button>
              <button type="button" onClick={() => { setShowAdd(false); setForm(BLANK) }} style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    )
  }

  // ── DETAIL VIEW ──────────────────────────────────────────────────
  const pet  = selectedPet
  const icon = pet.icono || ESPECIE_ICON[pet.especie] || '🐾'

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem 0' }}>
        <button onClick={() => setSelectedId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 22, padding: '0 4px', flexShrink: 0 }}>‹</button>
        <span style={{ fontSize: '2rem', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>{pet.nombre}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pet.raza} · {pet.edad_anios} años</div>
        </div>
        <button onClick={() => { saveMascotas(mascotas.filter(m => m.id !== pet.id)); setSelectedId(null) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: 16 }}>🗑</button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', padding: '0 1.5rem', borderBottom: '1px solid var(--border)', overflowX: 'auto', marginTop: '0.5rem' }}>
        {tabs.map(([val, label]) => <TabBtn key={val} label={label} active={activeTab === val} onClick={() => setActiveTab(val)} />)}
      </div>

      <div style={{ padding: '1.25rem 1.5rem' }}>

        {/* FICHA */}
        {activeTab === 'ficha' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Veterinario</div>
              {pet.veterinario?.nombre ? (
                <div style={{ fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 600 }}>{pet.veterinario.nombre}</span>
                  {pet.veterinario.telefono && <span style={{ color: 'var(--text-muted)', marginLeft: '0.75rem' }}>📞 {pet.veterinario.telefono}</span>}
                  {pet.veterinario.direccion && <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginTop: 2 }}>📍 {pet.veterinario.direccion}</div>}
                </div>
              ) : <span style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>Sin veterinario.</span>}
              {!calForm ? (
                <button onClick={() => setCalForm({ titulo: `Cita veterinario — ${pet.nombre}`, date: '' })}
                  style={{ marginTop: '0.5rem', padding: '5px 10px', background: 'none', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>📅 Pedir cita</button>
              ) : (
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input value={calForm.titulo} onChange={e => setCalForm(f => ({ ...f, titulo: e.target.value }))} style={{ ...inp, flex: 1, minWidth: 160 }} />
                  <input type="date" value={calForm.date} onChange={e => setCalForm(f => ({ ...f, date: e.target.value }))} style={{ ...inp, width: 'auto' }} />
                  <button onClick={addCalReminder} disabled={!calForm.date} style={{ padding: '8px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: calForm.date ? 1 : 0.4 }}>Añadir al calendario</button>
                  <button onClick={() => setCalForm(null)} style={{ padding: '8px 10px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Vacunas</div>
              {(pet.vacunas ?? []).length === 0 ? <span style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>Sin vacunas registradas.</span> : (pet.vacunas ?? []).map(vac => {
                const sem = semVac(diasHasta(vac.proxima))
                return (
                  <div key={vac.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 500 }}>{vac.nombre}</span>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Última: {vac.fecha_ultima}</span>
                      <span style={{ color: sem.color, fontWeight: 600 }}>Próxima: {sem.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            {pet.notas && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem' }}>📝 {pet.notas}</div>}
          </div>
        )}

        {/* ALIMENTACIÓN */}
        {activeTab === 'alimentacion' && <AlimentacionTab pet={pet} onUpdatePet={(patch) => updatePet(pet.id, patch)} />}

        {/* SALUD */}
        {activeTab === 'salud' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>🩺 Eventos de salud</div>
                {saludEvs.some(e => fmtSaludDue(e.start_time).overdue) && <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>{saludEvs.filter(e => fmtSaludDue(e.start_time).overdue).length} vencido(s)</div>}
              </div>
              <button onClick={() => setShowSaludForm(f => !f)} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Nuevo</button>
            </div>
            {showSaludForm && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input value={saludForm.titulo} onChange={e => setSaludForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Título *" autoFocus style={inp} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select value={saludForm.tipo} onChange={e => setSaludForm(f => ({ ...f, tipo: e.target.value }))} style={{ ...inp, flex: 1 }}>
                      {Object.entries(SALUD_TIPOS).map(([v, { label, icon }]) => <option key={v} value={v}>{icon} {label}</option>)}
                    </select>
                    <input type="date" value={saludForm.date} onChange={e => setSaludForm(f => ({ ...f, date: e.target.value }))} style={{ ...inp, flex: 1 }} />
                  </div>
                  <input value={saludForm.notes} onChange={e => setSaludForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notas" style={inp} />
                  {saludForm.tipo === 'medication' && <input type="number" min="1" value={saludForm.interval_days} onChange={e => setSaludForm(f => ({ ...f, interval_days: e.target.value }))} placeholder="Repetir cada (días)" style={inp} />}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowSaludForm(false)} style={{ padding: '6px 12px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
                    <button onClick={addSaludEvent} disabled={!saludForm.titulo.trim() || !saludForm.date} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: (saludForm.titulo.trim() && saludForm.date) ? 1 : 0.4 }}>Crear</button>
                  </div>
                </div>
              </div>
            )}
            {saludEvs.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Sin eventos de salud.</p>
            ) : saludEvs.map(ev => {
              const { label: dueLabel, overdue } = fmtSaludDue(ev.start_time)
              const tipo = SALUD_TIPOS[ev.tipo] ?? { label: ev.tipo, icon: '📋' }
              return (
                <div key={ev.id} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${overdue ? 'rgba(239,68,68,.4)' : 'var(--border)'}`, background: 'var(--bg-card)' }}
                  onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-sal'); if (b) b.style.opacity = '1' }}
                  onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-sal'); if (b) b.style.opacity = '0' }}
                >
                  <button onClick={() => markSaludDone(ev)} title="Marcar como hecho"
                    style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${overdue ? '#ef4444' : 'var(--border)'}`, background: 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.innerHTML = '✓' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = overdue ? '#ef4444' : 'var(--border)'; e.currentTarget.innerHTML = '' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{tipo.icon} {ev.titulo}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap', fontSize: 11, color: overdue ? '#ef4444' : 'var(--text-muted)' }}>
                      <span>{dueLabel}</span>
                      <span style={{ color: 'var(--text-faint)' }}>{tipo.label}</span>
                      {ev.metadata?.interval_days && <span style={{ color: 'var(--text-faint)' }}>↻ cada {ev.metadata.interval_days}d</span>}
                      {ev.metadata?.notes && <span style={{ color: 'var(--text-faint)' }}>{ev.metadata.notes}</span>}
                    </div>
                  </div>
                  <button className="del-sal" onClick={() => saveEventos(eventos.filter(e => e.id !== ev.id))}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 17, padding: '0 4px', opacity: 0, transition: 'opacity .15s', alignSelf: 'center' }}>×</button>
                </div>
              )
            })}
          </div>
        )}

        {/* PASEOS (perro) */}
        {activeTab === 'paseos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>🦮 Paseos (últimos 7 días)</div>
                {todayPaseos.length > 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hoy: {todayPaseos.length} paseo{todayPaseos.length !== 1 ? 's' : ''}{todayMins > 0 ? ` · ${todayMins} min` : ''}</div>}
              </div>
              <button onClick={() => setShowWalkForm(f => !f)} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>🦮 Registrar</button>
            </div>
            {showWalkForm && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input type="number" min="1" value={walkForm.duration} onChange={e => setWalkForm(f => ({ ...f, duration: e.target.value }))} placeholder="Duración (minutos, opcional)" autoFocus style={inp} />
                  <input value={walkForm.notes} onChange={e => setWalkForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notas (ruta, incidencias...)" style={inp} />
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowWalkForm(false)} style={{ padding: '6px 12px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
                    <button onClick={registerWalk} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Registrar</button>
                  </div>
                </div>
              </div>
            )}
            {paseos.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Sin paseos esta semana.</p>
            ) : paseos.map(p => (
              <div key={p.id} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                <span style={{ fontSize: 20 }}>🦮</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Paseo</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtWalkTime(p.start_time)}{p.metadata?.duration_minutes ? ` · ${p.metadata.duration_minutes} min` : ''}</div>
                  {p.metadata?.notes && <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{p.metadata.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MANTENIMIENTO JAULA (no-perro) */}
        {activeTab === 'mantenimiento' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>🏠 Mantenimiento</div>
              <button onClick={() => setShowMantForm(f => !f)} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Tarea</button>
            </div>
            {showMantForm && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input value={mantForm.titulo} onChange={e => setMantForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Nombre de la tarea *" autoFocus style={inp} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="date" value={mantForm.date} onChange={e => setMantForm(f => ({ ...f, date: e.target.value }))} style={{ ...inp, flex: 1 }} />
                    <input type="number" min="1" value={mantForm.interval_days} onChange={e => setMantForm(f => ({ ...f, interval_days: e.target.value }))} placeholder="Repetir cada (días)" style={{ ...inp, flex: 1 }} />
                  </div>
                  <input value={mantForm.products} onChange={e => setMantForm(f => ({ ...f, products: e.target.value }))} placeholder="Productos necesarios" style={inp} />
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowMantForm(false)} style={{ padding: '6px 12px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
                    <button onClick={addMantTask} disabled={!mantForm.titulo.trim() || !mantForm.date} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: (mantForm.titulo.trim() && mantForm.date) ? 1 : 0.4 }}>Crear</button>
                  </div>
                </div>
              </div>
            )}
            {mantTasks.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Sin tareas de mantenimiento.</p>
            ) : mantTasks.map(task => {
              const { label: dueLabel, overdue } = fmtSaludDue(task.start_time)
              return (
                <div key={task.id} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${overdue ? 'rgba(239,68,68,.4)' : 'var(--border)'}`, background: 'var(--bg-card)' }}
                  onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-mant'); if (b) b.style.opacity = '1' }}
                  onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-mant'); if (b) b.style.opacity = '0' }}
                >
                  <button onClick={() => markMantDone(task)} title="Marcar como hecha"
                    style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${overdue ? '#ef4444' : 'var(--border)'}`, background: 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = overdue ? '#ef4444' : 'var(--border)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{task.titulo}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap', fontSize: 11, color: overdue ? '#ef4444' : 'var(--text-muted)' }}>
                      <span>{dueLabel}</span>
                      {task.metadata?.interval_days && <span style={{ color: 'var(--text-faint)' }}>↻ cada {task.metadata.interval_days}d</span>}
                      {task.metadata?.products && <span style={{ color: 'var(--text-faint)' }}>🧴 {task.metadata.products}</span>}
                    </div>
                  </div>
                  <button className="del-mant" onClick={() => saveEventos(eventos.filter(e => e.id !== task.id))}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 17, padding: '0 4px', opacity: 0, transition: 'opacity .15s', alignSelf: 'center' }}>×</button>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
