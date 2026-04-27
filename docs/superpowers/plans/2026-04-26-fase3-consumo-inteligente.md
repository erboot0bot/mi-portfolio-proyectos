# Fase 3 — Consumo Inteligente Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir sugerencias automáticas de compra en ShoppingList basadas en el historial de compras de cada producto, con ajuste manual de frecuencia.

**Architecture:** Al guardar una compra (`saveCart`), para cada item comprado se busca el producto correspondiente en el catálogo global (`products`) por nombre (case-insensitive) y se actualiza `product_consumption` con la fecha y una media exponencial de días entre compras (EMA α=0.3). Al cargar ShoppingList, se leen los productos con `estimated_next_purchase ≤ hoy+7 días` y se muestran en una sección "💡 Sugerencias" con botón "Añadir" y control de frecuencia inline.

**Tech Stack:** React 19, Supabase JS v2, Vitest, Tailwind CSS 4 (inline styles en módulos)

**Spec:** `docs/superpowers/specs/2026-04-26-h3nky-sistema-modular-design.md` — Fase 3

---

## Archivos creados o modificados

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/utils/consumptionUtils.js` | **Crear** | Función pura `computeConsumptionUpdate` — sin Supabase |
| `src/utils/__tests__/consumptionUtils.test.js` | **Crear** | Tests TDD de la lógica de cálculo |
| `src/pages/app/modules/ShoppingList.jsx` | **Modificar** | (1) tracking en saveCart, (2) sección Sugerencias |

---

### Task 1: consumptionUtils — cálculo puro (TDD)

**Files:**
- Create: `src/utils/consumptionUtils.js`
- Test: `src/utils/__tests__/consumptionUtils.test.js`

**Contexto:** `computeConsumptionUpdate(existing, purchaseDateStr)` toma el registro actual de `product_consumption` (o `null`) y la fecha de compra (YYYY-MM-DD) y devuelve los campos a hacer upsert. Algoritmo: primera compra → sin avg/estimated, confidence='baja'. Segunda compra → avg = daysSinceLast, confidence='media'. Tercera+ → EMA α=0.3 con avg previo, confidence='alta'. `daysSinceLast` tiene mínimo de 1 para proteger contra misma-fecha.

- [ ] **Step 1: Escribir los tests primero**

```js
// src/utils/__tests__/consumptionUtils.test.js
import { describe, it, expect } from 'vitest'
import { computeConsumptionUpdate } from '../consumptionUtils'

describe('computeConsumptionUpdate', () => {
  it('primera compra (existing = null): devuelve baja confidence y sin avg/estimated', () => {
    const result = computeConsumptionUpdate(null, '2026-04-26')
    expect(result.last_purchase_date).toBe('2026-04-26')
    expect(result.avg_days_between_purchases).toBeNull()
    expect(result.estimated_next_purchase).toBeNull()
    expect(result.confidence).toBe('baja')
  })

  it('primera compra con existing.last_purchase_date = null: trata como primera', () => {
    const result = computeConsumptionUpdate(
      { last_purchase_date: null, avg_days_between_purchases: null },
      '2026-04-26'
    )
    expect(result.avg_days_between_purchases).toBeNull()
    expect(result.confidence).toBe('baja')
  })

  it('segunda compra (sin avg previo): avg = daysSinceLast, confidence = media', () => {
    const existing = { last_purchase_date: '2026-03-27', avg_days_between_purchases: null }
    const result = computeConsumptionUpdate(existing, '2026-04-26')
    expect(result.avg_days_between_purchases).toBe(30)
    expect(result.estimated_next_purchase).toBe('2026-05-26')
    expect(result.confidence).toBe('media')
  })

  it('tercera compra (avg previo = 30, 20 días después): aplica EMA α=0.3 → 27', () => {
    const existing = { last_purchase_date: '2026-03-27', avg_days_between_purchases: 30 }
    // 20 días después del 27 marzo = 16 abril
    const result = computeConsumptionUpdate(existing, '2026-04-16')
    // round(0.3 * 20 + 0.7 * 30) = round(6 + 21) = 27
    expect(result.avg_days_between_purchases).toBe(27)
    expect(result.estimated_next_purchase).toBe('2026-05-13')
    expect(result.confidence).toBe('alta')
  })

  it('misma fecha (daysSinceLast=0): usa mínimo de 1 día', () => {
    const existing = { last_purchase_date: '2026-04-26', avg_days_between_purchases: null }
    const result = computeConsumptionUpdate(existing, '2026-04-26')
    expect(result.avg_days_between_purchases).toBe(1)
    expect(result.confidence).toBe('media')
  })

  it('actualiza last_purchase_date a la nueva fecha', () => {
    const existing = { last_purchase_date: '2026-03-01', avg_days_between_purchases: 14 }
    const result = computeConsumptionUpdate(existing, '2026-04-26')
    expect(result.last_purchase_date).toBe('2026-04-26')
  })
})
```

- [ ] **Step 2: Ejecutar — verificar que fallan**

```bash
npx vitest run src/utils/__tests__/consumptionUtils.test.js
```

Expected: FAIL — `Cannot find module '../consumptionUtils'`

- [ ] **Step 3: Implementar consumptionUtils.js**

```js
// src/utils/consumptionUtils.js

