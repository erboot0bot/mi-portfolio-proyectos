# Fase 2 — Limpieza ampliada: tareas de fábrica, productos, Roomba y personal

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expandir la sección Limpieza de Hogar con 4 mejoras: tareas de fábrica activables, sección de productos de limpieza con stock, sección básica de Roomba y sección básica de personal de limpieza.

**Architecture:** Se añaden 3 nuevos componentes de sección (ProductosLimpieza, Roomba, PersonalLimpieza), se actualiza Limpieza.jsx con factory tasks, se amplía el demo data en hogar.js, y se registran las nuevas rutas en App.jsx + DemoAppLayout.jsx. Todos los componentes siguen el patrón existente: useOutletContext + useMode + demoRead/write en demo, Supabase en prod.

**Tech Stack:** React 18, React Router v6, design tokens CSS H3nky (var(--accent), var(--bg-card), var(--border), var(--font-tech)), Supabase (prod), demoRead/demoWrite (demo)

---

## Archivos afectados

| Archivo | Acción | Qué cambia |
|---|---|---|
| `src/data/demo/hogar.js` | Modificar | Añadir factory_tasks, productos_limpieza, roomba, personal_limpieza |
| `src/pages/app/modules/Limpieza.jsx` | Modificar | Sección de tareas de fábrica con toggle activo/inactivo |
| `src/pages/app/modules/ProductosLimpieza.jsx` | Crear | Stock de productos de limpieza |
| `src/pages/app/modules/Roomba.jsx` | Crear | Estado, programación y consumibles del robot |
| `src/pages/app/modules/PersonalLimpieza.jsx` | Crear | Gestión de personal de limpieza |
| `src/pages/app/DemoAppLayout.jsx` | Modificar | Añadir 3 nuevos módulos al grupo limpieza |
| `src/App.jsx` | Modificar | Añadir 3 nuevas rutas bajo /demo/:appType |

---

## Task 1: Demo data — factory tasks, productos, roomba, personal

**Files:**
- Modify: `src/data/demo/hogar.js`

- [ ] **Paso 1.1 — Añadir `factory_tasks` al export `mockHogar`**

Las factory tasks son tareas predefinidas que el usuario puede activar o desactivar. `active: true` significa que están en la lista de tareas. Añadir al final del objeto `mockHogar`:

```js
factory_tasks: [
  { id: 'ft-1',  key: 'barrer',           label: 'Barrer',                    icon: '🧹', default_interval: 3,  active: true,  next_date: fmt(addDays(hoy, 1)) },
  { id: 'ft-2',  key: 'fregar',           label: 'Fregar suelo',              icon: '🪣', default_interval: 7,  active: true,  next_date: fmt(addDays(hoy, 3)) },
  { id: 'ft-3',  key: 'aspirar',          label: 'Aspirar',                   icon: '🌀', default_interval: 4,  active: false, next_date: null },
  { id: 'ft-4',  key: 'roomba',           label: 'Pasar Roomba',              icon: '🤖', default_interval: 2,  active: true,  next_date: fmt(addDays(hoy, 0)) },
  { id: 'ft-5',  key: 'limpiar_bano',     label: 'Limpiar baño',              icon: '🚿', default_interval: 7,  active: true,  next_date: fmt(subDays(hoy, 1)) },
  { id: 'ft-6',  key: 'limpiar_cocina',   label: 'Limpiar cocina',            icon: '🍳', default_interval: 7,  active: true,  next_date: fmt(addDays(hoy, 2)) },
  { id: 'ft-7',  key: 'limpiar_horno',    label: 'Limpiar horno',             icon: '♨️', default_interval: 30, active: false, next_date: null },
  { id: 'ft-8',  key: 'limpiar_micro',    label: 'Limpiar microondas',        icon: '📡', default_interval: 14, active: false, next_date: null },
  { id: 'ft-9',  key: 'cristales',        label: 'Limpiar cristales',         icon: '🪟', default_interval: 30, active: false, next_date: null },
  { id: 'ft-10', key: 'sabanas',          label: 'Cambiar sábanas',           icon: '🛏️', default_interval: 7,  active: true,  next_date: fmt(addDays(hoy, 4)) },
  { id: 'ft-11', key: 'ropa',             label: 'Lavar ropa',                icon: '👕', default_interval: 3,  active: true,  next_date: fmt(addDays(hoy, 1)) },
  { id: 'ft-12', key: 'nevera',           label: 'Limpiar nevera',            icon: '🧊', default_interval: 30, active: false, next_date: null },
  { id: 'ft-13', key: 'filtro_lavadora',  label: 'Limpiar filtro lavadora',   icon: '🌀', default_interval: 90, active: false, next_date: null },
  { id: 'ft-14', key: 'filtro_roomba',    label: 'Limpiar filtro Roomba',     icon: '🤖', default_interval: 30, active: true,  next_date: fmt(subDays(hoy, 2)) },
],
```

