# Fase 6 — Finanzas: Resumen mejorado

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir el bug de `limit_amount` en los datos demo de presupuestos y completar `Resumen.jsx` con dos secciones que ya calcula pero no renderiza: gráfico de gasto semanal (7 barras CSS) y desglose por categoría con barras de porcentaje.

**Architecture:** Los 4 módulos de Finanzas ya existen y funcionan. Solo se tocan dos ficheros: `finanzas.js` (fix del campo) y `Resumen.jsx` (añadir secciones). Los datos de transacciones ya tienen `fin_categories` embebido, así que el desglose por categoría no necesita hook adicional — se deriva directamente de `txs`. El gráfico semanal usa la misma fuente de datos.

**Tech Stack:** React 18, hooks custom `useFinTransaccionesData` / `useFinPresupuestosData`, tokens H3nky (`var(--accent)=#fe7000`, `var(--bg-card)`, `var(--border)`, `var(--text)`, `var(--text-faint)`), Vitest, barras CSS puras (sin librerías de gráficos).

---

## Archivos afectados

| Archivo | Acción | Qué cambia |
|---|---|---|
| `src/data/demo/finanzas.js` | Modificar | Renombrar `limit_amount` → `monthly_limit` en `fin_budgets` |
| `src/data/demo/index.js` | Modificar | Bump `DEMO_VERSION` de `'8'` a `'9'` |
| `src/data/demo/__tests__/finanzas.test.js` | Crear | Tests de contrato: campo correcto + shape de txs y categorías |
| `src/pages/app/modules/finanzas/Resumen.jsx` | Modificar | Añadir gráfico semanal + desglose por categoría + fix lookup spent |

---

## Task 1: Fix demo data — `limit_amount` → `monthly_limit` + DEMO_VERSION '9'

**Files:**
- Modify: `src/data/demo/finanzas.js`
- Modify: `src/data/demo/index.js`
- Create: `src/data/demo/__tests__/finanzas.test.js`

**Por qué existe este bug:** `Presupuestos.jsx` llama a `upsert({ category_id, monthly_limit: limit })` — el campo que espera el hook y `Resumen.jsx` es `monthly_limit`. Pero `finanzas.js` declara `limit_amount: 400`. El resultado es que los presupuestos de la demo muestran `NaN €` en Resumen.

- [ ] **Step 1: Renombrar `limit_amount` → `monthly_limit` en `fin_budgets`**

En `src/data/demo/finanzas.js`, encontrar el array `fin_budgets` (4 entradas) y reemplazarlo por:

```js
  fin_budgets: [
    { id: 'demo-b-1', app_id: 'demo-finanzas', category_id: 'demo-cat-1', month: mes, monthly_limit: 400,  fin_categories: { name: 'Alimentación', icon: '🛒', color: '#f97316' } },
    { id: 'demo-b-2', app_id: 'demo-finanzas', category_id: 'demo-cat-2', month: mes, monthly_limit: 200,  fin_categories: { name: 'Transporte',   icon: '🚌', color: '#3b82f6' } },
    { id: 'demo-b-3', app_id: 'demo-finanzas', category_id: 'demo-cat-3', month: mes, monthly_limit: 1000, fin_categories: { name: 'Vivienda',     icon: '🏠', color: '#10b981' } },
    { id: 'demo-b-4', app_id: 'demo-finanzas', category_id: 'demo-cat-4', month: mes, monthly_limit: 150,  fin_categories: { name: 'Ocio',         icon: '🎭', color: '#8b5cf6' } },
  ],
```

- [ ] **Step 2: Bump DEMO_VERSION**

En `src/data/demo/index.js`, cambiar:
```js
const DEMO_VERSION = '8'
```
a:
```js
const DEMO_VERSION = '9'
```

- [ ] **Step 3: Crear el test de contrato**

