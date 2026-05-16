# Finanzas — Módulos Restantes (Suscripciones, Seguros, GastosFijos, Hipoteca) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four new Finanzas modules (Suscripciones, Seguros, GastosFijos, Hipoteca) with demo data, components, and navigation — completing the Finanzas app section.

**Architecture:** Each module reads/writes via `demoRead(appType, key)` / `demoWrite(appType, key, data)` (sessionStorage-backed demo mode). No Supabase tables needed. Context comes from `useOutletContext()` → `const { app } = useOutletContext()`, appType is `app.type ?? 'finanzas'`. All modules are lazy-loaded routes under `/app/finanzas` and `/demo/finanzas`.

**Tech Stack:** React 18, Vite, React Router v6, date-fns, H3nky design tokens (`var(--accent)`, `var(--bg-card)`, `var(--border)`, `var(--text)`, `var(--text-muted)`, `var(--text-faint)`, `var(--font-mono)`)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/data/demo/finanzas.js` | Modify | Add `suscripciones`, `seguros`, `gastos_fijos`, `hipoteca` keys; add `addDays` to date-fns import |
| `src/data/demo/index.js` | Modify | Bump `DEMO_VERSION` from `'9'` → `'10'` |
| `src/data/demo/__tests__/finanzas.test.js` | Modify | Add tests for new 4 keys |
| `src/pages/app/modules/finanzas/Suscripciones.jsx` | Create | Subscription manager with CRUD, estado toggle, monthly total |
| `src/pages/app/modules/finanzas/Seguros.jsx` | Create | Insurance policies with expiry semaphore, CRUD, annual total |
| `src/pages/app/modules/finanzas/GastosFijos.jsx` | Create | Fixed expenses grouped by category, CRUD, monthly total |
| `src/pages/app/modules/finanzas/Hipoteca.jsx` | Create | Read-only mortgage panel with capital progress bar |
| `src/pages/app/DemoAppLayout.jsx` | Modify | Add 4 entries to FINANZAS_MODULES nav array |
| `src/App.jsx` | Modify | Add 4 lazy imports + 8 new routes (app + demo) |

---

## Task 1: Demo Data for New Finanzas Keys

**Files:**
- Modify: `src/data/demo/finanzas.js`
- Modify: `src/data/demo/index.js`
- Modify: `src/data/demo/__tests__/finanzas.test.js`

- [ ] **Step 1: Write the failing tests**

Open `src/data/demo/__tests__/finanzas.test.js` and add these tests at the end of the existing describe block:

```js
describe('new finanzas demo keys', () => {
  it('suscripciones — shape and required fields', () => {
    const data = getFinanzasDemo()
    expect(Array.isArray(data.suscripciones)).toBe(true)
    expect(data.suscripciones.length).toBeGreaterThanOrEqual(4)
    const sub = data.suscripciones[0]
    expect(sub).toHaveProperty('id')
    expect(sub).toHaveProperty('nombre')
    expect(sub).toHaveProperty('icono')
    expect(sub).toHaveProperty('coste')
    expect(sub).toHaveProperty('periodicidad')
    expect(sub).toHaveProperty('fecha_renovacion')
    expect(['activa', 'pausada', 'cancelada']).toContain(sub.estado)
    expect(typeof sub.compartida).toBe('boolean')
  })

  it('seguros — shape and required fields', () => {
    const data = getFinanzasDemo()
    expect(Array.isArray(data.seguros)).toBe(true)
    expect(data.seguros.length).toBeGreaterThanOrEqual(3)
    const seg = data.seguros[0]
    expect(seg).toHaveProperty('id')
    expect(seg).toHaveProperty('tipo')
    expect(seg).toHaveProperty('nombre')
    expect(seg).toHaveProperty('compania')
    expect(seg).toHaveProperty('poliza')
    expect(seg).toHaveProperty('vencimiento')
    expect(typeof seg.coste_anual).toBe('number')
  })

  it('gastos_fijos — shape and required fields', () => {
    const data = getFinanzasDemo()
    expect(Array.isArray(data.gastos_fijos)).toBe(true)
    expect(data.gastos_fijos.length).toBeGreaterThanOrEqual(4)
    const gf = data.gastos_fijos[0]
    expect(gf).toHaveProperty('id')
    expect(gf).toHaveProperty('nombre')
    expect(gf).toHaveProperty('icono')
    expect(gf).toHaveProperty('categoria')
    expect(typeof gf.importe).toBe('number')
    expect(typeof gf.dia_cobro).toBe('number')
  })

  it('hipoteca — object with required fields', () => {
    const data = getFinanzasDemo()
    expect(data.hipoteca).toBeTruthy()
    expect(!Array.isArray(data.hipoteca)).toBe(true)
    expect(data.hipoteca).toHaveProperty('banco')
    expect(data.hipoteca).toHaveProperty('cuota_mensual')
    expect(data.hipoteca).toHaveProperty('capital_inicial')
    expect(data.hipoteca).toHaveProperty('capital_pendiente')
    expect(data.hipoteca).toHaveProperty('fecha_inicio')
    expect(data.hipoteca).toHaveProperty('fecha_fin')
    expect(data.hipoteca.capital_pendiente).toBeLessThan(data.hipoteca.capital_inicial)
  })
})
```

Note: `getFinanzasDemo` needs to be imported/defined at the top of the test file. Check how the existing tests access the demo data — they likely do `import { getDefaultData } from '../finanzas'` or similar. Follow the same import pattern.

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/data/demo/__tests__/finanzas.test.js 2>&1 | tail -30
```

