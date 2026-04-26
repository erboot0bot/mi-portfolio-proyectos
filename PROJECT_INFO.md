# PROJECT_INFO.md
# Generado el 2026-04-22 — Output completo de GATHER_INFO.md

---

## SECCIÓN 1: ESTRUCTURA DE DIRECTORIOS

=== ÁRBOL COMPLETO DEL PROYECTO PORTFOLIO ===
.
./.env.local
./eslint.config.js
./ESTADO-PROYECTO.md
./.gitignore
./index.html
./.npmrc
./package.json
./package-lock.json
./public
./public/favicon.svg
./public/icons
./public/icons/icon-base-192.png
./public/icons/icon-base-512.png
./public/icons/icon-base.svg
./public/icons/icon-calendar-192.png
./public/icons/icon-calendar-512.png
./public/icons/icon-calendar.svg
./public/icons/icon-menu-192.png
./public/icons/icon-menu-512.png
./public/icons/icon-menu.svg
./public/icons/icon-recipes-192.png
./public/icons/icon-recipes-512.png
./public/icons/icon-recipes.svg
./public/icons/icon-shopping-192.png
./public/icons/icon-shopping-512.png
./public/icons/icon-shopping.svg
./public/icons.svg
./public/manifest.json
./public/og-cover.webp
./public/projects/ai-dev-setup/cover.jpg
./public/projects/hogar/cover.jpg
./public/projects/portfolio-config/cover.jpg
./public/projects/portfolio-personal/cover.jpg
./public/projects/vercel-deploy/cover.jpg
./public/robots.txt
./public/sitemap.xml
./README.md
./scripts
./scripts/generate-icons.js
./scripts/generate-image.js
./scripts/generate-og-cover.js
./src
./src/App.css
./src/App.jsx
./src/App.test.jsx
./src/assets/hero.png
./src/assets/react.svg
./src/assets/vite.svg
./src/components/BottomSheet.css
./src/components/BottomSheet.jsx
./src/components/ComingSoonPage.jsx
./src/components/FilterBar.jsx
./src/components/FilterBar.test.jsx
./src/components/ImageGallery.jsx
./src/components/ImageGallery.test.jsx
./src/components/Layout.jsx
./src/components/ModuleTopNav.css
./src/components/ModuleTopNav.jsx
./src/components/ProjectCard.jsx
./src/components/ProtectedRoute.jsx
./src/components/ProtectedRoute.test.jsx
./src/components/TechBadge.jsx
./src/contexts/AuthContext.jsx
./src/contexts/AuthContext.test.jsx
./src/contexts/ProjectContext.jsx
./src/data/apps.js
./src/data/projects.js
./src/hooks/usePWAManifest.js
./src/index.css
./src/lib/supabase.js
./src/main.jsx
./src/pages/app/HogarLayout.jsx
./src/pages/app/modules/Calendar.css
./src/pages/app/modules/Calendar.jsx
./src/pages/app/modules/Menu.jsx
./src/pages/app/modules/ModuleShell.css
./src/pages/app/modules/ModuleShell.jsx
./src/pages/app/modules/RecipeDetail.jsx
./src/pages/app/modules/Recipes.jsx
./src/pages/app/modules/ShoppingList.jsx
./src/pages/app/modules/Welcome.jsx
./src/pages/app/ProjectDetail.jsx
./src/pages/AppsHub.jsx
./src/pages/LandingPage.jsx
./src/pages/Login.jsx
./src/pages/NotFound.jsx
./src/pages/ProjectDetail.jsx
./src/pages/ProjectDetail.test.jsx
./src/pages/ProjectsHome.edge.test.jsx
./src/pages/ProjectsHome.jsx
./src/pages/ProjectsHome.test.jsx
./src/test-setup.js
./supabase/config.toml
./supabase/functions/generate-recipe/index.ts
./supabase/migrations/20260420_calendar_recurrence.sql
./supabase/migrations/20260421_modulos_store_mealtype.sql
./supabase/migrations/20260421_shopping_improvements.sql
./supabase/migrations/20260422_project_members_rls.sql
./supabase/schema.sql
./TODOS.md
./vercel.json
./vite.config.js

=== ÁRBOL COMPLETO DEL PROYECTO HOGAR ===
Hogar NO es un repo separado — es un subdirectorio integrado en este mismo proyecto.
Rutas relevantes: src/pages/app/ y supabase/

---

## SECCIÓN 2: PACKAGE.JSON

=== PACKAGE.JSON — PORTFOLIO ===
```json
{
  "name": "mi-portfolio-proyectos",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "generate-image": "node scripts/generate-image.js"
  },
  "dependencies": {
    "@fullcalendar/daygrid": "^6.1.20",
    "@fullcalendar/interaction": "^6.1.20",
    "@fullcalendar/list": "^6.1.20",
    "@fullcalendar/react": "^6.1.20",
    "@fullcalendar/timegrid": "^6.1.20",
    "@supabase/supabase-js": "^2.103.3",
    "date-fns": "^4.1.0",
    "framer-motion": "^12.38.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-router-dom": "^7.14.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@tailwindcss/vite": "^4.2.2",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.4.0",
    "jsdom": "^29.0.2",
    "sharp": "^0.34.5",
    "tailwindcss": "^4.2.2",
    "vite": "^8.0.4",
    "vite-plugin-pwa": "^1.2.0",
    "vitest": "^4.1.4"
  }
}
```

