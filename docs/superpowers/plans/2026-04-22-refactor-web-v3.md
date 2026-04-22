# Documentación Técnica Final — Reestructuración Web H3nky
> **Versión:** 3.0 — Verificada con snapshot real del proyecto
> **Fecha:** 2026-04-22
> **Stack:** React 19 · Vite 8 · Tailwind v4 · React Router 7 · Framer Motion 12 · Supabase

---

## Decisiones confirmadas

| Pregunta | Decisión |
|----------|----------|
| ¿Mismo repo? | ✅ `mi-portfolio-proyectos` |
| ¿Auth? | ✅ Supabase + Google — `src/contexts/AuthContext.jsx` |
| ¿Sistema de creación de proyectos? | ❌ Eliminar `AppProjects` y `AppProjectDetail` |
| ¿Acceso a Hogar? | ✅ Abierto — cualquier cuenta Google |
| ¿Rutas internas de Hogar? | ✅ Sin tocar — solo cambia el wrapper |
| ¿Hero personal? | ❌ Quitar de home → hero de plataforma + sección "Sobre el creador" |

---

## Índice

1. [Estado real del proyecto (verificado)](#1-estado-real-del-proyecto-verificado)
2. [Qué cambia y qué no](#2-qué-cambia-y-qué-no)
3. [El problema del Outlet — decisión arquitectónica](#3-el-problema-del-outlet--decisión-arquitectónica)
4. [Nueva arquitectura de rutas](#4-nueva-arquitectura-de-rutas)
5. [Nueva estructura de archivos](#5-nueva-estructura-de-archivos)
6. [Modelo de datos — apps.js](#6-modelo-de-datos--appsjs)
7. [Implementación archivo por archivo](#7-implementación-archivo-por-archivo)
8. [Actualización del Layout y navbar](#8-actualización-del-layout-y-navbar)
9. [Tests a actualizar](#9-tests-a-actualizar)
10. [Plan de migración paso a paso](#10-plan-de-migración-paso-a-paso)
11. [Hoja de ruta futura — Suscripciones](#11-hoja-de-ruta-futura--suscripciones)

---

## 1. Estado real del proyecto (verificado)

### Rutas actuales (App.jsx real)

```
PÚBLICAS
  /                              → Home.jsx (portfolio)
  /projects/:slug                → ProjectDetail.jsx
  /login                         → Login.jsx

PROTEGIDAS (ProtectedRoute)
  /app/projects                  → AppProjects.jsx     ← SE ELIMINA
  /app/projects/:slug            → AppProjectDetail.jsx ← SE CONVIERTE en HogarLayout
    ├── (index)                  → Welcome.jsx
    ├── calendar                 → Calendar.jsx
    ├── shopping                 → ShoppingList.jsx
    ├── menu                     → Menu.jsx
    ├── recipes                  → Recipes.jsx
    └── recipes/:recipeId        → RecipeDetail.jsx

  /404                           → NotFound.jsx
  *                              → redirect /404
```

### Nav actual (Layout.jsx real)

| Línea | Link | Destino actual | Destino nuevo |
|-------|------|----------------|---------------|
| 106 | Proyectos | `/` | `/projects` |
| 107 | (App privada) | `/app/projects` | `/apps` |
| 118 | GitHub | externo | sin cambios |
| 137/200 | Login/Entrar | `/login` | sin cambios |

### Archivos clave verificados

```
src/App.jsx
src/contexts/AuthContext.jsx       ← con 's' (no src/context/)
src/contexts/ProjectContext.jsx    ← IMPORTANTE — ver sección 3
src/components/ProtectedRoute.jsx
src/components/ModuleTopNav.jsx
src/components/BottomSheet.jsx
src/pages/Home.jsx
src/pages/Login.jsx
src/pages/app/Projects.jsx         ← se elimina
src/pages/app/ProjectDetail.jsx    ← se convierte en HogarLayout
src/pages/app/modules/Welcome.jsx
src/pages/app/modules/Calendar.jsx
src/pages/app/modules/ShoppingList.jsx
src/pages/app/modules/Menu.jsx
src/pages/app/modules/Recipes.jsx
src/pages/app/modules/RecipeDetail.jsx
```

### Login — redirect post-autenticación (línea 22)

```js
// ACTUAL — romperá cuando /app/projects desaparezca:
if (user) navigate('/app/projects', { replace: true })

// NUEVO:
if (user) navigate('/apps', { replace: true })
```

---

## 2. Qué cambia y qué no

### ✅ NO SE TOCA

```
src/contexts/AuthContext.jsx         ← Supabase + Google intacto
src/components/ProtectedRoute.jsx    ← sin cambios
src/pages/app/modules/Welcome.jsx    ← sin cambios
src/pages/app/modules/Calendar.jsx   ← sin cambios
src/pages/app/modules/ShoppingList.jsx ← sin cambios
src/pages/app/modules/Menu.jsx       ← sin cambios
src/pages/app/modules/Recipes.jsx    ← sin cambios
src/pages/app/modules/RecipeDetail.jsx ← sin cambios
Schema de Supabase                   ← sin cambios
Variables de entorno Vercel          ← sin cambios
```

### ❌ SE ELIMINA

```
src/pages/app/Projects.jsx           ← lista de proyectos del usuario
```

### 🔄 SE CONVIERTE / MODIFICA

```
src/pages/app/ProjectDetail.jsx      → HogarLayout.jsx (ver sección 3)
src/pages/Home.jsx                   → renombrar a ProjectsHome.jsx
src/pages/Login.jsx                  → cambiar redirect post-login
src/App.jsx                          → nuevas rutas
src/components/Layout.jsx            → nuevos NavLinks
```

### 🆕 SE CREA

```
src/pages/LandingPage.jsx
src/pages/AppsHub.jsx
src/components/ComingSoonPage.jsx
src/data/apps.js
```

---

## 3. El problema del Outlet — decisión arquitectónica

### Por qué no puedes simplemente eliminar AppProjectDetail

Las rutas de Hogar son **nested routes** en React Router. La estructura actual es:

```jsx
<Route path="/app/projects/:slug" element={<AppProjectDetail />}>
  <Route index element={<Welcome />} />
  <Route path="calendar" element={<Calendar />} />
  {/* ... */}
</Route>
```

`AppProjectDetail` renderiza un `<Outlet />` que muestra el módulo activo (Calendar, Menu, etc.). También probablemente **provee el contexto del proyecto** (id de Supabase, nombre, miembros) a través de `ProjectContext`.

Si eliminas `AppProjectDetail` sin sustituto, los módulos:
1. Pierden el `<Outlet />` — dejan de renderizarse.
2. Pierden acceso al `ProjectContext` — se rompen consultas a Supabase.

### Solución: convertir AppProjectDetail en HogarLayout

En lugar de eliminar el archivo, **lo simplificamos**. Quitamos toda la lógica de selección de proyecto (el dropdown de proyectos del usuario, el botón "Nuevo proyecto", etc.) y dejamos solo lo que necesitan los módulos:

```jsx
// src/pages/app/HogarLayout.jsx
// (renombrar desde ProjectDetail.jsx)
//
// Responsabilidades que CONSERVA:
//   - Cargar el proyecto "hogar" de Supabase por slug fijo
//   - Proveer ProjectContext a los módulos hijos
//   - Renderizar <Outlet /> para los módulos
//   - Nav lateral/superior entre módulos (ya existe)
//
// Responsabilidades que ELIMINA:
//   - Selección de proyecto del usuario
//   - Botón "Nuevo proyecto"
//   - Lista de proyectos compartidos
//   - Cualquier UI de gestión de proyectos

export default function HogarLayout() {
  // La única diferencia con el actual: el slug ya no viene de useParams()
  // sino que es fijo: 'hogar'
  // Internamente carga el proyecto de Supabase con ese slug
  // y lo provee vía ProjectContext.
  
  // TODO: ver cómo está implementado actualmente AppProjectDetail
  // y simplificar eliminando solo la UI de selección de proyecto.
  // El proveedor de contexto y el Outlet se mantienen intactos.
}
```

> **Nota para Claude Code:** Antes de modificar `AppProjectDetail.jsx`, leer el archivo completo para entender qué provee a los módulos hijos. La transformación es quirúrgica: eliminar UI de selección, conservar carga de datos y contexto.

---

## 4. Nueva arquitectura de rutas

### App.jsx completo (nuevo)

```jsx
// PÚBLICAS
<Route path="/"               element={<LandingPage />} />
<Route path="/projects"       element={<ProjectsHome />} />      // era /
<Route path="/projects/:slug" element={<ProjectDetail />} />     // sin cambios
<Route path="/courses"        element={<ComingSoonPage title="Cursos" icon="📚" />} />
<Route path="/store"          element={<ComingSoonPage title="Tienda" icon="🛒" />} />
<Route path="/login"          element={<Login />} />

// HUB DE APPS — requiere login
<Route path="/apps" element={
  <ProtectedRoute><AppsHub /></ProtectedRoute>
} />

// HOGAR — rutas internas conservadas, nuevo wrapper
<Route path="/app/projects/hogar" element={
  <ProtectedRoute><HogarLayout /></ProtectedRoute>
}>
  <Route index            element={<Welcome />} />
  <Route path="calendar"  element={<Calendar />} />
  <Route path="shopping"  element={<ShoppingList />} />
  <Route path="menu"      element={<Menu />} />
  <Route path="recipes"   element={<Recipes />} />
  <Route path="recipes/:recipeId" element={<RecipeDetail />} />
</Route>

// 404
<Route path="/404" element={<NotFound />} />
<Route path="*"    element={<Navigate to="/404" replace />} />
```

> **Cambio clave en las rutas de Hogar:** antes era `path="/app/projects/:slug"` (dinámico), ahora es `path="/app/projects/hogar"` (fijo). Esto es correcto porque solo existe Hogar.

### Flujo completo de usuario

```
Visita /                   → LandingPage (vitrina de la plataforma)
  → click "Explorar Apps"  → /apps
    → ¿logueado?
      No → /login → Google OAuth → redirect a /apps
      Sí → AppsHub (ve la card de Hogar)
        → click "Abrir Hogar" → /app/projects/hogar (Welcome)
          → navega a calendario → /app/projects/hogar/calendar
          → navega a menú      → /app/projects/hogar/menu
          → etc.

Visita /projects           → ProjectsHome (portfolio de proyectos)
  → click proyecto         → /projects/:slug (ProjectDetail)

Visita /courses o /store   → ComingSoonPage
```

---

## 5. Nueva estructura de archivos

```
src/
├── contexts/
│   ├── AuthContext.jsx              ← sin cambios
│   └── ProjectContext.jsx           ← sin cambios
│
├── components/
│   ├── Layout.jsx                   ← MODIFICAR (nuevos NavLinks)
│   ├── ProtectedRoute.jsx           ← sin cambios
│   ├── ComingSoonPage.jsx           ← NUEVO
│   ├── ModuleTopNav.jsx             ← sin cambios
│   └── BottomSheet.jsx              ← sin cambios
│
├── data/
│   ├── projects.js                  ← sin cambios
│   └── apps.js                      ← NUEVO
│
├── pages/
│   ├── LandingPage.jsx              ← NUEVO (nueva /)
│   ├── Home.jsx                     → RENOMBRAR a ProjectsHome.jsx
│   ├── AppsHub.jsx                  ← NUEVO (/apps)
│   ├── Login.jsx                    ← MODIFICAR (redirect post-login)
│   ├── ProjectDetail.jsx            ← sin cambios (/projects/:slug)
│   ├── NotFound.jsx                 ← sin cambios
│   └── app/
│       ├── Projects.jsx             ← ELIMINAR
│       ├── ProjectDetail.jsx        → RENOMBRAR/SIMPLIFICAR a HogarLayout.jsx
│       └── modules/
│           ├── Welcome.jsx          ← sin cambios
│           ├── Calendar.jsx         ← sin cambios
│           ├── ShoppingList.jsx     ← sin cambios
│           ├── Menu.jsx             ← sin cambios
│           ├── Recipes.jsx          ← sin cambios
│           └── RecipeDetail.jsx     ← sin cambios
│
└── App.jsx                          ← MODIFICAR
```

---

## 6. Modelo de datos — apps.js

```js
// src/data/apps.js
//
// Catálogo de aplicaciones de la plataforma.
// Añadir una app nueva = añadir un objeto aquí + crear su ruta en App.jsx.
//
// El campo `href` apunta a la ruta de entrada de la app.
// Para Hogar, es la ruta actual de Welcome: /app/projects/hogar

export const apps = [
  {
    slug: 'hogar',
    title: 'Hogar',
    description:
      'Gestión del hogar: calendario de tareas, menú semanal, lista de la compra y recetario.',
    icon: '🏠',
    href: '/app/projects/hogar',       // ruta existente — sin cambios
    status: 'active',                  // 'active' | 'coming_soon'
    requiredPlan: 'free',              // preparado para suscripciones futuras
    color: 'from-orange-500 to-amber-500',
    version: '0.3.0',
    lastUpdated: '2026-04',
    features: ['Calendario', 'Menú semanal', 'Lista de la compra', 'Recetario'],
  },
  // Plantilla para apps futuras:
  // {
  //   slug: 'finanzas',
  //   title: 'Finanzas',
  //   description: '...',
  //   icon: '💰',
  //   href: '/app/finanzas',
  //   status: 'coming_soon',
  //   requiredPlan: 'free',
  //   color: 'from-emerald-500 to-teal-500',
  //   version: null,
  //   lastUpdated: null,
  //   features: [],
  // },
]
```

---

## 7. Implementación archivo por archivo

### 7.1 `src/pages/LandingPage.jsx` — Nueva home `/`

```jsx
// src/pages/LandingPage.jsx

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const SECTIONS = [
  {
    key: 'apps',
    title: 'My Apps',
    description:
      'Herramientas web personales. Accede con tu cuenta de Google y úsalas desde cualquier dispositivo.',
    icon: '⚡',
    href: '/apps',
    status: 'active',
    cta: 'Explorar apps',
    accentColor: 'var(--accent)',
  },
  {
    key: 'projects',
    title: 'Proyectos',
    description:
      'Portfolio de todo lo que he construido: apps, scripts, setups y experimentos con IA.',
    icon: '🛠️',
    href: '/projects',
    status: 'active',
    cta: 'Ver proyectos',
    accentColor: '#6366f1',
  },
  {
    key: 'courses',
    title: 'Cursos',
    description:
      'Formación técnica: IA aplicada, flujos de desarrollo y herramientas que multiplican la productividad.',
    icon: '📚',
    href: '/courses',
    status: 'coming_soon',
    cta: 'Próximamente',
    accentColor: '#10b981',
  },
  {
    key: 'store',
    title: 'Tienda',
    description: 'Recursos digitales, templates y herramientas. En construcción.',
    icon: '🛒',
    href: '/store',
    status: 'coming_soon',
    cta: 'Próximamente',
    accentColor: '#8b5cf6',
  },
]

export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <SectionsGrid />
      <AboutSection />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 hidden dark:block pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(249,115,22,0.07) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 dark:hidden pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.13) 0%, transparent 55%)' }} />

      <div className="relative z-10 pt-16 pb-20 px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto">
        <p className="font-mono text-xs tracking-widest uppercase mb-4
          text-[var(--text-faint)] dark:text-orange-300/60">
          H3nky · dev
        </p>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-none mb-5
          text-[var(--text)]">
          Herramientas reales,<br />
          <span style={{ color: 'var(--accent)' }}>construidas de verdad.</span>
        </h1>
        <p className="text-lg leading-relaxed font-light max-w-xl mb-10
          text-[var(--text-muted)]">
          Apps, proyectos y recursos construidos por un solo desarrollador
          usando IA como equipo completo.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/apps"
            className="px-5 py-2.5 rounded-lg font-semibold text-sm text-white
              transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'var(--accent)' }}>
            Explorar Apps →
          </Link>
          <Link to="/projects"
            className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all
              border border-[var(--border)] text-[var(--text)]
              hover:bg-[var(--bg-card)] active:scale-95">
            Ver Proyectos
          </Link>
        </div>
      </div>
    </section>
  )
}

function SectionsGrid() {
  return (
    <section className="px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto py-12">
      <h2 className="text-xl font-bold text-[var(--text)] mb-1">Qué hay aquí</h2>
      <p className="text-sm text-[var(--text-muted)] mb-8">Una plataforma en constante construcción.</p>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        initial="hidden" animate="show"
      >
        {SECTIONS.map(s => <SectionCard key={s.key} section={s} />)}
      </motion.div>
    </section>
  )
}

function SectionCard({ section }) {
  const isActive = section.status === 'active'
  const inner = (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className={`
        rounded-xl border border-[var(--border)] bg-[var(--bg-card)]
        p-6 flex flex-col gap-3 h-full transition-all duration-200
        ${isActive ? 'hover:border-[var(--accent)] hover:shadow-md cursor-pointer' : 'opacity-60 cursor-default'}
      `}
    >
      <span className="text-3xl">{section.icon}</span>
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="font-bold text-[var(--text)]">{section.title}</h3>
        {!isActive && (
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--text-faint)]">
            En desarrollo
          </span>
        )}
      </div>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-1">{section.description}</p>
      <span className="text-sm font-semibold mt-1"
        style={{ color: isActive ? section.accentColor : 'var(--text-faint)' }}>
        {section.cta}{isActive ? ' →' : ''}
      </span>
    </motion.div>
  )
  return isActive
    ? <Link to={section.href} className="h-full block">{inner}</Link>
    : <div className="h-full">{inner}</div>
}

function AboutSection() {
  return (
    <section className="px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto py-16
      border-t border-[var(--border)] mt-8">
      <div className="max-w-2xl">
        <p className="font-mono text-xs tracking-widest uppercase mb-4 text-[var(--text-faint)]">
          Sobre el creador
        </p>
        <h2 className="text-2xl font-extrabold text-[var(--text)] mb-4">Hola, soy H3nky</h2>
        <p className="text-[var(--text-muted)] leading-relaxed mb-6">
          Informático apasionado por la IA y las herramientas que multiplican lo que uno solo puede hacer.
          Construyo esto sin ser "desarrollador profesional" — usando Claude Code, Supabase y el stack
          moderno de React para demostrar que los límites técnicos ya no son excusa.
        </p>
        <a href="https://github.com/H3nky" target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
            border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-card)] transition-colors">
          GitHub →
        </a>
      </div>
    </section>
  )
}
```

---

### 7.2 `src/pages/AppsHub.jsx`

```jsx
// src/pages/AppsHub.jsx
//
// ⚠️ Verificar el nombre exacto del método de logout en AuthContext antes de codificar.
// El snapshot muestra signInWithGoogle() y se deduce signOut() — confirmar.

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'   // ← con 's'
import { apps } from '../data/apps'

export default function AppsHub() {
  const { user, signOut } = useAuth()   // ajustar si el método se llama distinto

  return (
    <div className="px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto">
      <header className="mb-10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">My Apps</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Bienvenido, <strong>{user?.user_metadata?.full_name ?? user?.email}</strong>
          </p>
        </div>
        <button onClick={signOut}
          className="text-sm border border-[var(--border)] px-3 py-1.5 rounded-lg
            text-[var(--text-faint)] hover:text-[var(--text)] transition-colors">
          Cerrar sesión
        </button>
      </header>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden" animate="show"
      >
        {apps.map(app => <AppCard key={app.slug} app={app} />)}
      </motion.div>
    </div>
  )
}

function AppCard({ app }) {
  const isActive = app.status === 'active'
  const inner = (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      className={`
        rounded-xl border border-[var(--border)] bg-[var(--bg-card)]
        overflow-hidden flex flex-col transition-all duration-200
        ${isActive ? 'hover:border-[var(--accent)] hover:shadow-md' : 'opacity-60'}
      `}
    >
      <div className={`h-1.5 bg-gradient-to-r ${app.color}`} />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-3xl">{app.icon}</span>
          {app.status === 'coming_soon' ? (
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--text-faint)]">
              Próximamente
            </span>
          ) : (
            <span className="text-xs font-mono px-2 py-0.5 rounded-full
              text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10
              border border-emerald-200 dark:border-emerald-500/30">
              Activo
            </span>
          )}
        </div>
        <div>
          <h2 className="font-bold text-[var(--text)]">{app.title}</h2>
          {app.version && (
            <span className="text-xs font-mono text-[var(--text-faint)]">v{app.version}</span>
          )}
        </div>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-1">{app.description}</p>
        {app.features?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {app.features.map(f => (
              <span key={f} className="text-xs px-2 py-0.5 rounded-full
                bg-[var(--border)] text-[var(--text-faint)]">{f}</span>
            ))}
          </div>
        )}
        {isActive && (
          <span className="text-sm font-semibold mt-1" style={{ color: 'var(--accent)' }}>
            Abrir →
          </span>
        )}
      </div>
    </motion.div>
  )
  return isActive ? <Link to={app.href}>{inner}</Link> : <div>{inner}</div>
}
```

---

### 7.3 `src/components/ComingSoonPage.jsx`

```jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function ComingSoonPage({ title, icon }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]
      text-center px-6 gap-5">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="text-6xl">
        {icon}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }} className="flex flex-col gap-2 items-center">
        <h1 className="text-3xl font-extrabold text-[var(--text)]">{title}</h1>
        <span className="font-mono text-xs px-3 py-1 rounded-full bg-[var(--border)] text-[var(--text-faint)]">
          En desarrollo
        </span>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="text-sm text-[var(--text-muted)] max-w-sm">
        Esta sección está en construcción. Las cosas buenas tardan un poco.
      </motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Link to="/" className="text-sm text-[var(--text-faint)] hover:text-[var(--text)]
          underline underline-offset-4 transition-colors">
          ← Volver al inicio
        </Link>
      </motion.div>
    </div>
  )
}
```

---

### 7.4 `src/pages/app/HogarLayout.jsx` — Lo que queda de ProjectDetail

```jsx
// src/pages/app/HogarLayout.jsx
// Creado a partir de src/pages/app/ProjectDetail.jsx
//
// INSTRUCCIÓN PARA CLAUDE CODE:
// 1. Leer ProjectDetail.jsx completo antes de modificar.
// 2. Mantener intacto: carga de datos del proyecto desde Supabase,
//    provisión de ProjectContext, Outlet, nav entre módulos (ModuleTopNav),
//    y cualquier lógica de permisos/miembros.
// 3. Eliminar: selector de proyecto, botón "Nuevo proyecto", lista de
//    proyectos compartidos, useParams() para el slug (sustituir por
//    slug fijo 'hogar' o el ID del proyecto hardcodeado).
// 4. Si el proyecto se carga por slug desde Supabase, el slug fijo
//    es 'hogar'. Si se carga por ID, obtenerlo una sola vez y hardcodearlo
//    como constante (o mejor: buscarlo por slug 'hogar' al montar).
//
// El resultado debe ser un componente que:
//   - Al montar, carga el proyecto 'hogar' del usuario autenticado
//   - Provee ese proyecto via ProjectContext
//   - Renderiza <Outlet /> para los módulos hijos
//   - Mantiene la navegación entre módulos existente
```

---

### 7.5 `src/App.jsx` — Router completo nuevo

```jsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ComingSoonPage from './components/ComingSoonPage'

// Pages públicas
import LandingPage   from './pages/LandingPage'
import ProjectsHome  from './pages/ProjectsHome'       // era Home.jsx
import ProjectDetail from './pages/ProjectDetail'
import Login         from './pages/Login'
import NotFound      from './pages/NotFound'

// Hub de apps
import AppsHub       from './pages/AppsHub'

// Hogar — layout + módulos (paths sin cambios)
import HogarLayout   from './pages/app/HogarLayout'   // era ProjectDetail.jsx
import Welcome       from './pages/app/modules/Welcome'
import Calendar      from './pages/app/modules/Calendar'
import ShoppingList  from './pages/app/modules/ShoppingList'
import Menu          from './pages/app/modules/Menu'
import Recipes       from './pages/app/modules/Recipes'
import RecipeDetail  from './pages/app/modules/RecipeDetail'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
}

export default function App() {
  const location = useLocation()

  return (
    <Layout>
      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
        <motion.div key={location.pathname} variants={pageVariants}
          initial="initial" animate="animate" exit="exit"
          transition={{ duration: 0.2, ease: 'easeInOut' }}>
          <Routes location={location}>

            {/* Públicas */}
            <Route path="/"               element={<LandingPage />} />
            <Route path="/projects"       element={<ProjectsHome />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/courses"        element={<ComingSoonPage title="Cursos" icon="📚" />} />
            <Route path="/store"          element={<ComingSoonPage title="Tienda" icon="🛒" />} />
            <Route path="/login"          element={<Login />} />

            {/* Hub de apps */}
            <Route path="/apps" element={
              <ProtectedRoute><AppsHub /></ProtectedRoute>
            } />

            {/* Hogar — rutas internas conservadas, wrapper simplificado */}
            <Route path="/app/projects/hogar" element={
              <ProtectedRoute><HogarLayout /></ProtectedRoute>
            }>
              <Route index            element={<Welcome />} />
              <Route path="calendar"  element={<Calendar />} />
              <Route path="shopping"  element={<ShoppingList />} />
              <Route path="menu"      element={<Menu />} />
              <Route path="recipes"   element={<Recipes />} />
              <Route path="recipes/:recipeId" element={<RecipeDetail />} />
            </Route>

            {/* 404 */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*"    element={<Navigate to="/404" replace />} />

          </Routes>
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}
```

---

### 7.6 `src/pages/Login.jsx` — Solo una línea cambia

```js
// Línea 22 — ANTES:
if (user) navigate('/app/projects', { replace: true })

// Línea 22 — DESPUÉS:
if (user) navigate('/apps', { replace: true })
```

---

## 8. Actualización del Layout y navbar

### Cambios en `src/components/Layout.jsx`

```jsx
// Añadir import al inicio:
import { useAuth } from '../contexts/AuthContext'   // ← con 's'

// En el componente, obtener user y signOut:
const { user, signOut } = useAuth()

// ── Nav desktop — reemplazar los NavLinks actuales ──────────────
// ANTES (líneas 106-107):
<NavLink to="/">Proyectos</NavLink>
<NavLink to="/app/projects">...</NavLink>

// DESPUÉS:
<NavLink to="/">Inicio</NavLink>
<NavLink to="/projects">Proyectos</NavLink>
<NavLink to="/apps">Apps</NavLink>
<NavLink to="/courses">Cursos</NavLink>
<NavLink to="/store">Tienda</NavLink>
<a href="https://github.com/H3nky" target="_blank" rel="noreferrer">GitHub</a>

// Indicador de sesión (reemplaza el botón "Entrar" actual):
{user ? (
  <div className="flex items-center gap-2">
    {user.user_metadata?.avatar_url && (
      <img src={user.user_metadata.avatar_url} alt="avatar"
        className="w-6 h-6 rounded-full" />
    )}
    <button onClick={signOut}
      className="text-xs border border-[var(--border)] px-2 py-1 rounded
        text-[var(--text-faint)] hover:text-[var(--text)] transition-colors">
      Salir
    </button>
  </div>
) : (
  <Link to="/login"
    className="text-sm font-semibold px-3 py-1.5 rounded-lg text-white
      hover:opacity-90 transition-opacity"
    style={{ background: 'var(--accent)' }}>
    Entrar
  </Link>
)}
```

**El mismo cambio aplica al menú mobile** (hamburguesa). Replicar los mismos 5 NavLinks y el indicador de sesión en el dropdown.

---

## 9. Tests a actualizar

### `src/App.test.jsx`

```jsx
describe('App routing', () => {
  // / ya no es el portfolio
  it('renders LandingPage at /', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: /herramientas reales/i }))
      .toBeInTheDocument()
  })

  // portfolio movido a /projects
  it('renders ProjectsHome at /projects', () => {
    renderAt('/projects')
    expect(screen.getByRole('heading', { name: /proyectos/i }))
      .toBeInTheDocument()
  })

  it('renders ComingSoonPage at /courses', () => {
    renderAt('/courses')
    expect(screen.getByText(/cursos/i)).toBeInTheDocument()
    expect(screen.getByText(/en desarrollo/i)).toBeInTheDocument()
  })

  it('renders ComingSoonPage at /store', () => {
    renderAt('/store')
    expect(screen.getByText(/tienda/i)).toBeInTheDocument()
  })

  // /apps redirige a /login sin sesión
  it('redirects /apps to /login when unauthenticated', async () => {
    renderAt('/apps')
    await waitFor(() =>
      expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
    )
  })

  // sin cambios
  it('renders NotFound at /404', () => {
    renderAt('/404')
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('redirects unknown routes to /404', async () => {
    renderAt('/ruta-inexistente')
    await waitFor(() => expect(screen.getByText('404')).toBeInTheDocument())
  })

  it('renders ProjectDetail for a valid slug', () => {
    renderAt('/projects/portfolio-personal')
    expect(screen.getByRole('heading', { name: /portfolio personal/i }))
      .toBeInTheDocument()
  })
})
```

### Renombrar `Home.test.jsx`

```bash
git mv src/pages/Home.test.jsx src/pages/ProjectsHome.test.jsx
# Actualizar el import dentro: Home → ProjectsHome
```

---

## 10. Plan de migración paso a paso

```
Step 1 — Crear datos
  └── src/data/apps.js

Step 2 — Crear componentes nuevos
  ├── src/components/ComingSoonPage.jsx
  └── src/pages/AppsHub.jsx

Step 3 — Crear LandingPage
  └── src/pages/LandingPage.jsx

Step 4 — Renombrar Home sin cambiar contenido
  └── git mv src/pages/Home.jsx src/pages/ProjectsHome.jsx
      git mv src/pages/Home.test.jsx src/pages/ProjectsHome.test.jsx

Step 5 — Transformar ProjectDetail en HogarLayout  ⚠️ PASO DELICADO
  ├── Leer src/pages/app/ProjectDetail.jsx completo primero
  ├── Crear src/pages/app/HogarLayout.jsx conservando lógica de datos
  └── Verificar que ProjectContext sigue funcionando

Step 6 — Actualizar Login.jsx (una línea)
  └── navigate('/app/projects') → navigate('/apps')

Step 7 — Actualizar App.jsx (el cambio gordo)
  ├── Nuevas rutas públicas: /, /projects, /apps, /courses, /store
  ├── Ruta Hogar: path fijo "/app/projects/hogar" con HogarLayout
  └── Eliminar imports y rutas de AppProjects y AppProjectDetail

Step 8 — Actualizar Layout.jsx
  ├── 5 NavLinks nuevos
  └── Indicador de sesión con avatar

Step 9 — Eliminar archivos obsoletos
  └── src/pages/app/Projects.jsx
      (solo después de confirmar que el router funciona sin él)

Step 10 — Actualizar tests
  └── src/App.test.jsx

Step 11 — Smoke test local
  npm run dev
  · / → LandingPage ✓
  · /projects → portfolio ✓
  · /apps → redirige a /login ✓
  · Login con Google → /apps ✓  (no /app/projects — verificar)
  · Click "Abrir Hogar" → /app/projects/hogar ✓
  · Navegar entre módulos: calendar, shopping, menu, recipes ✓
  · /app/projects/hogar/recipes/[id] → RecipeDetail ✓
  · /courses y /store → ComingSoonPage ✓
  · Dark/light mode en páginas nuevas ✓

Step 12 — npm run test:run → todos los tests en verde

Step 13 — Deploy
  git push → Vercel auto-deploy
```

---

## 11. Hoja de ruta futura — Suscripciones

### Añadir control de acceso por plan

El campo `requiredPlan` ya existe en `apps.js`. Cuando llegue el momento:

**1. Añadir columna en Supabase:**
```sql
ALTER TABLE profiles ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';
```

**2. Exponer plan en AuthContext:**
```js
// Al cargar el perfil del usuario, incluir el plan
const { data: profile } = await supabase
  .from('profiles').select('plan').eq('id', user.id).single()
// Añadir plan al objeto user del contexto
```

**3. Lógica de acceso en AppsHub:**
```js
const PLAN_LEVELS = { free: 0, basic: 1, pro: 2, premium: 3 }
// En AppCard:
const hasAccess = PLAN_LEVELS[user.plan] >= PLAN_LEVELS[app.requiredPlan]
// Si !hasAccess → badge "Plan X requerido" en lugar de "Abrir"
```

### Añadir una app nueva al catálogo

1. Objeto en `src/data/apps.js`
2. Componente en `src/pages/app/` (o `src/apps/{slug}/`)
3. Ruta en `App.jsx`

Listo. Aparece automáticamente en AppsHub.

---

## Resumen de archivos afectados

| Archivo | Acción | Riesgo |
|---------|--------|--------|
| `src/data/apps.js` | Crear | ⬜ Ninguno |
| `src/pages/LandingPage.jsx` | Crear | ⬜ Ninguno |
| `src/pages/AppsHub.jsx` | Crear | ⬜ Ninguno |
| `src/components/ComingSoonPage.jsx` | Crear | ⬜ Ninguno |
| `src/pages/Home.jsx` | Renombrar a `ProjectsHome.jsx` | 🟡 Bajo |
| `src/pages/Login.jsx` | 1 línea: redirect post-login | 🟡 Bajo |
| `src/pages/app/ProjectDetail.jsx` | Convertir en `HogarLayout.jsx` | 🔴 Alto — leer antes |
| `src/App.jsx` | Nuevas rutas | 🟡 Medio |
| `src/components/Layout.jsx` | NavLinks + indicador sesión | 🟡 Medio |
| `src/App.test.jsx` | Rutas actualizadas | 🟡 Bajo |
| `src/pages/app/Projects.jsx` | Eliminar | 🟡 Bajo (tras verificar) |

**NO SE TOCA:** AuthContext, ProtectedRoute, ProjectContext, todos los módulos de Hogar, schema de Supabase, variables de entorno.
