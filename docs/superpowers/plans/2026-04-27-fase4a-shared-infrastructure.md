# Fase 4a — Shared Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generalizar AppLayout y el routing para soportar múltiples tipos de app (mascotas, vehículo, finanzas) con auto-creación del registro en DB y stubs de Welcome para cada app nueva.

**Architecture:** Un único `AppLayout.jsx` con un `MODULE_MAP` indexado por `app.type`; extrae el tipo de app desde la URL (`location.pathname`). Si no existe un registro en `apps` para ese tipo y usuario, lo crea automáticamente antes de renderizar. Tres rutas nuevas en `App.jsx` apuntan al mismo `AppLayout`. Cada app nueva tiene un `Welcome.jsx` stub en su propia carpeta de módulos.

**Tech Stack:** React 19, React Router v6, Supabase JS v2, Tailwind CSS 4

---

## File Map

| Acción | Archivo | Responsabilidad |
|---|---|---|
| Modificar | `src/pages/app/modules/Welcome.jsx` | Corregir `project` → `app` (bug existente) |
| Crear | `src/pages/app/modules/mascotas/Welcome.jsx` | Stub Welcome para Mascotas |
| Crear | `src/pages/app/modules/vehiculo/Welcome.jsx` | Stub Welcome para Vehículo |
| Crear | `src/pages/app/modules/finanzas/Welcome.jsx` | Stub Welcome para Finanzas |
| Crear | `src/pages/app/modules/mascotas/__tests__/Welcome.test.jsx` | Tests render stubs |
| Modificar | `src/pages/app/AppLayout.jsx` | MODULE_MAP + query type-aware + auto-create |
| Modificar | `src/App.jsx` | Rutas + imports para 3 apps nuevas |
| Modificar | `src/data/apps.js` | Marcar mascotas/vehiculo/finanzas como active |

---

## Task 1: Welcome stubs + fix Welcome.jsx existente

**Files:**
- Modify: `src/pages/app/modules/Welcome.jsx`
- Create: `src/pages/app/modules/mascotas/Welcome.jsx`
- Create: `src/pages/app/modules/vehiculo/Welcome.jsx`
- Create: `src/pages/app/modules/finanzas/Welcome.jsx`
- Create: `src/pages/app/modules/mascotas/__tests__/Welcome.test.jsx`

**Contexto:** El `Welcome.jsx` existente usa `const { project } = useOutletContext()` pero `AppLayout` pasa `{ app, modules }`. Esto causa un crash silencioso. Los tres stubs nuevos deben usar `app` correctamente desde el inicio.

- [ ] **Step 1: Escribir tests para los stubs**

Crea el archivo de test en `src/pages/app/modules/mascotas/__tests__/Welcome.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

// Mock react-router-dom para controlar useOutletContext
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useOutletContext: () => ({
      app: { id: 'abc', icon: '🐾', name: 'Mascotas', type: 'mascotas' },
      modules: [{ path: 'welcome', label: 'Inicio', icon: '🐾' }],
    }),
  }
})

import MascotasWelcome from '../Welcome'

describe('Mascotas Welcome', () => {
  it('muestra el nombre de la app', () => {
    render(<MascotasWelcome />)
    expect(screen.getByText('Mascotas')).toBeInTheDocument()
  })

  it('muestra el icono de la app', () => {
    render(<MascotasWelcome />)
    expect(screen.getByText('🐾')).toBeInTheDocument()
  })

  it('muestra mensaje de próximamente', () => {
    render(<MascotasWelcome />)
    expect(screen.getByText(/próximamente/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Ejecutar tests para verificar que fallan**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/mascotas/__tests__/Welcome.test.jsx
```

Esperado: FAIL — "Cannot find module '../Welcome'"

- [ ] **Step 3: Corregir Welcome.jsx existente**

Edita `src/pages/app/modules/Welcome.jsx` completo:

