// src/data/projects.js — Documentación técnica completa
// Generado el 2026-04-22

export const projects = [
  // ─────────────────────────────────────────────────────────────────────────────
  // HOGAR
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'hogar',
    shortTitle: 'Hogar',
    chapter: 'Apps',
    chapterIndex: 1,
    kicker: 'App personal · Supabase + Claude',
    gradientFrom: '#ea580c', gradientVia: '#9a3412', gradientTo: '#7c2d12',
    title: 'Hogar — Apps del día a día',
    description: 'Calendario, lista de la compra, menú semanal y recetas con IA. Autenticación con Google vía Supabase.',
    blurb: 'Una suite de productividad que vive dentro del mismo portfolio. Cuatro módulos — calendario, compra, menú y recetas — que comparten autenticación, base de datos y proyecto bajo una arquitectura unificada.',
    status: 'wip',
    featured: true,
    technologies: ['React', 'Supabase', 'Claude AI', 'FullCalendar', 'Google OAuth'],
    github: null,
    demo: null,
    images: ['/projects/hogar/cover.jpg'],
    date: '2026-04',
    metrics: [
      { label: 'LOC', value: '1.957' },
      { label: 'Tablas', value: '7' },
      { label: 'Políticas RLS', value: '10' },
      { label: 'Build', value: '1.62s' },
    ],
    docs: [
      {
        id: 'descripcion',
        title: 'Descripción',
        content: `Aplicación personal full-stack integrada en el mismo repositorio del portfolio. Cuatro módulos que comparten autenticación, base de datos y lógica de proyecto bajo una arquitectura unificada: Calendario con eventos recurrentes, Lista de la Compra con historial de compras, Menú Semanal editable y Recetas con generación por IA.

El eje central es Supabase como BaaS: Postgres con Row-Level Security garantiza que cada usuario solo acceda a sus datos, Google OAuth gestiona la identidad, y una Edge Function en Deno es el único puente hacia la API de Claude — la API key nunca sale del servidor.`,
      },
      {
        id: 'stack',
        title: 'Stack',
        type: 'table',
        items: [
          { name: 'React', version: '19.2.4', role: 'UI — hooks modernos, lazy loading por módulo' },
          { name: 'Supabase JS', version: '2.103.3', role: 'BaaS — Postgres, Auth, Realtime, Edge Functions' },
          { name: 'FullCalendar', version: '6.1.20', role: 'Calendario — vistas month/week/day/list, CRUD nativo' },
          { name: 'date-fns', version: '4.1.0', role: 'Manipulación de fechas sin moment.js (tree-shakeable)' },
          { name: 'Claude Haiku', version: 'claude-haiku-4-5-20251001', role: 'Modelo de IA para generación de recetas (via Edge Function)' },
          { name: 'Deno', version: 'Edge runtime', role: 'Runtime de la Edge Function — zero cold start en Supabase' },
          { name: 'vite-plugin-pwa', version: '1.2.0', role: 'PWA con manifest dinámico por módulo activo' },
        ],
      },
      {
        id: 'arquitectura',
        title: 'Arquitectura',
        content: `Hogar no es un repositorio separado — vive integrado en \`src/pages/app/\` del mismo proyecto portfolio. Esta decisión elimina friction de contexto: mismo bundler, mismo proceso de build, mismo deploy en Vercel.

La jerarquía de rutas protegidas refleja la estructura:`,
        code: {
          lang: 'text',
          src: `/app/projects/hogar           → HogarLayout (carga proyecto del usuario)
  index                        → Welcome
  calendar                     → Calendar.jsx (629 líneas, FullCalendar + Supabase)
  shopping                     → ShoppingList.jsx (581 líneas, categorías + historial)
  menu                         → Menu.jsx (485 líneas, grid 7×5)
  recipes                      → Recipes.jsx (628 líneas, galería + generación IA)
  recipes/:recipeId            → RecipeDetail.jsx (234 líneas, detalle + borrar)`,
        },
        content2: `\`HogarLayout\` carga el proyecto Supabase del usuario autenticado (\`owner_id = user.id\`) y lo inyecta a todos los módulos via \`<ProjectContext>\`. Cada módulo consume \`useProject()\` para tener el \`project_id\` sin prop drilling.

\`ProtectedRoute\` guarda todas las rutas \`/app/*\`: muestra spinner mientras \`AuthContext\` resuelve la sesión, redirige a \`/login\` si no hay usuario autenticado.`,
      },
      {
        id: 'auth-flow',
        title: 'Flujo de autenticación',
        content: `Google OAuth gestionado 100% por Supabase Auth — sin implementar un solo endpoint propio.`,
        code: {
          lang: 'js',
          src: `// AuthContext.jsx — flujo completo en ~46 líneas
supabase.auth.getSession()         // verifica sesión al montar
supabase.auth.onAuthStateChange()  // listener reactivo a cambios

// Login: un solo método
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: \`\${origin}/apps\` }  // callback post-login
})`,
        },
        content2: `Tras el OAuth, Supabase emite un JWT que el cliente incluye automáticamente en cada request a la base de datos. En Postgres, \`auth.uid()\` resuelve el usuario del token — las políticas RLS lo usan para filtrar filas sin código adicional en el cliente.`,
      },
      {
        id: 'base-de-datos',
        title: 'Base de datos y seguridad',
        content: `7 tablas en Supabase Postgres, todas con Row-Level Security activado. 10 políticas que garantizan aislamiento total entre usuarios.`,
        code: {
          lang: 'sql',
          src: `-- Estructura de tablas principal
projects          (id, name, slug, icon, owner_id → auth.users)
project_members   (project_id, user_id, role, invited_email, accepted)
calendar_tasks    (id, project_id, title, start_time, end_time, all_day, color, recurrence)
shopping_items    (id, project_id, name, quantity, unit, category, checked, store, checked_at, price_unit)
menu_items        (id, project_id, week_start, day_of_week 0-6, meal_type, recipe_id, custom_name)
recipes           (id, project_id, title, ingredients JSONB, instructions, tags TEXT[], prep_time, cook_time, servings, ai_generated)
purchase_history  (id, user_id, store, items JSONB, item_count, total_price, notes)

-- Política RLS representativa (calendar_tasks)
CREATE POLICY "tasks_by_project_member" ON calendar_tasks
  USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM project_members
        WHERE user_id = auth.uid() AND accepted = true
    )
  );`,
        },
        content2: `El patrón UNION entre propietario y miembros aceptados se repite en todas las tablas de datos. Esto habilita compartir proyectos (arquitectura ya preparada en \`project_members\`) sin duplicar lógica de acceso.`,
      },
      {
        id: 'edge-function',
        title: 'Edge Function: generate-recipe',
        content: `La única Edge Function del proyecto. Actúa como proxy seguro entre el cliente React y la API de Anthropic — la \`ANTHROPIC_API_KEY\` nunca se expone al navegador.`,
        code: {
          lang: 'ts',
          src: `// supabase/functions/generate-recipe/index.ts (Deno)
// 1. Verificar JWT del cliente
const { data: { user } } = await supabase.auth.getUser(jwt)
if (!user) return new Response('Unauthorized', { status: 401 })

// 2. Recibir input del usuario
const { ingredients, servings, restrictions, timeMinutes } = await req.json()

// 3. Llamar a Claude Haiku
const response = await anthropic.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 3000,
  messages: [{
    role: 'user',
    content: \`Genera 3 recetas en JSON puro con: \${ingredients}
              para \${servings} personas, restricciones: \${restrictions},
              tiempo máximo: \${timeMinutes} min.
              Formato: [{title, ingredients[{name,quantity,unit}],
              instructions, prep_time, cook_time, servings, tags}]\`
  }]
})

// 4. Devolver array de 3 recetas parseado
return new Response(response.content[0].text, {
  headers: { 'Content-Type': 'application/json', ...corsHeaders }
})`,
        },
        content2: `El modelo recibe instrucciones explícitas de formato JSON puro (sin markdown, sin backticks) para poder hacer \`JSON.parse()\` directo en el cliente. \`max_tokens: 3000\` es suficiente para 3 recetas completas con instrucciones detalladas.`,
      },
      {
        id: 'modulos',
        title: 'Módulos en detalle',
        content: `**Calendario** — FullCalendar v6 con 4 vistas (month, week, day, list). CRUD completo de eventos con selector de color y soporte de recurrencia: \`none | daily | weekdays | weekly | monthly\`. Un bug histórico de desfase UTC+2 se resolvió normalizando timestamps antes de enviarlos a Supabase.

**Lista de la Compra** — Items organizados por categoría con estado check/uncheck. Columna \`store\` añadida en migración posterior. Al "limpiar marcados" se genera un registro en \`purchase_history\` con items, tienda, precio total y fecha — historial permanente de compras.

**Menú Semanal** — Grid editable de 7 días × 5 tipos de comida (desayuno, almuerzo, comida, cena, snack). Cada celda puede vincular a una receta guardada o usar nombre personalizado. La migración expandió el \`CHECK\` de \`meal_type\` para soportar tanto inglés como español.

**Recetas** — Galería de recetas guardadas + generador con IA. El usuario indica ingredientes, comensales, restricciones y tiempo máximo; recibe 3 opciones generadas por Claude Haiku. Puede guardar cualquiera en su colección personal (persiste en Supabase con \`ai_generated: true\`).`,
      },
      {
        id: 'pwa',
        title: 'PWA por módulo',
        content: `Un detalle de UX poco visible pero técnicamente interesante: el hook \`usePWAManifest\` cambia el manifest de la PWA dinámicamente según el módulo activo.`,
        code: {
          lang: 'js',
          src: `// src/hooks/usePWAManifest.js
// Al entrar a /app/projects/hogar/calendar:
document.title = 'Calendario — Hogar'
link#pwa-manifest.href = '/icons/icon-calendar-192.png'
// theme-color cambia al color del módulo

// Iconos generados con sharp desde SVG:
// public/icons/icon-calendar-192.png  (192×192)
// public/icons/icon-calendar-512.png  (512×512)
// Ídem para shopping, menu, recipes, base`,
        },
        content2: `Resultado: si el usuario añade Hogar a su pantalla de inicio desde el módulo Calendario, el icono de app muestra el icono de calendario, no el genérico del portfolio.`,
      },
      {
        id: 'metricas',
        title: 'Métricas',
        type: 'metrics',
        items: [
          { label: 'Líneas de código (4 módulos)', value: '1.957 LOC' },
          { label: 'Tablas Supabase', value: '7 tablas' },
          { label: 'Políticas RLS', value: '10 políticas' },
          { label: 'Chunk supabase-js (gzip)', value: '48.64 kB' },
          { label: 'Tiempo de build total', value: '1.62s' },
          { label: 'Edge Function runtime', value: 'Deno (Supabase)' },
          { label: 'Modelo IA', value: 'claude-haiku-4-5-20251001' },
          { label: 'Max tokens por respuesta', value: '3.000' },
        ],
      },
    ],
    product: {
      tagline: "Tu vida diaria, organizada con IA.",
      description: "Suite de apps personales: calendario, menú semanal, lista de la compra y recetas generadas con IA. Autenticación real con Google vía Supabase.",
      features: [
        "Calendario personal con FullCalendar",
        "Menú semanal editable",
        "Lista de la compra sincronizada",
        "Recetas generadas con Claude AI",
        "Login con Google (Supabase OAuth)"
      ]
    },
    documentation: {
      problem: "Necesitaba herramientas del día a día propias, sin depender de apps de terceros con datos en servidores ajenos.",
      approach: "Construir un módulo unificado dentro del portfolio, con autenticación real y base de datos propia en Supabase.",
      decisions: [
        "Supabase en lugar de Firebase: SQL real, sin vendor lock-in",
        "FullCalendar por su API declarativa compatible con React",
        "Claude AI para generación de recetas en lugar de base de datos estática"
      ],
      result: "App en uso personal real. Autenticación funcional, calendario operativo, recetas con IA integradas."
    },
    meta: {
      status: "En uso personal. Algunas funcionalidades en desarrollo activo.",
      limitations: [
        "Requiere cuenta Google para autenticarse",
        "Generación de recetas depende de disponibilidad de la API de Anthropic",
        "UI en iteración continua"
      ],
      aiProcess: "Desarrollado con Claude Code. Arquitectura inicial generada mediante prompts, iterada y refinada manualmente."
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PORTFOLIO PERSONAL
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'portfolio-personal',
    shortTitle: 'Portfolio',
    chapter: 'Web & Portfolio',
    chapterIndex: 2,
    kicker: 'Esta misma web · React 19 + Vite',
    gradientFrom: '#f97316', gradientVia: '#f59e0b', gradientTo: '#d97706',
    title: 'Portfolio Personal',
    description: 'Esta misma web — documentación de proyectos con React, Vite, Tailwind, Framer Motion y GSAP.',
    blurb: 'Producto y documentación a la vez. SPA con GSAP + Framer Motion en coexistencia deliberada, testing con Vitest, PWA offline y sistema de temas dark/light que respeta las preferencias del sistema.',
    status: 'wip',
    featured: true,
    technologies: ['React', 'Vite', 'Tailwind', 'Framer Motion', 'GSAP', 'Vitest', 'Pollinations.ai'],
    github: 'https://github.com/H3nky/mi-portfolio-proyectos',
    demo: null,
    images: ['/projects/portfolio-personal/cover.jpg'],
    date: '2026-04',
    metrics: [
      { label: 'LOC', value: '4.807' },
      { label: 'Componentes', value: '12' },
      { label: 'Tests', value: '40+' },
      { label: 'Build', value: '1.62s' },
    ],
    documentation: {
      problem: `Las animaciones del portfolio eran todas pasivas: reaccionaban al mount de React pero nunca al scroll. El hero de LandingPage no tenía ninguna animación de entrada. Framer Motion estaba importado con eslint-disable en varios archivos sin usarse en el componente donde se importaba. Sin scroll storytelling, el portfolio se sentía estático.`,
      approach: `Auditoría completa de todos los contextos de animación para decidir dónde Framer Motion es la herramienta correcta (estado React: mount/unmount, hover, gestures) y dónde GSAP aporta más (timelines complejos, scroll-linked animations, secuencias con control fino). Implementar GSAP con el hook oficial useGSAP y ScrollTrigger donde corresponde, manteniendo Framer Motion donde ya funciona bien.`,
      decisions: [
        'GSAP + Framer Motion en coexistencia deliberada — no es migración total, es especialización por caso de uso',
        'useGSAP({ scope: ref }) en todos los componentes GSAP — garantiza cleanup automático vía ctx.revert() y evita memory leaks al desmontar',
        'gsap.matchMedia() con prefers-reduced-motion en cada animación — accesibilidad por defecto, sin código extra por componente',
        'ScrollTrigger con once: true en todos los reveals — el elemento se anima una sola vez al entrar en viewport, no se repite al hacer scroll',
        'data-* attributes como targets GSAP en lugar de clases CSS — desacopla animaciones de estilos, las clases de Tailwind pueden cambiar sin romper animaciones',
        'Framer Motion retenido para: page transitions (AnimatePresence mode="wait"), lightbox (ImageGallery), hover lift (ProjectCard), sidebar mount (ProjectDetail)',
        'gsap.timeline() con defaults { ease: "power3.out" } — consistencia de easing sin repetir en cada tween del timeline',
        'HeroSection de LandingPage: secuencia badge → title → subtitle → CTAs con overlaps negativos para ritmo natural (no robótico)',
        'ProjectsGrid extraído a componente propio para aislar el ScrollTrigger y evitar re-crearlo al cambiar el filtro de tecnologías',
      ],
      result: `5 componentes migrados o mejorados con GSAP. Hero de LandingPage con timeline de entrada por primera vez. ProjectsHome y LandingPage con scroll reveals. ComingSoonPage con timeline limpio (eliminados 3 tweens manuales con delay). Build limpio en 1.09s. prefers-reduced-motion respetado en todos los puntos de animación.`,
    },
    meta: {
      status: 'En iteración activa. Animaciones implementadas, documentación técnica completa.',
      limitations: [
        'El browser del preview de Claude Code no puede conectar a localhost — verificación visual manual necesaria',
        'GSAP ScrollTrigger requiere que los elementos sean visibles en el DOM cuando se inicializa — cuidado con lazy loading',
        'Los tests de Vitest no cubren las animaciones GSAP (jsdom no soporta IntersectionObserver de ScrollTrigger)',
      ],
      aiProcess: 'Auditoría, diseño de la estrategia de coexistencia Framer/GSAP, implementación y documentación generados íntegramente con Claude Code en una sesión de 4 fases.',
    },
    docs: [
      {
        id: 'descripcion',
        title: 'Descripción',
        content: `Portfolio construido desde cero sin background de desarrollador, usando IA como equipo completo. El resultado es una SPA con 4.807 líneas de código, 12 componentes, testing con Vitest, PWA offline, generación automática de imágenes y un sistema de temas dark/light que respeta las preferencias del sistema operativo.

La web documenta sus propios proyectos — incluyendo este mismo. Es a la vez producto y documentación del proceso.`,
      },
      {
        id: 'stack',
        title: 'Stack',
        type: 'table',
        items: [
          { name: 'React', version: '19.2.4', role: 'UI — StrictMode, lazy loading, Suspense, ErrorBoundary' },
          { name: 'Vite', version: '8.0.4', role: 'Bundler — HMR, code splitting manual, sourcemaps, build en 1.62s' },
          { name: 'Tailwind CSS', version: '4.2.2', role: 'Utilidades CSS — nueva API @import, custom properties nativas' },
          { name: 'Framer Motion', version: '12.38.0', role: 'Animaciones — AnimatePresence, transiciones de página, hover effects' },
          { name: 'React Router DOM', version: '7.14.0', role: 'Routing — lazy routes, ProtectedRoute, Navigate, useLocation' },
          { name: 'Vitest', version: '4.1.4', role: 'Testing — 40+ tests, jsdom, waitFor pattern para lazy loading' },
          { name: 'vite-plugin-pwa', version: '1.2.0', role: 'PWA — autoUpdate, 47 entradas precacheadas (893 kB)' },
          { name: 'Pollinations.ai', version: 'API REST', role: 'Generación de imágenes de portada — sin API key, 100% gratis' },
          { name: 'sharp', version: '0.34.5', role: 'Procesamiento de imágenes — iconos PWA SVG → PNG 192/512px' },
        ],
      },
      {
        id: 'estructura',
        title: 'Estructura de archivos',
        content: `Organización por responsabilidad — cada carpeta tiene un rol claro:`,
        code: {
          lang: 'text',
          src: `src/
├── App.jsx              # Router + AnimatePresence + ErrorBoundary (120 líneas)
├── main.jsx             # Entry point: BrowserRouter > AuthProvider > App
├── index.css            # Sistema de tokens CSS completo (dark/light)
├── components/          # 12 piezas reutilizables
│   ├── Layout.jsx       # Nav sticky, footer, toggle dark/light (263 líneas)
│   ├── ProjectCard.jsx  # Card del grid con Framer Motion hover (117 líneas)
│   ├── FilterBar.jsx    # Pills de filtro por tecnología (35 líneas)
│   ├── ImageGallery.jsx # Lightbox accesible, swipe, teclado (180 líneas)
│   ├── ProtectedRoute.jsx # Guardia de auth (18 líneas)
│   └── ...
├── pages/               # Rutas públicas
│   ├── LandingPage.jsx  # Hero + SectionsGrid + About (174 líneas)
│   ├── ProjectsHome.jsx # Grid + filtros (171 líneas)
│   ├── ProjectDetail.jsx # Vista detalle cinematográfica (186 líneas)
│   └── app/             # Rutas protegidas — Hogar
├── contexts/            # AuthContext + ProjectContext
├── data/
│   ├── projects.js      # Fuente de verdad de proyectos (98 líneas → este archivo)
│   └── apps.js          # Apps disponibles en AppsHub
├── hooks/
│   └── usePWAManifest.js # Manifest dinámico por módulo (73 líneas)
├── lib/
│   └── supabase.js      # Cliente Supabase singleton
scripts/
├── generate-image.js    # Portadas de proyectos via Pollinations.ai
├── generate-icons.js    # Iconos PWA SVG → PNG con sharp
└── generate-og-cover.js # OG image 1200×630px
supabase/
├── functions/generate-recipe/ # Edge Function Deno
└── migrations/          # 4 migraciones SQL aplicadas`,
        },
      },
      {
        id: 'sistema-temas',
        title: 'Sistema de temas dark/light',
        content: `Tailwind v4 elimina el archivo \`tailwind.config.js\` — la configuración vive en CSS puro. El dark mode usa una custom variant que activa estilos cuando \`<html>\` tiene la clase \`dark\`.`,
        code: {
          lang: 'css',
          src: `/* src/index.css */
@import "tailwindcss";

/* Activar dark: cuando html tiene clase .dark */
@custom-variant dark (&:where(.dark, .dark *));

/* Tokens light mode */
html {
  --bg: #fffcf9;       --bg-card: #ffffff;
  --text: #09090b;     --text-muted: #71717a;
  --accent: #f97316;   --accent-hover: #ea6c0a;
  --border: #e4e4e7;   --border-hover: #f97316;
  --badge-bg: #fff7ed; --badge-text: #c2410c;
  --nav-bg: rgba(255,252,249,0.88);
  --dot-color: rgba(249,115,22,0.09);  /* patrón de puntos del fondo */
}

/* Tokens dark mode — mismas variables, valores diferentes */
html.dark {
  --bg: #0a0a0f;       --bg-card: #0f0f18;
  --text: #f4f4f5;     --text-muted: #71717a;
  --accent: #f97316;   --accent-hover: #fb923c;
  --border: rgba(255,255,255,0.07);
  --nav-bg: rgba(10,10,15,0.85);
  --dot-color: rgba(255,255,255,0.028);
}`,
        },
        content2: `En JSX los tokens se consumen directamente: \`className="bg-[var(--bg)] text-[var(--text)]"\`. El toggle persiste en \`localStorage\` con fallback a \`prefers-color-scheme\` del sistema. La transición \`background-color 0.2s ease\` en \`body\` hace el cambio suave sin parpadeo.

El fondo de puntos (\`radial-gradient\` + \`background-size: 26px 26px\`) adapta su color y opacidad por tema — casi imperceptible en dark, ligeramente visible en light.`,
      },
      {
        id: 'animaciones',
        title: 'Sistema de animaciones: Framer Motion + GSAP',
        content: `Dos librerías en coexistencia deliberada. Framer Motion gestiona animaciones ligadas al estado de React (mount/unmount, hover, gestures). GSAP se encarga de timelines complejos y scroll-linked animations. Cada herramienta donde gana.`,
        code: {
          lang: 'jsx',
          src: `// App.jsx — transición entre páginas con Framer Motion (AnimatePresence)
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.15 } },
}
// Framer gestiona el unmount — GSAP no tiene equivalente nativo en React

// LandingPage.jsx — hero timeline con GSAP
useGSAP(() => {
  const mm = gsap.matchMedia()
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from('[data-hero-badge]', { opacity: 0, y: 12, duration: 0.5 })
      .from('[data-hero-title]', { opacity: 0, y: 24, duration: 0.6 }, '-=0.25')
      .from('[data-hero-sub]',   { opacity: 0, y: 16, duration: 0.5 }, '-=0.3')
      .from('[data-hero-ctas] > *', { opacity: 0, y: 12, stagger: 0.1 }, '-=0.25')
    return () => tl.kill()
  })
  return () => mm.revert()  // cleanup automático al desmontar
}, { scope: containerRef })

// ProjectsHome.jsx — grid reveal con ScrollTrigger
gsap.from('[data-project-card]', {
  opacity: 0, y: 40, duration: 0.5,
  stagger: { each: 0.07, from: 'start' },
  scrollTrigger: { trigger: gridRef.current, start: 'top 88%', once: true },
})`,
        },
        content2: `Criterio de decisión: si la animación necesita saber si el componente está montado o desmontado → Framer Motion. Si necesita scroll, timeline con múltiples elementos, o control preciso de secuencia → GSAP. prefers-reduced-motion respetado en todos los puntos GSAP vía gsap.matchMedia().`,
      },
      {
        id: 'gsap-migration',
        title: 'Migración a GSAP — decisiones y trade-offs',
        content: `Auditoría completa del portfolio detectó: hero sin animaciones, patrón opacity/y repetido en 6+ archivos sin abstracción, imports con eslint-disable, y cero scroll storytelling. La migración fue quirúrgica — no un reemplazo total.`,
        code: {
          lang: 'text',
          src: `FRAMER MOTION (retenido)          GSAP (migrado/añadido)
─────────────────────────         ──────────────────────────────────
App.jsx page transitions          LandingPage HeroSection — timeline entrada
ImageGallery lightbox             LandingPage SectionsGrid — ScrollTrigger
ProjectCard whileHover            LandingPage AboutSection — ScrollTrigger
ProjectDetail sidebar mount       ProjectsHome Hero — timeline entrada
Login entrance                    ProjectsHome grid — ScrollTrigger + stagger
AppsHub grid (app interna)        ProjectDetail hero — gsap.timeline()
Recipes list (app interna)        ComingSoonPage — 3 tweens → 1 timeline`,
        },
        content2: `Patrón de cleanup en React: useGSAP({ scope: containerRef }) crea un contexto GSAP scoped al contenedor. Al desmontar el componente, ctx.revert() limpia todos los tweens, ScrollTriggers y listeners del contexto automáticamente. gsap.matchMedia() añade una capa adicional: cada breakpoint/media query tiene su propio contexto que se revierte cuando deja de coincidir.`,
      },
      {
        id: 'testing',
        title: 'Testing',
        content: `40+ tests distribuidos en 7 archivos. El patrón central para componentes con lazy loading es \`waitFor\` con timeout extendido — React.lazy no es síncrono en jsdom.`,
        code: {
          lang: 'jsx',
          src: `// Patrón para lazy routes en tests
await waitFor(
  () => expect(screen.getByText('Proyectos')).toBeInTheDocument(),
  { timeout: 5000 }
)

// test-setup.js — mock obligatorio para Framer Motion + FullCalendar
Object.defineProperty(window, 'matchMedia', {
  value: (query) => ({ matches: false, addListener: () => {}, ... })
})`,
        },
        content2: `Cobertura por área: routing (9 tests en App.test.jsx), ProjectDetail (6), ProjectsHome (5 + 3 edge cases), FilterBar (5), ImageGallery (8), ProtectedRoute (3), AuthContext (1). Los edge tests usan datos mockeados para cubrir casos con 1 solo proyecto sin featured.`,
      },
      {
        id: 'metricas',
        title: 'Métricas',
        type: 'metrics',
        items: [
          { label: 'Líneas de código total', value: '4.807 LOC' },
          { label: 'Componentes React', value: '12 componentes' },
          { label: 'Rutas', value: '13 rutas (5 protegidas)' },
          { label: 'Tests', value: '40+ tests en 7 archivos' },
          { label: 'Tiempo de build', value: '1.62s' },
          { label: 'Entradas PWA precacheadas', value: '47 (893 kB)' },
          { label: 'Commits', value: '65 commits — 1 autor' },
          { label: 'Bundle vendor (gzip)', value: '57.22 kB (React + ReactDOM)' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PORTFOLIO CONFIG (ARQUITECTURA)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'portfolio-config',
    shortTitle: 'Config',
    chapter: 'Web & Portfolio',
    chapterIndex: 2,
    kicker: 'Decisiones técnicas · Code splitting',
    gradientFrom: '#0ea5e9', gradientVia: '#0284c7', gradientTo: '#0369a1',
    title: 'Portfolio con React + Vite + Tailwind v4',
    description: 'Arquitectura y decisiones técnicas detrás de este mismo portfolio.',
    blurb: 'No es el qué — es el por qué. Cada elección tecnológica, de Vite 8 a Tailwind v4 a la flat config de ESLint, documentada con el código que la respalda.',
    status: 'wip',
    featured: true,
    technologies: ['React', 'Vite', 'Tailwind', 'Framer Motion', 'Vitest', 'Pollinations.ai'],
    github: null,
    demo: null,
    images: ['/projects/portfolio-config/cover.jpg'],
    date: '2026-04',
    metrics: [
      { label: 'Build', value: '1.62s' },
      { label: 'Bundle vendor', value: '57 kB gz' },
      { label: 'PWA cache', value: '893 kB' },
      { label: 'Rutas lazy', value: 'Todas' },
    ],
    docs: [
      {
        id: 'descripcion',
        title: 'Descripción',
        content: `Documentación de las decisiones de arquitectura que hay detrás de este portfolio. No es el qué — es el por qué. Cada elección tecnológica tiene una razón, y cada razón está documentada aquí con el código que la respalda.`,
      },
      {
        id: 'vite-config',
        title: 'Vite 8 — Build y code splitting',
        content: `Vite detecta automáticamente que es un proyecto React. La configuración manual añade tres cosas: integración con Tailwind v4, PWA, y code splitting estratégico.`,
        code: {
          lang: 'js',
          src: `// vite.config.js — decisiones clave comentadas
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),       // plugin oficial Tailwind v4 (no postcss)
    VitePWA({
      registerType: 'autoUpdate',   // actualiza SW sin preguntar
      manifest: false,              // manifest.json propio en /public
      workbox: { globPatterns: ['**/*.{js,css,html,png,svg}'] },
    }),
  ],
  build: {
    sourcemap: true,     // sourcemaps en producción (Vercel los sirve)
    rollupOptions: {
      output: {
        // Code splitting manual — evita que un módulo cargue todo
        manualChunks(id) {
          if (id.includes('react-dom') || id.includes('react/'))
            return 'vendor'          // 57.22 kB gzip
          if (id.includes('react-router'))
            return 'router'          // 14.75 kB gzip
          if (id.includes('framer-motion'))
            return 'animations'      // 43.34 kB gzip
          // supabase-js: Rollup lo separa automáticamente
          // FullCalendar: lazy import → su propio chunk (4.88 kB gzip)
        },
      },
    },
  },
})`,
        },
        content2: `La separación de \`framer-motion\` en su propio chunk es crítica: 132 kB bruto / 43 kB gzip. Sin esto, cada ruta que importara un componente animado arrastraría toda la librería. Con \`manualChunks\`, el chunk \`animations\` se carga una sola vez y se cachea.

Supabase (186 kB bruto / 48 kB gzip) se separa automáticamente porque solo se importa en rutas protegidas — Rollup lo detecta solo gracias al lazy loading de rutas.`,
      },
      {
        id: 'lazy-loading',
        title: 'Lazy loading por ruta',
        content: `Todas las páginas son lazy — ninguna bloquea el bundle inicial. Esto es especialmente relevante para los módulos de Hogar: si el usuario nunca se autentica, no descarga ni un byte de FullCalendar.`,
        code: {
          lang: 'jsx',
          src: `// App.jsx — lazy imports
const Calendar     = React.lazy(() => import('./pages/app/modules/Calendar'))
const ShoppingList = React.lazy(() => import('./pages/app/modules/ShoppingList'))
const Recipes      = React.lazy(() => import('./pages/app/modules/Recipes'))
// ...todas las páginas son lazy

// Suspense con fallback de spinner
<Suspense fallback={<div className="flex items-center justify-center min-h-screen">
  <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
</div>}>
  <Routes>...</Routes>
</Suspense>`,
        },
      },
      {
        id: 'generate-image',
        title: 'Generación automática de imágenes',
        content: `El script \`generate-image.js\` construye un prompt semántico con el título, descripción y stack del proyecto, llama a Pollinations.ai (API REST gratuita, sin key) y guarda el resultado como \`.webp\` en \`public/projects/{slug}/\`.`,
        code: {
          lang: 'js',
          src: `// scripts/generate-image.js (Node.js)
// Uso: node scripts/generate-image.js --slug hogar [--force]

const prompt = [
  'Dark-themed developer portfolio cover for project:',
  \`Title: \${project.title}\`,
  \`Description: \${project.description}\`,
  \`Tech stack: \${project.technologies.join(', ')}\`,
  'Style: cinematic, minimal, professional, dark background',
  'No text, no logos, abstract visualization'
].join('. ')

const url = \`https://image.pollinations.ai/prompt/\${encodeURIComponent(prompt)}\`

// AbortController con timeout de 15s
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 15000)

const response = await fetch(url, { signal: controller.signal })
// Guarda como .webp con sharp para optimización
// Actualiza automáticamente images[] en src/data/projects.js`,
        },
        content2: `Tres scripts de generación de assets — todos sin API keys, todos ejecutables con \`node scripts/\`:

- \`generate-image.js\` → portadas de proyectos (1 imagen por slug)
- \`generate-og-cover.js\` → OG image 1200×630px para redes sociales
- \`generate-icons.js\` → iconos PWA 192×192 y 512×512 desde SVG via sharp`,
      },
      {
        id: 'eslint-flat',
        title: 'ESLint v9 — Flat config',
        content: `ESLint 9 introduce la flat config — un solo archivo \`eslint.config.js\` en lugar de \`.eslintrc\` y \`.eslintignore\`. Más explícito, más predecible.`,
        code: {
          lang: 'js',
          src: `// eslint.config.js — flat config (ESLint v9)
export default defineConfig([
  globalIgnores(['dist']),     // sin .eslintignore separado
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    rules: {
      // Permite variables en PascalCase o UPPER_SNAKE sin warning
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])`,
        },
      },
      {
        id: 'security',
        title: 'Seguridad y producción',
        content: `\`vercel.json\` añade security headers en cada respuesta y cache agresivo para assets con hash de contenido.`,
        code: {
          lang: 'json',
          src: `{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
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
}`,
        },
        content2: `El rewrite \`/(.*) → /index.html\` es el que convierte Vercel en un servidor SPA: cualquier URL desconocida devuelve el \`index.html\` y React Router toma el control. Sin esto, recargar \`/projects/hogar\` devolvería 404 de Vercel.

\`max-age=31536000 immutable\` en \`/assets/*\` es seguro porque Vite genera nombres con hash de contenido (\`index-Bx3kP9aR.js\`). Si el contenido cambia, el hash cambia, el nombre cambia, el navegador descarga el nuevo.`,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // AI DEV SETUP
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'ai-dev-setup',
    shortTitle: 'AI Setup',
    chapter: 'IA & Workflow',
    chapterIndex: 3,
    kicker: 'Claude Code · gstack',
    gradientFrom: '#7c3aed', gradientVia: '#5b21b6', gradientTo: '#4c1d95',
    title: 'Setup de Desarrollo con IA',
    description: 'Configuración completa de Claude Code + gstack para desarrollar como un equipo de 20.',
    blurb: 'Sistema de desarrollo con IA que reemplaza a un equipo completo siendo uno solo. Claude Code actúa, no sugiere: lee el codebase, edita archivos reales y corre tests.',
    status: 'completed',
    featured: true,
    technologies: ['Claude Code', 'gstack', 'AI', 'Prompt Engineering'],
    github: null,
    demo: null,
    images: ['/projects/ai-dev-setup/cover.jpg'],
    date: '2026-04',
    metrics: [
      { label: 'Commits', value: '65' },
      { label: 'LOC generado', value: '4.807' },
      { label: 'Roles IA', value: '4' },
      { label: 'Autores', value: '1' },
    ],
    docs: [
      {
        id: 'descripcion',
        title: 'Descripción',
        content: `Sistema de desarrollo con IA que reemplaza a un equipo de 10-20 personas siendo uno solo. No es autocompletado — es delegación. Claude Code lee el codebase completo, edita archivos reales, ejecuta comandos y corre tests. gstack añade roles especializados encima: staff engineer, QA, diseñador, release manager.

Todo este portfolio — 65 commits, 4.807 líneas, tests, PWA, Supabase — está construido con este sistema.`,
      },
      {
        id: 'comparativa',
        title: 'Claude Code vs Cursor vs Copilot',
        content: `La diferencia no es de calidad de código — es de modelo mental.`,
        code: {
          lang: 'text',
          src: `GitHub Copilot   → Autocompletado avanzado. Sugiere la línea siguiente.
                  Tú escribes, él completa. Tu velocidad +30%.

Cursor           → Editor con IA dentro. Cmd+K para editar un bloque.
                  Tú diriges cada cambio. Tu velocidad +2x.

Claude Code      → Agente autónomo. Le das un objetivo, él lo ejecuta.
                  Lee el codebase, edita múltiples archivos, corre tests,
                  corrige errores, itera. Tu velocidad: ilimitada.
                  Tú revisas resultados, no escribes código.`,
        },
        content2: `La clave es que Claude Code *actúa*, no *sugiere*. Le dices "implementa recurrencia en el calendario con Supabase" y 20 minutos después tienes la migración SQL, el componente actualizado, los tests y el PR. Sin escribir una línea a mano.`,
      },
      {
        id: 'contexto',
        title: 'Sistema de contexto entre sesiones',
        content: `El problema con LLMs es que no tienen memoria entre sesiones. La solución: dos archivos de texto que actúan como "cerebro externalizado".`,
        code: {
          lang: 'markdown',
          src: `# ESTADO-PROYECTO.md — se pasa al inicio de cada sesión

## Stack técnico
React 19.2.4, Vite 8.0.4, Tailwind v4.2.2...

## Decisiones de diseño
- Paleta: naranja #f97316 como accent (--accent en CSS vars)
- Dark mode: clase .dark en <html>, tokens CSS custom properties
- Framer Motion: transiciones 200ms, whileHover y: -3px en cards

## Deuda técnica
- Auditoría de imports: no-unused-vars pendiente en 3 archivos
- Footer hardcodea URL de Vercel en lugar del dominio real

## Próximos pasos
1. Configurar dominio h3nky.dev en Vercel
2. Añadir proyecto Hogar a sitemap cuando sea público`,
        },
        content2: `\`TODOS.md\` actúa como backlog vivo — items con estado (Pendiente / En progreso / Done). Al inicio de cada sesión de Claude Code: "Lee ESTADO-PROYECTO.md y TODOS.md, retoma desde donde lo dejamos."

Claude Code reconstruye el contexto completo en segundos. Es como incorporar a un desarrollador que lo recuerda todo.`,
      },
      {
        id: 'gstack',
        title: 'gstack — Roles especializados',
        content: `gstack añade slash commands sobre Claude Code, cada uno con un rol y prompt de sistema distinto.`,
        code: {
          lang: 'text',
          src: `/review     → Staff engineer senior. Busca bugs de producción, race conditions,
              problemas de seguridad, código no escalable. No sugiere mejoras menores.

/design-shotgun → Diseñador de producto. Genera 3-5 variantes visuales de un
              componente para elegir. Muestra el código de cada variante.

/qa         → QA engineer. Abre el browser real, navega por la app, encuentra
              bugs de UX que los tests unitarios no detectan.

/ship       → Release manager. Git add, commit con mensaje semántico,
              corre test suite, abre PR con descripción del cambio.`,
        },
      },
      {
        id: 'prompt-engineering',
        title: 'Prompt engineering en la práctica',
        content: `Los prompts que funcionan tienen estructura fija: contexto → objetivo → restricciones → formato de entrega.`,
        code: {
          lang: 'text',
          src: `# Prompt que produce resultado en un intento

Contexto: Estoy en src/pages/app/modules/Calendar.jsx (629 líneas).
La tabla calendar_tasks en Supabase tiene columna recurrence TEXT.

Objetivo: Implementar UI de recurrencia en el modal de crear evento.
Opciones: none, daily, weekdays, weekly, monthly.

Restricciones:
- No rompas el CRUD existente
- Usa los mismos tokens CSS (--accent, --border, --text)
- Sin librerías nuevas
- Añade migración SQL si es necesario

Entrega:
1. Migración en supabase/migrations/
2. Modal actualizado
3. Test para la nueva opción en Calendar.test.jsx`,
        },
        content2: `Prompts vagos producen código que hay que reescribir. Prompts con restricciones explícitas producen código que se integra directamente. La diferencia en tiempo: 30 minutos vs 2 minutos.`,
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // VERCEL CI/CD
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'vercel-deploy',
    shortTitle: 'CI/CD',
    chapter: 'Infraestructura',
    chapterIndex: 4,
    kicker: 'Vercel · GitHub · DNS',
    gradientFrom: '#18181b', gradientVia: '#27272a', gradientTo: '#3f3f46',
    title: 'Deploy y CI/CD con Vercel',
    description: 'De localhost a producción: sincronización con GitHub y deploy automático.',
    blurb: 'Pipeline completo zero-to-prod sin servidores, sin nginx, sin Dockerfiles. Cada push a main es un deploy. Cada PR, un preview con URL única. Build en 1.62s, en producción en 90s.',
    status: 'completed',
    featured: false,
    technologies: ['Vercel', 'GitHub', 'CI/CD', 'DNS'],
    github: null,
    demo: null,
    images: ['/projects/vercel-deploy/cover.jpg'],
    date: '2026-04',
    metrics: [
      { label: 'Build', value: '1.62s' },
      { label: 'Deploy total', value: '~90s' },
      { label: 'Cache assets', value: '1 año' },
      { label: 'Headers seg.', value: '3' },
    ],
    docs: [
      {
        id: 'descripcion',
        title: 'Descripción',
        content: `Pipeline completo de zero a producción sin tocar servidores, sin configurar nginx, sin escribir Dockerfiles. Vercel detecta automáticamente que es un proyecto Vite, configura el build, y convierte cada push a GitHub en un deploy automático.

Resultado: el tiempo entre escribir código y verlo en producción es exactamente el tiempo que tarda el build — 1 minuto 37 segundos.`,
      },
      {
        id: 'pipeline',
        title: 'Pipeline completo',
        content: `El flujo de un cambio desde el teclado hasta producción:`,
        code: {
          lang: 'text',
          src: `git push origin main
    ↓
GitHub recibe el push → dispara webhook a Vercel
    ↓
Vercel clona el repo → detecta Vite automáticamente
    ↓
npm ci                          # instala dependencias (caché de módulos)
npm run build                   # vite build → dist/ en 1.62s
    ↓
Deploy a CDN global (Edge Network de Vercel)
    ↓
✓ Producción actualizada        # ~90s total desde el push`,
        },
        content2: `Vercel no necesita configuración de build — detecta \`vite\` en \`package.json\` y sabe que el comando es \`npm run build\` y la salida es \`dist/\`. Si hay \`vercel.json\`, lee los headers y rewrites adicionales.`,
      },
      {
        id: 'preview-deploys',
        title: 'Preview Deployments',
        content: `Cada Pull Request genera un deploy independiente con URL única. Esto permite revisar cambios visuales antes de mergear — sin necesidad de ejecutar nada en local.`,
        code: {
          lang: 'text',
          src: `# URL pattern de Preview Deployments
{proyecto}-git-{nombre-rama}-{usuario}.vercel.app

# Ejemplo real:
mi-portfolio-proyectos-git-feat-dark-mode-h3nky.vercel.app

# Cada commit en la PR actualiza el mismo preview
# Los previews expiran 30 días después de cerrar la PR`,
        },
        content2: `Los previews tienen las mismas variables de entorno que producción (configurables por entorno en Vercel). Esto significa que el preview de Hogar funciona con Supabase real — se puede testear el flujo completo de autenticación antes de mergear.`,
      },
      {
        id: 'dns-ssl',
        title: 'Dominio propio y SSL',
        content: `Configuración de dominio propio en Vercel Settings → Domains. Vercel gestiona el SSL automáticamente via Let's Encrypt.`,
        code: {
          lang: 'text',
          src: `# Opción A: Nameservers (recomendada — gestión completa desde Vercel)
Registrador de dominio → cambiar nameservers a:
  ns1.vercel-dns.com
  ns2.vercel-dns.com
→ Vercel gestiona todos los DNS records
→ SSL automático en <2 minutos

# Opción B: CNAME record (si se mantiene el registrador como DNS)
h3nky.dev    CNAME    cname.vercel-dns.com
www.h3nky.dev CNAME   cname.vercel-dns.com`,
        },
        content2: `El dominio \`h3nky.dev\` está en \`robots.txt\` y \`sitemap.xml\` pero aún pendiente de configurar en Vercel Settings (task activa en TODOS.md). Actualmente la web responde en \`mi-portfolio-proyectos-five.vercel.app\`.`,
      },
      {
        id: 'variables-entorno',
        title: 'Variables de entorno',
        content: `Las variables de entorno se configuran en Vercel Dashboard → Project → Settings → Environment Variables, separadas por entorno (Production, Preview, Development).`,
        code: {
          lang: 'text',
          src: `# Variables necesarias para el proyecto completo
VITE_SUPABASE_URL              # https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY         # eyJ... (public, segura en cliente)
VITE_SUPABASE_FUNCTIONS_URL    # https://xxxx.supabase.co/functions/v1

# Variables solo en Supabase Edge Function (Deno — no en Vercel)
ANTHROPIC_API_KEY              # sk-ant-... (NUNCA en el cliente)
SUPABASE_URL                   # Inyectada automáticamente por Supabase
SUPABASE_ANON_KEY              # Inyectada automáticamente por Supabase`,
        },
        content2: `Las variables \`VITE_*\` son públicas por diseño — Vite las embebe en el bundle JavaScript del cliente. La \`ANTHROPIC_API_KEY\` nunca sale del servidor Supabase — por eso existe la Edge Function como proxy. Sin esta separación, cualquiera con las DevTools podría usar la API key.`,
      },
      {
        id: 'metricas',
        title: 'Métricas',
        type: 'metrics',
        items: [
          { label: 'Tiempo de build', value: '1.62s' },
          { label: 'Tiempo deploy completo', value: '~90s desde git push' },
          { label: 'Entradas PWA precacheadas', value: '47 (893.54 kB)' },
          { label: 'Cache de assets estáticos', value: '1 año (max-age=31536000)' },
          { label: 'Headers de seguridad', value: '3 (X-Frame, X-Content-Type, Referrer)' },
          { label: 'Entornos', value: 'Production + Preview por PR + Development local' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // MASCOTAS
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'mascotas',
    shortTitle: 'Mascotas',
    chapter: 'Apps',
    chapterIndex: 1,
    kicker: 'App personal · React + Supabase',
    gradientFrom: '#f59e0b', gradientVia: '#d97706', gradientTo: '#92400e',
    title: 'Mascotas — Gestión de animales de compañía',
    description: 'Ficha de mascotas, historial de alimentación, salud y rutinas. Datos en Supabase con RLS.',
    blurb: 'Seguimiento completo de cada mascota: alimentación diaria, historial de salud, vacunas y rutinas. Cada registro vinculado al animal y al usuario mediante Row-Level Security en Postgres.',
    status: 'wip',
    featured: true,
    primary: true,
    technologies: ['React', 'Supabase', 'Google OAuth'],
    github: null,
    demo: null,
    images: ['/projects/mascotas/cover.jpg'],
    date: '2026-04',
    metrics: [
      { label: 'Módulos', value: '4' },
      { label: 'Tablas', value: '3+' },
      { label: 'Políticas RLS', value: '6+' },
      { label: 'Status', value: 'WIP' },
    ],
    docs: [
      {
        id: 'descripcion',
        title: 'Descripción',
        content: `Módulo de gestión de mascotas integrado en la plataforma H3nky. Permite registrar cada animal con su ficha completa (nombre, especie, raza, fecha de nacimiento), y llevar un registro detallado de alimentación diaria, historial de salud y vacunas, y rutinas personalizadas.\n\nTodos los datos están en Supabase Postgres con Row-Level Security, garantizando que cada usuario solo accede a sus propias mascotas. La autenticación es compartida con el resto de la plataforma (Google OAuth vía Supabase Auth).`,
      },
      {
        id: 'modulos',
        title: 'Módulos',
        content: `**Mis Mascotas** — Lista de animales registrados con acceso a la ficha de cada uno. Cada mascota tiene una vista de detalle con pestañas.\n\n**Alimentación** — Registro diario de tomas, cantidades y tipo de alimento. Historial cronológico por mascota.\n\n**Salud** — Historial de visitas veterinarias, vacunas, medicamentos y observaciones. Fechas de próximas citas.\n\n**Rutinas** — Actividades recurrentes: paseos, cepillado, baño, juego. Con frecuencia configurable y registro de último cumplimiento.`,
      },
    ],
    documentation: {
      problem: 'Necesitaba un lugar centralizado para llevar el historial de salud y rutinas de mis mascotas, integrado en la misma plataforma.',
      approach: 'Módulo separado dentro de la plataforma H3nky, con Supabase como backend y RLS para aislamiento de datos por usuario.',
      decisions: [
        'Estructura de pestañas por mascota (alimentación, salud, rutinas) para mantener el contexto del animal',
        'Tablas separadas por tipo de dato (health, feeding, routines) para flexibilidad de consulta',
        'Compartir AuthContext con el resto de la plataforma — sin duplicar lógica de autenticación',
      ],
      result: 'Módulo funcional con ficha de mascotas, alimentación y seguimiento de salud. Rutinas en desarrollo activo.',
    },
    meta: {
      status: 'En desarrollo activo.',
      limitations: ['Requiere cuenta Google', 'Sin notificaciones push para recordatorios de rutinas aún'],
      aiProcess: 'Desarrollado con Claude Code. Estructura de datos y componentes generados con prompts, refinados iterativamente.',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // VEHÍCULO
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'vehiculo',
    shortTitle: 'Vehículo',
    chapter: 'Apps',
    chapterIndex: 1,
    kicker: 'App personal · React + Supabase',
    gradientFrom: '#0ea5e9', gradientVia: '#0284c7', gradientTo: '#1e3a5f',
    title: 'Vehículo — Gestión de flotas personales',
    description: 'Control de repostajes, mantenimiento, gastos y estadísticas. Multi-vehículo con datos en Supabase.',
    blurb: 'Control total del vehículo personal: repostajes con precio y litros, mantenimientos programados, registro de gastos y estadísticas de consumo. Arquitectura multi-vehículo preparada para gestionar más de un coche.',
    status: 'wip',
    featured: true,
    primary: true,
    technologies: ['React', 'Supabase', 'Google OAuth'],
    github: null,
    demo: null,
    images: ['/projects/vehiculo/cover.jpg'],
    date: '2026-04',
    metrics: [
      { label: 'Módulos', value: '5' },
      { label: 'Tablas', value: '4+' },
      { label: 'Gráficas', value: 'Sí' },
      { label: 'Multi-v.', value: 'Sí' },
    ],
    docs: [
      {
        id: 'descripcion',
        title: 'Descripción',
        content: `Módulo de gestión de vehículos con arquitectura multi-vehículo. El usuario puede registrar varios vehículos y llevar un historial completo de cada uno: repostajes (fecha, litros, precio/litro, km), mantenimientos (revisiones, cambios de aceite, ITV), gastos varios y estadísticas calculadas de consumo.\n\nLos datos están en Supabase con Row-Level Security. Cada vehículo pertenece al proyecto del usuario, garantizando aislamiento total de datos.`,
      },
      {
        id: 'modulos',
        title: 'Módulos',
        content: `**Mis Vehículos** — Lista de vehículos registrados con acceso a la vista de detalle de cada uno.\n\n**Repostajes** — Registro histórico de repostajes con fecha, km, litros, precio total y precio/litro. Gráfica de evolución del precio del combustible.\n\n**Mantenimiento** — Historial de mantenimientos con tipo, fecha, km, descripción y coste. Alertas por km o fecha.\n\n**Gastos** — Registro de gastos varios (parkings, multas, seguros, ITV). Categorizable.\n\n**Estadísticas** — Consumo medio calculado, coste por km, resumen mensual y anual.`,
      },
    ],
    documentation: {
      problem: 'Quería llevar un registro detallado del consumo, mantenimientos y gastos de mi vehículo en un lugar propio, sin apps de terceros.',
      approach: 'Módulo integrado en la plataforma H3nky con Supabase para persistencia y cálculos de estadísticas en cliente.',
      decisions: [
        'Arquitectura multi-vehículo desde el inicio — tabla vehicles con FK a projects',
        'Estadísticas calculadas en cliente para reducir consultas — los datos raw se traen completos y se procesan localmente',
        'Módulo VehiculoDetail como layout con outlet — las sub-rutas (repostajes, mantenimiento...) renderizan dentro del mismo layout',
      ],
      result: 'App con repostajes, mantenimiento, gastos y estadísticas operativos. Multi-vehículo funcional.',
    },
    meta: {
      status: 'En desarrollo activo.',
      limitations: ['Requiere cuenta Google', 'Sin exportación de datos aún', 'Gráficas básicas — sin librería dedicada'],
      aiProcess: 'Desarrollado con Claude Code. Estructura multi-vehículo y cálculo de estadísticas diseñados mediante prompts estructurados.',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // FINANZAS
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'finanzas',
    shortTitle: 'Finanzas',
    chapter: 'Apps',
    chapterIndex: 1,
    kicker: 'App personal · React + Supabase',
    gradientFrom: '#16a34a', gradientVia: '#15803d', gradientTo: '#14532d',
    title: 'Finanzas — Control de gastos personales',
    description: 'Transacciones, categorías, presupuestos y resumen mensual. Control financiero personal con Supabase.',
    blurb: 'Control financiero personal completo: registro de transacciones con categoría, seguimiento de presupuestos mensuales y resumen visual del estado económico. Sin conexión bancaria — datos introducidos manualmente para privacidad total.',
    status: 'wip',
    featured: true,
    primary: true,
    technologies: ['React', 'Supabase', 'Google OAuth'],
    github: null,
    demo: null,
    images: ['/projects/finanzas/cover.jpg'],
    date: '2026-04',
    metrics: [
      { label: 'Módulos', value: '4' },
      { label: 'Tablas', value: '3+' },
      { label: 'Presupuestos', value: 'Sí' },
      { label: 'Status', value: 'WIP' },
    ],
    docs: [
      {
        id: 'descripcion',
        title: 'Descripción',
        content: `Módulo de finanzas personales sin conexión bancaria. El usuario registra manualmente sus transacciones (ingresos y gastos) con categoría, fecha e importe. El sistema calcula el balance mensual, el estado de cada presupuesto y genera un resumen visual.\n\nLa privacidad es el eje central: sin APIs de terceros, sin acceso a cuentas bancarias, datos propios en Supabase con RLS. El usuario controla completamente sus datos financieros.`,
      },
      {
        id: 'modulos',
        title: 'Módulos',
        content: `**Resumen** — Vista principal con balance del mes, gastos por categoría y comparativa con meses anteriores.\n\n**Transacciones** — Lista de todas las transacciones con filtro por categoría, fecha y tipo (ingreso/gasto). CRUD completo.\n\n**Categorías** — Gestión de categorías personalizadas con icono y color. Usadas en transacciones y presupuestos.\n\n**Presupuestos** — Límites de gasto mensual por categoría. Indicadores visuales de progreso y alerta cuando se acerca al límite.`,
      },
    ],
    documentation: {
      problem: 'Quería control financiero personal sin ceder el acceso a mis cuentas bancarias a apps de terceros.',
      approach: 'Módulo manual dentro de la plataforma H3nky: el usuario introduce sus propias transacciones, con análisis y presupuestos calculados en cliente.',
      decisions: [
        'Sin Open Banking — privacidad por diseño, no por limitación técnica',
        'Categorías como entidad propia — permiten personalización total y son la FK de transacciones y presupuestos',
        'Presupuestos calculados en cliente con los datos traídos de Supabase — sin funciones SQL para reducir latencia',
      ],
      result: 'App funcional con registro de transacciones, gestión de categorías, presupuestos y resumen mensual.',
    },
    meta: {
      status: 'En desarrollo activo.',
      limitations: ['Requiere cuenta Google', 'Sin exportación CSV/Excel aún', 'Sin importación automática de extractos bancarios'],
      aiProcess: 'Desarrollado con Claude Code. Arquitectura de categorías y presupuestos diseñada mediante prompts con restricciones explícitas de privacidad.',
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PERSONAL
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'personal',
    shortTitle: 'Personal',
    chapter: 'Apps',
    chapterIndex: 1,
    kicker: 'App personal · React + Supabase',
    gradientFrom: '#7c3aed', gradientVia: '#6d28d9', gradientTo: '#4c1d95',
    title: 'Personal — Notas, tareas e ideas',
    description: 'Notas libres, lista de tareas y captura de ideas. Productividad personal con Supabase.',
    blurb: 'Espacio de productividad personal: notas en texto libre, lista de tareas con estados, y un tablero de ideas para capturar pensamientos antes de que se pierdan. Todo integrado en la misma plataforma con autenticación compartida.',
    status: 'wip',
    featured: false,
    primary: false,
    technologies: ['React', 'Supabase', 'Google OAuth'],
    github: null,
    demo: null,
    images: ['/projects/personal/cover.jpg'],
    date: '2026-04',
    metrics: [
      { label: 'Módulos', value: '3' },
      { label: 'Tablas', value: '3' },
      { label: 'Status', value: 'WIP' },
      { label: 'Auth', value: 'Google' },
    ],
    docs: [
      {
        id: 'descripcion',
        title: 'Descripción',
        content: `Módulo de productividad personal dentro de la plataforma H3nky. Tres herramientas simples y directas: notas en texto libre sin formato complejo, lista de tareas con estados (pendiente/en progreso/completado), y captura de ideas con posibilidad de elaborarlas después.\n\nLa simplicidad es deliberada — el objetivo es que no haya fricción para capturar información rápidamente, sin configurar etiquetas, carpetas o flujos complejos.`,
      },
      {
        id: 'modulos',
        title: 'Módulos',
        content: `**Notas** — Editor de texto libre. Notas con título y contenido, búsqueda, ordenación por fecha. Sin formato markdown complejo.\n\n**Tareas** — Lista de tareas con tres estados: pendiente, en progreso, completado. Ordenación manual y por fecha. Archivado de completadas.\n\n**Ideas** — Captura rápida de ideas (una línea o un párrafo). Sin estructura impuesta. Las ideas pueden marcarse como elaboradas cuando se convierten en notas o tareas.`,
      },
    ],
    documentation: {
      problem: 'Necesitaba un espacio propio para notas y tareas, integrado en la misma plataforma, sin cambiar de contexto.',
      approach: 'Módulo minimalista dentro de H3nky — tres herramientas simples con Supabase como backend.',
      decisions: [
        'Sin markdown avanzado — simplicidad primero, el contenido importa más que el formato',
        'Ideas como entidad propia separada de notas — captura diferente, sin estructura impuesta',
        'Compartir el mismo AuthContext y AppLayout — sin duplicar infraestructura de auth',
      ],
      result: 'Módulo funcional con notas, tareas e ideas. Integrado en la plataforma con autenticación compartida.',
    },
    meta: {
      status: 'Funcional. UI en iteración.',
      limitations: ['Sin búsqueda global entre los tres módulos', 'Sin exportación'],
      aiProcess: 'Desarrollado con Claude Code. Estructura mínima deliberada — el prompt incluía "sin sobreingeniería, tres módulos simples".',
    },
  },
]

export const CHAPTERS = [
  {
    id: 'apps',
    label: 'Apps',
    title: 'Apps',
    blurb: 'Productos en uso real. Lo que construyo para mí, primero.',
    color: '#fe7000',
    iconKind: 'app',
  },
  {
    id: 'web',
    label: 'Web & Portfolio',
    title: 'Web & Portfolio',
    blurb: 'La capa visible: este sitio, su arquitectura y sus decisiones.',
    color: '#0ea5e9',
    iconKind: 'web',
  },
  {
    id: 'ia',
    label: 'IA & Workflow',
    title: 'IA & Workflow',
    blurb: 'Cómo desarrollo siendo uno solo: agentes, prompts y procesos.',
    color: '#9a4efb',
    iconKind: 'ia',
  },
  {
    id: 'infra',
    label: 'Infraestructura',
    title: 'Infraestructura',
    blurb: 'El plumbing que conecta el código con producción.',
    color: '#21eb3f',
    iconKind: 'infra',
  },
]

export const CHAPTER_BY_NAME = {
  'Apps': 'apps',
  'Web & Portfolio': 'web',
  'IA & Workflow': 'ia',
  'Infraestructura': 'infra',
}
