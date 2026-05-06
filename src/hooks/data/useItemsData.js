import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { demoRead, demoWrite } from '../../data/demo/index.js'

export function useItemsData({ appId, mode, module: mod, select = '*', order = [['created_at', false]] }) {
  const appType  = appId.replace('demo-', '')
  const tableKey = `items_${mod}`
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (mode === 'demo') {
      setItems(demoRead(appType, tableKey))
      setLoading(false)
      return
    }
    let q = supabase.from('items').select(select).eq('app_id', appId).eq('module', mod)
    order.forEach(([col, asc]) => { q = q.order(col, { ascending: asc }) })
    q.then(({ data }) => { setItems(data ?? []); setLoading(false) })
  }, [appId, mode, mod, appType, tableKey, select]) // eslint-disable-line react-hooks/exhaustive-deps

  function add(item) {
    if (mode === 'demo') {
      const newItem = { ...item, id: crypto.randomUUID(), app_id: appId, module: mod, created_at: new Date().toISOString() }
      const updated = [newItem, ...items]
      demoWrite(appType, tableKey, updated)
      setItems(updated)
      return Promise.resolve(newItem)
    }
    return supabase.from('items').insert({ ...item, app_id: appId, module: mod }).select(select).single()
      .then(({ data }) => { setItems(p => [data, ...p]); return data })
  }

  function update(id, changes) {
    if (mode === 'demo') {
      const updated = items.map(i => i.id === id ? { ...i, ...changes } : i)
      demoWrite(appType, tableKey, updated)
      setItems(updated)
      return Promise.resolve()
    }
    return supabase.from('items').update(changes).eq('id', id)
      .then(() => setItems(p => p.map(i => i.id === id ? { ...i, ...changes } : i)))
  }

  function remove(id) {
    if (mode === 'demo') {
      const updated = items.filter(i => i.id !== id)
      demoWrite(appType, tableKey, updated)
      setItems(updated)
      return Promise.resolve()
    }
    return supabase.from('items').delete().eq('id', id)
      .then(() => setItems(p => p.filter(i => i.id !== id)))
  }

  return { items, loading, setItems, add, update, remove }
}