```jsx
import { useOutletContext } from 'react-router-dom'

export default function Welcome() {
  const { app } = useOutletContext()
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="text-5xl mb-4">{app.icon}</div>
      <h2 className="text-xl font-bold text-[var(--text)] mb-2">{app.name}</h2>
      <p className="text-[var(--text-muted)] text-sm max-w-xs">
        Selecciona un módulo en el menú lateral para empezar
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Crear src/pages/app/modules/mascotas/Welcome.jsx**

```jsx
import { useOutletContext } from 'react-router-dom'

export default function MascotasWelcome() {
  const { app } = useOutletContext()
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="text-5xl mb-4">{app.icon}</div>
      <h2 className="text-xl font-bold text-[var(--text)] mb-2">{app.name}</h2>
      <p className="text-[var(--text-muted)] text-sm max-w-xs mb-1">
        Selecciona un módulo en el menú lateral para empezar
      </p>
      <p className="text-[var(--text-faint)] text-xs">
        Próximamente más módulos
      </p>
    </div>
  )
}
```

- [ ] **Step 5: Crear src/pages/app/modules/vehiculo/Welcome.jsx**

```jsx
import { useOutletContext } from 'react-router-dom'

export default function VehiculoWelcome() {
  const { app } = useOutletContext()
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="text-5xl mb-4">{app.icon}</div>
      <h2 className="text-xl font-bold text-[var(--text)] mb-2">{app.name}</h2>
      <p className="text-[var(--text-muted)] text-sm max-w-xs mb-1">
        Selecciona un módulo en el menú lateral para empezar
      </p>
      <p className="text-[var(--text-faint)] text-xs">
        Próximamente más módulos
      </p>
    </div>
  )
}
```

- [ ] **Step 6: Crear src/pages/app/modules/finanzas/Welcome.jsx**

```jsx
import { useOutletContext } from 'react-router-dom'

export default function FinanzasWelcome() {
  const { app } = useOutletContext()
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="text-5xl mb-4">{app.icon}</div>
      <h2 className="text-xl font-bold text-[var(--text)] mb-2">{app.name}</h2>
      <p className="text-[var(--text-muted)] text-sm max-w-xs mb-1">
        Selecciona un módulo en el menú lateral para empezar
      </p>
      <p className="text-[var(--text-faint)] text-xs">
        Próximamente más módulos
      </p>
    </div>
  )
}
```

- [ ] **Step 7: Ejecutar tests para verificar que pasan**

```bash
npx vitest run src/pages/app/modules/mascotas/__tests__/Welcome.test.jsx
```

Esperado: PASS — 3 tests passing

- [ ] **Step 8: Ejecutar suite completa para verificar no hay regresiones**

```bash
npx vitest run
```

Esperado: todos los tests pasan (misma cantidad que antes + 3 nuevos)

- [ ] **Step 9: Commit**

```bash
git add src/pages/app/modules/Welcome.jsx \
        src/pages/app/modules/mascotas/Welcome.jsx \
        src/pages/app/modules/vehiculo/Welcome.jsx \
        src/pages/app/modules/finanzas/Welcome.jsx \
        src/pages/app/modules/mascotas/__tests__/Welcome.test.jsx
git commit -m "feat: add Welcome stubs for mascotas/vehiculo/finanzas, fix hogar Welcome context"
```

---

## Task 2: Generalizar AppLayout (MODULE_MAP + auto-create)

**Files:**
- Modify: `src/pages/app/AppLayout.jsx`

**Contexto:** El archivo actual está en `/home/user/mi-portfolio-proyectos/src/pages/app/AppLayout.jsx`. Cambios clave:
1. Añadir `MODULE_MAP` con los módulos de cada tipo de app
2. Extraer `appType` desde `location.pathname` (ej: `/app/mascotas/welcome` → `'mascotas'`)
3. Cambiar el query de Supabase: filtrar por `type = appType`, auto-crear si no existe
4. Cambiar `const modules = HOGAR_MODULES` → `const modules = MODULE_MAP[app?.type] ?? []`

No hay tests unitarios para AppLayout (requiere mock de Supabase complejo); se verifica manualmente en Step 4.

- [ ] **Step 1: Añadir constantes MODULE_MAP y APP_NAMES**

Edita `src/pages/app/AppLayout.jsx`. Reemplaza el bloque de constantes al inicio del archivo (líneas 7-16 actuales):

```js
const APP_NAMES = {
  hogar:    'Hogar',
  mascotas: 'Mascotas',
  vehiculo: 'Vehículo',
  finanzas: 'Finanzas',
}

