# Fase 5 — App Personal: Trabajo, Salud y Documentación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ampliar la app Personal de la demo con tres nuevas secciones: Trabajo (info panel del horario laboral), Salud (contactos médicos + habit tracker diario), y Documentación (DNI/pasaporte/etc. con semáforo de caducidad).

**Architecture:** Tres nuevos componentes en `src/pages/app/modules/personal/`, que leen datos desde `demoRead(app.type ?? 'personal', key)`. Los datos se añaden a `personal.js`. Patrón idéntico a los módulos de Hogar: lazy `useState(() => demoRead(...))`, `demoWrite` en mutaciones. Rutas registradas en `/app/personal` y `/demo/:appType`. Nav flat (sin grupos) en PERSONAL_MODULES.

**Tech Stack:** React 18, React Router v6, `demoRead`/`demoWrite` (sessionStorage), tokens H3nky (`var(--accent)=#fe7000`, `var(--bg-card)`, `var(--border)`, `var(--text)`, `var(--text-muted)`, `var(--text-faint)`, `var(--font-body)`, `var(--font-mono)`), Vitest

---

## Archivos afectados

| Archivo | Acción | Qué cambia |
|---|---|---|
| `src/data/demo/personal.js` | Modificar | Añadir `trabajo`, `habitos`, `salud_contactos`, `documentacion` |
| `src/data/demo/index.js` | Modificar | Bump `DEMO_VERSION` de `'7'` a `'8'` |
| `src/data/demo/__tests__/personal.test.js` | Crear | Tests de contrato de los 4 nuevos keys |
| `src/pages/app/modules/personal/Trabajo.jsx` | Crear | Panel info laboral (read-only en demo) |
| `src/pages/app/modules/personal/Salud.jsx` | Crear | Contactos médicos + habit tracker con streaks |
| `src/pages/app/modules/personal/Documentacion.jsx` | Crear | Documentos con semáforo de caducidad + add/delete |
| `src/pages/app/DemoAppLayout.jsx` | Modificar | Añadir trabajo/salud/documentacion a PERSONAL_MODULES |
| `src/App.jsx` | Modificar | 3 lazy imports + rutas en `/app/personal` y `/demo/:appType` |

---

## Task 1: Demo data — trabajo, hábitos, salud_contactos, documentación

**Files:**
- Modify: `src/data/demo/personal.js`
- Modify: `src/data/demo/index.js`
- Create: `src/data/demo/__tests__/personal.test.js`

El archivo `personal.js` usa `fmt`, `fmtTs`, `hoy`, `addDays`, `subDays` (ya importados). La fecha de hoy se llama `hoy`.

- [ ] **Step 1: Añadir los 4 nuevos keys al final de `mockPersonal`**

En `src/data/demo/personal.js`, el objeto `mockPersonal` cierra después de `events`. Añadir antes del cierre `}`:

