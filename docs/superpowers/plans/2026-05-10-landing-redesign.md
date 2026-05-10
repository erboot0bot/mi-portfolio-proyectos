# H3nky Landing Page Redesign v2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar `LandingPage.jsx` por un diseño hi-fi con hero a pantalla completa + stats + pillars + type showcase + auth section, actualizando el nav de `Layout.jsx` para usar imagen de logo.

**Architecture:** La landing es un componente page-level que renderiza 5 secciones funcionales autónomas. El nav de Layout.jsx recibe el logo como `<img>`. Todo usa los CSS tokens ya definidos en `src/index.css`. Animaciones con `useGSAP` + `ScrollTrigger` siguiendo los patrones existentes en el repo.

**Tech Stack:** React 18, GSAP 3 + @gsap/react, React Router (NavLink), Tailwind v4, CSS Custom Properties

---

## Contexto de diseño

**Fuente de verdad visual:** `/tmp/h3nky_design/design_handoff_portfolio_redesign/design/index.html`

**Logo asset:** `/tmp/h3nky_design/design_handoff_portfolio_redesign/assets/logo-horizontal-transparent.png` → debe ir a `public/logo-horizontal.png`

**Tokens ya en `src/index.css`:** `--brand-orange: #fe7000`, `--brand-green: #21eb3f`, `--brand-purple: #9a4efb`, `--bg-card`, `--border`, `--shadow-card`, etc. No añadir tokens nuevos salvo que sea estrictamente necesario.

**Hero gradient (hardcoded):** `linear-gradient(110deg, #ea580c 0%, #7c2d12 28%, #4c1d95 52%, #0a0a0f 78%)`

**Rutas intocables:** `/apps/*`, `/demo/*`, `src/pages/Login.jsx`, `src/pages/app/*`

---

## File Map

| Archivo | Cambio |
|---|---|
| `public/logo-horizontal.png` | Crear — copiar desde ZIP |
| `src/index.css` | Modificar — `--nav-height: 60px` |
| `src/components/Layout.jsx` | Modificar — logo img, nav height, glow púrpura, footer simplificado |
| `src/pages/LandingPage.jsx` | Reemplazar — 5 secciones nuevas |
| `src/pages/LandingPage.test.jsx` | Modificar — actualizar assertions a nuevo markup |

---

## Task 1: Logo asset + actualizar `--nav-height`

**Files:**
- Create: `public/logo-horizontal.png`
- Modify: `src/index.css:13` (línea con `--nav-height`)

- [ ] **Step 1: Copiar el logo al directorio público**

```bash
cp "/tmp/h3nky_design/design_handoff_portfolio_redesign/assets/logo-horizontal-transparent.png" \
   /home/user/mi-portfolio-proyectos/public/logo-horizontal.png
```

Verificar:
```bash
ls -lh /home/user/mi-portfolio-proyectos/public/logo-horizontal.png
```
Esperado: archivo visible, ~30–200 KB.

- [ ] **Step 2: Actualizar `--nav-height` de 56px a 60px en `src/index.css`**

Buscar la línea que contiene `--nav-height: 56px;` y cambiarla a:
```css
  --nav-height: 60px;
```

Verificar:
```bash
grep "nav-height" /home/user/mi-portfolio-proyectos/src/index.css
```
Esperado: `--nav-height: 60px;`

- [ ] **Step 3: Commit**

```bash
cd /home/user/mi-portfolio-proyectos
git add public/logo-horizontal.png src/index.css
git commit -m "feat(landing): logo asset + nav-height 60px"
```

---

## Task 2: Actualizar `src/components/Layout.jsx`

**Files:**
- Modify: `src/components/Layout.jsx`

### Qué cambia

