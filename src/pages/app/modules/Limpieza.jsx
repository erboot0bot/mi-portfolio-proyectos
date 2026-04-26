// src/pages/app/modules/Limpieza.jsx
import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import ModuleShell from './ModuleShell'

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

export default function Limpieza() {
  const { app, modules } = useOutletContext()
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ title: '', due: '', interval_days: '', products: '' })

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    let cancelled = false
    supabase.from('events')
      .select('*')
      .eq('app_id', app.id)
      .eq('event_type', 'cleaning')
      .order('start_time', { ascending: true })
      .then(({ data }) => {
        if (cancelled) return
        if (data) setTasks(data)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [app.id])

  async function handleAdd() {
    if (!form.title.trim() || !form.due) return
    const startTime = new Date(form.due + 'T09:00:00').toISOString()
    const { data, error } = await supabase.from('events').insert({
      app_id:     app.id,
      event_type: 'cleaning',
      title:      form.title.trim(),
      start_time: startTime,
      all_day:    true,
      metadata: {
        interval_days: form.interval_days ? Number(form.interval_days) : null,
        products:      form.products.trim(),
      },
    }).select().single()

    if (!error && data) {
      setTasks(p => [...p, data].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)))
      setForm({ title: '', due: '', interval_days: '', products: '' })
      setShowAdd(false)
    }
  }

  async function markDone(task) {
    const { error } = await supabase.from('events').delete().eq('id', task.id)
    if (error) return
    setTasks(p => p.filter(t => t.id !== task.id))

    const intervalDays = task.metadata?.interval_days
    if (intervalDays) {
      const nextDate = new Date()
      nextDate.setDate(nextDate.getDate() + Number(intervalDays))
      nextDate.setHours(9, 0, 0, 0)
      const { data } = await supabase.from('events').insert({
        app_id:     app.id,
        event_type: 'cleaning',
        title:      task.title,
        start_time: nextDate.toISOString(),
        all_day:    true,
        metadata:   task.metadata,
      }).select().single()
      if (data) setTasks(p => [...p, data].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)))
    }
  }

  async function removeTask(id) {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (!error) setTasks(p => p.filter(t => t.id !== id))
  }

  const overdueCount = tasks.filter(t => formatDue(t.start_time).overdue).length

  return (
    <ModuleShell app={app} modules={modules}>
      <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Limpieza</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {overdueCount > 0
                ? `${overdueCount} vencida${overdueCount !== 1 ? 's' : ''}`
                : `${tasks.length} tarea${tasks.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => setShowAdd(p => !p)}
            style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >+ Nueva tarea</button>
        </div>

        {/* Formulario */}
        {showAdd && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Nueva tarea de limpieza</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Nombre de la tarea *"
                autoFocus
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Fecha *</label>
                  <input type="date" value={form.due} min={today}
                    onChange={e => setForm(p => ({ ...p, due: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Repetir cada (días)</label>
                  <input type="number" min="1" value={form.interval_days}
                    onChange={e => setForm(p => ({ ...p, interval_days: e.target.value }))}
                    placeholder="Sin repetición"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                </div>
              </div>
              <input
                value={form.products}
                onChange={e => setForm(p => ({ ...p, products: e.target.value }))}
                placeholder="Productos necesarios (lejía, bayetas...)"
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAdd(false)}
                  style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                  Cancelar
                </button>
                <button onClick={handleAdd} disabled={!form.title.trim() || !form.due}
                  style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: (form.title.trim() && form.due) ? 1 : 0.4 }}>
                  Crear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: 40, margin: '0 0 8px' }}>🧹</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin tareas de limpieza</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Crea tu primera tarea para no olvidar nada</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tasks.map(task => {
              const { label: dueLabel, overdue } = formatDue(task.start_time)
              const intervalDays = task.metadata?.interval_days
              const products     = task.metadata?.products
              return (
                <div
                  key={task.id}
                  style={{
                    display: 'flex', gap: 12, padding: '12px 16px', borderRadius: 12,
                    border: `1px solid ${overdue ? 'rgba(239,68,68,.4)' : 'var(--border)'}`,
                    background: 'var(--bg-card)',
                  }}
                  onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                  onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
                >
                  {/* Botón marcar hecha */}
                  <button
                    onClick={() => markDone(task)}
                    title="Marcar como hecha"
                    style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${overdue ? '#ef4444' : 'var(--border)'}`, background: 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 1, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.textContent = '✓' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = overdue ? '#ef4444' : 'var(--border)'; e.currentTarget.textContent = '' }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{task.title}</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: overdue ? '#ef4444' : 'var(--text-muted)' }}>{dueLabel}</span>
                      {intervalDays && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>↻ cada {intervalDays} días</span>}
                      {products && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>🧴 {products}</span>}
                    </div>
                  </div>
                  <button className="del-btn" onClick={() => removeTask(task.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s', alignSelf: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
                  >×</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ModuleShell>
  )
}