```js
  trabajo: {
    empresa: 'Startup Tech SL',
    municipio: 'Madrid',
    horario: {
      inicio: '09:00',
      fin: '18:00',
      modalidad: 'híbrido',
      dias: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
    },
    trayecto: { tiempo_min: 35, transporte: 'Metro + caminando' },
    trabaja_festivos: false,
  },

  habitos: [
    { id: 'hab-1', nombre: 'Beber 2L de agua', icono: '💧', racha: 5,  completado_hoy: true,  historial: [true,  true,  true,  true,  true,  false, true]  },
    { id: 'hab-2', nombre: 'Leer 20 min',       icono: '📚', racha: 12, completado_hoy: false, historial: [true,  true,  false, true,  true,  true,  true]  },
    { id: 'hab-3', nombre: 'Meditar',            icono: '🧘', racha: 3,  completado_hoy: false, historial: [false, true,  true,  true,  false, false, false] },
    { id: 'hab-4', nombre: 'Ejercicio 30 min',   icono: '🏃', racha: 0,  completado_hoy: false, historial: [false, false, true,  true,  false, true,  true]  },
    { id: 'hab-5', nombre: 'Sin alcohol',        icono: '🚫', racha: 8,  completado_hoy: true,  historial: [true,  true,  true,  true,  true,  true,  true]  },
  ],

  salud_contactos: [
    { id: 'sal-1', tipo: 'medico_cabecera', nombre: 'Dr. García López', centro: 'CS Retiro',         telefono: '915 234 567', ultima_visita: fmt(subDays(hoy, 45)),  proxima_visita: fmt(addDays(hoy, 135)), especialidad: null },
    { id: 'sal-2', tipo: 'dentista',        nombre: 'Dra. Martínez',    centro: 'Clínica Sonrisa',   telefono: '914 567 890', ultima_visita: fmt(subDays(hoy, 120)), proxima_visita: fmt(addDays(hoy, 20)),  especialidad: null },
    { id: 'sal-3', tipo: 'especialista',    nombre: 'Dr. Ruiz',         centro: 'Hospital La Paz',   telefono: '917 345 678', ultima_visita: fmt(subDays(hoy, 200)), proxima_visita: null,                   especialidad: 'Traumatología' },
  ],

  documentacion: [
    { id: 'doc-1', tipo: 'DNI',               numero: '12345678A',  caducidad: fmt(addDays(hoy, 730)),  notas: null },
    { id: 'doc-2', tipo: 'Pasaporte',          numero: 'AAB123456',  caducidad: fmt(subDays(hoy, 30)),   notas: 'Caducado — pedir cita' },
    { id: 'doc-3', tipo: 'Carnet de conducir', numero: 'B-12345678', caducidad: fmt(addDays(hoy, 1825)), notas: null },
    { id: 'doc-4', tipo: 'Tarjeta sanitaria',  numero: 'MAD-987654', caducidad: null,                   notas: 'Madrid' },
  ],
```

- [ ] **Step 2: Bump DEMO_VERSION**

En `src/data/demo/index.js`, cambiar:
```js
const DEMO_VERSION = '7'
```
a:
```js
const DEMO_VERSION = '8'
```

- [ ] **Step 3: Crear el test de contrato**

Crear `src/data/demo/__tests__/personal.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { initDemoData, demoRead } from '../index.js'

describe('personal demo data — Fase 5', () => {
  beforeEach(() => {
    sessionStorage.clear()
    initDemoData('personal')
  })

  it('trabajo has required fields', () => {
    const t = demoRead('personal', 'trabajo')
    expect(t).toHaveProperty('empresa')
    expect(t).toHaveProperty('municipio')
    expect(t).toHaveProperty('horario')
    expect(t.horario).toHaveProperty('inicio')
    expect(t.horario).toHaveProperty('fin')
    expect(t.horario).toHaveProperty('dias')
    expect(Array.isArray(t.horario.dias)).toBe(true)
    expect(t.horario.dias.length).toBeGreaterThan(0)
    expect(t).toHaveProperty('trayecto')
    expect(t.trayecto).toHaveProperty('tiempo_min')
  })

  it('habitos has valid items with required fields', () => {
    const h = demoRead('personal', 'habitos')
    expect(Array.isArray(h)).toBe(true)
    expect(h.length).toBeGreaterThan(0)
    h.forEach(hab => {
      expect(hab).toHaveProperty('id')
      expect(hab).toHaveProperty('nombre')
      expect(hab).toHaveProperty('icono')
      expect(hab).toHaveProperty('racha')
      expect(typeof hab.completado_hoy).toBe('boolean')
      expect(Array.isArray(hab.historial)).toBe(true)
    })
  })

  it('salud_contactos has valid items', () => {
    const c = demoRead('personal', 'salud_contactos')
    expect(Array.isArray(c)).toBe(true)
    expect(c.length).toBeGreaterThan(0)
    c.forEach(ct => {
      expect(ct).toHaveProperty('id')
      expect(ct).toHaveProperty('tipo')
      expect(ct).toHaveProperty('nombre')
      expect(ct).toHaveProperty('centro')
      expect(ct).toHaveProperty('telefono')
    })
  })

  it('documentacion has valid items and Pasaporte is expired', () => {
    const d = demoRead('personal', 'documentacion')
    expect(Array.isArray(d)).toBe(true)
    expect(d.length).toBeGreaterThan(0)
    d.forEach(doc => {
      expect(doc).toHaveProperty('id')
      expect(doc).toHaveProperty('tipo')
      expect(doc).toHaveProperty('numero')
    })
    const pasaporte = d.find(doc => doc.tipo === 'Pasaporte')
    expect(pasaporte).toBeDefined()
    expect(new Date(pasaporte.caducidad) < new Date()).toBe(true)
  })
})
```

