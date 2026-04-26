# Fase 1 — Big Bang Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar todo el esquema de Supabase al nuevo modelo unificado (`apps`, `items`, `events`) y actualizar todos los módulos de Hogar para que funcionen sobre el nuevo esquema sin pérdida de funcionalidad.

**Architecture:** Big Bang — un único script SQL migra y renombra todas las tablas en una transacción. El código React se refactoriza en paralelo usando helpers de transformación para minimizar cambios en la lógica UI existente. Al finalizar, la app funciona exactamente igual que antes pero sobre el nuevo esquema.

**Tech Stack:** React 19, Supabase JS v2, Tailwind CSS 4, Framer Motion, React Router v7

**Spec:** `docs/superpowers/specs/2026-04-26-h3nky-sistema-modular-design.md`

> **Nota de alcance:** Este plan cubre solo la Fase 1. Las Fases 2-5 tendrán planes separados que se escribirán cuando esta fase esté completa y funcionando.

---

## Archivos que se crean o modifican

| Archivo | Acción |
|---|---|
| `supabase/migrations/20260426_big_bang_migration.sql` | **Crear** — migración completa |
| `src/contexts/AppContext.jsx` | **Crear** — reemplaza ProjectContext |
| `src/contexts/ProjectContext.jsx` | **Eliminar** (tras migrar importaciones) |
| `src/pages/app/AppLayout.jsx` | **Crear** — reemplaza HogarLayout |
| `src/pages/app/HogarLayout.jsx` | **Eliminar** (tras crear AppLayout) |
| `src/App.jsx` | **Modificar** — imports + rutas |
| `src/pages/app/modules/Calendar.jsx` | **Modificar** — tabla + columnas |
| `src/pages/app/modules/ShoppingList.jsx` | **Modificar** — tabla + shape de datos |
| `src/pages/app/modules/Menu.jsx` | **Modificar** — tabla + shape de datos |
| `src/pages/app/modules/Recipes.jsx` | **Modificar** — columna project_id → app_id |
| `src/pages/app/modules/RecipeDetail.jsx` | **Modificar** — columna project_id → app_id |
| `src/data/apps.js` | **Modificar** — añadir apps nuevas (coming_soon) |
| `src/utils/itemTransformers.js` | **Crear** — helpers fromDb/toDb para items |
| `src/utils/menuTransformers.js` | **Crear** — helpers para menu events |

---

## Task 1: Escribir la migración SQL

**Files:**
- Create: `supabase/migrations/20260426_big_bang_migration.sql`

- [ ] **Step 1: Crear el archivo de migración**

