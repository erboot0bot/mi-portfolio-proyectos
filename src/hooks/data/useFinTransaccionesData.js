import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { demoRead, demoWrite } from '../../data/demo/index.js'

const TABLE_KEY = 'fin_transactions'

export function useFinTransaccionesData({ appId, mode }) {
  const appType = appId.replace('demo-', '')
  const [txs, setTxs]         = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (mode === 'demo') {
      // Mock data already has fin_categories embedded; no join needed
      setTxs(demoRead(appType, TABLE_KEY))
      setLoading(false)
      return
    }
    supabase.from('fin_transactions')
      .select('*, fin_categories(name,icon,color,type)')
      .eq('app_id', appId).order('date', { ascending: false })
      .then(({ data }) => { setTxs(data ?? []); setLoading(false) })
  }, [appId, mode, appType])

  function add(tx, cats) {
    if (mode === 'demo') {
      const cat = cats?.find(c => c.id === tx.category_id) ?? null
      const newTx = {
        ...tx,
        id: crypto.randomUUID(),
        app_id: appId,
        created_at: new Date().toISOString(),
        fin_categories: cat ? { name: cat.name, icon: cat.icon, color: cat.color, type: cat.type } : null,
      }
      const updated = [newTx, ...txs]
      demoWrite(appType, TABLE_KEY, updated)
      setTxs(updated)
      return Promise.resolve(newTx)
    }
    return supabase.from('fin_transactions')
      .insert({ ...tx, app_id: appId })
      .select('*, fin_categories(name,icon,color,type)').single()
      .then(({ data }) => { setTxs(p => [data, ...p]); return data })
  }

  function remove(id) {
    if (mode === 'demo') {
      const updated = txs.filter(t => t.id !== id)
      demoWrite(appType, TABLE_KEY, updated)
      setTxs(updated)
      return Promise.resolve()
    }
    return supabase.from('fin_transactions').delete().eq('id', id)
      .then(() => setTxs(p => p.filter(t => t.id !== id)))
  }

  return { txs, loading, add, remove }
}
