# Estado del Proyecto — Portfolio Personal H3nky

> Documento de contexto para retomar el trabajo en una nueva sesión de Claude.
> Última actualización: 2026-04-14

---

## Stack técnico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework UI | React | 19.x |
| Bundler | Vite | 8.x |
| CSS | Tailwind CSS | v4.x |
| Routing | React Router DOM | 7.x |
| Animaciones | Framer Motion | 12.x |
| Tests | Vitest + Testing Library | 4.x |
| Runtime | Node.js | ESM (`"type": "module"`) |

**Tailwind v4 — diferencias clave respecto a v3:**
- Se importa con `@import "tailwindcss"` en el CSS (no `@tailwind base/components/utilities`)
- Dark mode class-based se declara con `@custom-variant dark (&:where(.dark, .dark *));`
- No hay `tailwind.config.js` — configuración via CSS custom properties
- Plugin de Vite: `@tailwindcss/vite`

---

## Estructura de archivos

```
mi-portfolio-proyectos/
├── public/
│   └── projects/
│       └── {slug}/
│           └── cover.jpg          ← imágenes generadas con generate-image.js
├── src/
│   ├── components/
│   │   ├── FilterBar.jsx          ← filtro por tecnología (pills naranjas)
│   │   ├── FilterBar.test.jsx
│   │   ├── ImageGallery.jsx       ← lightbox de capturas en ProjectDetail
│   │   ├── ImageGallery.test.jsx
│   │   ├── Layout.jsx             ← shell: nav + footer + toggle dark/light
│   │   ├── ProjectCard.jsx        ← card del grid home (imagen + badges + status)
│   │   └── TechBadge.jsx         ← pill de tecnología (naranja en claro, zinc en oscuro)
│   ├── data/
│   │   └── projects.js            ← ÚNICA fuente de verdad de proyectos
│   ├── pages/
│   │   ├── Home.jsx               ← grid de proyectos + hero section
│   │   ├── Home.test.jsx
│   │   ├── NotFound.jsx           ← página 404
│   │   ├── ProjectDetail.jsx      ← página individual de proyecto
│   │   └── ProjectDetail.test.jsx
│   ├── scripts/
│   │   └── generate-image.js      ← generador de portadas con Pollinations.ai
│   ├── App.jsx                    ← React Router routes + AnimatePresence
│   ├── index.css                  ← tokens de tema (CSS custom properties) + dot grid
│   └── main.jsx                   ← entry point
├── ESTADO-PROYECTO.md             ← este archivo
├── TODOS.md                       ← backlog de features pendientes
├── package.json
└── vite.config.js
```

---

## Sistema de temas (light/dark mode)

### Estrategia
- Default: **modo claro** (a menos que `prefers-color-scheme: dark` esté activo)
- Toggle: botón sol/luna en la nav, persiste en `localStorage`
- Clase `dark` en `<html>` controla el tema

### Implementación en `Layout.jsx`
```js
// Al montar: lee localStorage o prefers-color-scheme
const saved = localStorage.getItem('theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const isDark = saved ? saved === 'dark' : prefersDark
document.documentElement.classList.toggle('dark', isDark)

// Al hacer toggle:
document.documentElement.classList.toggle('dark', next)
localStorage.setItem('theme', next ? 'dark' : 'light')
```

### Tokens CSS en `src/index.css`
```css
html {                          /* MODO CLARO */
  --bg: #fffcf9;               /* blanco cálido */
  --bg-subtle: #faf8f5;
  --bg-card: #ffffff;
  --border: #e4e4e7;
  --text: #09090b;
  --text-muted: #71717a;
  --text-faint: #a1a1aa;
  --accent: #f97316;           /* naranja principal */
  --nav-bg: rgba(255,252,249,0.88);
  --dot-color: rgba(249,115,22,0.09);  /* puntos del grid */
}

html.dark {                     /* MODO OSCURO */
  --bg: #0a0a0f;
  --bg-card: #0f0f18;
  --border: rgba(255,255,255,0.07);
  --text: #f4f4f5;
  --accent: #f97316;
  --nav-bg: rgba(10,10,15,0.85);
  --dot-color: rgba(255,255,255,0.028);
}

/* Dot grid en el fondo del body */
body {
  background-image: radial-gradient(circle, var(--dot-color) 1px, transparent 1px);
  background-size: 26px 26px;
}
```

Para usar los tokens en JSX: `className="bg-[var(--bg)] text-[var(--text)]"` etc.
Para dark variants: `className="... dark:text-white dark:bg-zinc-800"`

---

## Decisiones de diseño

### Paleta
- Acento: **naranja `#f97316`** (Tailwind `orange-500`) — dominante en ambos modos
- Fondo oscuro: `#0a0a0f` (casi negro azulado)
- Fondo claro: `#fffcf9` (blanco ligeramente cálido)

