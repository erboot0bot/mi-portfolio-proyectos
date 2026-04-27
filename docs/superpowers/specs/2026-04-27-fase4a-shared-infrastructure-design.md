# Fase 4a — Shared Infrastructure Design

**Fecha:** 2026-04-27  
**Proyecto:** H3nky — Sistema Modular  
**Alcance:** Generalizar AppLayout y routing para soportar múltiples tipos de app (mascotas, vehículo, finanzas)

---

## Decisiones clave

- Un único `AppLayout.jsx` con `MODULE_MAP[app.type]` — no hay layouts separados por app
- Auto-create del registro en `apps` al primer acceso (invisible para el usuario)
- Las tres apps nuevas se marcan `active` en `apps.js` desde 4a con stubs de Welcome
- Los módulos reales se construyen en 4b (Mascotas), 4c (Vehículo), 4d (Finanzas)

---

## Cambios en AppLayout.jsx

### Antes (hardcodeado)
```js
// línea ~53
const modules = HOGAR_MODULES
```

### Después (mapa por tipo)
```js
const MODULE_MAP = {
  hogar:    HOGAR_MODULES,
  mascotas: MASCOTAS_MODULES,
  vehiculo: VEHICULO_MODULES,
  finanzas: FINANZAS_MODULES,
}

// En el body del componente:
const modules = MODULE_MAP[app?.type] ?? []
```

Cada `*_MODULES` sigue la misma forma que `HOGAR_MODULES`:
```js
{ slug: 'welcome', label: 'Inicio', icon: '🏠', component: lazy(() => import('./modules/hogar/Welcome')) }
```

`MASCOTAS_MODULES`, `VEHICULO_MODULES` y `FINANZAS_MODULES` se definen en `AppLayout.jsx` con un único módulo `welcome` cada uno, apuntando a sus respectivos stubs.

---

## Auto-create de app record

En el `useEffect` de carga del app (donde se hace el `SELECT` por `type`), si la query no devuelve registros:

```js
// Si no existe app para este type + owner, crearlo
const { data: created } = await supabase
  .from('apps')
  .insert({ type: appType, name: APP_NAMES[appType], owner_id: user.id })
  .select()
  .single()
setApp(created)
```

`APP_NAMES` es un objeto estático `{ hogar: 'Hogar', mascotas: 'Mascotas', vehiculo: 'Vehículo', finanzas: 'Finanzas' }` definido en AppLayout.

El auto-create es silencioso — el usuario ve la app cargada normalmente.

---

## Nuevas rutas en App.jsx

```jsx
// Misma estructura que /app/hogar/*
<Route path="/app/mascotas/*" element={<AppLayout />} />
<Route path="/app/vehiculo/*"  element={<AppLayout />} />
<Route path="/app/finanzas/*"  element={<AppLayout />} />
```

AppLayout ya extrae `appType` de los URL params, por lo que no necesita props adicionales.

---

## Welcome stubs

Tres archivos nuevos, uno por app:

```
src/pages/app/modules/mascotas/Welcome.jsx
src/pages/app/modules/vehiculo/Welcome.jsx
src/pages/app/modules/finanzas/Welcome.jsx
```

Cada stub muestra:
- Icono de la app
- Nombre de la app
- Mensaje "Próximamente más módulos"
- Usa `ModuleShell` con `app` y `modules` de `useOutletContext()`

---

## apps.js

Las tres apps cambian de `status: 'coming_soon'` a `status: 'active'`, con `version: '0.1.0'` y `lastUpdated: '2026-04'`.

---

## Estructura de archivos

| Acción | Archivo |
|---|---|
| Modificar | `src/pages/app/AppLayout.jsx` |
| Modificar | `src/App.jsx` |
| Modificar | `src/data/apps.js` |
| Crear | `src/pages/app/modules/mascotas/Welcome.jsx` |
| Crear | `src/pages/app/modules/vehiculo/Welcome.jsx` |
| Crear | `src/pages/app/modules/finanzas/Welcome.jsx` |

---

## Criterios de aceptación

- [ ] `/app/mascotas`, `/app/vehiculo`, `/app/finanzas` cargan sin errores
- [ ] El primer acceso crea automáticamente el registro en `apps`
- [ ] Los accesos siguientes reutilizan el mismo registro (no duplica)
- [ ] Los stubs de Welcome se renderizan con la navegación lateral correcta
- [ ] Hogar sigue funcionando igual que antes (sin regresiones)
- [ ] AppsHub muestra las tres apps como activas y enlaza correctamente
