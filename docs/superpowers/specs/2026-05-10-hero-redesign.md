# Hero Redesign — Spec
**Date:** 2026-05-10  
**Status:** Approved

## Scope
Rediseño completo de `HeroSection` en `src/pages/LandingPage.jsx`. Las stats se integran en el hero eliminando `StatsSection` como sección flotante separada. El resto de la página (Pillars, AppsShowcase, Auth) no se toca.

## Background
El hero actual usa un gradiente lineal `#ea580c → #7c2d12 → #4c1d95 → #0a0a0f` con el logo horizontal centrado, kicker, tagline y CTAs. Las stats son una sección flotante separada con `margin-top: -68px`. El nuevo diseño unifica todo en una sola sección más impactante.

## Design

### Fondo
- Mesh gradient con 3 blobs radiales:
  - Púrpura: `radial-gradient(ellipse 65% 55% at 18% 50%, rgba(154,78,251,0.28), transparent 60%)`
  - Naranja: `radial-gradient(ellipse 55% 65% at 82% 28%, rgba(254,112,0,0.20), transparent 55%)`
  - Verde: `radial-gradient(ellipse 55% 45% at 62% 82%, rgba(33,235,63,0.10), transparent 50%)`
  - Base: `#06060d` (dark) / `#fffcf9` (light, blobs al 40% de opacidad)
- Grid overlay: `56px × 56px`, líneas `rgba(128,128,128,0.022)`
- Fade-to-bg en el bottom (120px)

### Contenido (top → bottom)
1. **Kicker pill** — `H3NKY · DEV · 2026` en JetBrains Mono 10px, pill con `backdrop-filter: blur(10px)`, líneas decorativas naranja a ambos lados via `::before/::after`
2. **Lockup horizontal** (flex row, centrado):
   - Logo: `logo-horizontal.png` (dark) / `logo-horizontal-light.png` (light), `height: 84px`, con `drop-shadow` naranja+púrpura
   - Grupo de texto (text-align: left):
     - `H3NKY` en Orbitron 900, `clamp(52px, 8vw, 88px)`, gradiente `linear-gradient(90deg, #fe7000 0%, #9a4efb 50%, #21eb3f 100%)` via `background-clip: text`
     - `// DEV` en JetBrains Mono 600, `letter-spacing: 0.5em`, color sutil (`rgba(255,255,255,0.28)` dark / `rgba(0,0,0,0.28)` light)
3. **Tagline** — mismo texto actual, Sora 300, `font-size: 16px`, `max-width: 490px`
4. **CTAs** — mismos destinos, pill `border-radius: 99px`:
   - Primario: `linear-gradient(135deg, #fe7000, #cc5800)` con glow shadow
   - Secundario: glassmorphism dark / borde sutil light
5. **Stats row** (reemplaza StatsSection separada):
   - Flex row centrado con divisores verticales de 1px
   - 4 stats: `4+` naranja, `100%` verde, `27.5K` púrpura, `Open` blanco/dark
   - Números en Orbitron 900 24px, labels en JetBrains Mono 8px uppercase
   - Separado del contenido anterior por `border-top: 1px solid rgba(255,255,255,0.07)`

### Dark / Light
- Dark: blobs a opacidad plena, logo `logo-horizontal.png`, botón secundario glassmorphism
- Light: blobs al ~40% opacidad, logo `logo-horizontal-light.png`, botón secundario con borde `rgba(0,0,0,0.12)`, fade bottom a `#fffcf9`

### Animaciones GSAP (mantener patrón actual)
- `useGSAP` con `scope: containerRef`
- `prefersReducedMotion` guard
- Timeline: lockup scale+opacity → kicker → tagline → ctas → stats (stagger)

## Archivos a modificar
- `src/pages/LandingPage.jsx` — reescribir `HeroSection`, eliminar `StatsSection`, actualizar el export `LandingPage`
- `src/pages/LandingPage.test.jsx` — actualizar snapshots/textos si los hay

## Lo que NO cambia
- `PillarsSection`
- `AppsShowcaseSection`  
- `AuthSection`
- `src/index.css`
- Resto del proyecto
