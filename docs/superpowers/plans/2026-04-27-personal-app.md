# Personal App + Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add shared infrastructure for new apps and build the Personal app with Calendar, Notas, Tareas, and Ideas modules.

**Architecture:** Personal app follows the same AppLayout pattern as Hogar/Mascotas — a `projects` row is auto-created on first visit, modules use `app.id` as `app_id` in Supabase queries with RLS via `user_owns_project`. Calendar is reused directly; Notas/Tareas/Ideas are new CRUD modules using `personal_notes`, `personal_tasks`, `personal_ideas` tables (already created in DB).

**Tech Stack:** React 18, React Router v6, Supabase JS, Tailwind v4, Vitest + RTL

---

## File Map

**Modified:**
- `src/pages/app/AppLayout.jsx` — add `personal` to APP_NAMES/APP_ICONS/MODULE_MAP; update FINANZAS_MODULES; update VEHICULO_MODULES
- `src/App.jsx` — lazy imports + routes for all new apps
- `src/data/apps.js` — add Personal entry; update Vehículo/Finanzas features

**Created:**
- `src/pages/app/modules/personal/Notas.jsx`
- `src/pages/app/modules/personal/Tareas.jsx`
- `src/pages/app/modules/personal/Ideas.jsx`
- `src/pages/app/modules/personal/__tests__/Notas.test.jsx`
- `src/pages/app/modules/personal/__tests__/Tareas.test.jsx`
- `src/pages/app/modules/personal/__tests__/Ideas.test.jsx`

---

### Task 1: Shared infrastructure — AppLayout + App.jsx + apps.js

**Files:**
- Modify: `src/pages/app/AppLayout.jsx:7-47`
- Modify: `src/App.jsx:35-163`
- Modify: `src/data/apps.js`

- [ ] **Step 1: Update AppLayout constants**

Replace the APP_NAMES, APP_ICONS, VEHICULO_MODULES, FINANZAS_MODULES, and MODULE_MAP blocks in `src/pages/app/AppLayout.jsx`:

```jsx
const APP_NAMES = {
  hogar:    'Hogar',
  mascotas: 'Mascotas',
  vehiculo: 'Vehículo',
  finanzas: 'Finanzas',
  personal: 'Personal',
}

const APP_ICONS = {
  hogar:    '🏠',
  mascotas: '🐾',
  vehiculo: '🚗',
  finanzas: '💰',
  personal: '🗂️',
}

// HOGAR_MODULES unchanged ...

const MASCOTAS_MODULES = [
  { path: 'mis-mascotas', label: 'Mis Mascotas', icon: '🐾' },
]

const VEHICULO_MODULES = [
  { path: 'mis-vehiculos', label: 'Mis Vehículos', icon: '🚗' },
]

const FINANZAS_MODULES = [
  { path: 'resumen',       label: 'Resumen',       icon: '📊' },
  { path: 'transacciones', label: 'Transacciones', icon: '💳' },
  { path: 'categorias',    label: 'Categorías',    icon: '🏷️' },
  { path: 'presupuestos',  label: 'Presupuestos',  icon: '🎯' },
]

const PERSONAL_MODULES = [
  { path: 'calendar', label: 'Calendario', icon: '📅' },
  { path: 'notas',    label: 'Notas',      icon: '📝' },
  { path: 'tareas',   label: 'Tareas',     icon: '✅' },
  { path: 'ideas',    label: 'Ideas',      icon: '💡' },
]

const MODULE_MAP = {
  hogar:    HOGAR_MODULES,
  mascotas: MASCOTAS_MODULES,
  vehiculo: VEHICULO_MODULES,
  finanzas: FINANZAS_MODULES,
  personal: PERSONAL_MODULES,
}
```

- [ ] **Step 2: Update App.jsx — lazy imports**

Add these lazy imports after the existing ones in `src/App.jsx` (after line 36 `FinanzasWelcome`):