- [ ] **Step 4: Correr todos los tests**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run src/data/demo/__tests__/
```

Expected: Todos los tests pasan (incluyendo los 4 de `personal.test.js`, los 4 de `comparticion.test.js` y los 5 de `initDemoData.test.js`).

- [ ] **Step 5: Commit**

```bash
git add src/data/demo/personal.js src/data/demo/index.js src/data/demo/__tests__/personal.test.js
git commit -m "feat(demo): add personal Fase 5 data — trabajo, habitos, salud, documentacion"
```

---

## Task 2: Trabajo.jsx — panel info laboral

**Files:**
- Create: `src/pages/app/modules/personal/Trabajo.jsx`

Panel de solo lectura que muestra la configuración laboral. Usa `demoRead` para leer el objeto `trabajo`. No hay mutaciones (no usa `demoWrite`). El objeto `trabajo` NO es un array — usar guard `Array.isArray`.

- [ ] **Step 1: Crear Trabajo.jsx**

Crear `src/pages/app/modules/personal/Trabajo.jsx`:

```jsx
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../../contexts/ModeContext'
import { demoRead } from '../../../../data/demo/index.js'

const DIAS_LABEL = {
  lunes: 'L', martes: 'M', miércoles: 'X',
  jueves: 'J', viernes: 'V', sábado: 'S', domingo: 'D',
}
const TODOS_DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