```sql
-- supabase/migrations/20260426_big_bang_migration.sql
BEGIN;

-- ══════════════════════════════════════════════════════
-- 1. RENOMBRAR projects → apps
-- ══════════════════════════════════════════════════════
ALTER TABLE projects RENAME TO apps;
ALTER TABLE apps ADD COLUMN type TEXT DEFAULT 'hogar'
  CHECK(type IN ('hogar','personal','vehiculo','finanzas','mascotas'));
UPDATE apps SET type = 'hogar';

-- ══════════════════════════════════════════════════════
-- 2. MIGRAR calendar_tasks → events
-- ══════════════════════════════════════════════════════
ALTER TABLE calendar_tasks RENAME COLUMN project_id TO app_id;
ALTER TABLE calendar_tasks ADD COLUMN event_type TEXT DEFAULT 'task';
ALTER TABLE calendar_tasks ADD COLUMN item_id UUID;
ALTER TABLE calendar_tasks ADD COLUMN metadata JSONB DEFAULT '{}';
UPDATE calendar_tasks SET event_type = 'task';
ALTER TABLE calendar_tasks RENAME TO events;

-- ══════════════════════════════════════════════════════
-- 3. CREAR tabla items (absorberá shopping_items)
-- ══════════════════════════════════════════════════════
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  type TEXT DEFAULT 'generic',
  title TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'shared' CHECK(visibility IN ('shared','private')),
  owner_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  checked BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════
-- 4. MIGRAR shopping_items → items
-- ══════════════════════════════════════════════════════
INSERT INTO items (id, app_id, module, type, title, metadata, checked, checked_at, created_at)
SELECT
  id,
  project_id,
  'supermercado',
  'product',
  name,
  jsonb_build_object(
    'quantity',   quantity,
    'unit',       COALESCE(unit, ''),
    'category',   COALESCE(category, 'otros'),
    'store',      COALESCE(store, 'General'),
    'price_unit', price_unit
  ),
  checked,
  checked_at,
  created_at
FROM shopping_items;

-- ══════════════════════════════════════════════════════
-- 5. MIGRAR menu_items → events (event_type = 'meal')
-- ══════════════════════════════════════════════════════
INSERT INTO events (
  id, app_id, event_type, title, start_time, all_day, metadata, created_at
)
SELECT
  id,
  project_id,
  'meal',
  COALESCE(custom_name, '(comida)'),
  -- Construir timestamp: week_start + day_of_week days + hora según meal_type
  (week_start::date + (day_of_week || ' days')::interval +
    CASE meal_type
      WHEN 'desayuno' THEN interval '8 hours'
      WHEN 'almuerzo' THEN interval '11 hours'
      WHEN 'comida'   THEN interval '14 hours'
      WHEN 'cena'     THEN interval '21 hours'
      ELSE interval '12 hours'
    END
  ),
  false,
  jsonb_build_object(
    'meal_type',   meal_type,
    'recipe_id',   recipe_id,
    'day_of_week', day_of_week,
    'week_start',  week_start::text,
    'custom_name', custom_name
  ),
  created_at
FROM menu_items;

-- ══════════════════════════════════════════════════════
-- 6. ACTUALIZAR project_id → app_id en recipes y project_members
-- ══════════════════════════════════════════════════════
ALTER TABLE recipes RENAME COLUMN project_id TO app_id;
ALTER TABLE project_members RENAME COLUMN project_id TO app_id;

-- ══════════════════════════════════════════════════════
-- 7. CREAR NUEVAS TABLAS (Fase 2+)
-- ══════════════════════════════════════════════════════
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  purchase_unit TEXT DEFAULT 'unidad',
  purchase_quantity INT DEFAULT 1,
  category TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  quantity INT DEFAULT 0,
  remaining_units INT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, app_id)
);

CREATE TABLE product_consumption (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  last_purchase_date DATE,
  avg_days_between_purchases INT,
  estimated_next_purchase DATE,
  confidence TEXT DEFAULT 'baja' CHECK(confidence IN ('alta','media','baja')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, app_id)
);

CREATE TABLE recipe_ingredients (
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  PRIMARY KEY (recipe_id, product_id)
);

CREATE TABLE diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════
-- 8. HABILITAR RLS EN NUEVAS TABLAS
-- ══════════════════════════════════════════════════════
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════
-- 9. FUNCIÓN HELPER PARA RLS
-- ══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION is_app_member(p_app_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM apps WHERE id = p_app_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM project_members
    WHERE app_id = p_app_id AND user_id = auth.uid() AND accepted = true
  )
$$;

-- ══════════════════════════════════════════════════════
-- 10. POLÍTICAS RLS ACTUALIZADAS
-- ══════════════════════════════════════════════════════

-- apps
DROP POLICY IF EXISTS "project_owner" ON apps;
DROP POLICY IF EXISTS "project_member_read" ON apps;
CREATE POLICY "apps_owner" ON apps
  FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "apps_member_read" ON apps
  FOR SELECT USING (
    id IN (SELECT app_id FROM project_members WHERE user_id = auth.uid() AND accepted = true)
  );

-- events (era calendar_tasks)
DROP POLICY IF EXISTS "tasks_by_project_member" ON events;
CREATE POLICY "events_by_app_member" ON events
  FOR ALL USING (is_app_member(app_id));

-- items (nuevo)
CREATE POLICY "items_by_app_member" ON items
  FOR ALL USING (is_app_member(app_id));

-- recipes
DROP POLICY IF EXISTS "recipes_by_member" ON recipes;
CREATE POLICY "recipes_by_app_member" ON recipes
  FOR ALL USING (is_app_member(app_id));

-- products (catálogo global, accesible por todos los usuarios autenticados)
CREATE POLICY "products_authenticated" ON products
  FOR ALL USING (auth.uid() IS NOT NULL);

-- inventory
CREATE POLICY "inventory_by_app_member" ON inventory
  FOR ALL USING (is_app_member(app_id));

-- product_consumption
CREATE POLICY "consumption_by_app_member" ON product_consumption
  FOR ALL USING (is_app_member(app_id));

-- recipe_ingredients
CREATE POLICY "recipe_ingredients_via_recipe" ON recipe_ingredients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
        AND is_app_member(recipes.app_id)
    )
  );

-- diet_plans
CREATE POLICY "diet_plans_by_app_member" ON diet_plans
  FOR ALL USING (is_app_member(app_id));

-- ══════════════════════════════════════════════════════
-- 11. ELIMINAR TABLAS ANTIGUAS
-- ══════════════════════════════════════════════════════
DROP TABLE IF EXISTS shopping_items;
DROP TABLE IF EXISTS menu_items;

COMMIT;
```

- [ ] **Step 2: Verificar que el archivo existe**

```bash
ls -la supabase/migrations/20260426_big_bang_migration.sql
```
Expected: file visible with ~180 lines

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260426_big_bang_migration.sql
git commit -m "feat(db): big bang migration — apps/items/events schema"
```

---

## Task 2: Crear helpers de transformación

Los módulos usan campos directos (`item.name`, `item.category`). Los helpers encapsulan la conversión entre el shape de DB (campos en `metadata`) y el shape que espera la UI.

**Files:**
- Create: `src/utils/itemTransformers.js`
- Create: `src/utils/menuTransformers.js`
- Create: `src/utils/__tests__/itemTransformers.test.js`
- Create: `src/utils/__tests__/menuTransformers.test.js`

- [ ] **Step 1: Escribir los tests de itemTransformers (TDD)**

```js
// src/utils/__tests__/itemTransformers.test.js
import { describe, it, expect } from 'vitest'
import { itemFromDb, itemToDb } from '../itemTransformers'