/**
 * Calcula los campos a upsert en product_consumption tras una compra.
 *
 * @param {object|null} existing  Fila actual de product_consumption (o null si es la primera)
 * @param {string}      purchaseDateStr  Fecha de compra en formato YYYY-MM-DD
 * @returns {{ last_purchase_date, avg_days_between_purchases, estimated_next_purchase, confidence }}
 */
export function computeConsumptionUpdate(existing, purchaseDateStr) {
  if (!existing || !existing.last_purchase_date) {
    return {
      last_purchase_date:         purchaseDateStr,
      avg_days_between_purchases: null,
      estimated_next_purchase:    null,
      confidence:                 'baja',
    }
  }

  const purchaseDate = new Date(purchaseDateStr)
  const lastDate     = new Date(existing.last_purchase_date)
  const daysSinceLast = Math.max(1, Math.round(
    (purchaseDate - lastDate) / (1000 * 60 * 60 * 24)
  ))

  const prevAvg  = existing.avg_days_between_purchases
  const newAvg   = prevAvg == null
    ? daysSinceLast
    : Math.round(0.3 * daysSinceLast + 0.7 * prevAvg)

  const estimated = new Date(purchaseDateStr)
  estimated.setDate(estimated.getDate() + newAvg)

  return {
    last_purchase_date:         purchaseDateStr,
    avg_days_between_purchases: newAvg,
    estimated_next_purchase:    estimated.toISOString().slice(0, 10),
    confidence:                 prevAvg == null ? 'media' : 'alta',
  }
}
```

- [ ] **Step 4: Ejecutar — verificar que pasan**

```bash
npx vitest run src/utils/__tests__/consumptionUtils.test.js
```

Expected: 6 passed (6)

- [ ] **Step 5: Commit**

```bash
git add src/utils/consumptionUtils.js src/utils/__tests__/consumptionUtils.test.js
git commit -m "feat(consumption): computeConsumptionUpdate helper — TDD"
```

---

### Task 2: ShoppingList.jsx — tracking de consumo en saveCart

**Files:**
- Modify: `src/pages/app/modules/ShoppingList.jsx`

**Contexto:** `saveCart()` (línea ~279) ya guarda a `purchase_history`. Hay que añadir, justo después del `if (error) { showToast(...); return }`, la llamada a `updateConsumptionForItem` para cada item del carrito. Esta función hace ilike lookup de `products` por nombre y upsert en `product_consumption` usando `computeConsumptionUpdate`. Si el producto no existe en el catálogo, se ignora silenciosamente. Los errores de esta actualización no bloquean el flujo principal (no deben impedir que la compra quede guardada).

- [ ] **Step 1: Añadir import de computeConsumptionUpdate**

Añadir al bloque de imports (después del import de itemTransformers, línea ~7):

```js
import { computeConsumptionUpdate } from '../../../utils/consumptionUtils'
```

- [ ] **Step 2: Añadir función updateConsumptionForItem dentro del componente**

Añadir justo antes de `async function saveCart()` (línea ~279):

```js
async function updateConsumptionForItem(title, purchaseDateStr) {
  // Buscar producto en catálogo por nombre (case-insensitive)
  const { data: product } = await supabase
    .from('products')
    .select('id')
    .ilike('name', title.trim())
    .maybeSingle()
  if (!product) return // item sin producto en catálogo → ignorar

  // Cargar registro actual de consumo
  const { data: existing } = await supabase
    .from('product_consumption')
    .select('last_purchase_date, avg_days_between_purchases')
    .eq('product_id', product.id)
    .eq('app_id', app.id)
    .maybeSingle()

  const update = computeConsumptionUpdate(existing, purchaseDateStr)

  await supabase.from('product_consumption').upsert({
    product_id: product.id,
    app_id:     app.id,
    ...update,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'product_id,app_id' })
}
```

- [ ] **Step 3: Modificar saveCart para llamar updateConsumptionForItem**

Encontrar el bloque en `saveCart()` que sigue al insert en purchase_history (líneas ~296-307):

```js
    const { error } = await supabase.from('purchase_history').insert({
      user_id: user?.id,
      store: activeStore,
      items: itemsPayload,
      item_count: cartItems.length,
    })
    if (error) { showToast('Error al guardar la compra'); return }

    const ids = cartItems.map(i => i.id)
    await supabase.from('items').update({ checked: false, checked_at: null }).in('id', ids)
    setItems(p => p.map(i => ids.includes(i.id) ? { ...i, checked: false, checked_at: null } : i))
    showToast(`✅ Compra guardada — ${activeStore} · ${dateStr} · ${cartItems.length} productos`)
