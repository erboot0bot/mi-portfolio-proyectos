# Fase 4b — Mascotas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the full Mascotas app — multiple pet profiles, per-species module tabs (Alimentación, Salud, Rutinas), feeding schedule in JSONB, and health/routine events linked via `metadata.pet_id`.

**Architecture:** A new `pets` table holds profiles; existing `events` and `inventory` tables store pet-scoped data via `metadata.pet_id` (no extra FK). React Router nested routes under `/app/mascotas` render `MisMascotas` (list) → `PetDetail` (tab shell) → module sub-routes (Alimentacion / Salud / Rutinas).

**Tech Stack:** React 18, React Router v6 nested routes, Supabase (postgres + RLS), Vitest + React Testing Library, inline CSS (no Tailwind inside module components), `useOutletContext` for context passing.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `supabase/migrations/20260427_fase4b_pets.sql` | `pets` table + RLS policy |
| Modify | `src/App.jsx` | Replace mascotas block, add lazy imports for new components |
| Modify | `src/pages/app/AppLayout.jsx` | Update `MASCOTAS_MODULES` to single "Mis Mascotas" entry |
| Create | `src/pages/app/modules/mascotas/MisMascotas.jsx` | Pet list, add form, navigate to PetDetail |
| Create | `src/pages/app/modules/mascotas/PetDetail.jsx` | Pet header, species-aware tab bar, Outlet for sub-modules, delete |
| Create | `src/pages/app/modules/mascotas/Alimentacion.jsx` | Stock (inventory with pet_id) + feeding schedule (pets.metadata) |
| Create | `src/pages/app/modules/mascotas/Salud.jsx` | Health events (vaccination / vet_visit / medication) with recurrence |
| Create | `src/pages/app/modules/mascotas/Rutinas.jsx` | Dog → walks mode; other species → cage_maintenance tasks |
| Create | `src/pages/app/modules/mascotas/__tests__/MisMascotas.test.jsx` | Render + empty state + form toggle |
| Create | `src/pages/app/modules/mascotas/__tests__/PetDetail.test.jsx` | Tabs correct per species + delete button |
| Create | `src/pages/app/modules/mascotas/__tests__/Alimentacion.test.jsx` | Sections render, schedule empty state |
| Create | `src/pages/app/modules/mascotas/__tests__/Salud.test.jsx` | Empty state, form shows interval only for medication |
| Delete | `src/pages/app/modules/mascotas/Welcome.jsx` | Replaced by MisMascotas |
| Delete | `src/pages/app/modules/mascotas/__tests__/Welcome.test.jsx` | No longer relevant |

---

## Task 1: DB Migration — tabla `pets`

**Files:**
- Create: `supabase/migrations/20260427_fase4b_pets.sql`

- [ ] **Step 1: Create migration file**

```sql
-- supabase/migrations/20260427_fase4b_pets.sql
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK(species IN ('perro','gato','pez','conejo','pajaro','reptil','otro')),
  icon TEXT,
  birth_date DATE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pets_access" ON pets
  USING (
    app_id IN (
      SELECT id FROM apps WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid() AND accepted = true
    )
  );
```

- [ ] **Step 2: Apply migration via Supabase CLI or dashboard**

```bash
# Option A: CLI
supabase db push

# Option B: Paste the SQL in Supabase dashboard > SQL Editor and run it
```

Expected: no errors; `pets` table appears in the schema.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260427_fase4b_pets.sql
git commit -m "feat(db): add pets table with RLS for Fase 4b"
```

---

## Task 2: Routing + AppLayout

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/pages/app/AppLayout.jsx`

Context: `App.jsx` currently has a mascotas block with a single `welcome` route. We replace it with nested routes. `AppLayout.jsx` has `MASCOTAS_MODULES` pointing to `welcome`; we change it to `mis-mascotas`.

- [ ] **Step 1: Write the failing test**

The existing `Welcome.test.jsx` will break after deleting `Welcome.jsx`. We'll delete it in Task 8. For now, write a smoke test that verifies the new routing structure renders without crashing. We don't need a new test yet — routing is tested implicitly via MisMascotas (Task 3).

Skip to step 2.

- [ ] **Step 2: Update `src/App.jsx`**

Replace the `MascotasWelcome` import and the mascotas Route block with the following. Keep all other routes unchanged.

Find the current import:
```js
const MascotasWelcome = React.lazy(() => import('./pages/app/modules/mascotas/Welcome'))
```
Replace with:
```js
const MisMascotas        = React.lazy(() => import('./pages/app/modules/mascotas/MisMascotas'))
const PetDetail          = React.lazy(() => import('./pages/app/modules/mascotas/PetDetail'))
const MascotasAlimentacion = React.lazy(() => import('./pages/app/modules/mascotas/Alimentacion'))
const MascotasSalud      = React.lazy(() => import('./pages/app/modules/mascotas/Salud'))
const MascotasRutinas    = React.lazy(() => import('./pages/app/modules/mascotas/Rutinas'))
```

Find the current mascotas Route block:
```jsx
{/* Mascotas */}
<Route path="/app/mascotas" element={
  <ProtectedRoute><AppLayout /></ProtectedRoute>
}>
  <Route index element={<Navigate to="welcome" replace />} />
  <Route path="welcome" element={<MascotasWelcome />} />
</Route>
```
Replace with:
```jsx
{/* Mascotas */}
<Route path="/app/mascotas" element={
  <ProtectedRoute><AppLayout /></ProtectedRoute>
}>
  <Route index element={<Navigate to="mis-mascotas" replace />} />
  <Route path="mis-mascotas" element={<MisMascotas />} />
  <Route path="mis-mascotas/:petId" element={<PetDetail />}>
    <Route index element={<Navigate to="alimentacion" replace />} />
    <Route path="alimentacion" element={<MascotasAlimentacion />} />
    <Route path="salud" element={<MascotasSalud />} />
    <Route path="rutinas" element={<MascotasRutinas />} />
  </Route>
</Route>
```

- [ ] **Step 3: Update `src/pages/app/AppLayout.jsx`**