describe('itemFromDb', () => {
  it('aplana los campos de metadata al nivel raíz', () => {
    const dbRow = {
      id: 'abc',
      app_id: 'app1',
      module: 'supermercado',
      title: 'Leche',
      checked: false,
      checked_at: null,
      created_at: '2026-04-01T00:00:00Z',
      metadata: { quantity: 2, unit: 'L', category: 'lacteos', store: 'Mercadona', price_unit: 1.2 },
    }
    const result = itemFromDb(dbRow)
    expect(result.name).toBe('Leche')
    expect(result.quantity).toBe(2)
    expect(result.unit).toBe('L')
    expect(result.category).toBe('lacteos')
    expect(result.store).toBe('Mercadona')
    expect(result.price_unit).toBe(1.2)
  })

  it('usa valores por defecto cuando faltan campos en metadata', () => {
    const dbRow = {
      id: 'abc', app_id: 'app1', module: 'supermercado',
      title: 'Pan', checked: false, checked_at: null,
      created_at: '2026-04-01T00:00:00Z',
      metadata: {},
    }
    const result = itemFromDb(dbRow)
    expect(result.category).toBe('otros')
    expect(result.store).toBe('General')
    expect(result.quantity).toBeNull()
    expect(result.unit).toBe('')
    expect(result.price_unit).toBeNull()
  })
})

describe('itemToDb', () => {
  it('construye el payload correcto para INSERT', () => {
    const result = itemToDb('app1', 'Huevos', 12, 'ud', 'lacteos', 'Lidl')
    expect(result).toEqual({
      app_id: 'app1',
      module: 'supermercado',
      type: 'product',
      title: 'Huevos',
      metadata: { quantity: 12, unit: 'ud', category: 'lacteos', store: 'Lidl', price_unit: null },
    })
  })

  it('permite price_unit opcional', () => {
    const result = itemToDb('app1', 'Pasta', 1, 'kg', 'pan', 'Mercadona', 2.5)
    expect(result.metadata.price_unit).toBe(2.5)
  })
})
```

- [ ] **Step 2: Ejecutar tests (deben fallar)**

```bash
npx vitest run src/utils/__tests__/itemTransformers.test.js
```
Expected: FAIL — `Cannot find module '../itemTransformers'`

- [ ] **Step 3: Crear itemTransformers.js**

```js
// src/utils/itemTransformers.js
export function itemFromDb(row) {
  return {
    ...row,
    name:       row.title,
    quantity:   row.metadata?.quantity ?? null,
    unit:       row.metadata?.unit ?? '',
    category:   row.metadata?.category ?? 'otros',
    store:      row.metadata?.store ?? 'General',
    price_unit: row.metadata?.price_unit ?? null,
  }
}

export function itemToDb(appId, name, quantity, unit, category, store, priceUnit = null) {
  return {
    app_id:  appId,
    module:  'supermercado',
    type:    'product',
    title:   name,
    metadata: { quantity, unit, category, store, price_unit: priceUnit },
  }
}
```

- [ ] **Step 4: Ejecutar tests de itemTransformers (deben pasar)**

```bash
npx vitest run src/utils/__tests__/itemTransformers.test.js
```
Expected: PASS (4 tests)

- [ ] **Step 5: Escribir tests de menuTransformers**

```js
// src/utils/__tests__/menuTransformers.test.js
import { describe, it, expect } from 'vitest'
import { menuEventFromDb, menuEventToDb } from '../menuTransformers'

describe('menuEventFromDb', () => {
  it('expone day_of_week y meal_type desde metadata', () => {
    const ev = {
      id: 'ev1', app_id: 'app1', event_type: 'meal',
      title: 'Paella',
      start_time: '2026-04-28T14:00:00Z',
      metadata: { meal_type: 'comida', recipe_id: 'rec1', day_of_week: 1, week_start: '2026-04-27', custom_name: 'Paella' },
    }
    const result = menuEventFromDb(ev)
    expect(result.meal_type).toBe('comida')
    expect(result.day_of_week).toBe(1)
    expect(result.recipe_id).toBe('rec1')
    expect(result.custom_name).toBe('Paella')
    expect(result.week_start).toBe('2026-04-27')
  })
})

describe('menuEventToDb', () => {
  it('construye un evento de comida con start_time correcto', () => {
    const result = menuEventToDb('app1', '2026-04-27', 1, 'comida', 'Paella', 'rec1')
    expect(result.app_id).toBe('app1')
    expect(result.event_type).toBe('meal')
    expect(result.title).toBe('Paella')
    expect(result.metadata.meal_type).toBe('comida')
    expect(result.metadata.day_of_week).toBe(1)
    expect(result.metadata.recipe_id).toBe('rec1')
    // start_time debe ser lunes (día 1 de semana 2026-04-27) a las 14:00
    const d = new Date(result.start_time)
    expect(d.getHours()).toBe(14)
  })

  it('asigna hora correcta según meal_type', () => {
    const desayuno = menuEventToDb('app1', '2026-04-27', 0, 'desayuno', 'Tostadas', null)
    const cena     = menuEventToDb('app1', '2026-04-27', 0, 'cena', 'Cena', null)
    expect(new Date(desayuno.start_time).getHours()).toBe(8)
    expect(new Date(cena.start_time).getHours()).toBe(21)
  })
})
```

- [ ] **Step 6: Ejecutar tests (deben fallar)**

```bash
npx vitest run src/utils/__tests__/menuTransformers.test.js
```
Expected: FAIL — `Cannot find module '../menuTransformers'`

- [ ] **Step 7: Crear menuTransformers.js**

```js
// src/utils/menuTransformers.js
const MEAL_HOURS = { desayuno: 8, almuerzo: 11, comida: 14, cena: 21 }