export default function Trabajo() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const raw    = mode === 'demo' ? demoRead(app.type ?? 'personal', 'trabajo') : null
  const trabajo = Array.isArray(raw) ? null : raw

  if (!trabajo) return (
    <div style={{ padding: '20px', maxWidth: 560 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>💼 Trabajo</h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
        Configura tu horario laboral para ver los bloques de trabajo en el Calendario.
      </p>
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>💼 Trabajo</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
          Tu configuración laboral. Los bloques aparecen en el Calendario.
        </p>
      </div>

      {/* Empresa */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <span style={{ fontSize: 32 }}>🏢</span>
        <div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{trabajo.empresa}</p>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>📍 {trabajo.municipio}</p>
        </div>
      </div>

      {/* Horario */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          Horario
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text)' }}>Horas</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            {trabajo.horario.inicio} – {trabajo.horario.fin}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text)' }}>Modalidad</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', textTransform: 'capitalize' }}>
            {trabajo.horario.modalidad}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text)' }}>Días</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {TODOS_DIAS.map(d => {
              const activo = trabajo.horario.dias.includes(d)
              return (
                <span key={d} style={{
                  width: 24, height: 24, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                  background: activo ? 'var(--accent)' : 'var(--bg)',
                  color: activo ? '#fff' : 'var(--text-faint)',
                  border: `1px solid ${activo ? 'var(--accent)' : 'var(--border)'}`,
                }}>
                  {DIAS_LABEL[d]}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* Trayecto */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          Trayecto
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text)' }}>Tiempo estimado</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{trabajo.trayecto.tiempo_min} min</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text)' }}>Transporte</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{trabajo.trayecto.transporte}</span>
        </div>
      </div>

      {/* Demo note */}
      {mode === 'demo' && (
        <p style={{ fontSize: 12, color: 'var(--text-faint)', fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
          En la demo los datos son de ejemplo. En producción configurarías tu propio horario.
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Correr tests**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run
```

Expected: Todos los tests pasan.

- [ ] **Step 3: Commit**

```bash
git add src/pages/app/modules/personal/Trabajo.jsx
git commit -m "feat(personal): add Trabajo module — work schedule info panel"
```

---

## Task 3: Salud.jsx — contactos médicos + habit tracker

**Files:**
- Create: `src/pages/app/modules/personal/Salud.jsx`

Dos secciones en un mismo componente:
1. **Contactos médicos** — cards de médico/dentista/especialista con alerta si próxima visita es en < 30 días.
2. **Hábitos** — lista diaria con botón toggle (circle), racha (🔥 N), y 7 dots de historial. Toggle actualiza `completado_hoy` y `racha` (ajusta ±1). Persiste en sessionStorage.

- [ ] **Step 1: Crear Salud.jsx**

Crear `src/pages/app/modules/personal/Salud.jsx`:

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../../contexts/ModeContext'
import { demoRead, demoWrite } from '../../../../data/demo/index.js'

const TIPO_CONFIG = {
  medico_cabecera: { label: 'Médico de cabecera', icono: '👨‍⚕️' },
  dentista:        { label: 'Dentista',            icono: '🦷'    },
  especialista:    { label: 'Especialista',        icono: '🏥'    },
}

function diasHasta(fechaStr) {
  if (!fechaStr) return null
  return Math.round((new Date(fechaStr) - new Date()) / (1000 * 60 * 60 * 24))
}

export default function Salud() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const [contactos] = useState(() =>
    mode === 'demo' ? (demoRead(app.type ?? 'personal', 'salud_contactos') ?? []) : []
  )

  const [habitos, setHabitos] = useState(() =>
    mode === 'demo' ? (demoRead(app.type ?? 'personal', 'habitos') ?? []) : []
  )

  function toggleHabito(id) {
    setHabitos(prev => {
      const next = prev.map(h => {
        if (h.id !== id) return h
        const completado_hoy = !h.completado_hoy
        const racha = completado_hoy ? h.racha + 1 : Math.max(0, h.racha - 1)
        return { ...h, completado_hoy, racha }
      })
      if (mode === 'demo') demoWrite(app.type ?? 'personal', 'habitos', next)
      return next
    })
  }

  const completadosHoy = habitos.filter(h => h.completado_hoy).length
  const todosCompletos = habitos.length > 0 && completadosHoy === habitos.length

  return (
    <div style={{ padding: '20px', maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>🏥 Salud</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
          Contactos médicos y seguimiento diario de hábitos
        </p>
      </div>

      {/* Contactos */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            Contactos médicos
          </p>
        </div>
        {contactos.length === 0 ? (
          <p style={{ margin: 0, padding: '16px 20px', fontSize: 13, color: 'var(--text-faint)' }}>Sin contactos registrados</p>
        ) : contactos.map((c, i) => {
          const cfg = TIPO_CONFIG[c.tipo] ?? { label: c.tipo, icono: '👤' }
          const diasProx = diasHasta(c.proxima_visita)
          const alertaProx = diasProx !== null && diasProx < 30
          return (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 20px',
              borderBottom: i < contactos.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{cfg.icono}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{c.nombre}</p>
                <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                  {cfg.label}{c.especialidad ? ` · ${c.especialidad}` : ''} · {c.centro}
                </p>
                {c.proxima_visita && (
                  <p style={{ margin: '3px 0 0', fontSize: 11, color: alertaProx ? '#f59e0b' : 'var(--text-faint)' }}>
                    {alertaProx ? '⚠️ ' : ''}Próxima: {c.proxima_visita}
                  </p>
                )}
              </div>
              <a href={`tel:${c.telefono}`}
                style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', flexShrink: 0, marginTop: 2 }}>
                📞 {c.telefono}
              </a>
            </div>
          )
        })}
      </div>

      {/* Hábitos */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{
          padding: '12px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            Hábitos de hoy
          </p>
          <span style={{ fontSize: 12, fontWeight: 700, color: todosCompletos ? '#22c55e' : 'var(--text-muted)' }}>
            {completadosHoy}/{habitos.length}
          </span>
        </div>
        {habitos.length === 0 ? (
          <p style={{ margin: 0, padding: '16px 20px', fontSize: 13, color: 'var(--text-faint)' }}>Sin hábitos configurados</p>
        ) : habitos.map((h, i) => (
          <div key={h.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 20px',
            borderBottom: i < habitos.length - 1 ? '1px solid var(--border)' : 'none',
            opacity: h.completado_hoy ? 0.7 : 1,
            transition: 'opacity .2s',
          }}>
            {/* Toggle */}
            <button
              onClick={() => toggleHabito(h.id)}
              style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${h.completado_hoy ? '#22c55e' : 'var(--border)'}`,
                background: h.completado_hoy ? '#22c55e' : 'transparent',
                color: '#fff', cursor: 'pointer', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .15s',
              }}
            >
              {h.completado_hoy ? '✓' : ''}
            </button>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{h.icono}</span>
            <span style={{
              flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text)',
              textDecoration: h.completado_hoy ? 'line-through' : 'none',
            }}>
              {h.nombre}
            </span>
            {/* Historial (últimos 7 días como dots) */}
            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              {(h.historial ?? []).slice(-7).map((done, idx) => (
                <div key={idx} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: done ? '#22c55e' : 'var(--border)',
                }} />
              ))}
            </div>
            {/* Racha */}
            {h.racha > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', flexShrink: 0 }}>
                🔥 {h.racha}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Correr tests**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run
```

Expected: Todos los tests pasan.

- [ ] **Step 3: Commit**

```bash
git add src/pages/app/modules/personal/Salud.jsx
git commit -m "feat(personal): add Salud module — medical contacts and daily habit tracker"
```

---

## Task 4: Documentacion.jsx — documentos con semáforo y formulario

**Files:**
- Create: `src/pages/app/modules/personal/Documentacion.jsx`

Lista de documentos (DNI, pasaporte, carnet, etc.) con semáforo de caducidad. Permite añadir nuevos y eliminar. Persiste en sessionStorage.

**Semáforo de caducidad:**
- `null` → gris, "Sin fecha"
- `dias < 0` → rojo, "Caducado hace Nd" + borde rojo
- `dias < 60` → ámbar, "Caduca en Nd" + borde ámbar
- `dias >= 60` → verde, "Válido Nd" (borde normal)

- [ ] **Step 1: Crear Documentacion.jsx**

Crear `src/pages/app/modules/personal/Documentacion.jsx`:

```jsx
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../../contexts/ModeContext'
import { demoRead, demoWrite } from '../../../../data/demo/index.js'

const TIPOS_DOC = ['DNI', 'Pasaporte', 'Carnet de conducir', 'Tarjeta sanitaria', 'Otros']

function diasHasta(fechaStr) {
  if (!fechaStr) return null
  return Math.round((new Date(fechaStr) - new Date()) / (1000 * 60 * 60 * 24))
}

function semaforo(dias) {
  if (dias === null) return { color: 'var(--text-faint)', label: 'Sin fecha',           border: 'var(--border)',          bg: 'var(--bg-card)' }
  if (dias < 0)     return { color: '#ef4444',           label: `Caducado hace ${Math.abs(dias)}d`, border: 'rgba(239,68,68,.4)',  bg: 'rgba(239,68,68,.05)' }
  if (dias < 60)    return { color: '#f59e0b',           label: `Caduca en ${dias}d`,  border: 'rgba(245,158,11,.4)',    bg: 'rgba(245,158,11,.05)' }
  return              { color: '#22c55e',           label: `Válido ${dias}d`,    border: 'var(--border)',          bg: 'var(--bg-card)' }
}

export default function Documentacion() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const [docs, setDocs] = useState(() =>
    mode === 'demo' ? (demoRead(app.type ?? 'personal', 'documentacion') ?? []) : []
  )
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ tipo: 'DNI', numero: '', caducidad: '', notas: '' })

  function handleAdd() {
    const nuevo = {
      id: crypto.randomUUID(),
      tipo: form.tipo,
      numero: form.numero.trim() || '—',
      caducidad: form.caducidad || null,
      notas: form.notas.trim() || null,
    }
    const next = [...docs, nuevo]
    setDocs(next)
    if (mode === 'demo') demoWrite(app.type ?? 'personal', 'documentacion', next)
    setForm({ tipo: 'DNI', numero: '', caducidad: '', notas: '' })
    setShowAdd(false)
  }

  function eliminar(id) {
    const next = docs.filter(d => d.id !== id)
    setDocs(next)
    if (mode === 'demo') demoWrite(app.type ?? 'personal', 'documentacion', next)
  }

  const caducados = docs.filter(d => { const n = diasHasta(d.caducidad); return n !== null && n < 0 }).length
  const proximos  = docs.filter(d => { const n = diasHasta(d.caducidad); return n !== null && n >= 0 && n < 60 }).length

  return (
    <div style={{ padding: '20px', maxWidth: 580, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>📄 Documentación</h1>
          <p style={{ fontSize: 13, margin: '4px 0 0',
            color: caducados > 0 ? '#ef4444' : proximos > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
            {caducados > 0
              ? `⚠️ ${caducados} doc${caducados !== 1 ? 's' : ''} caducado${caducados !== 1 ? 's' : ''}`
              : proximos > 0
              ? `⏰ ${proximos} próximo${proximos !== 1 ? 's' : ''} a caducar`
              : `${docs.length} documentos`}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(p => !p)}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, flexShrink: 0 }}
        >+ Añadir</button>
      </div>

      {/* Formulario */}
      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Nuevo documento</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
              {TIPOS_DOC.map(t => <option key={t}>{t}</option>)}
            </select>
            <input value={form.numero} onChange={e => setForm(p => ({ ...p, numero: e.target.value }))}
              placeholder="Número / identificador"
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Caducidad</label>
                <input type="date" value={form.caducidad} onChange={e => setForm(p => ({ ...p, caducidad: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Notas</label>
                <input value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
                  placeholder="Opcional"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                Cancelar
              </button>
              <button onClick={handleAdd}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {docs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>📄</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin documentos</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Añade tus documentos importantes para recibir alertas de caducidad
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {docs.map(d => {
            const dias = diasHasta(d.caducidad)
            const sem  = semaforo(dias)
            return (
              <div key={d.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 12,
                background: sem.bg, border: `1px solid ${sem.border}`,
              }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>📄</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{d.tipo}</p>
                  <p style={{ margin: '1px 0 0', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {d.numero}
                  </p>
                  {d.notas && (
                    <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>{d.notas}</p>
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: sem.color, flexShrink: 0 }}>
                  {sem.label}
                </span>
                <button className="del-btn" onClick={() => eliminar(d.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s', marginLeft: 4 }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ef4444' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)' }}
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

- [ ] **Step 2: Correr tests**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run
```

Expected: Todos los tests pasan.

- [ ] **Step 3: Commit**

```bash
git add src/pages/app/modules/personal/Documentacion.jsx
git commit -m "feat(personal): add Documentacion module — docs with expiry semaphore and add/delete"
```

---

## Task 5: Nav + routing — añadir trabajo/salud/documentacion al Personal

**Files:**
- Modify: `src/pages/app/DemoAppLayout.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Actualizar PERSONAL_MODULES en DemoAppLayout.jsx**

En `src/pages/app/DemoAppLayout.jsx`, encontrar la constante `PERSONAL_MODULES`:

```js
const PERSONAL_MODULES = [
  { path: 'calendar', label: 'Calendario', icon: '📅' },
  { path: 'notas',    label: 'Notas',      icon: '📝' },
  { path: 'tareas',   label: 'Tareas',     icon: '✅' },
  { path: 'ideas',    label: 'Ideas',      icon: '💡' },
]
```

Reemplazar con:

```js
const PERSONAL_MODULES = [
  { path: 'calendar',      label: 'Calendario',    icon: '📅' },
  { path: 'notas',         label: 'Notas',         icon: '📝' },
  { path: 'tareas',        label: 'Tareas',        icon: '✅' },
  { path: 'ideas',         label: 'Ideas',         icon: '💡' },
  { path: 'trabajo',       label: 'Trabajo',       icon: '💼' },
  { path: 'salud',         label: 'Salud',         icon: '🏥' },
  { path: 'documentacion', label: 'Documentación', icon: '📄' },
]
```

- [ ] **Step 2: Añadir lazy imports en App.jsx**

En `src/App.jsx`, después de las líneas que importan `PersonalNotas`, `PersonalTareas`, `PersonalIdeas` (alrededor de las líneas 49-51):

```js
const PersonalNotas  = React.lazy(() => import('./pages/app/modules/personal/Notas'))
const PersonalTareas = React.lazy(() => import('./pages/app/modules/personal/Tareas'))
const PersonalIdeas  = React.lazy(() => import('./pages/app/modules/personal/Ideas'))
```

Añadir inmediatamente después:

```js
const PersonalTrabajo       = React.lazy(() => import('./pages/app/modules/personal/Trabajo'))
const PersonalSalud         = React.lazy(() => import('./pages/app/modules/personal/Salud'))
const PersonalDocumentacion = React.lazy(() => import('./pages/app/modules/personal/Documentacion'))
```

- [ ] **Step 3: Añadir rutas en `/app/personal`**

En `src/App.jsx`, dentro del bloque de rutas `/app/personal`, después de la ruta `ideas`:

```jsx
<Route path="trabajo"       element={<PersonalTrabajo />} />
<Route path="salud"         element={<PersonalSalud />} />
<Route path="documentacion" element={<PersonalDocumentacion />} />
```

- [ ] **Step 4: Añadir rutas en `/demo/:appType`**

En `src/App.jsx`, dentro del bloque de rutas `/demo/:appType`, después de la ruta `ideas`:

```jsx
<Route path="trabajo"       element={<PersonalTrabajo />} />
<Route path="salud"         element={<PersonalSalud />} />
<Route path="documentacion" element={<PersonalDocumentacion />} />
```

- [ ] **Step 5: Correr todos los tests**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run
```

Expected: Todos los tests pasan.

- [ ] **Step 6: Commit**

```bash
git add src/pages/app/DemoAppLayout.jsx src/App.jsx
git commit -m "feat(personal): add Trabajo/Salud/Documentacion nav entries and routes"
```

---

## Self-Review

**Spec coverage** (§4 de `2026-05-13-plataforma-vida-design.md`):
- ✅ §4.1 Trabajo — horario, municipio, trayecto, modalidad → `Trabajo.jsx`
- ✅ §4.2 Salud — médico/dentista/especialista contactos → sección contactos en `Salud.jsx`
- ✅ §4.2 Hábitos — habit tracker diario con racha → sección hábitos en `Salud.jsx`
- ✅ §4.8 Documentación — DNI/pasaporte/carnet/tarjeta con alerta caducidad → `Documentacion.jsx`
- ⏩ §4.3 Deporte — fuera de scope (complejidad alta, queda como Próximamente)
- ⏩ §4.4 Vehículos — ya existe como app separada
- ⏩ §4.5 Mascotas — ya existe como app separada
- ⏩ §4.6 Ropa, §4.7 Formación — fuera de scope esta iteración

**Placeholder scan:** Ninguno. Todo el código está completo.

**Type consistency:**
- `demoRead(app.type ?? 'personal', key)` — usado consistentemente en los 3 componentes
- `diasHasta(fechaStr)` — definida localmente en Salud.jsx y Documentacion.jsx (ambas con la misma implementación — no se comparte para evitar dependencias entre módulos)
- `app.type ?? 'personal'` — fallback correcto para el app personal
- `Array.isArray(raw)` guard — aplicado solo en Trabajo.jsx (objeto); Salud y Documentacion leen arrays, que ya devuelven `[]` si no existen
