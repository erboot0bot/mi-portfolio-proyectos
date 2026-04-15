/**
 * Project data — single source of truth.
 *
 * To add a project, append an object to this array.
 *
 * Field rules:
 *   slug        — kebab-case only (a-z, 0-9, guiones). Se usa en la URL.
 *   status      — 'completed' | 'wip' | 'archived'
 *   featured    — true = aparece primero. Orden: featured desc → date desc.
 *   github      — opcional. Si falta, el botón no se renderiza.
 *   demo        — opcional. Si falta, el botón no se renderiza.
 *   images      — opcional. Array de paths relativos a /public (formato .webp preferido).
 *                 Si falta o está vacío, la galería no se renderiza.
 *   date        — formato 'YYYY-MM' (mes siempre con dos dígitos, p.ej. '2026-04').
 *
 * Images: guarda los archivos en /public/projects/{slug}/ y referéncialos como
 *         '/projects/{slug}/cover.webp'
 */

export const projects = [
  {
    slug: 'portfolio-personal',
    title: 'Portfolio Personal',
    description:
      'Esta misma web — documentación de proyectos con React, Vite, Tailwind y Framer Motion.',
    longDescription:
      'Una web de portfolio construida desde cero sin ser desarrollador, usando IA como equipo completo. Stack: React 19 con hooks modernos, Vite 8 como bundler (HMR instantáneo, build optimizado), Tailwind v4 con la nueva sintaxis de importación (@import "tailwindcss" en lugar de @tailwind base/components/utilities). Sistema de temas dark/light implementado con CSS custom properties — un token como --accent: #f97316 funciona en ambos modos sin duplicar clases. El toggle persiste en localStorage y respeta prefers-color-scheme del sistema. Animaciones con Framer Motion: transiciones entre páginas con AnimatePresence, hover en cards con whileHover. Filtrado por tecnología en tiempo real, galería lightbox en detalle de proyecto, generación automática de imágenes de portada con Pollinations.ai (sin API key, completamente gratis). Tests con Vitest + Testing Library. Desplegado en Vercel con auto-deploy en cada push a main. El proyecto demuestra que con las herramientas correctas, los límites técnicos dejan de ser límites.',
    status: 'wip',
    featured: true,
    technologies: ['React', 'Vite', 'Tailwind', 'Framer Motion', 'Vitest'],
    github: 'https://github.com/H3nky/mi-portfolio-proyectos',
    demo: null,
    images: ['/projects/portfolio-personal/cover.jpg'],
    date: '2026-04',
  },
  {
    slug: 'ai-dev-setup',
    title: 'Setup de Desarrollo con IA',
    description: 'Configuración completa de Claude Code + gstack para desarrollar como un equipo de 20.',
    longDescription: 'Workflow completo para desarrollar como un equipo de 20 siendo uno solo. Claude Code actúa como motor de ejecución — lee el codebase, edita archivos, ejecuta comandos, corre tests. gstack añade roles especializados como slash commands: /review (staff engineer que encuentra bugs de producción), /design-shotgun (genera variantes visuales para elegir), /qa (abre browser real y testea la app), /ship (sincroniza, corre tests, abre PR). El sistema de contexto entre sesiones se basa en dos archivos: ESTADO-PROYECTO.md documenta el stack, decisiones de diseño, deuda técnica y próximos pasos — se pasa al inicio de cada sesión para que Claude retome exactamente donde lo dejó. TODOS.md funciona como backlog vivo. Comparativa real tras usarlo: Claude Code genera código funcional y lo integra directamente en el proyecto. Cursor es un editor con IA dentro. Copilot es autocompletado avanzado. La diferencia es que Claude Code actúa, no sugiere. Sin escribir apenas código a mano: prompts precisos + contexto = producto real.',
    status: 'completed',
    featured: true,
    technologies: ['Claude Code', 'gstack', 'AI', 'Prompt Engineering'],
    github: null,
    demo: null,
    images: ['/projects/ai-dev-setup/cover.jpg'],
    date: '2026-04',
  },
  {
    slug: 'portfolio-config',
    title: 'Portfolio con React + Vite + Tailwind v4',
    description: 'Arquitectura y decisiones técnicas detrás de este mismo portfolio.',
    longDescription: 'Documentación técnica de cada decisión de arquitectura. Tailwind v4 elimina tailwind.config.js — la configuración vive en CSS: @import "tailwindcss"; @custom-variant dark (&:where(.dark, .dark *)); :root { --bg: #fffcf9; --accent: #f97316; --text: #09090b; } html.dark { --bg: #0a0a0f; --text: #f4f4f5; }. Los tokens se usan en JSX con className="bg-[var(--bg)] text-[var(--text)]". React Router DOM 7 maneja la navegación con lazy loading por ruta. Framer Motion gestiona AnimatePresence para transiciones suaves entre páginas. El script generate-image.js construye un prompt automático con título, descripción y stack del proyecto, llama a Pollinations.ai y guarda la imagen en public/projects/{slug}/cover.jpg sin necesitar ninguna API key ni variable de entorno. Tests con Vitest siguen el patrón waitFor para elementos que aparecen tras animaciones. Estructura de carpetas: components/ para piezas reutilizables, pages/ para rutas, data/projects.js como única fuente de verdad.',
    status: 'wip',
    featured: true,
    technologies: ['React', 'Vite', 'Tailwind', 'Framer Motion', 'Vitest', 'Pollinations.ai'],
    github: null,
    demo: null,
    images: ['/projects/portfolio-config/cover.jpg'],
    date: '2026-04',
  },
  {
    slug: 'vercel-deploy',
    title: 'Deploy y CI/CD con Vercel',
    description: 'De localhost a producción: sincronización con GitHub y deploy automático.',
    longDescription: 'Pipeline completo de zero a producción. Vercel detecta automáticamente que es un proyecto Vite y configura el build sin tocar nada: comando de build npm run build, directorio de salida dist/. Cada push a main dispara un deploy automático — en menos de 2 minutos el cambio está en producción. Cada Pull Request genera un Preview Deployment con URL única (proyecto-git-nombre-rama.vercel.app) para revisar cambios antes de mergear. Sin variables de entorno porque Pollinations.ai no necesita API key — el proyecto es completamente estático. Configuración de dominio propio en Vercel > Settings > Domains: apunta el DNS a los nameservers de Vercel y el SSL se genera automáticamente. El repositorio en GitHub actúa como fuente de verdad — Vercel escucha los eventos de push via webhook. Resultado: workflow donde escribir código y verlo en producción son casi el mismo acto.',
    status: 'completed',
    featured: false,
    technologies: ['Vercel', 'GitHub', 'CI/CD', 'DNS'],
    github: null,
    demo: null,
    images: ['/projects/vercel-deploy/cover.jpg'],
    date: '2026-04',
  },
]
