# Fase 3 — Almacenamiento ampliado: Nevera, Congelador, Despensa y Baño

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ampliar el grupo Cocina de Hogar con Nevera, Congelador y una Despensa rediseñada, y añadir el grupo Espacios con la sección Baño.

**Architecture:** Se crean 4 componentes nuevos (Nevera, Congelador, Despensa, Bano) que leen demo data con `demoRead`. La ruta `despensa` apunta ahora a `Despensa.jsx` en lugar de `Inventario.jsx` (Inventario.jsx se conserva para la app real). El grupo Espacios pasa de "Próximamente" a tener contenido real con Baño.

**Tech Stack:** React 18, React Router v6, design tokens CSS H3nky (var(--accent), var(--bg-card), var(--border), var(--font-tech)), demoRead/demoWrite (demo), date-fns (ya instalado)

---

## Archivos afectados

| Archivo | Acción | Qué cambia |
|---|---|---|
| `src/data/demo/hogar.js` | Modificar | Añadir `nevera`, `congelador`, `despensa_items`, `bano` |
| `src/pages/app/modules/Nevera.jsx` | Crear | Items de nevera con semáforo de caducidad |
| `src/pages/app/modules/Congelador.jsx` | Crear | Items de congelador con barra días/máximo |
| `src/pages/app/modules/Despensa.jsx` | Crear | Secos y conservas con stock mín/máx y controles +/− |
| `src/pages/app/modules/Bano.jsx` | Crear | Consumibles (stock +/−) + durables (ciclo lavado/sustitución) |
| `src/pages/app/DemoAppLayout.jsx` | Modificar | Añadir nevera/congelador a Cocina, actualizar icon despensa; añadir baño a Espacios |
| `src/App.jsx` | Modificar | Añadir rutas nevera, congelador, bano; cambiar despensa a Despensa.jsx |

---

## Task 1: Demo data — nevera, congelador, despensa_items, baño

**Files:**
- Modify: `src/data/demo/hogar.js`

- [ ] **Paso 1.1 — Añadir `nevera` al objeto `mockHogar`**

Añadir antes del cierre del objeto:

```js
nevera: [
  { id: 'nev-1', nombre: 'Leche entera',      icono: '🥛', cantidad: 2,   unidad: 'L',    caducidad: fmt(addDays(hoy, 3)),  categoria: 'lácteos'   },
  { id: 'nev-2', nombre: 'Yogures',            icono: '🥄', cantidad: 8,   unidad: 'ud',   caducidad: fmt(addDays(hoy, 7)),  categoria: 'lácteos'   },
  { id: 'nev-3', nombre: 'Huevos',             icono: '🥚', cantidad: 6,   unidad: 'ud',   caducidad: fmt(addDays(hoy, 14)), categoria: 'proteínas' },
  { id: 'nev-4', nombre: 'Pollo filetes',      icono: '🍗', cantidad: 500, unidad: 'g',    caducidad: fmt(addDays(hoy, 1)),  categoria: 'carnes'    },
  { id: 'nev-5', nombre: 'Queso manchego',     icono: '🧀', cantidad: 200, unidad: 'g',    caducidad: fmt(addDays(hoy, 20)), categoria: 'lácteos'   },
  { id: 'nev-6', nombre: 'Ensalada bolsa',     icono: '🥗', cantidad: 1,   unidad: 'bolsa',caducidad: fmt(subDays(hoy, 1)),  categoria: 'verduras'  },
  { id: 'nev-7', nombre: 'Mermelada fresa',    icono: '🍓', cantidad: 1,   unidad: 'tarro',caducidad: fmt(addDays(hoy, 90)), categoria: 'otros'     },
  { id: 'nev-8', nombre: 'Mantequilla',        icono: '🧈', cantidad: 1,   unidad: 'paquete', caducidad: fmt(addDays(hoy, 30)), categoria: 'lácteos' },
],
```

- [ ] **Paso 1.2 — Añadir `congelador`**

