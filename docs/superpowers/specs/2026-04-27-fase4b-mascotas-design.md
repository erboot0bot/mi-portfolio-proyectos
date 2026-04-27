# Fase 4b — Mascotas Design Spec

**Fecha:** 2026-04-27  
**Proyecto:** H3nky — Sistema Modular  
**Alcance:** App de gestión de mascotas con perfiles múltiples, módulos contextuales por especie y navegación por tabs.

---

## Decisiones clave

- Múltiples mascotas como perfiles independientes (tabla `pets`)
- Navegación: lista de mascotas → seleccionar mascota → tabs de módulos
- Módulos disponibles determinados por especie (perro/gato/pez/conejo/pájaro/reptil/otro)
- Datos por mascota almacenados en tablas existentes via `metadata.pet_id` (sin migraciones adicionales salvo `pets`)
- Sin módulo Gastos en 4b (depende de Finanzas en 4d)
- AppLayout sidebar: un único enlace "Mis Mascotas"

---

## Modelo de datos

### Nueva tabla `pets`

```sql
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK(species IN ('perro','gato','pez','conejo','pajaro','reptil','otro')),
  icon TEXT,
  birth_date DATE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pets_access" ON pets
  USING (
    app_id IN (
      SELECT id FROM apps WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid() AND accepted = true
    )
  );
```

### Tablas existentes (sin migración)

- `events`: eventos de Salud y Rutinas se almacenan con `metadata.pet_id = '<uuid>'`
- `inventory`: stock de Alimentación se almacena con `metadata.pet_id = '<uuid>'`
- `product_consumption`: integración con sugerencias de compra (ya existente)

### Iconos por especie

| species | icon |
|---|---|
| perro | 🐕 |
| gato | 🐈 |
| pez | 🐠 |
| conejo | 🐇 |
| pajaro | 🐦 |
| reptil | 🦎 |
| otro | 🐾 |

### Horario de tomas

Guardado en `pets.metadata.feeding_schedule` como array:
```json
[
  { "time": "08:00", "amount": "200g", "label": "Mañana" },
  { "time": "18:00", "amount": "200g", "label": "Tarde" }
]
```

---

## Módulos por especie

```js
const SPECIES_MODULES = {
  perro:  ['alimentacion', 'salud', 'rutinas'],  // rutinas = paseos
  gato:   ['alimentacion', 'salud'],
  pez:    ['alimentacion', 'salud', 'rutinas'],  // rutinas = mantenimiento pecera
  conejo: ['alimentacion', 'salud', 'rutinas'],  // rutinas = mantenimiento jaula
  pajaro: ['alimentacion', 'salud', 'rutinas'],  // rutinas = mantenimiento jaula
  reptil: ['alimentacion', 'salud', 'rutinas'],
  otro:   ['alimentacion', 'salud'],
}
```

---

## Routing

### App.jsx — bloque mascotas (reemplaza el actual)

```jsx
<Route path="/app/mascotas" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
  <Route index element={<Navigate to="mis-mascotas" replace />} />
  <Route path="mis-mascotas" element={<MisMascotas />} />
  <Route path="mis-mascotas/:petId" element={<PetDetail />}>
    <Route index element={<Navigate to="alimentacion" replace />} />
    <Route path="alimentacion" element={<MascotasAlimentacion />} />
    <Route path="salud" element={<MascotasSalud />} />
    <Route path="rutinas" element={<MascotasRutinas />} />
  </Route>
</Route>
```

### AppLayout — MASCOTAS_MODULES

```js
const MASCOTAS_MODULES = [
  { path: 'mis-mascotas', label: 'Mis Mascotas', icon: '🐾' },
]
```

---

## Estructura de archivos

| Acción | Archivo |
|---|---|
| Modificar | `src/pages/app/AppLayout.jsx` — actualizar MASCOTAS_MODULES |
| Modificar | `src/App.jsx` — reemplazar bloque mascotas con rutas anidadas |
| Crear | `src/pages/app/modules/mascotas/MisMascotas.jsx` |
| Crear | `src/pages/app/modules/mascotas/PetDetail.jsx` |
| Crear | `src/pages/app/modules/mascotas/Alimentacion.jsx` |
| Crear | `src/pages/app/modules/mascotas/Salud.jsx` |
| Crear | `src/pages/app/modules/mascotas/Rutinas.jsx` |
| Crear | `src/pages/app/modules/mascotas/__tests__/Alimentacion.test.jsx` |
| Crear | `src/pages/app/modules/mascotas/__tests__/Salud.test.jsx` |
| Borrar | `src/pages/app/modules/mascotas/Welcome.jsx` (reemplazado por MisMascotas) |

