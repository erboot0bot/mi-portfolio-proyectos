# Demo Home Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar `DemoHub.jsx` con un hub cross-app que muestra fecha, tareas de hoy y accesos a las 5 apps con stats en vivo.

**Architecture:** Un solo componente `DemoHome.jsx` con helpers de datos inline para stats, y un helper extraído `getDemoTodayItems.js` (testable) para la agregación de eventos cross-app. Todo en columna centrada, tema light/dark por dispositivo.

**Tech Stack:** React 19, Tailwind v4 (solo utilidades inline-style donde hace falta), date-fns, Vitest + @testing-library/react

---

## File Map

| Acción | Archivo |
|--------|---------|
| Crear | `src/data/demo/getDemoTodayItems.js` |
| Crear | `src/data/demo/__tests__/getDemoTodayItems.test.js` |
| Crear | `src/pages/DemoHome.jsx` |
| Crear | `src/pages/__tests__/DemoHome.test.jsx` |
| Modificar | `src/App.jsx` — cambiar import `DemoHub` → `DemoHome` |

---

## Task 1: Helper `getDemoTodayItems`

**Files:**
- Create: `src/data/demo/getDemoTodayItems.js`
- Test: `src/data/demo/__tests__/getDemoTodayItems.test.js`

Agrega eventos del día de hogar, mascotas y tareas pendientes de personal.

- [ ] **Step 1: Escribir el test primero**

```js
// src/data/demo/__tests__/getDemoTodayItems.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getDemoTodayItems, getActiveItem } from '../getDemoTodayItems.js'

vi.mock('../index.js', () => ({
  demoRead: vi.fn((appType, key) => {
    const today = new Date()
    const todayIso = today.toISOString()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (appType === 'hogar' && key === 'events') return [
      { id: 'h1', start_time: todayIso, title: 'Compra hoy', all_day: false },
      { id: 'h2', start_time: tomorrow.toISOString(), title: 'Mañana', all_day: false },
    ]
    if (appType === 'mascotas' && key === 'events') return [
      { id: 'm1', start_time: todayIso, title: 'Paseo Luna', all_day: false },
    ]
    if (appType === 'personal' && key === 'personal_tasks') {
      const todayDate = today.toISOString().slice(0, 10)
      return [
        { id: 'p1', due_date: todayDate, title: 'Llamar al seguro', status: 'pending' },
        { id: 'p2', due_date: tomorrow.toISOString().slice(0, 10), title: 'Mañana', status: 'pending' },
        { id: 'p3', due_date: todayDate, title: 'Done task', status: 'done' },
      ]
    }
    return []
  }),
}))

describe('getDemoTodayItems', () => {
  it('retorna solo eventos de hoy de hogar y mascotas', () => {
    const items = getDemoTodayItems()
    const titles = items.map(i => i.title)
    expect(titles).toContain('Compra hoy')
    expect(titles).toContain('Paseo Luna')
    expect(titles).not.toContain('Mañana')
  })

  it('incluye tareas pending de personal con due_date hoy', () => {
    const items = getDemoTodayItems()
    expect(items.some(i => i.title === 'Llamar al seguro')).toBe(true)
  })

  it('excluye tareas done aunque sean de hoy', () => {
    const items = getDemoTodayItems()
    expect(items.some(i => i.title === 'Done task')).toBe(false)
  })

  it('ordena por hora ascendente', () => {
    const items = getDemoTodayItems()
    for (let i = 1; i < items.length; i++) {
      expect(new Date(items[i].time) >= new Date(items[i - 1].time)).toBe(true)
    }
  })

  it('cada item tiene id, time, title, appLabel, appColor, allDay', () => {
    const items = getDemoTodayItems()
    for (const item of items) {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('time')
      expect(item).toHaveProperty('title')
      expect(item).toHaveProperty('appLabel')
      expect(item).toHaveProperty('appColor')
      expect(item).toHaveProperty('allDay')
    }
  })
})

describe('getActiveItem', () => {
  it('retorna el item cuya hora está en el pasado reciente (< 120 min)', () => {
    const now = new Date()
    const recentPast = new Date(now.getTime() - 30 * 60 * 1000).toISOString()
    const oldPast = new Date(now.getTime() - 180 * 60 * 1000).toISOString()
    const items = [
      { id: 'a', time: oldPast,   allDay: false },
      { id: 'b', time: recentPast, allDay: false },
    ]
    expect(getActiveItem(items)?.id).toBe('b')
  })

  it('ignora eventos all_day para el estado activo', () => {
    const now = new Date()
    const recentPast = new Date(now.getTime() - 10 * 60 * 1000).toISOString()
    const items = [{ id: 'a', time: recentPast, allDay: true }]
    expect(getActiveItem(items)).toBeNull()
  })

  it('retorna null si no hay items activos', () => {
    expect(getActiveItem([])).toBeNull()
  })
})
```

