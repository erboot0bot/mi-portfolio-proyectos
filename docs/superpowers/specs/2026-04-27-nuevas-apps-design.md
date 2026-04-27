# Nuevas Apps — Personal, Vehículo, Finanzas

**Fecha:** 2026-04-27  
**Estado:** Aprobado

---

## Objetivo

Implementar tres nuevas apps funcionales dentro del sistema existente de portfolio/apps, siguiendo los patrones establecidos (AppLayout, Supabase RLS, `user_owns_project`).

---

## Arquitectura general

Cada app sigue el patrón ya establecido:
- Un registro en la tabla `projects` (owner_id, name, slug, icon)
- AppLayout carga ese registro y lo inyecta como `app` en el contexto del Outlet
- Los módulos de cada app usan `app.id` como `app_id` en sus queries
- RLS con `user_owns_project(app_id)` en todas las tablas de dominio

---

## App 1 — Personal (`/app/personal`)

### Descripción
App de productividad personal: agenda, notas rápidas, tareas pendientes y captura de ideas.

### Módulos y rutas
```
/app/personal/calendar     → Reutiliza Calendar.jsx (event_type: 'task', app_id del proyecto personal)
/app/personal/notas        → Notas rápidas con color y pin
/app/personal/tareas       → To-do list con prioridad y fecha límite
/app/personal/ideas        → Captura de ideas con tags
```

### AppLayout changes
- `APP_NAMES.personal = 'Personal'`
- `APP_ICONS.personal = '🗂️'`
- `PERSONAL_MODULES = [calendar, notas, tareas, ideas]`
- `FULL_LAYOUT_MODULES` — **no se modifica**: `calendar` ya está; notas/tareas/ideas usan el sidebar estándar de AppLayout

### Tablas nuevas

**`personal_notes`**
```sql
id         UUID PK
app_id     UUID REFERENCES projects(id) ON DELETE CASCADE
title      TEXT NOT NULL DEFAULT 'Sin título'
content    TEXT DEFAULT ''
color      TEXT DEFAULT '#f59e0b'   -- hex, paleta de 6 colores
pinned     BOOLEAN DEFAULT false
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
```

**`personal_tasks`**
```sql
id           UUID PK
app_id       UUID REFERENCES projects(id) ON DELETE CASCADE
title        TEXT NOT NULL
description  TEXT
due_date     DATE
priority     TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high'))
status       TEXT DEFAULT 'pending' CHECK(status IN ('pending','done'))
completed_at TIMESTAMPTZ
created_at   TIMESTAMPTZ DEFAULT NOW()
```

**`personal_ideas`**
```sql
id          UUID PK
app_id      UUID REFERENCES projects(id) ON DELETE CASCADE
title       TEXT NOT NULL
description TEXT DEFAULT ''
tags        TEXT[] DEFAULT '{}'
created_at  TIMESTAMPTZ DEFAULT NOW()
```

### UI — Notas
- Grid de tarjetas (2 cols mobile, 3 cols desktop) con fondo de color
- Tarjetas pinneadas aparecen primero
- Click abre modal inline para editar título + contenido (textarea autoexpandible)
- Botón "+" flotante para crear nota nueva
- Colores disponibles: amber, sky, emerald, violet, rose, slate

### UI — Tareas
- Lista agrupada en dos secciones: **Pendientes** | **Completadas**
- Cada tarea muestra prioridad (dot de color: rojo/naranja/gris), título, fecha límite
- Checkbox para marcar hecha (animación strike-through)
- Formulario inline para añadir: título + prioridad + fecha opcional
- Tareas vencidas muestran la fecha en rojo

### UI — Ideas
- Lista de tarjetas compactas con título, descripción truncada y chips de tags
- Formulario de añadir con campo de tags (enter para añadir tag)
- Búsqueda por texto en título/descripción

---

## App 2 — Vehículo (`/app/vehiculo`)

### Descripción
Gestión de uno o más vehículos (coches y motos): perfil, repostajes, mantenimiento, gastos varios y estadísticas.

### Módulos y rutas
```
/app/vehiculo/mis-vehiculos              → Lista de vehículos registrados
/app/vehiculo/mis-vehiculos/:vehicleId   → Detalle (nested outlet)
  /repostajes                            → Log de repostajes + consumo medio
  /mantenimiento                         → Historial + próximas revisiones
  /gastos                                → Gastos varios (seguro, multa, parking)
  /estadisticas                          → Dashboard coste/km, gasto total, consumo
```

### AppLayout changes
- `VEHICULO_MODULES = [{ path: 'mis-vehiculos', label: 'Mis Vehículos', icon: '🚗' }]`
- El detalle de vehículo gestiona sus propias sub-tabs (patrón PetDetail existente)
- `FULL_LAYOUT_MODULES` — **no se modifica**: repostajes/mantenimiento/gastos/estadisticas se renderizan dentro de VehiculoDetail con tabs propias, el sidebar de AppLayout sigue visible

