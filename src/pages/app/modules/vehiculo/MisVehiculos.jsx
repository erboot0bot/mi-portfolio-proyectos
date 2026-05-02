import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

const TYPE_ICONS  = { coche: '🚗', moto: '🏍️' }
const TYPE_LABELS = { coche: 'Coche', moto: 'Moto' }
const FUEL_LABELS = { gasolina: 'Gasolina', diesel: 'Diésel', electrico: 'Eléctrico', hibrido: 'Híbrido', otro: 'Otro' }

export default function MisVehiculos() {
  const { app }  = useOutletContext()
  const navigate = useNavigate()
  const [vehicles, setVehicles]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [showAdd, setShowAdd]       = useState(false)
  const [form, setForm]             = useState({
    name: '', type: 'coche', brand: '', model: '', year: '', plate: '', fuel_type: 'gasolina', initial_km: '',
  })
  const [addError, setAddError] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase.from('vehicles')
      .select('*')
      .eq('app_id', app.id)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setFetchError(error.message); setLoading(false); return }
        setVehicles(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [app.id])

  async function handleAdd() {
    if (!form.name.trim()) return
    setAddError(null)
    const { data, error } = await supabase.from('vehicles')
      .insert({
        app_id:     app.id,
        name:       form.name.trim(),
        type:       form.type,
        brand:      form.brand.trim() || null,
        model:      form.model.trim() || null,
        year:       form.year ? Number(form.year) : null,
        plate:      form.plate.trim().toUpperCase() || null,
        fuel_type:  form.fuel_type,
        initial_km: form.initial_km ? Number(form.initial_km) : 0,
      })
      .select().single()
    if (error) { setAddError('No se pudo guardar. Inténtalo de nuevo.'); return }
    if (data) {
      setVehicles(p => [...p, data])
      setForm({ name: '', type: 'coche', brand: '', model: '', year: '', plate: '', fuel_type: 'gasolina', initial_km: '' })
      setShowAdd(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Mis Vehículos</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(p => !p)}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >+ Añadir vehículo</button>
      </div>

      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Nuevo vehículo</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Nombre o alias (ej. Mi Golf) *"
              autoFocus
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
                <option value="coche">🚗 Coche</option>
                <option value="moto">🏍️ Moto</option>
              </select>
              <select value={form.fuel_type} onChange={e => setForm(p => ({ ...p, fuel_type: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
                <option value="gasolina">Gasolina</option>
                <option value="diesel">Diésel</option>
                <option value="electrico">Eléctrico</option>
                <option value="hibrido">Híbrido</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))}
                placeholder="Marca (VW, BMW...)" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              <input value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))}
                placeholder="Modelo (Golf, Series 3...)" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                placeholder="Año" type="number" min="1900" max="2099"
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              <input value={form.plate} onChange={e => setForm(p => ({ ...p, plate: e.target.value }))}
                placeholder="Matrícula"
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              <input value={form.initial_km} onChange={e => setForm(p => ({ ...p, initial_km: e.target.value }))}
                placeholder="Km iniciales" type="number" min="0"
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              <button onClick={handleAdd} disabled={!form.name.trim()}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: form.name.trim() ? 1 : 0.4 }}>Guardar</button>
            </div>
            {addError && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{addError}</p>}
          </div>
        </div>
      )}

      {fetchError ? (
        <p style={{ color: '#ef4444', fontSize: 13 }}>Error: {fetchError}</p>
      ) : vehicles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: 48, margin: '0 0 8px' }}>🚗</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin vehículos</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade tu primer vehículo</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {vehicles.map(v => (
            <button key={v.id} onClick={() => navigate(v.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12,
                border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'border-color var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <span style={{ fontSize: 36, flexShrink: 0 }}>{TYPE_ICONS[v.type]}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{v.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                  {[TYPE_LABELS[v.type], v.brand, v.model, v.year].filter(Boolean).join(' · ')}
                </p>
                {v.plate && (
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>{v.plate}</p>
                )}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-faint)', flexShrink: 0 }}>{FUEL_LABELS[v.fuel_type]}</span>
              <span style={{ color: 'var(--text-faint)', fontSize: 18 }}>›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
