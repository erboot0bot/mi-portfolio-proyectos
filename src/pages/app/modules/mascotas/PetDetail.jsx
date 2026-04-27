// src/pages/app/modules/mascotas/PetDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useOutletContext, Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

const SPECIES_MODULES = {
  perro:  ['alimentacion', 'salud', 'rutinas'],
  gato:   ['alimentacion', 'salud'],
  pez:    ['alimentacion', 'salud', 'rutinas'],
  conejo: ['alimentacion', 'salud', 'rutinas'],
  pajaro: ['alimentacion', 'salud', 'rutinas'],
  reptil: ['alimentacion', 'salud', 'rutinas'],
  otro:   ['alimentacion', 'salud'],
}

const MODULE_LABELS = {
  alimentacion: { label: 'Alimentación', icon: '🍽️' },
  salud:        { label: 'Salud',         icon: '🩺' },
  rutinas:      { label: 'Rutinas',       icon: '🏃' },
}

const SPECIES_ICONS = {
  perro: '🐕', gato: '🐈', pez: '🐠', conejo: '🐇',
  pajaro: '🐦', reptil: '🦎', otro: '🐾',
}

export default function PetDetail() {
  const { petId }   = useParams()
  const { app }     = useOutletContext()
  const navigate    = useNavigate()
  const [pet, setPet]               = useState(null)
  const [loading, setLoading]       = useState(true)
  const [notFound, setNotFound]     = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase.from('pets')
      .select('*')
      .eq('id', petId)
      .eq('app_id', app.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) { setNotFound(true); setLoading(false); return }
        setPet(data)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [petId, app.id])

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)
    const { error: evErr } = await supabase.from('events')
      .delete()
      .eq('app_id', app.id)
      .contains('metadata', { pet_id: pet.id })
    if (evErr) { setDeleting(false); setDeleteError('No se pudo eliminar. Inténtalo de nuevo.'); return }

    const { error: invErr } = await supabase.from('inventory')
      .delete()
      .eq('app_id', app.id)
      .contains('metadata', { pet_id: pet.id })
    if (invErr) { setDeleting(false); setDeleteError('No se pudo eliminar. Inténtalo de nuevo.'); return }

    const { error: petErr } = await supabase.from('pets').delete().eq('id', pet.id)
    if (petErr) { setDeleting(false); setDeleteError('No se pudo eliminar. Inténtalo de nuevo.'); return }

    navigate('/app/mascotas/mis-mascotas', { replace: true })
  }

  if (notFound) return <Navigate to="/app/mascotas/mis-mascotas" replace />

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  const tabs = SPECIES_MODULES[pet.species] ?? ['alimentacion', 'salud']

  return (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column' }}>

      {/* Pet header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 12px' }}>
        <span style={{ fontSize: 40, flexShrink: 0 }}>{pet.icon || SPECIES_ICONS[pet.species]}</span>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text)', flex: 1 }}>{pet.name}</h1>
        <button
          onClick={() => setConfirmDelete(true)}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,.4)', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: 12, flexShrink: 0 }}
        >Eliminar</button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 2, padding: '0 20px', borderBottom: '1px solid var(--border)' }}>
        {tabs.map(tab => {
          const mod = MODULE_LABELS[tab]
          return (
            <NavLink
              key={tab}
              to={tab}
              style={({ isActive }) => ({
                padding: '10px 14px',
                borderRadius: '8px 8px 0 0',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                textDecoration: 'none',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'color var(--transition)',
                display: 'flex', alignItems: 'center', gap: 4,
              })}
            >
              <span>{mod.icon}</span>
              <span>{mod.label}</span>
            </NavLink>
          )
        })}
      </div>

      {/* Module content */}
      <div style={{ padding: '16px 20px' }}>
        <Outlet context={{ pet, app }} />
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div role="presentation" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onKeyDown={e => e.key === 'Escape' && !deleting && setConfirmDelete(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-modal-title" style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, maxWidth: 360, width: '90%' }}>
            <p id="delete-modal-title" style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>¿Eliminar a {pet.name}?</p>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-muted)' }}>
              Se eliminarán todos sus eventos e inventario. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(false)} disabled={deleting}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ padding: '8px 16px', borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
            {deleteError && <p style={{ fontSize: 12, color: '#ef4444', margin: '12px 0 0', textAlign: 'center' }}>{deleteError}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
