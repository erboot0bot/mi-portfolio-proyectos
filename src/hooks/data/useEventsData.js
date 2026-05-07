import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { demoRead, demoWrite } from '../../data/demo/index.js'

const TABLE_KEY = 'events'

export function useEventsData({ appId, mode, eventTypes }) {
  const appType   = appId.replace('demo-', '')
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (mode === 'demo') {
      const all = demoRead(appType, TABLE_KEY)
      setEvents(eventTypes ? all.filter(e => eventTypes.includes(e.event_type)) : all)
      setLoading(false)
      return
    }
    let q = supabase.from('events').select('*').eq('app_id', appId).order('start_time')
    if (eventTypes) q = q.in('event_type', eventTypes)
    q.then(({ data }) => { setEvents(data ?? []); setLoading(false) })
  }, [appId, mode, appType, JSON.stringify(eventTypes)]) // eslint-disable-line react-hooks/exhaustive-deps

  function add(event) {
    if (mode === 'demo') {
      const newEvent = { ...event, id: crypto.randomUUID(), app_id: appId, created_at: new Date().toISOString() }
      const all = demoRead(appType, TABLE_KEY)
      demoWrite(appType, TABLE_KEY, [...all, newEvent])
      setEvents(p => [...p, newEvent])
      return Promise.resolve(newEvent)
    }
    return supabase.from('events').insert({ ...event, app_id: appId }).select().single()
      .then(({ data }) => { setEvents(p => [...p, data]); return data })
  }

  function update(id, changes) {
    if (mode === 'demo') {
      const all = demoRead(appType, TABLE_KEY)
      demoWrite(appType, TABLE_KEY, all.map(e => e.id === id ? { ...e, ...changes } : e))
      setEvents(p => p.map(e => e.id === id ? { ...e, ...changes } : e))
      return Promise.resolve()
    }
    return supabase.from('events').update(changes).eq('id', id)
      .then(() => setEvents(p => p.map(e => e.id === id ? { ...e, ...changes } : e)))
  }

  function remove(id) {
    if (mode === 'demo') {
      const all = demoRead(appType, TABLE_KEY)
      demoWrite(appType, TABLE_KEY, all.filter(e => e.id !== id))
      setEvents(p => p.filter(e => e.id !== id))
      return Promise.resolve()
    }
    return supabase.from('events').delete().eq('id', id)
      .then(() => setEvents(p => p.filter(e => e.id !== id)))
  }

  return { events, loading, setEvents, add, update, remove }
}
