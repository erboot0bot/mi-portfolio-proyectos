# Fase 1 — Navegación agrupada de Hogar + renombrar Inventario → Despensa

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructurar la navegación de la app Hogar de lista plana a 4 grupos (Cocina, Limpieza, Espacios, Casa), y renombrar la ruta `inventario` → `despensa` como primer paso del split de almacenamiento.

**Architecture:** Se añaden dos constantes nuevas (`HOGAR_GROUPS`, campo `group` en `HOGAR_MODULES`) y se actualiza el renderizado del nav en `DemoAppLayout.jsx` para mostrar headers de grupo solo cuando `appType === 'hogar'`. El resto de apps no se tocan. La ruta `inventario` se renombra a `despensa` con una redirección para no romper URLs antiguas.

**Tech Stack:** React 18, React Router v6, Tailwind CSS, design tokens CSS (var(--font-tech), var(--text-faint), var(--accent))

---

## Archivos afectados

| Archivo | Acción | Qué cambia |
|---|---|---|
| `src/pages/app/DemoAppLayout.jsx` | Modificar | HOGAR_MODULES con campo `group`, nueva constante HOGAR_GROUPS, nav agrupada |
| `src/App.jsx` | Modificar | Ruta `inventario` → `despensa`, redirect de URL antigua |

---

## Task 1: Añadir campo `group` a HOGAR_MODULES y definir HOGAR_GROUPS

**Files:**
- Modify: `src/pages/app/DemoAppLayout.jsx:16-22`

- [ ] **Paso 1.1 — Reemplazar HOGAR_MODULES y añadir HOGAR_GROUPS**

Localizar el bloque actual (líneas 16-22):
```js
const HOGAR_MODULES = [
  { path: 'shopping',   label: 'Lista',       icon: '🛒' },
  { path: 'menu',       label: 'Menú',        icon: '🍽️' },
  { path: 'recipes',    label: 'Recetas',     icon: '👨‍🍳' },
  { path: 'inventario', label: 'Inventario',  icon: '📦' },
  { path: 'limpieza',   label: 'Limpieza',    icon: '🧹' },
]
```

Reemplazar con:
```js
const HOGAR_GROUPS = [
  { key: 'cocina',   label: 'Cocina',   icon: '🍳' },
  { key: 'limpieza', label: 'Limpieza', icon: '🧹' },
  { key: 'espacios', label: 'Espacios', icon: '📦' },
  { key: 'casa',     label: 'Casa',     icon: '🔧' },
]

const HOGAR_MODULES = [
  // ── Cocina ──────────────────────────────────
  { path: 'menu',      label: 'Menú',     icon: '🍽️', group: 'cocina' },
  { path: 'recipes',   label: 'Recetas',  icon: '👨‍🍳', group: 'cocina' },
  { path: 'despensa',  label: 'Despensa', icon: '🥫',  group: 'cocina' },
  { path: 'shopping',  label: 'Lista',    icon: '🛒',  group: 'cocina' },
  // ── Limpieza ─────────────────────────────────
  { path: 'limpieza',  label: 'Tareas',   icon: '🧹',  group: 'limpieza' },
]
```

- [ ] **Paso 1.2 — Actualizar FULL_LAYOUT_MODULES** (línea 46 del archivo original)

Cambiar:
```js
const FULL_LAYOUT_MODULES = ['calendar', 'shopping', 'menu', 'recipes', 'inventario', 'limpieza']
```

Por:
```js
const FULL_LAYOUT_MODULES = ['calendar', 'shopping', 'menu', 'recipes', 'despensa', 'limpieza']
```

- [ ] **Paso 1.3 — Verificar en navegador**

Abrir `http://localhost:5173/demo/hogar/menu` — la nav lateral debe seguir mostrando los módulos (aún sin agrupar). El cambio de datos es preparatorio para el Task 2.

- [ ] **Paso 1.4 — Commit**

```bash
git add src/pages/app/DemoAppLayout.jsx
git commit -m "refactor(hogar): añadir grupos y renombrar inventario→despensa en HOGAR_MODULES"
```

---

## Task 2: Renderizado agrupado en el sidebar desktop

**Files:**
- Modify: `src/pages/app/DemoAppLayout.jsx:137-154` (bloque `<nav>` desktop)

- [ ] **Paso 2.1 — Reemplazar el nav desktop**

Localizar este bloque (dentro del `<aside>` desktop):
```jsx
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
```

Reemplazar con:
```jsx
<nav className="flex flex-col gap-0">
  {appType === 'hogar' ? (
    HOGAR_GROUPS.map(group => {
      const items = modules.filter(m => m.group === group.key)
      return (
        <div key={group.key} style={{ marginBottom: 4 }}>
          {/* Group header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 12px 3px',
            fontSize: 10,
            fontFamily: 'var(--font-tech)',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
          }}>
            <span style={{ fontSize: 12 }}>{group.icon}</span>
            {group.label}
          </div>
          {/* Items */}
          {items.length > 0 ? items.map(m => (
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
          )) : (
            <div style={{
              padding: '4px 12px 6px 32px',
              fontSize: 11,
              color: 'var(--text-faint)',
              fontStyle: 'italic',
              fontFamily: 'var(--font-body)',
            }}>
              Próximamente
            </div>
          )}
        </div>
      )
    })
  ) : (
    modules.map(m => (
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
    ))
  )}
</nav>
```

- [ ] **Paso 2.2 — Verificar en navegador (desktop)**

