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
      'Una web de portfolio estática construida con React 19, Vite 8 y Tailwind 4. Cada proyecto tiene su propia URL, filtrado por tecnología, galería de capturas con lightbox, y transiciones animadas entre páginas. Desplegada en Vercel con auto-deploy al hacer push.',
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
    longDescription: 'Workflow completo de desarrollo asistido por IA: Claude Code como motor, gstack como equipo virtual (CEO, designer, QA, release engineer), y claude.ai para contexto y planificación. Incluye comparativa con Cursor y Copilot, cómo estructurar CLAUDE.md y ESTADO-PROYECTO.md para mantener contexto entre sesiones, TODOS.md como backlog, y prompt engineering efectivo para Claude Code.',
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
    longDescription: 'Stack moderno: React 19, Vite 8, Tailwind v4 con CSS custom properties en lugar de tailwind.config.js, Framer Motion para animaciones, React Router DOM 7. Sistema de temas dark/light con tokens CSS y persistencia en localStorage. Generación automática de imágenes de portada con Pollinations.ai sin API key. Tests con Vitest + Testing Library. Organización de carpetas, scripts npm y decisiones de diseño documentadas.',
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
    longDescription: 'Configuración completa de Vercel para un proyecto React + Vite: conexión al repositorio de GitHub, auto-deploy en cada push a main, preview deployments por rama para revisar cambios antes de mergear, configuración de dominio propio, y gestión sin variables de entorno gracias a Pollinations.ai.',
    status: 'completed',
    featured: false,
    technologies: ['Vercel', 'GitHub', 'CI/CD', 'DNS'],
    github: null,
    demo: null,
    images: ['/projects/vercel-deploy/cover.jpg'],
    date: '2026-04',
  },
]
