# Fase 4 — Demo de Compartición

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simular el sistema de compartición multi-usuario en la demo: panel interactivo de permisos por sección, atribución visual de ítems de lista de compra a "María", y nueva entrada de navegación en el grupo Casa.

**Architecture:** 4 tareas independientes. Los datos demo añaden la clave `comparticion` (objeto con personas + secciones) y atribuyen 3 ítems de la compra a María. `ComparticionPanel.jsx` lee/escribe esa clave via `demoRead`/`demoWrite` y permite ciclar el nivel de cada sección (editar → ver → privado). `ShoppingList.jsx` muestra un chip morado "María" en los ítems cuyo `owner_id === 'maria'`. `DemoAppLayout.jsx` añade la entrada de nav y `App.jsx` registra la ruta en ambas secciones.

**Tech Stack:** React 18, React Router v6, `demoRead`/`demoWrite` (sessionStorage), tokens H3nky (`var(--accent)=#fe7000`, `var(--bg-card)`, `var(--border)`, `var(--text-muted)`, `var(--text-faint)`), Vitest

---

## Archivos afectados

| Archivo | Acción | Qué cambia |
|---|---|---|
| `src/data/demo/hogar.js` | Modificar | Añadir `comparticion`; `owner_id: 'maria'` en 3 ítems supermercado |
| `src/data/demo/index.js` | Modificar | Bump `DEMO_VERSION` de `'6'` a `'7'` |
| `src/pages/app/modules/ComparticionPanel.jsx` | Crear | Panel de gestión de compartición con toggles de nivel |
| `src/data/demo/__tests__/comparticion.test.js` | Crear | Tests de contrato del dato + persistencia |
| `src/pages/app/modules/ShoppingList.jsx` | Modificar | Chip "María" en `DesktopItem` y `SwipeItem` |
| `src/pages/app/DemoAppLayout.jsx` | Modificar | Añadir entrada `comparticion` en grupo `casa` |
| `src/App.jsx` | Modificar | Lazy import + rutas en `/app/hogar` y `/demo/:appType` |

---

## Task 1: Demo data — comparticion + atribución en compras

**Files:**
- Modify: `src/data/demo/hogar.js`
- Modify: `src/data/demo/index.js`

- [ ] **Step 1: Añadir clave `comparticion` al final de `mockHogar`**

En `src/data/demo/hogar.js`, el objeto `mockHogar` cierra en la línea 247 con `}`. Justo antes de ese cierre (después de la clave `bano` que termina en la línea 246 con `},`) añadir:

```js
  comparticion: {
    personas: [
      { id: 'maria', nombre: 'María', avatar: '👩', relacion: 'Pareja', color: '#8b5cf6' }
    ],
    secciones: [
      { id: 'lista-compra', label: 'Lista de compra',  icono: '🛒', nivel: 'editar'  },
      { id: 'nevera',       label: 'Nevera',            icono: '🧊', nivel: 'ver'     },
      { id: 'congelador',   label: 'Congelador',         icono: '❄️', nivel: 'ver'     },
      { id: 'despensa',     label: 'Despensa',           icono: '🥫', nivel: 'ver'     },
      { id: 'menu',         label: 'Menú',               icono: '🍽️', nivel: 'editar'  },
      { id: 'recetas',      label: 'Recetas',            icono: '👨‍🍳', nivel: 'editar'  },
      { id: 'limpieza',     label: 'Tareas de limpieza', icono: '🧹', nivel: 'editar'  },
      { id: 'bano',         label: 'Baño',               icono: '🪥', nivel: 'privado' },
      { id: 'finanzas',     label: 'Finanzas',           icono: '💰', nivel: 'privado' },
    ],
  },
```

El resultado final del cierre de `mockHogar` queda así:

```js
  // ...
  bano: {
    consumibles: [...],
    durables: [...],
  },

  comparticion: {
    personas: [
      { id: 'maria', nombre: 'María', avatar: '👩', relacion: 'Pareja', color: '#8b5cf6' }
    ],
    secciones: [
      { id: 'lista-compra', label: 'Lista de compra',  icono: '🛒', nivel: 'editar'  },
      { id: 'nevera',       label: 'Nevera',            icono: '🧊', nivel: 'ver'     },
      { id: 'congelador',   label: 'Congelador',         icono: '❄️', nivel: 'ver'     },
      { id: 'despensa',     label: 'Despensa',           icono: '🥫', nivel: 'ver'     },
      { id: 'menu',         label: 'Menú',               icono: '🍽️', nivel: 'editar'  },
      { id: 'recetas',      label: 'Recetas',            icono: '👨‍🍳', nivel: 'editar'  },
      { id: 'limpieza',     label: 'Tareas de limpieza', icono: '🧹', nivel: 'editar'  },
      { id: 'bano',         label: 'Baño',               icono: '🪥', nivel: 'privado' },
      { id: 'finanzas',     label: 'Finanzas',           icono: '💰', nivel: 'privado' },
    ],
  },
}
```

