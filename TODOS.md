# TODOS

## OG Tags + Dynamic Page Titles

**What:** Añadir `<title>` dinámico por ruta y OG meta tags para previews en redes sociales.

**Why:** En una SPA pura, todos los proyectos comparten el `<title>` de index.html. Cuando alguien comparte `/projects/mi-proyecto` en LinkedIn, el preview muestra el título genérico del portfolio. React 19 soporta `<title>` nativo en JSX — gratis y sin deps.

**Pros:** Mejora visible de calidad. Links compartidos muestran el proyecto específico. Lighthouse score mejor.

**Cons:** OG tags completas (con imagen por proyecto) requieren pre-rendering (Vite SSG o proxy). El título dinámico es gratis, las OG images no.

**Context:** Identificado en /plan-eng-review (2026-04-12) vía outside voice. El título dinámico es una línea en ProjectDetail y Home: `<title>{project.title} | Portfolio</title>`. Para OG images, considerar `vite-plugin-ssr` o Vercel Edge Functions en el futuro.

**Depends on:** Nada. Puede implementarse en cualquier momento.

---

## ~~Grid 2-3 columnas~~ ✓ DONE

**What:** Cambiar la cuadrícula de proyectos de 1 columna (móvil) + 2 columnas (sm) a un grid 2-3: 2 columnas desde `sm`, 3 desde `lg`.

**Why:** En pantallas medianas (~768px) las cards quedan muy anchas y sueltas. Con 2 columnas desde `sm` y 3 desde `lg` el layout aprovecha mejor el espacio y se parece más a un portfolio real.

**Context:** Identificado visualmente tras la primera demo. Cambio en `Home.jsx`: `grid-cols-2 lg:grid-cols-3`.

**Depends on:** Nada.

---

## ~~Hero section con intro personal~~ ✓ DONE

**What:** Añadir una sección hero encima del grid con nombre, rol, y 1-2 frases de presentación personal. Puede incluir un avatar o foto.

**Why:** Ahora el portfolio arranca directamente en "Proyectos" sin contexto sobre quién eres. Un visitante que llega por primera vez no sabe nada de ti antes de ver las cards.

**Context:** Petición pendiente. Va encima del `<h1>Proyectos</h1>` en `Home.jsx` o como sección separada en `Layout.jsx`.

**Depends on:** Nada. Puede ir antes o después del grid.

---

## ~~Subtítulo más personal~~ ✓ DONE

**What:** Cambiar el subtítulo actual "Una colección de cosas que he construido." por algo más personal y con más carácter.

**Why:** El subtítulo actual es genérico — podría ser el de cualquier portfolio. Un subtítulo con personalidad da contexto inmediato sobre el autor y engancha más.

**Context:** Petición directa. Cambio de una línea en `Home.jsx`.

**Depends on:** Nada.

---

## ~~Máximo 3 badges por card~~ ✓ DONE

**What:** Limitar los `TechBadge` visibles en `ProjectCard` a los primeros 3, añadiendo un "+N" si hay más.

**Why:** Cards con 6-7 badges se desbordan visualmente y rompen la uniformidad del grid. El límite de 3 mantiene las cards limpias y el "+N" no pierde información.

**Context:** Petición pendiente. Cambio en `ProjectCard.jsx`: `technologies.slice(0, 3)` + badge condicional `+{technologies.length - 3}`.

**Depends on:** Nada.

---

## Dominio propio

**What:** Configurar un dominio personalizado (p.ej. `h3nky.dev`) en Vercel apuntando al portfolio.

**Why:** Un dominio propio es parte de la identidad del portfolio. `h3nky.vercel.app` funciona pero no es memorable ni profesional en un CV.

**Context:** Petición pendiente. Requiere comprar el dominio y añadirlo en Vercel > Settings > Domains. Sin cambios en el código.

**Depends on:** Deploy en Vercel.

---

## ~~Fix espaciado inferior~~ ✓ DONE

**What:** Revisar y corregir el padding/margin inferior de la página (footer muy pegado al contenido, o espacio excesivo entre el grid y el footer).

**Why:** El espaciado inconsistente en la parte baja de la página se nota especialmente cuando hay pocos proyectos y el footer queda flotando.

**Context:** Petición pendiente. Revisar `py-10` en `<main>` de `Layout.jsx` y el `mb-*` del grid en `Home.jsx`.

**Depends on:** Nada.