```

Reemplazarlo con:

```js
    const { error } = await supabase.from('purchase_history').insert({
      user_id: user?.id,
      store: activeStore,
      items: itemsPayload,
      item_count: cartItems.length,
    })
    if (error) { showToast('Error al guardar la compra'); return }

    // Actualizar product_consumption (errores silenciosos — no bloquean el flujo)
    const purchaseDate = new Date().toISOString().slice(0, 10)
    await Promise.allSettled(
      cartItems.map(item => updateConsumptionForItem(item.title, purchaseDate))
    )

    const ids = cartItems.map(i => i.id)
    await supabase.from('items').update({ checked: false, checked_at: null }).in('id', ids)
    setItems(p => p.map(i => ids.includes(i.id) ? { ...i, checked: false, checked_at: null } : i))
    showToast(`✅ Compra guardada — ${activeStore} · ${dateStr} · ${cartItems.length} productos`)
```

(Nota: se usa `Promise.allSettled` en lugar de `Promise.all` para que un fallo individual no bloquee el resto.)

- [ ] **Step 4: Ejecutar tests**

```bash
npx vitest run
```

Expected: todos los tests pasan (incluidos los 6 nuevos de consumptionUtils).

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/modules/ShoppingList.jsx
git commit -m "feat(shopping): registrar product_consumption al guardar compra"
```

---

### Task 3: ShoppingList.jsx — sección Sugerencias

**Files:**
- Modify: `src/pages/app/modules/ShoppingList.jsx`

**Contexto:** Añadir estado `suggestions` + `editingFreqId`. Al montar el componente (y después de `saveCart()`), cargar `product_consumption` con `estimated_next_purchase ≤ hoy+7 días` y `avg_days_between_purchases IS NOT NULL`, JOIN con `products`. La sección Sugerencias aparece encima de la lista de pendientes (tanto en mobile como desktop). Cada sugerencia tiene: nombre del producto, "cada X días" (clickable para editar inline), badge de confidence, botón "+ Añadir" y botón × (no sugerir más). `addSuggestion` inserta un nuevo item en `items`. `dismissSuggestion` pone `avg_days_between_purchases = null` en ese registro. `updateFrequency` permite editar la frecuencia manualmente y recalcula `estimated_next_purchase`.