### Tipografía
- Familia: `Inter` (system-ui como fallback)
- Estilo: extrabold para títulos, light para subtítulos — inspirado en diseño E de las variantes generadas
- Mono: `font-mono text-xs tracking-widest` para el "Hola, soy" del hero

### Hero section
- **Modo oscuro**: gradiente cósmico naranja→violeta→negro (pantalla completa con `-mx-4 sm:-mx-6`)
  ```css
  linear-gradient(110deg, #ea580c 0%, #c2410c 12%, #7c2d12 24%, #4c1d95 44%, #1e1b4b 62%, #0a0a0f 80%)
  ```
  + radial cálido en 25%/60% + fade al fondo al final
- **Modo claro**: gradiente cálido naranja→transparente
  + gran glow radial naranja top-left (480×380px, 18% opacidad)
  + glow ámbar secundario top-right (profundidad)
  + fade al fondo al final

### Cards de proyecto
- Rounded-xl, border sutil (`var(--border)`)
- Hover: eleva 3px (Framer Motion `whileHover: {y: -3}`) + border naranja + sombra naranja
- Imagen cover 176px de alto, placeholder gris si no hay imagen
- Máximo 3 `TechBadge` visibles + `+N` si hay más

### FilterBar
- Pills naranjas sólidos cuando activos (`bg-[var(--accent)] text-white`)
- Inactivos: transparentes con borde sutil, hover naranja

### TechBadge
- Claro: `bg-orange-50 text-orange-700 border-orange-100`
- Oscuro: `bg-zinc-800 text-zinc-300 border-zinc-700`

---

## ProjectDetail — estado actual y deuda técnica

> **AVISO:** `ProjectDetail.jsx` tiene las clases hardcodeadas en modo oscuro (zinc-xxx, text-white, etc.) y **no usa los CSS custom properties de tema**. Cuando se limpie el modo claro del hero, hay que actualizar también esta página para ser theme-aware.

Clases hardcodeadas en ProjectDetail que hay que migrar:
- `text-white` → `text-[var(--text)]`
- `text-zinc-400` → `text-[var(--text-muted)]`
- `bg-zinc-800 hover:bg-zinc-700 border-zinc-700` → versiones con `var(--border)` y dual light/dark
- `border-zinc-800` → `border-[var(--border)]`

---

## Cómo añadir un proyecto nuevo

### 1. Añadir datos en `src/data/projects.js`

```js
{
  slug: 'nombre-del-proyecto',      // kebab-case, define la URL /projects/nombre
  title: 'Nombre legible',
  description: 'Una frase para la card.',
  longDescription: 'Párrafo completo para la página de detalle.',
  status: 'completed',              // 'completed' | 'wip' | 'archived'
  featured: false,                  // true = aparece primero en el grid
  technologies: ['React', 'Node'],
  github: 'https://github.com/...',
  demo: null,                       // null si no hay demo
  images: [],                       // se rellena automáticamente con generate-image.js
  date: '2026-04',                  // 'YYYY-MM'
}
```

Orden del grid: `featured: true` primero, luego por `date` descendente.

### 2. Generar imagen de portada con Pollinations.ai

```bash
# Usa la descripción de projects.js automáticamente:
npm run generate-image -- --slug nombre-del-proyecto

# O con descripción personalizada:
npm run generate-image -- --slug nombre-del-proyecto --description "Una app de productividad con IA"

# Forzar regeneración si ya existe:
npm run generate-image -- --slug nombre-del-proyecto --force
```

El script:
1. Llama a `https://image.pollinations.ai/prompt/{prompt}?width=1280&height=720&nologo=true` — **sin API key, gratis**
2. Guarda en `public/projects/{slug}/cover.jpg`
3. Actualiza automáticamente `images[]` en `projects.js`

No requiere ninguna variable de entorno. No hay `.env`.

---

## Sistema de generación de imágenes — detalles técnicos

**Archivo:** `src/scripts/generate-image.js`

**Prompt que construye:**
```
Dark-themed developer portfolio cover for project "{title}".
{description}
Stack: {tech1}, {tech2}, ...
Minimal modern UI, dark background, subtle code or interface elements,
cinematic lighting, professional quality, no text overlays, 16:9.
```

**Notas:**
- Usa `seed=Date.now()` para imagen diferente en cada llamada
- No sobreescribe si ya existe (a menos que `--force`)
- Actualiza `images[]` en projects.js via regex (busca el slug + campo images)
- Si el regex falla, avisa con el path manual a añadir

---

## Tests

```bash
npm run test       # modo watch
npm run test:run   # una pasada, sin watch
```

**Cobertura:** Home, ProjectDetail, FilterBar, ImageGallery.

**Patrón importante con AnimatePresence:** Las aserciones sobre elementos que aparecen después de una animación o redirect necesitan `waitFor`:
```js
// Correcto:
await waitFor(() => expect(screen.getByText('404')).toBeInTheDocument())

// También para elementos que desaparecen:
await waitFor(() => expect(dialog).not.toBeInTheDocument())
```

