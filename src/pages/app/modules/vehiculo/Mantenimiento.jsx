import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

const MAINT_TYPES = ['ITV', 'aceite', 'ruedas', 'frenos', 'bateria', 'filtro', 'correa', 'otro']
const MAINT_ICONS = { ITV: '📋', aceite: '🛢️', ruedas: '🔄', frenos: '⚙️', bateria: '🔋', filtro: '🌀', correa: '⛓️', otro: '🔧' }

function daysUntil(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  return Math.round((d - new Date(new Date().toDateString())) / 86400000)
}

export default function Mantenimiento() {
  const { app, vehicle } = useOutletContext()
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ type: 'aceite', date: new Date().toISOString().slice(0, 10), km: '', description: '', cost: '', next_km: '', next_date: '' })
  const [addError, setAddError] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase.from('maintenance_logs')
      .select('*')
      .eq('vehicle_id', vehicle.id)
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        setLogs(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [vehicle.id])

  async function handleAdd() {
    if (!form.type || !form.date) return
    setAddError(null)
    const { data, error } = await supabase.from('maintenance_logs')
      .insert({
        vehicle_id:  vehicle.id,
        app_id:      app.id,
        type:        form.type,
        date:        form.date,
        km:          form.km ? Number(form.km) : null,
        description: form.description.trim() || null,
        cost:        form.cost ? Number(form.cost) : null,
        next_km:     form.next_km ? Number(form.next_km) : null,
        next_date:   form.next_date || null,
      })
      .select().single()
    if (error) { setAddError('No se pudo guardar.'); return }
    if (data) {
      setLogs(p => [data, ...p])
      setForm({ type: 'aceite', date: new Date().toISOString().slice(0, 10), km: '', description: '', cost: '', next_km: '', next_date: '' })
      setShowAdd(false)
    }
  }

  async function deleteLog(id) {
    const { error } = await supabase.from('maintenance_logs').delete().eq('id', id)
    if (!error) setLogs(p => p.filter(l => l.id !== id))
  }

  // Upcoming alerts: next_date within 30 days
  const upcoming = logs.filter(l => {
    const d = daysUntil(l.next_date)
    return d !== null && d <= 30
  })

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Upcoming alerts */}
      {upcoming.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.4)', borderRadius: 12, padding: '12px 16px' }}>
          <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>⏰ Revisiones próximas</p>
          {upcoming.map(l => {
            const days = daysUntil(l.next_date)
            return (
              <p key={l.id} style={{ margin: '2px 0', fontSize: 12, color: 'var(--text-muted)' }}>
                {MAINT_ICONS[l.type]} {l.type} — {days === 0 ? 'hoy' : days < 0 ? `hace ${Math.abs(days)} días` : `en ${days} días`}
              </p>
            )
          })}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{logs.length} registro{logs.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setShowAdd(p => !p)}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          + Mantenimiento
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
                {MAINT_TYPES.map(t => <option key={t} value={t}>{MAINT_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" min="0" value={form.km} onChange={e => setForm(p => ({ ...p, km: e.target.value }))}
                placeholder="Km actuales" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              <input type="number" min="0" step="0.01" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))}
                placeholder="Coste (€)" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            </div>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Descripción (opcional)"
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" min="0" value={form.next_km} onChange={e => setForm(p => ({ ...p, next_km: e.target.value }))}
                placeholder="Próx. revisión (km)" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              <input type="date" value={form.next_date} onChange={e => setForm(p => ({ ...p, next_date: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              <button onClick={handleAdd}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Guardar</button>
            </div>
            {addError && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{addError}</p>}
          </div>
        </div>
      )}

      {/* List */}
      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>🔧</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin registros</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Registra el primer mantenimiento</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {logs.map(log => {
            const nextDays = daysUntil(log.next_date)
            const isNear   = nextDays !== null && nextDays <= 30
            return (
              <div key={log.id}
                style={{ padding: '12px 16px', borderRadius: 12,
                  border: `1px solid ${isNear ? 'rgba(245,158,11,.5)' : 'var(--border)'}`,
                  background: isNear ? 'rgba(245,158,11,.05)' : 'var(--bg-card)' }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del'); if (b) b.style.opacity = '0' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{MAINT_ICONS[log.type]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                        {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                      </p>
                      {log.cost && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{Number(log.cost).toFixed(2)} €</span>}
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>
                      {new Date(log.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {log.km ? ` · ${log.km.toLocaleString()} km` : ''}
                    </p>
                    {log.description && (
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{log.description}</p>
                    )}
                    {log.next_date && (
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: isNear ? '#f59e0b' : 'var(--text-faint)' }}>
                        Próx. revisión: {new Date(log.next_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {nextDays !== null ? ` (${nextDays === 0 ? 'hoy' : nextDays < 0 ? `hace ${Math.abs(nextDays)}d` : `en ${nextDays}d`})` : ''}
                      </p>
                    )}
                  </div>
                  <button className="del" onClick={() => deleteLog(log.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
                  >×</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