- [ ] **Paso 1.2 — Añadir `productos_limpieza`**

```js
productos_limpieza: [
  { id: 'pl-1', nombre: 'Lejía',          icon: '🫧', cantidad: 1.5, unidad: 'L',    minimo: 1,   categoria: 'desinfectante' },
  { id: 'pl-2', nombre: 'Friegasuelos',   icon: '🪣', cantidad: 2,   unidad: 'L',    minimo: 1,   categoria: 'suelos' },
  { id: 'pl-3', nombre: 'Limpiacristales',icon: '🪟', cantidad: 0.5, unidad: 'L',    minimo: 0.5, categoria: 'cristales' },
  { id: 'pl-4', nombre: 'Multiusos spray',icon: '🧴', cantidad: 1,   unidad: 'bote', minimo: 1,   categoria: 'multiusos' },
  { id: 'pl-5', nombre: 'Bayetas',        icon: '🧽', cantidad: 6,   unidad: 'ud',   minimo: 4,   categoria: 'utensilios' },
  { id: 'pl-6', nombre: 'Guantes',        icon: '🧤', cantidad: 2,   unidad: 'par',  minimo: 1,   categoria: 'utensilios' },
  { id: 'pl-7', nombre: 'WC gel',         icon: '🚽', cantidad: 1,   unidad: 'bote', minimo: 1,   categoria: 'baño' },
  { id: 'pl-8', nombre: 'Quitagrasas',    icon: '🧴', cantidad: 0,   unidad: 'bote', minimo: 1,   categoria: 'cocina' },
],
```

- [ ] **Paso 1.3 — Añadir `roomba`**

```js
roomba: {
  modelo: 'iRobot Roomba i7+',
  ultimo_pase: fmt(subDays(hoy, 1)),
  proximo_pase: fmt(addDays(hoy, 1)),
  duracion_ultimo: 52,
  estado: 'cargando',
  consumibles: [
    { id: 'rc-1', nombre: 'Filtro HEPA',        icono: '🌀', cada_dias: 60,  ultimo_cambio: fmt(subDays(hoy, 45)) },
    { id: 'rc-2', nombre: 'Cepillo lateral',    icono: '🔄', cada_dias: 30,  ultimo_cambio: fmt(subDays(hoy, 28)) },
    { id: 'rc-3', nombre: 'Cepillo principal',  icono: '🪥', cada_dias: 90,  ultimo_cambio: fmt(subDays(hoy, 20)) },
    { id: 'rc-4', nombre: 'Bolsa de residuos',  icono: '🗑️', cada_dias: 10,  ultimo_cambio: fmt(subDays(hoy, 8))  },
  ],
},
```

- [ ] **Paso 1.4 — Añadir `personal_limpieza`**

```js
personal_limpieza: [
  {
    id: 'pers-1',
    nombre: 'Carmen',
    telefono: '612 345 678',
    dias: ['lunes', 'jueves'],
    hora: '10:00',
    tarifa: 12,
    unidad_tarifa: '€/hora',
    horas_por_sesion: 3,
    notas: 'Lleva sus propios productos. Tiene llave.',
    tareas: ['limpiar_bano', 'fregar', 'aspirar', 'limpiar_cocina'],
    activo: true,
  },
],
```