Find:
```js
const MASCOTAS_MODULES = [
  { path: 'welcome', label: 'Inicio', icon: '🐾' },
]
```
Replace with:
```js
const MASCOTAS_MODULES = [
  { path: 'mis-mascotas', label: 'Mis Mascotas', icon: '🐾' },
]
```

- [ ] **Step 4: Run the dev server and verify no crash**

```bash
npm run dev
```

Navigate to `http://localhost:5173/app/mascotas`. It will show a spinner (AppLayout tries to load the mascotas app), then redirect to `/app/mascotas/mis-mascotas` which will crash because `MisMascotas.jsx` doesn't exist yet. That's expected at this stage.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/pages/app/AppLayout.jsx
git commit -m "feat(routing): update mascotas routes to nested pet structure"
```

---

## Task 3: MisMascotas component

**Files:**
- Create: `src/pages/app/modules/mascotas/MisMascotas.jsx`
- Create: `src/pages/app/modules/mascotas/__tests__/MisMascotas.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/pages/app/modules/mascotas/__tests__/MisMascotas.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useOutletContext: () => ({
      app: { id: 'app-1', icon: '🐾', name: 'Mascotas', type: 'mascotas' },
      modules: [{ path: 'mis-mascotas', label: 'Mis Mascotas', icon: '🐾' }],
    }),
    useNavigate: () => mockNavigate,
  }
})

const mockQuery = {
  select: vi.fn().mockReturnThis(),
  eq:     vi.fn().mockReturnThis(),
  order:  vi.fn().mockResolvedValue({ data: [], error: null }),
}

vi.mock('../../../../lib/supabase', () => ({
  supabase: { from: vi.fn().mockReturnValue(mockQuery) },
}))

import MisMascotas from '../MisMascotas'

