# UX Portfolio Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all pending UX improvements from the strategic document: updated hero CTAs, a metrics section, ProjectCard demo/GitHub links, a contact page with accessible form, lead-capture in ComingSoon pages, a /lab experiments page, and Vercel Analytics.

**Architecture:** Each task is self-contained. The codebase uses React 18 + React Router v6 + Supabase + Tailwind v4 + GSAP. `src/test-setup.js` mocks `matchMedia` (returns `true` for `prefers-reduced-motion`), `IntersectionObserver`, and `ResizeObserver` globally — GSAP-heavy components are safe to test without extra setup. Tests wrap components with `<MemoryRouter>` and `<LanguageProvider>` as needed.

**Tech Stack:** React 18, React Router v6, Supabase JS, Tailwind v4, GSAP, Vitest + React Testing Library, `@vercel/analytics`

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `src/pages/LandingPage.jsx` | Update hero CTAs, add Lab to SECTIONS grid, add StatsSection |
| Create | `src/pages/LandingPage.test.jsx` | Smoke test: stats and Lab card render |
| Modify | `src/components/ProjectCard.jsx` | Show Demo/GitHub links below card content when data has them |
| Create | `src/components/ProjectCard.test.jsx` | Demo/GitHub links render only when present |
| Create | `supabase/migrations/20260427_contact_messages.sql` | contact_messages table + RLS |
| Create | `src/pages/Contact.jsx` | Accessible contact form with Supabase insert + client validation |
| Create | `src/pages/Contact.test.jsx` | Form fields, validation errors, success state |
| Modify | `src/App.jsx` | Add `/contact` and `/lab` routes |
| Modify | `src/components/Layout.jsx` | Add Contacto + Lab to nav; add Contacto to footer |
| Modify | `src/components/ComingSoonPage.jsx` | Add optional `waitlistKey` prop with localStorage lead capture |
| Create | `src/components/ComingSoonPage.test.jsx` | Waitlist form behavior (show/hide, validation, success) |
| Create | `src/data/experiments.js` | Static experiment entries for /lab |
| Create | `src/pages/Lab.jsx` | /lab experiments grid page |
| Create | `src/pages/Lab.test.jsx` | Experiments render correctly |
| Modify | `src/App.jsx` | (same file — covered in Task 3) |

---

## Task 1: LandingPage — CTAs mejoradas + StatsSection + Lab en grid

**Files:**
- Modify: `src/pages/LandingPage.jsx`
- Create: `src/pages/LandingPage.test.jsx`

Context: `LandingPage.jsx` has 3 sections: `HeroSection` (h1, 2 CTAs), `SectionsGrid` (4 section cards in a `lg:grid-cols-4` grid), `AboutSection`. We update CTA text, add a 5th card (Lab) to the grid (adjusting to `lg:grid-cols-3`), and insert a `StatsSection` between the hero and the sections grid.

- [ ] **Step 1: Write the failing test**

```jsx
// src/pages/LandingPage.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LanguageProvider } from '../contexts/LanguageContext'
import LandingPage from './LandingPage'

function renderLanding() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <LandingPage />
      </LanguageProvider>
    </MemoryRouter>
  )
}

describe('LandingPage', () => {
  it('renders the hero h1', () => {
    renderLanding()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders the stats section with metric values', () => {
    renderLanding()
    expect(screen.getByText('4+')).toBeInTheDocument()
    expect(screen.getByText('Apps en producción')).toBeInTheDocument()
  })

  it('renders the Lab section card', () => {
    renderLanding()
    expect(screen.getByRole('heading', { name: /lab/i })).toBeInTheDocument()
  })

  it('renders primary CTA linking to /apps', () => {
    renderLanding()
    const appsLink = screen.getByRole('link', { name: /ver mis apps/i })
    expect(appsLink).toHaveAttribute('href', '/apps')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- LandingPage.test.jsx
```

Expected: FAIL — `getByText('4+')` and `getByRole('heading', { name: /lab/i })` not found.

- [ ] **Step 3: Update `LandingPage.jsx`**

Replace the current `SECTIONS` array and `LandingPage` + `HeroSection` + `SectionsGrid` with the following. The rest of the file (`SectionCard`, `AboutSection`, helpers) remains unchanged.

Find and replace the `SECTIONS` array (currently starts with `{ key: 'apps'`):

