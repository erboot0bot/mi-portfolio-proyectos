import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { demoRead, demoWrite } from '../../data/demo/index.js'

const TABLE_KEY = 'recipes'

export function useRecipesData({ appId, mode }) {
  const appType   = appId.replace('demo-', '')
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (mode === 'demo') {
      setRecipes(demoRead(appType, TABLE_KEY))
      setLoading(false)
      return
    }
    supabase.from('recipes').select('*').eq('app_id', appId).order('created_at', { ascending: false })
      .then(({ data }) => { setRecipes(data ?? []); setLoading(false) })
  }, [appId, mode, appType])

  function add(recipe) {
    if (mode === 'demo') {
      const newR = { ...recipe, id: crypto.randomUUID(), app_id: appId, created_at: new Date().toISOString() }
      const updated = [newR, ...recipes]
      demoWrite(appType, TABLE_KEY, updated)
      setRecipes(updated)
      return Promise.resolve(newR)
    }
    return supabase.from('recipes').insert({ ...recipe, app_id: appId }).select().single()
      .then(({ data }) => { setRecipes(p => [data, ...p]); return data })
  }

  function update(id, changes) {
    if (mode === 'demo') {
      const updated = recipes.map(r => r.id === id ? { ...r, ...changes } : r)
      demoWrite(appType, TABLE_KEY, updated)
      setRecipes(updated)
      return Promise.resolve()
    }
    return supabase.from('recipes').update(changes).eq('id', id)
      .then(() => setRecipes(p => p.map(r => r.id === id ? { ...r, ...changes } : r)))
  }

  function remove(id) {
    if (mode === 'demo') {
      const updated = recipes.filter(r => r.id !== id)
      demoWrite(appType, TABLE_KEY, updated)
      setRecipes(updated)
      return Promise.resolve()
    }
    return supabase.from('recipes').delete().eq('id', id)
      .then(() => setRecipes(p => p.filter(r => r.id !== id)))
  }

  return { recipes, loading, add, update, remove }
}