=== PACKAGE.JSON — HOGAR ===
Ver en repo de Hogar — Hogar está integrado en este mismo proyecto, no tiene package.json separado.

---

## SECCIÓN 3: CONFIGURACIONES CORE

=== VITE.CONFIG ===
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg}'],
      },
    }),
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/react-dom') || id.includes('/node_modules/react/')) {
            return 'vendor'
          }
          if (id.includes('/node_modules/react-router-dom') || id.includes('/node_modules/react-router/')) {
            return 'router'
          }
          if (id.includes('/node_modules/framer-motion')) {
            return 'animations'
          }
        },
      },
    },
  },
  server: { port: 5173 },
  preview: { port: 4173 },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    globals: true,
    exclude: ['node_modules', '.claude'],
  },
})
```

=== VERCEL.JSON ===
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options",        "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy",        "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

=== .ESLINTRC / ESLINT CONFIG ===
```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
```

=== TAILWIND / CSS PRINCIPAL (src/index.css) ===
```css
@import "tailwindcss";

/* Class-based dark mode for Tailwind v4 */
@custom-variant dark (&:where(.dark, .dark *));

*, *::before, *::after { box-sizing: border-box; }

html {
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-full: 9999px;
  --nav-height: 56px;
  --nav-shadow: 0 1px 0 var(--border);
  --nav-shadow-scrolled: 0 2px 12px rgba(0,0,0,0.18);
  --transition: 200ms ease-out;
  --surface: var(--bg-card);
  --surface-2: var(--bg-subtle);

  /* Light mode tokens */
  --bg: #fffcf9; --bg-subtle: #faf8f5; --bg-card: #ffffff;
  --border: #e4e4e7; --border-hover: #f97316;
  --text: #09090b; --text-muted: #71717a; --text-faint: #a1a1aa;
  --accent: #f97316; --accent-hover: #ea6c0a;
  --badge-bg: #fff7ed; --badge-text: #c2410c; --badge-border: #fed7aa;
  --nav-bg: rgba(255,252,249,0.88);
  --dot-color: rgba(249,115,22,0.09);
}

html.dark {
  --bg: #0a0a0f; --bg-subtle: #0f0f18; --bg-card: #0f0f18;
  --border: rgba(255,255,255,0.07); --border-hover: rgba(249,115,22,0.5);
  --text: #f4f4f5; --text-muted: #71717a; --text-faint: #71717a;
  --accent: #f97316; --accent-hover: #fb923c;
  --badge-bg: rgba(249,115,22,0.08); --badge-text: #fb923c; --badge-border: rgba(249,115,22,0.2);
  --nav-bg: rgba(10,10,15,0.85);
  --dot-color: rgba(255,255,255,0.028);
}

body {
  margin: 0;
  background-color: var(--bg);
  color: var(--text);
  font-family: 'Inter', system-ui, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  transition: background-color 0.2s ease, color 0.2s ease;
  background-image: radial-gradient(circle, var(--dot-color) 1px, transparent 1px);
  background-size: 26px 26px;
}

#root { display: contents; }
```

=== ROBOTS.TXT ===
```
User-agent: *
Allow: /
Sitemap: https://h3nky.dev/sitemap.xml
```

=== SITEMAP.XML ===
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://h3nky.dev/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://h3nky.dev/projects</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://h3nky.dev/projects/portfolio-personal</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://h3nky.dev/projects/ai-dev-setup</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://h3nky.dev/projects/portfolio-config</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://h3nky.dev/projects/vercel-deploy</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
</urlset>
```

---

## SECCIÓN 4: ARCHIVOS FUENTE PRINCIPALES — PORTFOLIO

=== APP.JSX ===
```jsx
import React, { Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ComingSoonPage from './components/ComingSoonPage'

const LandingPage   = React.lazy(() => import('./pages/LandingPage'))
const ProjectsHome  = React.lazy(() => import('./pages/ProjectsHome'))
const ProjectDetail = React.lazy(() => import('./pages/ProjectDetail'))
const Login         = React.lazy(() => import('./pages/Login'))
const NotFound      = React.lazy(() => import('./pages/NotFound'))
const AppsHub       = React.lazy(() => import('./pages/AppsHub'))
const HogarLayout   = React.lazy(() => import('./pages/app/HogarLayout'))
const Welcome       = React.lazy(() => import('./pages/app/modules/Welcome'))
const Calendar      = React.lazy(() => import('./pages/app/modules/Calendar'))
const ShoppingList  = React.lazy(() => import('./pages/app/modules/ShoppingList'))
const Menu          = React.lazy(() => import('./pages/app/modules/Menu'))
const Recipes       = React.lazy(() => import('./pages/app/modules/Recipes'))
const RecipeDetail  = React.lazy(() => import('./pages/app/modules/RecipeDetail'))

// ErrorBoundary class component (captura errores de render)
// pageVariants: { initial: {opacity:0, y:10}, animate: {opacity:1, y:0}, exit: {opacity:0, y:-10} }

// Rutas:
// /                          → LandingPage
// /projects                  → ProjectsHome
// /projects/:slug            → ProjectDetail
// /courses                   → ComingSoonPage
// /store                     → ComingSoonPage
// /login                     → Login
// /apps                      → ProtectedRoute > AppsHub
// /app/projects/hogar        → ProtectedRoute > HogarLayout
//   index                    → Welcome
//   calendar                 → Calendar
//   shopping                 → ShoppingList
//   menu                     → Menu
//   recipes                  → Recipes
//   recipes/:recipeId        → RecipeDetail
// /404                       → NotFound
// *                          → Navigate to /404
```