Crear `src/data/demo/__tests__/finanzas.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { initDemoData, demoRead } from '../index.js'

describe('finanzas demo data — Fase 6', () => {
  beforeEach(() => {
    sessionStorage.clear()
    initDemoData('finanzas')
  })

  it('fin_budgets use monthly_limit (not limit_amount)', () => {
    const budgets = demoRead('finanzas', 'fin_budgets')
    expect(Array.isArray(budgets)).toBe(true)
    expect(budgets.length).toBeGreaterThan(0)
    budgets.forEach(b => {
      expect(b).toHaveProperty('monthly_limit')
      expect(b).not.toHaveProperty('limit_amount')
      expect(typeof b.monthly_limit).toBe('number')
      expect(b.monthly_limit).toBeGreaterThan(0)
    })
  })

  it('fin_transactions have required shape with fin_categories embedded', () => {
    const txs = demoRead('finanzas', 'fin_transactions')
    expect(Array.isArray(txs)).toBe(true)
    expect(txs.length).toBeGreaterThan(0)
    txs.forEach(tx => {
      expect(tx).toHaveProperty('id')
      expect(tx).toHaveProperty('type')
      expect(['income', 'expense']).toContain(tx.type)
      expect(tx).toHaveProperty('amount')
      expect(tx).toHaveProperty('date')
      expect(tx).toHaveProperty('fin_categories')
    })
  })

  it('fin_categories have required shape', () => {
    const cats = demoRead('finanzas', 'fin_categories')
    expect(Array.isArray(cats)).toBe(true)
    expect(cats.length).toBeGreaterThan(0)
    cats.forEach(c => {
      expect(c).toHaveProperty('id')
      expect(c).toHaveProperty('name')
      expect(c).toHaveProperty('icon')
      expect(c).toHaveProperty('color')
      expect(['income', 'expense']).toContain(c.type)
    })
  })
})
```

- [ ] **Step 4: Correr los tests**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run src/data/demo/__tests__/
```

Expected: Todos pasan (3 nuevos de `finanzas.test.js` + los de comparticion, personal e initDemoData).

- [ ] **Step 5: Commit**

```bash
cd /home/user/mi-portfolio-proyectos && git add src/data/demo/finanzas.js src/data/demo/index.js src/data/demo/__tests__/finanzas.test.js && git commit -m "fix(demo): rename limit_amount to monthly_limit in fin_budgets + bump DEMO_VERSION to 9"
```

---

## Task 2: Resumen.jsx — gráfico semanal + desglose por categoría

**Files:**
- Modify: `src/pages/app/modules/finanzas/Resumen.jsx`

Sustituir el contenido completo del fichero. Cambios respecto al original:
1. **`catMap`** — deriva categorías y gastos desde `txs` (que ya tienen `fin_categories` embebido).
2. **Sección "Esta semana"** — 7 barras CSS (L-D), altura proporcional al gasto diario, barra de hoy en `var(--accent)`.
3. **Sección "Gasto por categoría"** — lista ordenada de mayor a menor con icono, nombre, % y barra de color.
4. **Fix presupuestos** — usa `catMap[b.category_id]?.total ?? 0` en lugar del dict incorrecto.

- [ ] **Step 1: Reemplazar Resumen.jsx**

Reemplazar el contenido completo de `src/pages/app/modules/finanzas/Resumen.jsx`:

```jsx
import { useOutletContext, useNavigate } from 'react-router-dom'
import { useMode } from '../../../../contexts/ModeContext'
import { useFinTransaccionesData } from '../../../../hooks/data/useFinTransaccionesData'
import { useFinPresupuestosData } from '../../../../hooks/data/useFinPresupuestosData'

