import { useOutletContext, useNavigate } from 'react-router-dom'
import { useMode } from '../../../../contexts/ModeContext'
import { useFinTransaccionesData } from '../../../../hooks/data/useFinTransaccionesData'
import { useFinPresupuestosData } from '../../../../hooks/data/useFinPresupuestosData'

export default function Resumen() {
  const { app }  = useOutletContext()
  const navigate = useNavigate()
  const { mode } = useMode()
  const { txs,     loading: loadingTxs }     = useFinTransaccionesData({ appId: app.id, mode })
  const { budgets, loading: loadingBudgets } = useFinPresupuestosData({ appId: app.id, mode })

  const loading = loadingTxs || loadingBudgets

  const today    = new Date()
  const year     = today.getFullYear()
  const month    = today.getMonth() + 1
  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay  = new Date(year, month, 0).toISOString().slice(0, 10)

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  const monthTxs = txs.filter(t => t.date >= firstDay && t.date <= lastDay)
  const income   = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense  = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance  = income - expense

  const spendByCat = monthTxs.filter(t => t.type === 'expense' && t.category_id).reduce((acc, t) => {
    acc[t.category_id] = (acc[t.category_id] || 0) + Number(t.amount)
    return acc
  }, {})

  const monthLabel = today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Balance header */}
      <div style={{ padding: '20px', borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--text-faint)', textTransform: 'capitalize' }}>{monthLabel}</p>
        <p style={{ margin: '0 0 12px', fontSize: 32, fontWeight: 800, color: balance >= 0 ? '#10b981' : '#ef4444' }}>
          {balance >= 0 ? '+' : ''}{balance.toFixed(2)} €
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-faint)' }}>Ingresos</p>
            <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: '#10b981' }}>+{income.toFixed(2)} €</p>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-faint)' }}>Gastos</p>
            <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: '#ef4444' }}>-{expense.toFixed(2)} €</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => navigate('../transacciones')}
          style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#ef444420', border: '1px solid #ef444440', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#ef4444' }}>
          − Añadir gasto
        </button>
        <button onClick={() => navigate('../transacciones')}
          style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#10b98120', border: '1px solid #10b98140', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#10b981' }}>
          + Añadir ingreso
        </button>
      </div>

      {/* Budget progress */}
      {budgets.length > 0 && (
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Presupuestos del mes</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {budgets.map(b => {
              const cat   = b.fin_categories
              const spent = spendByCat[b.category_id] || 0
              const pct   = Math.min(100, (spent / Number(b.monthly_limit)) * 100)
              const isOver = pct >= 90
              return (
                <div key={b.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{cat?.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{cat?.name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: isOver ? '#ef4444' : 'var(--text-muted)' }}>
                      {spent.toFixed(2)} / {Number(b.monthly_limit).toFixed(2)} €
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: isOver ? '#ef4444' : (cat?.color ?? 'var(--accent)'), borderRadius: 4, transition: 'width 0.4s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state if no data */}
      {monthTxs.length === 0 && budgets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>📊</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin datos este mes</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade transacciones para ver tu resumen</p>
        </div>
      )}
    </div>
  )
}