const HOGAR_MODULES = [
  { path: 'calendar',   label: 'Calendario', icon: '📅' },
  { path: 'shopping',   label: 'Lista',       icon: '🛒' },
  { path: 'menu',       label: 'Menú',        icon: '🍽️' },
  { path: 'recipes',    label: 'Recetas',     icon: '👨‍🍳' },
  { path: 'inventario', label: 'Inventario',  icon: '📦' },
  { path: 'limpieza',   label: 'Limpieza',    icon: '🧹' },
]

const MASCOTAS_MODULES = [
  { path: 'welcome', label: 'Inicio', icon: '🐾' },
]

const VEHICULO_MODULES = [
  { path: 'welcome', label: 'Inicio', icon: '🚗' },
]

const FINANZAS_MODULES = [
  { path: 'welcome', label: 'Inicio', icon: '💰' },
]

const MODULE_MAP = {
  hogar:    HOGAR_MODULES,
  mascotas: MASCOTAS_MODULES,
  vehiculo: VEHICULO_MODULES,
  finanzas: FINANZAS_MODULES,
}

const FULL_LAYOUT_MODULES = ['calendar', 'shopping', 'menu', 'recipes', 'inventario', 'limpieza']
```

- [ ] **Step 2: Actualizar el useEffect para ser type-aware con auto-create**

Dentro del componente `AppLayout`, reemplaza el `useEffect` actual (líneas 28-43) con:

```js
const appType = location.pathname.split('/').filter(Boolean)[1] // 'hogar' | 'mascotas' | 'vehiculo' | 'finanzas'

useEffect(() => {
  if (!user) return
  let cancelled = false

  async function loadOrCreateApp() {
    // 1. Buscar app existente del tipo correcto
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('owner_id', user.id)
      .eq('type', appType)
      .maybeSingle()

    if (cancelled) return

    if (error) { navigate('/apps'); return }

    if (data) {
      setApp(data)
      setLoading(false)
      return
    }

    // 2. No existe — auto-crear
    if (!APP_NAMES[appType]) { navigate('/apps'); return }

    const { data: created, error: createError } = await supabase
      .from('apps')
      .insert({ type: appType, name: APP_NAMES[appType], owner_id: user.id })
      .select()
      .single()

    if (cancelled) return

    if (createError || !created) { navigate('/apps'); return }

    setApp(created)
    setLoading(false)
  }

  loadOrCreateApp()
  return () => { cancelled = true }
}, [user, navigate, appType])
```

- [ ] **Step 3: Cambiar la línea de modules**

Reemplaza la línea 53 actual:
```js
const modules = HOGAR_MODULES
```
por:
```js
const modules = MODULE_MAP[app?.type] ?? []
```

- [ ] **Step 4: Verificar manualmente en el navegador**

Abre la app en desarrollo (`npm run dev`). Verifica:
- `/app/hogar` → carga igual que antes, muestra los 6 módulos de Hogar
- `/app/mascotas` → crea registro en Supabase (tabla `apps`) y muestra módulo "Inicio"
- `/app/vehiculo` → ídem
- `/app/finanzas` → ídem
- Volver a `/app/mascotas` → reutiliza el mismo registro (no crea duplicado)

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/AppLayout.jsx
git commit -m "feat: generalize AppLayout with MODULE_MAP and auto-create app record by type"
```

---

## Task 3: Rutas en App.jsx para las tres apps nuevas

**Files:**
- Modify: `src/App.jsx`

**Contexto:** Actualmente solo existe la ruta `/app/hogar/*`. Hay que añadir rutas para mascotas, vehiculo y finanzas con el mismo patrón. Los Welcome stubs se importan como lazy components. La función `getAnimKey` también necesita cubrir las rutas nuevas para que la animación de página funcione correctamente.

- [ ] **Step 1: Añadir imports lazy de los tres Welcome stubs**

