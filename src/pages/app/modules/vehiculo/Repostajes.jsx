import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

export default function Repostajes() {
  const { app, vehicle } = useOutletContext()
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ date: new Date().toISOString().slice(0, 10), liters: '', price_per_liter: '', km_at_fill: '', full_tank: true, notes: '' })
  const [addError, setAddError] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase.from('fuel_logs')
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

  const totalCost  = logs.reduce((s, l) => s + (Number(l.total_cost) || 0), 0)
  const avgPerFill = logs.length ? totalCost / logs.length : 0
  const avgConsump = (() => {
    const fullTanks = logs.filter(l => l.full_tank && l.km_at_fill)
    if (fullTanks.length < 2) return null
    const sorted = [...fullTanks].sort((a, b) => a.km_at_fill - b.km_at_fill)
    const kmSpan  = sorted[sorted.length - 1].km_at_fill - sorted[0].km_at_fill
    const litres  = sorted.slice(1).reduce((s, l) => s + Number(l.liters), 0)
    return kmSpan > 0 ? (litres / kmSpan * 100).toFixed(1) : null
  })()

  async function handleAdd() {
    if (!form.liters || !form.date) return
    setAddError(null)
    const liters = Number(form.liters)
    const ppl    = form.price_per_liter ? Number(form.price_per_liter) : null
    const total  = ppl ? Number((liters * ppl).toFixed(2)) : null
    const { data, error } = await supabase.from('fuel_logs')
      .insert({
        vehicle_id:      vehicle.id,
        app_id:          app.id,
        date:            form.date,
        liters,
        price_per_liter: ppl,
        total_cost:      total,
        km_at_fill:      form.km_at_fill ? Number(form.km_at_fill) : null,
        full_tank:       form.full_tank,
        notes:           form.notes.trim() || null,
      })
      .select().single()
    if (error) { setAddError('No se pudo guardar.'); return }
    if (data) {
      setLogs(p => [data, ...p])
      setForm({ date: new Date().toISOString().slice(0, 10), liters: '', price_per_liter: '', km_at_fill: '', full_tank: true, notes: '' })
      setShowAdd(false)
    }
  }

  async function deleteLog(id) {
    const { error } = await supabase.from('fuel_logs').delete().eq('id', id)
    if (!error) setLogs(p => p.filter(l => l.id !== id))
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats bar */}
      {logs.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            ['Total gastado', `${totalCost.toFixed(2)} €`],
            ['Media por repostaje', `${avgPerFill.toFixed(2)} €`],
            avgConsump ? ['Consumo medio', `${avgConsump} L/100km`] : null,
          ].filter(Boolean).map(([label, value]) => (
            <div key={label} style={{ flex: 1, minWidth: 120, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-faint)' }}>{label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{logs.length} repostaje{logs.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setShowAdd(p => !p)}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          + Repostaje
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Fecha *</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Litros *</label>
                <input type="number" min="0" step="0.01" value={form.liters} onChange={e => setForm(p => ({ ...p, liters: e.target.value }))}
                  placeholder="45.00" autoFocus
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Precio/litro (€)</label>
                <input type="number" min="0" step="0.001" value={form.price_per_liter} onChange={e => setForm(p => ({ ...p, price_per_liter: e.target.value }))}
                  placeholder="1.65"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Km en el repostaje</label>
                <input type="number" min="0" value={form.km_at_fill} onChange={e => setForm(p => ({ ...p, km_at_fill: e.target.value }))}
                  placeholder="52000"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.full_tank} onChange={e => setForm(p => ({ ...p, full_tank: e.target.checked }))} />
              Depósito lleno
            </label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              <button onClick={handleAdd} disabled={!form.liters || !form.date}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: (form.liters && form.date) ? 1 : 0.4 }}>Guardar</button>
            </div>
            {addError && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{addError}</p>}
          </div>
        </div>
      )}

      {/* List */}
      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>⛽</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin repostajes</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Registra tu primer repostaje</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {logs.map(log => (
            <div key={log.id}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)' }}
              onMouseEnter={e => { const b = e.currentTarget.querySelector('.del'); if (b) b.style.opacity = '1' }}
              onMouseLeave={e => { const b = e.currentTarget.querySelector('.del'); if (b) b.style.opacity = '0' }}
            >
              <span style={{ fontSize: 20 }}>⛽</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                  {Number(log.liters).toFixed(2)} L
                  {log.total_cost ? ` · ${Number(log.total_cost).toFixed(2)} €` : ''}
                  {log.price_per_liter ? ` (${Number(log.price_per_liter).toFixed(3)} €/L)` : ''}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>
                  {new Date(log.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {log.km_at_fill ? ` · ${log.km_at_fill.toLocaleString()} km` : ''}
                  {!log.full_tank ? ' · Parcial' : ''}
                </p>
              </div>
              <button className="del" onClick={() => deleteLog(log.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
