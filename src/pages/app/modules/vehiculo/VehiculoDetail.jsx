import { useState, useEffect } from 'react'
import { useParams, useOutletContext, Navigate, Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'
import { useMode } from '../../../../contexts/ModeContext'
import { demoRead } from '../../../../data/demo/index.js'

const TABS = [
  { path: 'repostajes',    label: 'Repostajes',    icon: '⛽' },
  { path: 'mantenimiento', label: 'Mantenimiento', icon: '🔧' },
  { path: 'gastos',        label: 'Gastos',        icon: '💶' },
  { path: 'estadisticas',  label: 'Estadísticas',  icon: '📊' },
]

export default function VehiculoDetail() {
  const { vehicleId } = useParams()
  const { app }       = useOutletContext()
  const navigate      = useNavigate()
  const location      = useLocation()
  const { mode }      = useMode()
  const appType       = app.id.replace('demo-', '')
  const [vehicle, setVehicle]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  const listPath = location.pathname.replace(`/${vehicleId}`, '').replace(/\/(repostajes|mantenimiento|gastos|estadisticas)$/, '')

  useEffect(() => {
    if (mode === 'demo') {
      const found = demoRead(appType, 'vehicles').find(v => v.id === vehicleId)
      if (!found) { setNotFound(true); setLoading(false); return }
      setVehicle(found)
      setLoading(false)
      return
    }
    let cancelled = false
    supabase.from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .eq('app_id', app.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) { setNotFound(true); setLoading(false); return }
        setVehicle(data)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [vehicleId, app.id, mode, appType])

  if (notFound) return <Navigate to={listPath} replace />

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Vehicle header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px 0', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate(listPath)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: 20, padding: '0 4px' }}>
          ‹
        </button>
        <span style={{ fontSize: 28 }}>{vehicle.type === 'moto' ? '🏍️' : '🚗'}</span>
        <div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{vehicle.name}</p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
            {[vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(' ')}
            {vehicle.plate ? ` · ${vehicle.plate}` : ''}
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
              textDecoration: 'none', borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'color var(--transition)',
            })}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </div>

      {/* Sub-module content */}
      <div style={{ padding: 0 }}>
        <Outlet context={{ app, vehicle }} />
      </div>
    </div>
  )
}