### Tablas nuevas

**`vehicles`**
```sql
id         UUID PK
app_id     UUID REFERENCES projects(id) ON DELETE CASCADE
name       TEXT NOT NULL              -- alias del usuario, ej. "Mi Golf"
type       TEXT NOT NULL CHECK(type IN ('coche','moto'))
brand      TEXT
model      TEXT
year       INT CHECK(year > 1900)
plate      TEXT
fuel_type  TEXT DEFAULT 'gasolina' CHECK(fuel_type IN ('gasolina','diesel','electrico','hibrido','otro'))
initial_km INT DEFAULT 0
notes      TEXT
created_at TIMESTAMPTZ DEFAULT NOW()
```

**`fuel_logs`**
```sql
id             UUID PK
vehicle_id     UUID REFERENCES vehicles(id) ON DELETE CASCADE
app_id         UUID REFERENCES projects(id) ON DELETE CASCADE
date           DATE NOT NULL DEFAULT CURRENT_DATE
liters         NUMERIC(8,2) NOT NULL
price_per_liter NUMERIC(6,3)
total_cost     NUMERIC(8,2)
km_at_fill     INT
full_tank      BOOLEAN DEFAULT true
notes          TEXT
created_at     TIMESTAMPTZ DEFAULT NOW()
```

**`maintenance_logs`**
```sql
id          UUID PK
vehicle_id  UUID REFERENCES vehicles(id) ON DELETE CASCADE
app_id      UUID REFERENCES projects(id) ON DELETE CASCADE
type        TEXT NOT NULL CHECK(type IN ('ITV','aceite','ruedas','frenos','bateria','filtro','correa','otro'))
date        DATE NOT NULL DEFAULT CURRENT_DATE
km          INT
description TEXT
cost        NUMERIC(8,2)
next_km     INT          -- km próxima revisión (opcional)
next_date   DATE         -- fecha próxima revisión (opcional)
created_at  TIMESTAMPTZ DEFAULT NOW()
```

**`vehicle_expenses`**
```sql
id          UUID PK
vehicle_id  UUID REFERENCES vehicles(id) ON DELETE CASCADE
app_id      UUID REFERENCES projects(id) ON DELETE CASCADE
type        TEXT NOT NULL CHECK(type IN ('seguro','multa','aparcamiento','lavado','otro'))
date        DATE NOT NULL DEFAULT CURRENT_DATE
description TEXT
cost        NUMERIC(8,2) NOT NULL
created_at  TIMESTAMPTZ DEFAULT NOW()
```

### UI — Mis Vehículos
- Tarjetas con icono (🚗/🏍️), nombre, marca+modelo, matrícula
- Badge ⚠️ si hay mantenimiento próximo (next_date ≤ 30 días o next_km ≤ 1000 km del actual)
- Botón "+" para añadir vehículo con formulario completo

### UI — Repostajes
- Formulario rápido: fecha, litros, precio/litro (calcula total), km
- Lista cronológica con litros, total € y coste/litro
- Stat bar superior: consumo medio (L/100km), coste medio por repostaje

### UI — Mantenimiento
- Lista con tipo (badge coloreado), fecha, km, coste
- Alerta visual (fondo ámbar) si `next_date` ≤ 30 días o `next_km` próximo
- Tipos con iconos: ITV 📋, aceite 🛢️, ruedas 🔄, frenos ⚙️, batería 🔋

### UI — Estadísticas
- 4 métricas: km totales registrados, coste total combustible, coste total mantenimiento, coste/km
- Gráfico de barras simple (CSS, sin librería): gasto mensual últimos 6 meses
- Desglose por tipo de gasto (tabla simple)

---

## App 3 — Finanzas (`/app/finanzas`)

### Descripción
Registro de gastos e ingresos con categorías personalizables, presupuestos mensuales y resumen visual.

### Módulos y rutas
```
/app/finanzas/resumen        → Dashboard: balance mes, progreso presupuestos
/app/finanzas/transacciones  → Lista filtrable + formulario añadir
/app/finanzas/categorias     → CRUD categorías (nombre, tipo, color, icono emoji)
/app/finanzas/presupuestos   → Asignar límite mensual por categoría de gasto
```

### AppLayout changes
- `FINANZAS_MODULES = [resumen, transacciones, categorias, presupuestos]`

### Tablas nuevas

**`fin_categories`**
```sql
id         UUID PK
app_id     UUID REFERENCES projects(id) ON DELETE CASCADE
name       TEXT NOT NULL
type       TEXT NOT NULL CHECK(type IN ('expense','income'))
color      TEXT DEFAULT '#6366f1'   -- hex
icon       TEXT DEFAULT '💰'        -- emoji
created_at TIMESTAMPTZ DEFAULT NOW()
```