En `src/App.jsx`, después de las líneas de imports lazy existentes (cerca de la línea 25), añade:

```js
const MascotasWelcome = React.lazy(() => import('./pages/app/modules/mascotas/Welcome'))
const VehiculoWelcome  = React.lazy(() => import('./pages/app/modules/vehiculo/Welcome'))
const FinanzasWelcome  = React.lazy(() => import('./pages/app/modules/finanzas/Welcome'))
```

- [ ] **Step 2: Actualizar getAnimKey para cubrir todas las rutas de app**

Reemplaza la función `getAnimKey` actual (líneas 65-68):

```js
function getAnimKey(pathname) {
  const match = pathname.match(/^\/app\/(\w+)/)
  if (match) return `/app/${match[1]}`
  return pathname
}
```

- [ ] **Step 3: Añadir las tres rutas nuevas en el bloque de Routes**

Después del bloque `{/* Hogar */}` (después de la línea que cierra el Route de hogar), añade:

```jsx
{/* Mascotas */}
<Route path="/app/mascotas" element={
  <ProtectedRoute><AppLayout /></ProtectedRoute>
}>
  <Route index element={<MascotasWelcome />} />
  <Route path="welcome" element={<MascotasWelcome />} />
</Route>

{/* Vehículo */}
<Route path="/app/vehiculo" element={
  <ProtectedRoute><AppLayout /></ProtectedRoute>
}>
  <Route index element={<VehiculoWelcome />} />
  <Route path="welcome" element={<VehiculoWelcome />} />
</Route>

{/* Finanzas */}
<Route path="/app/finanzas" element={
  <ProtectedRoute><AppLayout /></ProtectedRoute>
}>
  <Route index element={<FinanzasWelcome />} />
  <Route path="welcome" element={<FinanzasWelcome />} />
</Route>
```

- [ ] **Step 4: Ejecutar suite completa**

```bash
npx vitest run
```

Esperado: todos los tests pasan.

- [ ] **Step 5: Verificar en navegador**

Navega manualmente a `/app/mascotas`, `/app/vehiculo`, `/app/finanzas`. Cada uno debe:
- Mostrar el sidebar con "Inicio" como único módulo
- Mostrar el Welcome stub con nombre e icono de la app
- No mostrar errores en consola

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add routing for mascotas, vehiculo, finanzas apps"
```

---

## Task 4: Activar apps en apps.js

**Files:**
- Modify: `src/data/apps.js`

**Contexto:** Las tres apps nuevas tienen `status: 'coming_soon'`. AppsHub probablemente las muestra de forma diferente (bloqueadas o sin enlace) cuando el status es coming_soon. Hay que cambiarlas a `active` y añadir version/lastUpdated.

- [ ] **Step 1: Actualizar apps.js**

Edita `src/data/apps.js` completo:

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
    description: 'Combustible, mantenimiento y gastos de tu vehículo.',
    icon: '🚗',
    href: '/app/vehiculo',
    status: 'active',
    requiredPlan: 'free',
    color: 'from-blue-500 to-indigo-500',
    version: '0.1.0',
    lastUpdated: '2026-04',
    features: ['Combustible', 'Mantenimiento', 'Gastos'],
  },
  {
    slug: 'finanzas',
    title: 'Finanzas',
    description: 'Resumen financiero agregado de todas tus apps.',
    icon: '💰',
    href: '/app/finanzas',
    status: 'active',
    requiredPlan: 'free',
    color: 'from-emerald-500 to-teal-500',
    version: '0.1.0',
    lastUpdated: '2026-04',
    features: ['Gastos', 'Resumen mensual', 'Categorías'],
  },
]
```

- [ ] **Step 2: Verificar en AppsHub**

Navega a `/apps` en el navegador. Las cuatro apps deben aparecer como activas y sus enlaces deben funcionar.

- [ ] **Step 3: Ejecutar suite completa**

```bash
npx vitest run
```

Esperado: todos los tests pasan.

- [ ] **Step 4: Commit**

```bash
git add src/data/apps.js
git commit -m "feat: activate mascotas, vehiculo, finanzas apps in registry"
```