=== MAIN.JSX ===
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
```

=== DATA/PROJECTS.JS ===
```js
export const projects = [
  {
    slug: 'hogar',
    shortTitle: 'Hogar',
    gradientFrom: '#ea580c', gradientVia: '#9a3412', gradientTo: '#7c2d12',
    title: 'Hogar — Apps del día a día',
    description: 'Calendario, lista de la compra, menú semanal y recetas con IA. Autenticación con Google vía Supabase.',
    longDescription: 'Aplicación personal compuesta por tres módulos integrados...',
    status: 'wip', featured: true,
    technologies: ['React', 'Supabase', 'Claude AI', 'FullCalendar', 'Google OAuth'],
    github: null, demo: null,
    images: ['/projects/hogar/cover.jpg'],
    date: '2026-04',
  },
  {
    slug: 'portfolio-personal',
    shortTitle: 'Portfolio',
    gradientFrom: '#f97316', gradientVia: '#f59e0b', gradientTo: '#d97706',
    title: 'Portfolio Personal',
    description: 'Esta misma web — documentación de proyectos con React, Vite, Tailwind y Framer Motion.',
    longDescription: 'Una web de portfolio construida desde cero sin ser desarrollador, usando IA...',
    status: 'wip', featured: true,
    technologies: ['React', 'Vite', 'Tailwind', 'Framer Motion', 'Vitest'],
    github: 'https://github.com/H3nky/mi-portfolio-proyectos', demo: null,
    images: ['/projects/portfolio-personal/cover.jpg'],
    date: '2026-04',
  },
  {
    slug: 'ai-dev-setup',
    shortTitle: 'AI Setup',
    gradientFrom: '#7c3aed', gradientVia: '#5b21b6', gradientTo: '#4c1d95',
    title: 'Setup de Desarrollo con IA',
    description: 'Configuración completa de Claude Code + gstack para desarrollar como un equipo de 20.',
    status: 'completed', featured: true,
    technologies: ['Claude Code', 'gstack', 'AI', 'Prompt Engineering'],
    github: null, demo: null,
    images: ['/projects/ai-dev-setup/cover.jpg'],
    date: '2026-04',
  },
  {
    slug: 'portfolio-config',
    shortTitle: 'Config',
    gradientFrom: '#0ea5e9', gradientVia: '#0284c7', gradientTo: '#0369a1',
    title: 'Portfolio con React + Vite + Tailwind v4',
    description: 'Arquitectura y decisiones técnicas detrás de este mismo portfolio.',
    status: 'wip', featured: true,
    technologies: ['React', 'Vite', 'Tailwind', 'Framer Motion', 'Vitest', 'Pollinations.ai'],
    github: null, demo: null,
    images: ['/projects/portfolio-config/cover.jpg'],
    date: '2026-04',
  },
  {
    slug: 'vercel-deploy',
    shortTitle: 'CI/CD',
    gradientFrom: '#18181b', gradientVia: '#27272a', gradientTo: '#3f3f46',
    title: 'Deploy y CI/CD con Vercel',
    description: 'De localhost a producción: sincronización con GitHub y deploy automático.',
    status: 'completed', featured: false,
    technologies: ['Vercel', 'GitHub', 'CI/CD', 'DNS'],
    github: null, demo: null,
    images: ['/projects/vercel-deploy/cover.jpg'],
    date: '2026-04',
  },
]
```

=== ROUTER / RUTAS ===
El router está en App.jsx (no hay archivo router separado). Ver SECCIÓN 4 App.jsx arriba.

=== TODOS LOS ARCHIVOS EN PAGES/ ===

--- src/pages/LandingPage.jsx ---
Página de entrada principal. Secciones:
- HeroSection: título "Herramientas reales, construidas de verdad." + CTAs (Explorar Apps, Ver Proyectos)
- SectionsGrid: grid 4 columnas con cards de secciones (Apps, Proyectos, Cursos, Tienda)
- AboutSection: bio personal de H3nky

--- src/pages/ProjectsHome.jsx (también llamado Home.jsx internamente) ---
- Hero split: texto + mini-lista de featured (lg:grid-cols-2)
- Grid de proyectos: 1/2/3/4 columnas responsive
- FilterBar por tecnología
- Ordena: featured primero, luego por date desc

--- src/pages/ProjectDetail.jsx ---
- Hero cinematográfico full-bleed con imagen/gradiente + título superpuesto
- 2 columnas: prose (descripción, badges, galería) + sidebar sticky (estado, fecha, links)
- Si slug inválido → <Navigate to="/404" replace />

--- src/pages/AppsHub.jsx ---
- Grid de apps disponibles (actualmente solo Hogar activo)
- Muestra usuario de Google, botón cerrar sesión

--- src/pages/Login.jsx ---
- Formulario simple con botón "Continuar con Google" (OAuth via Supabase)
- Redirige a /apps si ya autenticado

--- src/pages/NotFound.jsx ---
- Página 404 simple con enlace a inicio

--- src/pages/app/HogarLayout.jsx ---
- Carga el proyecto Hogar del usuario (owner_id = user.id)
- Nav lateral desktop + nav inferior mobile con 4 módulos
- Provee <ProjectProvider project={project}>

--- src/pages/app/modules/Welcome.jsx ---
- Pantalla de bienvenida del módulo Hogar

--- src/pages/app/modules/Calendar.jsx ---
- FullCalendar con vistas month/week/day/list
- CRUD completo de eventos (título, descripción, color, all_day, recurrencia)
- Datos en Supabase tabla calendar_tasks
- Campo recurrence: 'none'|'daily'|'weekdays'|'weekly'|'monthly'
- 629 líneas

--- src/pages/app/modules/ShoppingList.jsx ---
- Lista de la compra por categorías
- Check/uncheck items, limpieza de marcados
- Columna store (campo añadido en migración)
- purchase_history tabla para historial
- 581 líneas

--- src/pages/app/modules/Menu.jsx ---
- Grid editable 7 días × N comidas (desayuno, almuerzo, comida, cena, snack)
- Datos en menu_items
- 485 líneas

--- src/pages/app/modules/Recipes.jsx ---
- Galería de recetas guardadas
- Generación de recetas con IA (llama a Edge Function generate-recipe)
- Guardar receta generada en colección personal
- 628 líneas

--- src/pages/app/modules/RecipeDetail.jsx ---
- Vista detalle de una receta (ingredientes, instrucciones, tags)
- Opción de eliminar receta
- 234 líneas

--- src/pages/app/modules/ModuleShell.jsx ---
- Shell reutilizable para módulos con nav top (ModuleTopNav)

--- src/pages/app/ProjectDetail.jsx ---
- Vista de detalle de proyecto Hogar (diferente de la ProjectDetail pública)

=== TODOS LOS ARCHIVOS EN COMPONENTS/ ===

--- src/components/Layout.jsx (263 líneas) ---
- Shell principal: nav sticky + footer + toggle dark/light
- Dark mode: lee localStorage → 'theme', fallback a prefers-color-scheme
- UserAvatar dropdown con cierre de sesión
- Nav desktop: Inicio, Proyectos, Apps, Cursos, Tienda, GitHub, toggle tema, login/avatar

--- src/components/ProjectCard.jsx (117 líneas) ---
- Card del grid: CardCover (gradiente generativo o imagen) + metadata + badges
- Framer Motion whileHover: {y: -3}
- Máximo 3 TechBadge + "+N" si hay más

--- src/components/TechBadge.jsx (32 líneas) ---
- Pill de tecnología
- Light: orange-50/orange-700/orange-100
- Dark: zinc-800/zinc-300/zinc-700

--- src/components/FilterBar.jsx (35 líneas) ---
- Pills de filtro por tecnología
- Activo: bg-[var(--accent)] text-white
- Clic doble en mismo filtro → deselecciona (vuelve a "Todos")

--- src/components/ImageGallery.jsx (180 líneas) ---
- Grid de thumbnails + lightbox accesible (focus trap, WCAG 2.1)
- Teclado: ESC cierra, ArrowLeft/ArrowRight navega
- Touch swipe (delta > 50px)
- AnimatePresence para transición del lightbox

--- src/components/ComingSoonPage.jsx (33 líneas) ---
- Página genérica "En desarrollo" para /courses y /store

--- src/components/BottomSheet.jsx (20 líneas) ---
- Componente de drawer desde abajo (mobile)

--- src/components/ModuleTopNav.jsx (75 líneas) ---
- Nav superior para módulos Hogar: leftAction, rightAction, extraAction, tabs
- Detecta scroll y añade clase 'scrolled'

--- src/components/ProtectedRoute.jsx (18 líneas) ---
- Guarda rutas: spinner durante loading, redirige a /login si no autenticado

=== CONTEXTS ===

--- src/contexts/AuthContext.jsx ---
```jsx
// Gestiona: user, loading, signInWithGoogle, signOut
// supabase.auth.getSession() al montar + onAuthStateChange listener
// signInWithGoogle: OAuth con redirectTo = ${origin}/apps
```

--- src/contexts/ProjectContext.jsx ---
```jsx
// Provee el proyecto activo a los módulos Hogar
// useProject() hook
```

=== HOOKS PERSONALIZADOS ===

--- src/hooks/usePWAManifest.js (73 líneas) ---
```js
// Cambia dinámicamente el manifest PWA según el módulo activo
// Módulos: shopping, calendar, menu, recipes
// Actualiza: link#pwa-manifest, apple-icon, theme-color, document.title
// Restaura al desmontar
```

---

## SECCIÓN 5: SCRIPTS

--- scripts/generate-icons.js ---
```js
// Genera PNGs 192x512 desde SVGs usando sharp
// Input: public/icons/{name}.svg
// Output: public/icons/{name}-192.png, {name}-512.png
// Iconos: icon-base, icon-shopping, icon-calendar, icon-menu, icon-recipes
```

--- scripts/generate-image.js ---
```js
// Genera imagen de portada para proyectos usando Pollinations.ai (sin API key)
// Uso: node scripts/generate-image.js --slug <slug> [--description "..."] [--force]
// Prompt: "Dark-themed developer portfolio cover for project..." + stack
// Output: public/projects/{slug}/cover.webp
// Actualiza automáticamente images[] en src/data/projects.js
// AbortController 15s timeout, logger con timestamps ANSI
```

--- scripts/generate-og-cover.js ---
```js
// Genera imagen OG del portfolio (1200×630px)
// Uso: node scripts/generate-og-cover.js [--force]
// Output: public/og-cover.webp
// Prompt fijo: "Minimalist dark developer portfolio cover..."
// AbortController 20s timeout
```

---

## SECCIÓN 6: TESTS

=== VITEST CONFIG ===
No existe vitest.config.js separado — la configuración está en vite.config.js:
```js
test: {
  environment: 'jsdom',
  setupFiles: ['./src/test-setup.js'],
  globals: true,
  exclude: ['node_modules', '.claude'],
}
```

=== src/test-setup.js ===
```js
import '@testing-library/jest-dom'
// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})
```

=== ARCHIVOS DE TEST ===

--- src/App.test.jsx ---
- 9 tests de routing (LandingPage, ProjectsHome, ComingSoonPage /courses y /store,
  redirect /apps→/login, NotFound, redirect *→/404, ProjectDetail válido/inválido)
- Mock de AuthContext (user: null, loading: false)
- Usa MemoryRouter + waitFor(timeout: 5000) para lazy loading

--- src/pages/ProjectDetail.test.jsx ---
- 6 tests: título, back link, tech badges, botón GitHub, sin demo, slug inválido→404

--- src/pages/ProjectsHome.test.jsx ---
- 5 tests: heading, cards, filtro activo, filtrar por tech, doble clic deselecciona

--- src/pages/ProjectsHome.edge.test.jsx ---
- 3 tests con datos mockeados (1 proyecto solo React): sin featured, filtro activo, sin mensaje vacío

--- src/components/FilterBar.test.jsx ---
- 5 tests: botones techs, botón Todos, onChange con tech/null, techs vacío→null

--- src/components/ImageGallery.test.jsx ---
- 8 tests: vacío, undefined, thumbnails, abrir lightbox, cerrar, contador, nav siguiente/anterior

--- src/components/ProtectedRoute.test.jsx ---
- 3 tests: spinner loading, redirect sin auth, render con auth

--- src/contexts/AuthContext.test.jsx ---
- 1 test: loading→false, user→null cuando session es null

---

## SECCIÓN 7: SUPABASE / HOGAR

=== SUPABASE CONFIG ===
```js
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