1. **Logo en header**: reemplazar el `<Link>` con `<span>` de texto Orbitron por `<Link>` con `<img src="/logo-horizontal.png">` (height 40px).
2. **Altura del nav inner div**: `h-16` (64px) → `h-[60px]`.
3. **Glow púrpura en header**: añadir `boxShadow: 'inset -160px 0 100px -80px rgba(154,78,251,0.2)'` al `<header>` como estilo base permanente.
4. **GSAP scroll effect**: mantener el efecto de sombra inferior, pero combinándolo con el glow permanente.
5. **Footer**: simplificar de 3 columnas a un footer de 1 línea que coincide con el diseño.
6. **Footer logo**: usar `<img>` del logo en lugar del span de texto.

- [ ] **Step 1: Leer el archivo actual para confirmar líneas exactas**

```bash
sed -n '125,145p' /home/user/mi-portfolio-proyectos/src/components/Layout.jsx
```

- [ ] **Step 2: Actualizar el logo del header (Link → img)**

Localizar este bloque (alrededor de línea 129–136):
```jsx
<Link
  to="/"
  className="hover:opacity-80 transition-opacity"
  aria-label="H3nky — inicio"
>
  <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: '1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text)' }}>
    H<span style={{ color: '#21eb3f' }}>3</span>NKY
  </span>
</Link>
```

Reemplazar por:
```jsx
<Link to="/" aria-label="H3nky" className="flex items-center" style={{ height: '40px' }}>
  <img
    src="/logo-horizontal.png"
    alt="H3nky"
    style={{ height: '40px', width: 'auto', display: 'block' }}
  />
</Link>
```

- [ ] **Step 3: Cambiar altura del nav inner div**

Localizar (alrededor de línea 128):
```jsx
<div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
```

Cambiar `h-16` por `h-[60px]`:
```jsx
<div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 h-[60px] flex items-center justify-between">
```

- [ ] **Step 4: Añadir glow púrpura permanente al `<header>` y actualizar GSAP scroll effect**

Localizar el `<header ref={headerRef} ...>` (alrededor de línea 127). Añadir el style del glow:
```jsx
<header
  ref={headerRef}
  className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-md"
  style={{ boxShadow: 'inset -160px 0 100px -80px rgba(154,78,251,0.2)' }}
>
```

Luego localizar el bloque `useGSAP` (alrededor de líneas 79–99) que anima el `boxShadow` en scroll. Actualizar los valores para que combinen el glow púrpura con la sombra inferior:

```jsx
useGSAP(() => {
  const header = headerRef.current
  if (!header) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  ScrollTrigger.create({
    start: 'top top-=64',
    onEnter: () => gsap.to(header, {
      boxShadow: 'inset -160px 0 100px -80px rgba(154,78,251,0.2), 0 4px 24px rgba(0,0,0,0.18)',
      duration: 0.3,
      ease: 'power2.out',
      overwrite: true,
    }),
    onLeaveBack: () => gsap.to(header, {
      boxShadow: 'inset -160px 0 100px -80px rgba(154,78,251,0.2)',
      duration: 0.3,
      ease: 'power2.out',
      overwrite: true,
    }),
  })
}, { scope: headerRef })
```

- [ ] **Step 5: Actualizar footer logo con imagen**

Localizar el bloque del footer brand (alrededor de línea 250–257) que actualmente tiene el span Orbitron "H3NKY.". Reemplazarlo con:
```jsx
<div className="mb-2">
  <img src="/logo-horizontal.png" alt="H3nky" style={{ height: '28px', width: 'auto', display: 'block' }} />
</div>
```

- [ ] **Step 6: Simplificar el footer**

El footer actual tiene 3 columnas complejas. Simplificarlo para que coincida con el diseño (1 línea, 2 columnas):

Localizar el `<footer ...>` (alrededor de línea 245) y reemplazar TODO el contenido del footer (el bloque entero incluyendo el `.grid` de 3 columnas y el div de copyright final) por:

```jsx
{!isAppRoute && (
  <footer className="border-t" style={{ borderColor: 'var(--border)', padding: '40px var(--page-px)' }}>
    <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)' }}>
        © {new Date().getFullYear()} <span style={{ color: 'var(--accent)' }}>H3nky</span> · Construido con IA · Open source
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)' }}>
        <a href="https://github.com/H3nky" target="_blank" rel="noreferrer"
          className="hover:text-[var(--accent)] transition-colors">GitHub</a>
      </div>
    </div>
  </footer>
)}
```