---

## Descripción de componentes

### MisMascotas.jsx

- Recibe `{ app, modules }` de `useOutletContext()`
- Carga `pets` de Supabase filtrado por `app_id`
- Muestra grid/lista de tarjetas: icono, nombre, especie, edad calculada desde `birth_date`
- Botón "+ Nueva mascota" toggle formulario inline: nombre (requerido), especie (selector), fecha nacimiento (opcional), notas (opcional)
- Tap en tarjeta → `navigate(pet.id)` (relativa a la ruta actual `/app/mascotas/mis-mascotas`, resulta en `/app/mascotas/mis-mascotas/:petId`)
- Empty state: ilustración + "Añade tu primera mascota"

### PetDetail.jsx

- Lee `:petId` con `useParams()`
- Carga el registro `pets` por id con `maybeSingle()`
- Si no existe → `<Navigate to="../mis-mascotas" replace />`
- Muestra: icono + nombre en cabecera
- Tab bar horizontal con los módulos de `SPECIES_MODULES[pet.species]`
- Tabs resaltados según ruta activa (`useLocation`)
- Pasa `pet` como contexto a los sub-módulos via `<Outlet context={{ pet, app }} />`
- Botón "×" o "Eliminar mascota" con confirmación (elimina en cascada via FK)

### Alimentacion.jsx

- Recibe `{ pet, app }` de `useOutletContext()`
- **Sección Stock**: query `inventory` con `.eq('app_id', app.id)` + `.contains('metadata', { pet_id: pet.id })`. Misma UI que `Inventario.jsx`: stock +/−, alerta bajo stock, añadir producto. INSERT incluye `metadata: { pet_id: pet.id }`.
- **Sección Tomas**: muestra `pet.metadata.feeding_schedule ?? []`. Añadir toma: inputs `time` + `amount` + `label`. Guardar → UPDATE `pets.metadata` con el nuevo array. Eliminar toma con botón ×.

### Salud.jsx

- Recibe `{ pet, app }` de `useOutletContext()`
- Query `events` filtrado: `.eq('app_id', app.id)` + `.contains('metadata', { pet_id: pet.id })`
- Event types: `vaccination`, `vet_visit`, `medication`
- Formulario: título, tipo (selector), fecha, notas, intervalo de repetición (para medicamentos)
- Al marcar un evento como hecho: si tiene `interval_days`, crea el siguiente igual que `Limpieza.jsx`
- Vencidos en rojo, próximos en gris, pasados en opaco

### Rutinas.jsx

- Recibe `{ pet, app }` de `useOutletContext()`
- **Si `pet.species === 'perro'`**: modo paseos
  - Botón "🦮 Registrar paseo" → INSERT evento `event_type='walk'` con `start_time = now()`, campo opcional de duración en minutos y notas
  - Lista de paseos del día y semana con duración total
- **Resto de especies con rutinas**: modo mantenimiento
  - Idéntico a `Limpieza.jsx`: tareas recurrentes `event_type='cage_maintenance'`, con `metadata.pet_id`
  - Título (ej. "Cambio de agua"), fecha, intervalo de repetición, productos necesarios

---

## Criterios de aceptación

- [ ] Se pueden añadir, ver y eliminar perfiles de mascotas
- [ ] Los tabs de cada mascota muestran solo los módulos correspondientes a su especie
- [ ] Alimentación muestra y actualiza el stock con integración a sugerencias de compra
- [ ] El horario de tomas se puede editar y persiste en `pets.metadata`
- [ ] Salud muestra eventos pasados y futuros, con recurrencia para medicamentos
- [ ] Rutinas muestra paseos (perro) o mantenimiento (resto) según especie
- [ ] Eliminar mascota elimina sus eventos e inventario: el código borra manualmente los `events` e `inventory` con `metadata.pet_id = pet.id` antes de borrar el registro `pets` (los eventos/inventory no tienen FK real a pets, solo `metadata.pet_id`)
- [ ] Hogar y las demás apps no tienen regresiones