```js
congelador: [
  { id: 'con-1', nombre: 'Pollo entero',    icono: '🍗', cantidad: 1,   unidad: 'ud', fecha_congelado: fmt(subDays(hoy, 30)), tiempo_max: 180, categoria: 'carnes'    },
  { id: 'con-2', nombre: 'Carne picada',    icono: '🥩', cantidad: 500, unidad: 'g',  fecha_congelado: fmt(subDays(hoy, 14)), tiempo_max: 90,  categoria: 'carnes'    },
  { id: 'con-3', nombre: 'Gambas',          icono: '🦐', cantidad: 500, unidad: 'g',  fecha_congelado: fmt(subDays(hoy, 7)),  tiempo_max: 90,  categoria: 'pescados'  },
  { id: 'con-4', nombre: 'Judías verdes',   icono: '🫘', cantidad: 400, unidad: 'g',  fecha_congelado: fmt(subDays(hoy, 60)), tiempo_max: 365, categoria: 'verduras'  },
  { id: 'con-5', nombre: 'Helado vainilla', icono: '🍦', cantidad: 500, unidad: 'g',  fecha_congelado: fmt(subDays(hoy, 3)),  tiempo_max: 365, categoria: 'postres'   },
  { id: 'con-6', nombre: 'Pan de molde',    icono: '🍞', cantidad: 1,   unidad: 'bolsa', fecha_congelado: fmt(subDays(hoy, 5)), tiempo_max: 90, categoria: 'panadería' },
],
```

- [ ] **Paso 1.3 — Añadir `despensa_items`**

```js
despensa_items: [
  { id: 'des-1',  nombre: 'Arroz',            icono: '🍚', cantidad: 2,    unidad: 'kg',   minimo: 0.5, categoria: 'cereales'    },
  { id: 'des-2',  nombre: 'Pasta macarrones', icono: '🍝', cantidad: 0.5,  unidad: 'kg',   minimo: 0.5, categoria: 'cereales'    },
  { id: 'des-3',  nombre: 'Lentejas',         icono: '🫘', cantidad: 1,    unidad: 'kg',   minimo: 0.5, categoria: 'legumbres'   },
  { id: 'des-4',  nombre: 'Tomate frito',     icono: '🥫', cantidad: 3,    unidad: 'bote', minimo: 2,   categoria: 'conservas'   },
  { id: 'des-5',  nombre: 'Atún en lata',     icono: '🐟', cantidad: 2,    unidad: 'lata', minimo: 3,   categoria: 'conservas'   },
  { id: 'des-6',  nombre: 'Aceite de oliva',  icono: '🫙', cantidad: 1,    unidad: 'L',    minimo: 0.5, categoria: 'aceites'     },
  { id: 'des-7',  nombre: 'Azúcar',           icono: '🍬', cantidad: 0,    unidad: 'kg',   minimo: 0.5, categoria: 'otros'       },
  { id: 'des-8',  nombre: 'Harina',           icono: '🌾', cantidad: 1,    unidad: 'kg',   minimo: 0.5, categoria: 'cereales'    },
  { id: 'des-9',  nombre: 'Café molido',      icono: '☕', cantidad: 0.25, unidad: 'kg',   minimo: 0.25,categoria: 'bebidas'     },
  { id: 'des-10', nombre: 'Sal',              icono: '🧂', cantidad: 1,    unidad: 'kg',   minimo: 0.5, categoria: 'condimentos' },
],
```

- [ ] **Paso 1.4 — Añadir `bano`**