```jsx
// Personal
const PersonalNotas  = React.lazy(() => import('./pages/app/modules/personal/Notas'))
const PersonalTareas = React.lazy(() => import('./pages/app/modules/personal/Tareas'))
const PersonalIdeas  = React.lazy(() => import('./pages/app/modules/personal/Ideas'))

// Vehículo (new modules — replace VehiculoWelcome)
const MisVehiculos      = React.lazy(() => import('./pages/app/modules/vehiculo/MisVehiculos'))
const VehiculoDetail    = React.lazy(() => import('./pages/app/modules/vehiculo/VehiculoDetail'))
const VehiculoRepostajes = React.lazy(() => import('./pages/app/modules/vehiculo/Repostajes'))
const VehiculoMant      = React.lazy(() => import('./pages/app/modules/vehiculo/Mantenimiento'))
const VehiculoGastos    = React.lazy(() => import('./pages/app/modules/vehiculo/VehiculoGastos'))
const VehiculoStats     = React.lazy(() => import('./pages/app/modules/vehiculo/Estadisticas'))

// Finanzas (new modules — replace FinanzasWelcome)
const FinanzasResumen       = React.lazy(() => import('./pages/app/modules/finanzas/Resumen'))
const FinanzasTransacciones = React.lazy(() => import('./pages/app/modules/finanzas/Transacciones'))
const FinanzasCategorias    = React.lazy(() => import('./pages/app/modules/finanzas/Categorias'))
const FinanzasPresupuestos  = React.lazy(() => import('./pages/app/modules/finanzas/Presupuestos'))
```

- [ ] **Step 3: Update App.jsx — routes for Personal, Vehículo, Finanzas**

Replace the `{/* Vehículo */}`, `{/* Finanzas */}` route blocks and add `{/* Personal */}` in `src/App.jsx`:

```jsx
{/* Personal */}
<Route path="/app/personal" element={
  <ProtectedRoute><AppLayout /></ProtectedRoute>
}>
  <Route index element={<Navigate to="calendar" replace />} />
  <Route path="calendar" element={<Calendar />} />
  <Route path="notas"    element={<PersonalNotas />} />
  <Route path="tareas"   element={<PersonalTareas />} />
  <Route path="ideas"    element={<PersonalIdeas />} />
</Route>

{/* Vehículo */}
<Route path="/app/vehiculo" element={
  <ProtectedRoute><AppLayout /></ProtectedRoute>
}>
  <Route index element={<Navigate to="mis-vehiculos" replace />} />
  <Route path="mis-vehiculos" element={<MisVehiculos />} />
  <Route path="mis-vehiculos/:vehicleId" element={<VehiculoDetail />}>
    <Route index element={<Navigate to="repostajes" replace />} />
    <Route path="repostajes"   element={<VehiculoRepostajes />} />
    <Route path="mantenimiento" element={<VehiculoMant />} />
    <Route path="gastos"       element={<VehiculoGastos />} />
    <Route path="estadisticas" element={<VehiculoStats />} />
  </Route>
</Route>

{/* Finanzas */}
<Route path="/app/finanzas" element={
  <ProtectedRoute><AppLayout /></ProtectedRoute>
}>
  <Route index element={<Navigate to="resumen" replace />} />
  <Route path="resumen"        element={<FinanzasResumen />} />
  <Route path="transacciones"  element={<FinanzasTransacciones />} />
  <Route path="categorias"     element={<FinanzasCategorias />} />
  <Route path="presupuestos"   element={<FinanzasPresupuestos />} />
</Route>
```

- [ ] **Step 4: Update apps.js — add Personal, update others**

Replace `src/data/apps.js` entirely:

```js
export const apps = [
  {
    slug: 'hogar',
    title: 'Hogar',
    description: 'Gestión del hogar: calendario de tareas, menú semanal, lista de la compra y recetario.',
    icon: '🏠',
    href: '/app/hogar',
    status: 'active',
    requiredPlan: 'free',
    color: 'from-orange-500 to-amber-500',
    version: '0.4.0',
    lastUpdated: '2026-04',
    features: ['Calendario', 'Menú semanal', 'Lista de la compra', 'Recetario'],
  },
  {
    slug: 'personal',
    title: 'Personal',
    description: 'Tu espacio personal: agenda, notas rápidas, tareas pendientes y captura de ideas.',
    icon: '🗂️',
    href: '/app/personal',
    status: 'active',
    requiredPlan: 'free',
    color: 'from-violet-500 to-purple-500',
    version: '0.1.0',
    lastUpdated: '2026-04',
    features: ['Calendario', 'Notas', 'Tareas', 'Ideas'],
  },
  {
    slug: 'mascotas',
    title: 'Mascotas',
    description: 'Alimentación, salud y gastos de tus mascotas.',
    icon: '🐾',
    href: '/app/mascotas',
    status: 'active',
    requiredPlan: 'free',
    color: 'from-pink-500 to-rose-500',
    version: '0.1.0',
    lastUpdated: '2026-04',
    features: ['Alimentación', 'Salud', 'Gastos'],
  },
  {
    slug: 'vehiculo',
    title: 'Vehículo',
    description: 'Gestión completa de tus vehículos: repostajes, mantenimiento, gastos y estadísticas.',
    icon: '🚗',
    href: '/app/vehiculo',
    status: 'active',
    requiredPlan: 'free',
    color: 'from-blue-500 to-indigo-500',
    version: '0.2.0',
    lastUpdated: '2026-04',
    features: ['Repostajes', 'Mantenimiento', 'Gastos', 'Estadísticas'],
  },
  {
    slug: 'finanzas',
    title: 'Finanzas',
    description: 'Registro de gastos e ingresos con categorías, presupuestos mensuales y resumen visual.',
    icon: '💰',
    href: '/app/finanzas',
    status: 'active',
    requiredPlan: 'free',
    color: 'from-emerald-500 to-teal-500',
    version: '0.2.0',
    lastUpdated: '2026-04',
    features: ['Gastos & Ingresos', 'Categorías', 'Presupuestos', 'Resumen mensual'],
  },
]
```

- [ ] **Step 5: Verify dev server starts without errors**

```bash
npm run dev
```

Navigate to `/apps` — should show 5 app cards. Navigate to `/app/personal` — should auto-create the project row and redirect to `/app/personal/calendar`.

- [ ] **Step 6: Commit**

```bash
git add src/pages/app/AppLayout.jsx src/App.jsx src/data/apps.js
git commit -m "feat: infrastructure — add personal/vehiculo/finanzas to AppLayout and routes"
```

---

### Task 2: Personal — Notas module

**Files:**
- Create: `src/pages/app/modules/personal/Notas.jsx`
- Create: `src/pages/app/modules/personal/__tests__/Notas.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/pages/app/modules/personal/__tests__/Notas.test.jsx`:

```jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useOutletContext: () => ({
      app: { id: 'app-1', icon: '🗂️', name: 'Personal', type: 'personal' },
      modules: [],
    }),
  }
})

vi.mock('../../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn((cb) => cb({ data: [], error: null })),
    }),
  },
}))

import Notas from '../Notas'

describe('Notas', () => {
  it('muestra empty state cuando no hay notas', async () => {
    render(<Notas />)
    await waitFor(() =>
      expect(screen.getByText(/sin notas/i)).toBeInTheDocument()
    )
  })

  it('muestra botón nueva nota', async () => {
    render(<Notas />)
    await waitFor(() =>
      expect(screen.getByText(/\+ nueva nota/i)).toBeInTheDocument()
    )
  })

  it('abre modal al pulsar nueva nota', async () => {
    render(<Notas />)
    await waitFor(() => screen.getByText(/\+ nueva nota/i))
    fireEvent.click(screen.getByText(/\+ nueva nota/i))
    expect(screen.getByPlaceholderText(/título de la nota/i)).toBeInTheDocument()
  })

  it('muestra notas cargadas desde supabase', async () => {
    const { supabase } = await import('../../../../../lib/supabase')
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn((cb) => cb({
        data: [{ id: 'n1', title: 'Mi nota', content: 'Contenido', color: '#f59e0b', pinned: false, updated_at: new Date().toISOString() }],
        error: null,
      })),
    })
    render(<Notas />)
    await waitFor(() => expect(screen.getByText('Mi nota')).toBeInTheDocument())
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- --run src/pages/app/modules/personal/__tests__/Notas.test.jsx
```