- [ ] **Step 1: Añadir estado suggestions y editingFreqId**

Localizar el bloque de useState al inicio del componente ShoppingList (cerca de la línea 200). Añadir después de los estados existentes:

```js
const [suggestions,    setSuggestions]    = useState([])
const [editingFreqId,  setEditingFreqId]  = useState(null)
```

- [ ] **Step 2: Añadir función loadSuggestions**

Añadir antes de `showToast`:

```js
async function loadSuggestions() {
  const horizon = new Date()
  horizon.setDate(horizon.getDate() + 7)
  const horizonStr = horizon.toISOString().slice(0, 10)

  const { data } = await supabase
    .from('product_consumption')
    .select('*, product:products(name)')
    .eq('app_id', app.id)
    .not('avg_days_between_purchases', 'is', null)
    .lte('estimated_next_purchase', horizonStr)
    .order('estimated_next_purchase')

  setSuggestions(data ?? [])
}
```

- [ ] **Step 3: Llamar loadSuggestions en useEffect y después de saveCart**

En el `useEffect` existente que carga los items (línea ~235), añadir la llamada al final:

```js
  useEffect(() => {
    supabase.from('items')
      .select('*')
      .eq('app_id', app.id)
      .eq('module', 'supermercado')
      .order('created_at')
      .then(({ data }) => { if (data) setItems(data.map(itemFromDb)) })

    loadSuggestions()   // <-- añadir esta línea
  }, [app.id])
```

En `saveCart()`, añadir `loadSuggestions()` justo antes del `showToast` final:

```js
    setItems(p => p.map(i => ids.includes(i.id) ? { ...i, checked: false, checked_at: null } : i))
    loadSuggestions()   // <-- añadir esta línea
    showToast(`✅ Compra guardada — ${activeStore} · ${dateStr} · ${cartItems.length} productos`)
```

- [ ] **Step 4: Añadir funciones addSuggestion, dismissSuggestion, updateFrequency**

Añadir después de `loadSuggestions`:

```js
async function addSuggestion(suggestion) {
  const payload = {
    app_id:   app.id,
    module:   'supermercado',
    type:     'product',
    title:    suggestion.product.name,
    metadata: { quantity: null, unit: '', category: 'otros', store: activeStore, price_unit: null },
  }
  const { data, error } = await supabase.from('items').insert(payload).select().single()
  if (!error && data) {
    setItems(p => [...p, itemFromDb(data)])
    showToast(`${suggestion.product.name} añadido ✓`)
  }
}

async function dismissSuggestion(productId) {
  await supabase.from('product_consumption')
    .update({
      avg_days_between_purchases: null,
      estimated_next_purchase:    null,
      updated_at:                 new Date().toISOString(),
    })
    .eq('product_id', productId)
    .eq('app_id', app.id)
  setSuggestions(p => p.filter(s => s.product_id !== productId))
}

async function updateFrequency(productId, newDaysStr) {
  const days = parseInt(newDaysStr)
  setEditingFreqId(null)
  if (!days || days < 1) { dismissSuggestion(productId); return }

  const suggestion = suggestions.find(s => s.product_id === productId)
  if (!suggestion) return

  const newEstimated = new Date(suggestion.last_purchase_date)
  newEstimated.setDate(newEstimated.getDate() + days)
  const newEstimatedStr = newEstimated.toISOString().slice(0, 10)

  await supabase.from('product_consumption')
    .update({
      avg_days_between_purchases: days,
      estimated_next_purchase:    newEstimatedStr,
      updated_at:                 new Date().toISOString(),
    })
    .eq('product_id', productId)
    .eq('app_id', app.id)

  setSuggestions(p => p.map(s =>
    s.product_id === productId
      ? { ...s, avg_days_between_purchases: days, estimated_next_purchase: newEstimatedStr }
      : s
  ))
}
```

- [ ] **Step 5: Añadir componente SugerenciasSection inline**

Añadir el bloque JSX de sugerencias. En la sección de mobile (buscar el `<div className="flex flex-col md:hidden ...">` o equivalente) y en el desktop, añadir justo antes de la lista de items pendientes (`pending`):