```js
bano: {
  consumibles: [
    { id: 'ban-1', nombre: 'Papel higiénico', icono: '🧻', cantidad: 6,   unidad: 'rollos', minimo: 4 },
    { id: 'ban-2', nombre: 'Jabón de manos',  icono: '🫧', cantidad: 2,   unidad: 'bote',   minimo: 1 },
    { id: 'ban-3', nombre: 'Pasta de dientes',icono: '🪥', cantidad: 1,   unidad: 'tubo',   minimo: 1 },
    { id: 'ban-4', nombre: 'Champú',          icono: '🧴', cantidad: 0.5, unidad: 'bote',   minimo: 1 },
    { id: 'ban-5', nombre: 'Gel de ducha',    icono: '🚿', cantidad: 1,   unidad: 'bote',   minimo: 1 },
    { id: 'ban-6', nombre: 'Desodorante',     icono: '💨', cantidad: 2,   unidad: 'ud',     minimo: 1 },
  ],
  durables: [
    { id: 'ban-d1', nombre: 'Cepillo dientes (adulto 1)', icono: '🪥', ultimo_cambio: fmt(subDays(hoy, 70)), intervalo_dias: 90 },
    { id: 'ban-d2', nombre: 'Cepillo dientes (adulto 2)', icono: '🪥', ultimo_cambio: fmt(subDays(hoy, 30)), intervalo_dias: 90 },
    { id: 'ban-d3', nombre: 'Toallas baño',               icono: '🛁', ultimo_cambio: fmt(subDays(hoy, 15)), intervalo_dias: 7  },
    { id: 'ban-d4', nombre: 'Esponja ducha',              icono: '🧽', ultimo_cambio: fmt(subDays(hoy, 25)), intervalo_dias: 30 },
  ],
},
```

- [ ] **Paso 1.5 — Verificar con build**

```bash
cd /home/user/mi-portfolio-proyectos && npm run build 2>&1 | tail -5
```

- [ ] **Paso 1.6 — Commit**

```bash
git add src/data/demo/hogar.js
git commit -m "feat(hogar): demo data para nevera, congelador, despensa y baño"
```

---

## Task 2: Nevera.jsx — nueva sección

**Files:**
- Create: `src/pages/app/modules/Nevera.jsx`
- Modify: `src/pages/app/DemoAppLayout.jsx` (añadir módulo nevera al grupo cocina)
- Modify: `src/App.jsx` (lazy import + ruta)

- [ ] **Paso 2.1 — Crear `Nevera.jsx`**

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead } from '../../../data/demo/index.js'

// días hasta caducidad (negativo = ya caducado)
function diasHasta(fechaStr) {
  if (!fechaStr) return null
  return Math.round((new Date(fechaStr) - new Date()) / (1000 * 60 * 60 * 24))
}

function semaforo(dias) {
  if (dias === null) return { color: 'var(--text-faint)', label: '—' }
  if (dias < 0)  return { color: '#ef4444', label: `Caducado hace ${Math.abs(dias)}d` }
  if (dias === 0) return { color: '#ef4444', label: 'Caduca hoy' }
  if (dias <= 3)  return { color: '#f59e0b', label: `${dias}d` }
  return { color: '#22c55e', label: `${dias}d` }
}

const UNIDADES = ['ud', 'L', 'g', 'kg', 'bolsa', 'tarro', 'paquete', 'bote']

