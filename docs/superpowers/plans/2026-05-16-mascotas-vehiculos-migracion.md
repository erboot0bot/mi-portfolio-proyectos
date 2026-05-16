# Mascotas + Vehículos — Migración a Personal con Recordatorios

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite Personal/Mascotas y Personal/Vehiculos incorporando toda la funcionalidad de las apps standalone (Alimentación, Salud, Paseos, Mantenimiento) más recordatorios de calendario, y eliminar las apps standalone de mascotas y vehículo.

**Architecture:** Personal/Mascotas usa local state (`selectedId`) para navegar lista ↔ detalle-con-tabs (Ficha | Alimentación | Salud | Paseos/Mantenimiento-jaula). Personal/Vehiculos igual (Ficha | Mantenimiento). Los recordatorios escriben en `personal/events` vía `demoWrite`. Dos nuevas claves demo: `mascotas_eventos` y `vehiculos_mantenimiento`.

**Tech Stack:** React 18, Vite, React Router v6 `useOutletContext`, `demoRead`/`demoWrite` (sessionStorage), H3nky tokens (`var(--accent)=#fe7000`, `var(--bg-card)`, `var(--border)`, `var(--text)`, `var(--text-muted)`, `var(--text-faint)`), date-fns.

---

## File Map

| File | Acción |
|------|--------|
| `src/data/demo/personal.js` | Añadir campos alimentación a Luna, nueva clave `mascotas_eventos`, nueva clave `vehiculos_mantenimiento` |
| `src/data/demo/index.js` | Bump DEMO_VERSION '11' → '12'; eliminar imports de mockVehiculo y mockMascotas |
| `src/pages/app/modules/personal/Mascotas.jsx` | Reescribir completo |
| `src/pages/app/modules/personal/__tests__/Mascotas.test.jsx` | Actualizar tests |
| `src/pages/app/modules/personal/Vehiculos.jsx` | Reescribir completo |
| `src/pages/app/modules/personal/__tests__/Vehiculos.test.jsx` | Actualizar tests |
| `src/pages/DemoHome.jsx` | Eliminar referencias a apps mascotas y vehiculo |
| `src/pages/app/DemoAppLayout.jsx` | Eliminar mascotas/vehiculo de APP_META y MODULE_MAP |
| `src/App.jsx` | Eliminar lazy imports y rutas de las apps standalone |

---

## Task 1: Demo Data — Extensión de personal.js + DEMO_VERSION bump

**Files:**
- Modify: `src/data/demo/personal.js`
- Modify: `src/data/demo/index.js`

- [ ] **Step 1: Añadir campos de alimentación a Luna y nuevas claves en personal.js**

Reemplazar en `src/data/demo/personal.js` la entrada de Luna dentro de `mascotas`:

```js
  mascotas: [
    {
      id: 'mas-1', nombre: 'Luna', especie: 'perro', raza: 'Labrador', edad_anios: 3, icono: '🐕',
      veterinario: { nombre: 'Clínica VetCare', telefono: '93 456 78 90', direccion: 'Calle Mayor 12' },
      vacunas: [
        { id: 'vac-1', nombre: 'Rabia',       fecha_ultima: fmt(subDays(hoy, 90)), proxima: fmt(addDays(hoy, 275)) },
        { id: 'vac-2', nombre: 'Polivalente', fecha_ultima: fmt(subDays(hoy, 90)), proxima: fmt(addDays(hoy, 275)) },
      ],
      medicacion: [],
      notas: 'Alérgica al pollo. Revisar oídos cada mes.',
      alimentacion_stock: [
        { id: 'alst-1', nombre: 'Pienso adulto Royal Canin', current_stock: 3000, min_stock: 500, unit: 'g' },
        { id: 'alst-2', nombre: 'Snacks premio',             current_stock: 20,   min_stock: 5,   unit: 'uds' },
      ],
      alimentacion_schedule: [
        { time: '08:00', amount: '200g', label: 'Mañana' },
        { time: '19:00', amount: '200g', label: 'Noche'  },
      ],
    },
  ],
```

Luego añadir después del bloque `mascotas`, antes de `ropa_prendas`:

```js
  mascotas_eventos: [
    {
      id: 'mev-1', pet_id: 'mas-1',
      tipo: 'vet_visit', titulo: 'Revisión anual',
      start_time: new Date(fmt(addDays(hoy, 15)) + 'T10:00:00').toISOString(),
      all_day: true,
      metadata: { notes: 'Revisar oídos y peso', interval_days: null, duration_minutes: null },
      created_at: fmtTs(subDays(hoy, 2)),
    },
    {
      id: 'mev-2', pet_id: 'mas-1',
      tipo: 'walk', titulo: 'Paseo',
      start_time: new Date(new Date().setHours(8, 30, 0, 0)).toISOString(),
      all_day: false,
      metadata: { duration_minutes: 45, notes: null, interval_days: null },
      created_at: fmtTs(hoy),
    },
    {
      id: 'mev-3', pet_id: 'mas-1',
      tipo: 'walk', titulo: 'Paseo',
      start_time: new Date(new Date().setHours(19, 0, 0, 0)).toISOString(),
      all_day: false,
      metadata: { duration_minutes: 30, notes: 'Parque cerca de casa', interval_days: null },
      created_at: fmtTs(hoy),
    },
  ],

  vehiculos_mantenimiento: [
    {
      id: 'mant-1', vehicle_id: 'veh-1',
      type: 'aceite', date: fmt(subDays(hoy, 180)),
      km: 45000, description: 'Cambio aceite 5W30 + filtro aceite',
      cost: 85, next_km: 50000, next_date: fmt(addDays(hoy, 90)),
      created_at: fmtTs(subDays(hoy, 180)),
    },
    {
      id: 'mant-2', vehicle_id: 'veh-1',
      type: 'ITV', date: fmt(subDays(hoy, 548)),
      km: 38000, description: 'ITV superada con observaciones menores',
      cost: 52, next_km: null, next_date: fmt(addDays(hoy, 180)),
      created_at: fmtTs(subDays(hoy, 548)),
    },
    {
      id: 'mant-3', vehicle_id: 'veh-1',
      type: 'ruedas', date: fmt(subDays(hoy, 365)),
      km: 40000, description: 'Cambio 4 neumáticos Michelin Primacy 4',
      cost: 420, next_km: 80000, next_date: null,
      created_at: fmtTs(subDays(hoy, 365)),
    },
  ],
```

- [ ] **Step 2: Bump DEMO_VERSION en index.js**

En `src/data/demo/index.js`, cambiar:
```js
const DEMO_VERSION = '11'
```
por:
```js
const DEMO_VERSION = '12'
```

- [ ] **Step 3: Verificar que el build no rompe**

```bash
cd /home/user/mi-portfolio-proyectos && npm run build 2>&1 | tail -5
```
Expected: `✓ built in`

- [ ] **Step 4: Commit**

```bash
cd /home/user/mi-portfolio-proyectos && git add src/data/demo/personal.js src/data/demo/index.js && git commit -m "feat(demo): add mascotas_eventos, vehiculos_mantenimiento, alimentacion fields; bump v12"
```

---

## Task 2: Reescribir Personal/Mascotas.jsx

**Files:**
- Modify: `src/pages/app/modules/personal/Mascotas.jsx`
- Modify: `src/pages/app/modules/personal/__tests__/Mascotas.test.jsx`

- [ ] **Step 1: Escribir test que falla**

Reemplazar `src/pages/app/modules/personal/__tests__/Mascotas.test.jsx` con:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Mascotas from '../Mascotas'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'personal' } }) }))

const today = new Date()
const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) }
const subDays = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }

const MOCK_MASCOTAS = [{
  id: 'mas-1', nombre: 'Luna', especie: 'perro', raza: 'Labrador', edad_anios: 3, icono: '🐕',
  veterinario: { nombre: 'VetCare', telefono: '93 456 78 90', direccion: 'Calle Mayor 12' },
  vacunas: [{ id: 'vac-1', nombre: 'Rabia', fecha_ultima: subDays(90), proxima: addDays(275) }],
  medicacion: [], notas: 'Alérgica al pollo.',
  alimentacion_stock: [{ id: 'st-1', nombre: 'Pienso adulto', current_stock: 3000, min_stock: 500, unit: 'g' }],
  alimentacion_schedule: [{ time: '08:00', amount: '200g', label: 'Mañana' }],
}]
const MOCK_EVENTOS = [{
  id: 'ev-1', pet_id: 'mas-1', tipo: 'vet_visit', titulo: 'Revisión anual',
  start_time: addDays(15) + 'T09:00:00.000Z', all_day: true,
  metadata: { notes: 'Revisar oídos', interval_days: null, duration_minutes: null },
  created_at: today.toISOString(),
}]