export function menuEventFromDb(ev) {
  return {
    ...ev,
    meal_type:   ev.metadata?.meal_type ?? null,
    recipe_id:   ev.metadata?.recipe_id ?? null,
    day_of_week: ev.metadata?.day_of_week ?? null,
    week_start:  ev.metadata?.week_start ?? null,
    custom_name: ev.metadata?.custom_name ?? ev.title,
  }
}

export function menuEventToDb(appId, weekStart, dayIdx, mealKey, value, recipeId) {
  const hour = MEAL_HOURS[mealKey] ?? 12
  const date = new Date(weekStart)
  date.setDate(date.getDate() + dayIdx)
  date.setHours(hour, 0, 0, 0)
  return {
    app_id:     appId,
    event_type: 'meal',
    title:      value || '(comida)',
    start_time: date.toISOString(),
    all_day:    false,
    metadata: {
      meal_type:   mealKey,
      recipe_id:   recipeId,
      day_of_week: dayIdx,
      week_start:  weekStart,
      custom_name: value,
    },
  }
}
```

- [ ] **Step 8: Ejecutar todos los tests (deben pasar)**

```bash
npx vitest run src/utils/__tests__/
```
Expected: PASS (8 tests total)

- [ ] **Step 9: Commit**

```bash
git add src/utils/itemTransformers.js src/utils/menuTransformers.js src/utils/__tests__/
git commit -m "feat: helpers de transformación items/menu con tests"
```

---

## Task 3: Crear AppContext

**Files:**
- Create: `src/contexts/AppContext.jsx`

- [ ] **Step 1: Crear el archivo**

```jsx
// src/contexts/AppContext.jsx
import { createContext, useContext } from 'react'

const AppContext = createContext(null)