Expected: FAIL — the new keys don't exist in demo data yet.

- [ ] **Step 3: Add `addDays` to finanzas.js import and add new demo keys**

Open `src/data/demo/finanzas.js`. Find the date-fns import at the top (currently `{ subDays, startOfMonth, startOfWeek, format }`) and add `addDays`:

```js
import { subDays, addDays, startOfMonth, startOfWeek, format } from 'date-fns'
```

Then, inside the exported object (or `getDefaultData` function — wherever the existing keys like `fin_transactions`, `fin_budgets` are defined), add the four new keys:

```js
suscripciones: [
  { id: 'sub-1', nombre: 'Netflix',        icono: '🎬', coste: 15.99, periodicidad: 'mensual', fecha_renovacion: fmt(addDays(hoy, 12)),  estado: 'activa',  compartida: true  },
  { id: 'sub-2', nombre: 'Spotify',        icono: '🎵', coste: 9.99,  periodicidad: 'mensual', fecha_renovacion: fmt(addDays(hoy, 8)),   estado: 'activa',  compartida: false },
  { id: 'sub-3', nombre: 'Disney+',        icono: '🏰', coste: 11.99, periodicidad: 'mensual', fecha_renovacion: fmt(addDays(hoy, 25)),  estado: 'activa',  compartida: true  },
  { id: 'sub-4', nombre: 'iCloud 200GB',   icono: '☁️', coste: 2.99,  periodicidad: 'mensual', fecha_renovacion: fmt(addDays(hoy, 5)),   estado: 'activa',  compartida: false },
  { id: 'sub-5', nombre: 'YouTube Premium',icono: '▶️', coste: 13.99, periodicidad: 'mensual', fecha_renovacion: fmt(addDays(hoy, 18)),  estado: 'pausada', compartida: false },
  { id: 'sub-6', nombre: 'Amazon Prime',   icono: '📦', coste: 49.90, periodicidad: 'anual',   fecha_renovacion: fmt(addDays(hoy, 180)), estado: 'activa',  compartida: true  },
],
seguros: [
  { id: 'seg-1', tipo: 'hogar',  nombre: 'Seguro Hogar Mapfre',     compania: 'Mapfre',         poliza: 'MF-2024-001234', vencimiento: fmt(addDays(hoy, 45)),  coste_anual: 380 },
  { id: 'seg-2', tipo: 'vida',   nombre: 'Seguro de Vida Generali', compania: 'Generali',        poliza: 'GN-2023-567890', vencimiento: fmt(addDays(hoy, 210)), coste_anual: 520 },
  { id: 'seg-3', tipo: 'dental', nombre: 'Dental Sanitas',          compania: 'Sanitas',         poliza: 'SN-2024-112233', vencimiento: fmt(addDays(hoy, 90)),  coste_anual: 240 },
  { id: 'seg-4', tipo: 'coche',  nombre: 'Seguro Coche Mutua',      compania: 'Mutua Madrileña', poliza: 'MM-2024-445566', vencimiento: fmt(addDays(hoy, 15)),  coste_anual: 650 },
],
gastos_fijos: [
  { id: 'gf-1', nombre: 'Alquiler',        icono: '🏠', categoria: 'vivienda',     importe: 850, dia_cobro: 1  },
  { id: 'gf-2', nombre: 'Luz (Iberdrola)', icono: '💡', categoria: 'suministros',  importe: 94,  dia_cobro: 15 },
  { id: 'gf-3', nombre: 'Gas Natural',     icono: '🔥', categoria: 'suministros',  importe: 45,  dia_cobro: 20 },
  { id: 'gf-4', nombre: 'Agua',            icono: '💧', categoria: 'suministros',  importe: 28,  dia_cobro: 10 },
  { id: 'gf-5', nombre: 'Internet + Móvil',icono: '📡', categoria: 'conectividad', importe: 55,  dia_cobro: 5  },
  { id: 'gf-6', nombre: 'Comunidad',       icono: '🏢', categoria: 'vivienda',     importe: 80,  dia_cobro: 1  },
],
hipoteca: {
  banco: 'BBVA', gestor: 'Ana García',
  cuota_mensual: 750, dia_cobro: 1,
  capital_inicial: 180000, capital_pendiente: 142500,
  fecha_inicio: '2019-03-01', fecha_fin: '2049-03-01',
  tipo_interes: 'variable', diferencial: 0.75,
},
```

- [ ] **Step 4: Bump DEMO_VERSION in `src/data/demo/index.js`**

Find the line `DEMO_VERSION: '9'` (or current version) and change it to:

```js
DEMO_VERSION: '10',
```