- [ ] **Step 7: Build para verificar que no hay errores**

```bash
cd /home/user/mi-portfolio-proyectos && npm run build 2>&1 | tail -10
```
Esperado: build limpio sin errores.

- [ ] **Step 8: Commit**

```bash
cd /home/user/mi-portfolio-proyectos
git add src/components/Layout.jsx
git commit -m "feat(landing): Layout — logo img, nav 60px, purple glow, simple footer"
```

---

## Task 3: Reescribir `src/pages/LandingPage.jsx`

**Files:**
- Modify: `src/pages/LandingPage.jsx` (reescritura completa)

### Estructura de secciones

```
LandingPage
├── HeroSection          — gradient bg, logo image, kicker, tagline, 2 CTAs
├── StatsSection         — 4 stat cards overlapping hero con mt-[-68px]
├── PillarsSection       — kicker + título + 3 pillar cards
├── TypeShowcaseSection  — 4 rows de especímenes tipográficos
└── AuthSection          — split layout: copy izq + login card der
```

- [ ] **Step 1: Reemplazar el archivo completo**

El nuevo `src/pages/LandingPage.jsx` es:

```jsx
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ── Hero ─────────────────────────────────────────────────────────────────
function HeroSection() {
  const containerRef = useRef(null)

  useGSAP(() => {
    if (prefersReducedMotion) return
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
    tl.fromTo('[data-hero-lockup]',  { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.8 })
      .fromTo('[data-hero-kicker]',  { opacity: 0, y: 12 },       { opacity: 1, y: 0, duration: 0.5 }, '-=0.5')
      .fromTo('[data-hero-tagline]', { opacity: 0, y: 16 },       { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('[data-hero-ctas] > *',{ opacity: 0, y: 12 },       { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }, '-=0.35')
  }, { scope: containerRef })

  const hidden = prefersReducedMotion ? {} : { opacity: 0 }

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden"
      style={{
        padding: 'clamp(60px, 8vw, 100px) var(--page-px) 140px',
        background: 'linear-gradient(110deg, #ea580c 0%, #7c2d12 28%, #4c1d95 52%, #0a0a0f 78%)',
      }}
    >
      {/* Bottom fade into page bg */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '140px', background: 'linear-gradient(to bottom, transparent, var(--bg))' }}
      />

      <div
        className="relative flex flex-col items-center text-center"
        style={{ zIndex: 2, maxWidth: 'var(--max-width)', margin: '0 auto' }}
      >
        {/* Kicker */}
        <p
          data-hero-kicker
          style={{
            ...hidden,
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '36px',
          }}
        >
          <span style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
          H3NKY · DEV · 2026
          <span style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
        </p>

        {/* Logo lockup */}
        <div
          data-hero-lockup
          style={{ ...hidden, width: '100%', maxWidth: '760px', margin: '0 auto' }}
        >
          <img
            src="/logo-horizontal.png"
            alt="H3nky"
            style={{ width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(0 12px 50px rgba(0,0,0,0.45))' }}
          />
        </div>

        {/* Tagline */}
        <p
          data-hero-tagline
          style={{
            ...hidden,
            fontFamily: 'var(--font-body)',
            fontSize: '19px',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.82)',
            maxWidth: '580px',
            lineHeight: 1.6,
            margin: '40px 0 44px',
          }}
        >
          Construyo aplicaciones reales con IA y documento exactamente cómo lo hago.
        </p>

        {/* CTAs */}
        <div data-hero-ctas className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/apps"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 28px', borderRadius: 'var(--radius-md)',
              background: 'var(--accent)', color: '#fff',
              fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
              textDecoration: 'none', border: '1px solid transparent',
              boxShadow: 'var(--shadow-cta)', transition: 'all var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = '' }}
          >
            Ver mis apps →
          </Link>
          <Link
            to="/projects"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 28px', borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.06)', color: '#fff',
              fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600,
              textDecoration: 'none', border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)', transition: 'all var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
          >
            Ver el portfolio →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── Stats ─────────────────────────────────────────────────────────────────
const STATS = [
  { num: '4',  suffix: '+', label: 'Apps en producción',     color: 'var(--accent)' },
  { num: '100%',             label: 'Código asistido por IA', color: 'var(--brand-green)' },
  { num: '1',                label: 'Desarrollador solo',     color: 'var(--text)' },
  { num: 'Open',             label: 'Código fuente público',  color: 'var(--brand-purple)', small: true },
]

function StatsSection() {
  const containerRef = useRef(null)

  useGSAP(() => {
    if (prefersReducedMotion) return
    gsap.fromTo('[data-stat-card]',
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 90%', once: true },
      }
    )
  }, { scope: containerRef })

  return (
    <section
      ref={containerRef}
      style={{
        maxWidth: 'var(--max-width)', margin: '-68px auto 0',
        padding: '0 var(--page-px)', position: 'relative', zIndex: 10,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
        }}
        className="sm:grid-cols-4 grid-cols-2"
      >
        {STATS.map(({ num, suffix, label, color, small }) => (
          <div
            key={label}
            data-stat-card
            style={prefersReducedMotion ? {} : { opacity: 0 }}
            className="text-center"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px 24px',
              boxShadow: 'var(--shadow-card)',
              transition: 'all var(--transition)',
              textAlign: 'center',
              ...(prefersReducedMotion ? {} : { opacity: 0 }),
            }}
          >
            <div style={{
              fontFamily: 'var(--font-tech)',
              fontSize: small ? '44px' : '56px',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color,
            }}>
              {num}{suffix && <span style={{ color: 'var(--accent)' }}>{suffix}</span>}
            </div>
            <div style={{
              fontFamily: 'var(--font-tech)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
              marginTop: '14px',
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Pillars ───────────────────────────────────────────────────────────────
const PILLARS = [
  {
    num: '01 / Apps',
    title: 'My Apps',
    desc: 'Aplicaciones reales en producción. Hogar, herramientas internas, prototipos funcionando.',
    accent: 'var(--brand-orange)',
    iconBg: 'rgba(254,112,0,0.12)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    href: '/apps',
  },
  {
    num: '02 / Docs',
    title: 'Documentación',
    desc: 'Guías paso a paso, decisiones técnicas, errores. Todo público para que otros aprendan.',
    accent: 'var(--brand-green)',
    iconBg: 'rgba(33,235,63,0.12)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    href: '/projects',
  },
  {
    num: '03 / Lab',
    title: 'Lab',
    desc: 'Experimentos, ideas en construcción y exploración técnica sin filtrar.',
    accent: 'var(--brand-purple)',
    iconBg: 'rgba(154,78,251,0.12)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2v6l-4 8a4 4 0 0 0 4 6h6a4 4 0 0 0 4-6l-4-8V2" />
        <path d="M9 2h6" />
      </svg>
    ),
    href: '/lab',
  },
]

function PillarsSection() {
  const containerRef = useRef(null)

  useGSAP(() => {
    if (prefersReducedMotion) return
    gsap.fromTo('[data-pillar-card]',
      { y: 32, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 85%', once: true },
      }
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '112px var(--page-px)' }}>
      <div style={{ marginBottom: '56px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', color: 'var(--accent)', marginBottom: '12px', textTransform: 'uppercase' }}>
          // Plataforma
        </div>
        <h2 style={{ fontFamily: 'var(--font-hero)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 14px', color: 'var(--text)' }}>
          Qué hay aquí
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '17px', fontWeight: 300, color: 'var(--text-muted)', maxWidth: '540px', lineHeight: 1.6, margin: 0 }}>
          Una plataforma en constante construcción.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }} className="lg:grid-cols-3 grid-cols-1">
        {PILLARS.map(({ num, title, desc, accent, iconBg, icon, href }, i) => (
          <Link
            key={num}
            to={href}
            data-pillar-card
            style={{
              ...(prefersReducedMotion ? {} : { opacity: 0 }),
              display: 'block',
              background: 'var(--bg-card)',
              border: `1px solid var(--border)`,
              borderTop: `3px solid ${accent}`,
              borderRadius: 'var(--radius-lg)',
              padding: '36px 32px',
              boxShadow: 'var(--shadow-card)',
              transition: 'all var(--transition)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-card)' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
              {icon}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', color: accent, marginBottom: '10px' }}>
              {num}
            </div>
            <h3 style={{ fontFamily: 'var(--font-hero)', fontSize: '19px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 12px', color: 'var(--text)' }}>
              {title}
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
              {desc}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ── Type Showcase ─────────────────────────────────────────────────────────
function TypeShowcaseSection() {
  const rows = [
    {
      tag: 'Orbitron',
      sub: 'Hero · Logo · Titles — weight 900',
      specimen: (
        <div style={{ fontFamily: 'var(--font-hero)', fontSize: '56px', fontWeight: 900, letterSpacing: '0.04em', lineHeight: 1, color: 'var(--text)' }}>
          H<span style={{ background: 'linear-gradient(90deg,var(--brand-orange) 0% 50%,var(--brand-green) 50% 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent', padding: '0 2px' }}>3</span>NKY
        </div>
      ),
    },
    {
      tag: 'Exo 2',
      sub: 'Tech docs · Stats · Kickers — weight 700–800',
      specimen: (
        <div style={{ fontFamily: 'var(--font-tech)', fontSize: '28px', fontWeight: 700, color: 'var(--text)' }}>
          Aplicaciones reales con IA
        </div>
      ),
    },
    {
      tag: 'Sora',
      sub: 'Body · Nav · UI — weight 300–600',
      specimen: (
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 400, color: 'var(--text)', lineHeight: 1.6 }}>
          Construyo aplicaciones reales con IA y documento exactamente cómo lo hago. Cada decisión técnica, cada error, cada flujo — todo público.
        </div>
      ),
    },
    {
      tag: 'JetBrains Mono',
      sub: 'Code · Tokens · Numerics — weight 400–600',
      specimen: (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 400, color: 'var(--accent)' }}>
          {'const accent = "#fe7000"; // sampled from logo'}
        </div>
      ),
    },
  ]

  return (
    <section style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: '0 var(--page-px) 112px' }}>
      <div style={{ marginBottom: '56px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.16em', color: 'var(--accent)', marginBottom: '12px', textTransform: 'uppercase' }}>
          // Type System
        </div>
        <h2 style={{ fontFamily: 'var(--font-hero)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 14px', color: 'var(--text)' }}>
          Tipografía
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '17px', fontWeight: 300, color: 'var(--text-muted)', maxWidth: '540px', lineHeight: 1.6, margin: 0 }}>
          Cuatro familias, cada una con un papel claro.
        </p>
      </div>

      {rows.map(({ tag, sub, specimen }, i) => (
        <div
          key={tag}
          style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            gap: '32px',
            padding: '24px 0',
            borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
            alignItems: 'center',
          }}
          className="sm:grid-cols-[200px_1fr] grid-cols-1"
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)', letterSpacing: '0.06em', paddingTop: '8px' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 600, display: 'block', marginBottom: '4px', fontSize: '12px' }}>{tag}</span>
            {sub}
          </div>
          {specimen}
        </div>
      ))}
    </section>
  )
}

// ── Auth Section ──────────────────────────────────────────────────────────
function AuthSection() {
  return (
    <div style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '96px var(--page-px)' }}>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 460px', gap: '64px', alignItems: 'center' }}
          className="lg:grid-cols-[1fr_460px] grid-cols-1"
        >
          {/* Copy */}
          <div>
            <div style={{ fontFamily: 'var(--font-tech)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '14px' }}>
              // Acceso
            </div>
            <h2 style={{ fontFamily: 'var(--font-hero)', fontSize: 'clamp(28px, 3.4vw, 40px)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', margin: '0 0 16px', color: 'var(--text)' }}>
              Entra a tus apps
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1.65, margin: '0 0 24px' }}>
              El acceso a las aplicaciones de H3nky es privado. Cada módulo usa el mismo login con Google.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-faint)', lineHeight: 1.55, margin: 0 }}>
              Solo se usa para autenticación. No compartimos tus datos con nadie.
            </p>
          </div>

          {/* Login card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px 28px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Mini logo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
              <img src="/logo-horizontal.png" alt="H3nky" style={{ height: '52px', width: 'auto', display: 'block' }} />
              <div style={{ fontFamily: 'var(--font-tech)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
                Creo · Aprendo · Comparto
              </div>
            </div>

            {/* Hogar module badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(254,112,0,0.06)', border: '1px solid rgba(254,112,0,0.18)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(254,112,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-hero)', fontSize: '13px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text)' }}>Hogar</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Calendario, lista de la compra y recetas con IA</div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--border)' }} />

            {/* Google button — links to /login */}
            <Link
              to="/login"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '14px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, textDecoration: 'none', transition: 'all var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </Link>

            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-faint)', textAlign: 'center', lineHeight: 1.55, margin: 0 }}>
              Solo se usa para autenticación.<br />No compartimos tus datos.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div>
      <title>H3nky | Portfolio</title>
      <HeroSection />
      <StatsSection />
      <PillarsSection />
      <TypeShowcaseSection />
      <AuthSection />
    </div>
  )
}
```

