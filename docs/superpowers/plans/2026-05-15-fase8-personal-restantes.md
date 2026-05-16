# Personal — Módulos Restantes (Deporte, Vehículos, Mascotas, Ropa, Formación) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five new Personal modules (Deporte, Vehículos, Mascotas, Ropa, Formación) with demo data, components, and navigation.

**Architecture:** Same pattern as existing Personal modules — `demoRead(appType, key)` / `demoWrite(appType, key, data)` via sessionStorage. Context from `const { app } = useOutletContext()`, appType = `app?.type ?? 'personal'`. Lazy-loaded routes under `/app/personal` and `/demo/:appType`. Inline styles with H3nky tokens.

**Tech Stack:** React 18, Vite, React Router v6, H3nky tokens (`var(--accent)=#fe7000`, `var(--bg-card)`, `var(--border)`, `var(--text)`, `var(--text-muted)`, `var(--text-faint)`, `var(--font-mono)`)

---

## File Map

| File | Action |
|------|--------|
| `src/data/demo/personal.js` | Add demo keys: deporte, vehiculos, mascotas, ropa, formacion |
| `src/data/demo/index.js` | Bump DEMO_VERSION '10' → '11' |
| `src/data/demo/__tests__/personal.test.js` | Add 5 new test cases |
| `src/pages/app/modules/personal/Deporte.jsx` | Create |
| `src/pages/app/modules/personal/Vehiculos.jsx` | Create |
| `src/pages/app/modules/personal/Mascotas.jsx` | Create |
| `src/pages/app/modules/personal/Ropa.jsx` | Create |
| `src/pages/app/modules/personal/Formacion.jsx` | Create |
| `src/pages/app/DemoAppLayout.jsx` | Add 5 entries to PERSONAL_MODULES |
| `src/App.jsx` | Add 5 lazy imports + 10 routes |

---

## Task 1: Demo Data for 5 New Personal Keys

**Files:**
- Modify: `src/data/demo/personal.js`
- Modify: `src/data/demo/index.js`
- Modify: `src/data/demo/__tests__/personal.test.js`

- [ ] **Step 1: Read `src/data/demo/personal.js`** to understand existing structure (helpers: `fmt`, `hoy`, `addDays`, `subDays`).

- [ ] **Step 2: Read `src/data/demo/__tests__/personal.test.js`** to understand existing test patterns.

- [ ] **Step 3: Add tests first** — append inside the existing describe block:

```js
it('deporte — rutinas shape', () => {
  const data = mockPersonal
  expect(Array.isArray(data.deporte_rutinas)).toBe(true)
  expect(data.deporte_rutinas.length).toBeGreaterThanOrEqual(2)
  const r = data.deporte_rutinas[0]
  expect(r).toHaveProperty('id')
  expect(r).toHaveProperty('nombre')
  expect(Array.isArray(r.ejercicios)).toBe(true)
})

it('vehiculos — shape', () => {
  const data = mockPersonal
  expect(Array.isArray(data.vehiculos)).toBe(true)
  expect(data.vehiculos.length).toBeGreaterThanOrEqual(1)
  const v = data.vehiculos[0]
  expect(v).toHaveProperty('id')
  expect(v).toHaveProperty('marca')
  expect(v).toHaveProperty('matricula')
  expect(v).toHaveProperty('itv_proxima')
})

it('mascotas — shape', () => {
  const data = mockPersonal
  expect(Array.isArray(data.mascotas)).toBe(true)
  expect(data.mascotas.length).toBeGreaterThanOrEqual(1)
  const m = data.mascotas[0]
  expect(m).toHaveProperty('id')
  expect(m).toHaveProperty('nombre')
  expect(m).toHaveProperty('especie')
  expect(Array.isArray(m.vacunas)).toBe(true)
})

it('ropa — prendas shape', () => {
  const data = mockPersonal
  expect(Array.isArray(data.ropa_prendas)).toBe(true)
  expect(data.ropa_prendas.length).toBeGreaterThanOrEqual(3)
  const p = data.ropa_prendas[0]
  expect(p).toHaveProperty('id')
  expect(p).toHaveProperty('nombre')
  expect(p).toHaveProperty('categoria')
  expect(p).toHaveProperty('temporada')
})

it('formacion — cursos shape', () => {
  const data = mockPersonal
  expect(Array.isArray(data.formacion_cursos)).toBe(true)
  expect(data.formacion_cursos.length).toBeGreaterThanOrEqual(2)
  const c = data.formacion_cursos[0]
  expect(c).toHaveProperty('id')
  expect(c).toHaveProperty('titulo')
  expect(c).toHaveProperty('plataforma')
  expect(typeof c.progreso).toBe('number')
})
```

- [ ] **Step 4: Run tests to confirm they fail**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/data/demo/__tests__/personal.test.js 2>&1 | tail -15
```

Expected: FAIL — new keys don't exist yet.

- [ ] **Step 5: Add demo data to `src/data/demo/personal.js`**

Add these keys to `mockPersonal` (use existing `fmt`, `hoy`, `addDays`, `subDays` helpers):

```js
deporte_rutinas: [
  {
    id: 'rut-1', nombre: 'Fuerza — Upper body', dias: ['L', 'X', 'V'],
    ejercicios: [
      { id: 'ej-1', nombre: 'Press banca', series: 4, reps: 8, peso: 70 },
      { id: 'ej-2', nombre: 'Dominadas', series: 3, reps: 10, peso: 0 },
      { id: 'ej-3', nombre: 'Press militar', series: 3, reps: 10, peso: 40 },
      { id: 'ej-4', nombre: 'Curl bíceps', series: 3, reps: 12, peso: 15 },
    ],
  },
  {
    id: 'rut-2', nombre: 'Fuerza — Lower body', dias: ['M', 'J'],
    ejercicios: [
      { id: 'ej-5', nombre: 'Sentadilla', series: 4, reps: 8, peso: 90 },
      { id: 'ej-6', nombre: 'Peso muerto', series: 3, reps: 6, peso: 100 },
      { id: 'ej-7', nombre: 'Prensa', series: 3, reps: 12, peso: 120 },
    ],
  },
],
deporte_rutas: [
  { id: 'ruta-1', nombre: 'Montserrat circular', tipo: 'senderismo', distancia_km: 12, desnivel_m: 650, dificultad: 'media', tiempo_h: 4.5, fecha: fmt(subDays(hoy, 14)), notas: 'Espectacular, mucha gente en verano' },
  { id: 'ruta-2', nombre: 'Collserola — Sant Cugat', tipo: 'bici', distancia_km: 35, desnivel_m: 420, dificultad: 'media', tiempo_h: 2.0, fecha: fmt(subDays(hoy, 7)), notas: 'Buen firme hasta la bajada final' },
],

vehiculos: [
  {
    id: 'veh-1', marca: 'Volkswagen', modelo: 'Golf', anio: 2018, matricula: '1234 ABC', color: 'Gris',
    itv_ultima: '2022-11-15', itv_proxima: fmt(addDays(hoy, 180)),
    seguro_compania: 'Mapfre', seguro_vencimiento: fmt(addDays(hoy, 45)),
    taller: 'Taller García — 93 123 45 67',
    incidencias: [
      { id: 'inc-1', fecha: fmt(subDays(hoy, 30)), descripcion: 'Pinchazo rueda delantera derecha. Cambiada por la de repuesto.' },
    ],
  },
],

mascotas: [
  {
    id: 'mas-1', nombre: 'Luna', especie: 'perro', raza: 'Labrador', edad_anios: 3, icono: '🐕',
    veterinario: { nombre: 'Clínica VetCare', telefono: '93 456 78 90', direccion: 'Calle Mayor 12' },
    vacunas: [
      { id: 'vac-1', nombre: 'Rabia', fecha_ultima: fmt(subDays(hoy, 90)), proxima: fmt(addDays(hoy, 275)) },
      { id: 'vac-2', nombre: 'Polivalente', fecha_ultima: fmt(subDays(hoy, 90)), proxima: fmt(addDays(hoy, 275)) },
    ],
    medicacion: [],
    notas: 'Alérgica al pollo. Revisar oídos cada mes.',
  },
],