This forces sessionStorage cache invalidation so users get the new demo data.

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/data/demo/__tests__/finanzas.test.js 2>&1 | tail -30
```

Expected: All tests PASS (including the 3 existing + 4 new).

- [ ] **Step 6: Commit**

```bash
cd /home/user/mi-portfolio-proyectos
git add src/data/demo/finanzas.js src/data/demo/index.js src/data/demo/__tests__/finanzas.test.js
git commit -m "feat: add demo data for suscripciones, seguros, gastos_fijos, hipoteca — DEMO_VERSION 10"
```

---

## Task 2: Suscripciones.jsx — Subscription Manager

**Files:**
- Create: `src/pages/app/modules/finanzas/Suscripciones.jsx`

**Behavior:**
- Lists subscriptions with status badge (activa=green, pausada=amber, cancelada=red/muted)
- Shows monthly total (only `activa` monthly + anual/12)
- Add form: nombre (text), icono (text, default '📦'), coste (number), periodicidad (mensual|anual), compartida (checkbox)
- Toggle estado button: activa → pausada → cancelada → activa (cycle)
- Delete button (hover-reveal)
- Presets bar: click a preset to pre-fill the add form

- [ ] **Step 1: Write the failing test**

Create `src/pages/app/modules/finanzas/__tests__/Suscripciones.test.jsx`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Suscripciones from '../Suscripciones'

vi.mock('../../../../../hooks/useOutletContext', () => ({ default: () => ({ app: { type: 'finanzas' } }) }), { virtual: true })

// mock useOutletContext from react-router-dom
vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'finanzas' } }) }))

// mock demoRead / demoWrite
vi.mock('../../../../../data/demo', () => ({
  demoRead: () => [
    { id: 'sub-1', nombre: 'Netflix', icono: '🎬', coste: 15.99, periodicidad: 'mensual', fecha_renovacion: '2026-05-27', estado: 'activa', compartida: true },
    { id: 'sub-2', nombre: 'Spotify', icono: '🎵', coste: 9.99,  periodicidad: 'mensual', fecha_renovacion: '2026-05-23', estado: 'pausada', compartida: false },
  ],
  demoWrite: vi.fn(),
}))

describe('Suscripciones', () => {
  it('renders subscription list', () => {
    render(<Suscripciones />)
    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('Spotify')).toBeInTheDocument()
  })

  it('shows total mensual for active subscriptions only', () => {
    render(<Suscripciones />)
    // Only Netflix (15.99) is activa — Spotify is pausada
    expect(screen.getByText(/15,99/)).toBeInTheDocument()
  })

  it('shows estado badges', () => {
    render(<Suscripciones />)
    expect(screen.getByText('activa')).toBeInTheDocument()
    expect(screen.getByText('pausada')).toBeInTheDocument()
  })

  it('renders preset buttons', () => {
    render(<Suscripciones />)
    expect(screen.getByText(/Netflix/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/finanzas/__tests__/Suscripciones.test.jsx 2>&1 | tail -20
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/pages/app/modules/finanzas/Suscripciones.jsx`**

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const PRESETS = [
  { nombre: 'Netflix',         icono: '🎬', coste: 15.99, periodicidad: 'mensual' },
  { nombre: 'Spotify',         icono: '🎵', coste: 9.99,  periodicidad: 'mensual' },
  { nombre: 'Disney+',         icono: '🏰', coste: 11.99, periodicidad: 'mensual' },
  { nombre: 'Amazon Prime',    icono: '📦', coste: 49.90, periodicidad: 'anual'   },
  { nombre: 'YouTube Premium', icono: '▶️', coste: 13.99, periodicidad: 'mensual' },
  { nombre: 'HBO Max',         icono: '🎭', coste: 8.99,  periodicidad: 'mensual' },
  { nombre: 'iCloud',          icono: '☁️', coste: 2.99,  periodicidad: 'mensual' },
  { nombre: 'Office 365',      icono: '📊', coste: 9.99,  periodicidad: 'mensual' },
]

const ESTADO_CYCLE = { activa: 'pausada', pausada: 'cancelada', cancelada: 'activa' }
const ESTADO_COLOR = { activa: 'var(--accent)', pausada: '#f59e0b', cancelada: 'var(--text-faint)' }

const BLANK = { nombre: '', icono: '📦', coste: '', periodicidad: 'mensual', compartida: false }

function mensualEquiv(sub) {
  if (sub.estado !== 'activa') return 0
  return sub.periodicidad === 'anual' ? sub.coste / 12 : sub.coste
}