- [ ] **Paso 1.5 — Verificar que hogar.js exporta correctamente**

```bash
cd /home/user/mi-portfolio-proyectos && node -e "
const { mockHogar } = await import('./src/data/demo/hogar.js').then(m => m)
console.log('factory_tasks:', mockHogar.factory_tasks?.length)
console.log('productos_limpieza:', mockHogar.productos_limpieza?.length)
console.log('roomba modelo:', mockHogar.roomba?.modelo)
console.log('personal:', mockHogar.personal_limpieza?.length)
" 2>&1 || npx vite-node -e "import { mockHogar } from './src/data/demo/hogar.js'; console.log(Object.keys(mockHogar))"
```

Si el comando no funciona, verificar con build:
```bash
npm run build 2>&1 | tail -5
```

- [ ] **Paso 1.6 — Commit**

```bash
git add src/data/demo/hogar.js
git commit -m "feat(hogar): demo data para factory tasks, productos limpieza, roomba y personal"
```

---

## Task 2: Tareas de fábrica en Limpieza.jsx

**Files:**
- Modify: `src/pages/app/modules/Limpieza.jsx`

Añadir una sección "Tareas de fábrica" debajo del header. Las factory tasks se leen del demo data y se pueden activar/desactivar. Las tareas activas aparecen en la lista principal mezcladas con las personalizadas.

- [ ] **Paso 2.1 — Importar demoRead y añadir estado de factory tasks**

Añadir al inicio del componente (después de los imports existentes):

```js
import { demoRead, demoWrite } from '../../../data/demo/index.js'
```

Dentro de `export default function Limpieza()`, añadir después de los `useState` existentes:

```js
const [factoryTasks, setFactoryTasks] = useState(() =>
  mode === 'demo' ? (demoRead(app.type ?? 'hogar', 'factory_tasks') ?? []) : []
)
const [showFactory, setShowFactory] = useState(false)
```

- [ ] **Paso 2.2 — Función para toggle factory task**

Añadir después de `removeTask`:

```js
function toggleFactory(taskId) {
  setFactoryTasks(prev => {
    const updated = prev.map(t =>
      t.id === taskId
        ? { ...t, active: !t.active, next_date: !t.active ? new Date().toISOString().slice(0, 10) : null }
        : t
    )
    return updated
  })
}
```

- [ ] **Paso 2.3 — Combinar factory tasks activas con tareas normales en la lista**

Cambiar la línea que define `tasks`:

```js
// ANTES:
const tasks = [...events].sort((a, b) => new Date(a.start_time) - new Date(b.start_time))

// DESPUÉS:
const factoryActive = factoryTasks
  .filter(ft => ft.active && ft.next_date)
  .map(ft => ({
    id: ft.id,
    title: ft.label,
    start_time: new Date(ft.next_date + 'T09:00:00').toISOString(),
    metadata: { interval_days: ft.default_interval, is_factory: true, factory_key: ft.key },
    _factory: true,
  }))
const tasks = [...events, ...factoryActive]
  .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
```

- [ ] **Paso 2.4 — Actualizar markDone para factory tasks**

Reemplazar la función `markDone` completa:

```js
async function markDone(task) {
  if (task._factory) {
    // Para factory tasks: programar siguiente intervalo
    const intervalDays = task.metadata?.interval_days ?? 7
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + intervalDays)
    setFactoryTasks(prev => prev.map(ft =>
      ft.id === task.id
        ? { ...ft, next_date: nextDate.toISOString().slice(0, 10) }
        : ft
    ))
    return
  }
  // Lógica existente para tareas normales
  await remove(task.id)
  const intervalDays = task.metadata?.interval_days
  if (intervalDays) {
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + Number(intervalDays))
    nextDate.setHours(9, 0, 0, 0)
    try {
      await add({
        event_type: 'cleaning',
        title:      task.title,
        start_time: nextDate.toISOString(),
        all_day:    true,
        metadata:   task.metadata,
      })
    } catch {
      setMarkError('La tarea se completó pero no se pudo programar la siguiente. Créala manualmente.')
    }
  }
}
```

