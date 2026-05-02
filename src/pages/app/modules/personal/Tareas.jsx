import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

const PRIORITY_CONFIG = {
  high:   { color: '#ef4444', label: 'Alta' },
  medium: { color: '#f59e0b', label: 'Media' },
  low:    { color: '#6b7280', label: 'Baja' },
}

function formatDue(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const diff = Math.round((d - new Date(now.toDateString())) / 86400000)
  if (diff < 0)   return { label: `Hace ${Math.abs(diff)}d`, overdue: true }
  if (diff === 0) return { label: 'Hoy', overdue: false }
  if (diff === 1) return { label: 'Mañana', overdue: false }
  return { label: `${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`, overdue: false }
}

export default function Tareas() {
  const { app } = useOutletContext()
  const [tasks, setTasks]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [showAdd, setShowAdd]   = useState(false)
  const [form, setForm]         = useState({ title: '', description: '', due_date: '', priority: 'medium' })
  const [tab, setTab]           = useState('pending') // 'pending' | 'done'

  useEffect(() => {
    let cancelled = false
    supabase.from('personal_tasks')
      .select('*')
      .eq('app_id', app.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setFetchError(error.message); setLoading(false); return }
        setTasks(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [app.id])

  async function handleAdd() {
    if (!form.title.trim()) return
    const { data, error } = await supabase.from('personal_tasks')
      .insert({
        app_id:      app.id,
        title:       form.title.trim(),
        description: form.description.trim() || null,
        due_date:    form.due_date || null,
        priority:    form.priority,
        status:      'pending',
      })
      .select().single()
    if (!error && data) {
      setTasks(p => [data, ...p])
      setForm({ title: '', description: '', due_date: '', priority: 'medium' })
      setShowAdd(false)
    }
  }

  async function toggleStatus(task) {
    const done = task.status !== 'done'
    const { error } = await supabase.from('personal_tasks')
      .update({ status: done ? 'done' : 'pending', completed_at: done ? new Date().toISOString() : null })
      .eq('id', task.id)
    if (!error) setTasks(p => p.map(t => t.id === task.id
      ? { ...t, status: done ? 'done' : 'pending', completed_at: done ? new Date().toISOString() : null }
      : t))
  }

  async function deleteTask(id) {
    const { error } = await supabase.from('personal_tasks').delete().eq('id', id)
    if (!error) setTasks(p => p.filter(t => t.id !== id))
  }

  const pending = tasks.filter(t => t.status === 'pending')
    .sort((a, b) => {
      const po = { high: 0, medium: 1, low: 2 }
      return po[a.priority] - po[b.priority]
    })
  const done = tasks.filter(t => t.status === 'done')
  const shown = tab === 'pending' ? pending : done

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Tareas</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(p => !p)}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >+ Nueva tarea</button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Título de la tarea *"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="date"
                value={form.due_date}
                onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
              />
              <select
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
              >
                <option value="high">🔴 Alta</option>
                <option value="medium">🟡 Media</option>
                <option value="low">⚪ Baja</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                Cancelar
              </button>
              <button onClick={handleAdd} disabled={!form.title.trim()}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: form.title.trim() ? 1 : 0.4 }}>
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', borderRadius: 10, padding: 4 }}>
        {[['pending', `Pendientes (${pending.length})`], ['done', `Hechas (${done.length})`]].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            style={{ flex: 1, padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: tab === val ? 'var(--accent)' : 'transparent',
              color: tab === val ? '#fff' : 'var(--text-muted)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Error */}
      {fetchError && <p style={{ color: '#ef4444', fontSize: 13 }}>Error: {fetchError}</p>}

      {/* List */}
      {shown.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>✅</p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            {tab === 'pending' ? 'Sin tareas pendientes' : 'Sin tareas completadas'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {shown.map(task => {
            const due  = formatDue(task.due_date)
            const pc   = PRIORITY_CONFIG[task.priority]
            const isDone = task.status === 'done'
            return (
              <div key={task.id}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12,
                  border: '1px solid var(--border)', background: 'var(--bg-card)' }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                {/* Priority dot */}
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: isDone ? 'var(--border)' : pc.color, flexShrink: 0 }} />
                {/* Checkbox */}
                <button onClick={() => toggleStatus(task)}
                  style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${isDone ? 'var(--accent)' : 'var(--border)'}`,
                    background: isDone ? 'var(--accent)' : 'transparent', cursor: 'pointer', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>
                  {isDone && '✓'}
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)',
                    textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.5 : 1 }}>
                    {task.title}
                  </p>
                  {due && (
                    <span style={{ fontSize: 11, color: due.overdue ? '#ef4444' : 'var(--text-faint)' }}>{due.label}</span>
                  )}
                </div>
                <button className="del-btn" onClick={() => deleteTask(task.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
                >×</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
