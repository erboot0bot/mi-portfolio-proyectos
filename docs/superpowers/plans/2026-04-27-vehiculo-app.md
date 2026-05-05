# Vehículo App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Vehículo app with vehicle profiles (cars/motorcycles), fuel log, maintenance history, misc expenses, and statistics dashboard.

**Architecture:** Follows the MisMascotas → PetDetail pattern: MisVehiculos lists vehicles, VehiculoDetail loads the vehicle by `vehicleId` param and renders sub-tabs (Repostajes/Mantenimiento/Gastos/Estadísticas) via nested `<Outlet>`. All data tables (`vehicles`, `fuel_logs`, `maintenance_logs`, `vehicle_expenses`) are already created in DB with `app_id REFERENCES projects(id)` and `user_owns_project` RLS. **Prerequisite: Plan 1 (personal-app) Task 1 must be complete** — routes and AppLayout constants must already be wired.

**Tech Stack:** React 18, React Router v6 (nested routes), Supabase JS, Vitest + RTL

---

## File Map

**Created:**
- `src/pages/app/modules/vehiculo/MisVehiculos.jsx`
- `src/pages/app/modules/vehiculo/VehiculoDetail.jsx`
- `src/pages/app/modules/vehiculo/Repostajes.jsx`
- `src/pages/app/modules/vehiculo/Mantenimiento.jsx`
- `src/pages/app/modules/vehiculo/VehiculoGastos.jsx`
- `src/pages/app/modules/vehiculo/Estadisticas.jsx`
- `src/pages/app/modules/vehiculo/__tests__/MisVehiculos.test.jsx`
- `src/pages/app/modules/vehiculo/__tests__/Repostajes.test.jsx`

**Note:** `src/pages/app/modules/vehiculo/Welcome.jsx` already exists but will be superseded by the new routes — it can be left in place (the route no longer points to it).

---

### Task 1: MisVehiculos — vehicle list

**Files:**
- Create: `src/pages/app/modules/vehiculo/MisVehiculos.jsx`
- Create: `src/pages/app/modules/vehiculo/__tests__/MisVehiculos.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/pages/app/modules/vehiculo/__tests__/MisVehiculos.test.jsx`:

```jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useOutletContext: () => ({
      app: { id: 'app-1', icon: '🚗', name: 'Vehículo', type: 'vehiculo' },
      modules: [{ path: 'mis-vehiculos', label: 'Mis Vehículos', icon: '🚗' }],
    }),
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn((cb) => cb({ data: [], error: null })),
    }),
  },
}))

import MisVehiculos from '../MisVehiculos'

describe('MisVehiculos', () => {
  it('muestra empty state cuando no hay vehículos', async () => {
    render(<MisVehiculos />)
    await waitFor(() =>
      expect(screen.getByText(/sin vehículos/i)).toBeInTheDocument()
    )
  })

  it('muestra botón añadir vehículo', async () => {
    render(<MisVehiculos />)
    await waitFor(() =>
      expect(screen.getByText(/\+ añadir vehículo/i)).toBeInTheDocument()
    )
  })

  it('muestra formulario al pulsar añadir', async () => {
    render(<MisVehiculos />)
    await waitFor(() => screen.getByText(/\+ añadir vehículo/i))
    fireEvent.click(screen.getByText(/\+ añadir vehículo/i))
    expect(screen.getByPlaceholderText(/nombre o alias/i)).toBeInTheDocument()
  })

  it('muestra vehículos cargados', async () => {
    const { supabase } = await import('../../../../../lib/supabase')
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn((cb) => cb({
        data: [{ id: 'v1', name: 'Mi Golf', type: 'coche', brand: 'Volkswagen', model: 'Golf', year: 2019, plate: '1234ABC', fuel_type: 'gasolina', initial_km: 0, notes: null }],
        error: null,
      })),
    })
    render(<MisVehiculos />)
    await waitFor(() => expect(screen.getByText('Mi Golf')).toBeInTheDocument())
    expect(screen.getByText('1234ABC')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- --run src/pages/app/modules/vehiculo/__tests__/MisVehiculos.test.jsx
```