```jsx
{/* Sección Sugerencias */}
{suggestions.length > 0 && (
  <div style={{ marginBottom: 16 }}>
    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 8px' }}>
      💡 Sugerencias
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {suggestions.map(s => (
        <div
          key={s.product_id}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
            borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {s.product?.name}
            </p>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
              {editingFreqId === s.product_id ? (
                <input
                  type="number" min="1"
                  defaultValue={s.avg_days_between_purchases}
                  autoFocus
                  onBlur={e  => updateFrequency(s.product_id, e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter')  updateFrequency(s.product_id, e.target.value)
                    if (e.key === 'Escape') setEditingFreqId(null)
                  }}
                  style={{ width: 52, padding: '2px 6px', borderRadius: 6, border: '1px solid var(--accent)', background: 'var(--bg)', color: 'var(--text)', fontSize: 11, outline: 'none' }}
                />
              ) : (
                <button
                  onClick={() => setEditingFreqId(s.product_id)}
                  title="Editar frecuencia"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)', padding: 0, textDecoration: 'underline dotted' }}
                >
                  cada {s.avg_days_between_purchases} días
                </button>
              )}
              <span style={{
                fontSize: 10, padding: '1px 6px', borderRadius: 999, flexShrink: 0,
                background: s.confidence === 'alta'  ? 'rgba(16,185,129,.12)'
                           : s.confidence === 'media' ? 'rgba(245,158,11,.12)'
                           : 'rgba(156,163,175,.12)',
                color: s.confidence === 'alta'  ? '#10b981'
                     : s.confidence === 'media' ? '#f59e0b'
                     : 'var(--text-faint)',
              }}>
                {s.confidence}
              </span>
            </div>
          </div>

          <button
            onClick={() => addSuggestion(s)}
            style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, flexShrink: 0 }}
          >
            + Añadir
          </button>

          <button
            onClick={() => dismissSuggestion(s.product_id)}
            title="No sugerir más"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-faint)', padding: '0 2px', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
          >×</button>
        </div>
      ))}
    </div>
  </div>
)}
```

**Nota:** ShoppingList.jsx tiene layouts mobile y desktop separados. Añadir el bloque de Sugerencias en ambos, justo antes del array `pending` de items. Buscar `{pending.map(...` en el archivo para localizar los puntos de inserción.

- [ ] **Step 6: Ejecutar tests**

```bash
npx vitest run
```

Expected: todos los tests pasan.

- [ ] **Step 7: Commit**

```bash
git add src/pages/app/modules/ShoppingList.jsx
git commit -m "feat(shopping): sección Sugerencias con frecuencia editable y auto-sugerencia por consumo"
```

---

### Task 4: Verificación global

**Files:** Sin cambios de código.

- [ ] **Step 1: Suite completa**

```bash
npx vitest run
```

Expected: ≥62 tests (56 anteriores + 6 nuevos de consumptionUtils).

- [ ] **Step 2: Verificar que product_consumption tiene la policy correcta**

```bash
grep -n 'consumption' supabase/migrations/20260426_big_bang_migration.sql
```

Expected: ver `CREATE TABLE product_consumption` y `CREATE POLICY "consumption_by_app_member"`.

- [ ] **Step 3: Verificar imports en ShoppingList**

```bash
grep -n 'computeConsumptionUpdate\|loadSuggestions\|addSuggestion\|dismissSuggestion\|updateFrequency' src/pages/app/modules/ShoppingList.jsx
```

Expected: al menos 5 resultados (definición de cada función + al menos una llamada).

- [ ] **Step 4: Verificar que consumptionUtils no importa Supabase**

```bash
grep -n 'supabase\|import' src/utils/consumptionUtils.js
```

Expected: solo el `export function` — ningún import de Supabase (es una utilidad pura).

- [ ] **Step 5: Commit verificación (solo si había cambios menores)**

Si no hubo cambios, no hay commit. Si algún step anterior requirió un ajuste menor:

```bash
git add -p
git commit -m "fix: ajustes menores tras verificación global Fase 3"
```