export default function Nevera() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const [items, setItems] = useState(() =>
    mode === 'demo' ? (demoRead(app.type ?? 'hogar', 'nevera') ?? []) : []
  )
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ nombre: '', cantidad: '', unidad: 'ud', caducidad: '' })

  const sorted = [...items].sort((a, b) => {
    const da = diasHasta(a.caducidad)
    const db = diasHasta(b.caducidad)
    if (da === null) return 1
    if (db === null) return -1
    return da - db
  })
  const caducados = items.filter(i => diasHasta(i.caducidad) !== null && diasHasta(i.caducidad) < 0)
  const proximos  = items.filter(i => { const d = diasHasta(i.caducidad); return d !== null && d >= 0 && d <= 3 })

  function handleAdd() {
    if (!form.nombre.trim()) return
    const nuevo = {
      id: crypto.randomUUID(),
      nombre: form.nombre.trim(),
      icono: '🍱',
      cantidad: Number(form.cantidad) || 1,
      unidad: form.unidad,
      caducidad: form.caducidad || null,
      categoria: 'otros',
    }
    setItems(prev => [...prev, nuevo])
    setForm({ nombre: '', cantidad: '', unidad: 'ud', caducidad: '' })
    setShowAdd(false)
  }

  function eliminar(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>🧊 Nevera</h1>
          <p style={{ fontSize: 13, margin: '4px 0 0',
            color: caducados.length > 0 ? '#ef4444' : proximos.length > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
            {caducados.length > 0
              ? `⚠️ ${caducados.length} producto${caducados.length !== 1 ? 's' : ''} caducado${caducados.length !== 1 ? 's' : ''}`
              : proximos.length > 0
                ? `⏰ ${proximos.length} caduca${proximos.length !== 1 ? 'n' : ''} pronto`
                : `${items.length} productos`}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(p => !p)}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >+ Añadir</button>
      </div>

      {/* Formulario */}
      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Nuevo producto</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre *" autoFocus
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Cantidad</label>
                <input type="number" min="0" step="0.5" value={form.cantidad}
                  onChange={e => setForm(p => ({ ...p, cantidad: e.target.value }))} placeholder="1"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Unidad</label>
                <select value={form.unidad} onChange={e => setForm(p => ({ ...p, unidad: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
                  {UNIDADES.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Caduca</label>
                <input type="date" value={form.caducidad} min={today}
                  onChange={e => setForm(p => ({ ...p, caducidad: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                Cancelar
              </button>
              <button onClick={handleAdd} disabled={!form.nombre.trim()}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: form.nombre.trim() ? 1 : 0.4 }}>
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>🧊</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Nevera vacía</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade los productos que tienes ahora mismo</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sorted.map(item => {
            const dias = diasHasta(item.caducidad)
            const { color: semColor, label: semLabel } = semaforo(dias)
            const isAlert = dias !== null && dias <= 3
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 12,
                  border: `1px solid ${isAlert ? (dias < 0 ? 'rgba(239,68,68,.4)' : 'rgba(245,158,11,.4)') : 'var(--border)'}`,
                  background: 'var(--bg-card)',
                }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icono}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.nombre}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                    {item.cantidad} {item.unidad}
                  </p>
                </div>
                {item.caducidad && (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: semColor }}>{semLabel}</span>
                  </div>
                )}
                <button className="del-btn" onClick={() => eliminar(item.id)}
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
  )
}
```

- [ ] **Paso 2.2 — Añadir módulo en HOGAR_MODULES (DemoAppLayout.jsx)**

En el grupo `cocina`, añadir `nevera` antes de `menu`:

```js
{ path: 'nevera',     label: 'Nevera',   icon: '🧊', group: 'cocina' },
{ path: 'menu',       label: 'Menú',     icon: '🍽️', group: 'cocina' },
{ path: 'recipes',    label: 'Recetas',  icon: '👨‍🍳', group: 'cocina' },
{ path: 'despensa',   label: 'Despensa', icon: '🥫',  group: 'cocina' },
{ path: 'shopping',   label: 'Lista',    icon: '🛒',  group: 'cocina' },
```

- [ ] **Paso 2.3 — Añadir lazy import y ruta en App.jsx**

Import:
```js
const Nevera = React.lazy(() => import('./pages/app/modules/Nevera'))
```

Ruta (en ambas secciones `/demo/:appType` y `/app/hogar`):
```jsx
<Route path="nevera" element={<Nevera />} />
```

- [ ] **Paso 2.4 — Build y commit**

```bash
cd /home/user/mi-portfolio-proyectos && npm run build 2>&1 | tail -5
git add src/pages/app/modules/Nevera.jsx src/pages/app/DemoAppLayout.jsx src/App.jsx
git commit -m "feat(cocina): nueva sección Nevera con semáforo de caducidad"
```

---

## Task 3: Congelador.jsx — nueva sección

**Files:**
- Create: `src/pages/app/modules/Congelador.jsx`
- Modify: `src/pages/app/DemoAppLayout.jsx`
- Modify: `src/App.jsx`

- [ ] **Paso 3.1 — Crear `Congelador.jsx`**

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead } from '../../../data/demo/index.js'

function diasCongelado(fechaStr) {
  if (!fechaStr) return 0
  return Math.round((new Date() - new Date(fechaStr)) / (1000 * 60 * 60 * 24))
}

const UNIDADES = ['ud', 'g', 'kg', 'L', 'bolsa', 'bote']

export default function Congelador() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const [items, setItems] = useState(() =>
    mode === 'demo' ? (demoRead(app.type ?? 'hogar', 'congelador') ?? []) : []
  )
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ nombre: '', cantidad: '', unidad: 'ud', tiempo_max: '90' })

  const sorted = [...items].sort((a, b) => {
    const da = diasCongelado(a.fecha_congelado) / (a.tiempo_max || 90)
    const db = diasCongelado(b.fecha_congelado) / (b.tiempo_max || 90)
    return db - da // más cerca del límite primero
  })

  const criticos = items.filter(i => diasCongelado(i.fecha_congelado) >= (i.tiempo_max ?? 90))

  function handleAdd() {
    if (!form.nombre.trim()) return
    const nuevo = {
      id: crypto.randomUUID(),
      nombre: form.nombre.trim(),
      icono: '❄️',
      cantidad: Number(form.cantidad) || 1,
      unidad: form.unidad,
      fecha_congelado: new Date().toISOString().slice(0, 10),
      tiempo_max: Number(form.tiempo_max) || 90,
      categoria: 'otros',
    }
    setItems(prev => [...prev, nuevo])
    setForm({ nombre: '', cantidad: '', unidad: 'ud', tiempo_max: '90' })
    setShowAdd(false)
  }

  function eliminar(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>❄️ Congelador</h1>
          <p style={{ fontSize: 13, margin: '4px 0 0',
            color: criticos.length > 0 ? '#ef4444' : 'var(--text-muted)' }}>
            {criticos.length > 0
              ? `⚠️ ${criticos.length} producto${criticos.length !== 1 ? 's' : ''} superado${criticos.length !== 1 ? 's' : ''} el límite`
              : `${items.length} productos`}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(p => !p)}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >+ Añadir</button>
      </div>

      {/* Formulario */}
      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Nuevo producto</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre *" autoFocus
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Cantidad</label>
                <input type="number" min="0" step="0.5" value={form.cantidad}
                  onChange={e => setForm(p => ({ ...p, cantidad: e.target.value }))} placeholder="1"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Unidad</label>
                <select value={form.unidad} onChange={e => setForm(p => ({ ...p, unidad: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
                  {UNIDADES.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Máx. días</label>
                <input type="number" min="1" value={form.tiempo_max}
                  onChange={e => setForm(p => ({ ...p, tiempo_max: e.target.value }))} placeholder="90"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                Cancelar
              </button>
              <button onClick={handleAdd} disabled={!form.nombre.trim()}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: form.nombre.trim() ? 1 : 0.4 }}>
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>❄️</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Congelador vacío</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade lo que tienes congelado y cuándo lo congelaste</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sorted.map(item => {
            const dias = diasCongelado(item.fecha_congelado)
            const max  = item.tiempo_max ?? 90
            const pct  = Math.min(100, Math.round((dias / max) * 100))
            const superado = dias >= max
            const barColor = superado ? '#ef4444' : pct > 75 ? '#f59e0b' : 'var(--accent)'
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 12,
                  border: `1px solid ${superado ? 'rgba(239,68,68,.4)' : 'var(--border)'}`,
                  background: 'var(--bg-card)',
                }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icono}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.nombre}</p>
                    <span style={{ fontSize: 12, color: superado ? '#ef4444' : 'var(--text-muted)', fontWeight: superado ? 700 : 400 }}>
                      {superado ? `¡Supera ${max}d!` : `${dias}/${max} días`}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 5px', fontSize: 12, color: 'var(--text-muted)' }}>{item.cantidad} {item.unidad}</p>
                  <div style={{ height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, width: `${pct}%`, background: barColor, transition: 'width .3s' }} />
                  </div>
                </div>
                <button className="del-btn" onClick={() => eliminar(item.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s', marginLeft: 8 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
                >×</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Paso 3.2 — Añadir módulo en HOGAR_MODULES (DemoAppLayout.jsx)**

Añadir `congelador` justo después de `nevera`:

```js
{ path: 'nevera',      label: 'Nevera',     icon: '🧊', group: 'cocina' },
{ path: 'congelador',  label: 'Congelador', icon: '❄️', group: 'cocina' },
{ path: 'menu',        label: 'Menú',       icon: '🍽️', group: 'cocina' },
{ path: 'recipes',     label: 'Recetas',    icon: '👨‍🍳', group: 'cocina' },
{ path: 'despensa',    label: 'Despensa',   icon: '🥫',  group: 'cocina' },
{ path: 'shopping',    label: 'Lista',      icon: '🛒',  group: 'cocina' },
```

- [ ] **Paso 3.3 — Añadir lazy import y ruta en App.jsx**

```js
const Congelador = React.lazy(() => import('./pages/app/modules/Congelador'))
```

Ruta (en ambas secciones):
```jsx
<Route path="congelador" element={<Congelador />} />
```

- [ ] **Paso 3.4 — Build y commit**

```bash
cd /home/user/mi-portfolio-proyectos && npm run build 2>&1 | tail -5
git add src/pages/app/modules/Congelador.jsx src/pages/app/DemoAppLayout.jsx src/App.jsx
git commit -m "feat(cocina): nueva sección Congelador con barra de días congelado"
```

---

## Task 4: Despensa.jsx — reemplazar Inventario en la ruta despensa

**Files:**
- Create: `src/pages/app/modules/Despensa.jsx`
- Modify: `src/App.jsx` (cambiar la ruta `despensa` de `<Inventario />` a `<Despensa />`)

> Nota: `Inventario.jsx` no se borra — sigue siendo el componente para la app real en `/app/hogar/inventario` si existe esa ruta. Solo sustituimos el binding de la ruta `despensa`.

- [ ] **Paso 4.1 — Crear `Despensa.jsx`**

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead } from '../../../data/demo/index.js'

const UNIDADES = ['ud', 'bote', 'lata', 'tarro', 'kg', 'g', 'L', 'bolsa', 'rollo']

export default function Despensa() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const [items, setItems] = useState(() =>
    mode === 'demo' ? (demoRead(app.type ?? 'hogar', 'despensa_items') ?? []) : []
  )
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ nombre: '', cantidad: '', unidad: 'bote', minimo: '' })

  function ajustar(id, delta) {
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, cantidad: Math.max(0, +(i.cantidad + delta).toFixed(1)) } : i
    ))
  }

  function handleAdd() {
    if (!form.nombre.trim()) return
    const nuevo = {
      id: crypto.randomUUID(),
      nombre: form.nombre.trim(),
      icono: '🥫',
      cantidad: Number(form.cantidad) || 0,
      unidad: form.unidad,
      minimo: Number(form.minimo) || 0,
      categoria: 'otros',
    }
    setItems(prev => [...prev, nuevo])
    setForm({ nombre: '', cantidad: '', unidad: 'bote', minimo: '' })
    setShowAdd(false)
  }

  function eliminar(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const bajoStock = items.filter(i => i.cantidad < i.minimo)

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>🥫 Despensa</h1>
          <p style={{ fontSize: 13, margin: '4px 0 0',
            color: bajoStock.length > 0 ? '#ef4444' : 'var(--text-muted)' }}>
            {bajoStock.length > 0
              ? `⚠️ ${bajoStock.length} producto${bajoStock.length !== 1 ? 's' : ''} bajo mínimo`
              : `${items.length} productos`}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(p => !p)}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >+ Añadir</button>
      </div>

      {/* Formulario */}
      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Nuevo producto</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre del producto *" autoFocus
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Cantidad</label>
                <input type="number" min="0" step="0.5" value={form.cantidad}
                  onChange={e => setForm(p => ({ ...p, cantidad: e.target.value }))} placeholder="0"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Unidad</label>
                <select value={form.unidad} onChange={e => setForm(p => ({ ...p, unidad: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
                  {UNIDADES.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Mínimo</label>
                <input type="number" min="0" step="0.5" value={form.minimo}
                  onChange={e => setForm(p => ({ ...p, minimo: e.target.value }))} placeholder="0"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                Cancelar
              </button>
              <button onClick={handleAdd} disabled={!form.nombre.trim()}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: form.nombre.trim() ? 1 : 0.4 }}>
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>🥫</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Despensa vacía</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade tus secos, conservas y básicos de cocina</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map(item => {
            const bajo = item.cantidad < item.minimo
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 12,
                  border: `1px solid ${bajo ? 'rgba(239,68,68,.4)' : 'var(--border)'}`,
                  background: 'var(--bg-card)',
                }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icono}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.nombre}</p>
                  {bajo && (
                    <p style={{ margin: '1px 0 0', fontSize: 11, color: '#ef4444' }}>⚠️ Bajo mínimo ({item.minimo} {item.unidad})</p>
                  )}
                </div>
                {/* Controles cantidad */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => ajustar(item.id, -0.5)}
                    style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontSize: 13, fontWeight: 700, color: bajo ? '#ef4444' : 'var(--text)', minWidth: 48, textAlign: 'center' }}>
                    {item.cantidad} {item.unidad}
                  </span>
                  <button onClick={() => ajustar(item.id, 0.5)}
                    style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                <button className="del-btn" onClick={() => eliminar(item.id)}
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
  )
}
```

- [ ] **Paso 4.2 — Cambiar la ruta `despensa` en App.jsx para usar `Despensa` en vez de `Inventario`**

Añadir el lazy import:
```js
const Despensa = React.lazy(() => import('./pages/app/modules/Despensa'))
```

Localizar la ruta:
```jsx
<Route path="despensa" element={<Inventario />} />
```

Cambiarla a:
```jsx
<Route path="despensa" element={<Despensa />} />
```

Hacer el cambio en **ambas secciones** del fichero (`/demo/:appType` y `/app/hogar`).

- [ ] **Paso 4.3 — Build y commit**

```bash
cd /home/user/mi-portfolio-proyectos && npm run build 2>&1 | tail -5
git add src/pages/app/modules/Despensa.jsx src/App.jsx
git commit -m "feat(cocina): Despensa.jsx con secos y conservas, reemplaza Inventario en ruta despensa"
```

---

## Task 5: Bano.jsx — nueva sección en grupo Espacios

**Files:**
- Create: `src/pages/app/modules/Bano.jsx`
- Modify: `src/pages/app/DemoAppLayout.jsx` (añadir módulo baño al grupo espacios)
- Modify: `src/App.jsx` (lazy import + ruta)

- [ ] **Paso 5.1 — Crear `Bano.jsx`**

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead } from '../../../data/demo/index.js'

function diasDesde(fechaStr) {
  if (!fechaStr) return 0
  return Math.round((new Date() - new Date(fechaStr)) / (1000 * 60 * 60 * 24))
}

export default function Bano() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const initial = mode === 'demo' ? (demoRead(app.type ?? 'hogar', 'bano') ?? {}) : {}
  const [consumibles, setConsumibles] = useState(initial.consumibles ?? [])
  const [durables,    setDurables]    = useState(initial.durables    ?? [])

  function ajustar(id, delta) {
    setConsumibles(prev => prev.map(c =>
      c.id === id ? { ...c, cantidad: Math.max(0, +(c.cantidad + delta).toFixed(1)) } : c
    ))
  }

  function marcarCambiado(id) {
    setDurables(prev => prev.map(d =>
      d.id === id ? { ...d, ultimo_cambio: new Date().toISOString().slice(0, 10) } : d
    ))
  }

  const bajoStock = consumibles.filter(c => c.cantidad < c.minimo)
  const pendientes = durables.filter(d => diasDesde(d.ultimo_cambio) >= d.intervalo_dias)

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>🪥 Baño</h1>
        <p style={{ fontSize: 13, margin: '4px 0 0',
          color: (bajoStock.length > 0 || pendientes.length > 0) ? '#ef4444' : 'var(--text-muted)' }}>
          {bajoStock.length > 0 || pendientes.length > 0
            ? `⚠️ ${bajoStock.length > 0 ? `${bajoStock.length} bajo stock` : ''}${bajoStock.length > 0 && pendientes.length > 0 ? ' · ' : ''}${pendientes.length > 0 ? `${pendientes.length} pendiente${pendientes.length !== 1 ? 's' : ''} de cambio` : ''}`
            : 'Todo al día'}
        </p>
      </div>

      {/* Consumibles */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
        <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Stock</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {consumibles.map(c => {
            const bajo = c.cantidad < c.minimo
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{c.icono}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{c.nombre}</p>
                  {bajo && <p style={{ margin: '1px 0 0', fontSize: 11, color: '#ef4444' }}>⚠️ Bajo mínimo</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => ajustar(c.id, -1)}
                    style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontSize: 13, fontWeight: 700, color: bajo ? '#ef4444' : 'var(--text)', minWidth: 56, textAlign: 'center' }}>
                    {c.cantidad} {c.unidad}
                  </span>
                  <button onClick={() => ajustar(c.id, 1)}
                    style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Durables */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
        <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Cambio periódico</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {durables.map(d => {
            const dias     = diasDesde(d.ultimo_cambio)
            const pendiente = dias >= d.intervalo_dias
            const pct       = Math.min(100, Math.round((dias / d.intervalo_dias) * 100))
            const barColor  = pendiente ? '#ef4444' : pct > 75 ? '#f59e0b' : 'var(--accent)'
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{d.icono}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: pendiente ? '#ef4444' : 'var(--text)' }}>{d.nombre}</span>
                    <span style={{ fontSize: 11, color: pendiente ? '#ef4444' : 'var(--text-muted)' }}>
                      {pendiente ? '¡Cambiar ya!' : `${dias}/${d.intervalo_dias} días`}
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, width: `${pct}%`, background: barColor, transition: 'width .3s' }} />
                  </div>
                </div>
                {pendiente && (
                  <button onClick={() => marcarCambiado(d.id)}
                    style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0, marginLeft: 8 }}>
                    ✓ Cambiado
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
```

- [ ] **Paso 5.2 — Añadir módulo en HOGAR_MODULES al grupo espacios (DemoAppLayout.jsx)**

Añadir `bano` al grupo `espacios`:

```js
{ path: 'bano', label: 'Baño', icon: '🪥', group: 'espacios' },
```

- [ ] **Paso 5.3 — Añadir lazy import y ruta en App.jsx**

```js
const Bano = React.lazy(() => import('./pages/app/modules/Bano'))
```

Ruta (en ambas secciones):
```jsx
<Route path="bano" element={<Bano />} />
```

- [ ] **Paso 5.4 — Build y tests**

```bash
cd /home/user/mi-portfolio-proyectos && npm run build 2>&1 | tail -5
npx vitest run --reporter=verbose 2>&1 | tail -20
```

- [ ] **Paso 5.5 — Commit**

```bash
git add src/pages/app/modules/Bano.jsx src/pages/app/DemoAppLayout.jsx src/App.jsx
git commit -m "feat(espacios): nueva sección Baño con stock consumibles y ciclo de durables"
```

---

## Verificación final

- [ ] `http://localhost:5173/demo/hogar` — nav Cocina muestra: Nevera, Congelador, Menú, Recetas, Despensa, Lista
- [ ] `/demo/hogar/nevera` — 8 items, Ensalada bolsa en rojo (caducada ayer), Pollo filetes en amarillo (caduca mañana)
- [ ] `/demo/hogar/congelador` — 6 items con barras de progreso, Pollo entero al 17% (30/180d)
- [ ] `/demo/hogar/despensa` — 10 secos/conservas, Atún y Azúcar marcados en rojo (bajo mínimo), controles +/−
- [ ] `/demo/hogar/bano` — 6 consumibles con +/−, Champú en rojo (0.5/1); 4 durables con barras, Toallas pendientes (15/7d)
- [ ] Nav Espacios muestra: Baño + "Próximamente" para Trastero, Terraza, Parking
- [ ] Botón "+ Añadir" en Nevera/Congelador/Despensa crea items y aparecen en lista
- [ ] Botón "× " elimina items en todos los módulos
- [ ] Build: `npm run build` sin errores
- [ ] Tests: `npx vitest run` — sin nuevos fallos