- [ ] **Step 2: Verificar que el archivo fue escrito correctamente**

```bash
wc -l /home/user/mi-portfolio-proyectos/src/pages/LandingPage.jsx
grep -n "HeroSection\|StatsSection\|PillarsSection\|TypeShowcase\|AuthSection" /home/user/mi-portfolio-proyectos/src/pages/LandingPage.jsx
```

Esperado: ~330+ líneas, todas las funciones presentes.

- [ ] **Step 3: Build de verificación**

```bash
cd /home/user/mi-portfolio-proyectos && npm run build 2>&1 | tail -12
```

Esperado: build limpio sin errores TypeScript/JSX.

- [ ] **Step 4: Commit**

```bash
cd /home/user/mi-portfolio-proyectos
git add src/pages/LandingPage.jsx
git commit -m "feat(landing): rewrite LandingPage — hero, stats, pillars, type showcase, auth section"
```

---

## Task 4: Actualizar `src/pages/LandingPage.test.jsx`

**Files:**
- Modify: `src/pages/LandingPage.test.jsx`

### Qué tests cambian

El nuevo diseño no tiene `<h1>` en el hero (es una imagen). Los tests deben actualizarse:
- `renders the hero h1` → cambiar a verificar que el kicker text o el logo image están presentes
- `renders the Lab section card` → ahora es una pillar card con texto "Lab" en un `<h3>`
- `renders primary CTA linking to /apps` → "Ver mis apps →" sigue siendo un `<Link to="/apps">`, test debe pasar
- `renders the stats section with metric values` → `4+` ya no es texto plano — el "+" está en un `<span>` separado; verificar "100%" en su lugar (es texto puro)

