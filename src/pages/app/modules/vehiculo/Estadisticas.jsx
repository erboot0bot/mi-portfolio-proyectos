import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'
import { useMode } from '../../../../contexts/ModeContext'
import { demoRead } from '../../../../data/demo/index.js'

export default function Estadisticas() {
  const { app, vehicle } = useOutletContext()
  const { mode } = useMode()
  const appType = app.id.replace('demo-', '')
  const [fuel, setFuel]         = useState([])
  const [maint, setMaint]       = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (mode === 'demo') {
      const allFuel  = demoRead(appType, 'fuel_logs').filter(l => l.vehicle_id === vehicle.id)
      const allMaint = demoRead(appType, 'maintenance_logs').filter(l => l.vehicle_id === vehicle.id)
      const allExp   = (demoRead(appType, 'vehicle_expenses') ?? []).filter(e => e.vehicle_id === vehicle.id)
      setFuel(allFuel)
      setMaint(allMaint)
      setExpenses(allExp)
      setLoading(false)
      return
    }
    let cancelled = false
    Promise.all([
      supabase.from('fuel_logs').select('*').eq('vehicle_id', vehicle.id),
      supabase.from('maintenance_logs').select('*').eq('vehicle_id', vehicle.id),
      supabase.from('vehicle_expenses').select('*').eq('vehicle_id', vehicle.id),
    ]).then(([f, m, e]) => {
      if (cancelled) return
      setFuel(f.data ?? [])
      setMaint(m.data ?? [])
      setExpenses(e.data ?? [])
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [vehicle.id, mode, appType])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  const totalFuel  = fuel.reduce((s, l) => s + (Number(l.total_cost) || 0), 0)
  const totalMaint = maint.reduce((s, l) => s + (Number(l.cost) || 0), 0)
  const totalExp   = expenses.reduce((s, e) => s + Number(e.cost), 0)
  const totalAll   = totalFuel + totalMaint + totalExp

  // km range for cost/km
  const kmEntries = fuel.filter(l => l.km_at_fill).map(l => l.km_at_fill)
  const kmMin     = vehicle.initial_km || (kmEntries.length ? Math.min(...kmEntries) : 0)
  const kmMax     = kmEntries.length ? Math.max(...kmEntries) : 0
  const kmTotal   = Math.max(0, kmMax - kmMin)
  const costPerKm = kmTotal > 0 ? (totalAll / kmTotal).toFixed(3) : null

  // Average consumption
  const fullTanks  = fuel.filter(l => l.full_tank && l.km_at_fill).sort((a, b) => a.km_at_fill - b.km_at_fill)
  const avgConsump = fullTanks.length >= 2
    ? ((fullTanks.slice(1).reduce((s, l) => s + Number(l.liters), 0) / Math.max(1, fullTanks[fullTanks.length - 1].km_at_fill - fullTanks[0].km_at_fill)) * 100).toFixed(1)
    : null

  // Breakdown by maintenance type
  const maintByType = maint.reduce((acc, l) => {
    if (!l.cost) return acc
    acc[l.type] = (acc[l.type] || 0) + Number(l.cost)
    return acc
  }, {})

  const stats = [
    { label: 'Total combustible',   value: `${totalFuel.toFixed(2)} €`,  icon: '⛽' },
    { label: 'Total mantenimiento', value: `${totalMaint.toFixed(2)} €`, icon: '🔧' },
    { label: 'Total gastos varios', value: `${totalExp.toFixed(2)} €`,   icon: '💶' },
    { label: 'Gasto total',         value: `${totalAll.toFixed(2)} €`,   icon: '💰' },
    ...(costPerKm  ? [{ label: 'Coste por km',   value: `${costPerKm} €/km`,     icon: '📍' }] : []),
    ...(avgConsump ? [{ label: 'Consumo medio',  value: `${avgConsump} L/100km`, icon: '📊' }] : []),
    ...(kmTotal > 0 ? [{ label: 'Km registrados', value: `${kmTotal.toLocaleString()} km`, icon: '🛣️' }] : []),
  ]

  if (totalAll === 0 && fuel.length === 0 && maint.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ fontSize: 48, margin: '0 0 8px' }}>📊</p>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin datos aún</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Registra repostajes y mantenimientos para ver estadísticas</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        {stats.map(s => (
          <div key={s.label} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-faint)' }}>{s.icon} {s.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Maintenance breakdown */}
      {Object.keys(maintByType).length > 0 && (
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Desglose mantenimiento</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(maintByType).sort(([, a], [, b]) => b - a).map(([type, cost]) => {
              const pct = totalMaint > 0 ? (cost / totalMaint * 100) : 0
              return (
                <div key={type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{cost.toFixed(2)} €</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 3, transition: 'width 0.4s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