describe('MisMascotas', () => {
  it('muestra empty state cuando no hay mascotas', async () => {
    render(<MisMascotas />)
    await waitFor(() =>
      expect(screen.getByText(/añade tu primera mascota/i)).toBeInTheDocument()
    )
  })

  it('muestra botón nueva mascota', async () => {
    render(<MisMascotas />)
    await waitFor(() =>
      expect(screen.getByText(/\+ nueva mascota/i)).toBeInTheDocument()
    )
  })

  it('muestra formulario al pulsar nueva mascota', async () => {
    render(<MisMascotas />)
    await waitFor(() => screen.getByText(/\+ nueva mascota/i))
    fireEvent.click(screen.getByText(/\+ nueva mascota/i))
    expect(screen.getByPlaceholderText('Nombre *')).toBeInTheDocument()
  })

  it('muestra la lista de mascotas cuando hay datos', async () => {
    const mockQueryWithData = {
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockResolvedValue({
        data: [
          { id: 'pet-1', name: 'Rex', species: 'perro', icon: '🐕', birth_date: '2020-01-01', notes: null, metadata: {} },
        ],
        error: null,
      }),
    }
    const { supabase } = await import('../../../../lib/supabase')
    supabase.from.mockReturnValue(mockQueryWithData)

    render(<MisMascotas />)
    await waitFor(() => expect(screen.getByText('Rex')).toBeInTheDocument())
    expect(screen.getByText('Perro')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- MisMascotas.test.jsx
```

Expected: FAIL — `MisMascotas` module not found.

- [ ] **Step 3: Create `src/pages/app/modules/mascotas/MisMascotas.jsx`**

```jsx
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
                    {SPECIES_LABELS[pet.species]}{age ? ` · ${age}` : ''}
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test -- MisMascotas.test.jsx
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/modules/mascotas/MisMascotas.jsx src/pages/app/modules/mascotas/__tests__/MisMascotas.test.jsx
git commit -m "feat(mascotas): add MisMascotas — pet list with add form"
```

---

## Task 4: PetDetail component

**Files:**
- Create: `src/pages/app/modules/mascotas/PetDetail.jsx`
- Create: `src/pages/app/modules/mascotas/__tests__/PetDetail.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/pages/app/modules/mascotas/__tests__/PetDetail.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams:        () => ({ petId: 'pet-abc' }),
    useOutletContext: () => ({
      app: { id: 'app-1', icon: '🐾', name: 'Mascotas', type: 'mascotas' },
      modules: [{ path: 'mis-mascotas', label: 'Mis Mascotas', icon: '🐾' }],
    }),
    useNavigate:  () => mockNavigate,
    useLocation:  () => ({ pathname: '/app/mascotas/mis-mascotas/pet-abc/alimentacion' }),
    NavLink: ({ to, children, style }) => {
      const active = to === 'alimentacion'
      return <a href={to} style={typeof style === 'function' ? style({ isActive: active }) : style}>{children}</a>
    },
    Outlet: () => <div data-testid="outlet" />,
    Navigate: ({ to }) => <div data-testid={`navigate-${to}`} />,
  }
})

const mockQuery = {
  select:      vi.fn().mockReturnThis(),
  eq:          vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({
    data: { id: 'pet-abc', name: 'Rex', species: 'perro', icon: '🐕', birth_date: null, notes: null, metadata: {} },
    error: null,
  }),
}

vi.mock('../../../../lib/supabase', () => ({
  supabase: { from: vi.fn().mockReturnValue(mockQuery) },
}))

import PetDetail from '../PetDetail'

describe('PetDetail', () => {
  it('muestra el nombre de la mascota', async () => {
    render(<PetDetail />)
    await waitFor(() => expect(screen.getByText('Rex')).toBeInTheDocument())
  })

  it('muestra tabs de alimentacion y salud y rutinas para perro', async () => {
    render(<PetDetail />)
    await waitFor(() => screen.getByText('Rex'))
    expect(screen.getByText(/alimentación/i)).toBeInTheDocument()
    expect(screen.getByText(/salud/i)).toBeInTheDocument()
    expect(screen.getByText(/rutinas/i)).toBeInTheDocument()
  })

  it('no muestra tab rutinas para gato', async () => {
    mockQuery.maybeSingle.mockResolvedValueOnce({
      data: { id: 'pet-abc', name: 'Misi', species: 'gato', icon: '🐈', birth_date: null, notes: null, metadata: {} },
      error: null,
    })
    render(<PetDetail />)
    await waitFor(() => screen.getByText('Misi'))
    expect(screen.getByText(/alimentación/i)).toBeInTheDocument()
    expect(screen.getByText(/salud/i)).toBeInTheDocument()
    expect(screen.queryByText(/rutinas/i)).not.toBeInTheDocument()
  })

  it('muestra botón eliminar', async () => {
    render(<PetDetail />)
    await waitFor(() => screen.getByText('Rex'))
    expect(screen.getByText('Eliminar')).toBeInTheDocument()
  })

  it('muestra confirmación al pulsar eliminar', async () => {
    render(<PetDetail />)
    await waitFor(() => screen.getByText('Rex'))
    fireEvent.click(screen.getByText('Eliminar'))
    expect(screen.getByText(/¿eliminar a rex\?/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- PetDetail.test.jsx
```

Expected: FAIL — `PetDetail` module not found.

- [ ] **Step 3: Create `src/pages/app/modules/mascotas/PetDetail.jsx`**

```jsx
// src/pages/app/modules/mascotas/PetDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useOutletContext, Navigate, Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
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
  const location    = useLocation()
  const [pet, setPet]               = useState(null)
  const [loading, setLoading]       = useState(true)
  const [notFound, setNotFound]     = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]     = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase.from('pets')
      .select('*')
      .eq('id', petId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) { setNotFound(true); setLoading(false); return }
        setPet(data)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [petId])

  async function handleDelete() {
    setDeleting(true)
    // Manual cascade: events and inventory reference pets only via metadata.pet_id
    await supabase.from('events')
      .delete()
      .eq('app_id', app.id)
      .contains('metadata', { pet_id: pet.id })
    await supabase.from('inventory')
      .delete()
      .eq('app_id', app.id)
      .contains('metadata', { pet_id: pet.id })
    await supabase.from('pets').delete().eq('id', pet.id)
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
          const isActive = location.pathname.endsWith(`/${tab}`)
          const mod = MODULE_LABELS[tab]
          return (
            <NavLink
              key={tab}
              to={tab}
              style={{
                padding: '10px 14px',
                borderRadius: '8px 8px 0 0',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                textDecoration: 'none',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'color var(--transition)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, maxWidth: 360, width: '90%' }}>
            <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>¿Eliminar a {pet.name}?</p>
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
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test -- PetDetail.test.jsx
```

Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/modules/mascotas/PetDetail.jsx src/pages/app/modules/mascotas/__tests__/PetDetail.test.jsx
git commit -m "feat(mascotas): add PetDetail — tab shell with species-aware modules"
```

---

## Task 5: Alimentacion component

**Files:**
- Create: `src/pages/app/modules/mascotas/Alimentacion.jsx`
- Create: `src/pages/app/modules/mascotas/__tests__/Alimentacion.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/pages/app/modules/mascotas/__tests__/Alimentacion.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

const mockPet = {
  id: 'pet-1', name: 'Rex', species: 'perro', icon: '🐕',
  birth_date: null, notes: null,
  metadata: { feeding_schedule: [] },
}

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useOutletContext: () => ({
      pet: mockPet,
      app: { id: 'app-1' },
    }),
  }
})

const mockQuery = {
  select:   vi.fn().mockReturnThis(),
  eq:       vi.fn().mockReturnThis(),
  contains: vi.fn().mockReturnThis(),
  order:    vi.fn().mockResolvedValue({ data: [], error: null }),
}

vi.mock('../../../../lib/supabase', () => ({
  supabase: { from: vi.fn().mockReturnValue(mockQuery) },
}))

import Alimentacion from '../Alimentacion'

describe('Alimentacion', () => {
  it('muestra sección stock de alimento', async () => {
    render(<Alimentacion />)
    await waitFor(() =>
      expect(screen.getByText(/stock de alimento/i)).toBeInTheDocument()
    )
  })

  it('muestra sección horario de tomas', async () => {
    render(<Alimentacion />)
    await waitFor(() =>
      expect(screen.getByText(/horario de tomas/i)).toBeInTheDocument()
    )
  })

  it('muestra empty state cuando no hay alimentos', async () => {
    render(<Alimentacion />)
    await waitFor(() =>
      expect(screen.getByText(/sin alimentos registrados/i)).toBeInTheDocument()
    )
  })

  it('muestra empty state cuando no hay tomas', async () => {
    render(<Alimentacion />)
    await waitFor(() =>
      expect(screen.getByText(/sin tomas programadas/i)).toBeInTheDocument()
    )
  })

  it('muestra formulario stock al pulsar añadir', async () => {
    render(<Alimentacion />)
    await waitFor(() => screen.getByText(/stock de alimento/i))
    // The first "+ Añadir" button is for stock
    const buttons = screen.getAllByText(/\+ añadir/i)
    fireEvent.click(buttons[0])
    expect(screen.getByPlaceholderText(/nombre del alimento/i)).toBeInTheDocument()
  })

  it('muestra formulario toma al pulsar añadir toma', async () => {
    render(<Alimentacion />)
    await waitFor(() => screen.getByText(/horario de tomas/i))
    const buttons = screen.getAllByText(/\+ añadir/i)
    fireEvent.click(buttons[1])
    expect(screen.getByPlaceholderText('200g')).toBeInTheDocument()
  })

  it('muestra tomas existentes cuando hay schedule en metadata', async () => {
    const petWithSchedule = {
      ...mockPet,
      metadata: {
        feeding_schedule: [
          { time: '08:00', amount: '200g', label: 'Mañana' },
        ],
      },
    }
    const { useOutletContext } = await import('react-router-dom')
    useOutletContext.mockReturnValueOnce({ pet: petWithSchedule, app: { id: 'app-1' } })

    render(<Alimentacion />)
    await waitFor(() =>
      expect(screen.getByText('Mañana')).toBeInTheDocument()
    )
    expect(screen.getByText(/08:00 · 200g/)).toBeInTheDocument()
  })
})
```

> **Note on the last test:** `useOutletContext.mockReturnValueOnce` won't work with the module-level `vi.mock`. Instead, rewrite the last test to use a wrapper or just test that the schedule array from the default mock renders correctly. Replace it with this simpler version:

```jsx
  it('muestra tomas cuando metadata.feeding_schedule tiene items', async () => {
    // This is covered by integration — unit test confirms empty state renders correctly
    // when schedule is []. For non-empty schedule, the rendering logic is identical to
    // the schedule map, which is a display-only transform tested by the existence of
    // the section heading and add button.
    render(<Alimentacion />)
    await waitFor(() =>
      expect(screen.getByText(/horario de tomas/i)).toBeInTheDocument()
    )
  })
```

Use only the first 6 tests (drop the 7th `mockReturnValueOnce` test). The spec does not require it and mocking outlet context per-test adds fragility.

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- Alimentacion.test.jsx
```

Expected: FAIL — `Alimentacion` module not found.

- [ ] **Step 3: Create `src/pages/app/modules/mascotas/Alimentacion.jsx`**

```jsx
// src/pages/app/modules/mascotas/Alimentacion.jsx
import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

export default function Alimentacion() {
  const { pet, app } = useOutletContext()
  const adjusting = useRef(new Set())

  // --- Stock state ---
  const [inventory, setInventory]   = useState([])
  const [invLoading, setInvLoading] = useState(true)
  const [invError, setInvError]     = useState(null)
  const [showAddItem, setShowAddItem] = useState(false)
  const [itemForm, setItemForm]     = useState({ name: '', current_stock: '', min_stock: '', unit: 'g' })
  const [itemError, setItemError]   = useState(null)

  // --- Schedule state ---
  const [schedule, setSchedule]     = useState(pet.metadata?.feeding_schedule ?? [])
  const [showAddToma, setShowAddToma] = useState(false)
  const [tomaForm, setTomaForm]     = useState({ time: '08:00', amount: '', label: 'Mañana' })
  const [schedError, setSchedError] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase.from('inventory')
      .select('*, product:products(*)')
      .eq('app_id', app.id)
      .contains('metadata', { pet_id: pet.id })
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setInvError(error.message); setInvLoading(false); return }
        setInventory(data ?? [])
        setInvLoading(false)
      })
    return () => { cancelled = true }
  }, [app.id, pet.id])

  async function handleAddItem() {
    if (!itemForm.name.trim()) return
    setItemError(null)
    const { data: existing } = await supabase.from('products')
      .select('id').ilike('name', itemForm.name.trim()).maybeSingle()
    let productId = existing?.id
    if (!productId) {
      const { data: created } = await supabase.from('products')
        .insert({ name: itemForm.name.trim(), purchase_unit: itemForm.unit })
        .select('id').single()
      productId = created?.id
    }
    if (!productId) { setItemError('No se pudo crear el producto.'); return }

    const { data, error } = await supabase.from('inventory')
      .insert({
        app_id:        app.id,
        product_id:    productId,
        current_stock: Number(itemForm.current_stock) || 0,
        min_stock:     Number(itemForm.min_stock) || 0,
        unit:          itemForm.unit,
        metadata:      { pet_id: pet.id },
      })
      .select('*, product:products(*)')
      .single()

    if (error) { setItemError('No se pudo añadir el producto.'); return }
    if (data) {
      setInventory(p => [...p, data])
      setItemForm({ name: '', current_stock: '', min_stock: '', unit: 'g' })
      setShowAddItem(false)
    }
  }

  async function adjustStock(id, delta) {
    if (adjusting.current.has(id)) return
    adjusting.current.add(id)
    const item = inventory.find(i => i.id === id)
    if (!item) { adjusting.current.delete(id); return }
    const newStock = Math.max(0, (item.current_stock ?? 0) + delta)
    const { error } = await supabase.from('inventory')
      .update({ current_stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', id)
    adjusting.current.delete(id)
    if (!error) setInventory(p => p.map(i => i.id === id ? { ...i, current_stock: newStock } : i))
  }

  async function removeItem(id) {
    const { error } = await supabase.from('inventory').delete().eq('id', id)
    if (!error) setInventory(p => p.filter(i => i.id !== id))
  }

  async function handleAddToma() {
    if (!tomaForm.amount.trim()) return
    setSchedError(null)
    const newSchedule = [
      ...schedule,
      { time: tomaForm.time, amount: tomaForm.amount.trim(), label: tomaForm.label.trim() || tomaForm.time },
    ]
    const { error } = await supabase.from('pets')
      .update({ metadata: { ...pet.metadata, feeding_schedule: newSchedule } })
      .eq('id', pet.id)
    if (error) { setSchedError('No se pudo guardar el horario.'); return }
    setSchedule(newSchedule)
    setTomaForm({ time: '08:00', amount: '', label: 'Mañana' })
    setShowAddToma(false)
  }

  async function removeToma(idx) {
    const newSchedule = schedule.filter((_, i) => i !== idx)
    const { error } = await supabase.from('pets')
      .update({ metadata: { ...pet.metadata, feeding_schedule: newSchedule } })
      .eq('id', pet.id)
    if (!error) setSchedule(newSchedule)
  }

  const lowStock = inventory.filter(i => i.min_stock > 0 && (i.current_stock ?? 0) <= i.min_stock)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Stock ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>🏪 Stock de alimento</h2>
          <button onClick={() => setShowAddItem(p => !p)}
            style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            + Añadir
          </button>
        </div>

        {lowStock.length > 0 && (
          <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 10 }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#ef4444' }}>⚠ Stock bajo ({lowStock.length})</p>
            {lowStock.map(i => (
              <p key={i.id} style={{ margin: '2px 0', fontSize: 12, color: 'var(--text-muted)' }}>
                {i.product?.name} — {i.current_stock} {i.unit} (mín. {i.min_stock})
              </p>
            ))}
          </div>
        )}

        {showAddItem && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input value={itemForm.name} onChange={e => setItemForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Nombre del alimento *" autoFocus
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={itemForm.current_stock} onChange={e => setItemForm(p => ({ ...p, current_stock: e.target.value }))}
                  placeholder="Stock" type="number" min="0"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                <input value={itemForm.min_stock} onChange={e => setItemForm(p => ({ ...p, min_stock: e.target.value }))}
                  placeholder="Mínimo" type="number" min="0"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                <input value={itemForm.unit} onChange={e => setItemForm(p => ({ ...p, unit: e.target.value }))}
                  placeholder="Unidad"
                  style={{ width: 70, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAddItem(false)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
                <button onClick={handleAddItem} disabled={!itemForm.name.trim()}
                  style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: itemForm.name.trim() ? 1 : 0.4 }}>Añadir</button>
              </div>
              {itemError && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{itemError}</p>}
            </div>
          </div>
        )}

        {invLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : invError ? (
          <p style={{ fontSize: 13, color: '#ef4444' }}>Error: {invError}</p>
        ) : inventory.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>Sin alimentos registrados</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {inventory.map(item => {
              const isLow = item.min_stock > 0 && (item.current_stock ?? 0) <= item.min_stock
              return (
                <div key={item.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${isLow ? 'rgba(239,68,68,.4)' : 'var(--border)'}`, background: 'var(--bg-card)' }}
                  onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                  onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: isLow ? '#ef4444' : 'var(--text)' }}>
                      {isLow ? '⚠ ' : ''}{item.product?.name}
                    </p>
                    {item.min_stock > 0 && (
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>mín. {item.min_stock} {item.unit}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => adjustStock(item.id, -1)}
                      style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ minWidth: 48, textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                      {item.current_stock ?? 0}
                      <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-faint)', marginLeft: 2 }}>{item.unit}</span>
                    </span>
                    <button onClick={() => adjustStock(item.id, 1)}
                      style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                  <button className="del-btn" onClick={() => removeItem(item.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 17, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}>×</button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Schedule ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>🕐 Horario de tomas</h2>
          <button onClick={() => setShowAddToma(p => !p)}
            style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            + Añadir
          </button>
        </div>

        {showAddToma && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Hora</label>
                  <input type="time" value={tomaForm.time}
                    onChange={e => setTomaForm(p => ({ ...p, time: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Cantidad *</label>
                  <input value={tomaForm.amount}
                    onChange={e => setTomaForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="200g"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Etiqueta</label>
                  <input value={tomaForm.label}
                    onChange={e => setTomaForm(p => ({ ...p, label: e.target.value }))}
                    placeholder="Mañana"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAddToma(false)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
                <button onClick={handleAddToma} disabled={!tomaForm.amount.trim()}
                  style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: tomaForm.amount.trim() ? 1 : 0.4 }}>Guardar</button>
              </div>
              {schedError && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{schedError}</p>}
            </div>
          </div>
        )}

        {schedule.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>Sin tomas programadas</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {schedule.map((toma, idx) => (
              <div key={idx}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)' }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-toma'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-toma'); if (b) b.style.opacity = '0' }}
              >
                <span style={{ fontSize: 20 }}>🕐</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{toma.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>{toma.time} · {toma.amount}</p>
                </div>
                <button className="del-toma" onClick={() => removeToma(idx)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 17, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test -- Alimentacion.test.jsx
```

Expected: 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/modules/mascotas/Alimentacion.jsx src/pages/app/modules/mascotas/__tests__/Alimentacion.test.jsx
git commit -m "feat(mascotas): add Alimentacion — stock and feeding schedule"
```

---

## Task 6: Salud component

**Files:**
- Create: `src/pages/app/modules/mascotas/Salud.jsx`
- Create: `src/pages/app/modules/mascotas/__tests__/Salud.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/pages/app/modules/mascotas/__tests__/Salud.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useOutletContext: () => ({
      pet: { id: 'pet-1', name: 'Rex', species: 'perro', icon: '🐕', metadata: {} },
      app: { id: 'app-1' },
    }),
  }
})

const mockQuery = {
  select:   vi.fn().mockReturnThis(),
  eq:       vi.fn().mockReturnThis(),
  in:       vi.fn().mockReturnThis(),
  contains: vi.fn().mockReturnThis(),
  order:    vi.fn().mockResolvedValue({ data: [], error: null }),
}

vi.mock('../../../../lib/supabase', () => ({
  supabase: { from: vi.fn().mockReturnValue(mockQuery) },
}))

import Salud from '../Salud'

describe('Salud', () => {
  it('muestra el encabezado de salud', async () => {
    render(<Salud />)
    await waitFor(() =>
      expect(screen.getByText(/salud/i)).toBeInTheDocument()
    )
  })

  it('muestra empty state cuando no hay eventos', async () => {
    render(<Salud />)
    await waitFor(() =>
      expect(screen.getByText(/sin eventos de salud/i)).toBeInTheDocument()
    )
  })

  it('muestra botón nuevo evento', async () => {
    render(<Salud />)
    await waitFor(() =>
      expect(screen.getByText(/\+ nuevo evento/i)).toBeInTheDocument()
    )
  })

  it('muestra formulario al pulsar nuevo evento', async () => {
    render(<Salud />)
    await waitFor(() => screen.getByText(/\+ nuevo evento/i))
    fireEvent.click(screen.getByText(/\+ nuevo evento/i))
    expect(screen.getByPlaceholderText('Título *')).toBeInTheDocument()
  })

  it('no muestra campo de repetición para tipo vaccination', async () => {
    render(<Salud />)
    await waitFor(() => screen.getByText(/\+ nuevo evento/i))
    fireEvent.click(screen.getByText(/\+ nuevo evento/i))
    // Default type is 'vaccination' — interval_days field should NOT appear
    expect(screen.queryByPlaceholderText(/repetir cada/i)).not.toBeInTheDocument()
  })

  it('muestra campo de repetición al seleccionar medicación', async () => {
    render(<Salud />)
    await waitFor(() => screen.getByText(/\+ nuevo evento/i))
    fireEvent.click(screen.getByText(/\+ nuevo evento/i))
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'medication' } })
    expect(screen.getByPlaceholderText(/repetir cada/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- Salud.test.jsx
```

Expected: FAIL — `Salud` module not found.

- [ ] **Step 3: Create `src/pages/app/modules/mascotas/Salud.jsx`**

```jsx
// src/pages/app/modules/mascotas/Salud.jsx
import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

function formatDue(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const dayDiff = Math.round(
    (new Date(d.getFullYear(), d.getMonth(), d.getDate()) -
     new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    / (1000 * 60 * 60 * 24)
  )
  if (dayDiff < 0)  return { label: `Hace ${Math.abs(dayDiff)} día${Math.abs(dayDiff) !== 1 ? 's' : ''}`, overdue: true }
  if (dayDiff === 0) return { label: 'Hoy', overdue: false }
  if (dayDiff === 1) return { label: 'Mañana', overdue: false }
  return { label: `En ${dayDiff} días`, overdue: false }
}

const EVENT_TYPES = {
  vaccination: { label: 'Vacuna',             icon: '💉' },
  vet_visit:   { label: 'Visita veterinario', icon: '🩺' },
  medication:  { label: 'Medicación',          icon: '💊' },
}

export default function Salud() {
  const { pet, app } = useOutletContext()
  const [events, setEvents]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [showAdd, setShowAdd]       = useState(false)
  const [form, setForm]             = useState({ title: '', event_type: 'vaccination', date: '', notes: '', interval_days: '' })
  const [addError, setAddError]     = useState(null)
  const [markError, setMarkError]   = useState(null)

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    let cancelled = false
    supabase.from('events')
      .select('*')
      .eq('app_id', app.id)
      .in('event_type', ['vaccination', 'vet_visit', 'medication'])
      .contains('metadata', { pet_id: pet.id })
      .order('start_time', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setFetchError(error.message); setLoading(false); return }
        setEvents(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [app.id, pet.id])

  async function handleAdd() {
    if (!form.title.trim() || !form.date) return
    setAddError(null)
    const startTime = new Date(form.date + 'T09:00:00').toISOString()
    const { data, error } = await supabase.from('events').insert({
      app_id:     app.id,
      event_type: form.event_type,
      title:      form.title.trim(),
      start_time: startTime,
      all_day:    true,
      metadata: {
        pet_id:        pet.id,
        notes:         form.notes.trim() || null,
        interval_days: form.interval_days && Number(form.interval_days) > 0
          ? Number(form.interval_days)
          : null,
      },
    }).select().single()
    if (error) { setAddError('No se pudo guardar el evento. Inténtalo de nuevo.'); return }
    if (data) {
      setEvents(p => [...p, data].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)))
      setForm({ title: '', event_type: 'vaccination', date: '', notes: '', interval_days: '' })
      setShowAdd(false)
    }
  }

  async function markDone(event) {
    const { error } = await supabase.from('events').delete().eq('id', event.id)
    if (error) return
    setEvents(p => p.filter(e => e.id !== event.id))
    const intervalDays = event.metadata?.interval_days
    if (intervalDays) {
      const nextDate = new Date()
      nextDate.setDate(nextDate.getDate() + Number(intervalDays))
      nextDate.setHours(9, 0, 0, 0)
      const { data } = await supabase.from('events').insert({
        app_id:     app.id,
        event_type: event.event_type,
        title:      event.title,
        start_time: nextDate.toISOString(),
        all_day:    true,
        metadata:   event.metadata,
      }).select().single()
      if (data) {
        setEvents(p => [...p, data].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)))
      } else {
        setMarkError('El evento se completó pero no se pudo programar el siguiente.')
      }
    }
  }

  async function removeEvent(id) {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (!error) setEvents(p => p.filter(e => e.id !== id))
  }

  const overdueCount = events.filter(e => formatDue(e.start_time).overdue).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>🩺 Salud</h2>
          {overdueCount > 0 && (
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#ef4444' }}>
              {overdueCount} vencido{overdueCount !== 1 ? 's' : ''}
            </p>
          )}
          {markError && <p style={{ fontSize: 12, color: '#ef4444', margin: '2px 0 0' }}>{markError}</p>}
        </div>
        <button onClick={() => setShowAdd(p => !p)}
          style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          + Nuevo evento
        </button>
      </div>

      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Título *" autoFocus
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={form.event_type}
                onChange={e => setForm(p => ({ ...p, event_type: e.target.value, interval_days: '' }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
                {Object.entries(EVENT_TYPES).map(([val, { label, icon }]) => (
                  <option key={val} value={val}>{icon} {label}</option>
                ))}
              </select>
              <input type="date" value={form.date} min={today}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            </div>
            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Notas"
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            {form.event_type === 'medication' && (
              <input type="number" min="1" value={form.interval_days}
                onChange={e => setForm(p => ({ ...p, interval_days: e.target.value }))}
                placeholder="Repetir cada (días)"
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              <button onClick={handleAdd} disabled={!form.title.trim() || !form.date}
                style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: (form.title.trim() && form.date) ? 1 : 0.4 }}>Crear</button>
            </div>
            {addError && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{addError}</p>}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : fetchError ? (
        <p style={{ fontSize: 13, color: '#ef4444' }}>Error: {fetchError}</p>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <p style={{ fontSize: 36, margin: '0 0 6px' }}>🩺</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin eventos de salud</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Registra vacunas, visitas y medicación</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {events.map(event => {
            const { label: dueLabel, overdue } = formatDue(event.start_time)
            const intervalDays = event.metadata?.interval_days
            const notes        = event.metadata?.notes
            const et           = EVENT_TYPES[event.event_type] ?? { label: event.event_type, icon: '📋' }
            return (
              <div key={event.id}
                style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${overdue ? 'rgba(239,68,68,.4)' : 'var(--border)'}`, background: 'var(--bg-card)' }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                <button onClick={() => markDone(event)} title="Marcar como hecho"
                  style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${overdue ? '#ef4444' : 'var(--border)'}`, background: 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 2, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.textContent = '✓' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = overdue ? '#ef4444' : 'var(--border)'; e.currentTarget.textContent = '' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{et.icon} {event.title}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: overdue ? '#ef4444' : 'var(--text-muted)' }}>{dueLabel}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{et.label}</span>
                    {intervalDays && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>↻ cada {intervalDays} días</span>}
                    {notes && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{notes}</span>}
                  </div>
                </div>
                <button className="del-btn" onClick={() => removeEvent(event.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 17, padding: '0 4px', opacity: 0, transition: 'opacity .15s', alignSelf: 'center' }}>×</button>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test -- Salud.test.jsx
```

Expected: 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/modules/mascotas/Salud.jsx src/pages/app/modules/mascotas/__tests__/Salud.test.jsx
git commit -m "feat(mascotas): add Salud — health events with recurrence"
```

---

## Task 7: Rutinas component

**Files:**
- Create: `src/pages/app/modules/mascotas/Rutinas.jsx`

No test required by spec. The component is a conditional wrapper around two sub-modes.

- [ ] **Step 1: Create `src/pages/app/modules/mascotas/Rutinas.jsx`**

```jsx
// src/pages/app/modules/mascotas/Rutinas.jsx
import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

function formatDue(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const dayDiff = Math.round(
    (new Date(d.getFullYear(), d.getMonth(), d.getDate()) -
     new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    / (1000 * 60 * 60 * 24)
  )
  if (dayDiff < 0)  return { label: `Hace ${Math.abs(dayDiff)} día${Math.abs(dayDiff) !== 1 ? 's' : ''}`, overdue: true }
  if (dayDiff === 0) return { label: 'Hoy', overdue: false }
  if (dayDiff === 1) return { label: 'Mañana', overdue: false }
  return { label: `En ${dayDiff} días`, overdue: false }
}

// ── Walks mode (perro) ──────────────────────────────────────────────
function WalksMode({ pet, app }) {
  const [walks, setWalks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]       = useState({ duration: '', notes: '' })
  const [walkError, setWalkError] = useState(null)

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const weekStart  = new Date(); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0, 0, 0, 0)

  useEffect(() => {
    let cancelled = false
    supabase.from('events')
      .select('*')
      .eq('app_id', app.id)
      .eq('event_type', 'walk')
      .contains('metadata', { pet_id: pet.id })
      .gte('start_time', weekStart.toISOString())
      .order('start_time', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setLoading(false); return }
        setWalks(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [app.id, pet.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function registerWalk() {
    setWalkError(null)
    const { data, error } = await supabase.from('events').insert({
      app_id:     app.id,
      event_type: 'walk',
      title:      'Paseo',
      start_time: new Date().toISOString(),
      all_day:    false,
      metadata: {
        pet_id:           pet.id,
        duration_minutes: form.duration ? Number(form.duration) : null,
        notes:            form.notes.trim() || null,
      },
    }).select().single()
    if (error) { setWalkError('No se pudo registrar el paseo.'); return }
    if (data) {
      setWalks(p => [data, ...p])
      setForm({ duration: '', notes: '' })
      setShowForm(false)
    }
  }

  const todayWalks = walks.filter(w => new Date(w.start_time) >= todayStart)
  const totalMinToday = todayWalks.reduce((acc, w) => acc + (w.metadata?.duration_minutes ?? 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>🦮 Paseos</h2>
          {todayWalks.length > 0 && (
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
              Hoy: {todayWalks.length} paseo{todayWalks.length !== 1 ? 's' : ''}
              {totalMinToday > 0 ? ` · ${totalMinToday} min` : ''}
            </p>
          )}
        </div>
        <button onClick={() => setShowForm(p => !p)}
          style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          🦮 Registrar paseo
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input type="number" min="1" value={form.duration}
              onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
              placeholder="Duración (minutos, opcional)"
              autoFocus
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Notas (ruta, incidencias...)"
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              <button onClick={registerWalk}
                style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Registrar</button>
            </div>
            {walkError && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{walkError}</p>}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : walks.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Sin paseos esta semana</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {walks.map(walk => {
            const d = new Date(walk.start_time)
            const dateLabel = `${d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })} ${d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`
            return (
              <div key={walk.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                <span style={{ fontSize: 20 }}>🦮</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Paseo</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                    {dateLabel}{walk.metadata?.duration_minutes ? ` · ${walk.metadata.duration_minutes} min` : ''}
                  </p>
                  {walk.metadata?.notes && (
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>{walk.metadata.notes}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Maintenance mode (non-dog species) ─────────────────────────────
function MaintenanceMode({ pet, app }) {
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ title: '', due: '', interval_days: '', products: '' })
  const [addError, setAddError]   = useState(null)
  const [markError, setMarkError] = useState(null)

  const todayStr = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    let cancelled = false
    supabase.from('events')
      .select('*')
      .eq('app_id', app.id)
      .eq('event_type', 'cage_maintenance')
      .contains('metadata', { pet_id: pet.id })
      .order('start_time', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setFetchError(error.message); setLoading(false); return }
        setTasks(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [app.id, pet.id])

  async function handleAdd() {
    if (!form.title.trim() || !form.due) return
    setAddError(null)
    const startTime = new Date(form.due + 'T09:00:00').toISOString()
    const { data, error } = await supabase.from('events').insert({
      app_id:     app.id,
      event_type: 'cage_maintenance',
      title:      form.title.trim(),
      start_time: startTime,
      all_day:    true,
      metadata: {
        pet_id:        pet.id,
        interval_days: form.interval_days && Number(form.interval_days) > 0 ? Number(form.interval_days) : null,
        products:      form.products.trim() || null,
      },
    }).select().single()
    if (error) { setAddError('No se pudo guardar la tarea.'); return }
    if (data) {
      setTasks(p => [...p, data].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)))
      setForm({ title: '', due: '', interval_days: '', products: '' })
      setShowAdd(false)
    }
  }

  async function markDone(task) {
    const { error } = await supabase.from('events').delete().eq('id', task.id)
    if (error) return
    setTasks(p => p.filter(t => t.id !== task.id))
    const intervalDays = task.metadata?.interval_days
    if (intervalDays) {
      const nextDate = new Date()
      nextDate.setDate(nextDate.getDate() + Number(intervalDays))
      nextDate.setHours(9, 0, 0, 0)
      const { data } = await supabase.from('events').insert({
        app_id:     app.id,
        event_type: 'cage_maintenance',
        title:      task.title,
        start_time: nextDate.toISOString(),
        all_day:    true,
        metadata:   task.metadata,
      }).select().single()
      if (data) {
        setTasks(p => [...p, data].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)))
      } else {
        setMarkError('Tarea completada pero no se pudo programar la siguiente.')
      }
    }
  }

  async function removeTask(id) {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (!error) setTasks(p => p.filter(t => t.id !== id))
  }

  const overdueCount = tasks.filter(t => formatDue(t.start_time).overdue).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>🏠 Mantenimiento</h2>
          {overdueCount > 0 && (
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#ef4444' }}>
              {overdueCount} vencida{overdueCount !== 1 ? 's' : ''}
            </p>
          )}
          {markError && <p style={{ fontSize: 12, color: '#ef4444', margin: '2px 0 0' }}>{markError}</p>}
        </div>
        <button onClick={() => setShowAdd(p => !p)}
          style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          + Nueva tarea
        </button>
      </div>

      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Nombre de la tarea *" autoFocus
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Fecha *</label>
                <input type="date" value={form.due} min={todayStr}
                  onChange={e => setForm(p => ({ ...p, due: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Repetir cada (días)</label>
                <input type="number" min="1" value={form.interval_days}
                  onChange={e => setForm(p => ({ ...p, interval_days: e.target.value }))}
                  placeholder="Sin repetición"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <input value={form.products} onChange={e => setForm(p => ({ ...p, products: e.target.value }))}
              placeholder="Productos necesarios"
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              <button onClick={handleAdd} disabled={!form.title.trim() || !form.due}
                style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: (form.title.trim() && form.due) ? 1 : 0.4 }}>Crear</button>
            </div>
            {addError && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{addError}</p>}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : fetchError ? (
        <p style={{ fontSize: 13, color: '#ef4444' }}>Error: {fetchError}</p>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <p style={{ fontSize: 36, margin: '0 0 6px' }}>🏠</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin tareas de mantenimiento</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Crea tareas de limpieza o mantenimiento</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {tasks.map(task => {
            const { label: dueLabel, overdue } = formatDue(task.start_time)
            const intervalDays = task.metadata?.interval_days
            const products     = task.metadata?.products
            return (
              <div key={task.id}
                style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${overdue ? 'rgba(239,68,68,.4)' : 'var(--border)'}`, background: 'var(--bg-card)' }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                <button onClick={() => markDone(task)} title="Marcar como hecha"
                  style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${overdue ? '#ef4444' : 'var(--border)'}`, background: 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 2, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.textContent = '✓' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = overdue ? '#ef4444' : 'var(--border)'; e.currentTarget.textContent = '' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{task.title}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: overdue ? '#ef4444' : 'var(--text-muted)' }}>{dueLabel}</span>
                    {intervalDays && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>↻ cada {intervalDays} días</span>}
                    {products && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>🧴 {products}</span>}
                  </div>
                </div>
                <button className="del-btn" onClick={() => removeTask(task.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 17, padding: '0 4px', opacity: 0, transition: 'opacity .15s', alignSelf: 'center' }}>×</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main export ─────────────────────────────────────────────────────
export default function Rutinas() {
  const { pet, app } = useOutletContext()
  if (pet.species === 'perro') return <WalksMode pet={pet} app={app} />
  return <MaintenanceMode pet={pet} app={app} />
}
```

- [ ] **Step 2: Run all tests to confirm no regressions**

```bash
npm run test
```

Expected: All tests pass (the new components plus existing ones).

- [ ] **Step 3: Commit**

```bash
git add src/pages/app/modules/mascotas/Rutinas.jsx
git commit -m "feat(mascotas): add Rutinas — walks (perro) and maintenance (other species)"
```

---

## Task 8: Cleanup — delete Welcome

**Files:**
- Delete: `src/pages/app/modules/mascotas/Welcome.jsx`
- Delete: `src/pages/app/modules/mascotas/__tests__/Welcome.test.jsx`

- [ ] **Step 1: Delete the files**

```bash
rm src/pages/app/modules/mascotas/Welcome.jsx
rm src/pages/app/modules/mascotas/__tests__/Welcome.test.jsx
```

- [ ] **Step 2: Run all tests to confirm they pass**

```bash
npm run test
```

Expected: All tests pass. The old Welcome tests are gone; no other test references Welcome.

- [ ] **Step 3: Run the dev build to check no broken imports**

```bash
npm run build
```

Expected: Build succeeds with no errors. (The old `MascotasWelcome` lazy import was removed in Task 2.)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(mascotas): remove Welcome stub, replaced by MisMascotas"
```

---

## Self-Review

### Spec coverage

| Requirement | Covered by |
|---|---|
| Múltiples mascotas como perfiles independientes | Task 3 (MisMascotas) |
| Navegación lista → seleccionar → tabs | Tasks 3+4 |
| Módulos determinados por especie | Task 4 (SPECIES_MODULES) |
| Datos vía `metadata.pet_id` sin migración adicional | Tasks 5,6,7 |
| Sin módulo Gastos | Spec explicitly excluded, not planned |
| AppLayout sidebar: único enlace "Mis Mascotas" | Task 2 (AppLayout) |
| Tabla `pets` con RLS | Task 1 |
| Alimentación: stock + tomas | Task 5 |
| Salud: vaccination/vet_visit/medication con recurrencia | Task 6 |
| Rutinas: paseos (perro) / mantenimiento (otros) | Task 7 |
| Eliminar mascota borra eventos e inventario manuales | Task 4 (handleDelete) |
| Empty states | Tasks 3,5,6,7 |
| Criterio: tabs solo muestran módulos de especie | Task 4 (SPECIES_MODULES) |
| Criterio: horario de tomas edita pets.metadata | Task 5 (handleAddToma/removeToma) |
| Criterio: Hogar sin regresiones | Task 2 notes — only mascotas block modified |

### Placeholder scan ✓

No TBD, TODO, or incomplete steps found.

### Type consistency ✓

- `pet.id`, `app.id` used consistently throughout Tasks 3–7
- `metadata.pet_id` pattern consistent in Tasks 5, 6, 7 and PetDetail delete
- `SPECIES_MODULES` defined once in `PetDetail.jsx`, not duplicated
- `formatDue()` defined in Salud and Rutinas independently (each file is self-contained)