- [ ] **Step 2: Correr el test — verificar que falla**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run src/data/demo/__tests__/getDemoTodayItems.test.js
```

Expected: FAIL — `getDemoTodayItems.js` no existe.

- [ ] **Step 3: Implementar `getDemoTodayItems.js`**

```js
// src/data/demo/getDemoTodayItems.js
import { isToday } from 'date-fns'
import { demoRead } from './index.js'

const APP_SOURCES = [
  { appType: 'hogar',    label: 'HOGAR',    color: '#f97316' },
  { appType: 'mascotas', label: 'MASCOTAS', color: '#a855f7' },
]

export function getDemoTodayItems() {
  const items = []

  for (const { appType, label, color } of APP_SOURCES) {
    const events = demoRead(appType, 'events')
    for (const ev of events) {
      if (isToday(new Date(ev.start_time))) {
        items.push({
          id:       ev.id,
          time:     ev.start_time,
          title:    ev.title,
          appLabel: label,
          appColor: color,
          allDay:   ev.all_day ?? false,
        })
      }
    }
  }

  // Tareas pending de personal con due_date hoy
  const tasks = demoRead('personal', 'personal_tasks')
  for (const t of tasks) {
    if (t.status === 'done') continue
    if (!t.due_date) continue
    if (isToday(new Date(t.due_date + 'T12:00:00'))) {
      items.push({
        id:       t.id,
        time:     t.due_date + 'T09:00:00',
        title:    t.title,
        appLabel: 'PERSONAL',
        appColor: '#38bdf8',
        allDay:   true,
      })
    }
  }

  return items.sort((a, b) => new Date(a.time) - new Date(b.time))
}

export function getActiveItem(items) {
  const now = new Date()
  return items.find(item => {
    if (item.allDay) return false
    const diffMin = (now - new Date(item.time)) / (1000 * 60)
    return diffMin >= 0 && diffMin < 120
  }) ?? null
}
```

- [ ] **Step 4: Correr el test — verificar que pasa**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run src/data/demo/__tests__/getDemoTodayItems.test.js
```

Expected: PASS — todos los tests en verde.

- [ ] **Step 5: Commit**

```bash
cd /home/user/mi-portfolio-proyectos && git add src/data/demo/getDemoTodayItems.js src/data/demo/__tests__/getDemoTodayItems.test.js && git commit -m "feat(demo): getDemoTodayItems — agrega eventos hoy de hogar/mascotas/personal"
```

---

## Task 2: `DemoHome.jsx`

**Files:**
- Create: `src/pages/DemoHome.jsx`

- [ ] **Step 1: Crear `DemoHome.jsx`**

