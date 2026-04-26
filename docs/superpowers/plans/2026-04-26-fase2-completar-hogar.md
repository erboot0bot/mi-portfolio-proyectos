# Fase 2 — Completar Hogar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar el módulo Hogar con normalización de ingredientes en `recipe_ingredients`, módulos Inventario y Limpieza, y el flujo Menú→Inventario→Lista de compra.

**Architecture:** Extensión incremental sobre el esquema de Fase 1. Las tablas `recipe_ingredients`, `products` e `inventory` ya existen en DB (creadas en Fase 1) y tienen RLS configurado — solo falta poblarlas y construir la UI. `Inventario` y `Limpieza` son módulos nuevos de tipo "full-layout" (con ModuleShell propio). El flujo Generar Lista lee `recipe_ingredients` + `inventory` para añadir a `items` solo lo que falta en stock.

**Tech Stack:** React 19, Supabase JS v2, Tailwind CSS 4, Framer Motion, React Router v7, Vitest

**Spec:** `docs/superpowers/specs/2026-04-26-h3nky-sistema-modular-design.md`

---

## Archivos creados o modificados

| Archivo | Acción |
|---|---|
| `supabase/migrations/20260426_fase2_recipe_ingredients.sql` | **Crear** — poblar `recipe_ingredients` desde JSONB existente |
| `src/utils/recipeTransformers.js` | **Crear** — helpers `recipeIngredientFromDb` / `recipeIngredientToDb` |
| `src/utils/__tests__/recipeTransformers.test.js` | **Crear** — tests TDD |
| `src/pages/app/modules/ModuleShell.jsx` | **Modificar** — prop `project` → `app`, NavLink path fijo |
| `src/pages/app/modules/Calendar.jsx` | **Modificar** — `project={app}` → `app={app}` en ModuleShell |
| `src/pages/app/modules/Recipes.jsx` | **Modificar** — `project={app}` → `app={app}` + guardar `recipe_ingredients` |
| `src/pages/app/modules/RecipeDetail.jsx` | **Modificar** — leer `recipe_ingredients` con fallback JSONB |
| `src/pages/app/modules/Menu.jsx` | **Modificar** — añadir función `generateShoppingList` + botón |
| `src/pages/app/modules/Inventario.jsx` | **Crear** — gestión de stock |
| `src/pages/app/modules/Limpieza.jsx` | **Crear** — tareas de limpieza recurrentes |
| `src/pages/app/AppLayout.jsx` | **Modificar** — añadir `inventario` y `limpieza` a módulos + full-layout |
| `src/App.jsx` | **Modificar** — lazy imports + rutas para `inventario` y `limpieza` |

---

### Task 1: SQL — Poblar recipe_ingredients desde JSONB

**Files:**
- Create: `supabase/migrations/20260426_fase2_recipe_ingredients.sql`

**Contexto:** La tabla `recipe_ingredients` ya existe con RLS (`recipe_ingredients_via_recipe` policy). Solo hay que insertar las filas desde `recipes.ingredients` JSONB. El JSONB puede ser un array de strings (`"sal"`) o de objetos (`{"name":"harina","quantity":200,"unit":"g"}`). Solo insertar si la receta no tiene ya filas en `recipe_ingredients`.

- [ ] **Step 1: Escribir la migración**

```sql
-- supabase/migrations/20260426_fase2_recipe_ingredients.sql
BEGIN;

-- Poblar recipe_ingredients desde recipes.ingredients JSONB.
-- Maneja tanto strings simples como objetos {name, quantity, unit}.
-- Idempotente: NO inserta si la receta ya tiene filas normalizadas.
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, sort_order)
SELECT
  r.id                                                          AS recipe_id,
  CASE
    WHEN jsonb_typeof(elem) = 'string' THEN (elem #>> '{}')
    ELSE COALESCE(elem ->> 'name', '')
  END                                                           AS name,
  CASE
    WHEN jsonb_typeof(elem) = 'object'
      AND (elem ->> 'quantity') IS NOT NULL
      AND (elem ->> 'quantity') ~ '^\d+(\.\d+)?$'
    THEN (elem ->> 'quantity')::NUMERIC
    ELSE NULL
  END                                                           AS quantity,
  CASE
    WHEN jsonb_typeof(elem) = 'object' THEN COALESCE(elem ->> 'unit', '')
    ELSE ''
  END                                                           AS unit,
  (idx - 1)::INT                                                AS sort_order
FROM recipes r,
  jsonb_array_elements(r.ingredients) WITH ORDINALITY AS t(elem, idx)
WHERE jsonb_typeof(r.ingredients) = 'array'
  AND jsonb_array_length(r.ingredients) > 0
  AND NOT EXISTS (
    SELECT 1 FROM recipe_ingredients ri WHERE ri.recipe_id = r.id
  );

COMMIT;
```