Expected: FAIL — `Cannot find module '../Notas'`

- [ ] **Step 3: Create Notas.jsx**

Create `src/pages/app/modules/personal/Notas.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

const NOTE_COLORS = [
  { hex: '#f59e0b', label: 'Ámbar' },
  { hex: '#3b82f6', label: 'Azul' },
  { hex: '#10b981', label: 'Verde' },
  { hex: '#8b5cf6', label: 'Violeta' },
  { hex: '#ef4444', label: 'Rojo' },
  { hex: '#6b7280', label: 'Gris' },
]

export default function Notas() {
  const { app } = useOutletContext()
  const [notes, setNotes]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [modal, setModal]       = useState(null) // null | { id?, title, content, color }
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase.from('personal_notes')
      .select('*')
      .eq('app_id', app.id)
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setFetchError(error.message); setLoading(false); return }
        setNotes(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [app.id])

  async function handleSave() {
    if (!modal) return
    setSaving(true)
    const payload = {
      app_id:  app.id,
      title:   modal.title.trim() || 'Sin título',
      content: modal.content.trim(),
      color:   modal.color,
    }
    if (modal.id) {
      const { error } = await supabase.from('personal_notes')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', modal.id)
      if (!error) {
        setNotes(p => p.map(n => n.id === modal.id ? { ...n, ...payload } : n))
        setModal(null)
      }
    } else {
      const { data, error } = await supabase.from('personal_notes')
        .insert(payload).select().single()
      if (!error && data) { setNotes(p => [data, ...p]); setModal(null) }
    }
    setSaving(false)
  }

  async function togglePin(e, note) {
    e.stopPropagation()
    const { error } = await supabase.from('personal_notes')
      .update({ pinned: !note.pinned }).eq('id', note.id)
    if (!error) {
      setNotes(p => {
        const upd = p.map(n => n.id === note.id ? { ...n, pinned: !n.pinned } : n)
        return upd.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
          new Date(b.updated_at) - new Date(a.updated_at))
      })
    }
  }

  async function deleteNote(e, id) {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar esta nota?')) return
    const { error } = await supabase.from('personal_notes').delete().eq('id', id)
    if (!error) setNotes(p => p.filter(n => n.id !== id))
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Notas</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {notes.length} nota{notes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setModal({ title: '', content: '', color: '#f59e0b' })}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >+ Nueva nota</button>
      </div>

      {fetchError && (
        <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16 }}>Error: {fetchError}</p>
      )}

      {notes.length === 0 && !fetchError ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: 48, margin: '0 0 8px' }}>📝</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin notas</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Crea tu primera nota rápida</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {notes.map(note => (
            <div
              key={note.id}
              onClick={() => setModal({ id: note.id, title: note.title, content: note.content, color: note.color })}
              style={{
                borderRadius: 12, padding: 16, cursor: 'pointer', position: 'relative',
                background: note.color + '22', border: `1px solid ${note.color}44`,
                minHeight: 100, transition: 'transform 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <button onClick={(e) => togglePin(e, note)} title={note.pinned ? 'Desanclar' : 'Anclar'}
                style={{ position: 'absolute', top: 8, right: 32, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: note.pinned ? 1 : 0.25, padding: 2 }}>
                📌
              </button>
              <button onClick={(e) => deleteNote(e, note.id)} title="Eliminar"
                style={{ position: 'absolute', top: 8, right: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.25, padding: 2 }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.25'}
              >×</button>
              <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: 'var(--text)', paddingRight: 48 }}>
                {note.title}
              </p>
              {note.content && (
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {note.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
        >
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480, border: '1px solid var(--border)' }}>
            <input
              value={modal.title}
              onChange={e => setModal(p => ({ ...p, title: e.target.value }))}
              placeholder="Título de la nota"
              autoFocus
              style={{ width: '100%', fontSize: 16, fontWeight: 700, color: 'var(--text)',
                background: 'transparent', border: 'none', outline: 'none',
                borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 12, boxSizing: 'border-box' }}
            />
            <textarea
              value={modal.content}
              onChange={e => setModal(p => ({ ...p, content: e.target.value }))}
              placeholder="Escribe tu nota aquí..."
              rows={6}
              style={{ width: '100%', fontSize: 13, color: 'var(--text)', background: 'transparent',
                border: 'none', outline: 'none', resize: 'vertical', lineHeight: 1.6,
                fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {NOTE_COLORS.map(c => (
                <button key={c.hex} onClick={() => setModal(p => ({ ...p, color: c.hex }))} title={c.label}
                  style={{ width: 24, height: 24, borderRadius: '50%', background: c.hex, padding: 0, cursor: 'pointer',
                    border: modal.color === c.hex ? '2px solid var(--text)' : '2px solid transparent' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Guardando...' : modal.id ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify pass**

```bash
npm run test -- --run src/pages/app/modules/personal/__tests__/Notas.test.jsx
```

Expected: 4 passed

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/modules/personal/Notas.jsx src/pages/app/modules/personal/__tests__/Notas.test.jsx
git commit -m "feat(personal): Notas module — grid de notas con color, pin y edición modal"
```

