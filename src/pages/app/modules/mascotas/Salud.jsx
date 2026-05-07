// src/pages/app/modules/mascotas/Salud.jsx
import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'
import { useMode } from '../../../../contexts/ModeContext'
import { demoRead, demoWrite } from '../../../../data/demo/index.js'

function formatDue(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const dayDiff = Math.round(
    (new Date(d.getFullYear(), d.getMonth(), d.getDate()) -
     new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    / (1000 * 60 * 60 * 24)
  )
  if (dayDiff < 0)  return { label: `Hace ${Math.abs(dayDiff)} día${Math.abs(dayDiff) !== 1 ? 's' : ''}`, overdue: true }
  if (dayDiff === 0) return { label: 'Hoy', overdue: false }
  if (dayDiff === 1) return { label: 'Mañana', overdue: false }
  return { label: `En ${dayDiff} días`, overdue: false }
}

const EVENT_TYPES = {
  vaccination: { label: 'Vacuna',             icon: '💉' },
  vet_visit:   { label: 'Visita veterinario', icon: '🩺' },
  medication:  { label: 'Medicación',          icon: '💊' },
}

export default function Salud() {
  const { pet, app } = useOutletContext()
  const { mode } = useMode()
  const appType = app.id.replace('demo-', '')
  const [events, setEvents]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [showAdd, setShowAdd]       = useState(false)
  const [form, setForm]             = useState({ title: '', event_type: 'vaccination', date: '', notes: '', interval_days: '' })
  const [addError, setAddError]     = useState(null)
  const [markError, setMarkError]   = useState(null)

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (mode === 'demo') {
      const all = demoRead(appType, 'events')
      const filtered = all
        .filter(e => ['vaccination', 'vet_visit', 'medication'].includes(e.event_type) && e.metadata?.pet_id === pet.id)
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      setEvents(filtered)
      setLoading(false)
      return
    }
    let cancelled = false
    supabase.from('events')
      .select('*')
      .eq('app_id', app.id)
      .in('event_type', ['vaccination', 'vet_visit', 'medication'])
      .contains('metadata', { pet_id: pet.id })
      .order('start_time', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setFetchError(error.message); setLoading(false); return }
        setEvents(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [app.id, pet.id, mode, appType])

  async function handleAdd() {
    if (!form.title.trim() || !form.date) return
    setAddError(null)
    const startTime = new Date(form.date + 'T09:00:00').toISOString()
    if (mode === 'demo') {
      const newEvent = {
        id: crypto.randomUUID(),
        app_id: app.id,
        event_type: form.event_type,
        title: form.title.trim(),
        start_time: startTime,
        all_day: true,
        metadata: {
          pet_id: pet.id,
          notes: form.notes.trim() || null,
          interval_days: form.interval_days && Number(form.interval_days) > 0 ? Number(form.interval_days) : null,
        },
        created_at: new Date().toISOString(),
      }
      const all = demoRead(appType, 'events')
      demoWrite(appType, 'events', [...all, newEvent])
      setEvents(p => [...p, newEvent].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)))
      setForm({ title: '', event_type: 'vaccination', date: '', notes: '', interval_days: '' })
      setShowAdd(false)
      return
    }
    const { data, error } = await supabase.from('events').insert({
      app_id:     app.id,
      event_type: form.event_type,
      title:      form.title.trim(),
      start_time: startTime,
      all_day:    true,
      metadata: {
        pet_id:        pet.id,
        notes:         form.notes.trim() || null,
        interval_days: form.interval_days && Number(form.interval_days) > 0
          ? Number(form.interval_days)
          : null,
      },
    }).select().single()
    if (error) { setAddError('No se pudo guardar el evento. Inténtalo de nuevo.'); return }
    if (data) {
      setEvents(p => [...p, data].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)))
      setForm({ title: '', event_type: 'vaccination', date: '', notes: '', interval_days: '' })
      setShowAdd(false)
    }
  }

  async function markDone(event) {
    if (mode === 'demo') {
      const all = demoRead(appType, 'events')
      const remaining = all.filter(e => e.id !== event.id)
      const intervalDays = event.metadata?.interval_days
      if (intervalDays) {
        const nextDate = new Date()
        nextDate.setDate(nextDate.getDate() + Number(intervalDays))
        nextDate.setHours(9, 0, 0, 0)
        const nextEvent = { ...event, id: crypto.randomUUID(), start_time: nextDate.toISOString(), created_at: new Date().toISOString() }
        demoWrite(appType, 'events', [...remaining, nextEvent])
        setEvents(p => p.filter(e => e.id !== event.id).concat(nextEvent).sort((a, b) => new Date(a.start_time) - new Date(b.start_time)))
      } else {
        demoWrite(appType, 'events', remaining)
        setEvents(p => p.filter(e => e.id !== event.id))
      }
      return
    }
    const { error } = await supabase.from('events').delete().eq('id', event.id)
    if (error) { setMarkError('No se pudo completar el evento.'); return }
    setEvents(p => p.filter(e => e.id !== event.id))
    const intervalDays = event.metadata?.interval_days
    if (intervalDays) {
      const nextDate = new Date()
      nextDate.setDate(nextDate.getDate() + Number(intervalDays))
      nextDate.setHours(9, 0, 0, 0)
      const { data } = await supabase.from('events').insert({
        app_id:     app.id,
        event_type: event.event_type,
        title:      event.title,
        start_time: nextDate.toISOString(),
        all_day:    true,
        metadata:   event.metadata,
      }).select().single()
      if (data) {
        setEvents(p => [...p, data].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)))
      } else {
        setMarkError('El evento se completó pero no se pudo programar el siguiente.')
      }
    }
  }

  async function removeEvent(id) {
    if (mode === 'demo') {
      const all = demoRead(appType, 'events')
      demoWrite(appType, 'events', all.filter(e => e.id !== id))
      setEvents(p => p.filter(e => e.id !== id))
      return
    }
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) { setMarkError('No se pudo eliminar el evento.'); return }
    setEvents(p => p.filter(e => e.id !== id))
  }

  const overdueCount = events.filter(e => formatDue(e.start_time).overdue).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>🩺 Salud</h2>
          {overdueCount > 0 && (
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#ef4444' }}>
              {overdueCount} vencido{overdueCount !== 1 ? 's' : ''}
            </p>
          )}
          {markError && <p style={{ fontSize: 12, color: '#ef4444', margin: '2px 0 0' }}>{markError}</p>}
        </div>
        <button onClick={() => setShowAdd(p => !p)}
          style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          + Nuevo evento
        </button>
      </div>

      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Título *" autoFocus
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={form.event_type}
                onChange={e => setForm(p => ({ ...p, event_type: e.target.value, interval_days: '' }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
                {Object.entries(EVENT_TYPES).map(([val, { label, icon }]) => (
                  <option key={val} value={val}>{icon} {label}</option>
                ))}
              </select>
              <input type="date" value={form.date} min={today}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            </div>
            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Notas"
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            {form.event_type === 'medication' && (
              <input type="number" min="1" value={form.interval_days}
                onChange={e => setForm(p => ({ ...p, interval_days: e.target.value }))}
                placeholder="Repetir cada (días)"
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              <button onClick={handleAdd} disabled={!form.title.trim() || !form.date}
                style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: (form.title.trim() && form.date) ? 1 : 0.4 }}>Crear</button>
            </div>
            {addError && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{addError}</p>}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : fetchError ? (
        <p style={{ fontSize: 13, color: '#ef4444' }}>Error: {fetchError}</p>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <p style={{ fontSize: 36, margin: '0 0 6px' }}>🩺</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin eventos de salud</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Registra vacunas, visitas y medicación</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {events.map(event => {
            const { label: dueLabel, overdue } = formatDue(event.start_time)
            const intervalDays = event.metadata?.interval_days
            const notes        = event.metadata?.notes
            const et           = EVENT_TYPES[event.event_type] ?? { label: event.event_type, icon: '📋' }
            return (
              <div key={event.id}
                style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${overdue ? 'rgba(239,68,68,.4)' : 'var(--border)'}`, background: 'var(--bg-card)' }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                <button onClick={() => markDone(event)} title="Marcar como hecho"
                  style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${overdue ? '#ef4444' : 'var(--border)'}`, background: 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 2, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.textContent = '✓' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = overdue ? '#ef4444' : 'var(--border)'; e.currentTarget.textContent = '' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{et.icon} {event.title}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: overdue ? '#ef4444' : 'var(--text-muted)' }}>{dueLabel}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{et.label}</span>
                    {intervalDays && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>↻ cada {intervalDays} días</span>}
                    {notes && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{notes}</span>}
                  </div>
                </div>
                <button className="del-btn" onClick={() => removeEvent(event.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 17, padding: '0 4px', opacity: 0, transition: 'opacity .15s', alignSelf: 'center' }}>×</button>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
