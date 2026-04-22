// src/data/projects.js — Documentación técnica completa
// Generado el 2026-04-22

export const projects = [
  // ─────────────────────────────────────────────────────────────────────────────
  // HOGAR
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'hogar',
    shortTitle: 'Hogar',
    gradientFrom: '#ea580c', gradientVia: '#9a3412', gradientTo: '#7c2d12',
    title: 'Hogar — Apps del día a día',
    description: 'Calendario, lista de la compra, menú semanal y recetas con IA. Autenticación con Google vía Supabase.',
    status: 'wip',
    featured: true,
    technologies: ['React', 'Supabase', 'Claude AI', 'FullCalendar', 'Google OAuth'],
    github: null,
    demo: null,
    images: ['/projects/hogar/cover.jpg'],
    date: '2026-04',
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
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PORTFOLIO PERSONAL
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'portfolio-personal',
    shortTitle: 'Portfolio',
    gradientFrom: '#f97316', gradientVia: '#f59e0b', gradientTo: '#d97706',
    title: 'Portfolio Personal',
    description: 'Esta misma web — documentación de proyectos con React, Vite, Tailwind y Framer Motion.',
    status: 'wip',
    featured: true,
    technologies: ['React', 'Vite', 'Tailwind', 'Framer Motion', 'Vitest', 'Pollinations.ai'],
    github: 'https://github.com/H3nky/mi-portfolio-proyectos',
    demo: null,
    images: ['/projects/portfolio-personal/cover.jpg'],
    date: '2026-04',
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
        title: 'Animaciones con Framer Motion',
        content: `9 contextos de animación distintos, todos coordinados para que la web se sienta viva sin ser ostentosa.`,
        code: {
          lang: 'jsx',
          src: `// App.jsx — transición entre páginas (200ms, y: ±10px)
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.15 } },
}

<AnimatePresence mode="wait">
  <motion.div key={location.pathname} variants={pageVariants}
    initial="initial" animate="animate" exit="exit">
    <Routes location={location}>...</Routes>
  </motion.div>
</AnimatePresence>

// ProjectCard.jsx — hover lift
<motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 400 }}>

// ImageGallery.jsx — lightbox con AnimatePresence
// LandingPage.jsx — stagger en SectionsGrid (hidden → visible)
// ComingSoonPage.jsx — spring en icon (scale + opacity)`,
        },
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
    gradientFrom: '#0ea5e9', gradientVia: '#0284c7', gradientTo: '#0369a1',
    title: 'Portfolio con React + Vite + Tailwind v4',
    description: 'Arquitectura y decisiones técnicas detrás de este mismo portfolio.',
    status: 'wip',
    featured: true,
    technologies: ['React', 'Vite', 'Tailwind', 'Framer Motion', 'Vitest', 'Pollinations.ai'],
    github: null,
    demo: null,
    images: ['/projects/portfolio-config/cover.jpg'],
    date: '2026-04',
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
    gradientFrom: '#7c3aed', gradientVia: '#5b21b6', gradientTo: '#4c1d95',
    title: 'Setup de Desarrollo con IA',
    description: 'Configuración completa de Claude Code + gstack para desarrollar como un equipo de 20.',
    status: 'completed',
    featured: true,
    technologies: ['Claude Code', 'gstack', 'AI', 'Prompt Engineering'],
    github: null,
    demo: null,
    images: ['/projects/ai-dev-setup/cover.jpg'],
    date: '2026-04',
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
    gradientFrom: '#18181b', gradientVia: '#27272a', gradientTo: '#3f3f46',
    title: 'Deploy y CI/CD con Vercel',
    description: 'De localhost a producción: sincronización con GitHub y deploy automático.',
    status: 'completed',
    featured: false,
    technologies: ['Vercel', 'GitHub', 'CI/CD', 'DNS'],
    github: null,
    demo: null,
    images: ['/projects/vercel-deploy/cover.jpg'],
    date: '2026-04',
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
]