- [ ] **Step 1: Leer los tests actuales para confirmar**

```bash
cat /home/user/mi-portfolio-proyectos/src/pages/LandingPage.test.jsx
```

- [ ] **Step 2: Correr tests para ver qué falla**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run src/pages/LandingPage.test.jsx 2>&1
```

- [ ] **Step 3: Reemplazar el archivo de tests**

```jsx
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
  it('renders the hero section with kicker text', () => {
    renderLanding()
    expect(screen.getByText(/H3NKY · DEV · 2026/i)).toBeInTheDocument()
  })

  it('renders the hero logo image', () => {
    renderLanding()
    const logo = screen.getByRole('img', { name: /h3nky/i })
    expect(logo).toBeInTheDocument()
  })

  it('renders the stats section with metric values', () => {
    renderLanding()
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('Apps en producción')).toBeInTheDocument()
  })

  it('renders the pillars section with Lab pillar', () => {
    renderLanding()
    expect(screen.getByRole('heading', { name: /lab/i })).toBeInTheDocument()
  })

  it('renders primary CTA linking to /apps', () => {
    renderLanding()
    const appsLink = screen.getByRole('link', { name: /ver mis apps/i })
    expect(appsLink).toHaveAttribute('href', '/apps')
  })

  it('renders the auth section with Google login link', () => {
    renderLanding()
    const loginLink = screen.getByRole('link', { name: /continuar con google/i })
    expect(loginLink).toHaveAttribute('href', '/login')
  })
})
```

- [ ] **Step 4: Correr tests para confirmar que pasan**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run src/pages/LandingPage.test.jsx 2>&1
```