=== EDGE FUNCTIONS ===

--- supabase/functions/generate-recipe/index.ts ---
```ts
// Runtime: Deno
// Usa: @anthropic-ai/sdk@0.39.0 (npm:), @supabase/supabase-js@2 (esm.sh)
// Autenticación: verifica JWT del header Authorization
// Input JSON: { ingredients, servings, restrictions, timeMinutes }
// Modelo: claude-haiku-4-5-20251001, max_tokens: 3000
// Output: array de 3 recetas en JSON puro
// Formato receta: { title, ingredients[{name,quantity,unit}], instructions, prep_time, cook_time, servings, tags }
// CORS: headers completos, maneja OPTIONS preflight
```

=== MIGRACIONES SQL ===

--- supabase/migrations/20260420_calendar_recurrence.sql ---
```sql
ALTER TABLE calendar_tasks
ADD COLUMN IF NOT EXISTS recurrence TEXT NOT NULL DEFAULT 'none'
CHECK (recurrence IN ('none', 'daily', 'weekdays', 'weekly', 'monthly'));
```

--- supabase/migrations/20260421_modulos_store_mealtype.sql ---
```sql
-- Añade columna store a shopping_items
ALTER TABLE shopping_items ADD COLUMN IF NOT EXISTS store TEXT DEFAULT 'General';
-- Expande CHECK de meal_type en menu_items (añade español: almuerzo, comida, cena, desayuno)
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_meal_type_check;
ALTER TABLE menu_items ADD CONSTRAINT menu_items_meal_type_check
  CHECK (meal_type IN ('breakfast','lunch','dinner','snack','almuerzo','comida','cena','desayuno'));
```

