# H3nky — Sistema Modular Completo (Design Spec)

**Fecha:** 2026-04-26  
**Enfoque:** Big Bang migration — velocidad sobre retrocompatibilidad  
**Stack:** React 19 + Supabase + Tailwind CSS 4 + Framer Motion + GSAP

---

## Decisiones clave

- Migración completa del esquema de DB en un solo paso (sin tablas paralelas)
- Las 5 fases se planifican juntas; se implementan secuencialmente
- `recipes` sigue siendo tabla especializada (no se mueve a `items`)
- `AppLayout.jsx` reemplaza `HogarLayout.jsx` — genérico por tipo de app
- `AppContext` reemplaza `ProjectContext`

---

## Migración de tablas

| Tabla actual | Acción | Tabla nueva |
|---|---|---|
| `projects` | Renombrar + añadir `type` | `apps` |
| `project_members` | Sin cambios | `project_members` |
| `calendar_tasks` | Reestructurar columnas | `events` |
| `shopping_items` | Migrar datos | `items` (module='supermercado') |
| `menu_items` | Migrar datos | `events` (event_type='meal') |
| `recipes` | Sin cambios | `recipes` |
| `purchase_history` | Sin cambios | `purchase_history` |

### Tablas nuevas

```sql
products              -- Catálogo de productos con unidad de compra
inventory             -- Stock actual por app
product_consumption   -- Historial para predicción de consumo
recipe_ingredients    -- Ingredientes normalizados (reemplaza JSONB)
diet_plans            -- Planes de dieta semanales
```

---

## Estructura de carpetas (target)

```
src/
├── pages/app/
│   ├── AppsHub.jsx               (sin cambios)
│   ├── AppLayout.jsx             (nuevo — reemplaza HogarLayout)
│   └── modules/
│       ├── hogar/
│       │   ├── Welcome.jsx
│       │   ├── Calendar.jsx      (refactor)
│       │   ├── ShoppingList.jsx  (refactor)
│       │   ├── Menu.jsx          (refactor)
│       │   ├── Recipes.jsx       (refactor)
│       │   ├── RecipeDetail.jsx  (refactor)
│       │   ├── Limpieza.jsx      (nuevo)
│       │   └── Inventario.jsx    (nuevo)
│       ├── mascotas/
│       │   ├── Welcome.jsx, Alimentacion.jsx, Salud.jsx
│       ├── vehiculo/
│       │   ├── Welcome.jsx, Combustible.jsx, Mantenimiento.jsx
│       └── finanzas/
│           ├── Welcome.jsx, Gastos.jsx
├── hooks/
│   ├── useItems.js               (nuevo)
│   ├── useEvents.js              (nuevo)
│   └── useInventory.js           (nuevo)
└── contexts/
    └── AppContext.jsx            (renombrado desde ProjectContext)
```

---

## Fase 1 — Migración Big Bang

**Objetivo:** Nueva DB operativa, módulos existentes funcionando sobre el nuevo esquema.

1. Script SQL: renombrar tablas, añadir columnas, crear tablas nuevas, actualizar RLS
2. `AppLayout.jsx` — genérico, carga app por `appType` desde URL params
3. `AppContext.jsx` — reemplaza ProjectContext
4. Refactorizar Calendar, ShoppingList, Menu, Recipes a nuevas queries
5. Router: actualizar rutas a `/app/:appType/...`
6. `apps.js`: registrar Mascotas, Vehículo, Finanzas (coming_soon)

**Criterio:** App funciona igual que antes sobre el nuevo esquema.

---

## Fase 2 — Completar Hogar

**Objetivo:** Todos los módulos de Hogar + flujo Recetas→Inventario→Compra.

1. Normalizar `recipes.ingredients` JSONB → tabla `recipe_ingredients`
2. Catálogo `products` con `purchase_unit` / `purchase_quantity`
3. Módulo **Limpieza**: tareas recurrentes → eventos en calendario, sugerencia de productos
4. Módulo **Inventario**: vista stock, descuento al cocinar, alertas de stock bajo
5. Flujo: generar lista de compra desde Menú cruza con inventario

---

## Fase 3 — Consumo Inteligente

**Objetivo:** Sugerencias automáticas basadas en historial de compras.

1. Poblar `product_consumption` al marcar items como comprados
2. Calcular `avg_days_between_purchases` y `estimated_next_purchase`
3. Sección "Sugerencias" en ShoppingList con botón "¿Lo añado?"
4. Ajuste manual de frecuencia estimada por producto

