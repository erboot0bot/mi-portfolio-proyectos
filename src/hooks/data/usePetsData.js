import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { demoRead, demoWrite } from '../../data/demo/index.js'

const TABLE_KEY = 'pets'

export function usePetsData({ appId, mode }) {
  const appType   = appId.replace('demo-', '')
  const [pets, setPets]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (mode === 'demo') {
      setPets(demoRead(appType, TABLE_KEY))
      setLoading(false)
      return
    }
    supabase.from('pets').select('*').eq('app_id', appId).order('created_at', { ascending: true })
      .then(({ data }) => { setPets(data ?? []); setLoading(false) })
  }, [appId, mode, appType])

  function add(pet) {
    if (mode === 'demo') {
      const newPet = { ...pet, id: crypto.randomUUID(), app_id: appId, created_at: new Date().toISOString() }
      const updated = [...pets, newPet]
      demoWrite(appType, TABLE_KEY, updated)
      setPets(updated)
      return Promise.resolve(newPet)
    }
    return supabase.from('pets').insert({ ...pet, app_id: appId }).select().single()
      .then(({ data }) => { setPets(p => [...p, data]); return data })
  }

  function update(id, changes) {
    if (mode === 'demo') {
      const updated = pets.map(p => p.id === id ? { ...p, ...changes } : p)
      demoWrite(appType, TABLE_KEY, updated)
      setPets(updated)
      return Promise.resolve()
    }
    return supabase.from('pets').update(changes).eq('id', id)
      .then(() => setPets(p => p.map(pet => pet.id === id ? { ...pet, ...changes } : pet)))
  }

  function remove(id) {
    if (mode === 'demo') {
      const updated = pets.filter(p => p.id !== id)
      demoWrite(appType, TABLE_KEY, updated)
      setPets(updated)
      return Promise.resolve()
    }
    return supabase.from('pets').delete().eq('id', id)
      .then(() => setPets(p => p.filter(pet => pet.id !== id)))
  }

  return { pets, loading, add, update, remove }
}
