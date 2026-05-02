import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

const EXPENSE_TYPES = ['seguro', 'multa', 'aparcamiento', 'lavado', 'otro']
const EXPENSE_ICONS = { seguro: '🛡️', multa: '⚠️', aparcamiento: '🅿️', lavado: '🧼', otro: '💶' }

export default function VehiculoGastos() {
  const { app, vehicle } = useOutletContext()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)
  const [form, setForm]         = useState({ type: 'seguro', date: new Date().toISOString().slice(0, 10), description: '', cost: '' })
  const [addError, setAddError] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase.from('vehicle_expenses')
      .select('*')
      .eq('vehicle_id', vehicle.id)
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        setExpenses(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [vehicle.id])

  async function handleAdd() {
    if (!form.cost || !form.date) return
    setAddError(null)
    const { data, error } = await supabase.from('vehicle_expenses')
      .insert({
        vehicle_id:  vehicle.id,
        app_id:      app.id,
        type:        form.type,
        date:        form.date,
        description: form.description.trim() || null,
        cost:        Number(form.cost),
      })
      .select().single()
    if (error) { setAddError('No se pudo guardar.'); return }
    if (data) {
      setExpenses(p => [data, ...p])
      setForm({ type: 'seguro', date: new Date().toISOString().slice(0, 10), description: '', cost: '' })
      setShowAdd(false)
    }
  }

  async function deleteExpense(id) {
    const { error } = await supabase.from('vehicle_expenses').delete().eq('id', id)
    if (!error) setExpenses(p => p.filter(e => e.id !== id))
  }

  const total = expenses.reduce((s, e) => s + Number(e.cost), 0)

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {total > 0 && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-faint)' }}>Total gastos varios</p>
          <p style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{total.toFixed(2)} €</p>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{expenses.length} gasto{expenses.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setShowAdd(p => !p)}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          + Gasto
        </button>
      </div>

      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
                {EXPENSE_TYPES.map(t => <option key={t} value={t}>{EXPENSE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Descripción" style={{ flex: 2, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              <input type="number" min="0" step="0.01" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))}
                placeholder="Importe (€)" autoFocus style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              <button onClick={handleAdd} disabled={!form.cost}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: form.cost ? 1 : 0.4 }}>Guardar</button>
            </div>
            {addError && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{addError}</p>}
          </div>
        </div>
      )}

      {expenses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>💶</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin gastos registrados</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade seguros, multas y otros gastos</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {expenses.map(exp => (
            <div key={exp.id}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)' }}
              onMouseEnter={e => { const b = e.currentTarget.querySelector('.del'); if (b) b.style.opacity = '1' }}
              onMouseLeave={e => { const b = e.currentTarget.querySelector('.del'); if (b) b.style.opacity = '0' }}
            >
              <span style={{ fontSize: 22 }}>{EXPENSE_ICONS[exp.type]}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                  {exp.description || exp.type.charAt(0).toUpperCase() + exp.type.slice(1)}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>
                  {new Date(exp.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{Number(exp.cost).toFixed(2)} €</span>
              <button className="del" onClick={() => deleteExpense(exp.id)}
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