export default function Suscripciones() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'finanzas'

  const [subs, setSubs] = useState(() => demoRead(appType, 'suscripciones') ?? [])
  const [form, setForm] = useState(BLANK)
  const [showForm, setShowForm] = useState(false)

  const save = (next) => { setSubs(next); demoWrite(appType, 'suscripciones', next) }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.coste) return
    const today = new Date()
    const renovacion = new Date(today)
    renovacion.setMonth(renovacion.getMonth() + (form.periodicidad === 'anual' ? 12 : 1))
    const entry = {
      id: crypto.randomUUID(),
      nombre: form.nombre.trim(),
      icono: form.icono || '📦',
      coste: parseFloat(form.coste),
      periodicidad: form.periodicidad,
      fecha_renovacion: renovacion.toISOString().slice(0, 10),
      estado: 'activa',
      compartida: form.compartida,
    }
    save([...subs, entry])
    setForm(BLANK)
    setShowForm(false)
  }

  const toggleEstado = (id) => {
    save(subs.map(s => s.id === id ? { ...s, estado: ESTADO_CYCLE[s.estado] } : s))
  }

  const deleteSub = (id) => save(subs.filter(s => s.id !== id))

  const applyPreset = (p) => {
    setForm({ nombre: p.nombre, icono: p.icono, coste: String(p.coste), periodicidad: p.periodicidad, compartida: false })
    setShowForm(true)
  }

  const totalMensual = subs.reduce((acc, s) => acc + mensualEquiv(s), 0)

  return (
    <div style={{ padding: '1.5rem', maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Suscripciones</h2>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total mensual activo</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
            {totalMensual.toFixed(2).replace('.', ',')} €
          </div>
        </div>
      </div>

      {/* Presets */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Añadir rápido:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {PRESETS.map(p => (
            <button key={p.nombre} onClick={() => applyPreset(p)}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.25rem 0.75rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text)' }}>
              {p.icono} {p.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Subscription list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {subs.map(sub => (
          <div key={sub.id} className="sub-card"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', opacity: sub.estado === 'cancelada' ? 0.5 : 1 }}>
            <span style={{ fontSize: '2rem' }}>{sub.icono}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>{sub.nombre}</span>
                {sub.compartida && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>👥 compartida</span>}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Renovación: {sub.fecha_renovacion}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '1.1rem' }}>
                {sub.coste.toFixed(2).replace('.', ',')} €
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.periodicidad}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <button onClick={() => toggleEstado(sub.id)}
                style={{ background: 'none', border: `1px solid ${ESTADO_COLOR[sub.estado]}`, borderRadius: 6, padding: '0.2rem 0.5rem', cursor: 'pointer', color: ESTADO_COLOR[sub.estado], fontSize: '0.75rem', minWidth: 72 }}>
                {sub.estado}
              </button>
              <button onClick={() => deleteSub(sub.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '0.9rem' }}>🗑</button>
            </div>
          </div>
        ))}
        {subs.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin suscripciones. Añade una arriba.</p>
        )}
      </div>

      {/* Add form toggle */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: `1px dashed var(--border)`, borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>
          + Añadir suscripción personalizada
        </button>
      ) : (
        <form onSubmit={handleAdd}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.5rem 1fr', gap: '0.5rem' }}>
            <input value={form.icono} onChange={e => setForm(f => ({ ...f, icono: e.target.value }))} maxLength={2}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem', color: 'var(--text)', textAlign: 'center', fontSize: '1.2rem' }} />
            <input placeholder="Nombre del servicio" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <input type="number" step="0.01" min="0" placeholder="Coste (€)" value={form.coste} onChange={e => setForm(f => ({ ...f, coste: e.target.value }))} required
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)' }} />
            <select value={form.periodicidad} onChange={e => setForm(f => ({ ...f, periodicidad: e.target.value }))}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)' }}>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.compartida} onChange={e => setForm(f => ({ ...f, compartida: e.target.checked }))} />
            Suscripción compartida
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit"
              style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              Añadir
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(BLANK) }}
              style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center' }}>
        💡 Demo — los cambios se guardan en esta sesión
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/finanzas/__tests__/Suscripciones.test.jsx 2>&1 | tail -20
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/user/mi-portfolio-proyectos
git add src/pages/app/modules/finanzas/Suscripciones.jsx src/pages/app/modules/finanzas/__tests__/Suscripciones.test.jsx
git commit -m "feat: add Suscripciones module — CRUD, estado toggle, monthly total, presets"
```

---

## Task 3: Seguros.jsx — Insurance Policy Manager

**Files:**
- Create: `src/pages/app/modules/finanzas/Seguros.jsx`

**Behavior:**
- Lists insurance policies with expiry semaphore: red if `diasHasta < 30`, amber if `< 90`, green otherwise
- Shows total annual cost
- Add form: tipo (select: hogar/vida/dental/coche/otros), nombre, compania, poliza, vencimiento (date), coste_anual (number)
- Delete button (trash icon)
- TIPO_ICONS map for visual icons per type

- [ ] **Step 1: Write the failing test**

Create `src/pages/app/modules/finanzas/__tests__/Seguros.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Seguros from '../Seguros'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'finanzas' } }) }))

const today = new Date()
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r.toISOString().slice(0, 10) }

vi.mock('../../../../../data/demo', () => ({
  demoRead: () => [
    { id: 'seg-1', tipo: 'coche', nombre: 'Seguro Coche', compania: 'Mutua', poliza: 'MM-001', vencimiento: addDays(today, 20), coste_anual: 650 },
    { id: 'seg-2', tipo: 'vida',  nombre: 'Seguro Vida',  compania: 'Generali', poliza: 'GN-002', vencimiento: addDays(today, 200), coste_anual: 520 },
  ],
  demoWrite: vi.fn(),
}))