- [ ] **Step 2: Atribuir 3 ítems de la compra a María**

En `src/data/demo/hogar.js`, en el array `items_supermercado` (empieza en línea 45), actualizar los ítems `demo-item-2` (Pan integral), `demo-item-3` (Tomates) y `demo-item-6` (Cerveza): cambiar `owner_id: 'demo'` a `owner_id: 'maria'` y añadir `owner_name: 'María'`. Solo cambian esos dos campos; el resto permanece idéntico.

```js
// demo-item-2 — antes: owner_id: 'demo'
{ id: 'demo-item-2', app_id: 'demo-hogar', module: 'supermercado', type: 'product', title: 'Pan integral', checked: false, checked_at: null, owner_id: 'maria', owner_name: 'María', visibility: 'shared', metadata: { quantity: 1, unit: 'unidad', category: 'pan', store: 'Mercadona' }, created_at: fmtTs(subDays(hoy, 1)) },

// demo-item-3 — antes: owner_id: 'demo'
{ id: 'demo-item-3', app_id: 'demo-hogar', module: 'supermercado', type: 'product', title: 'Tomates', checked: false, checked_at: null, owner_id: 'maria', owner_name: 'María', visibility: 'shared', metadata: { quantity: 1, unit: 'kg', category: 'frutas', store: 'Mercadona' }, created_at: fmtTs(subDays(hoy, 1)) },

// demo-item-6 — antes: owner_id: 'demo'
{ id: 'demo-item-6', app_id: 'demo-hogar', module: 'supermercado', type: 'product', title: 'Cerveza', checked: false, checked_at: null, owner_id: 'maria', owner_name: 'María', visibility: 'shared', metadata: { quantity: 6, unit: 'unidades', category: 'bebidas', store: 'Lidl' }, created_at: fmtTs(subDays(hoy, 1)) },
```

- [ ] **Step 3: Bump DEMO_VERSION en index.js**

En `src/data/demo/index.js`, línea 17:

```js
const DEMO_VERSION = '7'
```

- [ ] **Step 4: Verificar que los tests existentes siguen pasando**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/data/demo/__tests__/initDemoData.test.js
```

Expected: 5/5 PASS. El test "does not overwrite existing demo data" continúa pasando porque llama `initDemoData('finanzas')` primero para estampar la versión `'7'` y luego el segundo `initDemoData` ve la versión ya correcta y no borra.

- [ ] **Step 5: Commit**

```bash
git add src/data/demo/hogar.js src/data/demo/index.js
git commit -m "feat(demo): add comparticion data and María shopping attribution"
```

---

## Task 2: ComparticionPanel component

**Files:**
- Create: `src/pages/app/modules/ComparticionPanel.jsx`
- Create: `src/data/demo/__tests__/comparticion.test.js`

- [ ] **Step 1: Escribir los tests**

Crear `src/data/demo/__tests__/comparticion.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { initDemoData, demoRead, demoWrite } from '../index.js'