---

## Fase 4 — Nuevas Apps

**Mascotas:** stock de pienso → sugerencia compra, vacunas como eventos, gastos → Finanzas  
**Vehículo:** repostajes → Finanzas, mantenimientos como eventos, recordatorios ITV/seguro  
**Finanzas:** agregador de gastos multi-app, dashboard mensual por categoría

---

## Fase 5 — IA Avanzada y QA

1. `diet_plans`: planes semanales → generación automática de MealEvents
2. Edge Function de recetas: considera inventario actual al sugerir
3. Tests unitarios: hooks críticos (useItems, useEvents, useInventory)
4. Tests E2E: flujo Receta → Menú → Compra → Inventario
5. Optimizaciones de rendimiento

---

## Flujos clave

### Receta → Compra → Finanzas
```
Crear Receta → Añadir al Menú (MealEvent) → ¿Hay stock?
  ├── Sí → Descargar de Inventario
  └── No → Añadir a ShoppingList → Comprar → Registrar gasto → Finanzas
                                                     ↓
                                         Actualizar product_consumption
```

### Limpieza → Compra
```
Tarea de limpieza completada → Detectar producto bajo stock → Sugerir en ShoppingList
```

### Mascotas → Compra
```
Stock de pienso bajo → Sugerir en ShoppingList → Comprar → Actualizar inventory
```

---

## Modelos de datos detallados

```sql
-- apps (renombrado desde projects)
ALTER TABLE projects RENAME TO apps;
ALTER TABLE apps ADD COLUMN type TEXT CHECK(type IN ('hogar','personal','vehiculo','finanzas','mascotas'));
UPDATE apps SET type = 'hogar';

-- events (renombrado desde calendar_tasks + menu_items migrados)
ALTER TABLE calendar_tasks RENAME TO events;
ALTER TABLE events ADD COLUMN item_id UUID REFERENCES items(id);
ALTER TABLE events ADD COLUMN event_type TEXT DEFAULT 'task';
ALTER TABLE events ADD COLUMN app_id UUID REFERENCES apps(id);
UPDATE events SET app_id = project_id, event_type = 'task';

-- items (nuevo — absorbe shopping_items)
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  type TEXT,
  title TEXT NOT NULL,
  description TEXT,
  visibility TEXT CHECK(visibility IN ('shared','private')) DEFAULT 'shared',
  owner_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  checked BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  purchase_unit TEXT DEFAULT 'unidad',
  purchase_quantity INT DEFAULT 1,
  category TEXT,
  metadata JSONB DEFAULT '{}'
);

-- inventory
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  app_id UUID REFERENCES apps(id),
  quantity INT DEFAULT 0,
  remaining_units INT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, app_id)
);

-- product_consumption
CREATE TABLE product_consumption (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  app_id UUID REFERENCES apps(id),
  last_purchase_date DATE,
  avg_days_between_purchases INT,
  estimated_next_purchase DATE,
  confidence TEXT CHECK(confidence IN ('alta','media','baja')) DEFAULT 'baja',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, app_id)
);

-- recipe_ingredients (reemplaza JSONB)
CREATE TABLE recipe_ingredients (
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  PRIMARY KEY (recipe_id, product_id)
);

-- diet_plans
CREATE TABLE diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id),
  name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## RLS Policies (patrón unificado)

Todas las tablas siguen el mismo patrón:
```sql
-- El usuario puede acceder si es owner del app O miembro aceptado
USING (
  app_id IN (
    SELECT id FROM apps WHERE owner_id = auth.uid()
    UNION
    SELECT project_id FROM project_members 
    WHERE user_id = auth.uid() AND accepted = true
  )
)
```

---

## Criterios de aceptación globales

- [ ] Todos los módulos de Hogar funcionan sobre el nuevo esquema sin pérdida de datos
- [ ] Flujo completo Receta → Inventario → Compra operativo
- [ ] Sugerencias inteligentes aparecen en ShoppingList
- [ ] Las 3 apps nuevas (Mascotas, Vehículo, Finanzas) tienen módulos básicos funcionales
- [ ] Finanzas agrega gastos de todas las apps
- [ ] Tests unitarios y E2E pasan
- [ ] No hay regresiones visuales (dark mode, mobile, animaciones)