Expected: FAIL — `Cannot find module '../MisVehiculos'`

- [ ] **Step 3: Create MisVehiculos.jsx**

Create `src/pages/app/modules/vehiculo/MisVehiculos.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

const TYPE_ICONS = { coche: '🚗', moto: '🏍️' }
const TYPE_LABELS = { coche: 'Coche', moto: 'Moto' }
const FUEL_LABELS = { gasolina: 'Gasolina', diesel: 'Diésel', electrico: 'Eléctrico', hibrido: 'Híbrido', otro: 'Otro' }

export default function MisVehiculos() {
  const { app }   = useOutletContext()
  const navigate  = useNavigate()
  const [vehicles, setVehicles]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [showAdd, setShowAdd]     = useState(false)
  const [form, setForm]           = useState({
    name: '', type: 'coche', brand: '', model: '', year: '', plate: '', fuel_type: 'gasolina', initial_km: '',
  })
  const [addError, setAddError]   = useState(null)

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
```

- [ ] **Step 4: Run tests — verify pass**

```bash
npm run test -- --run src/pages/app/modules/vehiculo/__tests__/MisVehiculos.test.jsx
```

Expected: 4 passed

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/modules/vehiculo/MisVehiculos.jsx src/pages/app/modules/vehiculo/__tests__/MisVehiculos.test.jsx
git commit -m "feat(vehiculo): MisVehiculos — lista de vehículos con formulario de alta"
```

---

### Task 2: VehiculoDetail — shell with sub-tabs

**Files:**
- Create: `src/pages/app/modules/vehiculo/VehiculoDetail.jsx`

- [ ] **Step 1: Create VehiculoDetail.jsx**

This component mirrors PetDetail: loads the vehicle by `vehicleId`, renders sub-tab nav, and provides the vehicle via `<Outlet context>`.

Create `src/pages/app/modules/vehiculo/VehiculoDetail.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { useParams, useOutletContext, Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

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
  const [vehicle, setVehicle]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
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
  }, [vehicleId, app.id])

  if (notFound) return <Navigate to="/app/vehiculo/mis-vehiculos" replace />

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Vehicle header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px 0', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate('/app/vehiculo/mis-vehiculos')}
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
```

- [ ] **Step 2: Verify routing manually**

```bash
npm run dev
```

Navigate to `/app/vehiculo` → add a vehicle → click it → should show the 4 sub-tabs (Repostajes, Mantenimiento, Gastos, Estadísticas) and redirect to Repostajes.

- [ ] **Step 3: Commit**

```bash
git add src/pages/app/modules/vehiculo/VehiculoDetail.jsx
git commit -m "feat(vehiculo): VehiculoDetail — shell con sub-tabs y header del vehículo"
```

---

### Task 3: Repostajes module

**Files:**
- Create: `src/pages/app/modules/vehiculo/Repostajes.jsx`
- Create: `src/pages/app/modules/vehiculo/__tests__/Repostajes.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/pages/app/modules/vehiculo/__tests__/Repostajes.test.jsx`:

```jsx
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useOutletContext: () => ({
      app: { id: 'app-1', icon: '🚗', name: 'Vehículo', type: 'vehiculo' },
      vehicle: { id: 'v1', name: 'Mi Golf', type: 'coche', fuel_type: 'gasolina' },
    }),
  }
})

vi.mock('../../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn((cb) => cb({ data: [], error: null })),
    }),
  },
}))

import Repostajes from '../Repostajes'

