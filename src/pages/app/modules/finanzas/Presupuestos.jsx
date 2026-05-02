import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

export default function Presupuestos() {
  const { app } = useOutletContext()
  const [cats, setCats]         = useState([])   // expense categories
  const [budgets, setBudgets]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState({})   // { [category_id]: draft }

  useEffect(() => {
    let cancelled = false
    Promise.all([
      supabase.from('fin_categories').select('*').eq('app_id', app.id).eq('type', 'expense').order('name'),
      supabase.from('fin_budgets').select('*').eq('app_id', app.id),
    ]).then(([c, b]) => {
      if (cancelled) return
      setCats(c.data ?? [])
      setBudgets(b.data ?? [])
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [app.id])

  async function handleSave(catId) {
    const draft = editing[catId]
    if (!draft || isNaN(Number(draft)) || Number(draft) <= 0) return
    const limit = Number(draft)
    const existing = budgets.find(b => b.category_id === catId)
    if (existing) {
      const { error } = await supabase.from('fin_budgets').update({ monthly_limit: limit }).eq('id', existing.id)
      if (!error) setBudgets(p => p.map(b => b.id === existing.id ? { ...b, monthly_limit: limit } : b))
    } else {
      const { data, error } = await supabase.from('fin_budgets')
        .insert({ app_id: app.id, category_id: catId, monthly_limit: limit })
        .select().single()
      if (!error && data) setBudgets(p => [...p, data])
    }
    setEditing(p => { const n = { ...p }; delete n[catId]; return n })
  }

  async function handleDelete(catId) {
    const b = budgets.find(bud => bud.category_id === catId)
    if (!b) return
    const { error } = await supabase.from('fin_budgets').delete().eq('id', b.id)
    if (!error) setBudgets(p => p.filter(bud => bud.id !== b.id))
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (cats.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <p style={{ fontSize: 40, margin: '0 0 8px' }}>🎯</p>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin categorías de gasto</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Crea categorías en "Categorías" primero</p>
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: 580, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Presupuestos</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>Límite mensual por categoría de gasto</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cats.map(cat => {
          const budget  = budgets.find(b => b.category_id === cat.id)
          const isEdit  = cat.id in editing
          const limit   = budget?.monthly_limit ?? null
          return (
            <div key={cat.id}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'var(--bg-card)' }}
            >
              <span style={{ fontSize: 20 }}>{cat.icon}</span>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{cat.name}</p>

              {isEdit ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    type="number" min="1" step="0.01"
                    value={editing[cat.id]}
                    onChange={e => setEditing(p => ({ ...p, [cat.id]: e.target.value }))}
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') handleSave(cat.id); if (e.key === 'Escape') setEditing(p => { const n = {...p}; delete n[cat.id]; return n }) }}
                    style={{ width: 90, padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', textAlign: 'right' }}
                  />
                  <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>€</span>
                  <button onClick={() => handleSave(cat.id)}
                    style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>✓</button>
                  <button onClick={() => setEditing(p => { const n = {...p}; delete n[cat.id]; return n })}
                    style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {limit !== null ? (
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{Number(limit).toFixed(2)} €</span>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Sin límite</span>
                  )}
                  <button onClick={() => setEditing(p => ({ ...p, [cat.id]: limit !== null ? String(limit) : '' }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: 14, padding: '2px 4px' }}>✏️</button>
                  {limit !== null && (
                    <button onClick={() => handleDelete(cat.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: 14, padding: '2px 4px' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
                    >×</button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
