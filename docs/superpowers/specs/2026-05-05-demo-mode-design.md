# Demo Mode — Design Spec

**Date:** 2026-05-05  
**Status:** Approved  
**Scope:** Reemplazar sección "Lab" por "Demo" — permite probar las 5 apps sin login ni persistencia real.

---

## Objetivo

Cualquier visitante puede entrar a `/demo`, elegir una app, y probarla con datos de ejemplo que viven solo en sessionStorage. Al cerrar la pestaña, los datos desaparecen. Las rutas `/app/*` y toda la lógica de auth existente no se tocan.

---

## Decisiones clave

| Pregunta | Decisión |
|---|---|
| ¿Auth requerido? | No — demo es completamente público |
| ¿Qué pasa con Lab? | Desaparece — contenido de experiments.js eliminado |
| ¿Punto de entrada? | `/demo` hub con las 5 apps → `/demo/[appType]` |
| ¿Cuántas apps en demo? | Las 5 desde el principio |
| ¿Calidad de mock data? | Semi-dinámica — fechas relativas a `new Date()` |
| ¿Patrón de storage? | Hooks por dominio (Option A) |

---

## Arquitectura

### Rutas nuevas

```
/demo                      → DemoHub       (público, sin auth)
/demo/hogar                → DemoAppLayout + mismos componentes de módulo que /app/hogar
/demo/hogar/shopping       → ShoppingList (sin cambios en la UI)
/demo/finanzas             → DemoAppLayout + mismos componentes de módulo que /app/finanzas
/demo/finanzas/resumen     → FinanzasResumen (sin cambios en la UI)
...etc para vehiculo, personal, mascotas
```

**Los componentes de módulo (ShoppingList, Tareas, Resumen…) no se duplican.** Se reutilizan directamente dentro de DemoAppLayout, que provee el mismo contexto de `app` y `mode` que AppLayout. La única diferencia es que el `app` es un objeto en memoria y los hooks de datos leen/escriben sessionStorage.

Las rutas `/app/*` no cambian.

### Piezas nuevas