--- supabase/migrations/20260421_shopping_improvements.sql ---
```sql
-- Añade checked_at (timestamptz) y price_unit (numeric 10,2) a shopping_items
ALTER TABLE shopping_items
  ADD COLUMN IF NOT EXISTS checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS price_unit numeric(10,2);

-- Nueva tabla purchase_history
CREATE TABLE IF NOT EXISTS purchase_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  store text NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  items jsonb NOT NULL,
  item_count int,
  total_price numeric(10,2),
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "own purchases" ON purchase_history
  USING (auth.uid() = user_id);
```

--- supabase/migrations/20260422_project_members_rls.sql ---
```sql
-- Propietarios pueden gestionar membresía de sus proyectos
CREATE POLICY "members_by_owner" ON project_members FOR ALL
  USING (project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid()));
-- Usuarios ven sus propias membresías
CREATE POLICY "members_read_own" ON project_members FOR SELECT
  USING (user_id = auth.uid());
```

=== SCHEMA SQL COMPLETO ===
```sql
-- Tablas:
-- projects: id, name, slug, icon, owner_id→auth.users, created_at
-- project_members: project_id, user_id, role (owner/editor/viewer), invited_email, accepted, PK(project_id,user_id)
-- calendar_tasks: id, project_id, title, description, start_time, end_time, all_day, color, created_at
-- shopping_items: id, project_id, name, quantity NUMERIC, unit, category, checked, created_at
-- menu_items: id, project_id, week_start DATE, day_of_week 0-6, meal_type CHECK, recipe_id, custom_name, created_at
-- recipes: id, project_id, title, ingredients JSONB, instructions, tags TEXT[], prep_time, cook_time, servings, image_url, ai_generated, created_at

-- RLS habilitado en todas las tablas

-- Políticas:
-- projects: "project_owner" → owner_id = auth.uid()
-- projects: "project_member_read" → SELECT para miembros
-- calendar_tasks: "tasks_by_project_member" → owner OR miembro aceptado
-- shopping_items: "shopping_by_member" → owner OR miembro aceptado
-- menu_items: "menu_by_member" → owner OR miembro aceptado
-- recipes: "recipes_by_member" → owner OR miembro aceptado
-- project_members: "members_by_owner" → propietario gestiona
-- project_members: "members_read_own" → SELECT propio
-- purchase_history: "own purchases" → user_id = auth.uid()
```