- [ ] **Step 2: Verificar la migración en Supabase SQL Editor**

Pegar en el SQL Editor de Supabase y ejecutar. Luego verificar:

```sql
SELECT ri.name, ri.quantity, ri.unit, ri.sort_order, r.title
FROM recipe_ingredients ri
JOIN recipes r ON r.id = ri.recipe_id
ORDER BY r.title, ri.sort_order
LIMIT 30;
```

Expected: si hay recetas con ingredientes en JSONB, aparecen filas normalizadas.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260426_fase2_recipe_ingredients.sql
git commit -m "feat(db): poblar recipe_ingredients desde JSONB existente"
```

---

### Task 2: Transformers recipeIngredient (TDD)

**Files:**
- Create: `src/utils/__tests__/recipeTransformers.test.js`
- Create: `src/utils/recipeTransformers.js`

- [ ] **Step 1: Escribir los tests primero**

```js
// src/utils/__tests__/recipeTransformers.test.js
import { describe, it, expect } from 'vitest'
import { recipeIngredientFromDb, recipeIngredientToDb } from '../recipeTransformers'

describe('recipeIngredientFromDb', () => {
  it('mapea fila DB a forma UI', () => {
    const row = { id: 'ri1', recipe_id: 'r1', name: 'Harina', quantity: 200, unit: 'g', sort_order: 0 }
    const result = recipeIngredientFromDb(row)
    expect(result.name).toBe('Harina')
    expect(result.quantity).toBe(200)
    expect(result.unit).toBe('g')
    expect(result.sort_order).toBe(0)
    expect(result.recipe_id).toBe('r1')
  })

  it('asigna defaults para nulls', () => {
    const row = { id: 'ri2', recipe_id: 'r1', name: 'Sal', quantity: null, unit: null, sort_order: 1 }
    const result = recipeIngredientFromDb(row)
    expect(result.quantity).toBeNull()
    expect(result.unit).toBe('')
  })
})

describe('recipeIngredientToDb', () => {
  it('mapea UI a DB', () => {
    const result = recipeIngredientToDb('r1', 'Aceite', 2, 'cucharadas', 3)
    expect(result.recipe_id).toBe('r1')
    expect(result.name).toBe('Aceite')
    expect(result.quantity).toBe(2)
    expect(result.unit).toBe('cucharadas')
    expect(result.sort_order).toBe(3)
  })

  it('convierte cantidad vacía a null', () => {
    const result = recipeIngredientToDb('r1', 'Sal', '', '', 0)
    expect(result.quantity).toBeNull()
    expect(result.unit).toBe('')
  })

  it('trimea nombre y unidad', () => {
    const result = recipeIngredientToDb('r1', '  Pimienta  ', 1, ' g ', 0)
    expect(result.name).toBe('Pimienta')
    expect(result.unit).toBe('g')
  })

  it('sort_order por defecto es 0', () => {
    const result = recipeIngredientToDb('r1', 'Tomate', null, '', undefined)
    expect(result.sort_order).toBe(0)
  })
})
```

- [ ] **Step 2: Ejecutar — verificar que fallan**

```bash
npx vitest run src/utils/__tests__/recipeTransformers.test.js
```

Expected: FAIL — `Cannot find module '../recipeTransformers'`

- [ ] **Step 3: Implementar los transformers**

```js
// src/utils/recipeTransformers.js

export function recipeIngredientFromDb(row) {
  return {
    id:         row.id,
    recipe_id:  row.recipe_id,
    name:       row.name,
    quantity:   row.quantity ?? null,
    unit:       row.unit ?? '',
    sort_order: row.sort_order ?? 0,
  }
}