- [ ] **Paso 2.5 — Añadir botón "Tareas de fábrica" en el header**

En el header (junto al botón "+ Nueva tarea"), añadir:

```jsx
<div style={{ display: 'flex', gap: 8 }}>
  <button
    onClick={() => setShowFactory(p => !p)}
    style={{ padding: '8px 12px', borderRadius: 10, background: showFactory ? 'var(--bg-card)' : 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
  >
    ⚙️ Fábrica ({factoryTasks.filter(f => f.active).length}/{factoryTasks.length})
  </button>
  <button
    onClick={() => setShowAdd(p => !p)}
    style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
  >+ Nueva tarea</button>
</div>
```

Quitar el botón `+ Nueva tarea` que estaba solo (ahora está dentro del div de arriba).

- [ ] **Paso 2.6 — Añadir panel de factory tasks (tras el header, antes del formulario)**

```jsx
{showFactory && (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
    <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
      Tareas de fábrica — activa las que hagas habitualmente
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {factoryTasks.map(ft => (
        <div key={ft.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: ft.active ? 'rgba(254,112,0,0.04)' : 'transparent' }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{ft.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: ft.active ? 'var(--text)' : 'var(--text-muted)' }}>{ft.label}</p>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-faint)' }}>↻ cada {ft.default_interval} días</p>
          </div>
          <button
            onClick={() => toggleFactory(ft.id)}
            style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: ft.active ? 'var(--accent)' : 'var(--bg)',
              color: ft.active ? '#fff' : 'var(--text-muted)',
              border: ft.active ? 'none' : '1px solid var(--border)',
            }}
          >
            {ft.active ? 'Activa' : 'Activar'}
          </button>
        </div>
      ))}
    </div>
  </div>
)}
```

- [ ] **Paso 2.7 — Badge "fábrica" en tareas de factory en la lista principal**

En la tarjeta de cada tarea, añadir tras el título una etiqueta visual si es factory:

```jsx
<p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
  {task.title}
  {task._factory && (
    <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 600, color: 'var(--accent)', background: 'rgba(254,112,0,0.1)', padding: '1px 6px', borderRadius: 20, verticalAlign: 'middle' }}>
      fábrica
    </span>
  )}
</p>
```

- [ ] **Paso 2.8 — Build y verificar**

```bash
cd /home/user/mi-portfolio-proyectos && npm run build 2>&1 | tail -5
```

Abrir `http://localhost:5173/demo/hogar/limpieza` y verificar:
- Botón "⚙️ Fábrica (X/14)" visible
- Al pulsarlo aparece el panel con las 14 tareas de fábrica
- Las activas muestran botón naranja "Activa", las inactivas "Activar"
- Las tareas activas aparecen en la lista principal con badge "fábrica"
- Marcar como hecha una tarea de fábrica reprograma su siguiente fecha

- [ ] **Paso 2.9 — Commit**

```bash
git add src/pages/app/modules/Limpieza.jsx
git commit -m "feat(limpieza): tareas de fábrica activables con toggle y badge visual"
```

---

## Task 3: ProductosLimpieza.jsx — nueva sección

**Files:**
- Create: `src/pages/app/modules/ProductosLimpieza.jsx`
- Modify: `src/pages/app/DemoAppLayout.jsx`
- Modify: `src/App.jsx`

- [ ] **Paso 3.1 — Crear `ProductosLimpieza.jsx`**

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead } from '../../../data/demo/index.js'

