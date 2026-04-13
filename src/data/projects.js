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
]