ropa_prendas: [
  { id: 'ropa-1', nombre: 'Vaqueros slim azul', categoria: 'pantalon', color: 'Azul', marca: 'Levi\'s', temporada: 'todo_año', en_trastero: false },
  { id: 'ropa-2', nombre: 'Camiseta básica blanca', categoria: 'camiseta', color: 'Blanco', marca: 'Uniqlo', temporada: 'verano', en_trastero: true },
  { id: 'ropa-3', nombre: 'Chaqueta cuero marrón', categoria: 'chaqueta', color: 'Marrón', marca: 'Zara', temporada: 'entretiempo', en_trastero: false },
  { id: 'ropa-4', nombre: 'Zapatillas running', categoria: 'calzado', color: 'Negro', marca: 'Nike', temporada: 'todo_año', en_trastero: false },
  { id: 'ropa-5', nombre: 'Abrigo gris', categoria: 'abrigo', color: 'Gris', marca: 'Mango', temporada: 'invierno', en_trastero: true },
],
ropa_tallas: { camiseta: 'M', pantalon: '32x32', calzado: '43', chaqueta: 'L' },
ropa_wishlist: [
  { id: 'wish-1', nombre: 'Sudadera técnica running', marca: 'Decathlon', precio_aprox: 35, url: '' },
  { id: 'wish-2', nombre: 'Chinos beige', marca: 'Massimo Dutti', precio_aprox: 70, url: '' },
],

formacion_cursos: [
  { id: 'cur-1', titulo: 'React 18 + TypeScript Avanzado', plataforma: 'Udemy', progreso: 68, fecha_limite: fmt(addDays(hoy, 45)), estado: 'activo' },
  { id: 'cur-2', titulo: 'AWS Solutions Architect', plataforma: 'A Cloud Guru', progreso: 30, fecha_limite: fmt(addDays(hoy, 90)), estado: 'activo' },
  { id: 'cur-3', titulo: 'Docker & Kubernetes', plataforma: 'Udemy', progreso: 100, fecha_limite: null, estado: 'completado' },
],
formacion_idiomas: [
  { id: 'idm-1', idioma: 'Inglés', nivel: 'B2', metodo: 'Italki + series en VO', objetivo: 'C1' },
  { id: 'idm-2', idioma: 'Francés', nivel: 'A2', metodo: 'Duolingo', objetivo: 'B1' },
],
formacion_certificaciones: [
  { id: 'cert-1', nombre: 'AWS Cloud Practitioner', entidad: 'Amazon', fecha: '2024-03-15', estado: 'obtenida' },
  { id: 'cert-2', nombre: 'Google Analytics 4', entidad: 'Google', fecha: null, estado: 'en_progreso' },
],
```

- [ ] **Step 6: Bump DEMO_VERSION in `src/data/demo/index.js`** from `'10'` → `'11'`.

- [ ] **Step 7: Run tests to confirm they pass**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/data/demo/__tests__/personal.test.js 2>&1 | tail -15
```

Expected: All tests pass (existing + 5 new).

- [ ] **Step 8: Commit**

```bash
cd /home/user/mi-portfolio-proyectos
git add src/data/demo/personal.js src/data/demo/index.js src/data/demo/__tests__/personal.test.js
git commit -m "feat: add demo data for deporte, vehiculos, mascotas, ropa, formacion — DEMO_VERSION 11"
```

---

## Task 2: Deporte.jsx

**Files:**
- Create: `src/pages/app/modules/personal/Deporte.jsx`
- Create: `src/pages/app/modules/personal/__tests__/Deporte.test.jsx`

**Behavior:** Two tabs — "Rutinas" and "Rutas". Rutinas tab: list of workout routines with exercises (series × reps × peso). Click a routine to expand its exercise list. Add exercise inline. Rutas tab: list of hiking/cycling routes with distance, elevation, difficulty badge, time.

- [ ] **Step 1: Create test file**

```jsx
// src/pages/app/modules/personal/__tests__/Deporte.test.jsx
import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Deporte from '../Deporte'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'personal' } }) }))
vi.mock('../../../../../data/demo', () => ({
  demoRead: (_, key) => {
    if (key === 'deporte_rutinas') return [
      { id: 'rut-1', nombre: 'Upper body', dias: ['L', 'X'], ejercicios: [
        { id: 'ej-1', nombre: 'Press banca', series: 4, reps: 8, peso: 70 },
      ]},
    ]
    if (key === 'deporte_rutas') return [
      { id: 'ruta-1', nombre: 'Montserrat', tipo: 'senderismo', distancia_km: 12, desnivel_m: 650, dificultad: 'media', tiempo_h: 4.5, fecha: '2026-05-01', notas: '' },
    ]
    return []
  },
  demoWrite: vi.fn(),
}))

describe('Deporte', () => {
  it('renders rutinas tab with routine name', () => {
    render(<Deporte />)
    expect(screen.getByText('Upper body')).toBeInTheDocument()
  })

  it('switches to rutas tab', () => {
    render(<Deporte />)
    fireEvent.click(screen.getByText('Rutas'))
    expect(screen.getByText('Montserrat')).toBeInTheDocument()
  })

  it('shows exercise inside routine', () => {
    render(<Deporte />)
    expect(screen.getByText('Press banca')).toBeInTheDocument()
  })

  it('shows dias badges on routine', () => {
    render(<Deporte />)
    expect(screen.getByText('L')).toBeInTheDocument()
    expect(screen.getByText('X')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/personal/__tests__/Deporte.test.jsx 2>&1 | tail -10
```

- [ ] **Step 3: Create `src/pages/app/modules/personal/Deporte.jsx`**

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const DIFICULTAD_COLOR = { facil: '#22c55e', media: '#f59e0b', dificil: '#ef4444' }
const TIPO_ICON = { senderismo: '🥾', bici: '🚴', running: '🏃', otro: '🏅' }

const BLANK_RUTINA = { nombre: '', dias: [] }
const BLANK_EJ = { nombre: '', series: 3, reps: 10, peso: 0 }
const BLANK_RUTA = { nombre: '', tipo: 'senderismo', distancia_km: '', desnivel_m: '', dificultad: 'media', tiempo_h: '', notas: '' }