Abrir `http://localhost:5173/demo/hogar/menu` en pantalla ≥ 768px.
Debe verse:
```
🍳 COCINA
  🍽️ Menú
  👨‍🍳 Recetas
  🥫 Despensa
  🛒 Lista
🧹 LIMPIEZA
  🧹 Tareas
📦 ESPACIOS
  Próximamente
🔧 CASA
  Próximamente
```
Verificar que `Finanzas` y `Personal` siguen mostrando la lista plana sin grupos.

- [ ] **Paso 2.3 — Commit**

```bash
git add src/pages/app/DemoAppLayout.jsx
git commit -m "feat(hogar): nav desktop con grupos Cocina/Limpieza/Espacios/Casa"
```

---

## Task 3: Renderizado agrupado en el nav mobile

**Files:**
- Modify: `src/pages/app/DemoAppLayout.jsx:102-124` (bloque nav mobile)

- [ ] **Paso 3.1 — Reemplazar el nav mobile**

Localizar este bloque (dentro del `<div className="flex flex-col md:hidden ...">` mobile):
```jsx
{modules.length > 1 && (
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
)}
```

Reemplazar con:
```jsx
{modules.length > 1 && (
  <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
    {appType === 'hogar' ? (
      HOGAR_GROUPS.map(group => {
        const items = modules.filter(m => m.group === group.key)
        return (
          <div key={group.key}>
            {/* Group label */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 4px 3px',
              fontSize: 10,
              fontFamily: 'var(--font-tech)',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
            }}>
              <span style={{ fontSize: 12 }}>{group.icon}</span>
              {group.label}
            </div>
            {/* Items */}
            {items.length > 0 ? items.map(m => (
              <NavLink
                key={m.path}
                to={m.path}
                className={({ isActive }) => isActive ? 'module-card active' : 'module-card'}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 12,
                  height: 52, padding: '0 16px', borderRadius: 10,
                  background: 'var(--bg-card)',
                  border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                  borderLeft: isActive ? '3px solid var(--accent)' : '1px solid var(--border)',
                  textDecoration: 'none', transition: 'all var(--transition)',
                  marginBottom: 3,
                })}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{m.icon}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{m.label}</span>
                <span style={{ color: 'var(--text-faint)', fontSize: 16 }}>›</span>
              </NavLink>
            )) : (
              <div style={{
                height: 40, display: 'flex', alignItems: 'center',
                padding: '0 16px', marginBottom: 3,
                border: '1px dashed var(--border)', borderRadius: 10,
                fontSize: 12, color: 'var(--text-faint)', fontStyle: 'italic',
              }}>
                Próximamente
              </div>
            )}
          </div>
        )
      })
    ) : (
      modules.map(m => (
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
      ))
    )}
  </nav>
)}
```

- [ ] **Paso 3.2 — Verificar en navegador (mobile)**

Reducir ventana a < 768px. Abrir `http://localhost:5173/demo/hogar`.
Debe verse los grupos con sus labels y el placeholder "Próximamente" para Espacios y Casa.
Verificar que otras apps (Finanzas, Personal) siguen mostrando lista plana.

- [ ] **Paso 3.3 — Commit**

```bash
git add src/pages/app/DemoAppLayout.jsx
git commit -m "feat(hogar): nav mobile con grupos, próximamente en grupos vacíos"
```

---

## Task 4: Renombrar ruta `inventario` → `despensa` en App.jsx

**Files:**
- Modify: `src/App.jsx:238` (ruta inventario)

- [ ] **Paso 4.1 — Cambiar ruta + añadir redirect**

Localizar (línea ~238):
```jsx
<Route path="inventario" element={<Inventario />} />
```

Reemplazar con:
```jsx
<Route path="despensa"   element={<Inventario />} />
<Route path="inventario" element={<Navigate to="../despensa" replace />} />
```

El componente `Inventario.jsx` mantiene su nombre por ahora — en una fase posterior se dividirá en Nevera/Congelador/Despensa. El redirect garantiza que cualquier URL antigua `/demo/hogar/inventario` redirige automáticamente.

- [ ] **Paso 4.2 — Verificar redirect**

Navegar a `http://localhost:5173/demo/hogar/inventario` — debe redirigir a `/demo/hogar/despensa` y mostrar el componente correctamente.

Navegar a `http://localhost:5173/demo/hogar/despensa` — debe cargar directo.

Navegar a `http://localhost:5173/demo/hogar/menu` desde el nuevo nav — el item "Despensa" en el sidebar debe estar activo cuando se está en `/demo/hogar/despensa`.

- [ ] **Paso 4.3 — Ejecutar tests**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run --reporter=verbose 2>&1 | tail -30
```

Esperado: todos los tests existentes en verde. No hay tests específicos de navegación de Hogar que fallen.

- [ ] **Paso 4.4 — Commit**

```bash
git add src/App.jsx
git commit -m "refactor(hogar): ruta inventario→despensa con redirect de compatibilidad"
```

---

## Verificación final

- [ ] `http://localhost:5173/demo/hogar` — dashboard home carga, nav agrupada visible
- [ ] `http://localhost:5173/demo/hogar/menu` — nav muestra "Menú" activo bajo grupo Cocina
- [ ] `http://localhost:5173/demo/hogar/despensa` — carga Inventario (renombrado), nav muestra "Despensa" activo
- [ ] `http://localhost:5173/demo/hogar/inventario` — redirige a despensa
- [ ] `http://localhost:5173/demo/finanzas/resumen` — nav plana sin grupos, sin cambios
- [ ] `http://localhost:5173/demo/personal/notas` — nav plana sin grupos, sin cambios
- [ ] Mobile (< 768px) en `/demo/hogar` — grupos visibles con "Próximamente" para Espacios y Casa
- [ ] `npx vitest run` — todos los tests pasan