export function recipeIngredientToDb(recipeId, name, quantity, unit, sortOrder = 0) {
  return {
    recipe_id:  recipeId,
    name:       String(name ?? '').trim(),
    quantity:   quantity !== '' && quantity !== null && quantity !== undefined
                  ? Number(quantity)
                  : null,
    unit:       String(unit ?? '').trim(),
    sort_order: sortOrder ?? 0,
  }
}
```

- [ ] **Step 4: Ejecutar — verificar que pasan**

```bash
npx vitest run src/utils/__tests__/recipeTransformers.test.js
```

Expected: 7 passed (7)

- [ ] **Step 5: Commit**

```bash
git add src/utils/recipeTransformers.js src/utils/__tests__/recipeTransformers.test.js
git commit -m "feat(transformers): recipeIngredient helpers — TDD"
```

---

### Task 3: Fix ModuleShell + AppLayout + Routing

**Files:**
- Modify: `src/pages/app/modules/ModuleShell.jsx`
- Modify: `src/pages/app/AppLayout.jsx`
- Modify: `src/App.jsx`

**Contexto:** ModuleShell tiene dos bugs de Fase 1: (1) usa el prop `project` en vez de `app`, (2) los NavLinks apuntan a `/app/projects/hogar/` en vez de `/app/hogar/`. Además hay que añadir Inventario y Limpieza como módulos. Menu.jsx y ShoppingList.jsx ya usan `app={app}` correctamente; Calendar.jsx y Recipes.jsx usan `project={app}` (incorrecto).

- [ ] **Step 1: Reescribir ModuleShell.jsx**

Contenido completo:

```jsx
// src/pages/app/modules/ModuleShell.jsx
import { NavLink } from 'react-router-dom'
import './ModuleShell.css'