describe('comparticion demo data', () => {
  beforeEach(() => {
    sessionStorage.clear()
    initDemoData('hogar')
  })

  it('has personas and secciones', () => {
    const c = demoRead('hogar', 'comparticion')
    expect(c).toHaveProperty('personas')
    expect(c).toHaveProperty('secciones')
    expect(c.personas).toHaveLength(1)
    expect(c.personas[0]).toMatchObject({ id: 'maria', nombre: 'María' })
    expect(c.secciones.length).toBeGreaterThan(0)
  })

  it('each sección has a valid nivel', () => {
    const { secciones } = demoRead('hogar', 'comparticion')
    secciones.forEach(s => {
      expect(['editar', 'ver', 'privado']).toContain(s.nivel)
      expect(s).toHaveProperty('id')
      expect(s).toHaveProperty('icono')
      expect(s).toHaveProperty('label')
    })
  })

  it('lista-compra defaults to editar', () => {
    const { secciones } = demoRead('hogar', 'comparticion')
    const lc = secciones.find(s => s.id === 'lista-compra')
    expect(lc.nivel).toBe('editar')
  })

  it('demoWrite persists nivel change for an object-shaped key', () => {
    const original = demoRead('hogar', 'comparticion')
    const updated = {
      ...original,
      secciones: original.secciones.map(s =>
        s.id === 'nevera' ? { ...s, nivel: 'privado' } : s
      ),
    }
    demoWrite('hogar', 'comparticion', updated)
    const reread = demoRead('hogar', 'comparticion')
    const nevera = reread.secciones.find(s => s.id === 'nevera')
    expect(nevera.nivel).toBe('privado')
  })
})
```

- [ ] **Step 2: Correr los tests (deben pasar porque Task 1 ya escribió los datos)**

```bash
npx vitest run src/data/demo/__tests__/comparticion.test.js
```

Expected: 4/4 PASS. Si algún test falla, revisar que el DEMO_VERSION fue bumpeado y que `comparticion` está en `mockHogar`.

- [ ] **Step 3: Crear ComparticionPanel.jsx**

Crear `src/pages/app/modules/ComparticionPanel.jsx`:

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead, demoWrite } from '../../../data/demo/index.js'

const NIVELES = ['editar', 'ver', 'privado']

const NIVEL_CONFIG = {
  editar:  { icono: '🔓', label: 'Editar',  color: '#22c55e', bg: 'rgba(34,197,94,.12)'  },
  ver:     { icono: '👁️', label: 'Ver',     color: '#f59e0b', bg: 'rgba(245,158,11,.12)' },
  privado: { icono: '🔒', label: 'Privado', color: '#ef4444', bg: 'rgba(239,68,68,.12)'  },
}

const DEFAULT = {
  personas: [
    { id: 'maria', nombre: 'María', avatar: '👩', relacion: 'Pareja', color: '#8b5cf6' },
  ],
  secciones: [
    { id: 'lista-compra', label: 'Lista de compra',  icono: '🛒', nivel: 'editar'  },
    { id: 'nevera',       label: 'Nevera',            icono: '🧊', nivel: 'ver'     },
    { id: 'congelador',   label: 'Congelador',         icono: '❄️', nivel: 'ver'     },
    { id: 'despensa',     label: 'Despensa',           icono: '🥫', nivel: 'ver'     },
    { id: 'menu',         label: 'Menú',               icono: '🍽️', nivel: 'editar'  },
    { id: 'recetas',      label: 'Recetas',            icono: '👨‍🍳', nivel: 'editar'  },
    { id: 'limpieza',     label: 'Tareas de limpieza', icono: '🧹', nivel: 'editar'  },
    { id: 'bano',         label: 'Baño',               icono: '🪥', nivel: 'privado' },
    { id: 'finanzas',     label: 'Finanzas',           icono: '💰', nivel: 'privado' },
  ],
}

export default function ComparticionPanel() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const [data, setData] = useState(() => {
    if (mode !== 'demo') return DEFAULT
    const stored = demoRead(app.type ?? 'hogar', 'comparticion')
    return Array.isArray(stored) ? DEFAULT : (stored || DEFAULT)
  })

  function toggleNivel(seccionId) {
    setData(prev => {
      const secciones = prev.secciones.map(s => {
        if (s.id !== seccionId) return s
        const idx = NIVELES.indexOf(s.nivel)
        return { ...s, nivel: NIVELES[(idx + 1) % NIVELES.length] }
      })
      const next = { ...prev, secciones }
      if (mode === 'demo') demoWrite(app.type ?? 'hogar', 'comparticion', next)
      return next
    })
  }

  const persona  = data.personas[0]
  const editando = data.secciones.filter(s => s.nivel === 'editar').length
  const viendo   = data.secciones.filter(s => s.nivel === 'ver').length

  return (
    <div style={{ padding: '20px', maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>👥 Compartición</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
          Gestiona qué secciones compartes y con quién
        </p>
      </div>

      {/* Persona card */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
          background: `${persona.color}22`, border: `2px solid ${persona.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
        }}>
          {persona.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{persona.nombre}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{persona.relacion}</p>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-faint)', textAlign: 'right', lineHeight: 1.7 }}>
          <div>🔓 {editando} secciones — editar</div>
          <div>👁️ {viendo} secciones — ver</div>
        </div>
      </div>

      {/* Secciones */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            Permisos por sección — pulsa para cambiar
          </p>
        </div>
        {data.secciones.map((s, i) => {
          const cfg = NIVEL_CONFIG[s.nivel]
          return (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 20px',
              borderBottom: i < data.secciones.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icono}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{s.label}</span>
              <button
                onClick={() => toggleNivel(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px', borderRadius: 20,
                  border: `1px solid ${cfg.color}55`,
                  background: cfg.bg, color: cfg.color,
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  transition: 'opacity .15s', fontFamily: 'var(--font-body)',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.7' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                {cfg.icono} {cfg.label}
              </button>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {Object.entries(NIVEL_CONFIG).map(([key, cfg]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span>{cfg.icono}</span>
            <strong style={{ color: cfg.color }}>{cfg.label}</strong>
            <span style={{ color: 'var(--text-faint)' }}>
              — {key === 'editar' ? 'puede añadir y editar' : key === 'ver' ? 'solo lectura' : 'no ve esta sección'}
            </span>
          </div>
        ))}
      </div>

      {/* Demo note */}
      {mode === 'demo' && (
        <p style={{ fontSize: 12, color: 'var(--text-faint)', fontStyle: 'italic', margin: 0, textAlign: 'center' }}>
          En la demo los cambios persisten durante la sesión. En producción se sincronizaría con la cuenta real de {persona.nombre}.
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Correr todos los tests**

```bash
npx vitest run
```

Expected: Todos los tests pasan (incluyendo los 4 nuevos de comparticion.test.js y los 5 de initDemoData.test.js).

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/modules/ComparticionPanel.jsx src/data/demo/__tests__/comparticion.test.js
git commit -m "feat(hogar): add ComparticionPanel with sharing level toggles"
```

---

## Task 3: ShoppingList — chip de atribución "María"

**Files:**
- Modify: `src/pages/app/modules/ShoppingList.jsx`

La función `itemFromDb` (en `src/utils/itemTransformers.js`) hace spread del row completo (`...row`), por lo que `owner_id` y `owner_name` pasan directamente al item. No hay que tocar `itemTransformers.js`.

Hay dos sub-componentes que renderizan items pendientes (no marcados):
- `DesktopItem` — vista desktop (función interna, usa `item.name`, `item.quantity`, `item.unit`)
- `SwipeItem` — vista mobile con swipe (mismos campos)

Ambos tienen una línea `{item.name}` con `flex: 1` — justo después de esa `<span>` se inserta el chip.

- [ ] **Step 1: Actualizar DesktopItem — añadir chip tras el nombre**

En `src/pages/app/modules/ShoppingList.jsx`, localizar la línea exacta (dentro de `DesktopItem`, es la que tiene `fontSize: 13`):

```jsx
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.name}</span>
```

Reemplazar por:

```jsx
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.name}</span>
      {item.owner_id === 'maria' && item.owner_name && (
        <span style={{
          fontSize: 10, padding: '2px 7px', borderRadius: 99, flexShrink: 0,
          background: 'rgba(139,92,246,.15)', color: '#8b5cf6', fontWeight: 700,
        }}>
          {item.owner_name}
        </span>
      )}
```

- [ ] **Step 2: Actualizar SwipeItem — añadir chip tras el nombre**

En el mismo archivo, localizar la línea (dentro de `SwipeItem`, es la que tiene `fontSize: 15`):

```jsx
        <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{item.name}</span>
```

Reemplazar por:

```jsx
        <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{item.name}</span>
        {item.owner_id === 'maria' && item.owner_name && (
          <span style={{
            fontSize: 11, padding: '2px 7px', borderRadius: 99, flexShrink: 0,
            background: 'rgba(139,92,246,.15)', color: '#8b5cf6', fontWeight: 700,
          }}>
            {item.owner_name}
          </span>
        )}
```

- [ ] **Step 3: Verificar visualmente**

Arrancar el servidor: `npm run dev`. Navegar a `/demo/hogar/shopping`.

Comprobar:
- "Pan integral", "Tomates" y "Cerveza" muestran un chip morado `María` a la derecha del nombre.
- Los demás ítems (Leche, Pechuga de pollo, Huevos, Detergente…) no tienen chip.
- En mobile (o reduciendo la ventana a < 640px) los mismos ítems muestran el chip en la vista de swipe.

- [ ] **Step 4: Commit**

```bash
git add src/pages/app/modules/ShoppingList.jsx
git commit -m "feat(shopping): show purple owner chip for María's items"
```

---

## Task 4: Nav + routing — añadir Compartición al grupo Casa

**Files:**
- Modify: `src/pages/app/DemoAppLayout.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Añadir `comparticion` a HOGAR_MODULES en DemoAppLayout.jsx**

En `src/pages/app/DemoAppLayout.jsx`, la constante `HOGAR_MODULES` actualmente tiene Cocina, Limpieza y Espacios. El grupo `casa` de `HOGAR_GROUPS` existe pero ningún módulo lo tiene asignado (muestra "Próximamente"). Añadir al final del array:

```js
const HOGAR_MODULES = [
  // ── Cocina ──────────────────────────────────
  { path: 'nevera',     label: 'Nevera',     icon: '🧊', group: 'cocina' },
  { path: 'congelador', label: 'Congelador', icon: '❄️', group: 'cocina' },
  { path: 'menu',       label: 'Menú',       icon: '🍽️', group: 'cocina' },
  { path: 'recipes',   label: 'Recetas',  icon: '👨‍🍳', group: 'cocina' },
  { path: 'despensa',  label: 'Despensa', icon: '🥫',  group: 'cocina' },
  { path: 'shopping',  label: 'Lista',    icon: '🛒',  group: 'cocina' },
  // ── Limpieza ─────────────────────────────────
  { path: 'limpieza',           label: 'Tareas',    icon: '🧹', group: 'limpieza' },
  { path: 'productos-limpieza', label: 'Productos', icon: '🧴', group: 'limpieza' },
  { path: 'roomba',             label: 'Roomba',    icon: '🤖', group: 'limpieza' },
  { path: 'personal-limpieza',  label: 'Personal',  icon: '👷', group: 'limpieza' },
  // ── Espacios ─────────────────────────────────
  { path: 'bano', label: 'Baño', icon: '🪥', group: 'espacios' },
  // ── Casa ─────────────────────────────────────
  { path: 'comparticion', label: 'Compartición', icon: '👥', group: 'casa' },
]
```

- [ ] **Step 2: Añadir lazy import en App.jsx**

En `src/App.jsx`, después de la línea que importa `Bano` (línea 39 aprox.):

```js
const ComparticionPanel = React.lazy(() => import('./pages/app/modules/ComparticionPanel'))
```

- [ ] **Step 3: Añadir ruta en `/app/hogar`**

En `src/App.jsx`, dentro del bloque de rutas de `/app/hogar`, después de la ruta `bano` (alrededor de la línea 189):

```jsx
<Route path="comparticion" element={<ComparticionPanel />} />
```

- [ ] **Step 4: Añadir ruta en `/demo/:appType`**

En `src/App.jsx`, dentro del bloque de rutas de `/demo/:appType`, después de la ruta `bano` (alrededor de la línea 260):

```jsx
<Route path="comparticion" element={<ComparticionPanel />} />
```

- [ ] **Step 5: Verificar navegación completa**

Arrancar `npm run dev`. Navegar a `/demo/hogar`.

Comprobar en sidebar (desktop):
- Aparece el grupo "🔧 Casa" con una entrada "👥 Compartición".
- Los grupos anteriores (Cocina, Limpieza, Espacios) siguen sin cambios.

Hacer clic en "Compartición":
- Carga el panel con la tarjeta de María (👩, Pareja, color lila).
- Se muestran 9 secciones con sus niveles (🔓/👁️/🔒).
- Hacer clic en cualquier botón de nivel cambia el estado visualmente (verde/ámbar/rojo).
- La nota de demo al final aparece.

Verificar en mobile (< 640px):
- El grupo Casa aparece en la lista con la entrada Compartición.
- El panel carga y funciona igual.

- [ ] **Step 6: Correr todos los tests**

```bash
npx vitest run
```

Expected: Todos los tests pasan.

- [ ] **Step 7: Commit**

```bash
git add src/pages/app/DemoAppLayout.jsx src/App.jsx
git commit -m "feat(hogar): add Compartición nav entry and route in Casa group"
```

---

## Self-Review

**Spec coverage** (§8.5 del spec `2026-05-13-plataforma-vida-design.md`):
- ✅ Panel "Mi hogar compartido" mostrando qué secciones están compartidas con María → Task 2 (`ComparticionPanel.jsx`)
- ✅ Indicadores visuales del nivel de compartición (🔓👁️🔒) → Botones en el panel de cada sección
- ✅ Algunos ítems de la lista de compra atribuidos a "María" → Tasks 1 + 3
- ✅ Pantalla de gestión de compartición interactiva (aunque estática en demo) → Los toggles persisten en sessionStorage

**Placeholder scan:** Ninguno. Todo el código está completo y específico.

**Type consistency:**
- `nivel` values: `'editar' | 'ver' | 'privado'` — usados consistentemente en hogar.js (Task 1), test (Task 2) y `NIVEL_CONFIG` (Task 2).
- `owner_id: 'maria'` y `owner_id === 'maria'` — idénticos en hogar.js (Task 1) y ShoppingList.jsx (Task 3).
- `demoRead` devuelve `[]` para clave inexistente → el componente usa `Array.isArray(stored) ? DEFAULT : stored` para manejar ese caso correctamente.