export default function Resumen() {
  const { app }  = useOutletContext()
  const navigate = useNavigate()
  const { mode } = useMode()
  const { txs,     loading: loadingTxs }     = useFinTransaccionesData({ appId: app.id, mode })
  const { budgets, loading: loadingBudgets } = useFinPresupuestosData({ appId: app.id, mode })

  const loading = loadingTxs || loadingBudgets

  const today    = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const year     = today.getFullYear()
  const month    = today.getMonth() + 1
  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay  = new Date(year, month, 0).toISOString().slice(0, 10)

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  // ── Métricas del mes ─────────────────────────────────────────────
  const monthTxs = txs.filter(t => t.date >= firstDay && t.date <= lastDay)
  const income   = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense  = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const balance  = income - expense

  // ── Desglose por categoría ───────────────────────────────────────
  // txs ya llevan fin_categories embebido — no necesita hook adicional
  const catMap = {}
  monthTxs.filter(t => t.type === 'expense' && t.category_id).forEach(t => {
    if (!catMap[t.category_id]) catMap[t.category_id] = { cat: t.fin_categories, total: 0 }
    catMap[t.category_id].total += Number(t.amount)
  })
  const spendByCatArr = Object.values(catMap).sort((a, b) => b.total - a.total)

  // ── Gráfico semanal (L–D de la semana actual) ────────────────────
  const weekStart = new Date(today)
  const dow = today.getDay() === 0 ? 6 : today.getDay() - 1  // 0 = lunes
  weekStart.setDate(today.getDate() - dow)
  weekStart.setHours(0, 0, 0, 0)

  const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const weekDays = DIAS.map((label, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    const dateStr = d.toISOString().slice(0, 10)
    const total = txs
      .filter(t => t.type === 'expense' && t.date === dateStr)
      .reduce((s, t) => s + Number(t.amount), 0)
    return { label, dateStr, total, isToday: dateStr === todayStr }
  })
  const maxDay = Math.max(...weekDays.map(d => d.total), 1)

  const monthLabel = today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Balance header */}
      <div style={{ padding: '20px', borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--text-faint)', textTransform: 'capitalize' }}>{monthLabel}</p>
        <p style={{ margin: '0 0 12px', fontSize: 32, fontWeight: 800, color: balance >= 0 ? '#10b981' : '#ef4444' }}>
          {balance >= 0 ? '+' : ''}{balance.toFixed(2)} €
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-faint)' }}>Ingresos</p>
            <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: '#10b981' }}>+{income.toFixed(2)} €</p>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-faint)' }}>Gastos</p>
            <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: '#ef4444' }}>-{expense.toFixed(2)} €</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => navigate('../transacciones')}
          style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#ef444420', border: '1px solid #ef444440', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#ef4444' }}>
          − Añadir gasto
        </button>
        <button onClick={() => navigate('../transacciones')}
          style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#10b98120', border: '1px solid #10b98140', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#10b981' }}>
          + Añadir ingreso
        </button>
      </div>

      {/* Gráfico semanal */}
      {weekDays.some(d => d.total > 0) && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            Esta semana
          </p>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 68 }}>
            {weekDays.map(({ label, total, isToday }) => (
              <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 48 }}>
                  <div style={{
                    width: '100%',
                    borderRadius: 4,
                    height: total > 0 ? `${Math.max(4, Math.round((total / maxDay) * 48))}px` : '3px',
                    background: isToday ? 'var(--accent)' : total > 0 ? 'var(--text-faint)' : 'var(--border)',
                    opacity: isToday ? 1 : total > 0 ? 0.55 : 0.25,
                    transition: 'height .3s',
                  }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--accent)' : 'var(--text-faint)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desglose por categoría */}
      {spendByCatArr.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            Gasto por categoría
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {spendByCatArr.map(({ cat, total }) => {
              const pct = expense > 0 ? Math.round((total / expense) * 100) : 0
              return (
                <div key={cat?.name ?? String(total)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15 }}>{cat?.icon ?? '📦'}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{cat?.name ?? 'Otros'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{pct}%</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', minWidth: 60, textAlign: 'right' }}>{total.toFixed(2)} €</span>
                    </div>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: cat?.color ?? 'var(--accent)', transition: 'width .4s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Presupuestos del mes */}
      {budgets.length > 0 && (
        <div>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Presupuestos del mes</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {budgets.map(b => {
              const cat   = b.fin_categories
              const spent = catMap[b.category_id]?.total ?? 0
              const limit = Number(b.monthly_limit)
              const pct   = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0
              const isOver = pct >= 90
              return (
                <div key={b.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{cat?.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{cat?.name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: isOver ? '#ef4444' : 'var(--text-muted)' }}>
                      {spent.toFixed(2)} / {limit.toFixed(2)} €
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: isOver ? '#ef4444' : (cat?.color ?? 'var(--accent)'), borderRadius: 4, transition: 'width 0.4s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {monthTxs.length === 0 && budgets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>📊</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin datos este mes</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade transacciones para ver tu resumen</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Correr todos los tests**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run
```

Expected: Todos los tests pre-existentes siguen pasando. Los 4 fallos de AuthContext/i18n son pre-existentes — son OK.

- [ ] **Step 3: Commit**

```bash
cd /home/user/mi-portfolio-proyectos && git add src/pages/app/modules/finanzas/Resumen.jsx && git commit -m "feat(finanzas): enhance Resumen — weekly chart, spending by category, fix budget lookup"
```

---

## Self-Review

**Spec coverage:**
- ✅ Fix `limit_amount` → `monthly_limit` — Task 1 Step 1
- ✅ Gráfico semanal (7 barras CSS, hoy en naranja) — Task 2 sección "Esta semana"
- ✅ Desglose por categoría (ordenado, %, barra color) — Task 2 sección "Gasto por categoría"
- ✅ Presupuestos con lookup correcto via `catMap` — Task 2 sección "Presupuestos del mes"
- ✅ Test de contrato para `monthly_limit` — Task 1 Step 3
- ✅ DEMO_VERSION bumped a '9' — Task 1 Step 2

**Placeholder scan:** Ninguno — todo el código es completo y ejecutable.

**Type consistency:**
- `catMap` definido como `{ [category_id]: { cat: fin_categories, total: number } }` — usado en `spendByCatArr` y en `catMap[b.category_id]?.total`
- `weekDays` items: `{ label, dateStr, total, isToday }` — todos los campos usados en el JSX
- `monthly_limit` — campo en demo data (Task 1) y en Resumen.jsx (Task 2): consistente
- `spendByCatArr` — array de `{ cat, total }`, ambas propiedades usadas