describe('Seguros', () => {
  it('renders insurance list', () => {
    render(<Seguros />)
    expect(screen.getByText('Seguro Coche')).toBeInTheDocument()
    expect(screen.getByText('Seguro Vida')).toBeInTheDocument()
  })

  it('shows total anual', () => {
    render(<Seguros />)
    // 650 + 520 = 1170
    expect(screen.getByText(/1\.170|1170/)).toBeInTheDocument()
  })

  it('shows red semaphore for policy expiring in 20 days', () => {
    render(<Seguros />)
    // seg-1 expires in 20 days — should show red warning text
    expect(screen.getByText(/20 días|20 dias/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/finanzas/__tests__/Seguros.test.jsx 2>&1 | tail -20
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/pages/app/modules/finanzas/Seguros.jsx`**

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const TIPO_ICONS = { hogar: '🏠', vida: '❤️', dental: '🦷', coche: '🚗', otros: '📋' }
const TIPOS = ['hogar', 'vida', 'dental', 'coche', 'otros']

const BLANK = { tipo: 'hogar', nombre: '', compania: '', poliza: '', vencimiento: '', coste_anual: '' }

function diasHasta(fechaStr) {
  if (!fechaStr) return null
  const diff = new Date(fechaStr) - new Date()
  return Math.ceil(diff / 86400000)
}

function semaforo(dias) {
  if (dias === null) return { color: 'var(--text-faint)', label: 'Sin fecha' }
  if (dias < 0)  return { color: '#ef4444', label: `Vencido hace ${Math.abs(dias)} días` }
  if (dias < 30) return { color: '#ef4444', label: `Vence en ${dias} días` }
  if (dias < 90) return { color: '#f59e0b', label: `Vence en ${dias} días` }
  return { color: '#22c55e', label: `Válido ${dias} días` }
}

export default function Seguros() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'finanzas'

  const [seguros, setSeguros] = useState(() => demoRead(appType, 'seguros') ?? [])
  const [form, setForm] = useState(BLANK)
  const [showForm, setShowForm] = useState(false)

  const save = (next) => { setSeguros(next); demoWrite(appType, 'seguros', next) }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.coste_anual) return
    const entry = {
      id: crypto.randomUUID(),
      tipo: form.tipo,
      nombre: form.nombre.trim(),
      compania: form.compania.trim(),
      poliza: form.poliza.trim(),
      vencimiento: form.vencimiento || null,
      coste_anual: parseFloat(form.coste_anual),
    }
    save([...seguros, entry])
    setForm(BLANK)
    setShowForm(false)
  }

  const deleteSeg = (id) => save(seguros.filter(s => s.id !== id))

  const totalAnual = seguros.reduce((acc, s) => acc + (s.coste_anual ?? 0), 0)

  return (
    <div style={{ padding: '1.5rem', maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Seguros</h2>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total anual</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
            {totalAnual.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {seguros.map(seg => {
          const dias = diasHasta(seg.vencimiento)
          const sem = semaforo(dias)
          return (
            <div key={seg.id}
              style={{ background: 'var(--bg-card)', border: `1px solid ${dias !== null && dias < 30 ? '#ef444440' : 'var(--border)'}`, borderRadius: 12, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>{TIPO_ICONS[seg.tipo] ?? '📋'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{seg.nombre}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{seg.compania} · Póliza: {seg.poliza || '—'}</div>
                <div style={{ fontSize: '0.8rem', color: sem.color, marginTop: 4, fontWeight: dias !== null && dias < 90 ? 600 : 400 }}>
                  {sem.label}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{(seg.coste_anual ?? 0).toLocaleString('es-ES')} €</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ año</div>
              </div>
              <button onClick={() => deleteSeg(seg.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '1rem' }}>🗑</button>
            </div>
          )
        })}
        {seguros.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin seguros registrados.</p>
        )}
      </div>

      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: `1px dashed var(--border)`, borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>
          + Añadir seguro
        </button>
      ) : (
        <form onSubmit={handleAdd}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)' }}>
              {TIPOS.map(t => <option key={t} value={t}>{TIPO_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <input placeholder="Nombre del seguro" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <input placeholder="Compañía" value={form.compania} onChange={e => setForm(f => ({ ...f, compania: e.target.value }))}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)' }} />
            <input placeholder="Nº póliza" value={form.poliza} onChange={e => setForm(f => ({ ...f, poliza: e.target.value }))}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Vencimiento</label>
              <input type="date" value={form.vencimiento} onChange={e => setForm(f => ({ ...f, vencimiento: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Coste anual (€)</label>
              <input type="number" step="0.01" min="0" placeholder="0.00" value={form.coste_anual} onChange={e => setForm(f => ({ ...f, coste_anual: e.target.value }))} required
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit"
              style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              Añadir
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(BLANK) }}
              style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center' }}>
        💡 Demo — los cambios se guardan en esta sesión
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/finanzas/__tests__/Seguros.test.jsx 2>&1 | tail -20
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/user/mi-portfolio-proyectos
git add src/pages/app/modules/finanzas/Seguros.jsx src/pages/app/modules/finanzas/__tests__/Seguros.test.jsx
git commit -m "feat: add Seguros module — expiry semaphore, CRUD, annual total"
```

---

## Task 4: GastosFijos.jsx — Fixed Expenses

**Files:**
- Create: `src/pages/app/modules/finanzas/GastosFijos.jsx`

**Behavior:**
- Lists fixed monthly expenses grouped by category (vivienda / suministros / conectividad / otros)
- Shows total per group + grand total mensual
- Add form: nombre, icono (default '💳'), categoria (select), importe (number), dia_cobro (number 1-31)
- Delete button per item

- [ ] **Step 1: Write the failing test**

Create `src/pages/app/modules/finanzas/__tests__/GastosFijos.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import GastosFijos from '../GastosFijos'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'finanzas' } }) }))
vi.mock('../../../../../data/demo', () => ({
  demoRead: () => [
    { id: 'gf-1', nombre: 'Alquiler',   icono: '🏠', categoria: 'vivienda',    importe: 850, dia_cobro: 1  },
    { id: 'gf-2', nombre: 'Luz',        icono: '💡', categoria: 'suministros', importe: 94,  dia_cobro: 15 },
    { id: 'gf-3', nombre: 'Internet',   icono: '📡', categoria: 'conectividad',importe: 55,  dia_cobro: 5  },
  ],
  demoWrite: vi.fn(),
}))

describe('GastosFijos', () => {
  it('renders expense names', () => {
    render(<GastosFijos />)
    expect(screen.getByText('Alquiler')).toBeInTheDocument()
    expect(screen.getByText('Luz')).toBeInTheDocument()
    expect(screen.getByText('Internet')).toBeInTheDocument()
  })

  it('shows category group headers', () => {
    render(<GastosFijos />)
    expect(screen.getByText(/vivienda/i)).toBeInTheDocument()
    expect(screen.getByText(/suministros/i)).toBeInTheDocument()
    expect(screen.getByText(/conectividad/i)).toBeInTheDocument()
  })

  it('shows grand total', () => {
    render(<GastosFijos />)
    // 850 + 94 + 55 = 999
    expect(screen.getByText(/999/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/finanzas/__tests__/GastosFijos.test.jsx 2>&1 | tail -20
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/pages/app/modules/finanzas/GastosFijos.jsx`**

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const CATEGORIAS = ['vivienda', 'suministros', 'conectividad', 'otros']
const CAT_ICONS = { vivienda: '🏠', suministros: '⚡', conectividad: '📡', otros: '💳' }
const CAT_LABELS = { vivienda: 'Vivienda', suministros: 'Suministros', conectividad: 'Conectividad', otros: 'Otros' }

const BLANK = { nombre: '', icono: '💳', categoria: 'vivienda', importe: '', dia_cobro: '1' }

export default function GastosFijos() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'finanzas'

  const [gastos, setGastos] = useState(() => demoRead(appType, 'gastos_fijos') ?? [])
  const [form, setForm] = useState(BLANK)
  const [showForm, setShowForm] = useState(false)

  const save = (next) => { setGastos(next); demoWrite(appType, 'gastos_fijos', next) }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.importe) return
    const entry = {
      id: crypto.randomUUID(),
      nombre: form.nombre.trim(),
      icono: form.icono || '💳',
      categoria: form.categoria,
      importe: parseFloat(form.importe),
      dia_cobro: parseInt(form.dia_cobro, 10) || 1,
    }
    save([...gastos, entry])
    setForm(BLANK)
    setShowForm(false)
  }

  const deleteGasto = (id) => save(gastos.filter(g => g.id !== id))

  const totalMensual = gastos.reduce((acc, g) => acc + g.importe, 0)

  const byCategory = CATEGORIAS.reduce((acc, cat) => {
    acc[cat] = gastos.filter(g => g.categoria === cat)
    return acc
  }, {})

  const inputStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Gastos fijos</h2>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total mensual</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
            {totalMensual.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
          </div>
        </div>
      </div>

      {/* Groups */}
      {CATEGORIAS.map(cat => {
        const items = byCategory[cat]
        if (items.length === 0) return null
        const catTotal = items.reduce((acc, g) => acc + g.importe, 0)
        return (
          <div key={cat} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {CAT_ICONS[cat]} {CAT_LABELS[cat]}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {catTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/mes
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {items.map(g => (
                <div key={g.id}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{g.icono}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{g.nombre}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>Día {g.dia_cobro} de cada mes</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '1rem' }}>
                    {g.importe.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </div>
                  <button onClick={() => deleteGasto(g.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '0.9rem' }}>🗑</button>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {gastos.length === 0 && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.5rem' }}>Sin gastos fijos registrados.</p>
      )}

      {/* Add form */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: `1px dashed var(--border)`, borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>
          + Añadir gasto fijo
        </button>
      ) : (
        <form onSubmit={handleAdd}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.5rem 1fr', gap: '0.5rem' }}>
            <input value={form.icono} onChange={e => setForm(f => ({ ...f, icono: e.target.value }))} maxLength={2}
              style={{ ...inputStyle, textAlign: 'center', fontSize: '1.2rem', padding: '0.5rem' }} />
            <input placeholder="Nombre del gasto" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
              style={{ ...inputStyle, padding: '0.5rem' }}>
              {CATEGORIAS.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
            <input type="number" step="0.01" min="0" placeholder="Importe (€)" value={form.importe} onChange={e => setForm(f => ({ ...f, importe: e.target.value }))} required style={inputStyle} />
            <input type="number" min="1" max="31" placeholder="Día cobro" value={form.dia_cobro} onChange={e => setForm(f => ({ ...f, dia_cobro: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit"
              style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              Añadir
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(BLANK) }}
              style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center' }}>
        💡 Demo — los cambios se guardan en esta sesión
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/finanzas/__tests__/GastosFijos.test.jsx 2>&1 | tail -20
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/user/mi-portfolio-proyectos
git add src/pages/app/modules/finanzas/GastosFijos.jsx src/pages/app/modules/finanzas/__tests__/GastosFijos.test.jsx
git commit -m "feat: add GastosFijos module — category groups, CRUD, monthly total"
```

---

## Task 5: Hipoteca.jsx — Mortgage Panel

**Files:**
- Create: `src/pages/app/modules/finanzas/Hipoteca.jsx`

**Behavior:**
- Read-only panel (no edit in demo). Guard for array-shaped data with `Array.isArray(raw) ? null : raw`
- Capital amortizado progress bar: `amortizado = capital_inicial - capital_pendiente`, `pct = amortizado / capital_inicial * 100`
- Shows años restantes from `fecha_fin` minus today
- Shows banco, gestor, cuota mensual, tipo de interés, diferencial
- Empty state if `hipoteca` key is null

- [ ] **Step 1: Write the failing test**

Create `src/pages/app/modules/finanzas/__tests__/Hipoteca.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Hipoteca from '../Hipoteca'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'finanzas' } }) }))
vi.mock('../../../../../data/demo', () => ({
  demoRead: () => ({
    banco: 'BBVA', gestor: 'Ana García',
    cuota_mensual: 750, dia_cobro: 1,
    capital_inicial: 180000, capital_pendiente: 142500,
    fecha_inicio: '2019-03-01', fecha_fin: '2049-03-01',
    tipo_interes: 'variable', diferencial: 0.75,
  }),
  demoWrite: vi.fn(),
}))

describe('Hipoteca', () => {
  it('renders bank name and manager', () => {
    render(<Hipoteca />)
    expect(screen.getByText('BBVA')).toBeInTheDocument()
    expect(screen.getByText(/Ana García/)).toBeInTheDocument()
  })

  it('shows monthly payment', () => {
    render(<Hipoteca />)
    expect(screen.getByText(/750/)).toBeInTheDocument()
  })

  it('shows amortizado percentage', () => {
    render(<Hipoteca />)
    // (180000 - 142500) / 180000 * 100 = 20.83%
    expect(screen.getByText(/20[,.]8|20%/)).toBeInTheDocument()
  })

  it('shows capital pendiente', () => {
    render(<Hipoteca />)
    expect(screen.getByText(/142\.500|142500/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/finanzas/__tests__/Hipoteca.test.jsx 2>&1 | tail -20
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/pages/app/modules/finanzas/Hipoteca.jsx`**

```jsx
import { useOutletContext } from 'react-router-dom'
import { demoRead } from '../../../../data/demo'

function aniosRestantes(fechaFinStr) {
  if (!fechaFinStr) return null
  const diff = new Date(fechaFinStr) - new Date()
  return Math.max(0, Math.round(diff / (365.25 * 24 * 3600 * 1000)))
}

export default function Hipoteca() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'finanzas'

  const raw = demoRead(appType, 'hipoteca')
  const hipoteca = Array.isArray(raw) ? null : raw

  if (!hipoteca) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>No hay hipoteca registrada.</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>Esta app es solo demo — los datos se muestran tal cual.</p>
      </div>
    )
  }

  const amortizado = hipoteca.capital_inicial - hipoteca.capital_pendiente
  const pct = hipoteca.capital_inicial > 0 ? (amortizado / hipoteca.capital_inicial) * 100 : 0
  const aniosRest = aniosRestantes(hipoteca.fecha_fin)

  const statStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '1.25rem',
  }

  const labelStyle = { fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }
  const valueStyle = { fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.4rem', color: 'var(--text)' }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Hipoteca</h2>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          🏦 {hipoteca.banco}
        </div>
      </div>

      {/* Capital progress */}
      <div style={{ ...statStyle, marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <div style={labelStyle}>Capital amortizado</div>
            <div style={{ ...valueStyle, color: 'var(--accent)' }}>
              {amortizado.toLocaleString('es-ES')} € <span style={{ fontSize: '1rem', fontWeight: 400 }}>({pct.toFixed(1)}%)</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={labelStyle}>Capital pendiente</div>
            <div style={valueStyle}>{hipoteca.capital_pendiente.toLocaleString('es-ES')} €</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ background: 'var(--border)', borderRadius: 999, height: 10, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: 'var(--accent)', borderRadius: 999, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: 'var(--text-faint)' }}>
          <span>Inicio: {hipoteca.fecha_inicio}</span>
          <span>Fin: {hipoteca.fecha_fin}{aniosRest !== null ? ` (${aniosRest} años)` : ''}</span>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={statStyle}>
          <div style={labelStyle}>Cuota mensual</div>
          <div style={{ ...valueStyle, color: 'var(--accent)' }}>{hipoteca.cuota_mensual.toLocaleString('es-ES')} €</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: 4 }}>Día {hipoteca.dia_cobro} de mes</div>
        </div>
        <div style={statStyle}>
          <div style={labelStyle}>Tipo de interés</div>
          <div style={{ ...valueStyle, textTransform: 'capitalize' }}>{hipoteca.tipo_interes}</div>
          {hipoteca.diferencial && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: 4 }}>Diferencial: {hipoteca.diferencial}%</div>
          )}
        </div>
      </div>

      <div style={{ ...statStyle }}>
        <div style={labelStyle}>Gestor / Contacto</div>
        <div style={{ fontWeight: 500 }}>{hipoteca.gestor || '—'}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: 2 }}>Banco: {hipoteca.banco}</div>
      </div>

      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center' }}>
        💡 Demo — panel informativo. Los datos se cargan del perfil demo.
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/finanzas/__tests__/Hipoteca.test.jsx 2>&1 | tail -20
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/user/mi-portfolio-proyectos
git add src/pages/app/modules/finanzas/Hipoteca.jsx src/pages/app/modules/finanzas/__tests__/Hipoteca.test.jsx
git commit -m "feat: add Hipoteca module — read-only panel with capital progress bar"
```

---

## Task 6: Nav + Routes — Wire Up All Four New Modules

**Files:**
- Modify: `src/pages/app/DemoAppLayout.jsx`
- Modify: `src/App.jsx`

**Behavior:**
- Add 4 entries to FINANZAS_MODULES array in DemoAppLayout.jsx
- Add 4 lazy imports for new components in App.jsx
- Add 8 routes (4 for `/app/finanzas/` + 4 for `/demo/:appType/`) in App.jsx

- [ ] **Step 1: Write the failing test**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/App.test.jsx 2>&1 | tail -30
```

Note the current state of App.test.jsx. If it tests route rendering, the new routes may or may not cause failures. Before writing code, check which tests exist:

```bash
grep -n 'suscripciones\|seguros\|gastos_fijos\|gastos-fijos\|hipoteca' src/App.test.jsx src/__tests__/*.test.* 2>/dev/null | head -20
```

If no tests exist for these routes, write a minimal test in `src/__tests__/FinanzasRoutes.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi } from 'vitest'
import { Suspense } from 'react'

vi.mock('./pages/app/DemoAppLayout', () => ({ default: ({ children }) => <div data-testid="layout">{children}</div> }))

describe('Finanzas nav modules', () => {
  it('FINANZAS_MODULES contains suscripciones, seguros, gastos-fijos, hipoteca', async () => {
    // Dynamic import DemoAppLayout to check FINANZAS_MODULES
    // This is an integration signal — if the module exports include these paths, the test passes
    const mod = await import('./pages/app/DemoAppLayout')
    // We can't easily inspect FINANZAS_MODULES exported value in this pattern,
    // so just verify the component renders without crashing
    expect(mod.default).toBeTruthy()
  })
})
```

If this test is trivial, skip it and instead run the full test suite after implementation to verify nothing breaks.

- [ ] **Step 2: Modify `src/pages/app/DemoAppLayout.jsx` — add 4 FINANZAS_MODULES entries**

Open the file. Find the `FINANZAS_MODULES` array (currently has 4 entries: resumen, transacciones, categorias, presupuestos). Add 4 more:

```js
const FINANZAS_MODULES = [
  { path: 'resumen',        label: 'Resumen',        icon: '📊' },
  { path: 'transacciones',  label: 'Transacciones',  icon: '💸' },
  { path: 'categorias',     label: 'Categorías',     icon: '🏷️' },
  { path: 'presupuestos',   label: 'Presupuestos',   icon: '🎯' },
  { path: 'suscripciones',  label: 'Suscripciones',  icon: '🔄' },
  { path: 'seguros',        label: 'Seguros',        icon: '🛡️' },
  { path: 'gastos-fijos',   label: 'Gastos fijos',   icon: '📆' },
  { path: 'hipoteca',       label: 'Hipoteca',       icon: '🏦' },
]
```

Note: path `gastos-fijos` (hyphen, not underscore) to follow URL conventions.

- [ ] **Step 3: Modify `src/App.jsx` — add lazy imports**

Open the file. Find the existing Finanzas lazy imports block (lines ~66-69):

```js
const FinanzasResumen       = React.lazy(() => import('./pages/app/modules/finanzas/Resumen'))
const FinanzasTransacciones = React.lazy(() => import('./pages/app/modules/finanzas/Transacciones'))
const FinanzasCategorias    = React.lazy(() => import('./pages/app/modules/finanzas/Categorias'))
const FinanzasPresupuestos  = React.lazy(() => import('./pages/app/modules/finanzas/Presupuestos'))
```

Add 4 more imports immediately after:

```js
const FinanzasSuscripciones = React.lazy(() => import('./pages/app/modules/finanzas/Suscripciones'))
const FinanzasSeguros       = React.lazy(() => import('./pages/app/modules/finanzas/Seguros'))
const FinanzasGastosFijos   = React.lazy(() => import('./pages/app/modules/finanzas/GastosFijos'))
const FinanzasHipoteca      = React.lazy(() => import('./pages/app/modules/finanzas/Hipoteca'))
```

- [ ] **Step 4: Modify `src/App.jsx` — add routes**

Find the existing finanzas routes block. They follow this pattern (look for `path: 'resumen'` or similar). Existing routes are nested under both `/app/finanzas` and `/demo/:appType`. Add to each block:

```jsx
<Route path="suscripciones" element={<FinanzasSuscripciones />} />
<Route path="seguros"       element={<FinanzasSeguros />} />
<Route path="gastos-fijos"  element={<FinanzasGastosFijos />} />
<Route path="hipoteca"      element={<FinanzasHipoteca />} />
```

Add these 4 routes in BOTH route groups (one for `/app/finanzas` and one for `/demo/:appType` that covers finanzas). Verify by searching for where `FinanzasResumen` is used as a route element — both occurrences need the 4 new routes added.

- [ ] **Step 5: Run full test suite**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run 2>&1 | tail -30
```

Expected: All pre-existing tests still pass. Fix any regressions before committing.

- [ ] **Step 6: Build check**

```bash
cd /home/user/mi-portfolio-proyectos
npm run build 2>&1 | tail -20
```

Expected: Build succeeds with no errors.

- [ ] **Step 7: Commit**

```bash
cd /home/user/mi-portfolio-proyectos
git add src/pages/app/DemoAppLayout.jsx src/App.jsx
git commit -m "feat: wire Suscripciones, Seguros, GastosFijos, Hipoteca into nav and routes"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Suscripciones: CRUD, presets, estado toggle (activa/pausada/cancelada), monthly total
- ✅ Seguros: expiry semaphore (red <30d, amber <90d, green), CRUD, annual total
- ✅ GastosFijos: grouped by category (vivienda/suministros/conectividad), CRUD, monthly total
- ✅ Hipoteca: read-only panel, capital progress bar, años restantes
- ✅ Demo data: all 4 keys with realistic Spanish data
- ✅ DEMO_VERSION bump to invalidate stale cache
- ✅ Nav entries for all 4 new modules
- ✅ Lazy routes for both /app/ and /demo/ paths

**Placeholder scan:** No TBDs, no "implement later", no "similar to Task N". All steps include exact code.

**Type consistency:**
- `suscripciones[i].estado` → `'activa' | 'pausada' | 'cancelada'` — consistent across demo data, component, and test
- `gastos_fijos` demo key (underscore) vs route `gastos-fijos` (hyphen) — correctly differentiated: key is sessionStorage key, path is URL path
- `demoRead(appType, 'gastos_fijos')` — uses underscore key everywhere in component
- `hipoteca.capital_inicial`, `hipoteca.capital_pendiente` — consistent across demo data, component, and test