export function AppProvider({ app, children }) {
  return (
    <AppContext.Provider value={app}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
```

- [ ] **Step 2: Commit**

```bash
git add src/contexts/AppContext.jsx
git commit -m "feat: AppContext reemplaza ProjectContext"
```

---

## Task 4: Crear AppLayout (reemplaza HogarLayout)

**Files:**
- Create: `src/pages/app/AppLayout.jsx`

Los módulos de Hogar siguen siendo los mismos. `AppLayout` es igual que `HogarLayout` pero:
- Consulta `apps` en lugar de `projects`
- Usa `AppProvider` en lugar de `ProjectProvider`
- Mantiene la propiedad `app` (en vez de `project`) en el context
- Pasa `{ app, modules }` por `Outlet context` (los módulos usan `useOutletContext` y desestructuran `project` — esto se cambia en los módulos)

- [ ] **Step 1: Crear AppLayout.jsx**

```jsx
// src/pages/app/AppLayout.jsx
import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { AppProvider } from '../../contexts/AppContext'

const HOGAR_MODULES = [
  { path: 'calendar', label: 'Calendario', icon: '📅' },
  { path: 'shopping', label: 'Lista',       icon: '🛒' },
  { path: 'menu',     label: 'Menú',        icon: '🍽️' },
  { path: 'recipes',  label: 'Recetas',     icon: '👨‍🍳' },
]

const FULL_LAYOUT_MODULES = ['calendar', 'shopping', 'menu', 'recipes']

export default function AppLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)

  const currentModule = location.pathname.split('/').pop()
  const isFullLayout = FULL_LAYOUT_MODULES.includes(currentModule)

  useEffect(() => {
    if (!user) return
    supabase
      .from('apps')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { navigate('/apps'); return }
        setApp(data)
        setLoading(false)
      })
      .catch(() => navigate('/apps'))
  }, [user, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const modules = HOGAR_MODULES

  if (isFullLayout) {
    return (
      <AppProvider app={app}>
        <Outlet context={{ app, modules }} />
      </AppProvider>
    )
  }

  return (
    <AppProvider app={app}>
      {/* Mobile layout */}
      <div className="flex flex-col md:hidden min-h-[70vh] px-4 py-0">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0 8px' }}>
          <span style={{ fontSize: 36 }}>{app.icon}</span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{app.name}</h1>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {modules.map(m => (
            <NavLink
              key={m.path}
              to={m.path}
              className={({ isActive }) => isActive ? 'module-card active' : 'module-card'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                height: 56, padding: '0 16px', borderRadius: 12,
                background: 'var(--bg-card)',
                border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                borderLeft: isActive ? '3px solid var(--accent)' : '1px solid var(--border)',
                textDecoration: 'none', transition: 'all var(--transition)',
              })}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{m.icon}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{m.label}</span>
              <span style={{ color: 'var(--text-faint)', fontSize: 16 }}>›</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex gap-8 py-8 min-h-[70vh]">
          <aside className="w-52 shrink-0">
            <div className="mb-6">
              <div className="text-3xl mb-1">{app.icon}</div>
              <h1 className="font-bold text-[var(--text)]">{app.name}</h1>
            </div>
            <nav className="flex flex-col gap-1">
              {modules.map(m => (
                <NavLink
                  key={m.path}
                  to={m.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-[var(--accent)] text-white font-semibold'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text)]'
                    }`
                  }
                >
                  <span>{m.icon}</span>
                  {m.label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <main className="flex-1 min-w-0">
            <Outlet context={{ app }} />
          </main>
        </div>
      </div>
    </AppProvider>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/app/AppLayout.jsx
git commit -m "feat: AppLayout genérico reemplaza HogarLayout"
```

---

## Task 5: Actualizar App.jsx (router)

**Files:**
- Modify: `src/App.jsx`

Cambios requeridos:
1. Import `AppLayout` en lugar de `HogarLayout`
2. Cambiar la ruta de `/app/projects/hogar` a `/app/hogar`
3. Actualizar `getAnimKey` con la nueva ruta
4. Añadir rutas de Limpieza e Inventario (módulos a añadir en Fase 2)

- [ ] **Step 1: Modificar imports en App.jsx**

Reemplazar estas líneas:
```js
// ANTES (línea 17):
const HogarLayout   = React.lazy(() => import('./pages/app/HogarLayout'))
```
Por:
```js
const AppLayout     = React.lazy(() => import('./pages/app/AppLayout'))
```

- [ ] **Step 2: Actualizar getAnimKey en App.jsx**

Reemplazar (línea 64-66):
```js
// ANTES:
function getAnimKey(pathname) {
  if (pathname.startsWith('/app/projects/hogar')) return '/app/projects/hogar'
  return pathname
}
```
Por:
```js
function getAnimKey(pathname) {
  if (pathname.startsWith('/app/hogar')) return '/app/hogar'
  return pathname
}
```

- [ ] **Step 3: Actualizar rutas en App.jsx**

Reemplazar el bloque de rutas de Hogar (líneas 104-114):
```jsx
{/* ANTES: */}
<Route path="/app/projects/hogar" element={
  <ProtectedRoute><HogarLayout /></ProtectedRoute>
}>
  <Route index                    element={<Welcome />} />
  <Route path="calendar"          element={<Calendar />} />
  <Route path="shopping"          element={<ShoppingList />} />
  <Route path="menu"              element={<Menu />} />
  <Route path="recipes"           element={<Recipes />} />
  <Route path="recipes/:recipeId" element={<RecipeDetail />} />
</Route>
```
Por:
```jsx
{/* Hogar (nueva ruta + redirect de la antigua) */}
<Route path="/app/projects/hogar" element={<Navigate to="/app/hogar" replace />} />
<Route path="/app/hogar" element={
  <ProtectedRoute><AppLayout /></ProtectedRoute>
}>
  <Route index                    element={<Welcome />} />
  <Route path="calendar"          element={<Calendar />} />
  <Route path="shopping"          element={<ShoppingList />} />
  <Route path="menu"              element={<Menu />} />
  <Route path="recipes"           element={<Recipes />} />
  <Route path="recipes/:recipeId" element={<RecipeDetail />} />
</Route>
```

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat(router): migrar rutas a /app/hogar + AppLayout"
```

---

## Task 6: Actualizar apps.js

**Files:**
- Modify: `src/data/apps.js`

- [ ] **Step 1: Reemplazar contenido de apps.js**

```js
// src/data/apps.js
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
    status: 'coming_soon',
    requiredPlan: 'free',
    color: 'from-pink-500 to-rose-500',
    version: null,
    lastUpdated: null,
    features: ['Alimentación', 'Salud', 'Gastos'],
  },
  {
    slug: 'vehiculo',
    title: 'Vehículo',
    description: 'Combustible, mantenimiento y gastos de tu vehículo.',
    icon: '🚗',
    href: '/app/vehiculo',
    status: 'coming_soon',
    requiredPlan: 'free',
    color: 'from-blue-500 to-indigo-500',
    version: null,
    lastUpdated: null,
    features: ['Combustible', 'Mantenimiento', 'Gastos'],
  },
  {
    slug: 'finanzas',
    title: 'Finanzas',
    description: 'Resumen financiero agregado de todas tus apps.',
    icon: '💰',
    href: '/app/finanzas',
    status: 'coming_soon',
    requiredPlan: 'free',
    color: 'from-emerald-500 to-teal-500',
    version: null,
    lastUpdated: null,
    features: ['Gastos', 'Resumen mensual', 'Categorías'],
  },
]
```

- [ ] **Step 2: Commit**

```bash
git add src/data/apps.js
git commit -m "feat: añadir apps Mascotas, Vehículo, Finanzas como coming_soon"
```

---

## Task 7: Refactorizar Calendar.jsx

**Files:**
- Modify: `src/pages/app/modules/Calendar.jsx`

Cambios mínimos necesarios — solo tabla, columna y filtro de event_type:

1. `useOutletContext()` desestructura `{ project }` → cambiar a `{ app }` 
2. `supabase.from('calendar_tasks')` → `supabase.from('events')`
3. `.eq('project_id', project.id)` → `.eq('app_id', app.id).eq('event_type', 'task')`
4. En inserts/updates: `project_id: project.id` → `app_id: app.id, event_type: 'task'`

- [ ] **Step 1: Buscar y localizar todas las referencias a `project` y `calendar_tasks`**

```bash
grep -n "project\|calendar_tasks" src/pages/app/modules/Calendar.jsx
```

- [ ] **Step 2: Cambiar desestructuración del context (busca `useOutletContext`)**

Localizar la línea donde se desestructura el context (buscar `useOutletContext`). Cambiar:
```js
// ANTES — buscar esta línea:
const { project, modules } = useOutletContext()
```
Por:
```js
const { app, modules } = useOutletContext()
```

- [ ] **Step 3: Reemplazar todas las referencias `project.id` por `app.id` en Calendar.jsx**

```bash
sed -i 's/project\.id/app.id/g; s/project_id:/app_id:/g; s/\.eq('\''project_id'\'',/.eq('\''app_id'\'',/g' src/pages/app/modules/Calendar.jsx
```

- [ ] **Step 4: Cambiar nombre de tabla**

```bash
sed -i "s/from('calendar_tasks')/from('events')/g" src/pages/app/modules/Calendar.jsx
```

- [ ] **Step 5: Añadir filtro `event_type = 'task'` en la query de carga**

Localizar la query principal de carga de eventos (busca `supabase.from('events').select`). Añadir `.eq('event_type', 'task')` antes del `.then`:

```js
// ANTES (patrón aproximado):
supabase.from('events').select('*')
  .eq('app_id', app.id)
  .then(...)
```
```js
// DESPUÉS:
supabase.from('events').select('*')
  .eq('app_id', app.id)
  .eq('event_type', 'task')
  .then(...)
```

- [ ] **Step 6: Añadir `event_type: 'task'` en el payload de INSERT de eventos**

Localizar todas las llamadas a `supabase.from('events').insert(` y asegurarse de que incluyen `event_type: 'task'` en el objeto insertado. Ejemplo:

```js
// El payload del insert debe incluir:
{
  app_id: app.id,
  event_type: 'task',   // ← añadir esta línea
  title: form.title,
  start_time: ...,
  // etc.
}
```

- [ ] **Step 7: Verificar que no quedan referencias a `project` o `calendar_tasks`**

```bash
grep -n "project\b\|calendar_tasks" src/pages/app/modules/Calendar.jsx
```
Expected: sin resultados (excepto si hay comentarios)

- [ ] **Step 8: Commit**

```bash
git add src/pages/app/modules/Calendar.jsx
git commit -m "refactor(calendar): migrar a tabla events con app_id"
```

---

## Task 8: Refactorizar ShoppingList.jsx

**Files:**
- Modify: `src/pages/app/modules/ShoppingList.jsx`

Cambios:
1. Importar `itemFromDb` y `itemToDb` desde los helpers
2. Cambiar `useOutletContext` para `{ app }` en lugar de `{ project }`
3. Cambiar `supabase.from('shopping_items')` → `supabase.from('items')`
4. Aplicar `.eq('module', 'supermercado')` en queries de select
5. En la carga de items: mapear con `itemFromDb`
6. En `addItem`: usar `itemToDb` para construir el payload
7. En `toggleItem`: cambiar `from('shopping_items')` → `from('items')`
8. En `deleteItem`: cambiar `from('shopping_items')` → `from('items')`
9. `project.id` → `app.id`

- [ ] **Step 1: Añadir import de helpers al inicio del archivo**

Añadir después de los imports existentes (línea ~6):
```js
import { itemFromDb, itemToDb } from '../../../utils/itemTransformers'
```

- [ ] **Step 2: Cambiar desestructuración del context**

```js
// ANTES:
const { project, modules } = useOutletContext()
```
```js
// DESPUÉS:
const { app, modules } = useOutletContext()
```

- [ ] **Step 3: Actualizar la query de carga de items**

```js
// ANTES:
useEffect(() => {
  supabase.from('shopping_items').select('*')
    .eq('project_id', project.id).order('created_at')
    .then(({ data }) => { if (data) setItems(data) })
}, [project.id])
```
```js
// DESPUÉS:
useEffect(() => {
  supabase.from('items').select('*')
    .eq('app_id', app.id)
    .eq('module', 'supermercado')
    .order('created_at')
    .then(({ data }) => { if (data) setItems(data.map(itemFromDb)) })
}, [app.id])
```

- [ ] **Step 4: Actualizar `toggleItem`**

```js
// ANTES:
await supabase.from('shopping_items').update({ checked, checked_at }).eq('id', id)
```
```js
// DESPUÉS:
await supabase.from('items').update({ checked, checked_at }).eq('id', id)
```

- [ ] **Step 5: Actualizar `addItem` para usar `itemToDb`**

Localizar la función `addItem`. Cambiar la llamada a insert:
```js
// ANTES (patrón aproximado):
const { data } = await supabase.from('shopping_items').insert({
  project_id: project.id,
  name: newName.trim(),
  quantity: newQty ? Number(newQty) : null,
  unit: newUnit || null,
  category: newCat,
  store: activeStore,
}).select().single()
if (data) setItems(p => [...p, data])
```
```js
// DESPUÉS:
const payload = itemToDb(app.id, newName.trim(), newQty ? Number(newQty) : null, newUnit || '', newCat, activeStore)
const { data } = await supabase.from('items').insert(payload).select().single()
if (data) setItems(p => [...p, itemFromDb(data)])
```

- [ ] **Step 6: Actualizar cualquier DELETE restante**

```bash
grep -n "shopping_items\|project_id\|project\." src/pages/app/modules/ShoppingList.jsx
```

Reemplazar `from('shopping_items')` → `from('items')` y `project.id` → `app.id` en cualquier referencia restante.

- [ ] **Step 7: Verificar**

```bash
grep -n "shopping_items\|project_id\|project\b" src/pages/app/modules/ShoppingList.jsx
```
Expected: sin resultados

- [ ] **Step 8: Commit**

```bash
git add src/pages/app/modules/ShoppingList.jsx
git commit -m "refactor(shopping): migrar a tabla items con helpers de transformación"
```

---

## Task 9: Refactorizar Menu.jsx

**Files:**
- Modify: `src/pages/app/modules/Menu.jsx`

Cambios más significativos: `menu_items` tenía columnas propias; ahora los datos de menú son `events` con `event_type='meal'` y `metadata`.

- [ ] **Step 1: Añadir imports de helper y actualizar context**

```js
// Añadir al inicio, después de imports existentes:
import { menuEventFromDb, menuEventToDb } from '../../../utils/menuTransformers'
```

Cambiar:
```js
const { project, modules } = useOutletContext()
```
Por:
```js
const { app, modules } = useOutletContext()
```

- [ ] **Step 2: Actualizar query de recetas**

```js
// ANTES:
supabase.from('recipes').select('id, title')
  .eq('project_id', project.id)
  .then(...)
```
```js
// DESPUÉS:
supabase.from('recipes').select('id, title')
  .eq('app_id', app.id)
  .then(...)
```

- [ ] **Step 3: Reemplazar query de menu_items**

```js
// ANTES:
useEffect(() => {
  supabase.from('menu_items').select('*')
    .eq('project_id', project.id)
    .eq('week_start', weekStart)
    .then(({ data }) => {
      if (data) {
        const map = {}
        data.forEach(e => { map[`${e.day_of_week}-${e.meal_type}`] = e })
        setMenu(map)
      }
    })
}, [project.id, weekStart])
```
```js
// DESPUÉS:
useEffect(() => {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  supabase.from('events').select('*')
    .eq('app_id', app.id)
    .eq('event_type', 'meal')
    .gte('start_time', weekStart)
    .lte('start_time', weekEnd.toISOString())
    .then(({ data }) => {
      if (data) {
        const map = {}
        data.map(menuEventFromDb).forEach(e => {
          map[`${e.day_of_week}-${e.meal_type}`] = e
        })
        setMenu(map)
      }
    })
}, [app.id, weekStart])
```

- [ ] **Step 4: Actualizar `saveCell` — la función que hace UPSERT en menu_items**

Localizar la función `saveCell`. Reemplazar:
```js
// ANTES:
const payload = {
  project_id: project.id, week_start: weekStart,
  day_of_week: dayIdx, meal_type: mealKey,
  recipe_id: recipeId || null,
  custom_name: value,
}
if (existing) {
  await supabase.from('menu_items').update(payload).eq('id', existing.id)
} else {
  const { data } = await supabase.from('menu_items').insert(payload).select().single()
  ...
}
```
```js
// DESPUÉS:
const payload = menuEventToDb(app.id, weekStart, dayIdx, mealKey, value, recipeId || null)

if (existing) {
  const { data } = await supabase.from('events')
    .update({ title: payload.title, metadata: payload.metadata, start_time: payload.start_time })
    .eq('id', existing.id)
    .select().single()
  if (data) setMenu(p => ({ ...p, [key]: menuEventFromDb(data) }))
} else {
  const { data } = await supabase.from('events').insert(payload).select().single()
  if (data) setMenu(p => ({ ...p, [key]: menuEventFromDb(data) }))
}
```

- [ ] **Step 5: Actualizar cualquier DELETE de menu_items**

```js
// ANTES:
await supabase.from('menu_items').delete().eq('id', existing.id)
```
```js
// DESPUÉS:
await supabase.from('events').delete().eq('id', existing.id)
```

- [ ] **Step 6: Verificar**

```bash
grep -n "menu_items\|project_id\|project\b" src/pages/app/modules/Menu.jsx
```
Expected: sin resultados

- [ ] **Step 7: Commit**

```bash
git add src/pages/app/modules/Menu.jsx
git commit -m "refactor(menu): migrar a tabla events con menuTransformers"
```

---

## Task 10: Refactorizar Recipes.jsx y RecipeDetail.jsx

**Files:**
- Modify: `src/pages/app/modules/Recipes.jsx`
- Modify: `src/pages/app/modules/RecipeDetail.jsx`

Cambios simples: `project_id` → `app_id` en queries y el context de `project` → `app`.

- [ ] **Step 1: Actualizar Recipes.jsx — context y columna**

```bash
# Ver las líneas con project
grep -n "project" src/pages/app/modules/Recipes.jsx
```

Cambiar `{ project, modules }` → `{ app, modules }` en `useOutletContext`.

En `AIModal`, cambiar la prop `projectId` → `appId` en el llamador y en la definición.

En la query de carga:
```js
// ANTES:
supabase.from('recipes').select('*').eq('project_id', project.id)
```
```js
// DESPUÉS:
supabase.from('recipes').select('*').eq('app_id', app.id)
```

En el INSERT dentro de `AIModal.handleSave`:
```js
// ANTES:
await supabase.from('recipes').insert({
  project_id: projectId,
  ...
})
```
```js
// DESPUÉS:
await supabase.from('recipes').insert({
  app_id: appId,
  ...
})
```

En el INSERT manual de recetas (si existe en Recipes.jsx):
```js
project_id: project.id  →  app_id: app.id
```

En el render de `AIModal`:
```jsx
// ANTES:
<AIModal projectId={project.id} .../>
```
```jsx
// DESPUÉS:
<AIModal appId={app.id} .../>
```

- [ ] **Step 2: Actualizar RecipeDetail.jsx**

```bash
grep -n "project" src/pages/app/modules/RecipeDetail.jsx
```

Aplicar los mismos cambios: `project` → `app`, `project_id` → `app_id`.

- [ ] **Step 3: Verificar ambos archivos**

```bash
grep -n "project_id\|project\b" src/pages/app/modules/Recipes.jsx src/pages/app/modules/RecipeDetail.jsx
```
Expected: sin resultados (excepto comentarios)

- [ ] **Step 4: Commit**

```bash
git add src/pages/app/modules/Recipes.jsx src/pages/app/modules/RecipeDetail.jsx
git commit -m "refactor(recipes): project_id → app_id"
```

---

## Task 11: Aplicar migración en Supabase y eliminar archivos obsoletos

**Files:**
- Delete: `src/contexts/ProjectContext.jsx`
- Delete: `src/pages/app/HogarLayout.jsx`

- [ ] **Step 1: Verificar que no quedan imports de archivos obsoletos**

```bash
grep -rn "ProjectContext\|ProjectProvider\|useProject\|HogarLayout" src/
```
Expected: sin resultados

- [ ] **Step 2: Eliminar archivos obsoletos**

```bash
rm src/contexts/ProjectContext.jsx src/pages/app/HogarLayout.jsx
```

- [ ] **Step 3: Aplicar la migración en Supabase local (si tienes Supabase CLI)**

```bash
supabase db reset
# O si prefieres aplicar solo la nueva migración:
supabase migration up
```

Si no tienes Supabase CLI local, aplicar el contenido de `supabase/migrations/20260426_big_bang_migration.sql` directamente en el SQL Editor del Dashboard de Supabase.

- [ ] **Step 4: Verificar que la app arranca sin errores**

```bash
npm run dev
```

Abrir `http://localhost:5173` y verificar:
- La landing carga ✓
- Login funciona ✓
- `/apps` muestra el hub (con las 4 apps) ✓
- `/app/hogar` carga AppLayout ✓
- Los módulos Calendario, Lista, Menú, Recetas cargan sin errores de consola ✓
- `/app/projects/hogar` redirige a `/app/hogar` ✓

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "refactor: eliminar archivos obsoletos HogarLayout y ProjectContext"
```

---

## Task 12: Ejecutar suite de tests completa

- [ ] **Step 1: Ejecutar todos los tests**

```bash
npm run test:run
```
Expected: PASS — mínimo los 8 tests de transformers. No debe haber regresiones.

- [ ] **Step 2: Si hay tests que fallan, diagnosticar**

Tests que deben pasar:
- `src/utils/__tests__/itemTransformers.test.js` — 4 tests
- `src/utils/__tests__/menuTransformers.test.js` — 4 tests

Si otros tests preexistentes fallan, verificar si referencian `calendar_tasks`, `shopping_items`, `project_id` o `ProjectContext` y actualizarlos.

- [ ] **Step 3: Commit de cierre de fase**

```bash
git add -A
git commit -m "feat: Fase 1 completa — Big Bang Migration

- Nuevo esquema: apps, items, events (con event_type)
- Tablas: products, inventory, product_consumption, recipe_ingredients, diet_plans
- Helpers: itemTransformers + menuTransformers (con tests)
- AppContext + AppLayout reemplazan ProjectContext + HogarLayout
- Todos los módulos de Hogar funcionan sobre el nuevo esquema
- Ruta: /app/hogar (redirect desde /app/projects/hogar)"
```

---

## Criterios de aceptación de Fase 1

- [ ] `npm run test:run` pasa sin errores
- [ ] App carga en `/app/hogar` sin errores de consola
- [ ] Calendario muestra eventos existentes y permite crear nuevos
- [ ] Lista de la compra muestra items existentes y permite añadir/marcar/borrar
- [ ] Menú muestra el plan semanal y permite editar celdas
- [ ] Recetas muestra el recetario y permite generar con IA
- [ ] `/app/projects/hogar` redirige a `/app/hogar`
- [ ] AppsHub muestra 4 apps (Hogar activo, 3 coming_soon)
- [ ] No quedan referencias a `calendar_tasks`, `shopping_items`, `menu_items`, `project_id`, `ProjectContext`, `HogarLayout` en el código
- [ ] `supabase/migrations/20260426_big_bang_migration.sql` aplicado correctamente

---

## Siguiente paso: Fase 2

Cuando esta fase esté completa y verificada, ejecutar:

```
/plan Fase 2 — Completar Hogar: módulos Limpieza e Inventario, normalizar recipe_ingredients, flujo Recetas→Inventario→Compra
```

Referencia: `docs/superpowers/specs/2026-04-26-h3nky-sistema-modular-design.md` sección "Fase 2"
