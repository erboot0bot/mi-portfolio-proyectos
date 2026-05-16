# Fase 10: Calendar Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users push relevant dates from existing modules (Menu, ShoppingList, Limpieza, Mantenimiento, and all Ocio sub-modules) directly into their app's Calendar view, and extend Menu with configurable meal hours and recipe prep-time.

**Architecture:** The Calendar module already reads from `demo_[appType]_events` (sessionStorage). All we need is a thin `addCalendarEvent(appType, event)` utility that appends to that same store. Each module gets a small "📅 Añadir al calendario" button that opens a minimal confirmation/config modal before writing the event. No new routes, no new hooks — pure progressive enhancement.

**Tech Stack:** React 18, Vite, React Router v6, Vitest + RTL, `demoRead`/`demoWrite` (sessionStorage), H3nky design tokens (`var(--accent)`, `var(--bg-card)`, `var(--border)`, `var(--text)`, `var(--text-muted)`, `var(--text-faint)`)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/utils/calendarUtils.js` | **Create** | `addCalendarEvent(appType, event)` helper; `removeCalendarEvent(appType, id)` helper |
| `src/utils/__tests__/calendarUtils.test.js` | **Create** | Unit tests for the two helpers |
| `src/pages/app/modules/Menu.jsx` | **Modify** | Configurable meal hours (user prefs stored in demo); `prep_time` + `batch_days` fields on recipes; show prep+batch info on meal cards |
| `src/pages/app/modules/__tests__/Menu.calendarUtils.test.jsx` | **Create** | Tests for the new Menu calendar behaviour |
| `src/pages/app/modules/ShoppingList.jsx` | **Modify** | "🛒 Planificar compra" button → modal to pick date/time → writes `shopping_trip` event |
| `src/pages/app/modules/__tests__/ShoppingList.calendar.test.jsx` | **Create** | Tests for shopping-trip calendar integration |
| `src/pages/app/modules/Limpieza.jsx` | **Modify** | "Roomba" section: recurring schedule per weekday(s)+hour → writes `roomba` events; "Personal de limpieza" section: pick dates → writes `cleaner_visit` events |
| `src/pages/app/modules/__tests__/Limpieza.calendar.test.jsx` | **Create** | Tests for Roomba schedule and cleaner-visit calendar writes |
| `src/pages/app/modules/vehiculo/Mantenimiento.jsx` | **Modify** | "Añadir al calendario" checkbox when `next_date` is filled → writes `vehicle_maintenance` event |
| `src/pages/app/modules/vehiculo/__tests__/Mantenimiento.calendar.test.jsx` | **Create** | Tests for maintenance calendar integration |
| `src/pages/app/modules/ocio/Eventos.jsx` | **Modify** | "📅" icon button per event card → writes `ocio_event` calendar entry |
| `src/pages/app/modules/ocio/Viajes.jsx` | **Modify** | "📅 Fechas al calendario" in detail view → writes two all-day events (check-in + check-out) |
| `src/pages/app/modules/ocio/Deportes.jsx` | **Modify** | "📅" button per upcoming match → writes `match` event |
| `src/pages/app/modules/ocio/__tests__/OcioCalendar.test.jsx` | **Create** | Tests for Eventos, Viajes, Deportes calendar writes |
| `src/pages/app/modules/finanzas/Suscripciones.jsx` | **Modify** | "📅" button per sub → writes monthly/annual `subscription_renewal` event with correct recurrence |
| `src/pages/app/modules/finanzas/Seguros.jsx` | **Modify** | "📅" button on policy card → writes `insurance_expiry` event on vencimiento date |
| `src/pages/app/modules/finanzas/__tests__/FinanzasCalendar.test.jsx` | **Create** | Tests for subscription and insurance calendar writes |

---

## Task 1: `addCalendarEvent` utility

**Files:**
- Create: `src/utils/calendarUtils.js`
- Create: `src/utils/__tests__/calendarUtils.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// src/utils/__tests__/calendarUtils.test.js
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockAll = []
const demoRead = vi.fn((_t, _k) => mockAll)
const demoWrite = vi.fn()

vi.mock('../../data/demo/index.js', () => ({ demoRead, demoWrite }))

// import AFTER mock is set up
const { addCalendarEvent, removeCalendarEvent } = await import('../calendarUtils.js')

describe('addCalendarEvent', () => {
  beforeEach(() => { demoRead.mockReturnValue([]); demoWrite.mockClear() })

  it('writes a new event to demo_[appType]_events', () => {
    addCalendarEvent('hogar', { event_type: 'shopping_trip', title: 'Mercadona', start_time: '2026-06-01T10:00:00.000Z' })
    expect(demoWrite).toHaveBeenCalledWith('hogar', 'events', expect.arrayContaining([
      expect.objectContaining({ event_type: 'shopping_trip', title: 'Mercadona' })
    ]))
  })

  it('preserves existing events', () => {
    const existing = [{ id: 'old', event_type: 'meal', title: 'Desayuno', start_time: '2026-06-01T08:00:00.000Z' }]
    demoRead.mockReturnValue(existing)
    addCalendarEvent('hogar', { event_type: 'shopping_trip', title: 'Lidl', start_time: '2026-06-02T10:00:00.000Z' })
    const written = demoWrite.mock.calls[0][2]
    expect(written).toHaveLength(2)
    expect(written[0].id).toBe('old')
  })

  it('returns the new event with an id', () => {
    const ev = addCalendarEvent('ocio', { event_type: 'match', title: 'vs Real Madrid', start_time: '2026-06-10T20:00:00.000Z' })
    expect(ev.id).toBeTruthy()
    expect(ev.event_type).toBe('match')
  })

  it('applies sensible defaults for optional fields', () => {
    const ev = addCalendarEvent('hogar', { event_type: 'shopping_trip', title: 'Mercadona', start_time: '2026-06-01T10:00:00.000Z' })
    expect(ev.recurrence).toBe('none')
    expect(ev.all_day).toBe(false)
    expect(ev.color).toBeTruthy()
  })
})