---

### Task 3: Personal — Tareas module

**Files:**
- Create: `src/pages/app/modules/personal/Tareas.jsx`
- Create: `src/pages/app/modules/personal/__tests__/Tareas.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/pages/app/modules/personal/__tests__/Tareas.test.jsx`:

```jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useOutletContext: () => ({
      app: { id: 'app-1', icon: '🗂️', name: 'Personal', type: 'personal' },
      modules: [],
    }),
  }
})

vi.mock('../../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn((cb) => cb({ data: [], error: null })),
    }),
  },
}))

import Tareas from '../Tareas'

describe('Tareas', () => {
  it('muestra empty state cuando no hay tareas', async () => {
    render(<Tareas />)
    await waitFor(() =>
      expect(screen.getByText(/sin tareas pendientes/i)).toBeInTheDocument()
    )
  })

  it('muestra botón nueva tarea', async () => {
    render(<Tareas />)
    await waitFor(() =>
      expect(screen.getByText(/\+ nueva tarea/i)).toBeInTheDocument()
    )
  })

  it('abre formulario al pulsar nueva tarea', async () => {
    render(<Tareas />)
    await waitFor(() => screen.getByText(/\+ nueva tarea/i))
    fireEvent.click(screen.getByText(/\+ nueva tarea/i))
    expect(screen.getByPlaceholderText(/título de la tarea/i)).toBeInTheDocument()
  })

  it('muestra tareas con prioridad', async () => {
    const { supabase } = await import('../../../../../lib/supabase')
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn((cb) => cb({
        data: [{ id: 't1', title: 'Llamar al médico', status: 'pending', priority: 'high', due_date: null, description: null, completed_at: null }],
        error: null,
      })),
    })
    render(<Tareas />)
    await waitFor(() => expect(screen.getByText('Llamar al médico')).toBeInTheDocument())
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- --run src/pages/app/modules/personal/__tests__/Tareas.test.jsx
```

Expected: FAIL — `Cannot find module '../Tareas'`

- [ ] **Step 3: Create Tareas.jsx**