```jsx
const SECTIONS = [
  {
    key: 'apps',
    title: 'My Apps',
    description: 'Herramientas web personales. Accede con tu cuenta de Google y úsalas desde cualquier dispositivo.',
    icon: '⚡',
    href: '/apps',
    status: 'active',
    cta: 'Ver mis apps',
    accentColor: 'var(--accent)',
  },
  {
    key: 'projects',
    title: 'Documentación',
    description: 'Portfolio de todo lo que he construido: apps, scripts, setups y experimentos con IA.',
    icon: '🛠️',
    href: '/projects',
    status: 'active',
    cta: 'Ver el portfolio',
    accentColor: '#6366f1',
  },
  {
    key: 'lab',
    title: 'Lab',
    description: 'Experimentos, prototipos y cosas en construcción. El proceso sin filtrar.',
    icon: '🧪',
    href: '/lab',
    status: 'active',
    cta: 'Explorar el lab',
    accentColor: '#06b6d4',
  },
  {
    key: 'courses',
    title: 'Cursos',
    description: 'Formación técnica: IA aplicada, flujos de desarrollo y herramientas que multiplican la productividad.',
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
```

Find the hero CTAs block (inside `HeroSection`, the `data-hero-ctas` div) and replace:

```jsx
        <div data-hero-ctas className="flex flex-wrap gap-3">
          <Link to="/apps"
            style={{ ...hiddenUp(12), background: 'var(--accent)' }}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm text-white
              transition-all hover:opacity-90 active:scale-95">
            Ver mis apps →
          </Link>
          <Link to="/projects" style={hiddenUp(12)}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all
              border border-[var(--border)] text-[var(--text)]
              hover:bg-[var(--bg-card)] active:scale-95">
            Ver el portfolio →
          </Link>
        </div>
```

Add the `StatsSection` component (add it anywhere before `SectionsGrid` in the file, e.g. after the `SECTIONS` array):

```jsx
const STATS = [
  { value: '4+',   label: 'Apps en producción' },
  { value: '100%', label: 'Código asistido por IA' },
  { value: '1',    label: 'Desarrollador solo' },
  { value: 'Open', label: 'Código fuente público' },
]

function StatsSection() {
  return (
    <section
      aria-label="Métricas"
      className="px-6 sm:px-10 lg:px-16 max-w-[1440px] mx-auto py-6">
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map(({ value, label }) => (
          <div key={label}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-center">
            <dt className="text-xs text-[var(--text-faint)] mb-1">{label}</dt>
            <dd className="text-2xl font-extrabold text-[var(--text)]">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
```

Update `LandingPage` export to include `StatsSection` between hero and sections grid:

```jsx
export default function LandingPage() {
  return (
    <div>
      <title>H3nky | Portfolio</title>
      <HeroSection />
      <StatsSection />
      <SectionsGrid />
      <AboutSection />
    </div>
  )
}
```

Update `SectionsGrid` to use `lg:grid-cols-3` (was `lg:grid-cols-4`) since we now have 5 cards:

```jsx
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SECTIONS.map(s => <SectionCard key={s.key} section={s} />)}
      </div>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test -- LandingPage.test.jsx
```

Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/pages/LandingPage.jsx src/pages/LandingPage.test.jsx
git commit -m "feat(landing): update CTAs, add StatsSection, add Lab to sections grid"
```

---

## Task 2: ProjectCard — links de Demo y GitHub

**Files:**
- Modify: `src/components/ProjectCard.jsx`
- Create: `src/components/ProjectCard.test.jsx`

Context: `ProjectCard` wraps everything in a `<motion.div><Link>`. We restructure so the Link only wraps the visual content, and Demo/GitHub `<a>` tags sit below it (no nested anchors). Only renders the links row when the project has at least one of `demo` or `github` set to a non-null string.

- [ ] **Step 1: Write the failing test**

```jsx
// src/components/ProjectCard.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProjectCard from './ProjectCard'

const baseProject = {
  slug: 'test-project',
  title: 'Test Project',
  description: 'A test project description that is long enough.',
  status: 'completed',
  technologies: ['React', 'Supabase'],
  gradientFrom: '#ea580c',
  gradientTo: '#7c2d12',
  shortTitle: 'Test',
  github: null,
  demo: null,
}

function renderCard(overrides = {}) {
  return render(
    <MemoryRouter>
      <ProjectCard project={{ ...baseProject, ...overrides }} />
    </MemoryRouter>
  )
}

