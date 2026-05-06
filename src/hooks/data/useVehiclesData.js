import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { demoRead, demoWrite } from '../../data/demo/index.js'

const TABLE_KEY = 'vehicles'

export function useVehiclesData({ appId, mode }) {
  const appType     = appId.replace('demo-', '')
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (mode === 'demo') {
      setVehicles(demoRead(appType, TABLE_KEY))
      setLoading(false)
      return
    }
    supabase.from('vehicles').select('*').eq('app_id', appId).order('created_at', { ascending: true })
      .then(({ data }) => { setVehicles(data ?? []); setLoading(false) })
  }, [appId, mode, appType])

  function add(vehicle) {
    if (mode === 'demo') {
      const newV = { ...vehicle, id: crypto.randomUUID(), app_id: appId, created_at: new Date().toISOString() }
      const updated = [...vehicles, newV]
      demoWrite(appType, TABLE_KEY, updated)
      setVehicles(updated)
      return Promise.resolve(newV)
    }
    return supabase.from('vehicles').insert({ ...vehicle, app_id: appId }).select().single()
      .then(({ data }) => { setVehicles(p => [...p, data]); return data })
  }

  function remove(id) {
    if (mode === 'demo') {
      const updated = vehicles.filter(v => v.id !== id)
      demoWrite(appType, TABLE_KEY, updated)
      setVehicles(updated)
      return Promise.resolve()
    }
    return supabase.from('vehicles').delete().eq('id', id)
      .then(() => setVehicles(p => p.filter(v => v.id !== id)))
  }

  return { vehicles, loading, add, remove }
}