export default function Deporte() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'personal'

  const [tab, setTab] = useState('rutinas')
  const [rutinas, setRutinas] = useState(() => demoRead(appType, 'deporte_rutinas') ?? [])
  const [rutas, setRutas] = useState(() => demoRead(appType, 'deporte_rutas') ?? [])

  const [showRutinaForm, setShowRutinaForm] = useState(false)
  const [rutinaForm, setRutinaForm] = useState(BLANK_RUTINA)
  const [showRutaForm, setShowRutaForm] = useState(false)
  const [rutaForm, setRutaForm] = useState(BLANK_RUTA)
  const [expandedRutina, setExpandedRutina] = useState(null)
  const [ejForms, setEjForms] = useState({})

  const saveRutinas = (next) => { setRutinas(next); demoWrite(appType, 'deporte_rutinas', next) }
  const saveRutas   = (next) => { setRutas(next);   demoWrite(appType, 'deporte_rutas', next) }

  const addRutina = (e) => {
    e.preventDefault()
    if (!rutinaForm.nombre.trim()) return
    const entry = { id: crypto.randomUUID(), nombre: rutinaForm.nombre.trim(), dias: rutinaForm.dias, ejercicios: [] }
    saveRutinas([...rutinas, entry])
    setRutinaForm(BLANK_RUTINA)
    setShowRutinaForm(false)
  }

  const toggleDia = (dia) => {
    setRutinaForm(f => ({
      ...f,
      dias: f.dias.includes(dia) ? f.dias.filter(d => d !== dia) : [...f.dias, dia],
    }))
  }

  const addEjercicio = (rutinaId) => {
    const form = ejForms[rutinaId] ?? BLANK_EJ
    if (!form.nombre.trim()) return
    const entry = { id: crypto.randomUUID(), nombre: form.nombre.trim(), series: Number(form.series), reps: Number(form.reps), peso: Number(form.peso) }
    saveRutinas(rutinas.map(r => r.id === rutinaId ? { ...r, ejercicios: [...r.ejercicios, entry] } : r))
    setEjForms(f => ({ ...f, [rutinaId]: BLANK_EJ }))
  }

  const deleteEj = (rutinaId, ejId) => {
    saveRutinas(rutinas.map(r => r.id === rutinaId ? { ...r, ejercicios: r.ejercicios.filter(e => e.id !== ejId) } : r))
  }

  const deleteRutina = (id) => saveRutinas(rutinas.filter(r => r.id !== id))

  const addRuta = (e) => {
    e.preventDefault()
    if (!rutaForm.nombre.trim()) return
    const entry = {
      id: crypto.randomUUID(),
      nombre: rutaForm.nombre.trim(),
      tipo: rutaForm.tipo,
      distancia_km: parseFloat(rutaForm.distancia_km) || 0,
      desnivel_m: parseInt(rutaForm.desnivel_m, 10) || 0,
      dificultad: rutaForm.dificultad,
      tiempo_h: parseFloat(rutaForm.tiempo_h) || 0,
      fecha: new Date().toISOString().slice(0, 10),
      notas: rutaForm.notas.trim(),
    }
    saveRutas([...rutas, entry])
    setRutaForm(BLANK_RUTA)
    setShowRutaForm(false)
  }

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      padding: '0.5rem 1.25rem', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
      background: tab === id ? 'var(--accent)' : 'var(--bg-card)',
      color: tab === id ? '#fff' : 'var(--text-muted)',
      border: tab === id ? 'none' : '1px solid var(--border)',
    }}>{label}</button>
  )

  const inputStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 680 }}>
      <h2 style={{ margin: '0 0 1.25rem' }}>Deporte</h2>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {tabBtn('rutinas', '🏋️ Rutinas')}
        {tabBtn('rutas', '🗺️ Rutas')}
      </div>

      {/* === RUTINAS TAB === */}
      {tab === 'rutinas' && (
        <div>
          {rutinas.map(r => (
            <div key={r.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: '0.75rem', overflow: 'hidden' }}>
              <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                onClick={() => setExpandedRutina(expandedRutina === r.id ? null : r.id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{r.nombre}</div>
                  <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.4rem' }}>
                    {DIAS_SEMANA.map(d => (
                      <span key={d} style={{
                        width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 700,
                        background: r.dias.includes(d) ? 'var(--accent)' : 'var(--border)',
                        color: r.dias.includes(d) ? '#fff' : 'var(--text-faint)',
                      }}>{d}</span>
                    ))}
                  </div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{r.ejercicios.length} ejercicios</span>
                <button onClick={e => { e.stopPropagation(); deleteRutina(r.id) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>🗑</button>
                <span style={{ color: 'var(--text-faint)' }}>{expandedRutina === r.id ? '▲' : '▼'}</span>
              </div>

              {expandedRutina === r.id && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
                        <th style={{ padding: '0.25rem 0.5rem' }}>Ejercicio</th>
                        <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' }}>Series</th>
                        <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' }}>Reps</th>
                        <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' }}>Peso</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {r.ejercicios.map(ej => (
                        <tr key={ej.id}>
                          <td style={{ padding: '0.3rem 0.5rem', fontWeight: 500 }}>{ej.nombre}</td>
                          <td style={{ padding: '0.3rem 0.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{ej.series}</td>
                          <td style={{ padding: '0.3rem 0.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{ej.reps}</td>
                          <td style={{ padding: '0.3rem 0.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{ej.peso > 0 ? `${ej.peso} kg` : 'PC'}</td>
                          <td><button onClick={() => deleteEj(r.id, ej.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '0.8rem' }}>✕</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Add exercise inline */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 4rem 4rem 4rem auto', gap: '0.4rem', marginTop: '0.75rem' }}>
                    <input placeholder="Ejercicio" value={(ejForms[r.id] ?? BLANK_EJ).nombre}
                      onChange={e => setEjForms(f => ({ ...f, [r.id]: { ...(f[r.id] ?? BLANK_EJ), nombre: e.target.value } }))}
                      style={{ ...inputStyle }} />
                    <input type="number" min="1" placeholder="Series" value={(ejForms[r.id] ?? BLANK_EJ).series}
                      onChange={e => setEjForms(f => ({ ...f, [r.id]: { ...(f[r.id] ?? BLANK_EJ), series: e.target.value } }))}
                      style={{ ...inputStyle, textAlign: 'center' }} />
                    <input type="number" min="1" placeholder="Reps" value={(ejForms[r.id] ?? BLANK_EJ).reps}
                      onChange={e => setEjForms(f => ({ ...f, [r.id]: { ...(f[r.id] ?? BLANK_EJ), reps: e.target.value } }))}
                      style={{ ...inputStyle, textAlign: 'center' }} />
                    <input type="number" min="0" placeholder="Peso" value={(ejForms[r.id] ?? BLANK_EJ).peso}
                      onChange={e => setEjForms(f => ({ ...f, [r.id]: { ...(f[r.id] ?? BLANK_EJ), peso: e.target.value } }))}
                      style={{ ...inputStyle, textAlign: 'center' }} />
                    <button onClick={() => addEjercicio(r.id)}
                      style={{ padding: '0.5rem 0.75rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>+</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {rutinas.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin rutinas. Añade una.</p>}

          {!showRutinaForm ? (
            <button onClick={() => setShowRutinaForm(true)}
              style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>
              + Nueva rutina
            </button>
          ) : (
            <form onSubmit={addRutina} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input placeholder="Nombre de la rutina" value={rutinaForm.nombre} onChange={e => setRutinaForm(f => ({ ...f, nombre: e.target.value }))} required style={inputStyle} />
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {DIAS_SEMANA.map(d => (
                  <button key={d} type="button" onClick={() => toggleDia(d)} style={{
                    width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
                    background: rutinaForm.dias.includes(d) ? 'var(--accent)' : 'var(--border)',
                    color: rutinaForm.dias.includes(d) ? '#fff' : 'var(--text-faint)',
                  }}>{d}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Crear</button>
                <button type="button" onClick={() => { setShowRutinaForm(false); setRutinaForm(BLANK_RUTINA) }}
                  style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* === RUTAS TAB === */}
      {tab === 'rutas' && (
        <div>
          {rutas.map(r => (
            <div key={r.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '2rem' }}>{TIPO_ICON[r.tipo] ?? '🏅'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{r.nombre}</div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span>📏 {r.distancia_km} km</span>
                  <span>⛰️ {r.desnivel_m} m</span>
                  <span>⏱️ {r.tiempo_h} h</span>
                  <span style={{ color: DIFICULTAD_COLOR[r.dificultad] ?? 'var(--text-muted)', fontWeight: 600 }}>{r.dificultad}</span>
                  <span>{r.fecha}</span>
                </div>
                {r.notas && <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginTop: '0.3rem' }}>{r.notas}</div>}
              </div>
              <button onClick={() => saveRutas(rutas.filter(x => x.id !== r.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>🗑</button>
            </div>
          ))}

          {rutas.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin rutas registradas.</p>}

          {!showRutaForm ? (
            <button onClick={() => setShowRutaForm(true)}
              style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>
              + Añadir ruta
            </button>
          ) : (
            <form onSubmit={addRuta} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input placeholder="Nombre de la ruta" value={rutaForm.nombre} onChange={e => setRutaForm(f => ({ ...f, nombre: e.target.value }))} required style={inputStyle} />
                <select value={rutaForm.tipo} onChange={e => setRutaForm(f => ({ ...f, tipo: e.target.value }))} style={{ ...inputStyle }}>
                  <option value="senderismo">🥾 Senderismo</option>
                  <option value="bici">🚴 Bici</option>
                  <option value="running">🏃 Running</option>
                  <option value="otro">🏅 Otro</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                <input type="number" step="0.1" placeholder="Km" value={rutaForm.distancia_km} onChange={e => setRutaForm(f => ({ ...f, distancia_km: e.target.value }))} style={inputStyle} />
                <input type="number" placeholder="Desnivel m" value={rutaForm.desnivel_m} onChange={e => setRutaForm(f => ({ ...f, desnivel_m: e.target.value }))} style={inputStyle} />
                <input type="number" step="0.5" placeholder="Horas" value={rutaForm.tiempo_h} onChange={e => setRutaForm(f => ({ ...f, tiempo_h: e.target.value }))} style={inputStyle} />
                <select value={rutaForm.dificultad} onChange={e => setRutaForm(f => ({ ...f, dificultad: e.target.value }))} style={inputStyle}>
                  <option value="facil">Fácil</option>
                  <option value="media">Media</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>
              <input placeholder="Notas (opcional)" value={rutaForm.notas} onChange={e => setRutaForm(f => ({ ...f, notas: e.target.value }))} style={inputStyle} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Añadir</button>
                <button type="button" onClick={() => { setShowRutaForm(false); setRutaForm(BLANK_RUTA) }}
                  style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}

      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center' }}>
        💡 Demo — los cambios se guardan en esta sesión
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — all must pass**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/personal/__tests__/Deporte.test.jsx 2>&1 | tail -10
```

- [ ] **Step 5: Commit**

```bash
cd /home/user/mi-portfolio-proyectos
git add src/pages/app/modules/personal/Deporte.jsx src/pages/app/modules/personal/__tests__/Deporte.test.jsx
git commit -m "feat: add Deporte module — gym routines with exercises, hiking/cycling routes"
```

---

## Task 3: Vehiculos.jsx

**Files:**
- Create: `src/pages/app/modules/personal/Vehiculos.jsx`
- Create: `src/pages/app/modules/personal/__tests__/Vehiculos.test.jsx`

**Behavior:** List of vehicles. Each vehicle card shows marca/modelo, matrícula, ITV próxima (semáforo: rojo <30d, ámbar <90d), seguro vencimiento (same semaphore), taller. Expandable to show incidencias. Add vehicle form. Add incidencia inline.

- [ ] **Step 1: Create test file**

```jsx
// src/pages/app/modules/personal/__tests__/Vehiculos.test.jsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Vehiculos from '../Vehiculos'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'personal' } }) }))

const today = new Date()
const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) }

vi.mock('../../../../../data/demo', () => ({
  demoRead: () => [
    {
      id: 'veh-1', marca: 'Volkswagen', modelo: 'Golf', anio: 2018, matricula: '1234 ABC', color: 'Gris',
      itv_ultima: '2022-11-15', itv_proxima: addDays(180),
      seguro_compania: 'Mapfre', seguro_vencimiento: addDays(20),
      taller: 'Taller García', incidencias: [],
    },
  ],
  demoWrite: vi.fn(),
}))

describe('Vehiculos', () => {
  it('renders vehicle brand and model', () => {
    render(<Vehiculos />)
    expect(screen.getByText(/Volkswagen/)).toBeInTheDocument()
    expect(screen.getByText(/Golf/)).toBeInTheDocument()
  })

  it('shows matricula', () => {
    render(<Vehiculos />)
    expect(screen.getByText('1234 ABC')).toBeInTheDocument()
  })

  it('shows red semaphore for insurance expiring in 20 days', () => {
    render(<Vehiculos />)
    expect(screen.getByText(/20 d/i)).toBeInTheDocument()
  })

  it('shows itv date', () => {
    render(<Vehiculos />)
    expect(screen.getByText(/ITV/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/personal/__tests__/Vehiculos.test.jsx 2>&1 | tail -10
```

- [ ] **Step 3: Create `src/pages/app/modules/personal/Vehiculos.jsx`**

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const BLANK = { marca: '', modelo: '', anio: new Date().getFullYear(), matricula: '', color: '', itv_proxima: '', seguro_compania: '', seguro_vencimiento: '', taller: '' }

function diasHasta(fechaStr) {
  if (!fechaStr) return null
  return Math.ceil((new Date(fechaStr) - new Date()) / 86400000)
}

function semaforo(dias, label) {
  if (dias === null) return { color: 'var(--text-faint)', text: `${label}: —` }
  if (dias < 0)  return { color: '#ef4444', text: `${label}: vencido` }
  if (dias < 30) return { color: '#ef4444', text: `${label}: ${dias} días` }
  if (dias < 90) return { color: '#f59e0b', text: `${label}: ${dias} días` }
  return { color: '#22c55e', text: `${label}: ${dias} días` }
}

export default function Vehiculos() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'personal'

  const [vehiculos, setVehiculos] = useState(() => demoRead(appType, 'vehiculos') ?? [])
  const [expanded, setExpanded] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [incForms, setIncForms] = useState({})

  const save = (next) => { setVehiculos(next); demoWrite(appType, 'vehiculos', next) }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.marca.trim() || !form.matricula.trim()) return
    save([...vehiculos, { ...form, id: crypto.randomUUID(), anio: Number(form.anio), incidencias: [] }])
    setForm(BLANK)
    setShowForm(false)
  }

  const addIncidencia = (vehId) => {
    const desc = (incForms[vehId] ?? '').trim()
    if (!desc) return
    const inc = { id: crypto.randomUUID(), fecha: new Date().toISOString().slice(0, 10), descripcion: desc }
    save(vehiculos.map(v => v.id === vehId ? { ...v, incidencias: [...(v.incidencias ?? []), inc] } : v))
    setIncForms(f => ({ ...f, [vehId]: '' }))
  }

  const inputStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 640 }}>
      <h2 style={{ margin: '0 0 1.25rem' }}>Vehículos</h2>

      {vehiculos.map(v => {
        const itv = semaforo(diasHasta(v.itv_proxima), 'ITV')
        const seg = semaforo(diasHasta(v.seguro_vencimiento), 'Seguro')
        const isExpanded = expanded === v.id
        return (
          <div key={v.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: '0.75rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
              onClick={() => setExpanded(isExpanded ? null : v.id)}>
              <span style={{ fontSize: '2rem' }}>🚗</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{v.marca} {v.modelo} <span style={{ color: 'var(--text-faint)', fontWeight: 400, fontSize: '0.9rem' }}>({v.anio})</span></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>{v.matricula} · {v.color}</div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                  <span style={{ color: itv.color, fontWeight: 600 }}>{itv.text}</span>
                  <span style={{ color: seg.color, fontWeight: 600 }}>{seg.text}</span>
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); save(vehiculos.filter(x => x.id !== v.id)) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>🗑</button>
              <span style={{ color: 'var(--text-faint)' }}>{isExpanded ? '▲' : '▼'}</span>
            </div>

            {isExpanded && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '1rem' }}>
                {v.taller && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>🔧 {v.taller}</div>}
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Incidencias</div>
                {(v.incidencias ?? []).map(inc => (
                  <div key={inc.id} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-faint)', marginRight: '0.5rem' }}>{inc.fecha}</span>{inc.descripcion}
                  </div>
                ))}
                {(v.incidencias ?? []).length === 0 && <div style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>Sin incidencias.</div>}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <input placeholder="Nueva incidencia…" value={incForms[v.id] ?? ''}
                    onChange={e => setIncForms(f => ({ ...f, [v.id]: e.target.value }))}
                    style={{ ...inputStyle }} />
                  <button onClick={() => addIncidencia(v.id)}
                    style={{ padding: '0.5rem 0.75rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    + Añadir
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {vehiculos.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin vehículos registrados.</p>}

      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>
          + Añadir vehículo
        </button>
      ) : (
        <form onSubmit={handleAdd} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 5rem', gap: '0.5rem' }}>
            <input placeholder="Marca" value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))} required style={inputStyle} />
            <input placeholder="Modelo" value={form.modelo} onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))} style={inputStyle} />
            <input type="number" placeholder="Año" value={form.anio} onChange={e => setForm(f => ({ ...f, anio: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <input placeholder="Matrícula" value={form.matricula} onChange={e => setForm(f => ({ ...f, matricula: e.target.value }))} required style={inputStyle} />
            <input placeholder="Color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>ITV próxima</label>
              <input type="date" value={form.itv_proxima} onChange={e => setForm(f => ({ ...f, itv_proxima: e.target.value }))} style={inputStyle} /></div>
            <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Seguro vencimiento</label>
              <input type="date" value={form.seguro_vencimiento} onChange={e => setForm(f => ({ ...f, seguro_vencimiento: e.target.value }))} style={inputStyle} /></div>
          </div>
          <input placeholder="Compañía seguro" value={form.seguro_compania} onChange={e => setForm(f => ({ ...f, seguro_compania: e.target.value }))} style={inputStyle} />
          <input placeholder="Taller de confianza" value={form.taller} onChange={e => setForm(f => ({ ...f, taller: e.target.value }))} style={inputStyle} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Añadir</button>
            <button type="button" onClick={() => { setShowForm(false); setForm(BLANK) }}
              style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </form>
      )}

      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center' }}>
        💡 Demo — los cambios se guardan en esta sesión
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/personal/__tests__/Vehiculos.test.jsx 2>&1 | tail -10
```

- [ ] **Step 5: Commit**

```bash
cd /home/user/mi-portfolio-proyectos
git add src/pages/app/modules/personal/Vehiculos.jsx src/pages/app/modules/personal/__tests__/Vehiculos.test.jsx
git commit -m "feat: add Vehiculos module — ITV/seguro semaphore, incidencias, CRUD"
```

---

## Task 4: Mascotas.jsx

**Files:**
- Create: `src/pages/app/modules/personal/Mascotas.jsx`
- Create: `src/pages/app/modules/personal/__tests__/Mascotas.test.jsx`

**Behavior:** List of pets. Each pet card shows nombre, especie, raza, edad. Expandable section with: veterinario (contact info), vacunas (list with próxima date semaphore), medicación, notas. Add pet form.

- [ ] **Step 1: Create test file**

```jsx
// src/pages/app/modules/personal/__tests__/Mascotas.test.jsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Mascotas from '../Mascotas'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'personal' } }) }))

const today = new Date()
const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) }

vi.mock('../../../../../data/demo', () => ({
  demoRead: () => [{
    id: 'mas-1', nombre: 'Luna', especie: 'perro', raza: 'Labrador', edad_anios: 3, icono: '🐕',
    veterinario: { nombre: 'VetCare', telefono: '93 456 78 90', direccion: 'Calle Mayor 12' },
    vacunas: [{ id: 'vac-1', nombre: 'Rabia', fecha_ultima: '2026-02-15', proxima: addDays(275) }],
    medicacion: [],
    notas: 'Alérgica al pollo.',
  }],
  demoWrite: vi.fn(),
}))

describe('Mascotas', () => {
  it('renders pet name', () => {
    render(<Mascotas />)
    expect(screen.getByText('Luna')).toBeInTheDocument()
  })

  it('shows especie and raza', () => {
    render(<Mascotas />)
    expect(screen.getByText(/Labrador/)).toBeInTheDocument()
  })

  it('shows vet name', () => {
    render(<Mascotas />)
    expect(screen.getByText(/VetCare/)).toBeInTheDocument()
  })

  it('shows vaccine name', () => {
    render(<Mascotas />)
    expect(screen.getByText('Rabia')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/personal/__tests__/Mascotas.test.jsx 2>&1 | tail -10
```

- [ ] **Step 3: Create `src/pages/app/modules/personal/Mascotas.jsx`**

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const BLANK = { nombre: '', especie: 'perro', raza: '', edad_anios: '', icono: '🐾', notas: '', veterinario: { nombre: '', telefono: '', direccion: '' } }
const ESPECIE_ICON = { perro: '🐕', gato: '🐈', conejo: '🐇', otro: '🐾' }

function diasHasta(fechaStr) {
  if (!fechaStr) return null
  return Math.ceil((new Date(fechaStr) - new Date()) / 86400000)
}
function vacSemaforo(dias) {
  if (dias === null) return { color: 'var(--text-faint)', label: '—' }
  if (dias < 0)  return { color: '#ef4444', label: 'Vencida' }
  if (dias < 30) return { color: '#ef4444', label: `${dias}d` }
  if (dias < 90) return { color: '#f59e0b', label: `${dias}d` }
  return { color: '#22c55e', label: `${dias}d` }
}

export default function Mascotas() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'personal'

  const [mascotas, setMascotas] = useState(() => demoRead(appType, 'mascotas') ?? [])
  const [expanded, setExpanded] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(BLANK)

  const save = (next) => { setMascotas(next); demoWrite(appType, 'mascotas', next) }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    save([...mascotas, { ...form, id: crypto.randomUUID(), edad_anios: Number(form.edad_anios) || 0, vacunas: [], medicacion: [] }])
    setForm(BLANK)
    setShowForm(false)
  }

  const inputStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 640 }}>
      <h2 style={{ margin: '0 0 1.25rem' }}>Mascotas</h2>

      {mascotas.map(m => {
        const icon = m.icono || ESPECIE_ICON[m.especie] || '🐾'
        const isExpanded = expanded === m.id
        return (
          <div key={m.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: '0.75rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
              onClick={() => setExpanded(isExpanded ? null : m.id)}>
              <span style={{ fontSize: '2.5rem' }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{m.nombre}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {m.raza} · {m.edad_anios} {m.edad_anios === 1 ? 'año' : 'años'}
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); save(mascotas.filter(x => x.id !== m.id)) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>🗑</button>
              <span style={{ color: 'var(--text-faint)' }}>{isExpanded ? '▲' : '▼'}</span>
            </div>

            {isExpanded && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Vet */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Veterinario</div>
                  {m.veterinario?.nombre
                    ? <div style={{ fontSize: '0.9rem' }}>
                        <span style={{ fontWeight: 500 }}>{m.veterinario.nombre}</span>
                        {m.veterinario.telefono && <span style={{ color: 'var(--text-muted)', marginLeft: '0.75rem' }}>📞 {m.veterinario.telefono}</span>}
                        {m.veterinario.direccion && <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginTop: 2 }}>📍 {m.veterinario.direccion}</div>}
                      </div>
                    : <span style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>Sin veterinario registrado.</span>
                  }
                </div>

                {/* Vacunas */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Vacunas</div>
                  {(m.vacunas ?? []).length === 0
                    ? <span style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>Sin vacunas registradas.</span>
                    : (m.vacunas ?? []).map(vac => {
                        const sem = vacSemaforo(diasHasta(vac.proxima))
                        return (
                          <div key={vac.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: 500 }}>{vac.nombre}</span>
                            <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              <span>Última: {vac.fecha_ultima}</span>
                              <span style={{ color: sem.color, fontWeight: 600 }}>Próxima: {sem.label}</span>
                            </div>
                          </div>
                        )
                      })
                  }
                </div>

                {/* Notas */}
                {m.notas && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                    📝 {m.notas}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {mascotas.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin mascotas registradas.</p>}

      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>
          + Añadir mascota
        </button>
      ) : (
        <form onSubmit={handleAdd} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.5rem 1fr 1fr', gap: '0.5rem' }}>
            <input value={form.icono} onChange={e => setForm(f => ({ ...f, icono: e.target.value }))} maxLength={2}
              style={{ ...inputStyle, textAlign: 'center', fontSize: '1.2rem', padding: '0.5rem' }} />
            <input placeholder="Nombre" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required style={inputStyle} />
            <select value={form.especie} onChange={e => setForm(f => ({ ...f, especie: e.target.value }))} style={inputStyle}>
              <option value="perro">🐕 Perro</option>
              <option value="gato">🐈 Gato</option>
              <option value="conejo">🐇 Conejo</option>
              <option value="otro">🐾 Otro</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 4rem', gap: '0.5rem' }}>
            <input placeholder="Raza" value={form.raza} onChange={e => setForm(f => ({ ...f, raza: e.target.value }))} style={inputStyle} />
            <input type="number" min="0" placeholder="Edad" value={form.edad_anios} onChange={e => setForm(f => ({ ...f, edad_anios: e.target.value }))} style={inputStyle} />
          </div>
          <input placeholder="Notas (alergias, comportamiento…)" value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} style={inputStyle} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Añadir</button>
            <button type="button" onClick={() => { setShowForm(false); setForm(BLANK) }}
              style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </form>
      )}

      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center' }}>
        💡 Demo — los cambios se guardan en esta sesión
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/personal/__tests__/Mascotas.test.jsx 2>&1 | tail -10
```

- [ ] **Step 5: Commit**

```bash
cd /home/user/mi-portfolio-proyectos
git add src/pages/app/modules/personal/Mascotas.jsx src/pages/app/modules/personal/__tests__/Mascotas.test.jsx
git commit -m "feat: add Mascotas module — vet, vaccines semaphore, CRUD"
```

---

## Task 5: Ropa.jsx

**Files:**
- Create: `src/pages/app/modules/personal/Ropa.jsx`
- Create: `src/pages/app/modules/personal/__tests__/Ropa.test.jsx`

**Behavior:** Three tabs — "Armario", "Tallas", "Wishlist". Armario: grid of clothes with categoria/color/marca/temporada badge. Filter by temporada. "En trastero" items shown muted. Tallas: simple key-value display (editable). Wishlist: list with delete.

- [ ] **Step 1: Create test file**

```jsx
// src/pages/app/modules/personal/__tests__/Ropa.test.jsx
import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Ropa from '../Ropa'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'personal' } }) }))
vi.mock('../../../../../data/demo', () => ({
  demoRead: (_, key) => {
    if (key === 'ropa_prendas') return [
      { id: 'r-1', nombre: 'Vaqueros slim', categoria: 'pantalon', color: 'Azul', marca: "Levi's", temporada: 'todo_año', en_trastero: false },
      { id: 'r-2', nombre: 'Abrigo gris', categoria: 'abrigo', color: 'Gris', marca: 'Mango', temporada: 'invierno', en_trastero: true },
    ]
    if (key === 'ropa_tallas') return { camiseta: 'M', pantalon: '32x32', calzado: '43' }
    if (key === 'ropa_wishlist') return [
      { id: 'w-1', nombre: 'Sudadera técnica', marca: 'Decathlon', precio_aprox: 35, url: '' },
    ]
    return []
  },
  demoWrite: vi.fn(),
}))

describe('Ropa', () => {
  it('renders clothes in armario tab', () => {
    render(<Ropa />)
    expect(screen.getByText('Vaqueros slim')).toBeInTheDocument()
  })

  it('shows tallas when switching tab', () => {
    render(<Ropa />)
    fireEvent.click(screen.getByText('Tallas'))
    expect(screen.getByText(/camiseta/i)).toBeInTheDocument()
  })

  it('shows wishlist items', () => {
    render(<Ropa />)
    fireEvent.click(screen.getByText('Wishlist'))
    expect(screen.getByText('Sudadera técnica')).toBeInTheDocument()
  })

  it('marks en_trastero items differently', () => {
    render(<Ropa />)
    // Abrigo gris is en_trastero:true — should appear with trastero badge
    expect(screen.getByText(/trastero/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/personal/__tests__/Ropa.test.jsx 2>&1 | tail -10
```

- [ ] **Step 3: Create `src/pages/app/modules/personal/Ropa.jsx`**

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const CATEGORIAS = ['camiseta', 'pantalon', 'chaqueta', 'abrigo', 'calzado', 'accesorio', 'otro']
const TEMPORADAS = ['todo_año', 'verano', 'invierno', 'entretiempo']
const TEMP_LABEL = { todo_año: 'Todo el año', verano: 'Verano', invierno: 'Invierno', entretiempo: 'Entretiempo' }
const TEMP_COLOR = { todo_año: 'var(--text-muted)', verano: '#f59e0b', invierno: '#3b82f6', entretiempo: '#22c55e' }

const BLANK_PRENDA = { nombre: '', categoria: 'camiseta', color: '', marca: '', temporada: 'todo_año', en_trastero: false }
const BLANK_WISH = { nombre: '', marca: '', precio_aprox: '', url: '' }

export default function Ropa() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'personal'

  const [tab, setTab] = useState('armario')
  const [prendas, setPrendas] = useState(() => demoRead(appType, 'ropa_prendas') ?? [])
  const [tallas, setTallas] = useState(() => { const r = demoRead(appType, 'ropa_tallas'); return (r && !Array.isArray(r)) ? r : {} })
  const [wishlist, setWishlist] = useState(() => demoRead(appType, 'ropa_wishlist') ?? [])
  const [filtroTemp, setFiltroTemp] = useState('todas')
  const [showPrendaForm, setShowPrendaForm] = useState(false)
  const [prendaForm, setPrendaForm] = useState(BLANK_PRENDA)
  const [showWishForm, setShowWishForm] = useState(false)
  const [wishForm, setWishForm] = useState(BLANK_WISH)
  const [editingTalla, setEditingTalla] = useState(null)

  const savePrendas = (next) => { setPrendas(next); demoWrite(appType, 'ropa_prendas', next) }
  const saveTallas  = (next) => { setTallas(next);  demoWrite(appType, 'ropa_tallas', next) }
  const saveWishlist= (next) => { setWishlist(next);demoWrite(appType, 'ropa_wishlist', next) }

  const addPrenda = (e) => {
    e.preventDefault()
    if (!prendaForm.nombre.trim()) return
    savePrendas([...prendas, { ...prendaForm, id: crypto.randomUUID() }])
    setPrendaForm(BLANK_PRENDA)
    setShowPrendaForm(false)
  }

  const addWish = (e) => {
    e.preventDefault()
    if (!wishForm.nombre.trim()) return
    saveWishlist([...wishlist, { ...wishForm, id: crypto.randomUUID(), precio_aprox: parseFloat(wishForm.precio_aprox) || 0 }])
    setWishForm(BLANK_WISH)
    setShowWishForm(false)
  }

  const prendasFiltradas = filtroTemp === 'todas' ? prendas : prendas.filter(p => p.temporada === filtroTemp)

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      padding: '0.5rem 1rem', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
      background: tab === id ? 'var(--accent)' : 'var(--bg-card)',
      color: tab === id ? '#fff' : 'var(--text-muted)',
      border: tab === id ? 'none' : '1px solid var(--border)',
    }}>{label}</button>
  )

  const inputStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 680 }}>
      <h2 style={{ margin: '0 0 1.25rem' }}>Ropa</h2>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {tabBtn('armario', '👕 Armario')}
        {tabBtn('tallas', '📏 Tallas')}
        {tabBtn('wishlist', '⭐ Wishlist')}
      </div>

      {/* === ARMARIO === */}
      {tab === 'armario' && (
        <div>
          {/* Temporada filter */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {['todas', ...TEMPORADAS].map(t => (
              <button key={t} onClick={() => setFiltroTemp(t)} style={{
                padding: '0.3rem 0.75rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem',
                border: '1px solid var(--border)',
                background: filtroTemp === t ? 'var(--accent)' : 'transparent',
                color: filtroTemp === t ? '#fff' : 'var(--text-muted)',
              }}>{t === 'todas' ? 'Todas' : TEMP_LABEL[t]}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            {prendasFiltradas.map(p => (
              <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem', opacity: p.en_trastero ? 0.6 : 1, position: 'relative' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{p.nombre}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.marca}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.color} · {p.categoria}</div>
                <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: 4, background: 'var(--border)', color: TEMP_COLOR[p.temporada] ?? 'var(--text-muted)', fontWeight: 600 }}>
                    {TEMP_LABEL[p.temporada]}
                  </span>
                  {p.en_trastero && <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: 4, background: 'var(--border)', color: 'var(--text-faint)' }}>trastero</span>}
                </div>
                <button onClick={() => savePrendas(prendas.filter(x => x.id !== p.id))}
                  style={{ position: 'absolute', top: 6, right: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '0.8rem' }}>✕</button>
              </div>
            ))}
          </div>

          {prendasFiltradas.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin prendas en esta temporada.</p>}

          {!showPrendaForm ? (
            <button onClick={() => setShowPrendaForm(true)}
              style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>
              + Añadir prenda
            </button>
          ) : (
            <form onSubmit={addPrenda} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <input placeholder="Nombre" value={prendaForm.nombre} onChange={e => setPrendaForm(f => ({ ...f, nombre: e.target.value }))} required style={inputStyle} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <select value={prendaForm.categoria} onChange={e => setPrendaForm(f => ({ ...f, categoria: e.target.value }))} style={inputStyle}>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={prendaForm.temporada} onChange={e => setPrendaForm(f => ({ ...f, temporada: e.target.value }))} style={inputStyle}>
                  {TEMPORADAS.map(t => <option key={t} value={t}>{TEMP_LABEL[t]}</option>)}
                </select>
                <input placeholder="Color" value={prendaForm.color} onChange={e => setPrendaForm(f => ({ ...f, color: e.target.value }))} style={inputStyle} />
                <input placeholder="Marca" value={prendaForm.marca} onChange={e => setPrendaForm(f => ({ ...f, marca: e.target.value }))} style={inputStyle} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input type="checkbox" checked={prendaForm.en_trastero} onChange={e => setPrendaForm(f => ({ ...f, en_trastero: e.target.checked }))} />
                En el trastero
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Añadir</button>
                <button type="button" onClick={() => { setShowPrendaForm(false); setPrendaForm(BLANK_PRENDA) }}
                  style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* === TALLAS === */}
      {tab === 'tallas' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(tallas).map(([tipo, valor]) => (
              <div key={tipo} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ width: 100, fontWeight: 500, textTransform: 'capitalize', color: 'var(--text-muted)' }}>{tipo}</span>
                {editingTalla === tipo
                  ? <input autoFocus defaultValue={valor}
                      onBlur={e => { saveTallas({ ...tallas, [tipo]: e.target.value }); setEditingTalla(null) }}
                      onKeyDown={e => { if (e.key === 'Enter') { saveTallas({ ...tallas, [tipo]: e.target.value }); setEditingTalla(null) } }}
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--accent)', borderRadius: 6, padding: '0.3rem 0.6rem', color: 'var(--text)', width: 80 }} />
                  : <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setEditingTalla(tipo)}>{valor}</span>
                }
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginTop: '1rem' }}>Haz clic en una talla para editarla.</p>
        </div>
      )}

      {/* === WISHLIST === */}
      {tab === 'wishlist' && (
        <div>
          {wishlist.map(w => (
            <div key={w.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{w.nombre}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{w.marca}{w.precio_aprox ? ` · ~${w.precio_aprox} €` : ''}</div>
              </div>
              <button onClick={() => saveWishlist(wishlist.filter(x => x.id !== w.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>🗑</button>
            </div>
          ))}
          {wishlist.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Wishlist vacía.</p>}

          {!showWishForm ? (
            <button onClick={() => setShowWishForm(true)}
              style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>
              + Añadir a wishlist
            </button>
          ) : (
            <form onSubmit={addWish} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input placeholder="Prenda deseada" value={wishForm.nombre} onChange={e => setWishForm(f => ({ ...f, nombre: e.target.value }))} required style={inputStyle} />
                <input placeholder="Marca" value={wishForm.marca} onChange={e => setWishForm(f => ({ ...f, marca: e.target.value }))} style={inputStyle} />
              </div>
              <input type="number" step="0.01" min="0" placeholder="Precio aproximado (€)" value={wishForm.precio_aprox} onChange={e => setWishForm(f => ({ ...f, precio_aprox: e.target.value }))} style={inputStyle} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Añadir</button>
                <button type="button" onClick={() => { setShowWishForm(false); setWishForm(BLANK_WISH) }}
                  style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}

      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center' }}>
        💡 Demo — los cambios se guardan en esta sesión
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/personal/__tests__/Ropa.test.jsx 2>&1 | tail -10
```

- [ ] **Step 5: Commit**

```bash
cd /home/user/mi-portfolio-proyectos
git add src/pages/app/modules/personal/Ropa.jsx src/pages/app/modules/personal/__tests__/Ropa.test.jsx
git commit -m "feat: add Ropa module — armario grid, tallas editable, wishlist"
```

---

## Task 6: Formacion.jsx

**Files:**
- Create: `src/pages/app/modules/personal/Formacion.jsx`
- Create: `src/pages/app/modules/personal/__tests__/Formacion.test.jsx`

**Behavior:** Three tabs — "Cursos", "Idiomas", "Certificaciones". Cursos: list with progress bar, plataforma badge, estado (activo/completado), fecha_limite. Idiomas: list with nivel, método, objetivo. Certificaciones: list with entidad, fecha, estado badge.

- [ ] **Step 1: Create test file**

```jsx
// src/pages/app/modules/personal/__tests__/Formacion.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Formacion from '../Formacion'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'personal' } }) }))
vi.mock('../../../../../data/demo', () => ({
  demoRead: (_, key) => {
    if (key === 'formacion_cursos') return [
      { id: 'c-1', titulo: 'React Avanzado', plataforma: 'Udemy', progreso: 68, fecha_limite: '2026-06-30', estado: 'activo' },
      { id: 'c-2', titulo: 'Docker', plataforma: 'Udemy', progreso: 100, fecha_limite: null, estado: 'completado' },
    ]
    if (key === 'formacion_idiomas') return [
      { id: 'i-1', idioma: 'Inglés', nivel: 'B2', metodo: 'Italki', objetivo: 'C1' },
    ]
    if (key === 'formacion_certificaciones') return [
      { id: 'cert-1', nombre: 'AWS Cloud Practitioner', entidad: 'Amazon', fecha: '2024-03-15', estado: 'obtenida' },
    ]
    return []
  },
  demoWrite: vi.fn(),
}))

describe('Formacion', () => {
  it('renders course title', () => {
    render(<Formacion />)
    expect(screen.getByText('React Avanzado')).toBeInTheDocument()
  })

  it('shows progress percentage', () => {
    render(<Formacion />)
    expect(screen.getByText(/68\s*%/)).toBeInTheDocument()
  })

  it('shows idiomas tab content', () => {
    render(<Formacion />)
    fireEvent.click(screen.getByText('Idiomas'))
    expect(screen.getByText('Inglés')).toBeInTheDocument()
  })

  it('shows certificaciones tab content', () => {
    render(<Formacion />)
    fireEvent.click(screen.getByText('Certificaciones'))
    expect(screen.getByText('AWS Cloud Practitioner')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/personal/__tests__/Formacion.test.jsx 2>&1 | tail -10
```

- [ ] **Step 3: Create `src/pages/app/modules/personal/Formacion.jsx`**

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const BLANK_CURSO = { titulo: '', plataforma: '', progreso: 0, fecha_limite: '', estado: 'activo' }
const BLANK_IDIOMA = { idioma: '', nivel: 'A1', metodo: '', objetivo: '' }
const BLANK_CERT = { nombre: '', entidad: '', fecha: '', estado: 'en_progreso' }

const NIVELES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Nativo']

export default function Formacion() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'personal'

  const [tab, setTab] = useState('cursos')
  const [cursos, setCursos] = useState(() => demoRead(appType, 'formacion_cursos') ?? [])
  const [idiomas, setIdiomas] = useState(() => demoRead(appType, 'formacion_idiomas') ?? [])
  const [certs, setCerts] = useState(() => demoRead(appType, 'formacion_certificaciones') ?? [])

  const [showCursoForm, setShowCursoForm] = useState(false)
  const [cursoForm, setCursoForm] = useState(BLANK_CURSO)
  const [showIdiomaForm, setShowIdiomaForm] = useState(false)
  const [idiomaForm, setIdiomaForm] = useState(BLANK_IDIOMA)
  const [showCertForm, setShowCertForm] = useState(false)
  const [certForm, setCertForm] = useState(BLANK_CERT)

  const saveCursos = (next) => { setCursos(next); demoWrite(appType, 'formacion_cursos', next) }
  const saveIdiomas = (next) => { setIdiomas(next); demoWrite(appType, 'formacion_idiomas', next) }
  const saveCerts = (next) => { setCerts(next); demoWrite(appType, 'formacion_certificaciones', next) }

  const addCurso = (e) => {
    e.preventDefault()
    if (!cursoForm.titulo.trim()) return
    saveCursos([...cursos, { ...cursoForm, id: crypto.randomUUID(), progreso: Number(cursoForm.progreso) }])
    setCursoForm(BLANK_CURSO)
    setShowCursoForm(false)
  }

  const addIdioma = (e) => {
    e.preventDefault()
    if (!idiomaForm.idioma.trim()) return
    saveIdiomas([...idiomas, { ...idiomaForm, id: crypto.randomUUID() }])
    setIdiomaForm(BLANK_IDIOMA)
    setShowIdiomaForm(false)
  }

  const addCert = (e) => {
    e.preventDefault()
    if (!certForm.nombre.trim()) return
    saveCerts([...certs, { ...certForm, id: crypto.randomUUID() }])
    setCertForm(BLANK_CERT)
    setShowCertForm(false)
  }

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      padding: '0.5rem 1rem', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
      background: tab === id ? 'var(--accent)' : 'var(--bg-card)',
      color: tab === id ? '#fff' : 'var(--text-muted)',
      border: tab === id ? 'none' : '1px solid var(--border)',
    }}>{label}</button>
  )

  const inputStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 680 }}>
      <h2 style={{ margin: '0 0 1.25rem' }}>Formación</h2>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {tabBtn('cursos', '📚 Cursos')}
        {tabBtn('idiomas', '🌍 Idiomas')}
        {tabBtn('certificaciones', '🏆 Certificaciones')}
      </div>

      {/* === CURSOS === */}
      {tab === 'cursos' && (
        <div>
          {cursos.map(c => (
            <div key={c.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem', opacity: c.estado === 'completado' ? 0.75 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{c.titulo}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {c.plataforma}
                    {c.fecha_limite && <span style={{ marginLeft: '0.75rem' }}>📅 {c.fecha_limite}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 6, fontWeight: 600,
                    background: c.estado === 'completado' ? '#22c55e22' : 'var(--accent)22',
                    color: c.estado === 'completado' ? '#22c55e' : 'var(--accent)' }}>
                    {c.estado}
                  </span>
                  <button onClick={() => saveCursos(cursos.filter(x => x.id !== c.id))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '0.9rem' }}>🗑</button>
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ flex: 1, background: 'var(--border)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${c.progreso}%`, height: '100%', background: c.estado === 'completado' ? '#22c55e' : 'var(--accent)', borderRadius: 999 }} />
                </div>
                <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 600, minWidth: 36, textAlign: 'right', color: 'var(--text-muted)' }}>{c.progreso} %</span>
              </div>
            </div>
          ))}
          {cursos.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin cursos registrados.</p>}

          {!showCursoForm ? (
            <button onClick={() => setShowCursoForm(true)}
              style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>
              + Añadir curso
            </button>
          ) : (
            <form onSubmit={addCurso} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <input placeholder="Título del curso" value={cursoForm.titulo} onChange={e => setCursoForm(f => ({ ...f, titulo: e.target.value }))} required style={inputStyle} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input placeholder="Plataforma (Udemy, etc)" value={cursoForm.plataforma} onChange={e => setCursoForm(f => ({ ...f, plataforma: e.target.value }))} style={inputStyle} />
                <select value={cursoForm.estado} onChange={e => setCursoForm(f => ({ ...f, estado: e.target.value }))} style={inputStyle}>
                  <option value="activo">Activo</option>
                  <option value="completado">Completado</option>
                  <option value="pausado">Pausado</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Progreso %</label>
                  <input type="range" min="0" max="100" value={cursoForm.progreso} onChange={e => setCursoForm(f => ({ ...f, progreso: Number(e.target.value) }))} style={{ width: '100%' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cursoForm.progreso}%</span>
                </div>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Fecha límite</label>
                  <input type="date" value={cursoForm.fecha_limite} onChange={e => setCursoForm(f => ({ ...f, fecha_limite: e.target.value }))} style={inputStyle} /></div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Añadir</button>
                <button type="button" onClick={() => { setShowCursoForm(false); setCursoForm(BLANK_CURSO) }}
                  style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* === IDIOMAS === */}
      {tab === 'idiomas' && (
        <div>
          {idiomas.map(i => (
            <div key={i.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>🌍</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{i.idioma}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Nivel: <strong>{i.nivel}</strong> → Objetivo: <strong>{i.objetivo}</strong>
                </div>
                {i.metodo && <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginTop: 2 }}>Método: {i.metodo}</div>}
              </div>
              <button onClick={() => saveIdiomas(idiomas.filter(x => x.id !== i.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>🗑</button>
            </div>
          ))}
          {idiomas.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin idiomas registrados.</p>}

          {!showIdiomaForm ? (
            <button onClick={() => setShowIdiomaForm(true)}
              style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>
              + Añadir idioma
            </button>
          ) : (
            <form onSubmit={addIdioma} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <input placeholder="Idioma" value={idiomaForm.idioma} onChange={e => setIdiomaForm(f => ({ ...f, idioma: e.target.value }))} required style={inputStyle} />
                <select value={idiomaForm.nivel} onChange={e => setIdiomaForm(f => ({ ...f, nivel: e.target.value }))} style={inputStyle}>
                  {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <select value={idiomaForm.objetivo} onChange={e => setIdiomaForm(f => ({ ...f, objetivo: e.target.value }))} style={inputStyle}>
                  {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <input placeholder="Método de aprendizaje" value={idiomaForm.metodo} onChange={e => setIdiomaForm(f => ({ ...f, metodo: e.target.value }))} style={inputStyle} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Añadir</button>
                <button type="button" onClick={() => { setShowIdiomaForm(false); setIdiomaForm(BLANK_IDIOMA) }}
                  style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* === CERTIFICACIONES === */}
      {tab === 'certificaciones' && (
        <div>
          {certs.map(c => (
            <div key={c.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>{c.estado === 'obtenida' ? '🏆' : '📋'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{c.nombre}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.entidad}{c.fecha ? ` · ${c.fecha}` : ''}</div>
              </div>
              <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 6, fontWeight: 600,
                background: c.estado === 'obtenida' ? '#22c55e22' : '#f59e0b22',
                color: c.estado === 'obtenida' ? '#22c55e' : '#f59e0b' }}>
                {c.estado === 'obtenida' ? 'Obtenida' : 'En progreso'}
              </span>
              <button onClick={() => saveCerts(certs.filter(x => x.id !== c.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>🗑</button>
            </div>
          ))}
          {certs.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin certificaciones registradas.</p>}

          {!showCertForm ? (
            <button onClick={() => setShowCertForm(true)}
              style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>
              + Añadir certificación
            </button>
          ) : (
            <form onSubmit={addCert} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input placeholder="Nombre certificación" value={certForm.nombre} onChange={e => setCertForm(f => ({ ...f, nombre: e.target.value }))} required style={inputStyle} />
                <input placeholder="Entidad (Amazon, Google...)" value={certForm.entidad} onChange={e => setCertForm(f => ({ ...f, entidad: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Fecha obtención</label>
                  <input type="date" value={certForm.fecha} onChange={e => setCertForm(f => ({ ...f, fecha: e.target.value }))} style={inputStyle} /></div>
                <select value={certForm.estado} onChange={e => setCertForm(f => ({ ...f, estado: e.target.value }))} style={{ ...inputStyle }}>
                  <option value="en_progreso">En progreso</option>
                  <option value="obtenida">Obtenida</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Añadir</button>
                <button type="button" onClick={() => { setShowCertForm(false); setCertForm(BLANK_CERT) }}
                  style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}

      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center' }}>
        💡 Demo — los cambios se guardan en esta sesión
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run src/pages/app/modules/personal/__tests__/Formacion.test.jsx 2>&1 | tail -10
```

- [ ] **Step 5: Commit**

```bash
cd /home/user/mi-portfolio-proyectos
git add src/pages/app/modules/personal/Formacion.jsx src/pages/app/modules/personal/__tests__/Formacion.test.jsx
git commit -m "feat: add Formacion module — cursos + progress bars, idiomas, certificaciones"
```

---

## Task 7: Nav + Routes — Wire All 5 New Modules

**Files:**
- Modify: `src/pages/app/DemoAppLayout.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Read both files** to understand current structure.

- [ ] **Step 2: Add 5 entries to `PERSONAL_MODULES` in `DemoAppLayout.jsx`** (after `documentacion`):

```js
{ path: 'deporte',    label: 'Deporte',    icon: '🏋️' },
{ path: 'vehiculos',  label: 'Vehículos',  icon: '🚗' },
{ path: 'mascotas',   label: 'Mascotas',   icon: '🐾' },
{ path: 'ropa',       label: 'Ropa',       icon: '👕' },
{ path: 'formacion',  label: 'Formación',  icon: '📚' },
```

- [ ] **Step 3: Add 5 lazy imports to `App.jsx`** (after existing PersonalDocumentacion):

```js
const PersonalDeporte   = React.lazy(() => import('./pages/app/modules/personal/Deporte'))
const PersonalVehiculos = React.lazy(() => import('./pages/app/modules/personal/Vehiculos'))
const PersonalMascotas  = React.lazy(() => import('./pages/app/modules/personal/Mascotas'))
const PersonalRopa      = React.lazy(() => import('./pages/app/modules/personal/Ropa'))
const PersonalFormacion = React.lazy(() => import('./pages/app/modules/personal/Formacion'))
```

- [ ] **Step 4: Add routes in BOTH personal route blocks** (search for `PersonalTrabajo` to find both locations — one under `/app/personal`, one under `/demo/:appType`):

```jsx
<Route path="deporte"   element={<PersonalDeporte />} />
<Route path="vehiculos" element={<PersonalVehiculos />} />
<Route path="mascotas"  element={<PersonalMascotas />} />
<Route path="ropa"      element={<PersonalRopa />} />
<Route path="formacion" element={<PersonalFormacion />} />
```

- [ ] **Step 5: Run full test suite**

```bash
cd /home/user/mi-portfolio-proyectos
npx vitest run 2>&1 | tail -20
```

Fix any regressions.

- [ ] **Step 6: Build check**

```bash
cd /home/user/mi-portfolio-proyectos
npm run build 2>&1 | tail -10
```

- [ ] **Step 7: Commit**

```bash
cd /home/user/mi-portfolio-proyectos
git add src/pages/app/DemoAppLayout.jsx src/App.jsx
git commit -m "feat: wire Deporte, Vehiculos, Mascotas, Ropa, Formacion into Personal nav and routes"
```