| Archivo | Responsabilidad |
|---|---|
| `src/pages/DemoHub.jsx` | Hub público, grid con las 5 apps y botón "Probar" |
| `src/pages/app/DemoAppLayout.jsx` | Shell demo: fake app object, carga mock data, muestra banner |
| `src/components/DemoBanner.jsx` | Banner fijo "Modo demo — los datos no se guardan" |
| `src/contexts/ModeContext.jsx` | Flag global `mode = 'demo' \| 'app'` |
| `src/data/demo/hogar.js` | Mock data de Hogar con fechas relativas |
| `src/data/demo/finanzas.js` | Mock data de Finanzas con fechas relativas |
| `src/data/demo/vehiculo.js` | Mock data de Vehículo con fechas relativas |
| `src/data/demo/personal.js` | Mock data de Personal con fechas relativas |
| `src/data/demo/mascotas.js` | Mock data de Mascotas |
| `src/data/demo/index.js` | Re-exporta todos los mocks + función `initDemoData(appType)` que carga el mock correspondiente en sessionStorage (solo si las keys no existen aún) |
| `src/hooks/data/useItemsData.js` | Items (compras, notas, ideas, mascotas) |
| `src/hooks/data/useEventsData.js` | Eventos calendario (hogar, personal) |
| `src/hooks/data/useRecipesData.js` | Recetas |
| `src/hooks/data/usePetsData.js` | Mascotas |
| `src/hooks/data/useVehiclesData.js` | Vehículos + repostajes + mantenimiento |
| `src/hooks/data/useFinCategoriasData.js` | Categorías finanzas |
| `src/hooks/data/useFinTransaccionesData.js` | Transacciones finanzas |
| `src/hooks/data/useFinPresupuestosData.js` | Presupuestos finanzas |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/App.jsx` | Añadir rutas `/demo/*`, eliminar `/lab` |
| `src/components/Layout.jsx` | "Lab" → "Demo", `/lab` → `/demo` |
| `src/main.jsx` | Añadir `ModeProvider` al árbol de providers |
| `src/pages/app/AppLayout.jsx` | Setear `mode = 'app'` en ModeContext |
| `~25 módulos` | Reemplazar llamadas directas a supabase con los hooks de datos |

---

## ModeContext

```jsx
// src/contexts/ModeContext.jsx
const ModeContext = createContext({ mode: 'app', setMode: () => {} })

export function ModeProvider({ children }) {
  const [mode, setMode] = useState('app')
  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>
}

export const useMode = () => useContext(ModeContext)
```

Vive en `main.jsx` dentro de `AuthProvider` pero fuera de `ProtectedRoute`.

---

## DemoAppLayout

```jsx
// src/pages/app/DemoAppLayout.jsx
export default function DemoAppLayout() {
  const { appType } = useParams()  // 'hogar' | 'finanzas' | ...
  const { setMode } = useMode()

  useEffect(() => {
    setMode('demo')
    initDemoData(appType)  // carga mock en sessionStorage si está vacío
    return () => setMode('app')
  }, [appType])

  const fakeApp = { id: `demo-${appType}`, name: appType, slug: `demo-${appType}` }

  // misma estructura visual que AppLayout (sidebar + tabs mobile)
  // + DemoBanner encima del contenido
}
```

`initDemoData(appType)` carga el mock data del app en sessionStorage solo si la key no existe — así las mutaciones del usuario persisten durante la sesión.

---

## Patrón de data hooks

Firma estándar para todos los hooks:

```js
const { data, loading, add, update, remove } = useXxxData({ appId, mode, ...filters })
```

Lógica interna:

```js
export function useItemsData({ appId, mode, module }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    if (mode === 'demo') {
      const key = `demo-${appId}-items-${module}`
      const stored = sessionStorage.getItem(key)
      setItems(stored ? JSON.parse(stored) : [])
    } else {
      supabase.from('items').select('*')
        .eq('app_id', appId).eq('module', module)
        .then(({ data }) => setItems(data ?? []))
    }
  }, [appId, mode, module])

  function add(item) {
    if (mode === 'demo') {
      const newItem = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      const updated = [...items, newItem]
      sessionStorage.setItem(`demo-${appId}-items-${module}`, JSON.stringify(updated))
      setItems(updated)
    } else {
      supabase.from('items').insert({ ...item, app_id: appId }).select().single()
        .then(({ data }) => setItems(prev => [...prev, data]))
    }
  }

  // update, remove siguen el mismo patrón

  return { items, loading, add, update, remove }
}
```

---

## Mock data — estructura

Cada archivo `src/data/demo/[app].js` exporta datos con fechas relativas:

```js
// src/data/demo/finanzas.js
import { subDays, startOfMonth, format } from 'date-fns'

const hoy = new Date()

export const mockFinanzas = {
  'fin_categories': [
    { id: 'demo-cat-1', name: 'Alimentación', type: 'expense', icon: '🛒', color: '#f59e0b' },
    { id: 'demo-cat-2', name: 'Transporte', type: 'expense', icon: '🚌', color: '#3b82f6' },
    { id: 'demo-cat-3', name: 'Nómina', type: 'income', icon: '💼', color: '#10b981' },
    // ~10 categorías
  ],
  'fin_transactions': [
    { id: 'demo-tx-1', type: 'expense', amount: 85.40, description: 'Mercadona', 
      category_id: 'demo-cat-1', date: format(subDays(hoy, 2), 'yyyy-MM-dd') },
    { id: 'demo-tx-2', type: 'income', amount: 2400, description: 'Nómina marzo',
      category_id: 'demo-cat-3', date: format(startOfMonth(hoy), 'yyyy-MM-dd') },
    // ~15 transacciones del mes actual
  ],
  'fin_budgets': [
    { id: 'demo-b-1', category_id: 'demo-cat-1', 
      month: format(hoy, 'yyyy-MM'), limit_amount: 400 },
    // presupuestos para categorías principales
  ]
}
```

```js
// src/data/demo/vehiculo.js
export const mockVehiculo = {
  'vehicles': [
    { id: 'demo-v1', name: 'Mi coche', brand: 'Volkswagen', model: 'Golf',
      year: 2019, fuel_type: 'gasolina', initial_km: 85000 }
  ],
  'fuel_logs': [
    { id: 'demo-fl-1', vehicle_id: 'demo-v1', liters: 42.3, price_per_liter: 1.689,
      total_cost: 71.45, km_at_fill: 87420, full_tank: true, 
      date: format(subDays(hoy, 5), 'yyyy-MM-dd') },
    // ~8 repostajes últimos 3 meses
  ],
  'maintenance_logs': [ /* ~4 registros */ ]
}
```

**Mascotas:** 2 animales (perro + gato) con registros de salud recientes  
**Hogar:** lista de la compra con ~10 productos, 3 recetas, eventos de calendario esta semana  
**Personal:** 5 tareas (2 con due date esta semana), 3 notas, 2 ideas

---

## DemoBanner

```jsx
// src/components/DemoBanner.jsx
export default function DemoBanner() {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 
                    dark:border-amber-800 px-4 py-2 flex items-center gap-3 text-sm">
      <span className="text-amber-600 dark:text-amber-400 font-medium">
        Modo demo
      </span>
      <span className="text-amber-700 dark:text-amber-300">
        Los datos no se guardan al cerrar la sesión.
      </span>
      <a href="/login" className="ml-auto text-amber-600 dark:text-amber-400 
                                  underline hover:no-underline">
        Crear cuenta →
      </a>
    </div>
  )
}
```

---

## DemoHub

Replica el grid de `AppsHub` pero:
- Sin `ProtectedRoute`
- Botón "Probar" en lugar de acceso directo
- Usa los mismos datos de `src/data/apps.js` (icono, nombre, descripción)
- Sin lógica de auth

---

## Migración de módulos

Cada módulo pasa de:
```jsx
// antes
const { data, error } = await supabase.from('items').select('*').eq('app_id', app.id)
```

A:
```jsx
// después
const { items, add, update, remove } = useItemsData({ appId: app.id, mode, module: 'supermercado' })
```

El `mode` llega de `useMode()` — cada módulo añade `const { mode } = useMode()` y lo pasa al hook. El `app.id` llega de `useOutletContext()` o `useApp()` como antes — en demo mode será `'demo-hogar'` etc.

**Módulos por hook:**

| Hook | Módulos afectados |
|---|---|
| `useItemsData` | ShoppingList, Inventario, PersonalNotas, PersonalIdeas, Mascotas sub-módulos |
| `useEventsData` | Calendar (Hogar), Limpieza, Menu, Calendar (Personal) |
| `useRecipesData` | Recipes, RecipeDetail, Menu |
| `usePetsData` | MisMascotas, PetDetail |
| `useVehiclesData` | MisVehiculos, VehiculoDetail, Repostajes, Mantenimiento, VehiculoGastos, Estadisticas |
| `useFinCategoriasData` | Categorias, Transacciones, Presupuestos, Resumen |
| `useFinTransaccionesData` | Transacciones, Resumen |
| `useFinPresupuestosData` | Presupuestos, Resumen |

---

## Lo que NO cambia

- `AppLayout.jsx` — solo añade `setMode('app')` en useEffect
- Todos los estilos y componentes UI de los módulos
- Lógica de auth (`AuthContext`, `ProtectedRoute`)
- Supabase schema y migraciones
- Rutas `/app/*`
- Design system (Tailwind, colores, tipografía)

---

## Criterios de éxito

1. `/demo` accesible sin login desde el navbar
2. Todas las operaciones CRUD funcionan en demo (add, edit, delete actualiza sessionStorage)
3. Al navegar entre módulos dentro de una sesión, los datos persisten
4. Al cerrar y reabrir la pestaña, los datos demo se resetean al mock inicial
5. Las rutas `/app/*` funcionan exactamente igual que antes
6. El banner es visible en todas las vistas demo
7. No hay errores de consola en modo demo
