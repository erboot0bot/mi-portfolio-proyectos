import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { demoRead, demoWrite } from '../../data/demo/index.js'

const TABLE_KEY = 'fuel_logs'

export function useFuelLogsData({ appId, vehicleId, mode }) {
  const appType   = appId.replace('demo-', '')
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!vehicleId) { setLogs([]); setLoading(false); return }
    if (mode === 'demo') {
      const all = demoRead(appType, TABLE_KEY)
      setLogs(all.filter(l => l.vehicle_id === vehicleId))
      setLoading(false)
      return
    }
    supabase.from('fuel_logs').select('*').eq('vehicle_id', vehicleId).order('date', { ascending: false })
      .then(({ data }) => { setLogs(data ?? []); setLoading(false) })
  }, [vehicleId, mode, appType, appId])

  function add(log) {
    if (mode === 'demo') {
      const newLog = { ...log, id: crypto.randomUUID(), vehicle_id: vehicleId, app_id: appId, created_at: new Date().toISOString() }
      const all = demoRead(appType, TABLE_KEY)
      demoWrite(appType, TABLE_KEY, [newLog, ...all])
      setLogs(p => [newLog, ...p])
      return Promise.resolve(newLog)
    }
    return supabase.from('fuel_logs').insert({ ...log, vehicle_id: vehicleId, app_id: appId }).select().single()
      .then(({ data }) => { setLogs(p => [data, ...p]); return data })
  }

  function remove(id) {
    if (mode === 'demo') {
      const all = demoRead(appType, TABLE_KEY)
      demoWrite(appType, TABLE_KEY, all.filter(l => l.id !== id))
      setLogs(p => p.filter(l => l.id !== id))
      return Promise.resolve()
    }
    return supabase.from('fuel_logs').delete().eq('id', id)
      .then(() => setLogs(p => p.filter(l => l.id !== id)))
  }

  return { logs, loading, add, remove }
}