describe('Repostajes', () => {
  it('muestra empty state cuando no hay repostajes', async () => {
    render(<Repostajes />)
    await waitFor(() =>
      expect(screen.getByText(/sin repostajes/i)).toBeInTheDocument()
    )
  })

  it('muestra botón añadir repostaje', async () => {
    render(<Repostajes />)
    await waitFor(() =>
      expect(screen.getByText(/\+ repostaje/i)).toBeInTheDocument()
    )
  })

  it('muestra repostajes con litros y coste', async () => {
    const { supabase } = await import('../../../../../lib/supabase')
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn((cb) => cb({
        data: [{ id: 'f1', date: '2026-04-27', liters: 45.2, price_per_liter: 1.65, total_cost: 74.58, km_at_fill: 52000, full_tank: true, notes: null }],
        error: null,
      })),
    })
    render(<Repostajes />)
    await waitFor(() => expect(screen.getByText(/45\.2/)).toBeInTheDocument())
    expect(screen.getByText(/74\.58/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- --run src/pages/app/modules/vehiculo/__tests__/Repostajes.test.jsx
```

Expected: FAIL — `Cannot find module '../Repostajes'`

- [ ] **Step 3: Create Repostajes.jsx**

Create `src/pages/app/modules/vehiculo/Repostajes.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

export default function Repostajes() {
  const { app, vehicle } = useOutletContext()
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ date: new Date().toISOString().slice(0, 10), liters: '', price_per_liter: '', km_at_fill: '', full_tank: true, notes: '' })
  const [addError, setAddError] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase.from('fuel_logs')
      .select('*')
      .eq('vehicle_id', vehicle.id)
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        setLogs(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [vehicle.id])

  const totalCost    = logs.reduce((s, l) => s + (Number(l.total_cost) || 0), 0)
  const avgPerFill   = logs.length ? totalCost / logs.length : 0
  const avgConsump   = (() => {
    const fullTanks = logs.filter(l => l.full_tank && l.km_at_fill)
    if (fullTanks.length < 2) return null
    const sorted = [...fullTanks].sort((a, b) => a.km_at_fill - b.km_at_fill)
    const kmSpan  = sorted[sorted.length - 1].km_at_fill - sorted[0].km_at_fill
    const litres  = sorted.slice(1).reduce((s, l) => s + Number(l.liters), 0)
    return kmSpan > 0 ? (litres / kmSpan * 100).toFixed(1) : null
  })()

  async function handleAdd() {
    if (!form.liters || !form.date) return
    setAddError(null)
    const liters   = Number(form.liters)
    const ppl      = form.price_per_liter ? Number(form.price_per_liter) : null
    const total    = ppl ? Number((liters * ppl).toFixed(2)) : null
    const { data, error } = await supabase.from('fuel_logs')
      .insert({
        vehicle_id:     vehicle.id,
        app_id:         app.id,
        date:           form.date,
        liters,
        price_per_liter: ppl,
        total_cost:     total,
        km_at_fill:     form.km_at_fill ? Number(form.km_at_fill) : null,
        full_tank:      form.full_tank,
        notes:          form.notes.trim() || null,
      })
      .select().single()
    if (error) { setAddError('No se pudo guardar.'); return }
    if (data) {
      setLogs(p => [data, ...p])
      setForm({ date: new Date().toISOString().slice(0, 10), liters: '', price_per_liter: '', km_at_fill: '', full_tank: true, notes: '' })
      setShowAdd(false)
    }
  }

  async function deleteLog(id) {
    const { error } = await supabase.from('fuel_logs').delete().eq('id', id)
    if (!error) setLogs(p => p.filter(l => l.id !== id))
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats bar */}
      {logs.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            ['Total gastado', `${totalCost.toFixed(2)} €`],
            ['Media por repostaje', `${avgPerFill.toFixed(2)} €`],
            avgConsump ? ['Consumo medio', `${avgConsump} L/100km`] : null,
          ].filter(Boolean).map(([label, value]) => (
            <div key={label} style={{ flex: 1, minWidth: 120, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-faint)' }}>{label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{logs.length} repostaje{logs.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setShowAdd(p => !p)}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          + Repostaje
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Fecha *</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Litros *</label>
                <input type="number" min="0" step="0.01" value={form.liters} onChange={e => setForm(p => ({ ...p, liters: e.target.value }))}
                  placeholder="45.00" autoFocus
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Precio/litro (€)</label>
                <input type="number" min="0" step="0.001" value={form.price_per_liter} onChange={e => setForm(p => ({ ...p, price_per_liter: e.target.value }))}
                  placeholder="1.65"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Km en el repostaje</label>
                <input type="number" min="0" value={form.km_at_fill} onChange={e => setForm(p => ({ ...p, km_at_fill: e.target.value }))}
                  placeholder="52000"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.full_tank} onChange={e => setForm(p => ({ ...p, full_tank: e.target.checked }))} />
              Depósito lleno
            </label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              <button onClick={handleAdd} disabled={!form.liters || !form.date}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: (form.liters && form.date) ? 1 : 0.4 }}>Guardar</button>
            </div>
            {addError && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{addError}</p>}
          </div>
        </div>
      )}

      {/* List */}
      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>⛽</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin repostajes</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Registra tu primer repostaje</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {logs.map(log => (
            <div key={log.id}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)' }}
              onMouseEnter={e => { const b = e.currentTarget.querySelector('.del'); if (b) b.style.opacity = '1' }}
              onMouseLeave={e => { const b = e.currentTarget.querySelector('.del'); if (b) b.style.opacity = '0' }}
            >
              <span style={{ fontSize: 20 }}>⛽</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                  {Number(log.liters).toFixed(2)} L
                  {log.total_cost ? ` · ${Number(log.total_cost).toFixed(2)} €` : ''}
                  {log.price_per_liter ? ` (${Number(log.price_per_liter).toFixed(3)} €/L)` : ''}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>
                  {new Date(log.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {log.km_at_fill ? ` · ${log.km_at_fill.toLocaleString()} km` : ''}
                  {!log.full_tank ? ' · Parcial' : ''}
                </p>
              </div>
              <button className="del" onClick={() => deleteLog(log.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify pass**

```bash
npm run test -- --run src/pages/app/modules/vehiculo/__tests__/Repostajes.test.jsx
```

Expected: 3 passed

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/modules/vehiculo/Repostajes.jsx src/pages/app/modules/vehiculo/__tests__/Repostajes.test.jsx
git commit -m "feat(vehiculo): Repostajes — log de repostajes con stats de consumo y coste"
```

---

### Task 4: Mantenimiento module

**Files:**
- Create: `src/pages/app/modules/vehiculo/Mantenimiento.jsx`

- [ ] **Step 1: Create Mantenimiento.jsx**

Create `src/pages/app/modules/vehiculo/Mantenimiento.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

const MAINT_TYPES = ['ITV', 'aceite', 'ruedas', 'frenos', 'bateria', 'filtro', 'correa', 'otro']
const MAINT_ICONS = { ITV: '📋', aceite: '🛢️', ruedas: '🔄', frenos: '⚙️', bateria: '🔋', filtro: '🌀', correa: '⛓️', otro: '🔧' }

function daysUntil(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  return Math.round((d - new Date(new Date().toDateString())) / 86400000)
}

export default function Mantenimiento() {
  const { app, vehicle } = useOutletContext()
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ type: 'aceite', date: new Date().toISOString().slice(0, 10), km: '', description: '', cost: '', next_km: '', next_date: '' })
  const [addError, setAddError] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase.from('maintenance_logs')
      .select('*')
      .eq('vehicle_id', vehicle.id)
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        setLogs(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [vehicle.id])

  async function handleAdd() {
    if (!form.type || !form.date) return
    setAddError(null)
    const { data, error } = await supabase.from('maintenance_logs')
      .insert({
        vehicle_id:  vehicle.id,
        app_id:      app.id,
        type:        form.type,
        date:        form.date,
        km:          form.km ? Number(form.km) : null,
        description: form.description.trim() || null,
        cost:        form.cost ? Number(form.cost) : null,
        next_km:     form.next_km ? Number(form.next_km) : null,
        next_date:   form.next_date || null,
      })
      .select().single()
    if (error) { setAddError('No se pudo guardar.'); return }
    if (data) {
      setLogs(p => [data, ...p])
      setForm({ type: 'aceite', date: new Date().toISOString().slice(0, 10), km: '', description: '', cost: '', next_km: '', next_date: '' })
      setShowAdd(false)
    }
  }

  async function deleteLog(id) {
    const { error } = await supabase.from('maintenance_logs').delete().eq('id', id)
    if (!error) setLogs(p => p.filter(l => l.id !== id))
  }

  // Upcoming alerts: next_date within 30 days
  const upcoming = logs.filter(l => {
    const d = daysUntil(l.next_date)
    return d !== null && d <= 30
  })

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Upcoming alerts */}
      {upcoming.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.4)', borderRadius: 12, padding: '12px 16px' }}>
          <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>⏰ Revisiones próximas</p>
          {upcoming.map(l => {
            const days = daysUntil(l.next_date)
            return (
              <p key={l.id} style={{ margin: '2px 0', fontSize: 12, color: 'var(--text-muted)' }}>
                {MAINT_ICONS[l.type]} {l.type} — {days === 0 ? 'hoy' : days < 0 ? `hace ${Math.abs(days)} días` : `en ${days} días`}
              </p>
            )
          })}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{logs.length} registro{logs.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setShowAdd(p => !p)}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          + Mantenimiento
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
                {MAINT_TYPES.map(t => <option key={t} value={t}>{MAINT_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" min="0" value={form.km} onChange={e => setForm(p => ({ ...p, km: e.target.value }))}
                placeholder="Km actuales" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              <input type="number" min="0" step="0.01" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))}
                placeholder="Coste (€)" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            </div>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Descripción (opcional)"
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" min="0" value={form.next_km} onChange={e => setForm(p => ({ ...p, next_km: e.target.value }))}
                placeholder="Próx. revisión (km)" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              <input type="date" value={form.next_date} onChange={e => setForm(p => ({ ...p, next_date: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              <button onClick={handleAdd}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Guardar</button>
            </div>
            {addError && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{addError}</p>}
          </div>
        </div>
      )}

      {/* List */}
      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>🔧</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin registros</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Registra el primer mantenimiento</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {logs.map(log => {
            const nextDays = daysUntil(log.next_date)
            const isNear   = nextDays !== null && nextDays <= 30
            return (
              <div key={log.id}
                style={{ padding: '12px 16px', borderRadius: 12,
                  border: `1px solid ${isNear ? 'rgba(245,158,11,.5)' : 'var(--border)'}`,
                  background: isNear ? 'rgba(245,158,11,.05)' : 'var(--bg-card)' }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del'); if (b) b.style.opacity = '0' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{MAINT_ICONS[log.type]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                        {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                      </p>
                      {log.cost && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{Number(log.cost).toFixed(2)} €</span>}
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>
                      {new Date(log.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {log.km ? ` · ${log.km.toLocaleString()} km` : ''}
                    </p>
                    {log.description && (
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{log.description}</p>
                    )}
                    {log.next_date && (
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: isNear ? '#f59e0b' : 'var(--text-faint)' }}>
                        Próx. revisión: {new Date(log.next_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {nextDays !== null ? ` (${nextDays === 0 ? 'hoy' : nextDays < 0 ? `hace ${Math.abs(nextDays)}d` : `en ${nextDays}d`})` : ''}
                      </p>
                    )}
                  </div>
                  <button className="del" onClick={() => deleteLog(log.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
                  >×</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/app/modules/vehiculo/Mantenimiento.jsx
git commit -m "feat(vehiculo): Mantenimiento — historial con alertas de próxima revisión"
```

---

### Task 5: Gastos y Estadísticas modules

**Files:**
- Create: `src/pages/app/modules/vehiculo/VehiculoGastos.jsx`
- Create: `src/pages/app/modules/vehiculo/Estadisticas.jsx`

- [ ] **Step 1: Create VehiculoGastos.jsx**

Create `src/pages/app/modules/vehiculo/VehiculoGastos.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

const EXPENSE_TYPES = ['seguro', 'multa', 'aparcamiento', 'lavado', 'otro']
const EXPENSE_ICONS = { seguro: '🛡️', multa: '⚠️', aparcamiento: '🅿️', lavado: '🧼', otro: '💶' }

export default function VehiculoGastos() {
  const { app, vehicle } = useOutletContext()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)
  const [form, setForm]         = useState({ type: 'seguro', date: new Date().toISOString().slice(0, 10), description: '', cost: '' })
  const [addError, setAddError] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase.from('vehicle_expenses')
      .select('*')
      .eq('vehicle_id', vehicle.id)
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        setExpenses(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [vehicle.id])

  async function handleAdd() {
    if (!form.cost || !form.date) return
    setAddError(null)
    const { data, error } = await supabase.from('vehicle_expenses')
      .insert({
        vehicle_id:  vehicle.id,
        app_id:      app.id,
        type:        form.type,
        date:        form.date,
        description: form.description.trim() || null,
        cost:        Number(form.cost),
      })
      .select().single()
    if (error) { setAddError('No se pudo guardar.'); return }
    if (data) {
      setExpenses(p => [data, ...p])
      setForm({ type: 'seguro', date: new Date().toISOString().slice(0, 10), description: '', cost: '' })
      setShowAdd(false)
    }
  }

  async function deleteExpense(id) {
    const { error } = await supabase.from('vehicle_expenses').delete().eq('id', id)
    if (!error) setExpenses(p => p.filter(e => e.id !== id))
  }

  const total = expenses.reduce((s, e) => s + Number(e.cost), 0)

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {total > 0 && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-faint)' }}>Total gastos varios</p>
          <p style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{total.toFixed(2)} €</p>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{expenses.length} gasto{expenses.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setShowAdd(p => !p)}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          + Gasto
        </button>
      </div>

      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
                {EXPENSE_TYPES.map(t => <option key={t} value={t}>{EXPENSE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Descripción" style={{ flex: 2, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              <input type="number" min="0" step="0.01" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))}
                placeholder="Importe (€)" autoFocus style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              <button onClick={handleAdd} disabled={!form.cost}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: form.cost ? 1 : 0.4 }}>Guardar</button>
            </div>
            {addError && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{addError}</p>}
          </div>
        </div>
      )}

      {expenses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>💶</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin gastos registrados</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade seguros, multas y otros gastos</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {expenses.map(exp => (
            <div key={exp.id}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)' }}
              onMouseEnter={e => { const b = e.currentTarget.querySelector('.del'); if (b) b.style.opacity = '1' }}
              onMouseLeave={e => { const b = e.currentTarget.querySelector('.del'); if (b) b.style.opacity = '0' }}
            >
              <span style={{ fontSize: 22 }}>{EXPENSE_ICONS[exp.type]}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                  {exp.description || exp.type.charAt(0).toUpperCase() + exp.type.slice(1)}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>
                  {new Date(exp.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{Number(exp.cost).toFixed(2)} €</span>
              <button className="del" onClick={() => deleteExpense(exp.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create Estadisticas.jsx**

Create `src/pages/app/modules/vehiculo/Estadisticas.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

export default function Estadisticas() {
  const { app, vehicle } = useOutletContext()
  const [fuel, setFuel]         = useState([])
  const [maint, setMaint]       = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
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
  }, [vehicle.id])

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
  const kmMin = vehicle.initial_km || (kmEntries.length ? Math.min(...kmEntries) : 0)
  const kmMax = kmEntries.length ? Math.max(...kmEntries) : 0
  const kmTotal = Math.max(0, kmMax - kmMin)
  const costPerKm = kmTotal > 0 ? (totalAll / kmTotal).toFixed(3) : null

  // Average consumption
  const fullTanks = fuel.filter(l => l.full_tank && l.km_at_fill).sort((a, b) => a.km_at_fill - b.km_at_fill)
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
    { label: 'Total combustible', value: `${totalFuel.toFixed(2)} €`, icon: '⛽' },
    { label: 'Total mantenimiento', value: `${totalMaint.toFixed(2)} €`, icon: '🔧' },
    { label: 'Total gastos varios', value: `${totalExp.toFixed(2)} €`, icon: '💶' },
    { label: 'Gasto total', value: `${totalAll.toFixed(2)} €`, icon: '💰' },
    ...(costPerKm ? [{ label: 'Coste por km', value: `${costPerKm} €/km`, icon: '📍' }] : []),
    ...(avgConsump ? [{ label: 'Consumo medio', value: `${avgConsump} L/100km`, icon: '📊' }] : []),
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
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/app/modules/vehiculo/VehiculoGastos.jsx src/pages/app/modules/vehiculo/Estadisticas.jsx
git commit -m "feat(vehiculo): Gastos y Estadísticas — registro de gastos y dashboard coste/km"
```
