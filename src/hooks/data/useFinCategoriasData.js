import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { demoRead, demoWrite } from '../../data/demo/index.js'

const TABLE_KEY = 'fin_categories'

export function useFinCategoriasData({ appId, mode }) {
  const appType = appId.replace('demo-', '')
  const [cats, setCats]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (mode === 'demo') {
      setCats(demoRead(appType, TABLE_KEY))
      setLoading(false)
      return
    }
    supabase.from('fin_categories')
      .select('*').eq('app_id', appId).order('type').order('name')
      .then(({ data }) => { setCats(data ?? []); setLoading(false) })
  }, [appId, mode, appType])

  function add(cat) {
    if (mode === 'demo') {
      const newCat = { ...cat, id: crypto.randomUUID(), app_id: appId, created_at: new Date().toISOString() }
      const updated = [...cats, newCat].sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
      demoWrite(appType, TABLE_KEY, updated)
      setCats(updated)
      return Promise.resolve(newCat)
    }
    return supabase.from('fin_categories')
      .insert({ ...cat, app_id: appId }).select().single()
      .then(({ data }) => {
        setCats(p => [...p, data].sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name)))
        return data
      })
  }

  function update(id, changes) {
    if (mode === 'demo') {
      const updated = cats.map(c => c.id === id ? { ...c, ...changes } : c)
      demoWrite(appType, TABLE_KEY, updated)
      setCats(updated)
      return Promise.resolve()
    }
    return supabase.from('fin_categories').update(changes).eq('id', id)
      .then(() => setCats(p => p.map(c => c.id === id ? { ...c, ...changes } : c)))
  }

  function remove(id) {
    if (mode === 'demo') {
      const updated = cats.filter(c => c.id !== id)
      demoWrite(appType, TABLE_KEY, updated)
      setCats(updated)
      return Promise.resolve()
    }
    return supabase.from('fin_categories').delete().eq('id', id)
      .then(() => setCats(p => p.filter(c => c.id !== id)))
  }

  return { cats, loading, add, update, remove }
}
