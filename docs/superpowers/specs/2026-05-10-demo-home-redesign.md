# Demo Home — Rediseño

**Fecha:** 2026-05-10
**Ruta:** `/demo` → reemplaza `DemoHub.jsx`

---

## Objetivo

Convertir el home de la demo de un simple lanzador de apps en un **hub cross-app** que muestre datos reales de las 5 apps de forma agregada. El usuario aterriza y ve de inmediato qué está pasando hoy en su vida.

---

## Estructura de la página

Layout único de **columna centrada** (max-width ~480px en móvil, ~560px en desktop), mismo orden en ambas pantallas:

### 1. Header — Fecha mínima
```
JUE · 14 MAY 2026          ← etiqueta pequeña, color muted
14  MAYO                   ← número enorme (72px bold), mes en caps
```
Sin texto de saludo. Sin subtítulos. Solo la fecha.

### 2. Tareas de hoy
Etiqueta: `HOY · N ITEMS`

Lista vertical de eventos/tareas del día actual, agregados de todas las apps. Cada ítem tiene 3 líneas:
```
08:00                      ← hora en muted (o "● AHORA" en color app si es el activo)
Comida de Luna             ← título, bold si activo
MASCOTAS                   ← label app en color brand de esa app
```

**Colores de borde izquierdo por app:**
- Hogar — `#f97316`
- Personal — `#38bdf8`  
- Mascotas — `#a855f7`
- Vehículo — `#ef4444`
- Finanzas — `#22c55e`

**Estado activo** (evento en curso): fondo `#fff7ed`, borde naranja, hora reemplazada por `● AHORA`, texto en color app.

Fuentes de datos (sessionStorage demo):
- `demo_hogar_events` — `event_type: task | meal | cleaning`
- `demo_personal_events` — reuniones, citas
- `demo_mascotas_events` — rutinas, salud
- Vehículo no tiene eventos en el mock actual — se omite de la lista

Filtro: solo eventos cuyo `start_time` sea el día actual (comparando fecha local). Ordenados por hora. Si no hay eventos hoy, mostrar mensaje vacío: `"Sin eventos hoy"` en muted.

### 3. App cards — Grid 2×3
Etiqueta: `TUS APPS`

Grid de 6 tarjetas (2 columnas). Las 5 apps + 1 tarjeta IA:

```
┌─────────────┐ ┌─────────────┐
│ 🏠 HOGAR    │ │ 🗂️ PERSONAL  │
│ 3 tareas    │ │ 3 eventos   │
│ 8 en lista  │ │ 5 notas     │
└─────────────┘ └─────────────┘
┌─────────────┐ ┌─────────────┐
│ 🐾 MASCOTAS │ │ 🚗 VEHÍCULO │
│ Luna · 4a   │ │ VW Golf     │
│ Comida 08h  │ │ 58.420 km   │
└─────────────┘ └─────────────┘
┌─────────────┐ ┌─────────────┐
│ 💰 FINANZAS │ │   ✦ IA      │
│ 312€ semana │ │ 1 insight   │
└─────────────┘ └─────────────┘
```

Cada tarjeta: `border-top: 2px solid <color-app>`, fondo blanco (light) / `bg-card` (dark). Clic navega a `/demo/<appType>`.

La tarjeta IA es fija con fondo `#7c3aed`. Sin navegación por ahora — muestra este insight estático:
> *"Gastas un 18% más los jueves en gasolina. ¿Repostaje el viernes?"*

### 4. Datos de cada app card

Los stats se calculan en el momento leyendo sessionStorage:

| App | Línea 1 | Línea 2 |
|-----|---------|---------|
| Hogar | `N tareas hoy` (events hoy) | `N en lista` (items_supermercado no checked) |
| Personal | `N eventos` (events) | `N notas` (personal_notes) |
| Mascotas | `<nombre> · <edad>a` (primer pet) | primer evento de `demo_mascotas_events` con `start_time` hoy, o `"Sin eventos hoy"` |
| Vehículo | `<marca> <modelo>` | `<km> km` |
| Finanzas | `<total>€ semana` (sum txs 7 días) | `N presupuestos` |
| IA | insight fijo de datos demo | — |

---

## Tema — Light/Dark por dispositivo

**Comportamiento B:** el home arranca con el tema según el dispositivo, pero el usuario puede cambiarlo con el toggle existente.

- Desktop (≥768px): arranca en **light mode** si no hay preferencia guardada en localStorage
- Móvil (<768px): arranca en **dark mode** si no hay preferencia guardada

Implementación: en `DemoHome.jsx` (nuevo componente), un `useEffect` que mira `window.innerWidth` y `localStorage.theme`. Si no hay preferencia guardada, aplica el default por device.

---

## Inicialización de datos

El nuevo `DemoHome` llama a `initDemoData` para **todas las apps** al montarse, no solo una:

```js
['hogar', 'personal', 'mascotas', 'vehiculo', 'finanzas'].forEach(initDemoData)
```

Esto asegura que los stats de todas las app cards tengan datos disponibles.

---

## Componentes nuevos

| Componente | Ruta | Responsabilidad |
|-----------|------|----------------|
| `DemoHome.jsx` | `src/pages/DemoHome.jsx` | Página raíz en `/demo`. Sustituye `DemoHub.jsx`. |
| `DemoTodayList.jsx` | `src/pages/DemoHome.jsx` (inline) | Agrega y renderiza los eventos del día de todas las apps. Componente interno, no fichero propio. |
| `DemoAppCard.jsx` | `src/pages/DemoHome.jsx` (inline) | Tarjeta de una app con stats calculados en vivo. Componente interno, no fichero propio. |

---

## Animaciones

- Entrada del número de fecha: fade + slide-up (CSS, sin dependencias)
- Stagger en los ítems del día: 40ms entre cada ítem (CSS `animation-delay`)
- Tarjetas IA: ninguna animación especial

---

## Lo que NO cambia

- Rutas `/demo/:appType` — sin tocar
- `DemoAppLayout.jsx` — sin tocar
- Datos demo existentes — sin tocar
- El toggle de tema en el header — se mantiene

---

## Archivos afectados

| Archivo | Acción |
|---------|--------|
| `src/pages/DemoHub.jsx` | Reemplazar por `DemoHome.jsx` |
| `src/App.jsx` | Cambiar import de `DemoHub` a `DemoHome` |
| `src/pages/DemoHome.jsx` | Crear |
| `src/pages/demo/DemoTodayList.jsx` | Crear |
| `src/pages/demo/DemoAppCard.jsx` | Crear |
