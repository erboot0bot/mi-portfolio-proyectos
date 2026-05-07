import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../../contexts/ModeContext'
import { useFinTransaccionesData } from '../../../../hooks/data/useFinTransaccionesData'
import { useFinCategoriasData } from '../../../../hooks/data/useFinCategoriasData'

export default function Transacciones() {
  const { app } = useOutletContext()
  const { mode } = useMode()
  const { txs, loading: loadingTxs, add, remove } = useFinTransaccionesData({ appId: app.id, mode })
  const { cats, loading: loadingCats } = useFinCategoriasData({ appId: app.id, mode })

  const loading = loadingTxs || loadingCats

  const [showAdd, setShowAdd]   = useState(null) // null | 'expense' | 'income'
  const [form, setForm]         = useState({ type: 'expense', amount: '', category_id: '', description: '', date: new Date().toISOString().slice(0, 10) })
  const [addError, setAddError] = useState(null)
  const today      = new Date()
  const [filterType, setFilterType]   = useState('all')
  const [filterYear, setFilterYear]   = useState(today.getFullYear())
  const [filterMonth, setFilterMonth] = useState(today.getMonth() + 1)

  async function handleAdd() {
    if (!form.amount || !form.date) return
    setAddError(null)
    try {
      await add(
        { type: form.type, amount: Number(form.amount), category_id: form.category_id || null, description: form.description.trim() || null, date: form.date },
        cats,
      )
      setForm({ type: form.type, amount: '', category_id: '', description: '', date: new Date().toISOString().slice(0, 10) })
      setShowAdd(null)
    } catch {
      setAddError('No se pudo guardar.')
    }
  }

  const filtered = txs.filter(tx => {
    const d = new Date(tx.date + 'T00:00:00')
    if (d.getFullYear() !== filterYear || d.getMonth() + 1 !== filterMonth) return false
    if (filterType !== 'all' && tx.type !== filterType) return false
    return true
  })

  const balance  = filtered.reduce((s, tx) => tx.type === 'income' ? s + Number(tx.amount) : s - Number(tx.amount), 0)
  const totalInc = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExp = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  const monthOptions = []
  for (let i = 0; i < 13; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    monthOptions.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) })
  }

  const relevantCats = cats.filter(c => c.type === form.type)

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Transacciones</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => { setShowAdd('expense'); setForm(p => ({ ...p, type: 'expense' })) }}
            style={{ padding: '7px 12px', borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            − Gasto
          </button>
          <button onClick={() => { setShowAdd('income'); setForm(p => ({ ...p, type: 'income' })) }}
            style={{ padding: '7px 12px', borderRadius: 8, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            + Ingreso
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <select
          value={`${filterYear}-${filterMonth}`}
          onChange={e => { const [y, m] = e.target.value.split('-'); setFilterYear(Number(y)); setFilterMonth(Number(m)) }}
          style={{ flex: 1, minWidth: 140, padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
        >
          {monthOptions.map(o => (
            <option key={`${o.year}-${o.month}`} value={`${o.year}-${o.month}`}>{o.label}</option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', borderRadius: 8, padding: 3 }}>
          {[['all', 'Todo'], ['expense', 'Gastos'], ['income', 'Ingresos']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterType(val)}
              style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                background: filterType === val ? 'var(--accent)' : 'transparent',
                color: filterType === val ? '#fff' : 'var(--text-muted)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Balance strip */}
      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { label: 'Ingresos', value: `+${totalInc.toFixed(2)} €`, color: '#10b981' },
          { label: 'Gastos',   value: `-${totalExp.toFixed(2)} €`, color: '#ef4444' },
          { label: 'Balance',  value: `${balance >= 0 ? '+' : ''}${balance.toFixed(2)} €`, color: balance >= 0 ? '#10b981' : '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, padding: '8px 12px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 10, color: 'var(--text-faint)' }}>{s.label}</p>
            <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: `1px solid ${showAdd === 'expense' ? '#ef444440' : '#10b98140'}`, borderRadius: 12, padding: 16 }}>
          <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: showAdd === 'expense' ? '#ef4444' : '#10b981' }}>
            {showAdd === 'expense' ? '− Nuevo gasto' : '+ Nuevo ingreso'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Importe *</label>
                <input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder="0.00" autoFocus
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Fecha *</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
                <option value="">Sin categoría</option>
                {relevantCats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Descripción (opcional)"
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(null)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              <button onClick={handleAdd} disabled={!form.amount}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: form.amount ? 1 : 0.4 }}>Guardar</button>
            </div>
            {addError && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{addError}</p>}
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>💳</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin transacciones</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade tu primer gasto o ingreso</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.map(tx => {
            const cat = tx.fin_categories
            const isIncome = tx.type === 'income'
            return (
              <div key={tx.id}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'var(--bg-card)' }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del'); if (b) b.style.opacity = '0' }}
              >
                <span style={{ fontSize: 20 }}>{cat?.icon ?? (isIncome ? '➕' : '💶')}</span>
                {cat && <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                    {tx.description || cat?.name || (isIncome ? 'Ingreso' : 'Gasto')}
                  </p>
                  <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>
                    {new Date(tx.date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    {cat ? ` · ${cat.name}` : ''}
                  </p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: isIncome ? '#10b981' : '#ef4444', flexShrink: 0 }}>
                  {isIncome ? '+' : '−'}{Number(tx.amount).toFixed(2)} €
                </span>
                <button className="del" onClick={() => remove(tx.id)}
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