vi.mock('../../../../../data/demo', () => ({
  demoRead: (_appType, key) => {
    if (key === 'mascotas') return MOCK_MASCOTAS
    if (key === 'mascotas_eventos') return MOCK_EVENTOS
    return []
  },
  demoWrite: vi.fn(),
}))

describe('Mascotas', () => {
  it('renders pet name in list view', () => {
    render(<Mascotas />)
    expect(screen.getByText('Luna')).toBeInTheDocument()
  })

  it('shows raza in list view', () => {
    render(<Mascotas />)
    expect(screen.getByText(/Labrador/)).toBeInTheDocument()
  })

  it('shows vet name after clicking pet', () => {
    render(<Mascotas />)
    fireEvent.click(screen.getByText('Luna'))
    expect(screen.getByText(/VetCare/)).toBeInTheDocument()
  })

  it('shows vaccine name in ficha tab', () => {
    render(<Mascotas />)
    fireEvent.click(screen.getByText('Luna'))
    expect(screen.getByText('Rabia')).toBeInTheDocument()
  })

  it('shows alimentacion tab with stock item after clicking tab', () => {
    render(<Mascotas />)
    fireEvent.click(screen.getByText('Luna'))
    fireEvent.click(screen.getByText('Alimentación'))
    expect(screen.getByText(/Pienso adulto/)).toBeInTheDocument()
  })

  it('shows salud tab with event after clicking tab', () => {
    render(<Mascotas />)
    fireEvent.click(screen.getByText('Luna'))
    fireEvent.click(screen.getByText('Salud'))
    expect(screen.getByText(/Revisión anual/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Confirmar que el test falla**

```bash
cd /home/user/mi-portfolio-proyectos && npm test -- --testPathPattern="personal/.*Mascotas" --watchAll=false 2>&1 | tail -20
```
Expected: FAIL (los tests de "clicking" fallarán porque el componente actual no tiene navegación lista/detalle)

- [ ] **Step 3: Reescribir Mascotas.jsx completo**

Reemplazar `src/pages/app/modules/personal/Mascotas.jsx` con:

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

// ── Constants ──────────────────────────────────────────────────────
const ESPECIE_ICON = { perro: '🐕', gato: '🐈', conejo: '🐇', otro: '🐾' }
const SALUD_TIPOS = {
  vaccination: { label: 'Vacuna',     icon: '💉' },
  vet_visit:   { label: 'Visita vet', icon: '🩺' },
  medication:  { label: 'Medicación', icon: '💊' },
}

// ── Helpers ────────────────────────────────────────────────────────
function diasHasta(f) {
  if (!f) return null
  return Math.ceil((new Date(f.slice(0, 10) + 'T12:00:00') - new Date(new Date().toDateString())) / 86400000)
}
function semVac(dias) {
  if (dias === null) return { color: 'var(--text-faint)', label: '—' }
  if (dias < 0)  return { color: '#ef4444', label: 'Vencida' }
  if (dias < 30) return { color: '#ef4444', label: `${dias}d` }
  if (dias < 90) return { color: '#f59e0b', label: `${dias}d` }
  return { color: '#22c55e', label: `${dias}d` }
}
function fmtSaludDue(isoStr) {
  const dias = diasHasta(isoStr)
  if (dias < 0) return { label: `Hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`, overdue: true }
  if (dias === 0) return { label: 'Hoy', overdue: false }
  if (dias === 1) return { label: 'Mañana', overdue: false }
  return { label: `En ${dias} días`, overdue: false }
}
function fmtWalkTime(isoStr) {
  const d = new Date(isoStr)
  const diff = Math.round((new Date(new Date().toDateString()) - new Date(d.toDateString())) / 86400000)
  const time = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  if (diff === 0) return `Hoy · ${time}`
  if (diff === 1) return `Ayer · ${time}`
  return `${d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })} · ${time}`
}
const inp = {
  background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
  padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none',
  width: '100%', boxSizing: 'border-box',
}
function TabBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 12px', borderRadius: '8px 8px 0 0', fontSize: 13,
      fontWeight: active ? 700 : 500,
      color: active ? 'var(--accent)' : 'var(--text-muted)',
      background: 'none', border: 'none',
      borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
      cursor: 'pointer', whiteSpace: 'nowrap',
    }}>{label}</button>
  )
}

// ── AlimentaciónTab sub-component ──────────────────────────────────
function AlimentacionTab({ pet, onUpdatePet }) {
  const stock = pet.alimentacion_stock ?? []
  const sched = pet.alimentacion_schedule ?? []
  const lowStock = stock.filter(i => i.min_stock > 0 && (i.current_stock ?? 0) <= i.min_stock)

  const [showAddItem, setShowAddItem] = useState(false)
  const [itemForm, setItemForm] = useState({ nombre: '', current_stock: '', min_stock: '', unit: 'g' })
  const [showAddToma, setShowAddToma] = useState(false)
  const [tomaForm, setTomaForm] = useState({ time: '08:00', amount: '', label: 'Mañana' })

  function adjustStock(itemId, delta) {
    onUpdatePet({ alimentacion_stock: stock.map(i => i.id === itemId ? { ...i, current_stock: Math.max(0, (i.current_stock ?? 0) + delta) } : i) })
  }
  function handleAddItem() {
    if (!itemForm.nombre.trim()) return
    onUpdatePet({ alimentacion_stock: [...stock, { id: crypto.randomUUID(), nombre: itemForm.nombre.trim(), current_stock: Number(itemForm.current_stock) || 0, min_stock: Number(itemForm.min_stock) || 0, unit: itemForm.unit || 'g' }] })
    setItemForm({ nombre: '', current_stock: '', min_stock: '', unit: 'g' }); setShowAddItem(false)
  }
  function handleAddToma() {
    if (!tomaForm.amount.trim()) return
    onUpdatePet({ alimentacion_schedule: [...sched, { time: tomaForm.time, amount: tomaForm.amount.trim(), label: tomaForm.label.trim() || tomaForm.time }] })
    setTomaForm({ time: '08:00', amount: '', label: 'Mañana' }); setShowAddToma(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stock */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>🏪 Stock de alimento</div>
          <button onClick={() => setShowAddItem(f => !f)} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Añadir</button>
        </div>
        {lowStock.length > 0 && (
          <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>⚠ Stock bajo</div>
            {lowStock.map(i => <div key={i.id} style={{ fontSize: 12, color: 'var(--text-muted)' }}>{i.nombre} — {i.current_stock} {i.unit} (mín. {i.min_stock})</div>)}
          </div>
        )}
        {showAddItem && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input value={itemForm.nombre} onChange={e => setItemForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Nombre del alimento *" autoFocus style={inp} />
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" min="0" value={itemForm.current_stock} onChange={e => setItemForm(f => ({ ...f, current_stock: e.target.value }))} placeholder="Stock" style={{ ...inp, flex: 1 }} />
                <input type="number" min="0" value={itemForm.min_stock} onChange={e => setItemForm(f => ({ ...f, min_stock: e.target.value }))} placeholder="Mínimo" style={{ ...inp, flex: 1 }} />
                <input value={itemForm.unit} onChange={e => setItemForm(f => ({ ...f, unit: e.target.value }))} placeholder="Unidad" style={{ ...inp, width: 70 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAddItem(false)} style={{ padding: '6px 12px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
                <button onClick={handleAddItem} disabled={!itemForm.nombre.trim()} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: itemForm.nombre.trim() ? 1 : 0.4 }}>Añadir</button>
              </div>
            </div>
          </div>
        )}
        {stock.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>Sin alimentos registrados.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {stock.map(item => {
              const isLow = item.min_stock > 0 && (item.current_stock ?? 0) <= item.min_stock
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${isLow ? 'rgba(239,68,68,.4)' : 'var(--border)'}`, background: 'var(--bg-card)' }}
                  onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-item'); if (b) b.style.opacity = '1' }}
                  onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-item'); if (b) b.style.opacity = '0' }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isLow ? '#ef4444' : 'var(--text)' }}>{isLow ? '⚠ ' : ''}{item.nombre}</div>
                    {item.min_stock > 0 && <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>mín. {item.min_stock} {item.unit}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => adjustStock(item.id, -1)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>−</button>
                    <span style={{ minWidth: 48, textAlign: 'center', fontSize: 14, fontWeight: 700 }}>{item.current_stock ?? 0}<span style={{ fontSize: 10, color: 'var(--text-faint)', marginLeft: 2 }}>{item.unit}</span></span>
                    <button onClick={() => adjustStock(item.id, 1)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>+</button>
                  </div>
                  <button className="del-item" onClick={() => onUpdatePet({ alimentacion_stock: stock.filter(i => i.id !== item.id) })}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 17, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}>×</button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Horario de tomas */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>🕐 Horario de tomas</div>
          <button onClick={() => setShowAddToma(f => !f)} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Añadir</button>
        </div>
        {showAddToma && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Hora</label><input type="time" value={tomaForm.time} onChange={e => setTomaForm(f => ({ ...f, time: e.target.value }))} style={inp} /></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Cantidad *</label><input value={tomaForm.amount} onChange={e => setTomaForm(f => ({ ...f, amount: e.target.value }))} placeholder="200g" style={inp} /></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Etiqueta</label><input value={tomaForm.label} onChange={e => setTomaForm(f => ({ ...f, label: e.target.value }))} placeholder="Mañana" style={inp} /></div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAddToma(false)} style={{ padding: '6px 12px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
                <button onClick={handleAddToma} disabled={!tomaForm.amount.trim()} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: tomaForm.amount.trim() ? 1 : 0.4 }}>Guardar</button>
              </div>
            </div>
          </div>
        )}
        {sched.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>Sin tomas programadas.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sched.map((toma, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)' }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-toma'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-toma'); if (b) b.style.opacity = '0' }}
              >
                <span style={{ fontSize: 20 }}>🕐</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{toma.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{toma.time} · {toma.amount}</div>
                </div>
                <button className="del-toma" onClick={() => onUpdatePet({ alimentacion_schedule: sched.filter((_, i) => i !== idx) })}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 17, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────
export default function Mascotas() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'personal'

  const [mascotas, setMascotas] = useState(() => demoRead(appType, 'mascotas') ?? [])
  const [eventos, setEventos]   = useState(() => demoRead(appType, 'mascotas_eventos') ?? [])
  const [selectedId, setSelectedId] = useState(null)
  const [activeTab, setActiveTab]   = useState('ficha')

  // Add-pet form
  const BLANK = { icono: '🐾', nombre: '', especie: 'perro', raza: '', edad_anios: '', notas: '' }
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState(BLANK)

  // Salud form
  const BLANK_SAL = { titulo: '', tipo: 'vet_visit', date: '', notes: '', interval_days: '' }
  const [showSaludForm, setShowSaludForm] = useState(false)
  const [saludForm, setSaludForm]         = useState(BLANK_SAL)

  // Walk form
  const [showWalkForm, setShowWalkForm] = useState(false)
  const [walkForm, setWalkForm]         = useState({ duration: '', notes: '' })

  // Cage maintenance form
  const BLANK_MANT = { titulo: '', date: '', interval_days: '', products: '' }
  const [showMantForm, setShowMantForm] = useState(false)
  const [mantForm, setMantForm]         = useState(BLANK_MANT)

  // Calendar reminder
  const [calForm, setCalForm] = useState(null) // { titulo, date } | null

  // Writers
  const saveMascotas = (next) => { setMascotas(next); demoWrite(appType, 'mascotas', next) }
  const saveEventos  = (next) => { setEventos(next);  demoWrite(appType, 'mascotas_eventos', next) }
  const updatePet    = (id, patch) => saveMascotas(mascotas.map(m => m.id === id ? { ...m, ...patch } : m))

  // Derived
  const selectedPet = mascotas.find(m => m.id === selectedId) ?? null
  const petEventos  = selectedPet ? eventos.filter(e => e.pet_id === selectedPet.id) : []
  const saludEvs    = petEventos.filter(e => ['vaccination', 'vet_visit', 'medication'].includes(e.tipo)).sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
  const weekAgo     = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
  const paseos      = petEventos.filter(e => e.tipo === 'walk' && new Date(e.start_time) >= weekAgo).sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
  const mantTasks   = petEventos.filter(e => e.tipo === 'cage_maintenance').sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
  const todayStart  = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayPaseos = paseos.filter(p => new Date(p.start_time) >= todayStart)
  const todayMins   = todayPaseos.reduce((acc, p) => acc + (p.metadata?.duration_minutes ?? 0), 0)
  const isPerro     = selectedPet?.especie === 'perro'
  const tabs        = isPerro
    ? [['ficha', 'Ficha'], ['alimentacion', 'Alimentación'], ['salud', 'Salud'], ['paseos', '🦮 Paseos']]
    : [['ficha', 'Ficha'], ['alimentacion', 'Alimentación'], ['salud', 'Salud'], ['mantenimiento', '🏠 Mantenim.']]

  // Handlers
  function handleAddPet(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return
    saveMascotas([...mascotas, { ...form, id: crypto.randomUUID(), edad_anios: Number(form.edad_anios) || 0, vacunas: [], medicacion: [], alimentacion_stock: [], alimentacion_schedule: [] }])
    setForm(BLANK); setShowAdd(false)
  }
  function addSaludEvent() {
    if (!saludForm.titulo.trim() || !saludForm.date) return
    saveEventos([...eventos, {
      id: crypto.randomUUID(), pet_id: selectedPet.id,
      tipo: saludForm.tipo, titulo: saludForm.titulo.trim(),
      start_time: new Date(saludForm.date + 'T09:00:00').toISOString(),
      all_day: true,
      metadata: { notes: saludForm.notes.trim() || null, interval_days: saludForm.interval_days && Number(saludForm.interval_days) > 0 ? Number(saludForm.interval_days) : null, duration_minutes: null },
      created_at: new Date().toISOString(),
    }])
    setSaludForm(BLANK_SAL); setShowSaludForm(false)
  }
  function markSaludDone(ev) {
    const rest = eventos.filter(e => e.id !== ev.id)
    if (ev.metadata?.interval_days) {
      const next = new Date(); next.setDate(next.getDate() + Number(ev.metadata.interval_days))
      saveEventos([...rest, { ...ev, id: crypto.randomUUID(), start_time: new Date(next.toISOString().slice(0, 10) + 'T09:00:00').toISOString(), created_at: new Date().toISOString() }])
    } else {
      saveEventos(rest)
    }
  }
  function registerWalk() {
    saveEventos([...eventos, { id: crypto.randomUUID(), pet_id: selectedPet.id, tipo: 'walk', titulo: 'Paseo', start_time: new Date().toISOString(), all_day: false, metadata: { duration_minutes: walkForm.duration ? Number(walkForm.duration) : null, notes: walkForm.notes.trim() || null, interval_days: null }, created_at: new Date().toISOString() }])
    setWalkForm({ duration: '', notes: '' }); setShowWalkForm(false)
  }
  function addMantTask() {
    if (!mantForm.titulo.trim() || !mantForm.date) return
    saveEventos([...eventos, { id: crypto.randomUUID(), pet_id: selectedPet.id, tipo: 'cage_maintenance', titulo: mantForm.titulo.trim(), start_time: new Date(mantForm.date + 'T09:00:00').toISOString(), all_day: true, metadata: { interval_days: mantForm.interval_days && Number(mantForm.interval_days) > 0 ? Number(mantForm.interval_days) : null, products: mantForm.products.trim() || null, duration_minutes: null, notes: null }, created_at: new Date().toISOString() }])
    setMantForm(BLANK_MANT); setShowMantForm(false)
  }
  function markMantDone(ev) {
    const rest = eventos.filter(e => e.id !== ev.id)
    if (ev.metadata?.interval_days) {
      const next = new Date(); next.setDate(next.getDate() + Number(ev.metadata.interval_days))
      saveEventos([...rest, { ...ev, id: crypto.randomUUID(), start_time: new Date(next.toISOString().slice(0, 10) + 'T09:00:00').toISOString(), created_at: new Date().toISOString() }])
    } else {
      saveEventos(rest)
    }
  }
  function addCalReminder() {
    if (!calForm?.date) return
    const events = demoRead(appType, 'events') ?? []
    demoWrite(appType, 'events', [...events, { id: crypto.randomUUID(), app_id: `demo-${appType}`, event_type: 'reminder', title: calForm.titulo, color: '#a855f7', all_day: true, start_time: new Date(calForm.date + 'T09:00:00').toISOString(), end_time: new Date(calForm.date + 'T10:00:00').toISOString(), recurrence: null, metadata: { tipo: 'veterinario', pet_id: selectedPet.id }, created_at: new Date().toISOString() }])
    setCalForm(null)
  }

  // ── LIST VIEW ────────────────────────────────────────────────────
  if (!selectedPet) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: 640 }}>
        <h2 style={{ margin: '0 0 1.25rem' }}>Mascotas</h2>
        {mascotas.map(m => {
          const icon = m.icono || ESPECIE_ICON[m.especie] || '🐾'
          const hasUrgent = (m.vacunas ?? []).some(v => { const d = diasHasta(v.proxima); return d !== null && d < 30 })
          return (
            <div key={m.id} onClick={() => { setSelectedId(m.id); setActiveTab('ficha') }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'border-color .15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <span style={{ fontSize: '2.5rem', flexShrink: 0 }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{m.nombre}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{m.raza} · {m.edad_anios} {m.edad_anios === 1 ? 'año' : 'años'}</div>
                {hasUrgent && <div style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: 2 }}>⚠ Vacuna próxima</div>}
              </div>
              <span style={{ color: 'var(--text-faint)', fontSize: 18 }}>›</span>
            </div>
          )
        })}
        {mascotas.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin mascotas.</p>}
        {!showAdd ? (
          <button onClick={() => setShowAdd(true)} style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>+ Añadir mascota</button>
        ) : (
          <form onSubmit={handleAddPet} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2.5rem 1fr 1fr', gap: '0.5rem' }}>
              <input value={form.icono} onChange={e => setForm(f => ({ ...f, icono: e.target.value }))} maxLength={2} style={{ ...inp, textAlign: 'center', fontSize: '1.2rem', padding: '0.5rem' }} />
              <input placeholder="Nombre *" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required style={inp} autoFocus />
              <select value={form.especie} onChange={e => setForm(f => ({ ...f, especie: e.target.value }))} style={inp}>
                <option value="perro">🐕 Perro</option><option value="gato">🐈 Gato</option><option value="conejo">🐇 Conejo</option><option value="otro">🐾 Otro</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 4rem', gap: '0.5rem' }}>
              <input placeholder="Raza" value={form.raza} onChange={e => setForm(f => ({ ...f, raza: e.target.value }))} style={inp} />
              <input type="number" min="0" placeholder="Edad" value={form.edad_anios} onChange={e => setForm(f => ({ ...f, edad_anios: e.target.value }))} style={inp} />
            </div>
            <input placeholder="Notas" value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} style={inp} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Añadir</button>
              <button type="button" onClick={() => { setShowAdd(false); setForm(BLANK) }} style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    )
  }

  // ── DETAIL VIEW ──────────────────────────────────────────────────
  const pet  = selectedPet
  const icon = pet.icono || ESPECIE_ICON[pet.especie] || '🐾'

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem 0' }}>
        <button onClick={() => setSelectedId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 22, padding: '0 4px', flexShrink: 0 }}>‹</button>
        <span style={{ fontSize: '2rem', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>{pet.nombre}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pet.raza} · {pet.edad_anios} años</div>
        </div>
        <button onClick={() => { saveMascotas(mascotas.filter(m => m.id !== pet.id)); setSelectedId(null) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: 16 }}>🗑</button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', padding: '0 1.5rem', borderBottom: '1px solid var(--border)', overflowX: 'auto', marginTop: '0.5rem' }}>
        {tabs.map(([val, label]) => <TabBtn key={val} label={label} active={activeTab === val} onClick={() => setActiveTab(val)} />)}
      </div>

      <div style={{ padding: '1.25rem 1.5rem' }}>

        {/* FICHA */}
        {activeTab === 'ficha' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Veterinario</div>
              {pet.veterinario?.nombre ? (
                <div style={{ fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 600 }}>{pet.veterinario.nombre}</span>
                  {pet.veterinario.telefono && <span style={{ color: 'var(--text-muted)', marginLeft: '0.75rem' }}>📞 {pet.veterinario.telefono}</span>}
                  {pet.veterinario.direccion && <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginTop: 2 }}>📍 {pet.veterinario.direccion}</div>}
                </div>
              ) : <span style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>Sin veterinario.</span>}
              {!calForm ? (
                <button onClick={() => setCalForm({ titulo: `Cita veterinario — ${pet.nombre}`, date: '' })}
                  style={{ marginTop: '0.5rem', padding: '5px 10px', background: 'none', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>📅 Pedir cita</button>
              ) : (
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input value={calForm.titulo} onChange={e => setCalForm(f => ({ ...f, titulo: e.target.value }))} style={{ ...inp, flex: 1, minWidth: 160 }} />
                  <input type="date" value={calForm.date} onChange={e => setCalForm(f => ({ ...f, date: e.target.value }))} style={{ ...inp, width: 'auto' }} />
                  <button onClick={addCalReminder} disabled={!calForm.date} style={{ padding: '8px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: calForm.date ? 1 : 0.4 }}>Añadir al calendario</button>
                  <button onClick={() => setCalForm(null)} style={{ padding: '8px 10px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Vacunas</div>
              {(pet.vacunas ?? []).length === 0 ? <span style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>Sin vacunas registradas.</span> : (pet.vacunas ?? []).map(vac => {
                const sem = semVac(diasHasta(vac.proxima))
                return (
                  <div key={vac.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 500 }}>{vac.nombre}</span>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Última: {vac.fecha_ultima}</span>
                      <span style={{ color: sem.color, fontWeight: 600 }}>Próxima: {sem.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            {pet.notas && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem' }}>📝 {pet.notas}</div>}
          </div>
        )}

        {/* ALIMENTACIÓN */}
        {activeTab === 'alimentacion' && <AlimentacionTab pet={pet} onUpdatePet={(patch) => updatePet(pet.id, patch)} />}

        {/* SALUD */}
        {activeTab === 'salud' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>🩺 Eventos de salud</div>
                {saludEvs.some(e => fmtSaludDue(e.start_time).overdue) && <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>{saludEvs.filter(e => fmtSaludDue(e.start_time).overdue).length} vencido(s)</div>}
              </div>
              <button onClick={() => setShowSaludForm(f => !f)} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Nuevo</button>
            </div>
            {showSaludForm && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input value={saludForm.titulo} onChange={e => setSaludForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Título *" autoFocus style={inp} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select value={saludForm.tipo} onChange={e => setSaludForm(f => ({ ...f, tipo: e.target.value }))} style={{ ...inp, flex: 1 }}>
                      {Object.entries(SALUD_TIPOS).map(([v, { label, icon }]) => <option key={v} value={v}>{icon} {label}</option>)}
                    </select>
                    <input type="date" value={saludForm.date} onChange={e => setSaludForm(f => ({ ...f, date: e.target.value }))} style={{ ...inp, flex: 1 }} />
                  </div>
                  <input value={saludForm.notes} onChange={e => setSaludForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notas" style={inp} />
                  {saludForm.tipo === 'medication' && <input type="number" min="1" value={saludForm.interval_days} onChange={e => setSaludForm(f => ({ ...f, interval_days: e.target.value }))} placeholder="Repetir cada (días)" style={inp} />}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowSaludForm(false)} style={{ padding: '6px 12px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
                    <button onClick={addSaludEvent} disabled={!saludForm.titulo.trim() || !saludForm.date} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: (saludForm.titulo.trim() && saludForm.date) ? 1 : 0.4 }}>Crear</button>
                  </div>
                </div>
              </div>
            )}
            {saludEvs.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Sin eventos de salud.</p>
            ) : saludEvs.map(ev => {
              const { label: dueLabel, overdue } = fmtSaludDue(ev.start_time)
              const tipo = SALUD_TIPOS[ev.tipo] ?? { label: ev.tipo, icon: '📋' }
              return (
                <div key={ev.id} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${overdue ? 'rgba(239,68,68,.4)' : 'var(--border)'}`, background: 'var(--bg-card)' }}
                  onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-sal'); if (b) b.style.opacity = '1' }}
                  onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-sal'); if (b) b.style.opacity = '0' }}
                >
                  <button onClick={() => markSaludDone(ev)} title="Marcar como hecho"
                    style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${overdue ? '#ef4444' : 'var(--border)'}`, background: 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.innerHTML = '✓' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = overdue ? '#ef4444' : 'var(--border)'; e.currentTarget.innerHTML = '' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{tipo.icon} {ev.titulo}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap', fontSize: 11, color: overdue ? '#ef4444' : 'var(--text-muted)' }}>
                      <span>{dueLabel}</span>
                      <span style={{ color: 'var(--text-faint)' }}>{tipo.label}</span>
                      {ev.metadata?.interval_days && <span style={{ color: 'var(--text-faint)' }}>↻ cada {ev.metadata.interval_days}d</span>}
                      {ev.metadata?.notes && <span style={{ color: 'var(--text-faint)' }}>{ev.metadata.notes}</span>}
                    </div>
                  </div>
                  <button className="del-sal" onClick={() => saveEventos(eventos.filter(e => e.id !== ev.id))}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 17, padding: '0 4px', opacity: 0, transition: 'opacity .15s', alignSelf: 'center' }}>×</button>
                </div>
              )
            })}
          </div>
        )}

        {/* PASEOS (perro) */}
        {activeTab === 'paseos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>🦮 Paseos (últimos 7 días)</div>
                {todayPaseos.length > 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hoy: {todayPaseos.length} paseo{todayPaseos.length !== 1 ? 's' : ''}{todayMins > 0 ? ` · ${todayMins} min` : ''}</div>}
              </div>
              <button onClick={() => setShowWalkForm(f => !f)} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>🦮 Registrar</button>
            </div>
            {showWalkForm && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input type="number" min="1" value={walkForm.duration} onChange={e => setWalkForm(f => ({ ...f, duration: e.target.value }))} placeholder="Duración (minutos, opcional)" autoFocus style={inp} />
                  <input value={walkForm.notes} onChange={e => setWalkForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notas (ruta, incidencias...)" style={inp} />
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowWalkForm(false)} style={{ padding: '6px 12px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
                    <button onClick={registerWalk} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Registrar</button>
                  </div>
                </div>
              </div>
            )}
            {paseos.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Sin paseos esta semana.</p>
            ) : paseos.map(p => (
              <div key={p.id} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                <span style={{ fontSize: 20 }}>🦮</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Paseo</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtWalkTime(p.start_time)}{p.metadata?.duration_minutes ? ` · ${p.metadata.duration_minutes} min` : ''}</div>
                  {p.metadata?.notes && <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{p.metadata.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MANTENIMIENTO JAULA (no-perro) */}
        {activeTab === 'mantenimiento' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>🏠 Mantenimiento</div>
              <button onClick={() => setShowMantForm(f => !f)} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Tarea</button>
            </div>
            {showMantForm && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input value={mantForm.titulo} onChange={e => setMantForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Nombre de la tarea *" autoFocus style={inp} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="date" value={mantForm.date} onChange={e => setMantForm(f => ({ ...f, date: e.target.value }))} style={{ ...inp, flex: 1 }} />
                    <input type="number" min="1" value={mantForm.interval_days} onChange={e => setMantForm(f => ({ ...f, interval_days: e.target.value }))} placeholder="Repetir cada (días)" style={{ ...inp, flex: 1 }} />
                  </div>
                  <input value={mantForm.products} onChange={e => setMantForm(f => ({ ...f, products: e.target.value }))} placeholder="Productos necesarios" style={inp} />
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowMantForm(false)} style={{ padding: '6px 12px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
                    <button onClick={addMantTask} disabled={!mantForm.titulo.trim() || !mantForm.date} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: (mantForm.titulo.trim() && mantForm.date) ? 1 : 0.4 }}>Crear</button>
                  </div>
                </div>
              </div>
            )}
            {mantTasks.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Sin tareas de mantenimiento.</p>
            ) : mantTasks.map(task => {
              const { label: dueLabel, overdue } = fmtSaludDue(task.start_time)
              return (
                <div key={task.id} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${overdue ? 'rgba(239,68,68,.4)' : 'var(--border)'}`, background: 'var(--bg-card)' }}
                  onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-mant'); if (b) b.style.opacity = '1' }}
                  onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-mant'); if (b) b.style.opacity = '0' }}
                >
                  <button onClick={() => markMantDone(task)} title="Marcar como hecha"
                    style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${overdue ? '#ef4444' : 'var(--border)'}`, background: 'transparent', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = overdue ? '#ef4444' : 'var(--border)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{task.titulo}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap', fontSize: 11, color: overdue ? '#ef4444' : 'var(--text-muted)' }}>
                      <span>{dueLabel}</span>
                      {task.metadata?.interval_days && <span style={{ color: 'var(--text-faint)' }}>↻ cada {task.metadata.interval_days}d</span>}
                      {task.metadata?.products && <span style={{ color: 'var(--text-faint)' }}>🧴 {task.metadata.products}</span>}
                    </div>
                  </div>
                  <button className="del-mant" onClick={() => saveEventos(eventos.filter(e => e.id !== task.id))}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 17, padding: '0 4px', opacity: 0, transition: 'opacity .15s', alignSelf: 'center' }}>×</button>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
```

- [ ] **Step 4: Confirmar que los tests pasan**

```bash
cd /home/user/mi-portfolio-proyectos && npm test -- --testPathPattern="personal/.*Mascotas" --watchAll=false 2>&1 | tail -20
```
Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/user/mi-portfolio-proyectos && git add src/pages/app/modules/personal/Mascotas.jsx src/pages/app/modules/personal/__tests__/Mascotas.test.jsx && git commit -m "feat(personal): rewrite Mascotas with tabs (Ficha|Alimentación|Salud|Paseos) + calendar reminder"
```

---

## Task 3: Reescribir Personal/Vehiculos.jsx

**Files:**
- Modify: `src/pages/app/modules/personal/Vehiculos.jsx`
- Modify: `src/pages/app/modules/personal/__tests__/Vehiculos.test.jsx`

- [ ] **Step 1: Escribir test que falla**

Reemplazar `src/pages/app/modules/personal/__tests__/Vehiculos.test.jsx` con:

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Vehiculos from '../Vehiculos'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'personal' } }) }))

const today = new Date()
const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) }
const subDays = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }

const MOCK_VEHICULOS = [{
  id: 'veh-1', marca: 'Volkswagen', modelo: 'Golf', anio: 2018, matricula: '1234 ABC', color: 'Gris',
  itv_ultima: '2022-11-15', itv_proxima: addDays(180),
  seguro_compania: 'Mapfre', seguro_vencimiento: addDays(20),
  taller: 'Taller García', incidencias: [],
}]
const MOCK_MANT = [{
  id: 'mant-1', vehicle_id: 'veh-1', type: 'aceite', date: subDays(180),
  km: 45000, description: 'Cambio aceite', cost: 85,
  next_km: 50000, next_date: addDays(90), created_at: today.toISOString(),
}]

vi.mock('../../../../../data/demo', () => ({
  demoRead: (_appType, key) => {
    if (key === 'vehiculos') return MOCK_VEHICULOS
    if (key === 'vehiculos_mantenimiento') return MOCK_MANT
    return []
  },
  demoWrite: vi.fn(),
}))

describe('Vehiculos', () => {
  it('renders vehicle brand and model in list', () => {
    render(<Vehiculos />)
    expect(screen.getByText(/Volkswagen/)).toBeInTheDocument()
    expect(screen.getByText(/Golf/)).toBeInTheDocument()
  })

  it('shows matricula in list', () => {
    render(<Vehiculos />)
    expect(screen.getByText('1234 ABC')).toBeInTheDocument()
  })

  it('shows ITV label in list', () => {
    render(<Vehiculos />)
    expect(screen.getByText(/ITV/i)).toBeInTheDocument()
  })

  it('shows red semaphore for insurance expiring in 20 days', () => {
    render(<Vehiculos />)
    expect(screen.getByText(/Seguro.*20 d|20 d.*Seguro/i)).toBeInTheDocument()
  })

  it('shows Mantenimiento tab in detail view', () => {
    render(<Vehiculos />)
    fireEvent.click(screen.getByText(/Volkswagen/))
    expect(screen.getByText('Mantenimiento')).toBeInTheDocument()
  })

  it('shows maintenance log after clicking Mantenimiento tab', () => {
    render(<Vehiculos />)
    fireEvent.click(screen.getByText(/Volkswagen/))
    fireEvent.click(screen.getByText('Mantenimiento'))
    expect(screen.getByText(/aceite/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Confirmar que el test falla**

```bash
cd /home/user/mi-portfolio-proyectos && npm test -- --testPathPattern="personal/.*Vehiculos" --watchAll=false 2>&1 | tail -20
```
Expected: FAIL (los tests de detail/tab fallan porque el componente actual no tiene navegación lista/detalle)

- [ ] **Step 3: Reescribir Vehiculos.jsx completo**

Reemplazar `src/pages/app/modules/personal/Vehiculos.jsx` con:

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const MANT_TYPES = ['ITV', 'aceite', 'ruedas', 'frenos', 'bateria', 'filtro', 'correa', 'otro']
const MANT_ICONS = { ITV: '📋', aceite: '🛢️', ruedas: '🔄', frenos: '⚙️', bateria: '🔋', filtro: '🌀', correa: '⛓️', otro: '🔧' }
const BLANK_VEH  = { marca: '', modelo: '', anio: new Date().getFullYear(), matricula: '', color: '', itv_proxima: '', seguro_compania: '', seguro_vencimiento: '', taller: '' }
const BLANK_MANT = { type: 'aceite', date: new Date().toISOString().slice(0, 10), km: '', description: '', cost: '', next_km: '', next_date: '' }

function diasHasta(f) {
  if (!f) return null
  return Math.ceil((new Date(f + 'T12:00:00') - new Date(new Date().toDateString())) / 86400000)
}
function semaforo(dias, label) {
  if (dias === null) return { color: 'var(--text-faint)', text: `${label}: —` }
  if (dias < 0)  return { color: '#ef4444', text: `${label}: vencido` }
  if (dias < 30) return { color: '#ef4444', text: `${label}: ${dias} días` }
  if (dias < 90) return { color: '#f59e0b', text: `${label}: ${dias} días` }
  return { color: '#22c55e', text: `${label}: ${dias} días` }
}
const inp = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }
function TabBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '8px 14px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: active ? 700 : 500, color: active ? 'var(--accent)' : 'var(--text-muted)', background: 'none', border: 'none', borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer' }}>{label}</button>
  )
}

export default function Vehiculos() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'personal'

  const [vehiculos, setVehiculos]         = useState(() => demoRead(appType, 'vehiculos') ?? [])
  const [mantenimiento, setMantenimiento] = useState(() => demoRead(appType, 'vehiculos_mantenimiento') ?? [])
  const [selectedId, setSelectedId]       = useState(null)
  const [activeTab, setActiveTab]         = useState('ficha')

  const [showAdd, setShowAdd]         = useState(false)
  const [form, setForm]               = useState(BLANK_VEH)
  const [showMantForm, setShowMantForm] = useState(false)
  const [mantForm, setMantForm]       = useState(BLANK_MANT)
  const [incForms, setIncForms]       = useState({})
  const [mantCalLog, setMantCalLog]   = useState(null)
  const [mantCalDate, setMantCalDate] = useState('')

  const saveVehiculos     = (next) => { setVehiculos(next);     demoWrite(appType, 'vehiculos', next) }
  const saveMantenimiento = (next) => { setMantenimiento(next); demoWrite(appType, 'vehiculos_mantenimiento', next) }

  const selectedVeh = vehiculos.find(v => v.id === selectedId) ?? null
  const vehMant     = selectedVeh ? mantenimiento.filter(m => m.vehicle_id === selectedVeh.id).sort((a, b) => b.date.localeCompare(a.date)) : []
  const upcoming    = vehMant.filter(m => { const d = diasHasta(m.next_date); return d !== null && d <= 30 && d >= 0 })

  function handleAddVehicle(e) {
    e.preventDefault()
    if (!form.marca.trim() || !form.matricula.trim()) return
    saveVehiculos([...vehiculos, { ...form, id: crypto.randomUUID(), anio: Number(form.anio), incidencias: [] }])
    setForm(BLANK_VEH); setShowAdd(false)
  }
  function addIncidencia(vehId) {
    const desc = (incForms[vehId] ?? '').trim()
    if (!desc) return
    saveVehiculos(vehiculos.map(v => v.id === vehId ? { ...v, incidencias: [...(v.incidencias ?? []), { id: crypto.randomUUID(), fecha: new Date().toISOString().slice(0, 10), descripcion: desc }] } : v))
    setIncForms(f => ({ ...f, [vehId]: '' }))
  }
  function addMantLog() {
    if (!mantForm.type || !mantForm.date) return
    saveMantenimiento([{ id: crypto.randomUUID(), vehicle_id: selectedVeh.id, type: mantForm.type, date: mantForm.date, km: mantForm.km ? Number(mantForm.km) : null, description: mantForm.description.trim() || null, cost: mantForm.cost ? Number(mantForm.cost) : null, next_km: mantForm.next_km ? Number(mantForm.next_km) : null, next_date: mantForm.next_date || null, created_at: new Date().toISOString() }, ...mantenimiento])
    setMantForm(BLANK_MANT); setShowMantForm(false)
  }
  function addMantCalReminder() {
    if (!mantCalLog || !mantCalDate) return
    const events = demoRead(appType, 'events') ?? []
    demoWrite(appType, 'events', [...events, { id: crypto.randomUUID(), app_id: `demo-${appType}`, event_type: 'reminder', title: `Revisión ${mantCalLog.type} — ${selectedVeh.marca} ${selectedVeh.modelo}`, color: '#f59e0b', all_day: true, start_time: new Date(mantCalDate + 'T09:00:00').toISOString(), end_time: new Date(mantCalDate + 'T10:00:00').toISOString(), recurrence: null, metadata: { tipo: 'mantenimiento_vehiculo', vehicle_id: selectedVeh.id }, created_at: new Date().toISOString() }])
    setMantCalLog(null); setMantCalDate('')
  }

  // ── LIST VIEW ────────────────────────────────────────────────────
  if (!selectedVeh) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: 640 }}>
        <h2 style={{ margin: '0 0 1.25rem' }}>Vehículos</h2>
        {vehiculos.map(v => {
          const itv = semaforo(diasHasta(v.itv_proxima), 'ITV')
          const seg = semaforo(diasHasta(v.seguro_vencimiento), 'Seguro')
          return (
            <div key={v.id} onClick={() => { setSelectedId(v.id); setActiveTab('ficha') }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'border-color .15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <span style={{ fontSize: '2rem', flexShrink: 0 }}>🚗</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{v.marca} {v.modelo} <span style={{ color: 'var(--text-faint)', fontWeight: 400, fontSize: '0.9rem' }}>({v.anio})</span></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}><span>{v.matricula}</span> · <span>{v.color}</span></div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                  <span style={{ color: itv.color, fontWeight: 600 }}>{itv.text}</span>
                  <span style={{ color: seg.color, fontWeight: 600 }}>{seg.text}</span>
                </div>
              </div>
              <span style={{ color: 'var(--text-faint)', fontSize: 18 }}>›</span>
            </div>
          )
        })}
        {vehiculos.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin vehículos registrados.</p>}
        {!showAdd ? (
          <button onClick={() => setShowAdd(true)} style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>+ Añadir vehículo</button>
        ) : (
          <form onSubmit={handleAddVehicle} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 5rem', gap: '0.5rem' }}>
              <input placeholder="Marca *" value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))} required style={inp} autoFocus />
              <input placeholder="Modelo" value={form.modelo} onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))} style={inp} />
              <input type="number" placeholder="Año" value={form.anio} onChange={e => setForm(f => ({ ...f, anio: e.target.value }))} style={inp} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input placeholder="Matrícula *" value={form.matricula} onChange={e => setForm(f => ({ ...f, matricula: e.target.value }))} required style={inp} />
              <input placeholder="Color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={inp} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>ITV próxima</label><input type="date" value={form.itv_proxima} onChange={e => setForm(f => ({ ...f, itv_proxima: e.target.value }))} style={inp} /></div>
              <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Seguro vencimiento</label><input type="date" value={form.seguro_vencimiento} onChange={e => setForm(f => ({ ...f, seguro_vencimiento: e.target.value }))} style={inp} /></div>
            </div>
            <input placeholder="Compañía seguro" value={form.seguro_compania} onChange={e => setForm(f => ({ ...f, seguro_compania: e.target.value }))} style={inp} />
            <input placeholder="Taller de confianza" value={form.taller} onChange={e => setForm(f => ({ ...f, taller: e.target.value }))} style={inp} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Añadir</button>
              <button type="button" onClick={() => { setShowAdd(false); setForm(BLANK_VEH) }} style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    )
  }

  // ── DETAIL VIEW ──────────────────────────────────────────────────
  const v   = selectedVeh
  const itv = semaforo(diasHasta(v.itv_proxima), 'ITV')
  const seg = semaforo(diasHasta(v.seguro_vencimiento), 'Seguro')

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem 0' }}>
        <button onClick={() => setSelectedId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 22, padding: '0 4px' }}>‹</button>
        <span style={{ fontSize: '2rem' }}>🚗</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{v.marca} {v.modelo} <span style={{ color: 'var(--text-faint)', fontWeight: 400, fontSize: '0.9rem' }}>({v.anio})</span></div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><span>{v.matricula}</span> · <span>{v.color}</span></div>
        </div>
        <button onClick={() => { saveVehiculos(vehiculos.filter(x => x.id !== v.id)); setSelectedId(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: 16 }}>🗑</button>
      </div>
      <div style={{ display: 'flex', padding: '0 1.5rem', borderBottom: '1px solid var(--border)', marginTop: '0.5rem' }}>
        <TabBtn label="Ficha" active={activeTab === 'ficha'} onClick={() => setActiveTab('ficha')} />
        <TabBtn label="Mantenimiento" active={activeTab === 'mantenimiento'} onClick={() => setActiveTab('mantenimiento')} />
      </div>

      <div style={{ padding: '1.25rem 1.5rem' }}>

        {/* FICHA */}
        {activeTab === 'ficha' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Estado</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ color: itv.color, fontWeight: 600, fontSize: '0.85rem' }}>{itv.text}</span>
                  <span style={{ color: seg.color, fontWeight: 600, fontSize: '0.85rem' }}>{seg.text}</span>
                </div>
              </div>
              {v.seguro_compania && <div><div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Seguro</div><div style={{ fontSize: '0.85rem' }}>{v.seguro_compania}</div></div>}
              {v.taller && <div><div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Taller</div><div style={{ fontSize: '0.85rem' }}>🔧 {v.taller}</div></div>}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Incidencias</div>
              {(v.incidencias ?? []).map(inc => <div key={inc.id} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}><span style={{ color: 'var(--text-faint)', marginRight: '0.5rem' }}>{inc.fecha}</span>{inc.descripcion}</div>)}
              {(v.incidencias ?? []).length === 0 && <div style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>Sin incidencias.</div>}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <input placeholder="Nueva incidencia…" value={incForms[v.id] ?? ''} onChange={e => setIncForms(f => ({ ...f, [v.id]: e.target.value }))} style={{ ...inp, flex: 1 }} />
                <button onClick={() => addIncidencia(v.id)} style={{ padding: '0.5rem 0.75rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap', fontSize: 13 }}>+ Añadir</button>
              </div>
            </div>
          </div>
        )}

        {/* MANTENIMIENTO */}
        {activeTab === 'mantenimiento' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {upcoming.length > 0 && (
              <div style={{ background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.4)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 6 }}>⏰ Próximas revisiones</div>
                {upcoming.map(m => { const d = diasHasta(m.next_date); return <div key={m.id} style={{ fontSize: 12, color: 'var(--text-muted)' }}>{MANT_ICONS[m.type]} {m.type} — {d === 0 ? 'hoy' : `en ${d} días`}</div> })}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{vehMant.length} registro{vehMant.length !== 1 ? 's' : ''}</div>
              <button onClick={() => setShowMantForm(f => !f)} style={{ padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Mantenimiento</button>
            </div>
            {showMantForm && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select value={mantForm.type} onChange={e => setMantForm(f => ({ ...f, type: e.target.value }))} style={{ ...inp, flex: 1 }}>{MANT_TYPES.map(t => <option key={t} value={t}>{MANT_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}</select>
                    <input type="date" value={mantForm.date} onChange={e => setMantForm(f => ({ ...f, date: e.target.value }))} style={{ ...inp, flex: 1 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" min="0" value={mantForm.km} onChange={e => setMantForm(f => ({ ...f, km: e.target.value }))} placeholder="Km actuales" style={{ ...inp, flex: 1 }} />
                    <input type="number" min="0" step="0.01" value={mantForm.cost} onChange={e => setMantForm(f => ({ ...f, cost: e.target.value }))} placeholder="Coste (€)" style={{ ...inp, flex: 1 }} />
                  </div>
                  <input value={mantForm.description} onChange={e => setMantForm(f => ({ ...f, description: e.target.value }))} placeholder="Descripción" style={inp} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" min="0" value={mantForm.next_km} onChange={e => setMantForm(f => ({ ...f, next_km: e.target.value }))} placeholder="Próx. revisión (km)" style={{ ...inp, flex: 1 }} />
                    <input type="date" value={mantForm.next_date} onChange={e => setMantForm(f => ({ ...f, next_date: e.target.value }))} style={{ ...inp, flex: 1 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowMantForm(false)} style={{ padding: '7px 14px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
                    <button onClick={addMantLog} style={{ padding: '7px 14px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Guardar</button>
                  </div>
                </div>
              </div>
            )}
            {mantCalLog && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--accent)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📅 Recordatorio: {mantCalLog.type} — {v.marca} {v.modelo}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="date" value={mantCalDate} onChange={e => setMantCalDate(e.target.value)} style={{ ...inp, flex: 1 }} />
                  <button onClick={addMantCalReminder} disabled={!mantCalDate} style={{ padding: '8px 12px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: mantCalDate ? 1 : 0.4 }}>Añadir</button>
                  <button onClick={() => { setMantCalLog(null); setMantCalDate('') }} style={{ padding: '8px 10px', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              </div>
            )}
            {vehMant.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🔧</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Sin registros</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Registra el primer mantenimiento</div>
              </div>
            ) : vehMant.map(log => {
              const nextDays = diasHasta(log.next_date)
              const isNear   = nextDays !== null && nextDays <= 30 && nextDays >= 0
              return (
                <div key={log.id} style={{ padding: '12px 16px', borderRadius: 12, border: `1px solid ${isNear ? 'rgba(245,158,11,.5)' : 'var(--border)'}`, background: isNear ? 'rgba(245,158,11,.05)' : 'var(--bg-card)' }}
                  onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-log'); if (b) b.style.opacity = '1' }}
                  onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-log'); if (b) b.style.opacity = '0' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{MANT_ICONS[log.type]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{log.type.charAt(0).toUpperCase() + log.type.slice(1)}</span>
                        {log.cost != null && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{Number(log.cost).toFixed(2)} €</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                        {new Date(log.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}{log.km ? ` · ${log.km.toLocaleString()} km` : ''}
                      </div>
                      {log.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{log.description}</div>}
                      {log.next_date && (
                        <div style={{ fontSize: 11, color: isNear ? '#f59e0b' : 'var(--text-faint)', marginTop: 4 }}>
                          Próx.: {new Date(log.next_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {nextDays !== null && ` (${nextDays === 0 ? 'hoy' : nextDays < 0 ? `hace ${Math.abs(nextDays)}d` : `en ${nextDays}d`})`}
                        </div>
                      )}
                      <button onClick={() => { setMantCalLog(log); setMantCalDate(log.next_date || new Date().toISOString().slice(0, 10)) }}
                        style={{ marginTop: 6, padding: '3px 8px', background: 'none', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11 }}>📅 Recordatorio</button>
                    </div>
                    <button className="del-log" onClick={() => saveMantenimiento(mantenimiento.filter(m => m.id !== log.id))}
                      style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}>×</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Confirmar que los tests pasan**

```bash
cd /home/user/mi-portfolio-proyectos && npm test -- --testPathPattern="personal/.*Vehiculos" --watchAll=false 2>&1 | tail -20
```
Expected: 6 tests PASS

- [ ] **Step 5: Commit**

```bash
cd /home/user/mi-portfolio-proyectos && git add src/pages/app/modules/personal/Vehiculos.jsx src/pages/app/modules/personal/__tests__/Vehiculos.test.jsx && git commit -m "feat(personal): rewrite Vehiculos with Mantenimiento tab + calendar reminder"
```

---

## Task 4: Cleanup — Eliminar apps standalone mascotas y vehículo

**Files:**
- Modify: `src/data/demo/index.js`
- Modify: `src/pages/app/DemoAppLayout.jsx`
- Modify: `src/App.jsx`
- Modify: `src/pages/DemoHome.jsx`

- [ ] **Step 1: Limpiar index.js**

En `src/data/demo/index.js`, eliminar las líneas de import y las entradas en MOCK_BY_APP:

Reemplazar:
```js
import { mockFinanzas }  from './finanzas.js'
import { mockVehiculo }  from './vehiculo.js'
import { mockHogar }     from './hogar.js'
import { mockPersonal }  from './personal.js'
import { mockMascotas }  from './mascotas.js'

const MOCK_BY_APP = {
  finanzas: mockFinanzas,
  vehiculo:  mockVehiculo,
  hogar:     mockHogar,
  personal:  mockPersonal,
  mascotas:  mockMascotas,
}
```
Con:
```js
import { mockFinanzas } from './finanzas.js'
import { mockHogar }    from './hogar.js'
import { mockPersonal } from './personal.js'

const MOCK_BY_APP = {
  finanzas: mockFinanzas,
  hogar:    mockHogar,
  personal: mockPersonal,
}
```

- [ ] **Step 2: Limpiar DemoAppLayout.jsx**

En `src/pages/app/DemoAppLayout.jsx`:

Eliminar de APP_META:
```js
  mascotas: { name: 'Mascotas', icon: '🐾' },
  vehiculo: { name: 'Vehículo', icon: '🚗' },
```

Eliminar las constantes (buscar y eliminar las líneas):
```js
const MASCOTAS_MODULES = [{ path: 'mis-mascotas', label: 'Mis Mascotas', icon: '🐾' }]
const VEHICULO_MODULES = [{ path: 'mis-vehiculos', label: 'Mis Vehículos', icon: '🚗' }]
```

Eliminar de MODULE_MAP:
```js
  mascotas: MASCOTAS_MODULES,
  vehiculo: VEHICULO_MODULES,
```

- [ ] **Step 3: Limpiar App.jsx**

En `src/App.jsx`:

Eliminar los lazy imports (líneas 44-48 y 61-66 aproximadamente):
```js
const MisMascotas          = React.lazy(() => import('./pages/app/modules/mascotas/MisMascotas'))
const PetDetail            = React.lazy(() => import('./pages/app/modules/mascotas/PetDetail'))
const MascotasAlimentacion = React.lazy(() => import('./pages/app/modules/mascotas/Alimentacion'))
const MascotasSalud        = React.lazy(() => import('./pages/app/modules/mascotas/Salud'))
const MascotasRutinas      = React.lazy(() => import('./pages/app/modules/mascotas/Rutinas'))
```
```js
const MisVehiculos       = React.lazy(() => import('./pages/app/modules/vehiculo/MisVehiculos'))
const VehiculoDetail     = React.lazy(() => import('./pages/app/modules/vehiculo/VehiculoDetail'))
const VehiculoRepostajes = React.lazy(() => import('./pages/app/modules/vehiculo/Repostajes'))
const VehiculoMant       = React.lazy(() => import('./pages/app/modules/vehiculo/Mantenimiento'))
const VehiculoGastos     = React.lazy(() => import('./pages/app/modules/vehiculo/VehiculoGastos'))
const VehiculoStats      = React.lazy(() => import('./pages/app/modules/vehiculo/Estadisticas'))
```

Eliminar el bloque de rutas `/app/mascotas` completo (buscar `<Route path="/app/mascotas"` y eliminar el bloque hasta su cierre `</Route>`).

Eliminar el bloque de rutas `/app/vehiculo` completo (buscar `<Route path="/app/vehiculo"` y eliminar el bloque hasta su cierre `</Route>`).

En el bloque `/demo/:appType`, eliminar las rutas de mascotas:
```js
<Route path="mis-mascotas"        element={<MisMascotas />} />
<Route path="mis-mascotas/:petId" element={<PetDetail />}>
  ...
</Route>
```
Y las de vehiculo:
```js
<Route path="mis-vehiculos"             element={<MisVehiculos />} />
<Route path="mis-vehiculos/:vehicleId"  element={<VehiculoDetail />}>
  ...
</Route>
```

- [ ] **Step 4: Limpiar DemoHome.jsx**

Leer el archivo completo (`src/pages/DemoHome.jsx`) y hacer los siguientes cambios:

**a)** Línea 8 — cambiar:
```js
;['hogar', 'personal', 'mascotas', 'vehiculo', 'finanzas'].forEach(initDemoData)
```
Por:
```js
;['hogar', 'personal', 'finanzas'].forEach(initDemoData)
```

**b)** Eliminar las entradas de mascotas y vehiculo del array de apps (líneas 13-14 aproximadamente — buscar `{ type: 'mascotas'` y `{ type: 'vehiculo'`).

**c)** Eliminar los `case 'mascotas':` y `case 'vehiculo':` de cualquier switch/function que los tenga (buscar y eliminar esas secciones completas).

**d)** Eliminar las entradas de mascotas y vehiculo de cualquier array de iconos/colores (líneas 155-156).

**e)** Eliminar los bloques `<Link to="/demo/mascotas"` y `<Link to="/demo/vehiculo"` del JSX (líneas 481-509).

**f)** Eliminar las líneas:
```js
const mascotasEvents = useMemo(() => demoRead('mascotas', 'events'), [])
const pets           = useMemo(() => demoRead('mascotas', 'pets'), [])
const vehicles       = useMemo(() => demoRead('vehiculo', 'vehicles'), [])
const fuelLogs       = useMemo(() => demoRead('vehiculo', 'fuel_logs'), [])
```

**g)** En la lógica de dots del calendario, eliminar:
```js
mascotas: mascotasEvents.some(e => isSameDay(new Date(e.start_time), day)),
vehiculo: fuelLogs.some(l => isSameDay(new Date(l.date + 'T12:00:00'), day)),
```
Y eliminar `mascotasEvents` y `fuelLogs` de las dependencias del useMemo.

**h)** Si hay referencias a `pets` o `vehicles` en el JSX del DemoHome (para mostrar resumen de mascotas/vehículos), eliminarlas también.

- [ ] **Step 5: Verificar build y tests**

```bash
cd /home/user/mi-portfolio-proyectos && npm run build 2>&1 | tail -8
```
Expected: `✓ built in`

```bash
cd /home/user/mi-portfolio-proyectos && npm test -- --watchAll=false 2>&1 | tail -25
```
Si algún test falla por referencias a mascotas/vehiculo standalone, leerlo y corregirlo. El archivo `src/pages/__tests__/DemoHome.test.jsx` puede necesitar actualización si testea las cards de mascotas/vehiculo.

- [ ] **Step 6: Commit**

```bash
cd /home/user/mi-portfolio-proyectos && git add src/data/demo/index.js src/pages/app/DemoAppLayout.jsx src/App.jsx src/pages/DemoHome.jsx && git commit -m "feat: remove standalone mascotas and vehiculo apps; all functionality now in Personal"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Alimentación: stock con +/− + horario de tomas → Task 2 (AlimentacionTab)
- ✅ Salud: eventos con mark-done + reschedule → Task 2 (Salud tab)
- ✅ Paseos perro → Task 2 (Paseos tab)
- ✅ Mantenimiento jaula no-perro → Task 2 (Mantenimiento tab)
- ✅ Recordatorio veterinario al calendario → Task 2 (calForm en Ficha tab)
- ✅ Mantenimiento vehículo con historial y alertas → Task 3 (Mantenimiento tab)
- ✅ Recordatorio mantenimiento al calendario → Task 3 (mantCalLog)
- ✅ Eliminar apps standalone → Task 4

**2. Placeholder scan:** Ninguno encontrado. Todo el código es completo.

**3. Type consistency:**
- `mascotas_eventos[].tipo` usa: `'vaccination' | 'vet_visit' | 'medication' | 'walk' | 'cage_maintenance'` — consistente en personal.js y Mascotas.jsx
- `vehiculos_mantenimiento[].type` usa: `'ITV' | 'aceite' | 'ruedas' | 'frenos' | 'bateria' | 'filtro' | 'correa' | 'otro'` — consistente en personal.js y Vehiculos.jsx
- `onUpdatePet(patch)` en AlimentacionTab → llama a `updatePet(pet.id, patch)` en el parent — consistente