export default function ModuleShell({ app, modules, sidebarExtra, children }) {
  return (
    <div className="module-shell">
      <aside className="module-shell-sidebar">
        <div className="module-shell-logo">
          <span>{app.icon}</span>
          <span className="module-shell-logo-name">{app.name}</span>
        </div>

        <nav className="module-shell-nav">
          {(modules ?? []).map(m => (
            <NavLink
              key={m.path}
              to={`/app/hogar/${m.path}`}
              className={({ isActive }) =>
                `module-shell-nav-item${isActive ? ' active' : ''}`
              }
            >
              <span className="module-shell-nav-icon">{m.icon}</span>
              {m.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ flex: 1 }} />
        {sidebarExtra}
      </aside>

      <div className="module-shell-content">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Corregir prop en Calendar.jsx**

Buscar la línea en `src/pages/app/modules/Calendar.jsx` que contiene `<ModuleShell project=` y cambiar `project={app}` a `app={app}`.

```bash
grep -n "ModuleShell" src/pages/app/modules/Calendar.jsx
```

Cambiar la línea encontrada de:
```jsx
<ModuleShell project={app} modules={modules}>
```
a:
```jsx
<ModuleShell app={app} modules={modules}>
```

- [ ] **Step 3: Corregir prop en Recipes.jsx**

```bash
grep -n "ModuleShell" src/pages/app/modules/Recipes.jsx
```

Cambiar de:
```jsx
<ModuleShell project={app} modules={modules}>
```
a:
```jsx
<ModuleShell app={app} modules={modules}>
```

- [ ] **Step 4: Actualizar HOGAR_MODULES y FULL_LAYOUT_MODULES en AppLayout.jsx**

Reemplazar las líneas 7-14 de `src/pages/app/AppLayout.jsx`:

```js
const HOGAR_MODULES = [
  { path: 'calendar',   label: 'Calendario', icon: '📅' },
  { path: 'shopping',   label: 'Lista',       icon: '🛒' },
  { path: 'menu',       label: 'Menú',        icon: '🍽️' },
  { path: 'recipes',    label: 'Recetas',     icon: '👨‍🍳' },
  { path: 'inventario', label: 'Inventario',  icon: '📦' },
  { path: 'limpieza',   label: 'Limpieza',    icon: '🧹' },
]

const FULL_LAYOUT_MODULES = ['calendar', 'shopping', 'menu', 'recipes', 'inventario', 'limpieza']
```

- [ ] **Step 5: Añadir lazy imports y rutas en App.jsx**

Añadir después del import de `RecipeDetail` (línea ~23):

```js
const Inventario = React.lazy(() => import('./pages/app/modules/Inventario'))
const Limpieza   = React.lazy(() => import('./pages/app/modules/Limpieza'))
```

Añadir rutas dentro del bloque de Hogar (después de `recipes/:recipeId`):

```jsx
<Route path="inventario" element={<Inventario />} />
<Route path="limpieza"   element={<Limpieza />} />
```

- [ ] **Step 6: Ejecutar la suite de tests para verificar que no se rompió nada**

```bash
npx vitest run
```

Expected: todos los tests anteriores siguen pasando.

- [ ] **Step 7: Commit**

```bash
git add src/pages/app/modules/ModuleShell.jsx \
        src/pages/app/modules/Calendar.jsx \
        src/pages/app/modules/Recipes.jsx \
        src/pages/app/AppLayout.jsx \
        src/App.jsx
git commit -m "feat: añadir módulos Inventario+Limpieza, fix ModuleShell prop+path"
```

---

### Task 4: Módulo Inventario

**Files:**
- Create: `src/pages/app/modules/Inventario.jsx`

**Contexto:** `inventory` tiene `(id, app_id, product_id, current_stock, min_stock, unit, updated_at)`. Se hace JOIN con `products (id, name, purchase_unit)`. La política RLS `inventory_by_app_member` usa `is_app_member(app_id)`. `products` es catálogo global (`products_authenticated`). Al añadir un producto, primero busca en `products` por nombre (case-insensitive) y si no existe lo crea.

- [ ] **Step 1: Crear Inventario.jsx**

```jsx
// src/pages/app/modules/Inventario.jsx
import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import ModuleShell from './ModuleShell'

export default function Inventario() {
  const { app, modules } = useOutletContext()
  const [inventory, setInventory] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showAdd, setShowAdd]     = useState(false)
  const [form, setForm]           = useState({ name: '', current_stock: '', min_stock: '', unit: 'unidad' })

  useEffect(() => {
    supabase.from('inventory')
      .select('*, product:products(*)')
      .eq('app_id', app.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setInventory(data); setLoading(false) })
  }, [app.id])

  async function handleAdd() {
    if (!form.name.trim()) return

    // Buscar o crear producto en catálogo global
    const { data: existing } = await supabase.from('products')
      .select('id').ilike('name', form.name.trim()).maybeSingle()

    let productId = existing?.id
    if (!productId) {
      const { data: created } = await supabase.from('products')
        .insert({ name: form.name.trim(), purchase_unit: form.unit })
        .select('id').single()
      productId = created?.id
    }
    if (!productId) return

    const { data, error } = await supabase.from('inventory')
      .insert({
        app_id:        app.id,
        product_id:    productId,
        current_stock: Number(form.current_stock) || 0,
        min_stock:     Number(form.min_stock) || 0,
        unit:          form.unit,
      })
      .select('*, product:products(*)')
      .single()

    if (!error && data) {
      setInventory(p => [...p, data])
      setForm({ name: '', current_stock: '', min_stock: '', unit: 'unidad' })
      setShowAdd(false)
    }
  }

  async function adjustStock(id, delta) {
    const item = inventory.find(i => i.id === id)
    if (!item) return
    const newStock = Math.max(0, (item.current_stock ?? 0) + delta)
    const { error } = await supabase.from('inventory')
      .update({ current_stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) setInventory(p => p.map(i => i.id === id ? { ...i, current_stock: newStock } : i))
  }

  async function removeItem(id) {
    await supabase.from('inventory').delete().eq('id', id)
    setInventory(p => p.filter(i => i.id !== id))
  }

  const lowStock = inventory.filter(i => i.min_stock > 0 && (i.current_stock ?? 0) <= i.min_stock)

  return (
    <ModuleShell app={app} modules={modules}>
      <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Inventario</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {inventory.length} producto{inventory.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowAdd(p => !p)}
            style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >+ Añadir</button>
        </div>

        {/* Alerta stock bajo */}
        {lowStock.length > 0 && (
          <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#ef4444' }}>⚠ Stock bajo ({lowStock.length})</p>
            {lowStock.map(i => (
              <p key={i.id} style={{ margin: '2px 0', fontSize: 12, color: 'var(--text-muted)' }}>
                {i.product?.name} — {i.current_stock} {i.unit} (mín. {i.min_stock})
              </p>
            ))}
          </div>
        )}

        {/* Formulario añadir */}
        {showAdd && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Nuevo producto</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Nombre del producto *"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={form.current_stock} onChange={e => setForm(p => ({ ...p, current_stock: e.target.value }))}
                  placeholder="Stock actual" type="number" min="0"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                <input value={form.min_stock} onChange={e => setForm(p => ({ ...p, min_stock: e.target.value }))}
                  placeholder="Stock mínimo" type="number" min="0"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                <input value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                  placeholder="Unidad"
                  style={{ width: 90, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
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
            </div>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : inventory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: 40, margin: '0 0 8px' }}>📦</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Inventario vacío</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade productos para controlar tu stock</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {inventory.map(item => {
              const isLow = item.min_stock > 0 && (item.current_stock ?? 0) <= item.min_stock
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 12,
                    border: `1px solid ${isLow ? 'rgba(239,68,68,.4)' : 'var(--border)'}`,
                    background: 'var(--bg-card)',
                  }}
                  onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                  onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: isLow ? '#ef4444' : 'var(--text)' }}>
                      {isLow ? '⚠ ' : ''}{item.product?.name}
                    </p>
                    {item.min_stock > 0 && (
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>
                        mín. {item.min_stock} {item.unit}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => adjustStock(item.id, -1)}
                      style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ minWidth: 52, textAlign: 'center', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                      {item.current_stock ?? 0}
                      <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-faint)', marginLeft: 3 }}>{item.unit}</span>
                    </span>
                    <button onClick={() => adjustStock(item.id, 1)}
                      style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                  <button className="del-btn" onClick={() => removeItem(item.id)}
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
    </ModuleShell>
  )
}
```

- [ ] **Step 2: Ejecutar tests**

```bash
npx vitest run
```

Expected: todos los tests pasan (sin tests UI nuevos para este módulo).

- [ ] **Step 3: Commit**

```bash
git add src/pages/app/modules/Inventario.jsx
git commit -m "feat: módulo Inventario — gestión de stock con alertas de mínimo"
```

---

### Task 5: Módulo Limpieza

**Files:**
- Create: `src/pages/app/modules/Limpieza.jsx`

**Contexto:** Las tareas de limpieza se almacenan como `events` con `event_type = 'cleaning'`. El campo `start_time` es la fecha de vencimiento (all_day = true). `metadata` almacena `{ interval_days: number|null, products: string }`. Al marcar como hecha: se elimina el evento actual y, si tiene `interval_days`, se crea el siguiente con `start_time = hoy + interval_days`.

- [ ] **Step 1: Crear Limpieza.jsx**

```jsx
// src/pages/app/modules/Limpieza.jsx
import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import ModuleShell from './ModuleShell'

function formatDue(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  // Comparar solo fechas (ignorar hora)
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

export default function Limpieza() {
  const { app, modules } = useOutletContext()
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ title: '', due: '', interval_days: '', products: '' })

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    supabase.from('events')
      .select('*')
      .eq('app_id', app.id)
      .eq('event_type', 'cleaning')
      .order('start_time', { ascending: true })
      .then(({ data }) => { if (data) setTasks(data); setLoading(false) })
  }, [app.id])

  async function handleAdd() {
    if (!form.title.trim() || !form.due) return
    const startTime = new Date(form.due + 'T09:00:00').toISOString()
    const { data, error } = await supabase.from('events').insert({
      app_id:     app.id,
      event_type: 'cleaning',
      title:      form.title.trim(),
      start_time: startTime,
      all_day:    true,
      metadata: {
        interval_days: form.interval_days ? Number(form.interval_days) : null,
        products:      form.products.trim(),
      },
    }).select().single()

    if (!error && data) {
      setTasks(p => [...p, data].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)))
      setForm({ title: '', due: '', interval_days: '', products: '' })
      setShowAdd(false)
    }
  }

  async function markDone(task) {
    await supabase.from('events').delete().eq('id', task.id)
    setTasks(p => p.filter(t => t.id !== task.id))

    const intervalDays = task.metadata?.interval_days
    if (intervalDays) {
      const nextDate = new Date()
      nextDate.setDate(nextDate.getDate() + Number(intervalDays))
      nextDate.setHours(9, 0, 0, 0)
      const { data } = await supabase.from('events').insert({
        app_id:     app.id,
        event_type: 'cleaning',
        title:      task.title,
        start_time: nextDate.toISOString(),
        all_day:    true,
        metadata:   task.metadata,
      }).select().single()
      if (data) setTasks(p => [...p, data].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)))
    }
  }

  async function removeTask(id) {
    await supabase.from('events').delete().eq('id', id)
    setTasks(p => p.filter(t => t.id !== id))
  }

  const overdueCount = tasks.filter(t => formatDue(t.start_time).overdue).length

  return (
    <ModuleShell app={app} modules={modules}>
      <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Limpieza</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {overdueCount > 0
                ? `${overdueCount} vencida${overdueCount !== 1 ? 's' : ''}`
                : `${tasks.length} tarea${tasks.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => setShowAdd(p => !p)}
            style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >+ Nueva tarea</button>
        </div>

        {/* Formulario */}
        {showAdd && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Nueva tarea de limpieza</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Nombre de la tarea *"
                autoFocus
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Fecha *</label>
                  <input type="date" value={form.due} min={today}
                    onChange={e => setForm(p => ({ ...p, due: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Repetir cada (días)</label>
                  <input type="number" min="1" value={form.interval_days}
                    onChange={e => setForm(p => ({ ...p, interval_days: e.target.value }))}
                    placeholder="Sin repetición"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                </div>
              </div>
              <input
                value={form.products}
                onChange={e => setForm(p => ({ ...p, products: e.target.value }))}
                placeholder="Productos necesarios (lejía, bayetas...)"
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAdd(false)}
                  style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                  Cancelar
                </button>
                <button onClick={handleAdd} disabled={!form.title.trim() || !form.due}
                  style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: (form.title.trim() && form.due) ? 1 : 0.4 }}>
                  Crear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: 40, margin: '0 0 8px' }}>🧹</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin tareas de limpieza</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Crea tu primera tarea para no olvidar nada</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tasks.map(task => {
              const { label: dueLabel, overdue } = formatDue(task.start_time)
              const intervalDays = task.metadata?.interval_days
              const products     = task.metadata?.products
              return (
                <div
                  key={task.id}
                  style={{
                    display: 'flex', gap: 12, padding: '12px 16px', borderRadius: 12,
                    border: `1px solid ${overdue ? 'rgba(239,68,68,.4)' : 'var(--border)'}`,
                    background: 'var(--bg-card)',
                  }}
                  onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                  onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
                >
                  {/* Botón marcar hecha */}
                  <button
                    onClick={() => markDone(task)}
                    title="Marcar como hecha"
                    style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${overdue ? '#ef4444' : 'var(--border)'}`, background: 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 1, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.textContent = '✓' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = overdue ? '#ef4444' : 'var(--border)'; e.currentTarget.textContent = '' }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{task.title}</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: overdue ? '#ef4444' : 'var(--text-muted)' }}>{dueLabel}</span>
                      {intervalDays && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>↻ cada {intervalDays} días</span>}
                      {products && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>🧴 {products}</span>}
                    </div>
                  </div>
                  <button className="del-btn" onClick={() => removeTask(task.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s', alignSelf: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
                  >×</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ModuleShell>
  )
}
```

- [ ] **Step 2: Ejecutar tests**

```bash
npx vitest run
```

Expected: todos los tests pasan.

- [ ] **Step 3: Commit**

```bash
git add src/pages/app/modules/Limpieza.jsx
git commit -m "feat: módulo Limpieza — tareas recurrentes con auto-creación al completar"
```

---

### Task 6: Recipes.jsx — Guardar en recipe_ingredients

**Files:**
- Modify: `src/pages/app/modules/Recipes.jsx`

**Contexto:** Cuando ManualModal guarda (create o update), hay que sincronizar `recipe_ingredients`: DELETE las existentes y re-INSERT las nuevas. Cuando AIModal guarda, hacer lo mismo. La función `recipeIngredientToDb` viene de `src/utils/recipeTransformers.js`.

- [ ] **Step 1: Añadir import de recipeIngredientToDb en Recipes.jsx**

Añadir al bloque de imports (después del import de supabase, línea ~6):

```js
import { recipeIngredientToDb } from '../../../utils/recipeTransformers'
```

- [ ] **Step 2: Actualizar handleSave en ManualModal**

Localizar el final de `handleSave` en `ManualModal` (la sección que hace `if (err) { ... }`). El bloque actual es:

```js
    if (err) { setError(err.message); setSaving(false); return }
    onSaved(data)
```

Reemplazarlo con:

```js
    if (err) { setError(err.message); setSaving(false); return }

    // Sincronizar recipe_ingredients (DELETE + re-INSERT)
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', data.id)
    if (ings.length) {
      const rows = ings.map((ing, i) =>
        recipeIngredientToDb(data.id, ing.name, ing.quantity ?? null, ing.unit ?? '', i)
      )
      await supabase.from('recipe_ingredients').insert(rows)
    }

    onSaved(data)
```

- [ ] **Step 3: Actualizar handleSave en AIModal**

Localizar `handleSave` en `AIModal` (líneas ~49-63). Reemplazar el bloque completo con:

```js
  async function handleSave(recipe, index) {
    setSaving(p => ({ ...p, [index]: true }))
    const { data } = await supabase.from('recipes').insert({
      app_id:       appId,
      title:        recipe.title,
      ingredients:  recipe.ingredients,
      instructions: recipe.instructions,
      tags:         recipe.tags ?? [],
      prep_time:    recipe.prep_time,
      cook_time:    recipe.cook_time,
      servings:     recipe.servings,
      ai_generated: true,
    }).select().single()

    if (data) {
      // Guardar ingredientes normalizados
      const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
      if (ings.length) {
        const rows = ings
          .map((ing, i) =>
            recipeIngredientToDb(
              data.id,
              typeof ing === 'string' ? ing : (ing.name ?? ''),
              typeof ing === 'object' ? (ing.quantity ?? null) : null,
              typeof ing === 'object' ? (ing.unit ?? '') : '',
              i
            )
          )
          .filter(r => r.name)
        if (rows.length) await supabase.from('recipe_ingredients').insert(rows)
      }
      onSaved(data)
    }
    setSaving(p => ({ ...p, [index]: 'done' }))
  }
```

- [ ] **Step 4: Ejecutar tests**

```bash
npx vitest run
```

Expected: todos los tests pasan.

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/modules/Recipes.jsx
git commit -m "feat(recipes): sincronizar recipe_ingredients al guardar/editar receta"
```

---

### Task 7: RecipeDetail.jsx — Leer desde recipe_ingredients

**Files:**
- Modify: `src/pages/app/modules/RecipeDetail.jsx`

**Contexto:** Actualmente `RecipeDetail` lee de `recipe.ingredients` JSONB. Hay que cargar también las filas de `recipe_ingredients` y usarlas preferentemente (con fallback al JSONB si están vacías). El estado `ingredients` en el render ya se llama con ese nombre — usarlo para ambas fuentes.

- [ ] **Step 1: Añadir import de recipeIngredientFromDb**

Añadir al bloque de imports (después del import de menuTransformers):

```js
import { recipeIngredientFromDb } from '../../../utils/recipeTransformers'
```

- [ ] **Step 2: Añadir estado normalizedIngredients**

Después de `const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)` (línea ~71), añadir:

```js
const [normalizedIngredients, setNormalizedIngredients] = useState(null) // null = no cargado aún
```

- [ ] **Step 3: Actualizar useEffect para cargar recipe_ingredients**

Reemplazar el `useEffect` completo (líneas 73-80):

```js
  useEffect(() => {
    supabase.from('recipes').select('*').eq('id', recipeId).single()
      .then(async ({ data, error }) => {
        if (error || !data) { navigate('..'); return }
        setRecipe(data)

        // Cargar ingredientes normalizados; fallback al JSONB si no hay filas
        const { data: riRows } = await supabase
          .from('recipe_ingredients')
          .select('*')
          .eq('recipe_id', data.id)
          .order('sort_order')

        setNormalizedIngredients(
          riRows?.length
            ? riRows.map(recipeIngredientFromDb)
            : null // señal de "usar JSONB"
        )

        setLoading(false)
      })
  }, [recipeId, navigate])
```

- [ ] **Step 4: Actualizar la variable ingredients en el render**

Reemplazar la línea `const ingredients = ...` (línea ~88):

```js
  const ingredients = normalizedIngredients
    ?? (Array.isArray(recipe.ingredients) ? recipe.ingredients : [])
```

- [ ] **Step 5: Ejecutar tests**

```bash
npx vitest run
```

Expected: todos los tests pasan.

- [ ] **Step 6: Commit**

```bash
git add src/pages/app/modules/RecipeDetail.jsx
git commit -m "feat(recipe-detail): leer ingredientes desde recipe_ingredients con fallback JSONB"
```

---

### Task 8: Menu.jsx — Flujo "Generar lista" cruzado con Inventario

**Files:**
- Modify: `src/pages/app/modules/Menu.jsx`

**Contexto:** El estado del menú es `menu` (objeto con claves `${dayIdx}-${mealKey}`), donde cada valor es un event de `menuEventFromDb` con campos `recipe_id`, `custom_name`, `meal_type`, `day_of_week`. La función `addIngredientsToList` ya existe (añade todos los ingredientes desde el JSONB, sin cruzar inventario). La nueva `generateShoppingList` usa `recipe_ingredients` y cruza con `inventory`. El botón va en el header desktop (línea ~346) junto a los botones existentes, y también en el footer del día view mobile (línea ~225).

- [ ] **Step 1: Añadir la función generateShoppingList**

Añadir después de `addIngredientsToList` (línea ~158), antes de la línea `const today = ...`:

```js
  async function generateShoppingList() {
    // 1. Recopilar recipe_ids únicos de los eventos de la semana
    const recipeIds = [...new Set(
      Object.values(menu).filter(ev => ev?.recipe_id).map(ev => ev.recipe_id)
    )]
    if (!recipeIds.length) { showToast('No hay recetas enlazadas en el menú'); return }

    // 2. Cargar recipe_ingredients de esas recetas
    const { data: riRows } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .in('recipe_id', recipeIds)

    if (!riRows?.length) { showToast('Las recetas no tienen ingredientes normalizados'); return }

    // 3. Cargar inventario actual de la app
    const { data: invRows } = await supabase
      .from('inventory')
      .select('current_stock, product:products(name)')
      .eq('app_id', app.id)

    // Mapa nombre→stock (lowercase para comparación case-insensitive)
    const stockMap = {}
    for (const inv of (invRows ?? [])) {
      if (inv.product?.name) {
        stockMap[inv.product.name.toLowerCase()] = inv.current_stock ?? 0
      }
    }

    // 4. Filtrar ingredientes con stock insuficiente
    const toAdd = riRows.filter(ri => {
      const stock  = stockMap[ri.name.toLowerCase()] ?? 0
      const needed = ri.quantity ?? 1
      return stock < needed
    })

    if (!toAdd.length) { showToast('✅ Todo está en el inventario'); return }

    // 5. Insertar en la lista de compra
    const payload = toAdd.map(ri => ({
      app_id:   app.id,
      module:   'supermercado',
      type:     'product',
      title:    ri.name,
      metadata: {
        quantity:   ri.quantity ?? null,
        unit:       ri.unit ?? '',
        category:   'otros',
        store:      'General',
        price_unit: null,
      },
    }))

    await supabase.from('items').insert(payload)
    showToast(`🛒 ${payload.length} ingrediente${payload.length !== 1 ? 's' : ''} añadido${payload.length !== 1 ? 's' : ''} a la lista`)
  }
```

- [ ] **Step 2: Añadir el botón en el header desktop**

En el div con `marginLeft:'auto'` del header desktop (línea ~346), después del botón `🛒 Añadir a la lista`:

```jsx
          <button onClick={generateShoppingList}
            style={{ padding:'6px 14px', borderRadius:9, border:'1px solid var(--border)', background:'none', color:'var(--text-muted)', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5, transition:'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
            🧠 Generar lista
          </button>
```

- [ ] **Step 3: Añadir el botón en la vista día mobile**

En el div de botones del día view mobile (línea ~225), después del botón `🛒 A la lista`:

```jsx
              <button onClick={generateShoppingList}
                style={{ flex:1, padding:'12px', borderRadius:'var(--radius-md)', border:'1px solid #10b981', background:'none', color:'#10b981', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                🧠 Generar
              </button>
```

- [ ] **Step 4: Ejecutar tests**

```bash
npx vitest run
```

Expected: todos los tests pasan.

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/modules/Menu.jsx
git commit -m "feat(menu): flujo 'Generar lista' cruza recipe_ingredients con inventario"
```

---

### Task 9: Verificación global

**Files:**
- No file changes

- [ ] **Step 1: Ejecutar suite completa**

```bash
npx vitest run
```

Expected: ≥47 tests anteriores + 7 nuevos de recipeTransformers = ≥54 passed.

- [ ] **Step 2: Verificar que no quedan referencias a prop `project=` en ModuleShell**

```bash
grep -rn 'ModuleShell project=' src/
```

Expected: sin resultados.

- [ ] **Step 3: Verificar que no quedan rutas antiguas en ModuleShell**

```bash
grep -n 'app/projects/hogar' src/pages/app/modules/ModuleShell.jsx
```

Expected: sin resultados.

- [ ] **Step 4: Verificar rutas nuevas existen en App.jsx**

```bash
grep -n 'inventario\|limpieza' src/App.jsx
```

Expected: al menos 4 líneas (2 imports lazy + 2 `<Route>`).

- [ ] **Step 5: Commit de verificación si hay algo pendiente**

```bash
git status
git log --oneline origin/main..HEAD
```

Si `git status` está limpio y el log muestra los commits de Fase 2, la implementación está completa.

---

> **Cuando esta fase esté completa y verificada, aplicar la migración SQL en Supabase y ejecutar:**
> `/plan Fase 3 — Consumo Inteligente: product_consumption, sugerencias automáticas en ShoppingList`