Esperado: 6 tests pasando.

- [ ] **Step 5: Correr todos los tests**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run 2>&1 | tail -15
```

Esperado: Los 3 fallos pre-existentes (AuthContext, App) siguen siendo los únicos. Sin nuevas regresiones.

- [ ] **Step 6: Commit**

```bash
cd /home/user/mi-portfolio-proyectos
git add src/pages/LandingPage.test.jsx
git commit -m "test(landing): actualizar tests para nuevo diseño hero + pillars + auth"
```

---

## Self-Review — Spec Coverage

| Sección spec | ¿Cubierta? | Tarea |
|---|---|---|
| Nav: logo imagen height 40px | ✅ | Task 2 Step 2 |
| Nav: height 60px | ✅ | Task 1 Step 2 + Task 2 Step 3 |
| Nav: glow púrpura | ✅ | Task 2 Step 4 |
| Hero: gradient 110deg | ✅ | Task 3 Step 1 (HeroSection) |
| Hero: ::after fade 140px | ✅ | Task 3 Step 1 (div absoluto) |
| Hero: kicker con líneas laterales | ✅ | Task 3 Step 1 |
| Hero: logo image max-width 760px | ✅ | Task 3 Step 1 |
| Hero: tagline 19px weight 300 | ✅ | Task 3 Step 1 |
| Hero: CTA primario + ghost | ✅ | Task 3 Step 1 |
| Stats: 4 cards overlap -68px | ✅ | Task 3 Step 1 (StatsSection) |
| Stats: colores orange/green/white/purple | ✅ | Task 3 Step 1 |
| Pillars: 3 cards con top border colored | ✅ | Task 3 Step 1 (PillarsSection) |
| Pillars: hover translateY(-3px) | ✅ | Task 3 Step 1 |
| Type showcase: 4 filas | ✅ | Task 3 Step 1 (TypeShowcaseSection) |
| Auth section: split layout | ✅ | Task 3 Step 1 (AuthSection) |
| Auth section: Hogar module badge | ✅ | Task 3 Step 1 |
| Auth section: Google button → /login | ✅ | Task 3 Step 1 |
| Footer simplificado | ✅ | Task 2 Step 6 |
| GSAP hero lockup scale 0.96→1 | ✅ | Task 3 Step 1 |
| GSAP stats stagger y:40→0 | ✅ | Task 3 Step 1 |
| GSAP pillars stagger | ✅ | Task 3 Step 1 |
| Responsive: stats 2 cols mobile | ✅ | Task 3 Step 1 (className `grid-cols-2`) |
| Responsive: pillars 1 col mobile | ✅ | Task 3 Step 1 (className `grid-cols-1`) |
| No tocar /apps routes | ✅ | No modificadas |
| No tocar Hogar project | ✅ | AuthSection es solo display, no toca lógica |
| Logo horizontal en footer | ✅ | Task 2 Step 5 |

**Notas:**
- `StatsSection` usa `style` prop para la opacidad inicial + la clase Tailwind `grid-cols-2` para responsive. Hay un conflicto con dos `style` props en el mismo elemento (líneas 194-213 del Step 1 de Task 3). El implementador debe mergearlos en un único objeto de estilo.
- El `<title>` de `LandingPage` es una forma de React para poner el `<title>` del documento (React 19 soporta nativo). Si hay problemas, usar `document.title` en un `useEffect`.