describe('ProjectCard', () => {
  it('renders project title and description', () => {
    renderCard()
    expect(screen.getByRole('heading', { name: 'Test Project' })).toBeInTheDocument()
    expect(screen.getByText(/test project description/i)).toBeInTheDocument()
  })

  it('does not render Demo/GitHub links when both are null', () => {
    renderCard()
    expect(screen.queryByRole('link', { name: /demo/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /github/i })).not.toBeInTheDocument()
  })

  it('renders GitHub link when github is set', () => {
    renderCard({ github: 'https://github.com/H3nky/repo' })
    const link = screen.getByRole('link', { name: /github/i })
    expect(link).toHaveAttribute('href', 'https://github.com/H3nky/repo')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders Demo link when demo is set', () => {
    renderCard({ demo: 'https://demo.example.com' })
    const link = screen.getByRole('link', { name: /demo/i })
    expect(link).toHaveAttribute('href', 'https://demo.example.com')
  })

  it('renders both links when both are set', () => {
    renderCard({ github: 'https://github.com/H3nky/repo', demo: 'https://demo.example.com' })
    expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /demo/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- ProjectCard.test.jsx
```

Expected: FAIL — `getByRole('heading', { name: 'Test Project' })` not found (card wraps in a Link, not headings).

Actually it will fail because `ProjectCard` currently wraps everything in `<Link>` so `<h2>` is inside an anchor; the heading WILL be found by `getByRole('heading')`. But the Demo/GitHub tests will fail since those links don't exist yet.

- [ ] **Step 3: Rewrite `src/components/ProjectCard.jsx`**

Replace the entire file:

```jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import TechBadge from './TechBadge'

const statusLabel = { completed: 'Completado', wip: 'En progreso', archived: 'Archivado' }
const statusColor = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
  wip:       'bg-orange-50 text-orange-700 border-orange-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  archived:  'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-700/40 dark:text-zinc-500 dark:border-zinc-600/30',
}

function CardCover({ project }) {
  const { gradientFrom, gradientTo, shortTitle, title, technologies } = project

  if (gradientFrom) {
    return (
      <div
        className="w-full h-44 relative overflow-hidden flex items-end"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}20, ${gradientTo}40)`,
          borderBottom: `1px solid ${gradientFrom}30`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <div style={{
            width: 96, height: 96, borderRadius: '50%', opacity: 0.18,
            background: `radial-gradient(circle, ${gradientFrom}, transparent)`,
          }} />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-2/3 pointer-events-none"
          style={{ background: `linear-gradient(to top, ${gradientTo}cc, transparent)` }}
        />
        <span
          className="absolute top-3 right-3 z-10 font-mono text-[10px] tracking-wider"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          {technologies.slice(0, 2).join(' · ')}
        </span>
        <span
          className="relative z-10 px-5 pb-4 text-2xl font-black text-white tracking-tight leading-none"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.35)' }}
        >
          {shortTitle || title}
        </span>
      </div>
    )
  }

  const cover = project.images?.[0]
  if (cover) {
    return (
      <img
        src={cover}
        alt={`Captura de ${title}`}
        className="w-full h-44 object-cover"
        loading="lazy"
      />
    )
  }

  return (
    <div className="w-full h-44 flex items-center justify-center text-xs
      bg-zinc-50 text-zinc-400 dark:bg-zinc-800/50 dark:text-zinc-600">
      Sin captura
    </div>
  )
}

export default function ProjectCard({ project }) {
  const hasLinks = project.demo || project.github

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="h-full"
    >
      <div className="flex flex-col h-full rounded-xl overflow-hidden transition-all duration-200
        border border-[var(--border)] bg-[var(--bg-card)]
        hover:border-orange-200 hover:shadow-[0_4px_20px_rgba(249,115,22,0.08)]
        dark:hover:border-orange-500/30
        dark:hover:shadow-[0_0_32px_rgba(249,115,22,0.10),0_8px_28px_rgba(0,0,0,0.4)]">

        {/* Clickable area → project detail */}
        <Link to={`/projects/${project.slug}`} className="block flex-1">
          <CardCover project={project} />
          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h2 className="font-semibold leading-snug text-[var(--text)]">{project.title}</h2>
              <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${statusColor[project.status]}`}>
                {statusLabel[project.status]}
              </span>
            </div>
            <p className="text-sm mb-4 line-clamp-2 leading-relaxed text-[var(--text-muted)]">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.slice(0, 3).map(tech => (
                <TechBadge key={tech} tech={tech} />
              ))}
              {project.technologies.length > 3 && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border
                  border-[var(--border)] text-[var(--text-faint)]">
                  +{project.technologies.length - 3}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Demo / GitHub links — outside the Link to avoid nested anchors */}
        {hasLinks && (
          <div className="px-5 pb-4 pt-3 flex gap-2 border-t border-[var(--border)]">
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg
                  bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
              >
                Demo →
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg
                  border border-[var(--border)] text-[var(--text-muted)]
                  hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors"
              >
                GitHub →
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 4: Run all tests to verify ProjectCard tests pass and no regressions**

```bash
npm run test -- ProjectCard.test.jsx
npm run test -- ProjectsHome.test.jsx
```

Expected: 5 new tests pass, all existing ProjectsHome tests still pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProjectCard.jsx src/components/ProjectCard.test.jsx
git commit -m "feat(projects): add demo and GitHub links to ProjectCard"
```

---

## Task 3: Formulario de Contacto

**Files:**
- Create: `supabase/migrations/20260427_contact_messages.sql`
- Create: `src/pages/Contact.jsx`
- Create: `src/pages/Contact.test.jsx`
- Modify: `src/App.jsx` (add `/contact` route)
- Modify: `src/components/Layout.jsx` (add Contacto to nav and footer)

Context: The contact form stores messages in a Supabase `contact_messages` table with an anon-insert RLS policy. The supabase client is at `src/lib/supabase.js`. In tests, supabase is mocked via `vi.mock('../lib/supabase', ...)`. The `Layout` component has a desktop nav `<nav>` and a mobile dropdown — both need the Contacto link. The footer's third column is "Construido con" — we add a new "Contacto" link in the footer brand column.

- [ ] **Step 1: Create the DB migration file**

```sql
-- supabase/migrations/20260427_contact_messages.sql
BEGIN;

CREATE TABLE contact_messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL CHECK(length(trim(name)) >= 2),
  email       TEXT        NOT NULL CHECK(email ~* '^[^@]+@[^@]+\.[^@]+$'),
  message     TEXT        NOT NULL CHECK(length(trim(message)) >= 10),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated visitors) can insert — public contact form
CREATE POLICY "contact_insert" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Only authenticated users (the owner) can read messages
CREATE POLICY "contact_read" ON contact_messages
  FOR SELECT USING (auth.uid() IS NOT NULL);

COMMIT;
```

Apply this migration in the Supabase dashboard SQL Editor or via `supabase db push`.

- [ ] **Step 2: Write the failing test**

```jsx
// src/pages/Contact.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  },
}))