export default function ProductosLimpieza() {
  const { app, modules } = useOutletContext()
  const { mode } = useMode()

  const [productos, setProductos] = useState(() =>
    mode === 'demo' ? (demoRead(app.type ?? 'hogar', 'productos_limpieza') ?? []) : []
  )
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ nombre: '', cantidad: '', unidad: 'bote', minimo: '' })

  function ajustar(id, delta) {
    setProductos(prev => prev.map(p =>
      p.id === id ? { ...p, cantidad: Math.max(0, +(p.cantidad + delta).toFixed(1)) } : p
    ))
  }

  function handleAdd() {
    if (!form.nombre.trim()) return
    const nuevo = {
      id: crypto.randomUUID(),
      nombre: form.nombre.trim(),
      icon: '🧴',
      cantidad: Number(form.cantidad) || 0,
      unidad: form.unidad,
      minimo: Number(form.minimo) || 0,
      categoria: 'otros',
    }
    setProductos(prev => [...prev, nuevo])
    setForm({ nombre: '', cantidad: '', unidad: 'bote', minimo: '' })
    setShowAdd(false)
  }

  function eliminar(id) {
    setProductos(prev => prev.filter(p => p.id !== id))
  }

  const bajoStock = productos.filter(p => p.cantidad < p.minimo)

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Productos de limpieza</h1>
          <p style={{ fontSize: 13, color: bajoStock.length > 0 ? '#ef4444' : 'var(--text-muted)', margin: '4px 0 0' }}>
            {bajoStock.length > 0
              ? `⚠️ ${bajoStock.length} producto${bajoStock.length !== 1 ? 's' : ''} bajo mínimo`
              : `${productos.length} productos`}
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
            <input
              value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre del producto *"
              autoFocus
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Cantidad</label>
                <input type="number" min="0" step="0.5" value={form.cantidad}
                  onChange={e => setForm(p => ({ ...p, cantidad: e.target.value }))}
                  placeholder="0"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Unidad</label>
                <select value={form.unidad} onChange={e => setForm(p => ({ ...p, unidad: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
                  <option>bote</option>
                  <option>L</option>
                  <option>ud</option>
                  <option>par</option>
                  <option>kg</option>
                  <option>rollo</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Mínimo</label>
                <input type="number" min="0" step="0.5" value={form.minimo}
                  onChange={e => setForm(p => ({ ...p, minimo: e.target.value }))}
                  placeholder="0"
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
      {productos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>🧴</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin productos registrados</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade los productos de limpieza que usas habitualmente</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {productos.map(p => {
            const bajo = p.cantidad < p.minimo
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 12,
                  border: `1px solid ${bajo ? 'rgba(239,68,68,.4)' : 'var(--border)'}`,
                  background: 'var(--bg-card)',
                }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{p.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{p.nombre}</p>
                  {bajo && (
                    <p style={{ margin: '1px 0 0', fontSize: 11, color: '#ef4444' }}>⚠️ Bajo mínimo ({p.minimo} {p.unidad})</p>
                  )}
                </div>
                {/* Controles cantidad */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => ajustar(p.id, -0.5)}
                    style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontSize: 13, fontWeight: 700, color: bajo ? '#ef4444' : 'var(--text)', minWidth: 40, textAlign: 'center' }}>
                    {p.cantidad} {p.unidad}
                  </span>
                  <button onClick={() => ajustar(p.id, 0.5)}
                    style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                <button className="del-btn" onClick={() => eliminar(p.id)}
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

- [ ] **Paso 3.2 — Registrar módulo en HOGAR_MODULES (DemoAppLayout.jsx)**

Añadir en el grupo limpieza de HOGAR_MODULES:

```js
{ path: 'productos-limpieza', label: 'Productos', icon: '🧴', group: 'limpieza' },
```

Debe quedar el grupo limpieza:
```js
{ path: 'limpieza',           label: 'Tareas',    icon: '🧹',  group: 'limpieza' },
{ path: 'productos-limpieza', label: 'Productos',  icon: '🧴',  group: 'limpieza' },
```

- [ ] **Paso 3.3 — Añadir ruta en App.jsx**

Añadir junto a la ruta de limpieza:
```jsx
<Route path="productos-limpieza" element={<ProductosLimpieza />} />
```

Añadir el import lazy al inicio de App.jsx (junto a los otros imports lazy del módulo hogar):
```js
const ProductosLimpieza = React.lazy(() => import('./pages/app/modules/ProductosLimpieza'))
```

- [ ] **Paso 3.4 — Build y verificar**

```bash
cd /home/user/mi-portfolio-proyectos && npm run build 2>&1 | tail -5
```

Abrir `http://localhost:5173/demo/hogar/productos-limpieza`:
- Lista de 8 productos con cantidades e iconos
- Lejía (1.5 L), Friegasuelos (2 L), etc.
- Quitagrasas aparece en rojo (cantidad 0, mínimo 1)
- Botones +/− funcionan y modifican la cantidad
- Botón "Añadir" abre formulario, crea producto, aparece en lista
- El producto nuevo tiene botón ×  que lo elimina

- [ ] **Paso 3.5 — Commit**

```bash
git add src/pages/app/modules/ProductosLimpieza.jsx src/pages/app/DemoAppLayout.jsx src/App.jsx
git commit -m "feat(limpieza): nueva sección Productos de limpieza con stock y controles +/−"
```

---

## Task 4: Roomba.jsx — nueva sección

**Files:**
- Create: `src/pages/app/modules/Roomba.jsx`
- Modify: `src/pages/app/DemoAppLayout.jsx`
- Modify: `src/App.jsx`

- [ ] **Paso 4.1 — Crear `Roomba.jsx`**

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead } from '../../../data/demo/index.js'

function diasDesde(fechaStr) {
  if (!fechaStr) return null
  const diff = Math.round((new Date() - new Date(fechaStr)) / (1000 * 60 * 60 * 24))
  return diff
}

function diasPara(fechaStr) {
  if (!fechaStr) return null
  const diff = Math.round((new Date(fechaStr) - new Date()) / (1000 * 60 * 60 * 24))
  return diff
}

export default function Roomba() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const initial = mode === 'demo' ? (demoRead(app.type ?? 'hogar', 'roomba') ?? null) : null
  const [roomba, setRoomba] = useState(initial)
  const [consumibles, setConsumibles] = useState(initial?.consumibles ?? [])

  if (!roomba) {
    return (
      <div style={{ padding: '20px', maxWidth: 640 }}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: 48, margin: '0 0 12px' }}>🤖</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>Sin Roomba configurado</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade tu robot aspirador para gestionar sus mantenimientos</p>
        </div>
      </div>
    )
  }

  function marcarConsumible(id) {
    setConsumibles(prev => prev.map(c =>
      c.id === id ? { ...c, ultimo_cambio: new Date().toISOString().slice(0, 10) } : c
    ))
  }

  const proximoPase = diasPara(roomba.proximo_pase)
  const ultimoPase  = diasDesde(roomba.ultimo_pase)

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>🤖 Roomba</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>{roomba.modelo}</p>
      </div>

      {/* Estado */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
        <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Estado</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-tech)' }}>
              {ultimoPase === 0 ? 'Hoy' : `${ultimoPase}d`}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>Último pase</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: proximoPase <= 0 ? '#ef4444' : 'var(--accent)', fontFamily: 'var(--font-tech)' }}>
              {proximoPase <= 0 ? '¡Hoy!' : `En ${proximoPase}d`}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>Próximo pase</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-tech)' }}>
              {roomba.duracion_ultimo}m
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>Duración último</p>
          </div>
        </div>
      </div>

      {/* Consumibles */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
        <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Consumibles</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {consumibles.map(c => {
            const dias = diasDesde(c.ultimo_cambio)
            const pendiente = dias >= c.cada_dias
            const porcentaje = Math.min(100, Math.round((dias / c.cada_dias) * 100))
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{c.icono}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: pendiente ? '#ef4444' : 'var(--text)' }}>{c.nombre}</span>
                    <span style={{ fontSize: 11, color: pendiente ? '#ef4444' : 'var(--text-muted)' }}>
                      {pendiente ? '¡Cambiar ya!' : `${dias}/${c.cada_dias} días`}
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, width: `${porcentaje}%`, background: pendiente ? '#ef4444' : 'var(--accent)', transition: 'width .3s' }} />
                  </div>
                </div>
                {pendiente && (
                  <button onClick={() => marcarConsumible(c.id)}
                    style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
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

- [ ] **Paso 4.2 — Registrar módulo en HOGAR_MODULES**

Añadir al grupo limpieza:
```js
{ path: 'roomba', label: 'Roomba', icon: '🤖', group: 'limpieza' },
```

- [ ] **Paso 4.3 — Añadir ruta en App.jsx**

```js
const Roomba = React.lazy(() => import('./pages/app/modules/Roomba'))
```
```jsx
<Route path="roomba" element={<Roomba />} />
```

- [ ] **Paso 4.4 — Build y verificar**

```bash
cd /home/user/mi-portfolio-proyectos && npm run build 2>&1 | tail -5
```

Abrir `http://localhost:5173/demo/hogar/roomba`:
- Muestra modelo iRobot Roomba i7+
- 3 estadísticas: último pase, próximo pase, duración
- 4 consumibles con barra de progreso
- Bolsa de residuos pendiente (8/10 días) con botón "✓ Cambiado"
- Al pulsar "Cambiado" reinicia el contador a 0

- [ ] **Paso 4.5 — Commit**

```bash
git add src/pages/app/modules/Roomba.jsx src/pages/app/DemoAppLayout.jsx src/App.jsx
git commit -m "feat(limpieza): nueva sección Roomba con estado, próximo pase y consumibles"
```

---

## Task 5: PersonalLimpieza.jsx — nueva sección

**Files:**
- Create: `src/pages/app/modules/PersonalLimpieza.jsx`
- Modify: `src/pages/app/DemoAppLayout.jsx`
- Modify: `src/App.jsx`

- [ ] **Paso 5.1 — Crear `PersonalLimpieza.jsx`**

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead } from '../../../data/demo/index.js'

const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

export default function PersonalLimpieza() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const [personal, setPersonal] = useState(() =>
    mode === 'demo' ? (demoRead(app.type ?? 'hogar', 'personal_limpieza') ?? []) : []
  )
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ nombre: '', telefono: '', dias: [], hora: '10:00', tarifa: '', horas: '', notas: '' })

  function handleAdd() {
    if (!form.nombre.trim()) return
    const nuevo = {
      id: crypto.randomUUID(),
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      dias: form.dias,
      hora: form.hora,
      tarifa: Number(form.tarifa) || 0,
      unidad_tarifa: '€/hora',
      horas_por_sesion: Number(form.horas) || 2,
      notas: form.notas.trim(),
      tareas: [],
      activo: true,
    }
    setPersonal(prev => [...prev, nuevo])
    setForm({ nombre: '', telefono: '', dias: [], hora: '10:00', tarifa: '', horas: '', notas: '' })
    setShowAdd(false)
  }

  function toggleDia(dia) {
    setForm(p => ({
      ...p,
      dias: p.dias.includes(dia) ? p.dias.filter(d => d !== dia) : [...p.dias, dia],
    }))
  }

  function eliminar(id) {
    setPersonal(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Personal de limpieza</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {personal.length === 0 ? 'Sin personal registrado' : `${personal.length} persona${personal.length !== 1 ? 's' : ''}`}
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
          <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Nueva persona</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre *" autoFocus
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
              placeholder="Teléfono"
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 6 }}>Días que viene</label>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {DIAS_SEMANA.map(dia => (
                  <button key={dia} onClick={() => toggleDia(dia)}
                    style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none',
                      background: form.dias.includes(dia) ? 'var(--accent)' : 'var(--bg)',
                      color: form.dias.includes(dia) ? '#fff' : 'var(--text-muted)',
                      border: form.dias.includes(dia) ? 'none' : '1px solid var(--border)',
                    }}>
                    {dia.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Hora llegada</label>
                <input type="time" value={form.hora} onChange={e => setForm(p => ({ ...p, hora: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>€/hora</label>
                <input type="number" min="0" value={form.tarifa} onChange={e => setForm(p => ({ ...p, tarifa: e.target.value }))}
                  placeholder="12"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Horas/sesión</label>
                <input type="number" min="1" value={form.horas} onChange={e => setForm(p => ({ ...p, horas: e.target.value }))}
                  placeholder="3"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
            </div>
            <textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
              placeholder="Notas (tiene llave, trae productos...)" rows={2}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', resize: 'vertical' }} />
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
      {personal.length === 0 && !showAdd ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>👷</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin personal registrado</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade a las personas que te ayudan con la limpieza</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {personal.map(p => {
            const costeSession = (p.tarifa ?? 0) * (p.horas_por_sesion ?? 0)
            const costeMes = costeSession * (p.dias?.length ?? 0) * 4
            return (
              <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>👤 {p.nombre}</p>
                    {p.telefono && <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>📞 {p.telefono}</p>}
                  </div>
                  <button className="del-btn" onClick={() => eliminar(p.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
                  >×</button>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {(p.dias ?? []).map(dia => (
                    <span key={dia} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(254,112,0,0.1)', color: 'var(--accent)' }}>
                      {dia}
                    </span>
                  ))}
                  {p.hora && <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>🕙 {p.hora}</span>}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                  {p.tarifa > 0 && <span>💶 {p.tarifa}€/h · {p.horas_por_sesion}h = <strong style={{ color: 'var(--text)' }}>{costeSession}€/sesión</strong></span>}
                  {costeMes > 0 && <span>≈ <strong style={{ color: 'var(--text)' }}>{costeMes}€/mes</strong></span>}
                </div>
                {p.notas && <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>💬 {p.notas}</p>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Paso 5.2 — Registrar módulo en HOGAR_MODULES**

```js
{ path: 'personal-limpieza', label: 'Personal', icon: '👷', group: 'limpieza' },
```

- [ ] **Paso 5.3 — Añadir ruta en App.jsx**

```js
const PersonalLimpieza = React.lazy(() => import('./pages/app/modules/PersonalLimpieza'))
```
```jsx
<Route path="personal-limpieza" element={<PersonalLimpieza />} />
```

- [ ] **Paso 5.4 — Build y verificar**

```bash
cd /home/user/mi-portfolio-proyectos && npm run build 2>&1 | tail -5
```

Abrir `http://localhost:5173/demo/hogar/personal-limpieza`:
- Muestra a Carmen: lunes y jueves, 10:00, 12€/h, 3h/sesión = 36€/sesión ≈ 288€/mes
- Badge días en naranja, nota en cursiva
- Botón × aparece al hover y elimina la tarjeta
- Botón "Añadir" abre formulario con selectores de días toggle, al guardar aparece en lista

- [ ] **Paso 5.5 — Commit**

```bash
git add src/pages/app/modules/PersonalLimpieza.jsx src/pages/app/DemoAppLayout.jsx src/App.jsx
git commit -m "feat(limpieza): nueva sección Personal de limpieza con coste calculado"
```

---

## Verificación final

- [ ] `http://localhost:5173/demo/hogar` — nav lateral muestra grupo Limpieza con 4 items: Tareas, Productos, Roomba, Personal
- [ ] `/demo/hogar/limpieza` — botón ⚙️ Fábrica funciona, tareas activas mezcladas con custom, badge "fábrica" visible
- [ ] `/demo/hogar/productos-limpieza` — lista de 8 productos, +/− funcionan, botón Añadir crea productos
- [ ] `/demo/hogar/roomba` — estadísticas, consumibles con barras de progreso, botón "Cambiado" funciona
- [ ] `/demo/hogar/personal-limpieza` — Carmen visible con coste calculado, Añadir funciona, × elimina
- [ ] Build: `npm run build` sin errores
- [ ] Tests: `npx vitest run` — sin nuevos fallos