=== AUTH CONTEXT ===
Ver SECCIÓN 4 — Contexts.

=== MÓDULOS DE HOGAR ===
Ver SECCIÓN 4 — Todos los archivos en pages/ (Calendar, ShoppingList, Menu, Recipes, RecipeDetail).

---

## SECCIÓN 8: MÉTRICAS DE BUILD

=== BUILD OUTPUT ===
✓ built in 1.62s
PWA v1.2.0 — mode: generateSW — precache: 47 entries (893.54 KiB)

=== TAMAÑO DE BUNDLES (dist/assets/) ===
| Chunk                    | Tamaño    | Gzip      |
|--------------------------|-----------|-----------|
| vendor (React + ReactDOM)| 181.83 kB | 57.22 kB  |
| supabase                 | 186.80 kB | 48.64 kB  |
| animations (Framer)      | 132.26 kB | 43.34 kB  |
| router (react-router-dom)| 41.62 kB  | 14.75 kB  |
| format (date-fns)        | 19.35 kB  | 5.58 kB   |
| index (shared)           | 16.83 kB  | 4.99 kB   |
| Calendar (FullCalendar)  | 15.14 kB  | 4.88 kB   |
| Menu                     | 26.13 kB  | 6.62 kB   |
| ShoppingList             | 19.52 kB  | 5.00 kB   |
| Recipes                  | 23.04 kB  | 5.70 kB   |
| ProjectsHome             | 9.19 kB   | 2.98 kB   |
| ProjectDetail            | 9.16 kB   | 3.08 kB   |
| index.css                | 44.59 kB  | 8.51 kB   |
| Calendar.css             | 10.11 kB  | 2.32 kB   |

=== LÍNEAS DE CÓDIGO POR ARCHIVO (top 30, sin tests) ===
| Líneas | Archivo |
|--------|---------|
| 629    | src/pages/app/modules/Calendar.jsx |
| 628    | src/pages/app/modules/Recipes.jsx |
| 581    | src/pages/app/modules/ShoppingList.jsx |
| 485    | src/pages/app/modules/Menu.jsx |
| 263    | src/components/Layout.jsx |
| 234    | src/pages/app/modules/RecipeDetail.jsx |
| 197    | src/pages/app/ProjectDetail.jsx |
| 186    | src/pages/ProjectDetail.jsx |
| 180    | src/components/ImageGallery.jsx |
| 174    | src/pages/LandingPage.jsx |
| 171    | src/pages/ProjectsHome.jsx |
| 123    | src/pages/app/HogarLayout.jsx |
| 120    | src/App.jsx |
| 117    | src/components/ProjectCard.jsx |
|  98    | src/data/projects.js |
|  90    | src/pages/AppsHub.jsx |
|  75    | src/components/ModuleTopNav.jsx |
|  73    | src/hooks/usePWAManifest.js |
|  55    | src/pages/Login.jsx |
|  46    | src/contexts/AuthContext.jsx |
|  38    | src/pages/app/modules/ModuleShell.jsx |
|  35    | src/components/FilterBar.jsx |
|  33    | src/components/ComingSoonPage.jsx |
|  32    | src/components/TechBadge.jsx |
|  29    | src/data/apps.js |
|  20    | src/pages/NotFound.jsx |
|  20    | src/components/BottomSheet.jsx |
|  18    | src/components/ProtectedRoute.jsx |
|  17    | src/contexts/ProjectContext.jsx |
| 4807   | **TOTAL** |

=== NÚMERO TOTAL DE COMPONENTES ===
12 archivos en src/components/

=== GIT LOG (últimos 20 commits) ===
```
96ddddd security: migrar IA a Edge Function + JWT auth + .gitignore + RLS members
d664de0 feat: og-cover.webp generado para previews en redes sociales
bc6456e chore: eslint disable para motion false-positive + actualiza ESTADO-PROYECTO
668c778 fase-4: production readiness — SEO, seguridad, build optimizado
4cdd435 fase-3: generate-image.js mejorado y tests edge cases
7f42473 fase-2: lazy loading por ruta, move generate-image.js a scripts/
3c44fd9 fase-1: título dinámico por ruta, ErrorBoundary y fix NotFound theme-aware
fe6f6d9 fix: añadir .npmrc con legacy-peer-deps para Vercel
c3e161a docs: añadir planes de arquitectura y refactor web
28eda31 chore: añadir @testing-library/dom como dependencia explícita
977b8d8 fix(ModuleShell): usar ruta absoluta fija en lugar de useParams().slug
ddcff5a fix(HogarLayout): cargar proyecto por owner_id en vez de slug fijo
b55f1cf feat: reestructuración web — LandingPage, AppsHub, HogarLayout, nuevas rutas
03138e2 feat: reestructuración web — LandingPage, AppsHub, HogarLayout, nuevas rutas
efa9389 feat: ShoppingList improvements, PWA icons, mobile redesign
3102833 fix(calendar): corregir desfase horario UTC+2
e020f1b fix: add missing ModuleShell.jsx and ModuleShell.css to git
9d5a3dc fix(modules): wrap ShoppingList, Menu, Recipes with ModuleShell
4f4ccf7 fix(calendar): sidebar unificada con nav del proyecto + mini calendario
d3b1c43 feat(hogar): rediseño módulos Lista, Menú y Recetas
```