describe('removeCalendarEvent', () => {
  it('removes an event by id', () => {
    const existing = [
      { id: 'a', event_type: 'match', title: 'vs Barça', start_time: '2026-06-01T20:00:00.000Z' },
      { id: 'b', event_type: 'match', title: 'vs Atlético', start_time: '2026-06-08T20:00:00.000Z' },
    ]
    demoRead.mockReturnValue(existing)
    removeCalendarEvent('ocio', 'a')
    expect(demoWrite).toHaveBeenCalledWith('ocio', 'events', [existing[1]])
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/utils/__tests__/calendarUtils.test.js
```
Expected: FAIL — `Cannot find module '../calendarUtils.js'`

- [ ] **Step 3: Implement the utility**

```js
// src/utils/calendarUtils.js
import { demoRead, demoWrite } from '../data/demo/index.js'

const EVENT_COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#ec4899', '#f59e0b']
const COLOR_BY_TYPE = {
  shopping_trip:        '#10b981',
  roomba:               '#8b5cf6',
  cleaner_visit:        '#3b82f6',
  vehicle_maintenance:  '#f59e0b',
  match:                '#ef4444',
  ocio_event:           '#ec4899',
  travel_checkin:       '#3b82f6',
  travel_checkout:      '#f97316',
  subscription_renewal: '#8b5cf6',
  insurance_expiry:     '#ef4444',
}

export function addCalendarEvent(appType, event) {
  const all = demoRead(appType, 'events') ?? []
  const newEvent = {
    recurrence: 'none',
    all_day: false,
    color: COLOR_BY_TYPE[event.event_type] ?? EVENT_COLORS[0],
    ...event,
    id: crypto.randomUUID(),
    app_id: `demo-${appType}`,
    created_at: new Date().toISOString(),
  }
  demoWrite(appType, 'events', [...all, newEvent])
  return newEvent
}

export function removeCalendarEvent(appType, id) {
  const all = demoRead(appType, 'events') ?? []
  demoWrite(appType, 'events', all.filter(e => e.id !== id))
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run src/utils/__tests__/calendarUtils.test.js
```
Expected: 6 tests, all green.

- [ ] **Step 5: Commit**

```bash
git add src/utils/calendarUtils.js src/utils/__tests__/calendarUtils.test.js
git commit -m "feat: add addCalendarEvent/removeCalendarEvent utilities"
```

---

## Task 2: Menu — Configurable meal hours + recipe prep_time

The Menu module hardcodes meal hours (`desayuno:8, almuerzo:11, comida:14, cena:21`). The user wants to configure those per their lifestyle. We also add `prep_time` (minutes) and `batch_days` (how many days this meal covers) to recipes so the weekly view can show cooking effort.

**Files:**
- Modify: `src/pages/app/modules/Menu.jsx`
- Create: `src/pages/app/modules/__tests__/Menu.calendarUtils.test.jsx`

**Data stored:** `demoWrite(appType, 'meal_prefs', { desayuno: 8, almuerzo: 11, comida: 14, cena: 21 })` — simple key→hour map.

- [ ] **Step 1: Write the failing tests**

```jsx
// src/pages/app/modules/__tests__/Menu.calendarUtils.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Menu from '../Menu'

vi.mock('react-router-dom', () => ({
  useOutletContext: () => ({ app: { id: 'demo-hogar', type: 'hogar' }, modules: [] }),
}))
vi.mock('../../../../contexts/ModeContext', () => ({ useMode: () => ({ mode: 'demo' }) }))
vi.mock('../../../../hooks/usePWAManifest', () => ({ usePWAManifest: () => {} }))

const demoWrite = vi.fn()
const demoRead  = vi.fn((_t, key) => {
  if (key === 'meal_prefs') return { desayuno: 7, almuerzo: 10, comida: 13, cena: 20 }
  if (key === 'events')  return []
  if (key === 'recipes') return []
  return {}
})

vi.mock('../../../../data/demo/index.js', () => ({ demoRead, demoWrite }))
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return { ...actual }
})
vi.mock('date-fns/locale', async () => {
  const actual = await vi.importActual('date-fns/locale')
  return { ...actual }
})
vi.mock('../../../../utils/menuTransformers', () => ({
  menuEventFromDb: e => e,
  menuEventToDb:   e => e,
}))
vi.mock('../../../../lib/supabase', () => ({ supabase: { from: () => ({ select: () => ({ eq: () => ({ then: () => {} }) }) }) } }))

describe('Menu — meal prefs', () => {
  it('reads meal_prefs from demo store', () => {
    render(<Menu />)
    expect(demoRead).toHaveBeenCalledWith('hogar', 'meal_prefs')
  })

  it('shows ⚙️ Horarios button', () => {
    render(<Menu />)
    expect(screen.getByTitle(/horarios/i)).toBeInTheDocument()
  })

  it('opens horarios modal and shows hour inputs', () => {
    render(<Menu />)
    fireEvent.click(screen.getByTitle(/horarios/i))
    expect(screen.getByLabelText(/desayuno/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/comida/i)).toBeInTheDocument()
  })

  it('saves updated hours to demo store', () => {
    render(<Menu />)
    fireEvent.click(screen.getByTitle(/horarios/i))
    const input = screen.getByLabelText(/comida/i)
    fireEvent.change(input, { target: { value: '14' } })
    fireEvent.click(screen.getByText(/guardar/i))
    expect(demoWrite).toHaveBeenCalledWith('hogar', 'meal_prefs', expect.objectContaining({ comida: 14 }))
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/pages/app/modules/__tests__/Menu.calendarUtils.test.jsx
```
Expected: FAIL — no ⚙️ Horarios button exists yet.

- [ ] **Step 3: Add meal_prefs state and modal to Menu.jsx**

At the top of `Menu()`, add after the existing `const [generating, setGenerating] = useState(false)` line:

```jsx
// ── Meal preferences (configurable hours) ────────────────────────
const DEFAULT_PREFS = { desayuno: 8, almuerzo: 11, comida: 14, cena: 21 }
const [mealPrefs, setMealPrefs] = useState(() => ({
  ...DEFAULT_PREFS,
  ...(mode === 'demo' ? (demoRead(appType, 'meal_prefs') ?? {}) : {}),
}))
const [showHorariosModal, setShowHorariosModal] = useState(false)
const [prefsForm, setPrefsForm] = useState(mealPrefs)

function saveMealPrefs() {
  setMealPrefs(prefsForm)
  if (mode === 'demo') demoWrite(appType, 'meal_prefs', prefsForm)
  setShowHorariosModal(false)
}
```

Add a `⚙️` button next to the week navigation header (find the `<h2>` with the week range and add alongside it):

```jsx
<button
  title="Horarios de comidas"
  onClick={() => { setPrefsForm(mealPrefs); setShowHorariosModal(true) }}
  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}
>⚙️</button>
```

Add the modal JSX before the closing `</ModuleShell>`:

```jsx
{showHorariosModal && (
  <div onClick={() => setShowHorariosModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
    <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>⏰ Horarios de comidas</h3>
      {[
        { key: 'desayuno', label: 'Desayuno' },
        { key: 'almuerzo', label: 'Almuerzo' },
        { key: 'comida',   label: 'Comida'   },
        { key: 'cena',     label: 'Cena'     },
      ].map(({ key, label }) => (
        <label key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
          {label}
          <input
            type="number" min={0} max={23}
            aria-label={label}
            value={prefsForm[key]}
            onChange={e => setPrefsForm(f => ({ ...f, [key]: Number(e.target.value) }))}
            style={{ width: 64, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, textAlign: 'center' }}
          />
        </label>
      ))}
      <button onClick={saveMealPrefs} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
        Guardar
      </button>
    </div>
  </div>
)}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run src/pages/app/modules/__tests__/Menu.calendarUtils.test.jsx
```
Expected: 4 tests, all green.

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/modules/Menu.jsx src/pages/app/modules/__tests__/Menu.calendarUtils.test.jsx
git commit -m "feat(menu): configurable meal hours stored in demo meal_prefs"
```

---

## Task 3: ShoppingList — Schedule a Shopping Trip

Add a "🗓️ Planificar compra" button in the ShoppingList header. Clicking it opens a small modal where the user picks a date, time, and confirms the active store. This writes a `shopping_trip` event to the calendar store.

**Files:**
- Modify: `src/pages/app/modules/ShoppingList.jsx`
- Create: `src/pages/app/modules/__tests__/ShoppingList.calendar.test.jsx`

- [ ] **Step 1: Write the failing tests**

```jsx
// src/pages/app/modules/__tests__/ShoppingList.calendar.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ShoppingList from '../ShoppingList'

vi.mock('react-router-dom', () => ({
  useOutletContext: () => ({ app: { id: 'demo-hogar', type: 'hogar' }, modules: [] }),
}))
vi.mock('../../../../contexts/ModeContext', () => ({ useMode: () => ({ mode: 'demo' }) }))
vi.mock('../../../../hooks/usePWAManifest', () => ({ usePWAManifest: () => {} }))
vi.mock('../../../../lib/supabase', () => ({ supabase: { from: () => ({ select: () => ({ eq: () => ({ order: () => ({ then: () => {} }) }) }) }) } }))

const demoWrite = vi.fn()
const demoRead  = vi.fn((_t, key) => {
  if (key === 'events') return []
  if (key === 'default_store') return 'Mercadona'
  return []
})

vi.mock('../../../../data/demo/index.js', () => ({ demoRead, demoWrite }))
vi.mock('../../../../utils/itemTransformers', () => ({ itemFromDb: i => i, itemToDb: i => i }))
vi.mock('../../../../utils/consumptionUtils', () => ({ computeConsumptionUpdate: () => ({}) }))

describe('ShoppingList — calendar integration', () => {
  it('shows Planificar compra button', () => {
    render(<ShoppingList />)
    expect(screen.getByText(/planificar compra/i)).toBeInTheDocument()
  })

  it('opens the scheduling modal on click', () => {
    render(<ShoppingList />)
    fireEvent.click(screen.getByText(/planificar compra/i))
    expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hora/i)).toBeInTheDocument()
  })

  it('writes a shopping_trip event on confirm', () => {
    render(<ShoppingList />)
    fireEvent.click(screen.getByText(/planificar compra/i))
    fireEvent.change(screen.getByLabelText(/fecha/i), { target: { value: '2026-06-10' } })
    fireEvent.change(screen.getByLabelText(/hora/i), { target: { value: '10:00' } })
    fireEvent.click(screen.getByText(/añadir al calendario/i))
    expect(demoWrite).toHaveBeenCalledWith('hogar', 'events', expect.arrayContaining([
      expect.objectContaining({ event_type: 'shopping_trip' })
    ]))
  })

  it('includes the store name in the event title', () => {
    render(<ShoppingList />)
    fireEvent.click(screen.getByText(/planificar compra/i))
    fireEvent.change(screen.getByLabelText(/fecha/i), { target: { value: '2026-06-10' } })
    fireEvent.change(screen.getByLabelText(/hora/i), { target: { value: '10:00' } })
    fireEvent.click(screen.getByText(/añadir al calendario/i))
    const written = demoWrite.mock.calls.find(c => c[1] === 'events')
    const event = written[2].find(e => e.event_type === 'shopping_trip')
    expect(event.title).toMatch(/Mercadona/)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/pages/app/modules/__tests__/ShoppingList.calendar.test.jsx
```
Expected: FAIL — no "Planificar compra" button.

- [ ] **Step 3: Add scheduling modal to ShoppingList.jsx**

Add these imports at the top of `ShoppingList.jsx`:

```js
import { addCalendarEvent } from '../../../utils/calendarUtils'
```

Add state after existing state declarations:

```jsx
const [showPlanModal, setShowPlanModal] = useState(false)
const [planForm, setPlanForm] = useState({ fecha: new Date().toISOString().slice(0, 10), hora: '10:00' })
```

Add this function inside the component:

```jsx
function planificarCompra() {
  const start = new Date(`${planForm.fecha}T${planForm.hora}:00`)
  const end   = new Date(start.getTime() + 60 * 60 * 1000) // 1h default
  addCalendarEvent(appType, {
    event_type: 'shopping_trip',
    title: `🛒 Compra ${activeStore}`,
    start_time: start.toISOString(),
    end_time:   end.toISOString(),
    color: '#10b981',
    metadata: { store: activeStore },
  })
  setShowPlanModal(false)
  showToast('Compra añadida al calendario ✓')
}
```

Add the button next to the existing `+ Añadir` button in the header area:

```jsx
<button
  onClick={() => setShowPlanModal(true)}
  style={{ padding: '8px 14px', borderRadius: 10, background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}
>🗓️ Planificar compra</button>
```

Add the modal before the closing `</ModuleShell>`:

```jsx
{showPlanModal && (
  <div onClick={() => setShowPlanModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
    <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, width: 300, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🛒 Planificar compra</h3>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Supermercado: <strong>{activeStore}</strong></p>
      <label style={{ fontSize: 13 }}>
        Fecha
        <input type="date" aria-label="Fecha" value={planForm.fecha}
          onChange={e => setPlanForm(f => ({ ...f, fecha: e.target.value }))}
          style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }} />
      </label>
      <label style={{ fontSize: 13 }}>
        Hora
        <input type="time" aria-label="Hora" value={planForm.hora}
          onChange={e => setPlanForm(f => ({ ...f, hora: e.target.value }))}
          style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }} />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setShowPlanModal(false)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
        <button onClick={planificarCompra} disabled={!planForm.fecha || !planForm.hora}
          style={{ flex: 2, padding: '8px 0', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, opacity: planForm.fecha && planForm.hora ? 1 : 0.5 }}>
          Añadir al calendario
        </button>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run src/pages/app/modules/__tests__/ShoppingList.calendar.test.jsx
```
Expected: 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/modules/ShoppingList.jsx src/pages/app/modules/__tests__/ShoppingList.calendar.test.jsx
git commit -m "feat(shopping): schedule shopping trip on calendar"
```

---

## Task 4: Limpieza — Roomba Schedule + Personal de Limpieza

Extend `Limpieza.jsx` with two new collapsible sections:

1. **🤖 Roomba** — pick days of week + hour → writes recurring `roomba` events (one event per selected day with weekly recurrence). These persist in the events store.
2. **🧹 Personal de limpieza** — pick specific dates + hour for cleaner visits → writes one-off `cleaner_visit` events.

**Files:**
- Modify: `src/pages/app/modules/Limpieza.jsx`
- Create: `src/pages/app/modules/__tests__/Limpieza.calendar.test.jsx`

- [ ] **Step 1: Write the failing tests**

```jsx
// src/pages/app/modules/__tests__/Limpieza.calendar.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Limpieza from '../Limpieza'

vi.mock('react-router-dom', () => ({
  useOutletContext: () => ({ app: { id: 'demo-hogar', type: 'hogar' }, modules: [] }),
}))
vi.mock('../../../../contexts/ModeContext', () => ({ useMode: () => ({ mode: 'demo' }) }))
vi.mock('../../../../hooks/data/useEventsData', () => ({
  useEventsData: () => ({ events: [], loading: false, add: vi.fn(), remove: vi.fn() }),
}))

const demoWrite = vi.fn()
const demoRead  = vi.fn((_t, key) => {
  if (key === 'factory_tasks') return []
  if (key === 'events') return []
  return []
})
vi.mock('../../../../data/demo/index.js', () => ({ demoRead, demoWrite }))

describe('Limpieza — Roomba schedule', () => {
  it('shows Roomba section toggle', () => {
    render(<Limpieza />)
    expect(screen.getByText(/roomba/i)).toBeInTheDocument()
  })

  it('opens Roomba config on click', () => {
    render(<Limpieza />)
    fireEvent.click(screen.getByText(/roomba/i))
    expect(screen.getByText(/lun/i)).toBeInTheDocument()   // day buttons
    expect(screen.getByLabelText(/hora/i)).toBeInTheDocument()
  })

  it('writes a roomba event on save', () => {
    render(<Limpieza />)
    fireEvent.click(screen.getByText(/roomba/i))
    fireEvent.click(screen.getByText('Lun'))
    fireEvent.change(screen.getByLabelText(/hora/i), { target: { value: '10' } })
    fireEvent.click(screen.getByText(/guardar horario/i))
    expect(demoWrite).toHaveBeenCalledWith('hogar', 'events', expect.arrayContaining([
      expect.objectContaining({ event_type: 'roomba', recurrence: 'weekly' })
    ]))
  })
})

describe('Limpieza — Personal de limpieza', () => {
  it('shows Personal de limpieza section toggle', () => {
    render(<Limpieza />)
    expect(screen.getByText(/personal de limpieza/i)).toBeInTheDocument()
  })

  it('opens the cleaner visit form on click', () => {
    render(<Limpieza />)
    fireEvent.click(screen.getByText(/personal de limpieza/i))
    expect(screen.getByLabelText(/próxima visita/i)).toBeInTheDocument()
  })

  it('writes a cleaner_visit event on add', () => {
    render(<Limpieza />)
    fireEvent.click(screen.getByText(/personal de limpieza/i))
    fireEvent.change(screen.getByLabelText(/próxima visita/i), { target: { value: '2026-06-15' } })
    fireEvent.click(screen.getByText(/añadir visita/i))
    expect(demoWrite).toHaveBeenCalledWith('hogar', 'events', expect.arrayContaining([
      expect.objectContaining({ event_type: 'cleaner_visit' })
    ]))
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/pages/app/modules/__tests__/Limpieza.calendar.test.jsx
```
Expected: FAIL — no Roomba or Personal de limpieza sections.

- [ ] **Step 3: Add calendar imports and Roomba+cleaner state to Limpieza.jsx**

Add this import at the top of `Limpieza.jsx` after existing imports:

```js
import { addCalendarEvent } from '../../../utils/calendarUtils'
```

Add these state declarations inside `Limpieza()` after the existing state:

```jsx
// Roomba
const DAYS_LABELS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
const [showRoomba, setShowRoomba]        = useState(false)
const [roombaDays, setRoombaDays]        = useState([]) // indices 0–6 (Mon=0)
const [roombaHour, setRoombaHour]        = useState(10)

// Personal de limpieza
const [showCleaner, setShowCleaner]      = useState(false)
const [cleanerDate, setCleanerDate]      = useState('')
const [cleanerHour, setCleanerHour]      = useState(9)

function saveRoombaSchedule() {
  if (roombaDays.length === 0) return
  const appType = app.type ?? 'hogar'
  roombaDays.forEach(dayIdx => {
    // Find the next occurrence of this weekday
    const now = new Date()
    const daysUntil = (dayIdx - ((now.getDay() + 6) % 7) + 7) % 7
    const next = new Date(now)
    next.setDate(now.getDate() + (daysUntil === 0 ? 7 : daysUntil))
    next.setHours(roombaHour, 0, 0, 0)
    addCalendarEvent(appType, {
      event_type: 'roomba',
      title: `🤖 Roomba — ${DAYS_LABELS[dayIdx]}`,
      start_time: next.toISOString(),
      end_time:   new Date(next.getTime() + 45 * 60 * 1000).toISOString(),
      recurrence: 'weekly',
      color: '#8b5cf6',
    })
  })
  setShowRoomba(false)
}

function addCleanerVisit() {
  if (!cleanerDate) return
  const appType = app.type ?? 'hogar'
  const start = new Date(`${cleanerDate}T${String(cleanerHour).padStart(2,'0')}:00:00`)
  addCalendarEvent(appType, {
    event_type: 'cleaner_visit',
    title: '🧹 Visita limpiadora',
    start_time: start.toISOString(),
    end_time:   new Date(start.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    color: '#3b82f6',
  })
  setCleanerDate('')
  setShowCleaner(false)
}
```

Add this JSX block after the existing `{showFactory && ...}` panel and before the `{showAdd && ...}` form:

```jsx
{/* ── Roomba schedule ── */}
<div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
  <button onClick={() => setShowRoomba(v => !v)}
    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text)', textAlign: 'left' }}>
    🤖 Roomba
    <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-faint)' }}>{showRoomba ? '▲' : '▼'}</span>
  </button>
  {showRoomba && (
    <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Selecciona los días en que pones el Roomba:</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {DAYS_LABELS.map((d, i) => (
          <button key={i} onClick={() => setRoombaDays(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
            style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: roombaDays.includes(i) ? '#8b5cf6' : 'var(--bg)',
              color: roombaDays.includes(i) ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${roombaDays.includes(i) ? '#8b5cf6' : 'var(--border)'}` }}>
            {d}
          </button>
        ))}
      </div>
      <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
        Hora
        <input type="number" min={6} max={22} aria-label="Hora" value={roombaHour}
          onChange={e => setRoombaHour(Number(e.target.value))}
          style={{ width: 60, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, textAlign: 'center' }} />
        :00
      </label>
      <button onClick={saveRoombaSchedule} disabled={roombaDays.length === 0}
        style={{ padding: '8px 0', borderRadius: 8, background: '#8b5cf6', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, opacity: roombaDays.length > 0 ? 1 : 0.4 }}>
        Guardar horario
      </button>
    </div>
  )}
</div>

{/* ── Personal de limpieza ── */}
<div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
  <button onClick={() => setShowCleaner(v => !v)}
    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text)', textAlign: 'left' }}>
    🧹 Personal de limpieza
    <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-faint)' }}>{showCleaner ? '▲' : '▼'}</span>
  </button>
  {showCleaner && (
    <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label style={{ fontSize: 13 }}>
        Próxima visita
        <input type="date" aria-label="Próxima visita" value={cleanerDate}
          onChange={e => setCleanerDate(e.target.value)}
          style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }} />
      </label>
      <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
        Hora de llegada
        <input type="number" min={7} max={20} value={cleanerHour}
          onChange={e => setCleanerHour(Number(e.target.value))}
          style={{ width: 60, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, textAlign: 'center' }} />
        :00
      </label>
      <button onClick={addCleanerVisit} disabled={!cleanerDate}
        style={{ padding: '8px 0', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, opacity: cleanerDate ? 1 : 0.4 }}>
        Añadir visita
      </button>
    </div>
  )}
</div>
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run src/pages/app/modules/__tests__/Limpieza.calendar.test.jsx
```
Expected: 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/modules/Limpieza.jsx src/pages/app/modules/__tests__/Limpieza.calendar.test.jsx
git commit -m "feat(limpieza): add Roomba schedule and personal de limpieza to calendar"
```

---

## Task 5: Vehiculo/Mantenimiento — Next Service Calendar Reminder

When a user logs maintenance with a `next_date`, show a "📅 Añadir al calendario" checkbox in the form. If checked, a `vehicle_maintenance` event is added for that date.

**Files:**
- Modify: `src/pages/app/modules/vehiculo/Mantenimiento.jsx`
- Create: `src/pages/app/modules/vehiculo/__tests__/Mantenimiento.calendar.test.jsx`

- [ ] **Step 1: Write the failing tests**

```jsx
// src/pages/app/modules/vehiculo/__tests__/Mantenimiento.calendar.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Mantenimiento from '../Mantenimiento'

const MOCK_VEHICLE = { id: 'v1', marca: 'Toyota', modelo: 'Corolla', matricula: 'ABC123' }

vi.mock('react-router-dom', () => ({
  useOutletContext: () => ({ app: { id: 'demo-vehiculo', type: 'vehiculo' }, vehicle: MOCK_VEHICLE }),
}))
vi.mock('../../../../../contexts/ModeContext', () => ({ useMode: () => ({ mode: 'demo' }) }))
vi.mock('../../../../../lib/supabase', () => ({ supabase: { from: () => ({ select: () => ({ eq: () => ({ order: () => ({ then: () => {} }) }) }) }) } }))

const demoWrite = vi.fn()
const demoRead  = vi.fn((_t, key) => {
  if (key === 'maintenance_logs') return []
  if (key === 'events') return []
  return []
})
vi.mock('../../../../../data/demo/index.js', () => ({ demoRead, demoWrite }))

describe('Mantenimiento — calendar integration', () => {
  it('shows add form button', () => {
    render(<Mantenimiento />)
    expect(screen.getByText(/nuevo mantenimiento/i)).toBeInTheDocument()
  })

  it('shows añadir al calendario checkbox when next_date is filled', async () => {
    render(<Mantenimiento />)
    fireEvent.click(screen.getByText(/nuevo mantenimiento/i))
    const nextDateInput = screen.getByLabelText(/próxima fecha/i)
    fireEvent.change(nextDateInput, { target: { value: '2027-01-15' } })
    expect(screen.getByLabelText(/añadir al calendario/i)).toBeInTheDocument()
  })

  it('writes a vehicle_maintenance event when checkbox is checked and saved', () => {
    render(<Mantenimiento />)
    fireEvent.click(screen.getByText(/nuevo mantenimiento/i))
    fireEvent.change(screen.getByLabelText(/próxima fecha/i), { target: { value: '2027-01-15' } })
    fireEvent.click(screen.getByLabelText(/añadir al calendario/i))
    fireEvent.click(screen.getByText(/^guardar$/i))
    expect(demoWrite).toHaveBeenCalledWith('vehiculo', 'events', expect.arrayContaining([
      expect.objectContaining({ event_type: 'vehicle_maintenance' })
    ]))
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/pages/app/modules/vehiculo/__tests__/Mantenimiento.calendar.test.jsx
```
Expected: FAIL — test 2 and 3 fail (no aria-label, no checkbox).

- [ ] **Step 3: Modify Mantenimiento.jsx**

Add import at top:

```js
import { addCalendarEvent } from '../../../../utils/calendarUtils'
```

Add state inside the component after existing state:

```jsx
const [addToCalendar, setAddToCalendar] = useState(false)
```

Find the `next_date` input in the add form and add an `aria-label`:

```jsx
<input
  type="date"
  aria-label="Próxima fecha"
  value={form.next_date}
  onChange={e => setForm(p => ({ ...p, next_date: e.target.value }))}
  ...existing styles...
/>
```

Add this checkbox block BELOW the next_date input (only shown when next_date has a value):

```jsx
{form.next_date && (
  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
    <input
      type="checkbox"
      aria-label="Añadir al calendario"
      checked={addToCalendar}
      onChange={e => setAddToCalendar(e.target.checked)}
    />
    📅 Añadir recordatorio al calendario
  </label>
)}
```

In the `handleAdd` function, after the successful demoWrite for the maintenance log, add:

```jsx
if (addToCalendar && form.next_date) {
  addCalendarEvent(appType, {
    event_type: 'vehicle_maintenance',
    title: `${MAINT_ICONS[form.type] ?? '🔧'} ${form.type} — ${vehicle.marca} ${vehicle.modelo}`,
    start_time: new Date(form.next_date + 'T09:00:00').toISOString(),
    all_day: true,
    color: '#f59e0b',
    metadata: { vehicle_id: vehicle.id, maint_type: form.type },
  })
  setAddToCalendar(false)
}
```

Also add a "Guardar" text button to the add form submit button (it may currently say "Añadir" — ensure it has text matching `/^guardar$/i` or adjust the test regex to match the actual text).

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run src/pages/app/modules/vehiculo/__tests__/Mantenimiento.calendar.test.jsx
```
Expected: 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/modules/vehiculo/Mantenimiento.jsx src/pages/app/modules/vehiculo/__tests__/Mantenimiento.calendar.test.jsx
git commit -m "feat(vehiculo): add next-service calendar reminder from Mantenimiento"
```

---

## Task 6: Ocio — Eventos + Viajes + Deportes → Calendar

Three Ocio modules get "Add to calendar" buttons. All write to `demo_ocio_events` which Calendar.jsx reads.

**Files:**
- Modify: `src/pages/app/modules/ocio/Eventos.jsx`
- Modify: `src/pages/app/modules/ocio/Viajes.jsx`
- Modify: `src/pages/app/modules/ocio/Deportes.jsx`
- Create: `src/pages/app/modules/ocio/__tests__/OcioCalendar.test.jsx`

- [ ] **Step 1: Write the failing tests**

```jsx
// src/pages/app/modules/ocio/__tests__/OcioCalendar.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Eventos from '../Eventos'
import Viajes from '../Viajes'
import Deportes from '../Deportes'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'ocio' } }) }))

const future = new Date(); future.setDate(future.getDate() + 15)
const fmt = d => d.toISOString().slice(0, 10)

const MOCK_EVENTOS = [
  { id: 'e1', tipo: 'concierto', titulo: 'Vetusta Morla', artista: 'Vetusta Morla', recinto: 'WiZink', ciudad: 'Madrid', fecha: fmt(future), precio: 45, estado: 'confirmado', notas: '', valoracion: 0 },
]
const MOCK_VIAJES = [
  { id: 'v1', destino: 'Tokio', pais: 'Japón', estado: 'planificado', fecha_inicio: fmt(future), fecha_fin: fmt(future),
    presupuesto: 3000, gasto_real: 0, notas: '',
    alojamiento: { nombre: 'Hotel Shinjuku', tipo: 'hotel', confirmacion: 'XYZ123', direccion: '' },
    transporte: [], },
]
const MOCK_DEPORTES = [
  { id: 'd1', deporte: 'Fútbol', equipo: 'FC Barcelona', competicion: 'La Liga',
    partidos: [
      { id: 'p1', rival: 'Real Madrid', es_local: true, fecha: fmt(future), goles_local: null, goles_visitante: null },
    ] },
]

const demoWrite = vi.fn()
const demoRead  = vi.fn((_t, key) => {
  if (key === 'eventos')  return MOCK_EVENTOS
  if (key === 'viajes')   return MOCK_VIAJES
  if (key === 'deportes_seguimiento') return MOCK_DEPORTES
  if (key === 'events')   return []
  return []
})

vi.mock('../../../../../data/demo', () => ({ demoRead, demoWrite }))

// ── Eventos ─────────────────────────────────────────────────────
describe('Eventos → calendar', () => {
  it('shows 📅 button per event', () => {
    render(<Eventos />)
    expect(screen.getAllByTitle(/añadir al calendario/i).length).toBeGreaterThan(0)
  })

  it('writes an ocio_event on 📅 click', () => {
    render(<Eventos />)
    fireEvent.click(screen.getAllByTitle(/añadir al calendario/i)[0])
    expect(demoWrite).toHaveBeenCalledWith('ocio', 'events', expect.arrayContaining([
      expect.objectContaining({ event_type: 'ocio_event', title: expect.stringContaining('Vetusta Morla') })
    ]))
  })
})

// ── Viajes ───────────────────────────────────────────────────────
describe('Viajes → calendar', () => {
  it('shows Fechas al calendario button in detail view', () => {
    render(<Viajes />)
    fireEvent.click(screen.getByText('Tokio'))
    expect(screen.getByText(/fechas al calendario/i)).toBeInTheDocument()
  })

  it('writes travel_checkin and travel_checkout events', () => {
    render(<Viajes />)
    fireEvent.click(screen.getByText('Tokio'))
    fireEvent.click(screen.getByText(/fechas al calendario/i))
    const calls = demoWrite.mock.calls.filter(c => c[1] === 'events')
    const events = calls[calls.length - 1][2]
    expect(events.some(e => e.event_type === 'travel_checkin')).toBe(true)
    expect(events.some(e => e.event_type === 'travel_checkout')).toBe(true)
  })
})

// ── Deportes ─────────────────────────────────────────────────────
describe('Deportes → calendar', () => {
  it('shows 📅 button per upcoming match in detail view', () => {
    render(<Deportes />)
    fireEvent.click(screen.getAllByText(/FC Barcelona/)[0])
    expect(screen.getAllByTitle(/añadir al calendario/i).length).toBeGreaterThan(0)
  })

  it('writes a match event on 📅 click', () => {
    render(<Deportes />)
    fireEvent.click(screen.getAllByText(/FC Barcelona/)[0])
    fireEvent.click(screen.getAllByTitle(/añadir al calendario/i)[0])
    expect(demoWrite).toHaveBeenCalledWith('ocio', 'events', expect.arrayContaining([
      expect.objectContaining({ event_type: 'match', title: expect.stringContaining('Real Madrid') })
    ]))
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/pages/app/modules/ocio/__tests__/OcioCalendar.test.jsx
```
Expected: all 6 FAIL — no calendar buttons exist.

- [ ] **Step 3: Modify Eventos.jsx**

Add import:

```js
import { addCalendarEvent } from '../../../../utils/calendarUtils'
```

Add a function inside the component:

```jsx
function addEventoToCalendar(ev) {
  const start = new Date(ev.fecha + 'T20:00:00')
  addCalendarEvent(appType, {
    event_type: 'ocio_event',
    title: `${TIPO_ICON[ev.tipo] ?? '🎟️'} ${ev.titulo}`,
    start_time: start.toISOString(),
    end_time:   new Date(start.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    color: '#ec4899',
    metadata: { tipo: ev.tipo, artista: ev.artista, recinto: ev.recinto, precio: ev.precio },
  })
}
```

In the event card JSX, add a small button at the top-right of each card:

```jsx
<button
  title="Añadir al calendario"
  onClick={e => { e.stopPropagation(); addEventoToCalendar(ev) }}
  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}
>📅</button>
```

- [ ] **Step 4: Modify Viajes.jsx**

Add import:

```js
import { addCalendarEvent } from '../../../../utils/calendarUtils'
```

Add function inside the component:

```jsx
function addViajeToCalendar(viaje) {
  if (!viaje.fecha_inicio) return
  addCalendarEvent(appType, {
    event_type: 'travel_checkin',
    title: `✈️ Salida — ${viaje.destino}`,
    start_time: new Date(viaje.fecha_inicio + 'T00:00:00').toISOString(),
    all_day: true,
    color: '#3b82f6',
    metadata: { viaje_id: viaje.id, destino: viaje.destino },
  })
  if (viaje.fecha_fin && viaje.fecha_fin !== viaje.fecha_inicio) {
    addCalendarEvent(appType, {
      event_type: 'travel_checkout',
      title: `🏠 Vuelta — ${viaje.destino}`,
      start_time: new Date(viaje.fecha_fin + 'T00:00:00').toISOString(),
      all_day: true,
      color: '#f97316',
      metadata: { viaje_id: viaje.id, destino: viaje.destino },
    })
  }
}
```

In the detail view (the `if (selected)` branch), add after the header card:

```jsx
{(selected.fecha_inicio || selected.fecha_fin) && (
  <button
    onClick={() => addViajeToCalendar(selected)}
    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}
  >📅 Fechas al calendario</button>
)}
```

- [ ] **Step 5: Modify Deportes.jsx**

Add import:

```js
import { addCalendarEvent } from '../../../../utils/calendarUtils'
```

Add function:

```jsx
function addPartidoToCalendar(partido, equipo) {
  const start = new Date(partido.fecha + 'T20:00:00')
  const local    = partido.es_local ? equipo.equipo : partido.rival
  const visitante = partido.es_local ? partido.rival : equipo.equipo
  addCalendarEvent(appType, {
    event_type: 'match',
    title: `⚽ ${local} vs ${visitante}`,
    start_time: start.toISOString(),
    end_time:   new Date(start.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    color: '#ef4444',
    metadata: { equipo_id: equipo.id, partido_id: partido.id, competicion: equipo.competicion },
  })
}
```

In the detail view, inside the `proximos.map(p => ...)` card, add a small button at the right:

```jsx
<button
  title="Añadir al calendario"
  onClick={() => addPartidoToCalendar(p, selected)}
  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}
>📅</button>
```

- [ ] **Step 6: Run tests — expect PASS**

```bash
npx vitest run src/pages/app/modules/ocio/__tests__/OcioCalendar.test.jsx
```
Expected: 6 tests green.

- [ ] **Step 7: Run full test suite to check no regressions**

```bash
npx vitest run src/pages/app/modules/ocio/__tests__/
```
Expected: all existing Ocio tests still green.

- [ ] **Step 8: Commit**

```bash
git add src/pages/app/modules/ocio/Eventos.jsx \
        src/pages/app/modules/ocio/Viajes.jsx \
        src/pages/app/modules/ocio/Deportes.jsx \
        src/pages/app/modules/ocio/__tests__/OcioCalendar.test.jsx
git commit -m "feat(ocio): add to calendar from Eventos, Viajes, Deportes"
```

---

## Task 7: Finanzas — Suscripciones + Seguros → Calendar

> **Prerequisite:** This task depends on `Suscripciones.jsx` and `Seguros.jsx` existing (planned in `2026-05-15-fase7-finanzas-suscripciones-seguros.md`). Implement that plan first if those files do not yet exist, then return here.

Each subscription shows a "📅" button that creates a `subscription_renewal` event on its `fecha_renovacion` date. Periodicidad `mensual` → recurrence `monthly`; `anual` → recurrence `none` (single event). Each insurance policy shows "📅" that creates an `insurance_expiry` event on its `vencimiento` date.

**Files:**
- Modify: `src/pages/app/modules/finanzas/Suscripciones.jsx`
- Modify: `src/pages/app/modules/finanzas/Seguros.jsx`
- Create: `src/pages/app/modules/finanzas/__tests__/FinanzasCalendar.test.jsx`

- [ ] **Step 1: Write the failing tests**

```jsx
// src/pages/app/modules/finanzas/__tests__/FinanzasCalendar.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Suscripciones from '../Suscripciones'
import Seguros from '../Seguros'

vi.mock('react-router-dom', () => ({
  useOutletContext: () => ({ app: { id: 'demo-finanzas', type: 'finanzas' } }),
}))
vi.mock('../../../../../contexts/ModeContext', () => ({ useMode: () => ({ mode: 'demo' }) }))

const MOCK_SUBS = [
  { id: 's1', nombre: 'Netflix', icono: '📺', coste: 17.99, periodicidad: 'mensual', fecha_renovacion: '2026-07-01', categoria: 'entretenimiento', estado: 'activa' },
  { id: 's2', nombre: 'Spotify', icono: '🎵', coste: 10.99, periodicidad: 'mensual', fecha_renovacion: '2026-07-05', categoria: 'musica', estado: 'activa' },
]
const MOCK_SEGUROS = [
  { id: 'sg1', tipo: 'hogar', nombre: 'Mutua Hogar', coste_anual: 450, vencimiento: '2027-03-01', compania: 'Mutua Madrileña', estado: 'activo' },
]

const demoWrite = vi.fn()
const demoRead  = vi.fn((_t, key) => {
  if (key === 'suscripciones') return MOCK_SUBS
  if (key === 'seguros')       return MOCK_SEGUROS
  if (key === 'events')        return []
  return []
})
vi.mock('../../../../../data/demo/index.js', () => ({ demoRead, demoWrite }))

describe('Suscripciones → calendar', () => {
  it('shows 📅 button per subscription', () => {
    render(<Suscripciones />)
    expect(screen.getAllByTitle(/añadir al calendario/i).length).toBeGreaterThanOrEqual(2)
  })

  it('writes subscription_renewal event with monthly recurrence', () => {
    render(<Suscripciones />)
    fireEvent.click(screen.getAllByTitle(/añadir al calendario/i)[0])
    expect(demoWrite).toHaveBeenCalledWith('finanzas', 'events', expect.arrayContaining([
      expect.objectContaining({ event_type: 'subscription_renewal', recurrence: 'monthly', title: expect.stringContaining('Netflix') })
    ]))
  })
})

describe('Seguros → calendar', () => {
  it('shows 📅 button per policy', () => {
    render(<Seguros />)
    expect(screen.getAllByTitle(/añadir al calendario/i).length).toBeGreaterThanOrEqual(1)
  })

  it('writes insurance_expiry event on vencimiento date', () => {
    render(<Seguros />)
    fireEvent.click(screen.getAllByTitle(/añadir al calendario/i)[0])
    expect(demoWrite).toHaveBeenCalledWith('finanzas', 'events', expect.arrayContaining([
      expect.objectContaining({ event_type: 'insurance_expiry', title: expect.stringContaining('Mutua Hogar') })
    ]))
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/pages/app/modules/finanzas/__tests__/FinanzasCalendar.test.jsx
```
Expected: FAIL — no 📅 buttons in those components yet.

- [ ] **Step 3: Modify Suscripciones.jsx**

Add import:

```js
import { addCalendarEvent } from '../../../../utils/calendarUtils'
```

Add function inside the component:

```jsx
function addSubToCalendar(sub) {
  addCalendarEvent(appType, {
    event_type: 'subscription_renewal',
    title: `${sub.icono} ${sub.nombre} — renovación`,
    start_time: new Date(sub.fecha_renovacion + 'T08:00:00').toISOString(),
    all_day: true,
    recurrence: sub.periodicidad === 'mensual' ? 'monthly' : 'none',
    color: '#8b5cf6',
    metadata: { sub_id: sub.id, coste: sub.coste, periodicidad: sub.periodicidad },
  })
}
```

In each subscription card, add a small button at the top-right:

```jsx
<button
  title="Añadir al calendario"
  onClick={e => { e.stopPropagation(); addSubToCalendar(sub) }}
  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}
>📅</button>
```

- [ ] **Step 4: Modify Seguros.jsx**

Add import:

```js
import { addCalendarEvent } from '../../../../utils/calendarUtils'
```

Add function:

```jsx
function addSeguroToCalendar(seg) {
  addCalendarEvent(appType, {
    event_type: 'insurance_expiry',
    title: `🛡️ ${seg.nombre} — vencimiento`,
    start_time: new Date(seg.vencimiento + 'T09:00:00').toISOString(),
    all_day: true,
    color: '#ef4444',
    metadata: { seguro_id: seg.id, compania: seg.compania, coste_anual: seg.coste_anual },
  })
}
```

In each insurance card, add:

```jsx
<button
  title="Añadir al calendario"
  onClick={e => { e.stopPropagation(); addSeguroToCalendar(seg) }}
  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}
>📅</button>
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npx vitest run src/pages/app/modules/finanzas/__tests__/FinanzasCalendar.test.jsx
```
Expected: 4 tests green.

- [ ] **Step 6: Run full test suite**

```bash
npx vitest run
```
Expected: all tests green, no regressions.

- [ ] **Step 7: Build check**

```bash
npx vite build
```
Expected: builds without errors.

- [ ] **Step 8: Commit**

```bash
git add src/pages/app/modules/finanzas/Suscripciones.jsx \
        src/pages/app/modules/finanzas/Seguros.jsx \
        src/pages/app/modules/finanzas/__tests__/FinanzasCalendar.test.jsx
git commit -m "feat(finanzas): add subscription renewal and insurance expiry to calendar"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Menú — configurable meal hours (Task 2)
- ✅ Lista de compra — shopping trip event with store (Task 3)
- ✅ Roomba — recurring schedule (Task 4)
- ✅ Personal de limpieza — cleaner visit dates (Task 4)
- ✅ Suscripciones — renewal date events (Task 7)
- ✅ Seguros — vencimiento alert events (Task 7)
- ✅ Ocio/Eventos, Viajes, Deportes — calendar events (Task 6)
- ✅ Utility layer to avoid duplicated demoRead/demoWrite across all modules (Task 1)

**Out of scope / follow-up:**
- Mascotas/Salud already writes to the events store — no changes needed
- Limpieza already writes cleaning tasks to the events store — extended with Roomba + cleaner sections
- Menu already writes meal events — extended with configurable hours only
- Recipe prep_time / batch_days: deferred to a future recipe-enhancement phase (not core calendar integration)
- Regalos reminder (N days before fecha): can be added in a follow-up task using the same pattern as Eventos
- GastosFijos monthly payment events: deferred until GastosFijos module is built (also in fase7 plan)
