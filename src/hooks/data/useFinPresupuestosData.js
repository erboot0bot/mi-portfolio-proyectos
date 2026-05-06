import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { demoRead, demoWrite } from '../../data/demo/index.js'

const TABLE_KEY = 'fin_budgets'

export function useFinPresupuestosData({ appId, mode }) {
  const appType = appId.replace('demo-', '')
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (mode === 'demo') {
      setBudgets(demoRead(appType, TABLE_KEY))
      setLoading(false)
      return
    }
    supabase.from('fin_budgets')
      .select('*, fin_categories(name,icon,color)')
      .eq('app_id', appId)
      .then(({ data }) => { setBudgets(data ?? []); setLoading(false) })
  }, [appId, mode, appType])

  function upsert(budget, cat) {
    if (mode === 'demo') {
      const existing = budgets.find(b => b.category_id === budget.category_id && b.month === budget.month)
      let updated
      if (existing) {
        updated = budgets.map(b => b.id === existing.id ? { ...b, ...budget } : b)
      } else {
        const newB = {
          ...budget, id: crypto.randomUUID(), app_id: appId, created_at: new Date().toISOString(),
          fin_categories: cat ? { name: cat.name, icon: cat.icon, color: cat.color } : null,
        }
        updated = [...budgets, newB]
      }
      demoWrite(appType, TABLE_KEY, updated)
      setBudgets(updated)
      return Promise.resolve()
    }
    return supabase.from('fin_budgets')
      .upsert({ ...budget, app_id: appId }, { onConflict: 'app_id,category_id,month' })
      .then(() =>
        supabase.from('fin_budgets').select('*, fin_categories(name,icon,color)').eq('app_id', appId)
          .then(({ data }) => setBudgets(data ?? []))
      )
  }

  function remove(id) {
    if (mode === 'demo') {
      const updated = budgets.filter(b => b.id !== id)
      demoWrite(appType, TABLE_KEY, updated)
      setBudgets(updated)
      return Promise.resolve()
    }
    return supabase.from('fin_budgets').delete().eq('id', id)
      .then(() => setBudgets(p => p.filter(b => b.id !== id)))
  }

  return { budgets, loading, upsert, remove }
}