=== GIT STATS ===
Total commits: 65
Único autor: H3nky

---

## SECCIÓN 9: VARIABLES DE ENTORNO

=== VARIABLES DE ENTORNO UTILIZADAS (solo nombres) ===
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_SUPABASE_FUNCTIONS_URL

(En la Edge Function se usan además SUPABASE_URL, SUPABASE_ANON_KEY, ANTHROPIC_API_KEY — variables del entorno Deno de Supabase, no del cliente)

=== .ENV.EXAMPLE ===
No existe archivo .env.example. Las variables necesarias son:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SUPABASE_FUNCTIONS_URL=https://xxxx.supabase.co/functions/v1
```

---

## SECCIÓN 10: INFORMACIÓN ADICIONAL MANUAL

### 1. ¿Cuántas rutas tiene el router y cuáles son?

**12 rutas definidas en App.jsx:**

| Ruta | Componente | Protegida |
|------|------------|-----------|
| `/` | LandingPage | No |
| `/projects` | ProjectsHome | No |
| `/projects/:slug` | ProjectDetail | No |
| `/courses` | ComingSoonPage (Cursos) | No |
| `/store` | ComingSoonPage (Tienda) | No |
| `/login` | Login | No |
| `/apps` | AppsHub | Sí (Google Auth) |
| `/app/projects/hogar` | HogarLayout > Welcome | Sí |
| `/app/projects/hogar/calendar` | Calendar | Sí |
| `/app/projects/hogar/shopping` | ShoppingList | Sí |
| `/app/projects/hogar/menu` | Menu | Sí |
| `/app/projects/hogar/recipes` | Recipes | Sí |
| `/app/projects/hogar/recipes/:recipeId` | RecipeDetail | Sí |
| `/404` | NotFound | No |
| `*` | → Navigate /404 | — |

### 2. ¿Qué tablas existen en Supabase?

**7 tablas (todas con RLS habilitado):**

| Tabla | Propósito |
|-------|-----------|
| `projects` | Proyectos del usuario (id, name, slug, icon, owner_id) |
| `project_members` | Membresía invitada (project_id, user_id, role, invited_email, accepted) |
| `calendar_tasks` | Tareas del calendario (title, start_time, end_time, all_day, color, recurrence) |
| `shopping_items` | Lista de la compra (name, quantity, unit, category, checked, store, checked_at, price_unit) |
| `menu_items` | Menú semanal (week_start, day_of_week 0-6, meal_type, recipe_id, custom_name) |
| `recipes` | Recetas (title, ingredients JSONB, instructions, tags TEXT[], prep_time, cook_time, servings, ai_generated) |
| `purchase_history` | Historial de compras (store, items JSONB, item_count, total_price, notes) |

### 3. ¿Qué Edge Functions de Supabase están implementadas y qué hacen?

**1 Edge Function: `generate-recipe`** (`supabase/functions/generate-recipe/index.ts`)

- **Runtime:** Deno
- **Autenticación:** Verifica JWT en header `Authorization` via `supabase.auth.getUser()`
- **Input:** `{ ingredients: string, servings: number, restrictions: string, timeMinutes: number }`
- **Modelo:** `claude-haiku-4-5-20251001` con `max_tokens: 3000`
- **Output:** Array de 3 recetas en JSON puro con formato: `[{title, ingredients[{name,quantity,unit}], instructions, prep_time, cook_time, servings, tags}]`
- **CORS:** Headers completos, maneja OPTIONS preflight

### 4. ¿Qué políticas RLS hay definidas?

**10 políticas totales:**

| Tabla | Policy | Acción | Condición |
|-------|--------|--------|-----------|
| `projects` | project_owner | ALL | owner_id = auth.uid() |
| `projects` | project_member_read | SELECT | id IN (project_members WHERE user_id = auth.uid()) |
| `calendar_tasks` | tasks_by_project_member | ALL | owner OR miembro aceptado |
| `shopping_items` | shopping_by_member | ALL | owner OR miembro aceptado |
| `menu_items` | menu_by_member | ALL | owner OR miembro aceptado |
| `recipes` | recipes_by_member | ALL | owner OR miembro aceptado |
| `project_members` | members_by_owner | ALL | project_id IN (projects WHERE owner_id = auth.uid()) |
| `project_members` | members_read_own | SELECT | user_id = auth.uid() |
| `purchase_history` | own purchases | ALL | user_id = auth.uid() |

### 5. ¿Cómo funciona el sistema de temas dark/light?

**Implementación en `src/components/Layout.jsx`:**

```js
// Al montar:
const saved = localStorage.getItem('theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const isDark = saved ? saved === 'dark' : prefersDark
setDark(isDark)
document.documentElement.classList.toggle('dark', isDark)

// Al hacer toggle:
const next = !dark
setDark(next)
document.documentElement.classList.toggle('dark', next)
localStorage.setItem('theme', next ? 'dark' : 'light')
```

**Clase `dark` en `<html>`** → activa los tokens CSS de `html.dark {}` definidos en `src/index.css`.

**Almacenamiento:** `localStorage` con key `'theme'` (valores: `'dark'` | `'light'`). Si no existe en localStorage, usa `prefers-color-scheme` del sistema.

**Tailwind v4:** Dark mode configurado con `@custom-variant dark (&:where(.dark, .dark *));` — permite usar `dark:` clases.

### 6. ¿Qué animaciones de Framer Motion se usan y en qué componentes?

| Componente | Animación |
|------------|-----------|
| `App.jsx` | `AnimatePresence` + `motion.div` con `pageVariants` para transiciones entre páginas (`opacity+y`, 200ms) |
| `ProjectCard.jsx` | `motion.div whileHover={{ y: -3 }}` — sube 3px al hover |
| `ProjectDetail.jsx` | `motion.div` stagger en hero (opacity+y), `motion.main` fade-in, `motion.aside` slide-x |
| `ProjectsHome.jsx` | `motion.div` stagger grid de links featured |
| `LandingPage.jsx` | `motion.div` stagger en SectionsGrid (hidden: opacity+y, show: visible) |
| `AppsHub.jsx` | `motion.div` stagger en grid de apps |
| `Login.jsx` | `motion.button` fade-in + `whileHover={{ y: -2 }}` |
| `ComingSoonPage.jsx` | spring en icon (scale+opacity), fade-in en texto |
| `ImageGallery.jsx` | `AnimatePresence` en lightbox, `motion.img` scale+opacity entre imágenes |

### 7. ¿El proyecto Hogar tiene su propio repo o es un subdirectorio del portfolio?

**Es un subdirectorio integrado en el mismo repo del portfolio.**

- Rutas de código: `src/pages/app/` y `src/pages/app/modules/`
- Backend: `supabase/` (funciones y migraciones en la raíz del mismo proyecto)
- No existe un `package.json` separado ni un `.git` separado para Hogar
- El primer commit que incluye Hogar es `b55f1cf feat: reestructuración web — LandingPage, AppsHub, HogarLayout, nuevas rutas`

### 8. ¿Hay algún error conocido, TODO o FIXME en el código?

**TODOs en TODOS.md (pendientes):**
- Dominio `h3nky.dev` en Vercel Settings → Domains (aún no configurado)
- El footer hardcodea `mi-portfolio-proyectos-five.vercel.app` en lugar del dominio real

**Comentario relevante en App.jsx:**
```js
import { AnimatePresence, motion } from 'framer-motion' // eslint-disable-line no-unused-vars
```
(motion se usa en JSX pero ESLint no lo detecta — suprimido intencionalmente)

**No hay FIXME en el código fuente.**

**Deuda conocida de ESTADO-PROYECTO.md:**
- Auditoría de imports: `no-unused-vars` pendiente
- El sitemap.xml no incluye la ruta `/app/projects/hogar` (protegida, no indexable — correcto)

### 9. ¿Qué versión exacta de cada dependencia principal?

Versiones instaladas (del package.json — prefijos `^` = semver compatible):

| Dependencia | Versión declarada |
|-------------|-------------------|
| React | ^19.2.4 |
| React DOM | ^19.2.4 |
| Vite | ^8.0.4 |
| Tailwind CSS | ^4.2.2 |
| @tailwindcss/vite | ^4.2.2 |
| Framer Motion | ^12.38.0 |
| React Router DOM | ^7.14.0 |
| @supabase/supabase-js | ^2.103.3 |
| @fullcalendar/react | ^6.1.20 |
| @fullcalendar/daygrid | ^6.1.20 |
| @fullcalendar/timegrid | ^6.1.20 |
| @fullcalendar/interaction | ^6.1.20 |
| @fullcalendar/list | ^6.1.20 |
| date-fns | ^4.1.0 |
| Vitest | ^4.1.4 |
| @testing-library/react | ^16.3.2 |
| @testing-library/jest-dom | ^6.9.1 |
| @testing-library/user-event | ^14.6.1 |
| sharp | ^0.34.5 |
| vite-plugin-pwa | ^1.2.0 |
| eslint | ^9.39.4 |

Edge Function usa: `@anthropic-ai/sdk@0.39.0` (npm: import en Deno)

### 10. ¿Hay algún archivo ESTADO-PROYECTO.md o TODOS.md?

**Sí, ambos existen en la raíz del proyecto.**

**TODOS.md** contiene:
- Pendiente: Dominio propio (h3nky.dev)
- Done: Grid 2-3 columnas, Hero section, Subtítulo personal, Máximo 3 badges, Fix espaciado inferior
- En progreso: OG Tags (done), Títulos dinámicos (done)

**ESTADO-PROYECTO.md** (ver contenido completo arriba en esta sección) contiene:
- Stack técnico completo con versiones
- Estructura de archivos
- Sistema de temas dark/light (implementación detallada)
- Decisiones de diseño (paleta, tipografía, hero, cards, filtros)
- Mejoras aplicadas por fases (1-4)
- Instrucciones para añadir proyectos
- Sistema de generación de imágenes
- Patrones de testing
- Scripts npm
- Arquitectura basada en proyectos (Supabase)
- Variables de entorno
- Próximos pasos sugeridos
- Normas de trabajo con Claude Code

---

*Fin de PROJECT_INFO.md — Generado el 2026-04-22*