import Contact from './Contact'

function renderContact() {
  return render(<MemoryRouter><Contact /></MemoryRouter>)
}

describe('Contact', () => {
  it('renders heading and form fields', () => {
    renderContact()
    expect(screen.getByRole('heading', { name: /contacto/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument()
  })

  it('shows validation error when name is too short', () => {
    renderContact()
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('shows validation error when email is invalid', () => {
    renderContact()
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana García' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'not-an-email' } })
    fireEvent.change(screen.getByLabelText(/mensaje/i), { target: { value: 'Hola, me gustaría hablar contigo.' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))
    expect(screen.getByText(/email válido/i)).toBeInTheDocument()
  })

  it('shows success state after valid submission', async () => {
    renderContact()
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana García' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ana@example.com' } })
    fireEvent.change(screen.getByLabelText(/mensaje/i), { target: { value: 'Hola, me gustaría hablar contigo sobre un proyecto.' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText(/mensaje enviado/i)).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npm run test -- Contact.test.jsx
```

Expected: FAIL — `Contact` module not found.

- [ ] **Step 4: Create `src/pages/Contact.jsx`**

```jsx
// src/pages/Contact.jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'

function validate(form) {
  const errs = {}
  if (form.name.trim().length < 2)
    errs.name = 'El nombre debe tener al menos 2 caracteres.'
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
    errs.email = 'Introduce un email válido.'
  if (form.message.trim().length < 10)
    errs.message = 'El mensaje debe tener al menos 10 caracteres.'
  return errs
}

export default function Contact() {
  const [form, setForm]     = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'success' | 'error'
  const [errors, setErrors] = useState({})

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStatus('sending')
    const { error } = await supabase.from('contact_messages').insert({
      name:    form.name.trim(),
      email:   form.email.trim().toLowerCase(),
      message: form.message.trim(),
    })
    if (error) { setStatus('error'); return }
    setStatus('success')
    setForm({ name: '', email: '', message: '' })
  }

  const inputClass = 'w-full px-4 py-2.5 rounded-lg border bg-[var(--bg)] text-[var(--text)] ' +
    'text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)] border-[var(--border)]'

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <title>Contacto | H3nky</title>

      <h1 className="text-3xl font-extrabold text-[var(--text)] mb-2">Contacto</h1>
      <p className="text-[var(--text-muted)] mb-10">
        ¿Tienes una idea, propuesta o simplemente quieres saludar? Escríbeme.
      </p>

      {status === 'success' ? (
        <div role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50
            dark:bg-emerald-500/10 dark:border-emerald-500/30 p-10 text-center">
          <p className="text-3xl mb-3">✅</p>
          <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-lg">
            ¡Mensaje enviado!
          </p>
          <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
            Te responderé lo antes posible.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-6 text-sm underline underline-offset-4
              text-emerald-600 dark:text-emerald-400 hover:opacity-80 transition-opacity"
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <div>
            <label htmlFor="contact-name"
              className="block text-sm font-medium text-[var(--text)] mb-1.5">
              Nombre <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <input
              id="contact-name"
              type="text"
              required
              autoComplete="name"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={inputClass}
            />
            {errors.name && (
              <p id="name-error" role="alert" className="mt-1 text-xs text-red-500">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="contact-email"
              className="block text-sm font-medium text-[var(--text)] mb-1.5">
              Email <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={inputClass}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1 text-xs text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="contact-message"
              className="block text-sm font-medium text-[var(--text)] mb-1.5">
              Mensaje <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <textarea
              id="contact-message"
              required
              rows={5}
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'message-error' : undefined}
              className={`${inputClass} resize-none`}
            />
            {errors.message && (
              <p id="message-error" role="alert" className="mt-1 text-xs text-red-500">
                {errors.message}
              </p>
            )}
          </div>

          {status === 'error' && (
            <p role="alert" className="text-sm text-red-500">
              No se pudo enviar el mensaje. Inténtalo de nuevo.
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="self-start px-6 py-2.5 rounded-lg bg-[var(--accent)] text-white
              text-sm font-semibold hover:opacity-90 active:scale-95 transition-all
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === 'sending' ? 'Enviando…' : 'Enviar mensaje'}
          </button>
        </form>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm run test -- Contact.test.jsx
```

Expected: 4 passed.

- [ ] **Step 6: Add `/contact` route to `src/App.jsx`**

Find the line `const ComingSoonPage = ...` (or wherever the lazy imports are defined). Add:

```js
const Contact = React.lazy(() => import('./pages/Contact'))
```

Find the public routes block (where `/courses` and `/store` are). Add after `/store`:

```jsx
<Route path="/contact" element={<Contact />} />
```

- [ ] **Step 7: Add Contacto link to `src/components/Layout.jsx`**

In the desktop nav (after the `<NavLink to="/store">Tienda</NavLink>` line), add:

```jsx
            <NavLink to="/contact" className={navLinkClass}>Contacto</NavLink>
```

In the mobile dropdown (after `<NavLink to="/store">Tienda</NavLink>`), add:

```jsx
            <NavLink to="/contact" className={navLinkClass}>Contacto</NavLink>
```

In the footer brand column (the first `<div>` in the grid, after the GitHub `<a>` link), add:

```jsx
            <a
              href="/contact"
              className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-1.5 rounded-lg text-xs font-medium
                border border-[var(--border)] text-[var(--text-muted)]
                hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
            >
              ✉️ Contacto
            </a>
```

- [ ] **Step 8: Run full test suite to verify no regressions**

```bash
npm run test
```

Expected: all tests pass.

- [ ] **Step 9: Commit**

```bash
git add supabase/migrations/20260427_contact_messages.sql src/pages/Contact.jsx \
  src/pages/Contact.test.jsx src/App.jsx src/components/Layout.jsx
git commit -m "feat: add Contact page with accessible form and Supabase storage"
```

---

## Task 4: ComingSoonPage — Captura de leads

**Files:**
- Modify: `src/components/ComingSoonPage.jsx`
- Create: `src/components/ComingSoonPage.test.jsx`
- Modify: `src/App.jsx` (pass `waitlistKey` prop)

Context: `ComingSoonPage` is used for `/courses` (`title="Cursos"`) and `/store` (`title="Tienda"`). We add an optional `waitlistKey` string prop. When provided, a small email form appears below the "En construcción" text. On valid submit, the email is stored in `localStorage` under key `waitlist_<waitlistKey>` (a JSON array of strings) and a success message replaces the form. Uses `GSAP` already — we add `data-cs-form` target to the animation (the setup mock makes `prefersReducedMotion === true`, so animations skip in tests).

- [ ] **Step 1: Write the failing test**

```jsx
// src/components/ComingSoonPage.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ComingSoonPage from './ComingSoonPage'

function renderPage(props = {}) {
  return render(
    <MemoryRouter>
      <ComingSoonPage title="Cursos" icon="📚" {...props} />
    </MemoryRouter>
  )
}

describe('ComingSoonPage', () => {
  it('renders title and coming-soon badge', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Cursos' })).toBeInTheDocument()
    expect(screen.getByText(/en desarrollo/i)).toBeInTheDocument()
  })

  it('does not show email input when waitlistKey is not provided', () => {
    renderPage()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('shows email input and Notificarme button when waitlistKey is provided', () => {
    renderPage({ waitlistKey: 'cursos' })
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /notificarme/i })).toBeInTheDocument()
  })

  it('shows validation error for invalid email', () => {
    renderPage({ waitlistKey: 'cursos' })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'not-valid' } })
    fireEvent.click(screen.getByRole('button', { name: /notificarme/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('shows success message after valid email submit', () => {
    renderPage({ waitlistKey: 'cursos' })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /notificarme/i }))
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(/te avisamos/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- ComingSoonPage.test.jsx
```

Expected: FAIL — heading test passes (ComingSoonPage has `<h1>`), but email input tests fail.

- [ ] **Step 3: Rewrite `src/components/ComingSoonPage.jsx`**

```jsx
// src/components/ComingSoonPage.jsx
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function isValidEmail(email) {
  return /^[^@]+@[^@]+\.[^@]+$/.test(email.trim())
}

export default function ComingSoonPage({ title, icon, waitlistKey }) {
  const containerRef = useRef(null)
  const [email, setEmail]         = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [emailError, setEmailError] = useState('')

  useGSAP(() => {
    if (prefersReducedMotion) return

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.to('[data-cs-icon]',    { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' })
      .to('[data-cs-heading]', { opacity: 1, y: 0, duration: 0.4 }, '-=0.2')
      .to('[data-cs-body]',    { opacity: 1, y: 0, duration: 0.35 }, '-=0.2')
      .to('[data-cs-form]',    { opacity: 1, y: 0, duration: 0.3 }, '-=0.1')
      .to('[data-cs-back]',    { opacity: 1, duration: 0.3 }, '-=0.1')
  }, { scope: containerRef })

  function handleNotify(e) {
    e.preventDefault()
    setEmailError('')
    if (!isValidEmail(email)) {
      setEmailError('Introduce un email válido.')
      return
    }
    const key      = `waitlist_${waitlistKey}`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    if (!existing.includes(email.trim())) {
      localStorage.setItem(key, JSON.stringify([...existing, email.trim()]))
    }
    setSubmitted(true)
  }

  return (
    <div ref={containerRef}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 gap-5">
      <title>{title} | H3nky</title>

      <div data-cs-icon
        style={prefersReducedMotion ? {} : { opacity: 0, transform: 'scale(0.7)' }}
        className="text-6xl">{icon}</div>

      <div data-cs-heading
        style={prefersReducedMotion ? {} : { opacity: 0, transform: 'translateY(14px)' }}
        className="flex flex-col gap-2 items-center">
        <h1 className="text-3xl font-extrabold text-[var(--text)]">{title}</h1>
        <span className="font-mono text-xs px-3 py-1 rounded-full bg-[var(--border)] text-[var(--text-faint)]">
          En desarrollo
        </span>
      </div>

      <p data-cs-body
        style={prefersReducedMotion ? {} : { opacity: 0, transform: 'translateY(10px)' }}
        className="text-sm text-[var(--text-muted)] max-w-sm">
        Esta sección está en construcción. Las cosas buenas tardan un poco.
      </p>

      {waitlistKey && (
        <div data-cs-form
          style={prefersReducedMotion ? {} : { opacity: 0, transform: 'translateY(10px)' }}
          className="w-full max-w-sm">
          {submitted ? (
            <p role="status" className="text-sm font-medium text-emerald-500">
              ✅ Te avisamos cuando esté listo.
            </p>
          ) : (
            <form onSubmit={handleNotify} noValidate className="flex flex-col gap-2">
              <div className="flex gap-2">
                <label
                  htmlFor={`waitlist-${waitlistKey}`}
                  className="sr-only"
                >
                  Email para recibir novedades de {title}
                </label>
                <input
                  id={`waitlist-${waitlistKey}`}
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? `waitlist-error-${waitlistKey}` : undefined}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border)]
                    bg-[var(--bg)] text-[var(--text)] outline-none
                    focus:ring-2 focus:ring-[var(--accent)]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--accent)]
                    text-white hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
                >
                  Notificarme
                </button>
              </div>
              {emailError && (
                <p
                  id={`waitlist-error-${waitlistKey}`}
                  role="alert"
                  className="text-xs text-red-500 text-left"
                >
                  {emailError}
                </p>
              )}
            </form>
          )}
        </div>
      )}

      <div data-cs-back style={prefersReducedMotion ? {} : { opacity: 0 }}>
        <Link to="/"
          className="text-sm text-[var(--text-faint)] hover:text-[var(--text)]
            underline underline-offset-4 transition-colors">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Update `src/App.jsx` to pass `waitlistKey` to ComingSoonPage**

Find the two ComingSoonPage route lines:

```jsx
<Route path="/courses" element={<ComingSoonPage title="Cursos" icon="📚" />} />
<Route path="/store"   element={<ComingSoonPage title="Tienda" icon="🛒" />} />
```

Replace with:

```jsx
<Route path="/courses" element={<ComingSoonPage title="Cursos" icon="📚" waitlistKey="cursos" />} />
<Route path="/store"   element={<ComingSoonPage title="Tienda" icon="🛒" waitlistKey="tienda" />} />
```

- [ ] **Step 5: Run tests**

```bash
npm run test -- ComingSoonPage.test.jsx
```

Expected: 5 passed.

- [ ] **Step 6: Commit**

```bash
git add src/components/ComingSoonPage.jsx src/components/ComingSoonPage.test.jsx src/App.jsx
git commit -m "feat(coming-soon): add lead-capture email form with localStorage"
```

---

## Task 5: Página /lab — Experimentos

**Files:**
- Create: `src/data/experiments.js`
- Create: `src/pages/Lab.jsx`
- Create: `src/pages/Lab.test.jsx`
- Modify: `src/App.jsx` (add `/lab` route — already has Contact route from Task 3; add Lab too)
- Modify: `src/components/Layout.jsx` (add Lab to nav)

Context: `/lab` is a static grid of experiment cards similar to `ProjectsHome` but simpler. Data lives in a separate `experiments.js` file. The nav currently has: Inicio, Documentación, Apps, Cursos, Tienda, Contacto. We add "Lab" between Apps and Cursos. The footer's middle column ("Proyectos") can also link to Lab.

- [ ] **Step 1: Write the failing test**

```jsx
// src/pages/Lab.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Lab from './Lab'

describe('Lab', () => {
  it('renders the Lab heading', () => {
    render(<MemoryRouter><Lab /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /lab/i, level: 1 })).toBeInTheDocument()
  })

  it('renders at least one experiment card', () => {
    render(<MemoryRouter><Lab /></MemoryRouter>)
    // experiments.js has at least 4 entries — check one known title
    expect(screen.getByRole('heading', { name: /mascotas/i })).toBeInTheDocument()
  })

  it('renders status badges for experiments', () => {
    render(<MemoryRouter><Lab /></MemoryRouter>)
    expect(screen.getAllByText('Activo').length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- Lab.test.jsx
```

Expected: FAIL — `Lab` module not found.

- [ ] **Step 3: Create `src/data/experiments.js`**

```js
// src/data/experiments.js
export const experiments = [
  {
    slug:        'mascotas',
    title:       'App Mascotas',
    description: 'Gestión de mascotas con perfiles, alimentación, salud y rutinas adaptadas por especie. Datos vinculados vía metadata.pet_id en JSONB.',
    icon:        '🐾',
    status:      'active',
    tags:        ['React', 'Supabase', 'JSONB', 'RLS'],
    date:        '2026-04',
  },
  {
    slug:        'ai-recipes',
    title:       'Recetas con IA',
    description: 'Generación de recetas personalizadas a partir de ingredientes disponibles. Claude AI via Edge Function — la API key nunca toca el cliente.',
    icon:        '🍳',
    status:      'active',
    tags:        ['Claude AI', 'Supabase Edge Functions', 'React'],
    date:        '2026-03',
  },
  {
    slug:        'gsap-animations',
    title:       'Animaciones GSAP',
    description: 'Transiciones de página, parallax con ScrollTrigger y animaciones de entrada en todo el portfolio. Respeta prefers-reduced-motion.',
    icon:        '✨',
    status:      'active',
    tags:        ['GSAP', 'ScrollTrigger', 'React', 'a11y'],
    date:        '2026-02',
  },
  {
    slug:        'portfolio-v1',
    title:       'Este Portfolio',
    description: 'Construido sin ser "desarrollador profesional". React + Vite + Tailwind v4 + Supabase + Claude Code como copiloto de desarrollo.',
    icon:        '🛠️',
    status:      'active',
    tags:        ['Vite', 'Tailwind v4', 'Vercel', 'Claude Code'],
    date:        '2026-01',
  },
  {
    slug:        'finanzas',
    title:       'App Finanzas',
    description: 'Seguimiento de gastos e ingresos con categorías personalizables. En construcción — módulo siguiente tras Mascotas.',
    icon:        '💰',
    status:      'wip',
    tags:        ['React', 'Supabase', 'Charts'],
    date:        '2026-05',
  },
]
```

- [ ] **Step 4: Create `src/pages/Lab.jsx`**

```jsx
// src/pages/Lab.jsx
import { experiments } from '../data/experiments'

const statusConfig = {
  active: {
    label: 'Activo',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30',
  },
  wip: {
    label: 'En progreso',
    color: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30',
  },
  paused: {
    label: 'Pausado',
    color: 'text-zinc-500 bg-zinc-100 border-zinc-200 dark:text-zinc-400 dark:bg-zinc-700/40 dark:border-zinc-600/30',
  },
}

export default function Lab() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-16">
      <title>Lab | H3nky</title>

      <div className="max-w-2xl mb-12">
        <p className="font-mono text-xs tracking-widest uppercase mb-3 text-[var(--text-faint)]">
          Experimentos
        </p>
        <h1 className="text-4xl font-extrabold text-[var(--text)] mb-4">Lab</h1>
        <p className="text-[var(--text-muted)] leading-relaxed">
          Prototipo, experimenta, descarta. Lo que sobrevive se convierte en una app o en documentación.
          Esto es el proceso sin filtrar.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {experiments.map(exp => {
          const { label, color } = statusConfig[exp.status] ?? statusConfig.paused
          return (
            <article
              key={exp.slug}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]
                p-6 flex flex-col gap-4
                hover:border-[var(--accent)] hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-3xl" aria-hidden="true">{exp.icon}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${color}`}>
                  {label}
                </span>
              </div>

              <div>
                <h2 className="font-bold text-[var(--text)] mb-1">{exp.title}</h2>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{exp.description}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                {exp.tags.map(tag => (
                  <span key={tag}
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full
                      border border-[var(--border)] text-[var(--text-faint)]">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-xs text-[var(--text-faint)]">{exp.date}</p>
            </article>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm run test -- Lab.test.jsx
```

Expected: 3 passed.

- [ ] **Step 6: Add `/lab` route to `src/App.jsx`**

Add lazy import (near the other lazy imports):

```js
const Lab = React.lazy(() => import('./pages/Lab'))
```

Add route (in the public routes block, e.g. after `/contact`):

```jsx
<Route path="/lab" element={<Lab />} />
```

- [ ] **Step 7: Add Lab to nav in `src/components/Layout.jsx`**

In the desktop nav, after `<NavLink to="/apps">Apps</NavLink>`, add:

```jsx
            <NavLink to="/lab" className={navLinkClass}>Lab</NavLink>
```

In the mobile dropdown, after `<NavLink to="/apps">Apps</NavLink>`, add:

```jsx
            <NavLink to="/lab" className={navLinkClass}>Lab</NavLink>
```

- [ ] **Step 8: Run full test suite**

```bash
npm run test
```

Expected: all tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/data/experiments.js src/pages/Lab.jsx src/pages/Lab.test.jsx \
  src/App.jsx src/components/Layout.jsx
git commit -m "feat: add /lab experiments page with static experiment cards"
```

---

## Task 6: Analítica — Vercel Analytics

**Files:**
- Modify: `src/App.jsx` (add `<Analytics />` component)

Context: `@vercel/analytics/react` exports an `<Analytics />` React component that injects the Vercel Analytics script automatically. No configuration needed — it auto-detects the Vercel environment. In development it's a no-op. No tests needed.

- [ ] **Step 1: Install the package**

```bash
npm install @vercel/analytics
```

Expected output includes: `added 1 package`.

- [ ] **Step 2: Add `<Analytics />` to `src/App.jsx`**

Add the import at the top of `src/App.jsx`:

```js
import { Analytics } from '@vercel/analytics/react'
```

Find the main JSX return in `App.jsx`. It should wrap everything in `<AnimatePresence>` or similar. Add `<Analytics />` as the last child inside the outermost fragment/div:

```jsx
    <>
      {/* ... existing routes ... */}
      <Analytics />
    </>
```

The exact location: find the closing `</>` or `</div>` of the root return and add `<Analytics />` just before it.

- [ ] **Step 3: Run full test suite to confirm no regressions**

```bash
npm run test
```

Expected: all tests pass (Analytics is a no-op in jsdom).

- [ ] **Step 4: Verify build compiles**

```bash
npm run build
```

Expected: `✓ built in Xs` with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx package.json package-lock.json
git commit -m "feat: add Vercel Analytics"
```

---

## Self-Review

**Spec coverage check:**

| Requirement from doc | Task |
|---|---|
| CTAs más descriptivos | Task 1 ✅ |
| Sección de métricas cuantitativas | Task 1 ✅ |
| Lab card en landing | Task 1 ✅ |
| Demo/GitHub links en tarjetas de proyecto | Task 2 ✅ |
| Formulario de contacto accesible con `<label>` | Task 3 ✅ |
| Contacto en nav y footer | Task 3 ✅ |
| Lead capture ("Notificarme") en Cursos/Tienda | Task 4 ✅ |
| Sección /lab con experimentos | Task 5 ✅ |
| Lab en navegación | Task 5 ✅ |
| Analítica | Task 6 ✅ |

**Placeholder scan:** No TBDs, all steps have complete code blocks.

**Type consistency:** No shared types across tasks — each task is self-contained.