**Default en ImageGallery:** El parámetro `images` debe tener `= []` por defecto para evitar crash si se llama sin prop.

---

## Scripts npm disponibles

```bash
npm run dev              # servidor de desarrollo (Vite, por defecto puerto 5173)
npm run build            # build de producción en dist/
npm run preview          # preview del build en puerto 4173
npm run test             # Vitest en modo watch
npm run test:run         # Vitest una pasada
npm run lint             # ESLint
npm run generate-image   # alias de node src/scripts/generate-image.js
```

---

## Pendientes (TODOS.md)

| Tarea | Prioridad | Estado |
|-------|-----------|--------|
| OG tags + `<title>` dinámico por ruta | Media | **Pendiente** |
| ProjectDetail: migrar a CSS custom properties (theme-aware) | Media | **Pendiente** |
| Dominio propio (h3nky.dev) | Baja | **Pendiente** — requiere deploy primero |
| Deploy en Vercel | Pendiente | **Pendiente** |
| Sección de artículos estilo "C" (mono, editorial) | Baja | Deferred — futuro |

**Ya hecho:**
- Grid 2-3 columnas
- Hero section con intro personal
- Subtítulo personal
- Máximo 3 badges por card + "+N"
- Fix espaciado inferior
- Light/dark mode toggle completo
- Generación de imágenes con Pollinations.ai (reemplaza Replicate)
- Profundidad visual en modo claro (dot grid + gradientes)

---

## Git — historial de commits relevante

```
5a2be8c feat: profundidad visual en modo claro
ac5bf12 feat: light/dark mode + rediseño visual (E + D + A)
1b9a6ac feat: generación de imágenes con Pollinations.ai, elimina Replicate
ef32c40 feat: hero section, subtítulo personal, badges limitados a 3, spacing fix
8a3dc39 feat: mover portfolio del worktree al proyecto principal
285cb6c feat: portfolio completo con React Router + Framer Motion + tests
```

---

## Normas de trabajo con Claude

- **Editar siempre en `/home/user/mi-portfolio-proyectos/`** — nunca en `.claude/worktrees/*`
- Los commits se hacen desde el proyecto principal con `cd /home/user/mi-portfolio-proyectos && git ...`
- El shell de Claude resetea el cwd al worktree tras cada comando — usar siempre rutas absolutas o `cd` al inicio de cada comando bash

---

## Variables de entorno

**No hay ninguna.** El proyecto no usa `.env`. Pollinations.ai no requiere API key.

`.gitignore` incluye: `node_modules/`, `dist/`, `.env*`

---

## Próximos pasos sugeridos (orden lógico)

1. **Migrar ProjectDetail.jsx** a CSS custom properties para que sea theme-aware en modo claro
2. **Añadir `<title>` dinámico** en Home y ProjectDetail (una línea cada uno, React 19 lo soporta nativamente)
3. **Deploy en Vercel** — conectar repo de GitHub, auto-deploy al hacer push a main
4. **Dominio propio** — configurar en Vercel > Settings > Domains
5. **Añadir más proyectos** al portfolio con `projects.js` + `generate-image.js`

---

## Arquitectura basada en proyectos (migración 2026-04-20)

### Nuevas rutas `/app/*`
- `/app/projects` — Lista de proyectos del usuario (protegida con Google Auth)
- `/app/projects/:slug` — Shell lateral con módulos (sidebar con nav)
- `/app/projects/:slug/calendar` — Calendario FullCalendar con drag/drop
- `/app/projects/:slug/shopping` — Lista de la compra + Menú semanal (2 columnas)
- `/app/projects/:slug/recipes` — Recetas con sugerencias IA
- `/app/projects/:slug/recipes/:recipeId` — Detalle de receta

### Tablas Supabase (6 tablas, todas con RLS)
- `projects` — Proyectos del usuario (id, name, slug, icon, owner_id)
- `project_members` — Miembros invitados (project_id, user_id, role, invited_email, accepted)
- `calendar_tasks` — Tareas del calendario (project_id, title, start_time, end_time, all_day, color)
- `shopping_items` — Lista de la compra (project_id, name, quantity NUMERIC, unit, category, checked)
- `menu_items` — Menú semanal (project_id, week_start DATE, day_of_week 0-6, meal_type enum, custom_name)
- `recipes` — Recetas (project_id, title, ingredients JSONB, instructions, tags TEXT[], prep_time, cook_time, servings, ai_generated)

### Variables de entorno necesarias
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_FUNCTIONS_URL=...
VITE_ANTHROPIC_API_KEY=sk-ant-...   ← necesaria para Recetas con IA
```

### Arquitectura de datos
Todos los datos (tareas, compras, menús, recetas) pertenecen a un **proyecto** vía `project_id`. Los proyectos pueden compartirse con otros usuarios via `project_members`. El primer acceso auto-crea un proyecto "Hogar 🏠".