```jsx
// src/pages/DemoHome.jsx
import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format, differenceInMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { initDemoData, demoRead } from '../data/demo/index.js'
import { getDemoTodayItems, getActiveItem } from '../data/demo/getDemoTodayItems.js'

const APP_CONFIG = [
  { type: 'hogar',    label: 'HOGAR',    icon: '🏠', color: '#f97316' },
  { type: 'personal', label: 'PERSONAL', icon: '🗂️', color: '#38bdf8' },
  { type: 'mascotas', label: 'MASCOTAS', icon: '🐾', color: '#a855f7' },
  { type: 'vehiculo', label: 'VEHÍCULO', icon: '🚗', color: '#ef4444' },
  { type: 'finanzas', label: 'FINANZAS', icon: '💰', color: '#22c55e' },
]

function getAppStats(type) {
  switch (type) {
    case 'hogar': {
      const now = new Date()
      const events = demoRead('hogar', 'events')
      const todayCount = events.filter(e => {
        const d = new Date(e.start_time)
        return d.getFullYear() === now.getFullYear()
          && d.getMonth() === now.getMonth()
          && d.getDate() === now.getDate()
      }).length
      const pending = demoRead('hogar', 'items_supermercado').filter(i => !i.checked).length
      return [`${todayCount} tarea${todayCount !== 1 ? 's' : ''} hoy`, `${pending} en lista`]
    }
    case 'personal': {
      const tasks = demoRead('personal', 'personal_tasks').filter(t => t.status !== 'done').length
      const notes = demoRead('personal', 'personal_notes').length
      return [`${tasks} tarea${tasks !== 1 ? 's' : ''}`, `${notes} notas`]
    }
    case 'mascotas': {
      const pets = demoRead('mascotas', 'pets')
      if (!pets.length) return ['Sin mascotas', '']
      const pet = pets[0]
      const months = differenceInMonths(new Date(), new Date(pet.birth_date))
      const yrs = Math.floor(months / 12)
      const age = months < 12 ? `${months} meses` : `${yrs} año${yrs !== 1 ? 's' : ''}`
      return [`${pet.name} · ${age}`, pet.species]
    }
    case 'vehiculo': {
      const vehicles = demoRead('vehiculo', 'vehicles')
      if (!vehicles.length) return ['Sin vehículos', '']
      const v = vehicles[0]
      const logs = demoRead('vehiculo', 'fuel_logs')
      const lastKm = logs.length
        ? Math.max(...logs.map(l => l.km_at_fill))
        : v.initial_km
      return [`${v.brand} ${v.model}`, `${lastKm.toLocaleString('es-ES')} km`]
    }
    case 'finanzas': {
      const txs = demoRead('finanzas', 'fin_transactions')
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const total = txs
        .filter(t => t.type === 'expense' && new Date(t.date) >= weekAgo)
        .reduce((sum, t) => sum + t.amount, 0)
      const budgets = demoRead('finanzas', 'fin_budgets').length
      return [`${total.toFixed(0)}€ esta semana`, `${budgets} presupuestos`]
    }
    default: return ['—', '']
  }
}

export default function DemoHome() {
  // Inicializar datos de las 5 apps
  useEffect(() => {
    ['hogar', 'personal', 'mascotas', 'vehiculo', 'finanzas'].forEach(initDemoData)
  }, [])

  // Tema por defecto según dispositivo (solo si no hay preferencia guardada)
  useEffect(() => {
    if (localStorage.getItem('theme')) return
    const isMobile = window.innerWidth < 768
    document.documentElement.classList.toggle('dark', isMobile)
    localStorage.setItem('theme', isMobile ? 'dark' : 'light')
  }, [])

  const now = new Date()
  const dayLabel  = format(now, 'EEE', { locale: es }).toUpperCase()
  const dayNum    = format(now, 'd')
  const monthLabel = format(now, 'MMMM', { locale: es }).toUpperCase()
  const year      = format(now, 'yyyy')

  const todayItems = useMemo(() => getDemoTodayItems(), [])
  const activeItem = useMemo(() => getActiveItem(todayItems), [todayItems])

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 20px 56px' }}>

      {/* Animaciones */}
      <style>{`
        @keyframes dh-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Fecha ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '1.5px',
          color: 'var(--text-muted)', marginBottom: 6,
        }}>
          {dayLabel} · {dayNum} {monthLabel.slice(0, 3)} {year}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <div style={{
            fontSize: 80, fontWeight: 900, lineHeight: 1,
            color: 'var(--text)',
            fontFamily: 'var(--font-display, system-ui)',
            animation: 'dh-up 0.4s ease both',
          }}>
            {dayNum}
          </div>
          <div style={{
            fontSize: 24, fontWeight: 700, letterSpacing: '4px',
            color: 'var(--text)', marginBottom: 8,
            animation: 'dh-up 0.4s ease 0.05s both',
          }}>
            {monthLabel}
          </div>
        </div>
      </div>

      {/* ── Hoy ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '1.5px',
          color: 'var(--text-faint)', marginBottom: 8,
        }}>
          HOY · {todayItems.length} ITEMS
        </div>

        {todayItems.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-faint)', padding: '8px 0' }}>
            Sin eventos hoy
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {todayItems.map((item, i) => {
              const isActive = item.id === activeItem?.id
              return (
                <div
                  key={item.id}
                  style={{
                    padding: '10px 12px',
                    background: isActive ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--bg-card)',
                    borderRadius: 8,
                    borderLeft: `3px solid ${item.appColor}`,
                    animation: `dh-up 0.35s ease ${i * 0.04}s both`,
                  }}
                >
                  <div style={{
                    fontSize: 10, marginBottom: 2,
                    color: isActive ? item.appColor : 'var(--text-muted)',
                    fontWeight: isActive ? 700 : 400,
                    letterSpacing: isActive ? '0.5px' : 0,
                  }}>
                    {isActive
                      ? '● AHORA'
                      : item.allDay
                        ? 'Todo el día'
                        : format(new Date(item.time), 'HH:mm')}
                  </div>
                  <div style={{
                    fontSize: 13, marginBottom: 2,
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? item.appColor : 'var(--text)',
                  }}>
                    {item.title}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.5px',
                    color: item.appColor, opacity: 0.85,
                  }}>
                    {item.appLabel}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Apps ── */}
      <div>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '1.5px',
          color: 'var(--text-faint)', marginBottom: 8,
        }}>
          TUS APPS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {APP_CONFIG.map((app, i) => {
            const [line1, line2] = getAppStats(app.type)
            return (
              <Link
                key={app.type}
                to={`/demo/${app.type}`}
                style={{
                  display: 'block', textDecoration: 'none',
                  padding: '12px 14px',
                  background: 'var(--bg-card)',
                  borderRadius: 8,
                  borderTop: `2px solid ${app.color}`,
                  animation: `dh-up 0.35s ease ${(todayItems.length + i) * 0.04}s both`,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: app.color, marginBottom: 4 }}>
                  {app.icon} {app.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{line1}</div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{line2}</div>
              </Link>
            )
          })}

          {/* Tarjeta IA */}
          <div style={{
            padding: '12px 14px',
            background: '#7c3aed',
            borderRadius: 8,
            animation: `dh-up 0.35s ease ${(todayItems.length + 5) * 0.04}s both`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 4 }}>
              ✦ IA
            </div>
            <div style={{ fontSize: 11, color: '#ddd6fe', lineHeight: 1.5 }}>
              Gastas un 18% más los jueves en gasolina
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar que compila sin errores**

```bash
cd /home/user/mi-portfolio-proyectos && npx tsc --noEmit 2>&1 | head -20 || npx vite build 2>&1 | grep -E "error|Error" | head -10
```

Expected: sin errores de compilación.

- [ ] **Step 3: Commit**

```bash
cd /home/user/mi-portfolio-proyectos && git add src/pages/DemoHome.jsx && git commit -m "feat(demo): DemoHome — hub cross-app con fecha, hoy y app cards"
```

---

## Task 3: Conectar en App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Cambiar import de DemoHub a DemoHome**

En `src/App.jsx`, encontrar la línea que importa `DemoHub`:

```js
// ANTES:
import DemoHub  from './pages/DemoHub'

// DESPUÉS:
import DemoHome from './pages/DemoHome'
```

Y la línea donde se usa como elemento de la ruta:

```jsx
// ANTES:
<Route path="/demo" element={<DemoHub />} />

// DESPUÉS:
<Route path="/demo" element={<DemoHome />} />
```

- [ ] **Step 2: Build completo**

```bash
cd /home/user/mi-portfolio-proyectos && npm run build 2>&1 | tail -8
```

Expected: `✓ built in X.XXs` sin errores.

- [ ] **Step 3: Commit**

```bash
cd /home/user/mi-portfolio-proyectos && git add src/App.jsx && git commit -m "feat(demo): conectar DemoHome en ruta /demo"
```

---

## Task 4: Test de componente `DemoHome`

**Files:**
- Create: `src/pages/__tests__/DemoHome.test.jsx`

- [ ] **Step 1: Crear el test**

```jsx
// src/pages/__tests__/DemoHome.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock initDemoData y demoRead para control total
vi.mock('../../data/demo/index.js', () => ({
  initDemoData: vi.fn(),
  demoRead: vi.fn((appType, key) => {
    if (appType === 'hogar' && key === 'events') return []
    if (appType === 'hogar' && key === 'items_supermercado') return [
      { id: '1', checked: false },
      { id: '2', checked: true },
    ]
    if (appType === 'personal' && key === 'personal_tasks') return []
    if (appType === 'personal' && key === 'personal_notes') return [
      { id: 'n1' }, { id: 'n2' },
    ]
    if (appType === 'mascotas' && key === 'pets') return [
      { id: 'p1', name: 'Luna', species: 'perro', birth_date: '2023-01-01' },
    ]
    if (appType === 'vehiculo' && key === 'vehicles') return [
      { id: 'v1', brand: 'Volkswagen', model: 'Golf', initial_km: 85000 },
    ]
    if (appType === 'vehiculo' && key === 'fuel_logs') return [
      { km_at_fill: 87420 },
    ]
    if (appType === 'finanzas' && key === 'fin_transactions') return []
    if (appType === 'finanzas' && key === 'fin_budgets') return [
      { id: 'b1' }, { id: 'b2' },
    ]
    return []
  }),
}))

vi.mock('../../data/demo/getDemoTodayItems.js', () => ({
  getDemoTodayItems: vi.fn(() => []),
  getActiveItem: vi.fn(() => null),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual }
})

import DemoHome from '../DemoHome.jsx'

function renderDemoHome() {
  return render(
    <MemoryRouter>
      <DemoHome />
    </MemoryRouter>
  )
}

describe('DemoHome', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('muestra el número del día actual', () => {
    renderDemoHome()
    const dayNum = new Date().getDate().toString()
    expect(screen.getByText(dayNum)).toBeInTheDocument()
  })

  it('muestra las 5 app cards con sus labels', () => {
    renderDemoHome()
    expect(screen.getByText(/HOGAR/)).toBeInTheDocument()
    expect(screen.getByText(/PERSONAL/)).toBeInTheDocument()
    expect(screen.getByText(/MASCOTAS/)).toBeInTheDocument()
    expect(screen.getByText(/VEHÍCULO/)).toBeInTheDocument()
    expect(screen.getByText(/FINANZAS/)).toBeInTheDocument()
  })

  it('muestra la tarjeta IA', () => {
    renderDemoHome()
    expect(screen.getByText(/IA/)).toBeInTheDocument()
    expect(screen.getByText(/gasolina/i)).toBeInTheDocument()
  })

  it('muestra "Sin eventos hoy" cuando no hay items', () => {
    renderDemoHome()
    expect(screen.getByText(/sin eventos hoy/i)).toBeInTheDocument()
  })

  it('los links de apps navegan a /demo/:type', () => {
    renderDemoHome()
    const hogarLink = screen.getByText(/🏠 HOGAR/).closest('a')
    expect(hogarLink).toHaveAttribute('href', '/demo/hogar')
  })

  it('aplica tema dark en móvil si no hay preferencia', () => {
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true })
    renderDemoHome()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('aplica tema light en desktop si no hay preferencia', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1440, writable: true })
    renderDemoHome()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('respeta preferencia guardada en localStorage', () => {
    localStorage.setItem('theme', 'dark')
    Object.defineProperty(window, 'innerWidth', { value: 1440, writable: true })
    renderDemoHome()
    // No debería cambiar el tema a light (quedó dark por localStorage)
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
```

- [ ] **Step 2: Correr los tests**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run src/pages/__tests__/DemoHome.test.jsx
```

Expected: PASS — todos en verde.

- [ ] **Step 3: Correr la suite completa**

```bash
cd /home/user/mi-portfolio-proyectos && npm run test:run 2>&1 | tail -15
```

Expected: sin regresiones. Si algún test falla por el cambio de ruta `/demo`, ajustar el mock en ese test.

- [ ] **Step 4: Commit final**

```bash
cd /home/user/mi-portfolio-proyectos && git add src/pages/__tests__/DemoHome.test.jsx && git commit -m "test(demo): cobertura DemoHome — cards, tema, links, empty state"
```

---

## Self-Review

### Cobertura del spec

| Requisito del spec | Cubierto en |
|--------------------|-------------|
| Fecha mínima (número + mes) | Task 2 — DemoHome DateHeader |
| Tareas de hoy cross-app | Task 1 — getDemoTodayItems |
| AHORA para evento activo | Task 1 — getActiveItem |
| App cards 2×3 con stats | Task 2 — getAppStats + grid |
| Tarjeta IA con insight fijo | Task 2 — tarjeta IA hardcoded |
| Tema light desktop / dark móvil | Task 2 — useEffect theme |
| Respetar preferencia guardada | Task 2 — check localStorage |
| initDemoData para todas las apps | Task 2 — useEffect mount |
| Ruta `/demo` → DemoHome | Task 3 — App.jsx |
| Tests | Task 4 |

### Sin placeholders
Revisado — todo el código está completo, sin TBDs.

### Consistencia de tipos
- `getDemoTodayItems()` devuelve `{ id, time, title, appLabel, appColor, allDay }` → DemoHome consume exactamente esos campos.
- `getActiveItem(items)` recibe el mismo array y devuelve un item o `null` → DemoHome usa `?.id`.
- `getAppStats(type)` devuelve `[string, string]` → DemoHome desestructura como `[line1, line2]`.
