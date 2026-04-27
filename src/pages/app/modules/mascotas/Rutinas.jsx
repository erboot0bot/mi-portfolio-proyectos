// src/pages/app/modules/mascotas/Rutinas.jsx
import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

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

// ── Walks mode (perro) ──────────────────────────────────────────────
function WalksMode({ pet, app }) {
  const [walks, setWalks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]       = useState({ duration: '', notes: '' })
  const [walkError, setWalkError] = useState(null)

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const weekStart  = new Date(); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0, 0, 0, 0)

  useEffect(() => {
    let cancelled = false
    supabase.from('events')
      .select('*')
      .eq('app_id', app.id)
      .eq('event_type', 'walk')
      .contains('metadata', { pet_id: pet.id })
      .gte('start_time', weekStart.toISOString())
      .order('start_time', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setLoading(false); return }
        setWalks(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [app.id, pet.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function registerWalk() {
    setWalkError(null)
    const { data, error } = await supabase.from('events').insert({
      app_id:     app.id,
      event_type: 'walk',
      title:      'Paseo',
      start_time: new Date().toISOString(),
      all_day:    false,
      metadata: {
        pet_id:           pet.id,
        duration_minutes: form.duration ? Number(form.duration) : null,
        notes:            form.notes.trim() || null,
      },
    }).select().single()
    if (error) { setWalkError('No se pudo registrar el paseo.'); return }
    if (data) {
      setWalks(p => [data, ...p])
      setForm({ duration: '', notes: '' })
      setShowForm(false)
    }
  }

  const todayWalks = walks.filter(w => new Date(w.start_time) >= todayStart)
  const totalMinToday = todayWalks.reduce((acc, w) => acc + (w.metadata?.duration_minutes ?? 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>🦮 Paseos</h2>
          {todayWalks.length > 0 && (
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
              Hoy: {todayWalks.length} paseo{todayWalks.length !== 1 ? 's' : ''}
              {totalMinToday > 0 ? ` · ${totalMinToday} min` : ''}
            </p>
          )}
        </div>
        <button onClick={() => setShowForm(p => !p)}
          style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          🦮 Registrar paseo
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input type="number" min="1" value={form.duration}
              onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
              placeholder="Duración (minutos, opcional)"
              autoFocus
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Notas (ruta, incidencias...)"
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              <button onClick={registerWalk}
                style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Registrar</button>
            </div>
            {walkError && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{walkError}</p>}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : walks.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Sin paseos esta semana</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {walks.map(walk => {
            const d = new Date(walk.start_time)
            const dateLabel = `${d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })} ${d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`
            return (
              <div key={walk.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                <span style={{ fontSize: 20 }}>🦮</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Paseo</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                    {dateLabel}{walk.metadata?.duration_minutes ? ` · ${walk.metadata.duration_minutes} min` : ''}
                  </p>
                  {walk.metadata?.notes && (
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>{walk.metadata.notes}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Maintenance mode (non-dog species) ─────────────────────────────
function MaintenanceMode({ pet, app }) {
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ title: '', due: '', interval_days: '', products: '' })
  const [addError, setAddError]   = useState(null)
  const [markError, setMarkError] = useState(null)

  const todayStr = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    let cancelled = false
    supabase.from('events')
      .select('*')
      .eq('app_id', app.id)
      .eq('event_type', 'cage_maintenance')
      .contains('metadata', { pet_id: pet.id })
      .order('start_time', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setFetchError(error.message); setLoading(false); return }
        setTasks(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [app.id, pet.id])

  async function handleAdd() {
    if (!form.title.trim() || !form.due) return
    setAddError(null)
    const startTime = new Date(form.due + 'T09:00:00').toISOString()
    const { data, error } = await supabase.from('events').insert({
      app_id:     app.id,
      event_type: 'cage_maintenance',
      title:      form.title.trim(),
      start_time: startTime,
      all_day:    true,
      metadata: {
        pet_id:        pet.id,
        interval_days: form.interval_days && Number(form.interval_days) > 0 ? Number(form.interval_days) : null,
        products:      form.products.trim() || null,
      },
    }).select().single()
    if (error) { setAddError('No se pudo guardar la tarea.'); return }
    if (data) {
      setTasks(p => [...p, data].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)))
      setForm({ title: '', due: '', interval_days: '', products: '' })
      setShowAdd(false)
    }
  }

  async function markDone(task) {
    const { error } = await supabase.from('events').delete().eq('id', task.id)
    if (error) { setMarkError('No se pudo completar la tarea.'); return }
    setTasks(p => p.filter(t => t.id !== task.id))
    const intervalDays = task.metadata?.interval_days
    if (intervalDays) {
      const nextDate = new Date()
      nextDate.setDate(nextDate.getDate() + Number(intervalDays))
      nextDate.setHours(9, 0, 0, 0)
      const { data } = await supabase.from('events').insert({
        app_id:     app.id,
        event_type: 'cage_maintenance',
        title:      task.title,
        start_time: nextDate.toISOString(),
        all_day:    true,
        metadata:   task.metadata,
      }).select().single()
      if (data) {
        setTasks(p => [...p, data].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)))
      } else {
        setMarkError('Tarea completada pero no se pudo programar la siguiente.')
      }
    }
  }

  async function removeTask(id) {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) { setMarkError('No se pudo eliminar la tarea.'); return }
    setTasks(p => p.filter(t => t.id !== id))
  }

  const overdueCount = tasks.filter(t => formatDue(t.start_time).overdue).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>🏠 Mantenimiento</h2>
          {overdueCount > 0 && (
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#ef4444' }}>
              {overdueCount} vencida{overdueCount !== 1 ? 's' : ''}
            </p>
          )}
          {markError && <p style={{ fontSize: 12, color: '#ef4444', margin: '2px 0 0' }}>{markError}</p>}
        </div>
        <button onClick={() => setShowAdd(p => !p)}
          style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          + Nueva tarea
        </button>
      </div>

      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Nombre de la tarea *" autoFocus
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Fecha *</label>
                <input type="date" value={form.due} min={todayStr}
                  onChange={e => setForm(p => ({ ...p, due: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Repetir cada (días)</label>
                <input type="number" min="1" value={form.interval_days}
                  onChange={e => setForm(p => ({ ...p, interval_days: e.target.value }))}
                  placeholder="Sin repetición"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <input value={form.products} onChange={e => setForm(p => ({ ...p, products: e.target.value }))}
              placeholder="Productos necesarios"
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              <button onClick={handleAdd} disabled={!form.title.trim() || !form.due}
                style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: (form.title.trim() && form.due) ? 1 : 0.4 }}>Crear</button>
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
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <p style={{ fontSize: 36, margin: '0 0 6px' }}>🏠</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin tareas de mantenimiento</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Crea tareas de limpieza o mantenimiento</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {tasks.map(task => {
            const { label: dueLabel, overdue } = formatDue(task.start_time)
            const intervalDays = task.metadata?.interval_days
            const products     = task.metadata?.products
            return (
              <div key={task.id}
                style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${overdue ? 'rgba(239,68,68,.4)' : 'var(--border)'}`, background: 'var(--bg-card)' }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                <button onClick={() => markDone(task)} title="Marcar como hecha"
                  style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${overdue ? '#ef4444' : 'var(--border)'}`, background: 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 2, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.textContent = '✓' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = overdue ? '#ef4444' : 'var(--border)'; e.currentTarget.textContent = '' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{task.title}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: overdue ? '#ef4444' : 'var(--text-muted)' }}>{dueLabel}</span>
                    {intervalDays && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>↻ cada {intervalDays} días</span>}
                    {products && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>🧴 {products}</span>}
                  </div>
                </div>
                <button className="del-btn" onClick={() => removeTask(task.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 17, padding: '0 4px', opacity: 0, transition: 'opacity .15s', alignSelf: 'center' }}>×</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main export ─────────────────────────────────────────────────────
export default function Rutinas() {
  const { pet, app } = useOutletContext()
  if (pet.species === 'perro') return <WalksMode pet={pet} app={app} />
  return <MaintenanceMode pet={pet} app={app} />
}