**`fin_transactions`**
```sql
id          UUID PK
app_id      UUID REFERENCES projects(id) ON DELETE CASCADE
type        TEXT NOT NULL CHECK(type IN ('expense','income'))
amount      NUMERIC(10,2) NOT NULL CHECK(amount > 0)
category_id UUID REFERENCES fin_categories(id) ON DELETE SET NULL
description TEXT
date        DATE NOT NULL DEFAULT CURRENT_DATE
created_at  TIMESTAMPTZ DEFAULT NOW()
```

**`fin_budgets`**
```sql
id            UUID PK
app_id        UUID REFERENCES projects(id) ON DELETE CASCADE
category_id   UUID REFERENCES fin_categories(id) ON DELETE CASCADE
monthly_limit NUMERIC(10,2) NOT NULL CHECK(monthly_limit > 0)
created_at    TIMESTAMPTZ DEFAULT NOW()
UNIQUE(app_id, category_id)
```

### Categorías por defecto
Seed automático: cuando el componente `Categorias.jsx` carga y detecta 0 categorías, inserta el set por defecto.  
Gastos: Alimentación 🛒 #f97316, Transporte 🚌 #3b82f6, Vivienda 🏠 #10b981, Ocio 🎭 #8b5cf6, Salud ❤️ #ef4444, Ropa 👗 #ec4899, Otros 📦 #6b7280  
Ingresos: Sueldo 💼 #10b981, Freelance 💻 #3b82f6, Otros ➕ #6b7280

### UI — Resumen
- Header: balance del mes (ingresos − gastos) con color verde/rojo
- Barras de progreso por categoría de gasto: gastado vs presupuesto (rojo si > 90%)
- Acceso rápido: botón "Añadir gasto" y "Añadir ingreso"

### UI — Transacciones
- Lista cronológica, cada item: icono+color de categoría, descripción, fecha, importe (+/−)
- Filtro por tipo (todos/gastos/ingresos) y mes (select mes/año)
- Formulario slide-in: tipo, importe, categoría, descripción, fecha

### UI — Categorías
- Lista con dot de color, emoji y nombre
- Click para editar inline, botón eliminar (solo si sin transacciones)
- Separadas por tipo (Gastos / Ingresos)

### UI — Presupuestos
- Una fila por categoría de gasto: nombre + importe límite + editar
- Solo categorías de tipo 'expense' son presupuestables

---

## Resumen de tablas nuevas (SQL)

| Tabla | App | ~Filas esperadas |
|---|---|---|
| `personal_notes` | Personal | Decenas |
| `personal_tasks` | Personal | Decenas–cientos |
| `personal_ideas` | Personal | Decenas |
| `vehicles` | Vehículo | 1–5 |
| `fuel_logs` | Vehículo | Cientos |
| `maintenance_logs` | Vehículo | Decenas |
| `vehicle_expenses` | Vehículo | Decenas |
| `fin_categories` | Finanzas | ~15 (seed) |
| `fin_transactions` | Finanzas | Cientos–miles |
| `fin_budgets` | Finanzas | ~10 |

---

## Archivos a crear / modificar

### Nuevos archivos
```
src/pages/app/modules/personal/Notas.jsx
src/pages/app/modules/personal/Tareas.jsx
src/pages/app/modules/personal/Ideas.jsx
src/pages/app/modules/vehiculo/MisVehiculos.jsx
src/pages/app/modules/vehiculo/VehiculoDetail.jsx
src/pages/app/modules/vehiculo/Repostajes.jsx
src/pages/app/modules/vehiculo/Mantenimiento.jsx
src/pages/app/modules/vehiculo/VehiculoGastos.jsx
src/pages/app/modules/vehiculo/Estadisticas.jsx
src/pages/app/modules/finanzas/Resumen.jsx
src/pages/app/modules/finanzas/Transacciones.jsx
src/pages/app/modules/finanzas/Categorias.jsx
src/pages/app/modules/finanzas/Presupuestos.jsx
supabase/migrations/20260427_nuevas_apps.sql
```

### Archivos modificados
```
src/pages/app/AppLayout.jsx       → APP_NAMES, APP_ICONS, MODULE_MAP, FULL_LAYOUT_MODULES
src/App.jsx                       → Rutas nuevas
src/data/apps.js                  → Añadir Personal, actualizar Vehículo y Finanzas
```

---

## Restricciones técnicas

- Sin librerías de gráficos — estadísticas con CSS puro (barras de progreso, flex)
- Sin internacionalización — todo en español
- Patrones visuales: mismos estilos inline que módulos existentes (`var(--bg-card)`, `var(--accent)`, etc.)
- Calendar en Personal reutiliza `Calendar.jsx` sin modificación — solo cambia el `app.id` del contexto
