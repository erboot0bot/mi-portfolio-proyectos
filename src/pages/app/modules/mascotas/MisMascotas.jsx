// src/pages/app/modules/mascotas/MisMascotas.jsx
import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

const SPECIES_ICONS = {
  perro: '🐕', gato: '🐈', pez: '🐠', conejo: '🐇',
  pajaro: '🐦', reptil: '🦎', otro: '🐾',
}

const SPECIES_LABELS = {
  perro: 'Perro', gato: 'Gato', pez: 'Pez', conejo: 'Conejo',
  pajaro: 'Pájaro', reptil: 'Reptil', otro: 'Otro',
}

function calcAge(birthDate) {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const now = new Date()
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth())
  if (totalMonths < 0) return null
  if (totalMonths < 1) return 'Recién nacido'
  if (totalMonths < 12) return `${totalMonths} mes${totalMonths !== 1 ? 'es' : ''}`
  const y = Math.floor(totalMonths / 12)
  return `${y} año${y !== 1 ? 's' : ''}`
}

export default function MisMascotas() {
  const { app } = useOutletContext()
  const navigate = useNavigate()
  const [pets, setPets]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [showAdd, setShowAdd]     = useState(false)
  const [form, setForm]           = useState({ name: '', species: 'perro', birth_date: '', notes: '' })
  const [addError, setAddError]   = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase.from('pets')
      .select('*')
      .eq('app_id', app.id)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setFetchError(error.message); setLoading(false); return }
        setPets(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [app.id])

  async function handleAdd() {
    if (!form.name.trim()) return
    setAddError(null)
    const { data, error } = await supabase.from('pets')
      .insert({
        app_id:     app.id,
        name:       form.name.trim(),
        species:    form.species,
        icon:       SPECIES_ICONS[form.species],
        birth_date: form.birth_date || null,
        notes:      form.notes.trim() || null,
      })
      .select()
      .single()
    if (error) { setAddError('No se pudo añadir la mascota. Inténtalo de nuevo.'); return }
    if (data) {
      setPets(p => [...p, data])
      setForm({ name: '', species: 'perro', birth_date: '', notes: '' })
      setShowAdd(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Mis Mascotas</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {pets.length} mascota{pets.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(p => !p)}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >+ Nueva mascota</button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Nueva mascota</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Nombre *"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
            />
            <select
              value={form.species}
              onChange={e => setForm(p => ({ ...p, species: e.target.value }))}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
            >
              {Object.entries(SPECIES_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{SPECIES_ICONS[val]} {label}</option>
              ))}
            </select>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Fecha nacimiento (opcional)</label>
              <input
                type="date"
                value={form.birth_date}
                onChange={e => setForm(p => ({ ...p, birth_date: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <textarea
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Notas (raza, color...)"
              rows={2}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                Cancelar
              </button>
              <button onClick={handleAdd} disabled={!form.name.trim()}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: form.name.trim() ? 1 : 0.4 }}>
                Añadir
              </button>
            </div>
            {addError && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{addError}</p>}
          </div>
        </div>
      )}

      {/* Content */}
      {fetchError ? (
        <p style={{ color: '#ef4444', fontSize: 13 }}>Error al cargar las mascotas: {fetchError}</p>
      ) : pets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: 48, margin: '0 0 8px' }}>🐾</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin mascotas aún</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade tu primera mascota</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pets.map(pet => {
            const age = calcAge(pet.birth_date)
            return (
              <button
                key={pet.id}
                onClick={() => navigate(pet.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 12,
                  border: '1px solid var(--border)', background: 'var(--bg-card)',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'border-color var(--transition)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span style={{ fontSize: 36, flexShrink: 0 }}>{pet.icon || SPECIES_ICONS[pet.species]}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{pet.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>{SPECIES_LABELS[pet.species]}</span>{age ? <span> · {age}</span> : null}
                  </p>
                  {pet.notes && (
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>{pet.notes}</p>
                  )}
                </div>
                <span style={{ color: 'var(--text-faint)', fontSize: 18 }}>›</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