Create `src/pages/app/modules/personal/Tareas.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

const PRIORITY_CONFIG = {
  high:   { color: '#ef4444', label: 'Alta' },
  medium: { color: '#f59e0b', label: 'Media' },
  low:    { color: '#6b7280', label: 'Baja' },
}

function formatDue(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const diff = Math.round((d - new Date(now.toDateString())) / 86400000)
  if (diff < 0)  return { label: `Hace ${Math.abs(diff)}d`, overdue: true }
  if (diff === 0) return { label: 'Hoy', overdue: false }
  if (diff === 1) return { label: 'Mañana', overdue: false }
  return { label: `${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`, overdue: false }
}

export default function Tareas() {
  const { app } = useOutletContext()
  const [tasks, setTasks]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [showAdd, setShowAdd]   = useState(false)
  const [form, setForm]         = useState({ title: '', description: '', due_date: '', priority: 'medium' })
  const [tab, setTab]           = useState('pending') // 'pending' | 'done'

  useEffect(() => {
    let cancelled = false
    supabase.from('personal_tasks')
      .select('*')
      .eq('app_id', app.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setFetchError(error.message); setLoading(false); return }
        setTasks(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [app.id])

  async function handleAdd() {
    if (!form.title.trim()) return
    const { data, error } = await supabase.from('personal_tasks')
      .insert({
        app_id:      app.id,
        title:       form.title.trim(),
        description: form.description.trim() || null,
        due_date:    form.due_date || null,
        priority:    form.priority,
        status:      'pending',
      })
      .select().single()
    if (!error && data) {
      setTasks(p => [data, ...p])
      setForm({ title: '', description: '', due_date: '', priority: 'medium' })
      setShowAdd(false)
    }
  }

  async function toggleStatus(task) {
    const done = task.status !== 'done'
    const { error } = await supabase.from('personal_tasks')
      .update({ status: done ? 'done' : 'pending', completed_at: done ? new Date().toISOString() : null })
      .eq('id', task.id)
    if (!error) setTasks(p => p.map(t => t.id === task.id ? { ...t, status: done ? 'done' : 'pending', completed_at: done ? new Date().toISOString() : null } : t))
  }

  async function deleteTask(id) {
    const { error } = await supabase.from('personal_tasks').delete().eq('id', id)
    if (!error) setTasks(p => p.filter(t => t.id !== id))
  }

  const pending = tasks.filter(t => t.status === 'pending')
    .sort((a, b) => {
      const po = { high: 0, medium: 1, low: 2 }
      return po[a.priority] - po[b.priority]
    })
  const done = tasks.filter(t => t.status === 'done')
  const shown = tab === 'pending' ? pending : done

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Tareas</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(p => !p)}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >+ Nueva tarea</button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Título de la tarea *"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="date"
                value={form.due_date}
                onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
              />
              <select
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
              >
                <option value="high">🔴 Alta</option>
                <option value="medium">🟡 Media</option>
                <option value="low">⚪ Baja</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                Cancelar
              </button>
              <button onClick={handleAdd} disabled={!form.title.trim()}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: form.title.trim() ? 1 : 0.4 }}>
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', borderRadius: 10, padding: 4 }}>
        {[['pending', `Pendientes (${pending.length})`], ['done', `Hechas (${done.length})`]].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            style={{ flex: 1, padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: tab === val ? 'var(--accent)' : 'transparent',
              color: tab === val ? '#fff' : 'var(--text-muted)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Error */}
      {fetchError && <p style={{ color: '#ef4444', fontSize: 13 }}>Error: {fetchError}</p>}

      {/* List */}
      {shown.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>✅</p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
            {tab === 'pending' ? 'Sin tareas pendientes' : 'Sin tareas completadas'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {shown.map(task => {
            const due = formatDue(task.due_date)
            const pc  = PRIORITY_CONFIG[task.priority]
            const isDone = task.status === 'done'
            return (
              <div key={task.id}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12,
                  border: '1px solid var(--border)', background: 'var(--bg-card)' }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                {/* Priority dot */}
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: isDone ? 'var(--border)' : pc.color, flexShrink: 0 }} />
                {/* Checkbox */}
                <button onClick={() => toggleStatus(task)}
                  style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${isDone ? 'var(--accent)' : 'var(--border)'}`,
                    background: isDone ? 'var(--accent)' : 'transparent', cursor: 'pointer', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>
                  {isDone && '✓'}
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)',
                    textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.5 : 1 }}>
                    {task.title}
                  </p>
                  {due && (
                    <span style={{ fontSize: 11, color: due.overdue ? '#ef4444' : 'var(--text-faint)' }}>{due.label}</span>
                  )}
                </div>
                <button className="del-btn" onClick={() => deleteTask(task.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
                >×</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify pass**

```bash
npm run test -- --run src/pages/app/modules/personal/__tests__/Tareas.test.jsx
```

Expected: 4 passed

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/modules/personal/Tareas.jsx src/pages/app/modules/personal/__tests__/Tareas.test.jsx
git commit -m "feat(personal): Tareas module — lista con prioridad, fecha límite y tabs pendiente/hecha"
```

---

### Task 4: Personal — Ideas module

**Files:**
- Create: `src/pages/app/modules/personal/Ideas.jsx`
- Create: `src/pages/app/modules/personal/__tests__/Ideas.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `src/pages/app/modules/personal/__tests__/Ideas.test.jsx`:

```jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useOutletContext: () => ({
      app: { id: 'app-1', icon: '🗂️', name: 'Personal', type: 'personal' },
      modules: [],
    }),
  }
})

vi.mock('../../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn((cb) => cb({ data: [], error: null })),
    }),
  },
}))

import Ideas from '../Ideas'

describe('Ideas', () => {
  it('muestra empty state cuando no hay ideas', async () => {
    render(<Ideas />)
    await waitFor(() =>
      expect(screen.getByText(/sin ideas/i)).toBeInTheDocument()
    )
  })

  it('muestra botón nueva idea', async () => {
    render(<Ideas />)
    await waitFor(() =>
      expect(screen.getByText(/\+ nueva idea/i)).toBeInTheDocument()
    )
  })

  it('abre modal al pulsar nueva idea', async () => {
    render(<Ideas />)
    await waitFor(() => screen.getByText(/\+ nueva idea/i))
    fireEvent.click(screen.getByText(/\+ nueva idea/i))
    expect(screen.getByPlaceholderText(/título de la idea/i)).toBeInTheDocument()
  })

  it('muestra ideas cargadas', async () => {
    const { supabase } = await import('../../../../../lib/supabase')
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn((cb) => cb({
        data: [{ id: 'i1', title: 'App de recetas con IA', description: 'Usar GPT-4 para sugerencias', tags: ['IA', 'recetas'], created_at: new Date().toISOString() }],
        error: null,
      })),
    })
    render(<Ideas />)
    await waitFor(() => expect(screen.getByText('App de recetas con IA')).toBeInTheDocument())
    expect(screen.getByText('IA')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- --run src/pages/app/modules/personal/__tests__/Ideas.test.jsx
```

Expected: FAIL — `Cannot find module '../Ideas'`

- [ ] **Step 3: Create Ideas.jsx**

Create `src/pages/app/modules/personal/Ideas.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

export default function Ideas() {
  const { app } = useOutletContext()
  const [ideas, setIdeas]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [modal, setModal]       = useState(null) // null | { id?, title, description, tags, tagInput }
  const [saving, setSaving]     = useState(false)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    let cancelled = false
    supabase.from('personal_ideas')
      .select('*')
      .eq('app_id', app.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setFetchError(error.message); setLoading(false); return }
        setIdeas(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [app.id])

  async function handleSave() {
    if (!modal || !modal.title.trim()) return
    setSaving(true)
    const payload = {
      app_id:      app.id,
      title:       modal.title.trim(),
      description: modal.description.trim(),
      tags:        modal.tags,
    }
    if (modal.id) {
      const { error } = await supabase.from('personal_ideas').update(payload).eq('id', modal.id)
      if (!error) { setIdeas(p => p.map(i => i.id === modal.id ? { ...i, ...payload } : i)); setModal(null) }
    } else {
      const { data, error } = await supabase.from('personal_ideas').insert(payload).select().single()
      if (!error && data) { setIdeas(p => [data, ...p]); setModal(null) }
    }
    setSaving(false)
  }

  async function deleteIdea(id) {
    const { error } = await supabase.from('personal_ideas').delete().eq('id', id)
    if (!error) setIdeas(p => p.filter(i => i.id !== id))
  }

  function handleTagKeyDown(e) {
    if ((e.key === 'Enter' || e.key === ',') && modal?.tagInput?.trim()) {
      e.preventDefault()
      const tag = modal.tagInput.trim()
      if (!modal.tags.includes(tag)) {
        setModal(p => ({ ...p, tags: [...p.tags, tag], tagInput: '' }))
      } else {
        setModal(p => ({ ...p, tagInput: '' }))
      }
    }
  }

  const filtered = ideas.filter(i =>
    !search || i.title.toLowerCase().includes(search.toLowerCase()) ||
    (i.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Ideas</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {ideas.length} idea{ideas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setModal({ title: '', description: '', tags: [], tagInput: '' })}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >+ Nueva idea</button>
      </div>

      {ideas.length > 3 && (
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar ideas..."
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
        />
      )}

      {fetchError && <p style={{ color: '#ef4444', fontSize: 13 }}>Error: {fetchError}</p>}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: 48, margin: '0 0 8px' }}>💡</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>
            {search ? 'Sin resultados' : 'Sin ideas'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            {search ? 'Prueba con otro término' : 'Captura tu primera idea'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(idea => (
            <div key={idea.id}
              style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer' }}
              onClick={() => setModal({ id: idea.id, title: idea.title, description: idea.description || '', tags: idea.tags || [], tagInput: '' })}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{idea.title}</p>
                <button className="del-btn" onClick={(e) => { e.stopPropagation(); deleteIdea(idea.id) }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 2px', opacity: 0, transition: 'opacity .15s', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
                >×</button>
              </div>
              {idea.description && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {idea.description}
                </p>
              )}
              {idea.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {idea.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--border)', color: 'var(--text-faint)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
        >
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480, border: '1px solid var(--border)' }}>
            <input
              value={modal.title}
              onChange={e => setModal(p => ({ ...p, title: e.target.value }))}
              placeholder="Título de la idea *"
              autoFocus
              style={{ width: '100%', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'transparent',
                border: 'none', outline: 'none', borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 12, boxSizing: 'border-box' }}
            />
            <textarea
              value={modal.description}
              onChange={e => setModal(p => ({ ...p, description: e.target.value }))}
              placeholder="Desarrolla tu idea..."
              rows={4}
              style={{ width: '100%', fontSize: 13, color: 'var(--text)', background: 'transparent', border: 'none', outline: 'none',
                resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 12 }}
            />
            {/* Tags */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                {modal.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 12, padding: '2px 10px', borderRadius: 20, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {tag}
                    <button onClick={() => setModal(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))}
                      style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
              <input
                value={modal.tagInput}
                onChange={e => setModal(p => ({ ...p, tagInput: e.target.value }))}
                onKeyDown={handleTagKeyDown}
                placeholder="Añadir tag (Enter para confirmar)"
                style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving || !modal.title.trim()}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  opacity: (saving || !modal.title.trim()) ? 0.4 : 1 }}>
                {saving ? 'Guardando...' : modal.id ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests — verify pass**

```bash
npm run test -- --run src/pages/app/modules/personal/__tests__/Ideas.test.jsx
```

Expected: 4 passed

- [ ] **Step 5: Run all personal tests**

```bash
npm run test -- --run src/pages/app/modules/personal/
```

Expected: 12 passed

- [ ] **Step 6: Commit**

```bash
git add src/pages/app/modules/personal/Ideas.jsx src/pages/app/modules/personal/__tests__/Ideas.test.jsx
git commit -m "feat(personal): Ideas module — captura de ideas con tags y búsqueda"
```

---

### Task 5: Smoke test — Personal app end-to-end

- [ ] **Step 1: Start dev server and verify manually**

```bash
npm run dev
```

1. Navigate to `/apps` — verify 5 cards show (Hogar, Personal, Mascotas, Vehículo, Finanzas)
2. Click Personal → should redirect to `/app/personal/calendar`
3. Click "Notas" in sidebar → verify empty state shows
4. Click "+ Nueva nota" → verify modal opens
5. Click "Tareas" → verify pending/done tabs
6. Click "Ideas" → verify empty state

- [ ] **Step 2: Commit infrastructure files**

```bash
git add src/pages/app/AppLayout.jsx src/App.jsx src/data/apps.js
git commit -m "feat: wire Personal/Vehículo/Finanzas routes and AppLayout constants"
```
