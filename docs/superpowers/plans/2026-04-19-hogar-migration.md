# Hogar App — Migration Plan (project-based architecture)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the existing Hogar app from a simple user_id-scoped architecture to a full project-based system with sharing, proper `/app/*` routes, drag-and-drop calendar, two-column shopping+menu, and direct Anthropic API recipe generation.

**Architecture:** Users create "projects" (e.g. "Hogar 🏠"). All data (tasks, shopping items, menus, recipes) belongs to a project via `project_id`. Projects can be shared with other users via `project_members`. Routes live under `/app/projects/:slug/*`. The portfolio public routes (/, /projects/:slug) remain unchanged.

**Tech Stack:** Supabase (postgres + RLS + auth), FullCalendar v6 (drag/drop/resize), date-fns, Anthropic API (direct browser call with dangerous-direct-browser-access header), React Router DOM 7 nested routes.

---

## Working directory rule
**ALWAYS edit in `/home/user/mi-portfolio-proyectos/`** — never in `.claude/worktrees/*`.

---

## File Map

### New files
```
supabase/schema.sql                              ← Full schema for documentation
src/lib/anthropic.js                             ← Anthropic API helper
src/pages/app/Projects.jsx                       ← /app/projects — list + create
src/pages/app/ProjectDetail.jsx                  ← /app/projects/:slug — sidebar shell
src/pages/app/modules/Calendar.jsx               ← /app/projects/:slug/calendar
src/pages/app/modules/Shopping.jsx               ← /app/projects/:slug/shopping
src/pages/app/modules/Recipes.jsx                ← /app/projects/:slug/recipes
src/pages/app/modules/RecipeDetail.jsx           ← /app/projects/:slug/recipes/:recipeId
src/contexts/ProjectContext.jsx                  ← current project state (id, slug, name)
```

### Modified files
```
src/App.jsx                   ← Replace /hogar/* with /app/* routes
src/components/Layout.jsx     ← Update "Hogar" nav link to /app/projects
.env.local                    ← Add VITE_ANTHROPIC_API_KEY
```

### Deleted (replaced)
```
src/pages/hogar/HogarLayout.jsx   → replaced by ProjectDetail.jsx
src/pages/hogar/HogarHome.jsx     → replaced by Projects.jsx
src/pages/hogar/Calendario.jsx    → replaced by modules/Calendar.jsx
src/pages/hogar/ListaCompra.jsx   → replaced by modules/Shopping.jsx
src/pages/hogar/Recetas.jsx       → replaced by modules/Recipes.jsx
```

---

## Phase 0 — Database Migration

### Task 1: Drop old tables + create new schema

**Files:**
- Create: `supabase/schema.sql`

- [ ] **Step 1: Drop old tables via Supabase API**

Run this curl command (uses the management token already configured):

```bash
SQL=$(python3 -c "
import json
sql = '''
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS weekly_menus CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS shopping_items CASCADE;
'''
print(json.dumps({'query': sql}))
")
curl -s -X POST "https://api.supabase.com/v1/projects/gobivwkvvtoxuazhefri/database/query" \
  -H "Authorization: Bearer sbp_dc235c092a70b5c71db36b19492a5843e764ae42" \
  -H "Content-Type: application/json" \
  -d "$SQL"
```

Expected: `[]`

- [ ] **Step 2: Create new schema via Supabase API**

```bash
cat > /tmp/new_schema.sql << 'SQLEOF'
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT DEFAULT '🏠',
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner','editor','viewer')),
  invited_email TEXT,
  accepted BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS calendar_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT FALSE,
  color TEXT DEFAULT '#f97316',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT,
  category TEXT DEFAULT 'General',
  checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  meal_type TEXT CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  recipe_id UUID,
  custom_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  ingredients JSONB DEFAULT '[]',
  instructions TEXT,
  tags TEXT[] DEFAULT '{}',
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER DEFAULT 4,
  image_url TEXT,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_owner" ON projects
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "project_member_read" ON projects
  FOR SELECT USING (
    id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

CREATE POLICY "tasks_by_project_member" ON calendar_tasks
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM project_members WHERE user_id = auth.uid() AND accepted = TRUE
    )
  );

CREATE POLICY "shopping_by_member" ON shopping_items
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM project_members WHERE user_id = auth.uid() AND accepted = TRUE
    )
  );

CREATE POLICY "menu_by_member" ON menu_items
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM project_members WHERE user_id = auth.uid() AND accepted = TRUE
    )
  );

CREATE POLICY "recipes_by_member" ON recipes
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM project_members WHERE user_id = auth.uid() AND accepted = TRUE
    )
  );
SQLEOF

SQL=$(python3 -c "import json,sys; print(json.dumps({'query': open('/tmp/new_schema.sql').read()}))")
curl -s -X POST "https://api.supabase.com/v1/projects/gobivwkvvtoxuazhefri/database/query" \
  -H "Authorization: Bearer sbp_dc235c092a70b5c71db36b19492a5843e764ae42" \
  -H "Content-Type: application/json" \
  -d "$SQL"
```

Expected: `[]`

- [ ] **Step 3: Verify tables exist**

```bash
SQL=$(python3 -c "import json; print(json.dumps({'query': \"SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;\"}))")
curl -s -X POST "https://api.supabase.com/v1/projects/gobivwkvvtoxuazhefri/database/query" \
  -H "Authorization: Bearer sbp_dc235c092a70b5c71db36b19492a5843e764ae42" \
  -H "Content-Type: application/json" \
  -d "$SQL"
```

Expected: `[{"tablename":"calendar_tasks"},{"tablename":"menu_items"},{"tablename":"project_members"},{"tablename":"projects"},{"tablename":"recipes"},{"tablename":"shopping_items"}]`

- [ ] **Step 4: Save schema.sql to repo**

Create `/home/user/mi-portfolio-proyectos/supabase/schema.sql` with the full SQL content from Step 2 (copy from /tmp/new_schema.sql).

- [ ] **Step 5: Add VITE_ANTHROPIC_API_KEY to .env.local**

Append to `/home/user/mi-portfolio-proyectos/.env.local`:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

(Leave as placeholder — user will fill in their real key)

- [ ] **Step 6: Commit**

```bash
cd /home/user/mi-portfolio-proyectos && git add supabase/schema.sql .env.local && git commit -m "feat(schema): migrate to project-based architecture"
```

---

## Phase 1 — ProjectContext + Route Restructure

### Task 2: ProjectContext

**Files:**
- Create: `src/contexts/ProjectContext.jsx`

- [ ] **Step 1: Create ProjectContext**

Create `/home/user/mi-portfolio-proyectos/src/contexts/ProjectContext.jsx`:

```jsx
import { createContext, useContext, useState } from 'react'

const ProjectContext = createContext(null)

export function ProjectProvider({ project, children }) {
  return (
    <ProjectContext.Provider value={project}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be inside ProjectProvider')
  return ctx
}
```

- [ ] **Step 2: Commit**

```bash
cd /home/user/mi-portfolio-proyectos && git add src/contexts/ProjectContext.jsx && git commit -m "feat(context): add ProjectContext for current project state"
```

### Task 3: Update App.jsx routes + remove old Hogar pages

**Files:**
- Modify: `src/App.jsx`
- Delete: `src/pages/hogar/` directory contents (replaced by app/ pages)

- [ ] **Step 1: Replace App.jsx**

Replace `/home/user/mi-portfolio-proyectos/src/App.jsx` with:

```jsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import AppProjects from './pages/app/Projects'
import AppProjectDetail from './pages/app/ProjectDetail'
import Calendar from './pages/app/modules/Calendar'
import Shopping from './pages/app/modules/Shopping'
import Recipes from './pages/app/modules/Recipes'
import RecipeDetail from './pages/app/modules/RecipeDetail'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export default function App() {
  const location = useLocation()

  return (
    <Layout>
      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <Routes location={location}>
            {/* Public portfolio routes — unchanged */}
            <Route path="/" element={<Home />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/login" element={<Login />} />

            {/* Protected app routes */}
            <Route
              path="/app/projects"
              element={<ProtectedRoute><AppProjects /></ProtectedRoute>}
            />
            <Route
              path="/app/projects/:slug"
              element={<ProtectedRoute><AppProjectDetail /></ProtectedRoute>}
            >
              <Route path="calendar" element={<Calendar />} />
              <Route path="shopping" element={<Shopping />} />
              <Route path="recipes" element={<Recipes />} />
              <Route path="recipes/:recipeId" element={<RecipeDetail />} />
            </Route>

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}
```

- [ ] **Step 2: Create placeholder app pages (to unblock compilation)**

Create these files so the app compiles before full implementation:

`/home/user/mi-portfolio-proyectos/src/pages/app/Projects.jsx`:
```jsx
export default function AppProjects() {
  return <div className="max-w-[1440px] mx-auto px-6 py-10 text-[var(--text)]">Projects — próximamente</div>
}
```

`/home/user/mi-portfolio-proyectos/src/pages/app/ProjectDetail.jsx`:
```jsx
import { Outlet } from 'react-router-dom'
export default function AppProjectDetail() {
  return <div className="max-w-[1440px] mx-auto px-6 py-10 text-[var(--text)]"><Outlet /></div>
}
```

`/home/user/mi-portfolio-proyectos/src/pages/app/modules/Calendar.jsx`:
```jsx
export default function Calendar() { return <div className="text-[var(--text-muted)]">Calendario — próximamente</div> }
```

`/home/user/mi-portfolio-proyectos/src/pages/app/modules/Shopping.jsx`:
```jsx
export default function Shopping() { return <div className="text-[var(--text-muted)]">Lista & Menú — próximamente</div> }
```

`/home/user/mi-portfolio-proyectos/src/pages/app/modules/Recipes.jsx`:
```jsx
export default function Recipes() { return <div className="text-[var(--text-muted)]">Recetas — próximamente</div> }
```

`/home/user/mi-portfolio-proyectos/src/pages/app/modules/RecipeDetail.jsx`:
```jsx
export default function RecipeDetail() { return <div className="text-[var(--text-muted)]">Receta — próximamente</div> }
```

- [ ] **Step 3: Delete old hogar pages**

```bash
rm -rf /home/user/mi-portfolio-proyectos/src/pages/hogar
```

- [ ] **Step 4: Update Layout nav link**

In `src/components/Layout.jsx`, change both occurrences of:
- `to="/hogar"` → `to="/app/projects"`
- Label `Hogar` → `Proyectos`

- [ ] **Step 5: Fix App.test.jsx**

The existing App.test.jsx tests `/`, `/404`, and `/projects/:slug` — these still exist. But it will fail if tests try to render the new routes. Read App.test.jsx and remove any tests that reference `/hogar`. The existing routing tests for public routes should still pass.

- [ ] **Step 6: Run tests**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
cd /home/user/mi-portfolio-proyectos && git add src/App.jsx src/pages/app/ src/components/Layout.jsx && git rm -r src/pages/hogar && git commit -m "feat(routes): migrate /hogar/* to /app/projects/* architecture"
```

---

## Phase 2 — Projects List Page

### Task 4: AppProjects page

**Files:**
- Modify: `src/pages/app/Projects.jsx`

- [ ] **Step 1: Implement Projects.jsx**

Replace `/home/user/mi-portfolio-proyectos/src/pages/app/Projects.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const EMOJI_OPTIONS = ['🏠','🏋️','💼','📚','🎵','🌱','🍳','✈️','💰','🎮']

function NewProjectModal({ onClose, onCreated }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🏠')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    const slug = name.trim().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      + '-' + Date.now().toString(36)

    const { data, error: err } = await supabase
      .from('projects')
      .insert({ name: name.trim(), slug, icon, owner_id: user.id })
      .select()
      .single()

    if (err) { setError(err.message); setLoading(false); return }
    onCreated(data)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-xl"
      >
        <h2 className="font-bold text-lg text-[var(--text)] mb-4">Nuevo proyecto</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre del proyecto"
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
              text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none
              focus:border-[var(--accent)] transition-colors"
          />
          <div>
            <p className="text-xs text-[var(--text-faint)] mb-2">Icono</p>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(e)}
                  className={`w-10 h-10 rounded-lg text-xl transition-all ${
                    icon === e
                      ? 'bg-[var(--accent)] scale-110'
                      : 'bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)]'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={!name.trim() || loading}
              className="px-4 py-2 rounded-lg text-sm bg-[var(--accent)] text-white font-medium
                hover:opacity-90 disabled:opacity-40 transition-opacity">
              {loading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function AppProjects() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    if (data !== null) {
      setProjects(data)
      // Onboarding: auto-create "Hogar" if no projects
      if (data.length === 0) {
        const slug = 'hogar-' + Date.now().toString(36)
        const { data: created } = await supabase
          .from('projects')
          .insert({ name: 'Hogar', slug, icon: '🏠', owner_id: user.id })
          .select()
          .single()
        if (created) {
          navigate(`/app/projects/${created.slug}`)
          return
        }
      }
    }
    setLoading(false)
  }

  function handleCreated(project) {
    setShowModal(false)
    navigate(`/app/projects/${project.slug}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text)]">Mis proyectos</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Espacios privados para organizar tu vida</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium
            hover:opacity-90 transition-opacity"
        >
          + Nuevo proyecto
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <button
              onClick={() => navigate(`/app/projects/${p.slug}`)}
              className="w-full text-left p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]
                hover:border-[var(--accent)] hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-3">{p.icon}</div>
              <h2 className="font-semibold text-[var(--text)] mb-1">{p.name}</h2>
              <p className="text-xs text-[var(--text-faint)]">
                {new Date(p.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </button>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <NewProjectModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run
```

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
cd /home/user/mi-portfolio-proyectos && git add src/pages/app/Projects.jsx && git commit -m "feat(projects): Projects list page with create modal and onboarding"
```

---

## Phase 3 — ProjectDetail (sidebar shell + members)

### Task 5: AppProjectDetail page

**Files:**
- Modify: `src/pages/app/ProjectDetail.jsx`

- [ ] **Step 1: Implement ProjectDetail.jsx**

Replace `/home/user/mi-portfolio-proyectos/src/pages/app/ProjectDetail.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { ProjectProvider } from '../../contexts/ProjectContext'

const MODULES = [
  { path: 'calendar', label: 'Calendario', icon: '📅' },
  { path: 'shopping', label: 'Lista & Menú', icon: '🛒' },
  { path: 'recipes', label: 'Recetas', icon: '👨‍🍳' },
]

function MembersSection({ project }) {
  const [members, setMembers] = useState([])
  const [email, setEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    supabase
      .from('project_members')
      .select('*')
      .eq('project_id', project.id)
      .then(({ data }) => { if (data) setMembers(data) })
  }, [project.id])

  async function handleInvite(e) {
    e.preventDefault()
    if (!email.trim()) return
    setInviting(true)
    await supabase.from('project_members').insert({
      project_id: project.id,
      user_id: '00000000-0000-0000-0000-000000000000', // placeholder until user accepts
      role: 'editor',
      invited_email: email.trim(),
      accepted: false,
    })
    setMembers(prev => [...prev, { invited_email: email.trim(), accepted: false, role: 'editor' }])
    setEmail('')
    setInviting(false)
  }

  return (
    <div className="mt-8 pt-6 border-t border-[var(--border)]">
      <h3 className="text-xs font-semibold tracking-widest uppercase text-[var(--text-faint)] mb-3">
        Miembros
      </h3>
      {members.length > 0 && (
        <ul className="flex flex-col gap-2 mb-4">
          {members.map((m, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span className="w-5 h-5 rounded-full bg-[var(--border)] flex items-center justify-center text-[10px]">
                {(m.invited_email?.[0] ?? '?').toUpperCase()}
              </span>
              <span className="truncate">{m.invited_email}</span>
              {!m.accepted && <span className="text-[var(--text-faint)]">pendiente</span>}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleInvite} className="flex gap-2">
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          type="email"
          placeholder="email@ejemplo.com"
          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--bg)]
            text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none
            focus:border-[var(--accent)] transition-colors"
        />
        <button
          type="submit"
          disabled={!email.trim() || inviting}
          className="px-3 py-1.5 rounded-lg text-xs bg-[var(--accent)] text-white
            hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          Invitar
        </button>
      </form>
    </div>
  )
}

export default function AppProjectDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { navigate('/app/projects'); return }
        setProject(data)
        setLoading(false)
      })
  }, [slug, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <ProjectProvider project={project}>
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex gap-8 py-8 min-h-[70vh]">
          {/* Sidebar */}
          <aside className="w-52 shrink-0">
            <div className="mb-6">
              <div className="text-3xl mb-1">{project.icon}</div>
              <h1 className="font-bold text-[var(--text)]">{project.name}</h1>
            </div>

            <nav className="flex flex-col gap-1">
              {MODULES.map(m => (
                <NavLink
                  key={m.path}
                  to={m.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-[var(--accent)] text-white font-semibold'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text)]'
                    }`
                  }
                >
                  <span>{m.icon}</span>
                  {m.label}
                </NavLink>
              ))}
            </nav>

            <MembersSection project={project} />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <Outlet context={{ project }} />
          </main>
        </div>
      </div>
    </ProjectProvider>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run
```

- [ ] **Step 3: Commit**

```bash
cd /home/user/mi-portfolio-proyectos && git add src/pages/app/ProjectDetail.jsx src/contexts/ProjectContext.jsx && git commit -m "feat(projects): ProjectDetail sidebar shell with member management"
```

---

## Phase 4 — Calendar Module

### Task 6: Calendar.jsx with FullCalendar + drag/drop

**Files:**
- Modify: `src/pages/app/modules/Calendar.jsx`

- [ ] **Step 1: Implement Calendar.jsx**

Replace `/home/user/mi-portfolio-proyectos/src/pages/app/modules/Calendar.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import esLocale from '@fullcalendar/core/locales/es'
import { supabase } from '../../../lib/supabase'

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444']

function TaskModal({ task, slot, onSave, onDelete, onClose }) {
  const isNew = !task?.id
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.extendedProps?.description ?? '')
  const [color, setColor] = useState(task?.backgroundColor ?? COLORS[0])
  const [allDay, setAllDay] = useState(task?.allDay ?? slot?.allDay ?? false)
  const [startStr, setStartStr] = useState(
    task?.startStr ?? slot?.startStr?.slice(0, 16) ?? ''
  )
  const [endStr, setEndStr] = useState(
    task?.endStr ?? slot?.endStr?.slice(0, 16) ?? ''
  )

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="font-bold text-lg text-[var(--text)] mb-4">
          {isNew ? 'Nueva tarea' : 'Editar tarea'}
        </h2>
        <div className="flex flex-col gap-3">
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título *"
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
              text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none
              focus:border-[var(--accent)] transition-colors"
          />
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
              text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none
              focus:border-[var(--accent)] transition-colors"
          />
          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer">
            <input
              type="checkbox"
              checked={allDay}
              onChange={e => setAllDay(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Todo el día
          </label>
          {!allDay && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-[var(--text-faint)] mb-1">Inicio</label>
                <input type="datetime-local" value={startStr}
                  onChange={e => setStartStr(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--border)]
                    bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[var(--accent)]" />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-[var(--text-faint)] mb-1">Fin</label>
                <input type="datetime-local" value={endStr}
                  onChange={e => setEndStr(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--border)]
                    bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[var(--accent)]" />
              </div>
            </div>
          )}
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full transition-transform"
                style={{
                  backgroundColor: c,
                  transform: color === c ? 'scale(1.3)' : 'scale(1)',
                  outline: color === c ? `2px solid ${c}` : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-4">
          {!isNew && (
            <button onClick={() => onDelete(task.id)}
              className="px-4 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
              Eliminar
            </button>
          )}
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => title.trim() && onSave({ title: title.trim(), description, color, allDay, startStr, endStr })}
            disabled={!title.trim()}
            className="px-4 py-2 rounded-lg text-sm bg-[var(--accent)] text-white font-medium
              hover:opacity-90 disabled:opacity-40 transition-opacity">
            {isNew ? 'Crear' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Calendar() {
  const { project } = useOutletContext()
  const [events, setEvents] = useState([])
  const [modal, setModal] = useState(null)

  useEffect(() => {
    supabase
      .from('calendar_tasks')
      .select('*')
      .eq('project_id', project.id)
      .then(({ data }) => {
        if (data) setEvents(data.map(dbToEvent))
      })
  }, [project.id])

  function dbToEvent(t) {
    return {
      id: t.id,
      title: t.title,
      start: t.start_time,
      end: t.end_time,
      allDay: t.all_day,
      backgroundColor: t.color,
      borderColor: t.color,
      extendedProps: { description: t.description },
    }
  }

  async function handleSave({ title, description, color, allDay, startStr, endStr }) {
    const payload = {
      project_id: project.id,
      title,
      description,
      color,
      all_day: allDay,
      start_time: startStr || new Date().toISOString(),
      end_time: endStr || null,
    }
    if (modal?.task?.id) {
      const { error } = await supabase.from('calendar_tasks').update(payload).eq('id', modal.task.id)
      if (!error) {
        setEvents(prev => prev.map(e =>
          e.id === modal.task.id
            ? { ...e, title, allDay, start: payload.start_time, end: payload.end_time,
                backgroundColor: color, borderColor: color,
                extendedProps: { description } }
            : e
        ))
      }
    } else {
      const { data, error } = await supabase.from('calendar_tasks').insert(payload).select().single()
      if (!error && data) setEvents(prev => [...prev, dbToEvent(data)])
    }
    setModal(null)
  }

  async function handleDelete(id) {
    await supabase.from('calendar_tasks').delete().eq('id', id)
    setEvents(prev => prev.filter(e => e.id !== id))
    setModal(null)
  }

  async function handleEventDrop({ event }) {
    await supabase.from('calendar_tasks').update({
      start_time: event.startStr,
      end_time: event.endStr || null,
      all_day: event.allDay,
    }).eq('id', event.id)
    setEvents(prev => prev.map(e =>
      e.id === event.id ? { ...e, start: event.startStr, end: event.endStr, allDay: event.allDay } : e
    ))
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[var(--text)] mb-6">Calendario</h1>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4
        [&_.fc-button]:bg-[var(--accent)] [&_.fc-button]:border-[var(--accent)] [&_.fc-button]:text-white
        [&_.fc-button-active]:opacity-70 [&_.fc-day-today]:bg-orange-50
        dark:[&_.fc-day-today]:bg-orange-950/20 [&_.fc-toolbar-title]:text-[var(--text)]
        [&_.fc-col-header-cell]:text-[var(--text-muted)] [&_.fc-timegrid-slot-label]:text-[var(--text-faint)]">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridWeek"
          locale={esLocale}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek,dayGridMonth,listWeek',
          }}
          buttonText={{ day: 'Día', week: 'Semana', month: 'Mes', list: 'Agenda' }}
          events={events}
          selectable
          editable
          select={info => setModal({ task: null, slot: info })}
          eventClick={info => setModal({ task: info.event, slot: null })}
          eventDrop={handleEventDrop}
          eventResize={handleEventDrop}
          height="auto"
        />
      </div>
      {modal && (
        <TaskModal
          task={modal.task}
          slot={modal.slot}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run tests + commit**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run && git add src/pages/app/modules/Calendar.jsx && git commit -m "feat(calendar): FullCalendar with drag/drop, resize, project_id"
```

---

## Phase 5 — Shopping + Menu Module

### Task 7: Shopping.jsx (two-column layout)

**Files:**
- Modify: `src/pages/app/modules/Shopping.jsx`

- [ ] **Step 1: Implement Shopping.jsx**

Replace `/home/user/mi-portfolio-proyectos/src/pages/app/modules/Shopping.jsx`:

```jsx
import { useState, useEffect, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { startOfWeek, addDays, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '../../../lib/supabase'

const CATEGORIES = ['General','Frutas','Verduras','Carnes','Lácteos','Panadería','Limpieza','Otros']
const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
const MEAL_TYPES = [
  { key: 'breakfast', label: 'Desayuno' },
  { key: 'lunch', label: 'Comida' },
  { key: 'dinner', label: 'Cena' },
  { key: 'snack', label: 'Merienda' },
]

function ShoppingList({ projectId }) {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState('')
  const [category, setCategory] = useState('General')

  useEffect(() => {
    supabase.from('shopping_items').select('*')
      .eq('project_id', projectId).order('created_at')
      .then(({ data }) => { if (data) setItems(data) })
  }, [projectId])

  async function addItem(e) {
    e.preventDefault()
    if (!name.trim()) return
    const { data, error } = await supabase.from('shopping_items')
      .insert({ project_id: projectId, name: name.trim(), quantity: qty ? Number(qty) : null, unit: unit.trim() || null, category })
      .select().single()
    if (!error && data) { setItems(p => [...p, data]); setName(''); setQty(''); setUnit('') }
  }

  async function toggleItem(id, checked) {
    await supabase.from('shopping_items').update({ checked: !checked }).eq('id', id)
    setItems(p => p.map(i => i.id === id ? { ...i, checked: !checked } : i))
  }

  async function deleteItem(id) {
    await supabase.from('shopping_items').delete().eq('id', id)
    setItems(p => p.filter(i => i.id !== id))
  }

  async function clearChecked() {
    const ids = items.filter(i => i.checked).map(i => i.id)
    if (!ids.length) return
    await supabase.from('shopping_items').delete().in('id', ids)
    setItems(p => p.filter(i => !i.checked))
  }

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catItems = items.filter(i => i.category === cat)
    if (catItems.length) acc[cat] = catItems
    return acc
  }, {})

  const checkedCount = items.filter(i => i.checked).length

  return (
    <div className="flex flex-col h-full">
      <h2 className="font-bold text-[var(--text)] mb-4">🛒 Lista de la compra</h2>
      <form onSubmit={addItem} className="flex flex-wrap gap-2 mb-4">
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="Producto..." className="flex-1 min-w-28 px-3 py-2 text-sm rounded-lg
          border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]
          placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)] transition-colors" />
        <input value={qty} onChange={e => setQty(e.target.value)}
          placeholder="Cant." type="number" min="0" step="any"
          className="w-16 px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)]
          text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors" />
        <input value={unit} onChange={e => setUnit(e.target.value)}
          placeholder="Ud." className="w-16 px-3 py-2 text-sm rounded-lg border border-[var(--border)]
          bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors" />
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="px-2 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)]
          text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <button type="submit" className="px-3 py-2 text-sm rounded-lg bg-[var(--accent)] text-white
          hover:opacity-90 transition-opacity">Añadir</button>
      </form>
      {checkedCount > 0 && (
        <button onClick={clearChecked}
          className="mb-3 text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors self-start">
          Limpiar {checkedCount} marcados
        </button>
      )}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} className="mb-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-[var(--text-faint)] mb-1">{cat}</p>
            {catItems.map(item => (
              <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-lg
                bg-[var(--bg-card)] border border-[var(--border)] mb-1 group">
                <button onClick={() => toggleItem(item.id, item.checked)}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                  transition-colors ${item.checked ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border)] hover:border-[var(--accent)]'}`}>
                  {item.checked && <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                </button>
                <span className={`flex-1 text-sm ${item.checked ? 'line-through text-[var(--text-faint)]' : 'text-[var(--text)]'}`}>
                  {item.name}
                  {item.quantity && <span className="text-[var(--text-faint)] ml-1">{item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>}
                </span>
                <button onClick={() => deleteItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-faint)] hover:text-red-500 transition-all text-base leading-none">×</button>
              </div>
            ))}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-[var(--text-faint)] text-sm text-center py-8">Lista vacía</p>
        )}
      </div>
    </div>
  )
}

function MenuSemanal({ projectId }) {
  const [menu, setMenu] = useState({})
  const [weekStart, setWeekStart] = useState(() =>
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  )
  const [editing, setEditing] = useState(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    supabase.from('menu_items').select('*')
      .eq('project_id', projectId).eq('week_start', weekStart)
      .then(({ data }) => {
        if (data) {
          const map = {}
          data.forEach(e => { map[`${e.day_of_week}-${e.meal_type}`] = e })
          setMenu(map)
        }
      })
  }, [projectId, weekStart])

  function shiftWeek(delta) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + delta * 7)
    setWeekStart(format(d, 'yyyy-MM-dd'))
    setMenu({})
  }

  async function saveCell(dayIndex, mealKey, value) {
    const key = `${dayIndex}-${mealKey}`
    const existing = menu[key]
    if (existing) {
      await supabase.from('menu_items').update({ custom_name: value }).eq('id', existing.id)
      setMenu(p => ({ ...p, [key]: { ...existing, custom_name: value } }))
    } else {
      const { data } = await supabase.from('menu_items')
        .insert({ project_id: projectId, week_start: weekStart, day_of_week: dayIndex, meal_type: mealKey, custom_name: value })
        .select().single()
      if (data) setMenu(p => ({ ...p, [key]: data }))
    }
    setEditing(null)
  }

  async function clearCell(dayIndex, mealKey) {
    const key = `${dayIndex}-${mealKey}`
    const existing = menu[key]
    if (existing) {
      await supabase.from('menu_items').delete().eq('id', existing.id)
      setMenu(p => { const n = { ...p }; delete n[key]; return n })
    }
  }

  const weekDates = DAYS.map((_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return format(d, 'd MMM', { locale: es })
  })

  return (
    <div className="flex flex-col h-full">
      <h2 className="font-bold text-[var(--text)] mb-4">📋 Menú semanal</h2>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => shiftWeek(-1)}
          className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)]
          hover:border-[var(--accent)] transition-colors text-sm">←</button>
        <span className="text-xs text-[var(--text-muted)]">
          {format(new Date(weekStart), "d 'de' MMMM", { locale: es })}
        </span>
        <button onClick={() => shiftWeek(1)}
          className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)]
          hover:border-[var(--accent)] transition-colors text-sm">→</button>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full border-collapse min-w-[500px] text-xs">
          <thead>
            <tr>
              <th className="text-left py-1 pr-2 text-[var(--text-faint)] uppercase tracking-widest w-20">Comida</th>
              {DAYS.map((day, i) => (
                <th key={day} className="text-center py-1 px-1 text-[var(--text-muted)] font-semibold">
                  <div>{day.slice(0, 3)}</div>
                  <div className="text-[var(--text-faint)] font-normal">{weekDates[i]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEAL_TYPES.map(({ key: mealKey, label }) => (
              <tr key={mealKey}>
                <td className="py-1 pr-2 text-[var(--text-faint)] font-medium">{label}</td>
                {DAYS.map((_, dayIndex) => {
                  const key = `${dayIndex}-${mealKey}`
                  const entry = menu[key]
                  const isEditing = editing === key
                  return (
                    <td key={dayIndex} className="py-0.5 px-0.5">
                      {isEditing
                        ? <input autoFocus value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => editValue.trim() ? saveCell(dayIndex, mealKey, editValue.trim()) : setEditing(null)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') editValue.trim() ? saveCell(dayIndex, mealKey, editValue.trim()) : setEditing(null)
                              if (e.key === 'Escape') setEditing(null)
                            }}
                            className="w-full px-1.5 py-1 rounded border border-[var(--accent)] bg-[var(--bg)]
                            text-[var(--text)] text-xs outline-none" />
                        : <div onClick={() => { setEditing(key); setEditValue(entry?.custom_name ?? '') }}
                            className={`min-h-[28px] px-1.5 py-1 rounded border cursor-pointer transition-colors relative group ${
                              entry
                                ? 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] hover:border-[var(--accent)]'
                                : 'border-dashed border-[var(--border)] text-[var(--text-faint)] hover:border-[var(--accent)]'
                            }`}>
                            {entry?.custom_name ?? '+'}
                            {entry && (
                              <button onClick={ev => { ev.stopPropagation(); clearCell(dayIndex, mealKey) }}
                                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100
                                text-[var(--text-faint)] hover:text-red-500 text-sm leading-none px-0.5">×</button>
                            )}
                          </div>
                      }
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Shopping() {
  const { project } = useOutletContext()

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[var(--text)] mb-6">Lista & Menú</h1>
      <div className="grid lg:grid-cols-2 gap-8">
        <ShoppingList projectId={project.id} />
        <MenuSemanal projectId={project.id} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run tests + commit**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run && git add src/pages/app/modules/Shopping.jsx && git commit -m "feat(shopping): two-column Shopping+Menu with project_id and MEAL_TYPES"
```

---

## Phase 6 — Recipes Module + AI

### Task 8: Anthropic client + Recipes.jsx + RecipeDetail.jsx

**Files:**
- Create: `src/lib/anthropic.js`
- Modify: `src/pages/app/modules/Recipes.jsx`
- Modify: `src/pages/app/modules/RecipeDetail.jsx`

- [ ] **Step 1: Create src/lib/anthropic.js**

Create `/home/user/mi-portfolio-proyectos/src/lib/anthropic.js`:

```js
/**
 * Direct Anthropic API call from browser.
 * Requires VITE_ANTHROPIC_API_KEY in .env.local
 * and anthropic-dangerous-direct-browser-access: true header.
 */
export async function suggestRecipes({ ingredients, restrictions, timeMinutes, servings }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Eres un chef experto. Dame 3 recetas en JSON puro (sin markdown, sin texto extra) con este formato exacto:
[{"title":"...","ingredients":[{"name":"...","quantity":1,"unit":"..."}],"instructions":"...","prep_time":15,"cook_time":30,"servings":4,"tags":["..."]}]

Ingredientes disponibles: ${ingredients}
Restricciones: ${restrictions || 'ninguna'}
Tiempo máximo: ${timeMinutes} minutos
Personas: ${servings}`,
      }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `HTTP ${response.status}`)
  }

  const data = await response.json()
  const text = data.content[0]?.text ?? '[]'
  return JSON.parse(text)
}
```

- [ ] **Step 2: Implement Recipes.jsx**

Replace `/home/user/mi-portfolio-proyectos/src/pages/app/modules/Recipes.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../lib/supabase'
import { suggestRecipes } from '../../../lib/anthropic'

function AIModal({ projectId, onSaved, onClose }) {
  const [form, setForm] = useState({ ingredients: '', restrictions: '', timeMinutes: 30, servings: 4 })
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState({})

  async function handleGenerate(e) {
    e.preventDefault()
    if (!form.ingredients.trim()) return
    setLoading(true)
    setError(null)
    setSuggestions([])
    try {
      const recipes = await suggestRecipes(form)
      setSuggestions(recipes)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(recipe, index) {
    setSaving(p => ({ ...p, [index]: true }))
    const { data } = await supabase.from('recipes').insert({
      project_id: projectId,
      title: recipe.title,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      tags: recipe.tags ?? [],
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      servings: recipe.servings,
      ai_generated: true,
    }).select().single()
    if (data) onSaved(data)
    setSaving(p => ({ ...p, [index]: 'done' }))
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-2xl
        shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-[var(--text)]">✨ Sugerir recetas con IA</h2>
          <button onClick={onClose} className="text-[var(--text-faint)] hover:text-[var(--text)] text-xl">×</button>
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col gap-3 mb-6">
          <textarea value={form.ingredients}
            onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))}
            placeholder="Ingredientes disponibles (pollo, arroz, ajo, tomate...)"
            rows={2}
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
              text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none
              focus:border-[var(--accent)] resize-none transition-colors" />
          <input value={form.restrictions}
            onChange={e => setForm(f => ({ ...f, restrictions: e.target.value }))}
            placeholder="Restricciones (vegetariano, sin gluten...)"
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
              text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none
              focus:border-[var(--accent)] transition-colors" />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-[var(--text-faint)] mb-1">Personas</label>
              <input type="number" min={1} max={12} value={form.servings}
                onChange={e => setForm(f => ({ ...f, servings: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
                  text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[var(--text-faint)] mb-1">Tiempo máx. (min)</label>
              <select value={form.timeMinutes}
                onChange={e => setForm(f => ({ ...f, timeMinutes: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
                  text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors">
                {[15, 30, 45, 60, 90, 120].map(t => <option key={t} value={t}>{t} min</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={!form.ingredients.trim() || loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl
              bg-[var(--accent)] text-white font-medium hover:opacity-90 disabled:opacity-40 transition-opacity">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generando...</>
              : '✨ Generar 3 recetas'}
          </button>
        </form>

        {suggestions.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-[var(--text)]">Recetas sugeridas</h3>
            {suggestions.map((r, i) => (
              <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h4 className="font-semibold text-[var(--text)]">{r.title}</h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      {r.servings} personas · {(r.prep_time ?? 0) + (r.cook_time ?? 0)} min
                      {r.tags?.length > 0 && ` · ${r.tags.join(', ')}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSave(r, i)}
                    disabled={!!saving[i]}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs bg-[var(--accent)] text-white
                      hover:opacity-90 disabled:opacity-50 transition-opacity">
                    {saving[i] === 'done' ? '✓ Guardada' : saving[i] ? '...' : 'Guardar'}
                  </button>
                </div>
                <ul className="text-xs text-[var(--text-muted)] flex flex-wrap gap-x-3 gap-y-0.5">
                  {r.ingredients?.slice(0, 5).map((ing, j) => (
                    <li key={j}>• {ing.name} {ing.quantity}{ing.unit}</li>
                  ))}
                  {r.ingredients?.length > 5 && <li>+{r.ingredients.length - 5} más</li>}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Recipes() {
  const { project } = useOutletContext()
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState([])
  const [showAI, setShowAI] = useState(false)

  useEffect(() => {
    supabase.from('recipes').select('*').eq('project_id', project.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setRecipes(data) })
  }, [project.id])

  function handleSaved(recipe) {
    setRecipes(p => [recipe, ...p])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text)]">Recetas</h1>
        <button onClick={() => setShowAI(true)}
          className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium
            hover:opacity-90 transition-opacity">
          ✨ Sugerir con IA
        </button>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-faint)]">
          <p className="text-4xl mb-3">👨‍🍳</p>
          <p className="text-sm">Sin recetas aún — usa la IA para generar las primeras</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r, i) => (
            <motion.div key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}>
              <button onClick={() => navigate(`${r.id}`)}
                className="w-full text-left p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]
                  hover:border-[var(--accent)] hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-[var(--text)] leading-snug">{r.title}</h3>
                  {r.ai_generated && (
                    <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30
                      text-[var(--accent)] font-medium">IA</span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {r.servings} personas · {(r.prep_time ?? 0) + (r.cook_time ?? 0)} min
                </p>
                {r.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full border border-[var(--border)]
                        text-[var(--text-faint)]">{tag}</span>
                    ))}
                  </div>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {showAI && (
        <AIModal
          projectId={project.id}
          onSaved={handleSaved}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Implement RecipeDetail.jsx**

Replace `/home/user/mi-portfolio-proyectos/src/pages/app/modules/RecipeDetail.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { useParams, useOutletContext, useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'

export default function RecipeDetail() {
  const { recipeId } = useParams()
  const { project } = useOutletContext()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('recipes').select('*').eq('id', recipeId).single()
      .then(({ data, error }) => {
        if (error || !data) { navigate('..'); return }
        setRecipe(data)
        setLoading(false)
      })
  }, [recipeId, navigate])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[30vh]">
      <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate('..')}
        className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-4 flex items-center gap-1">
        ← Volver a recetas
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text)]">{recipe.title}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {recipe.servings} personas · {(recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)} min total
            {recipe.ai_generated && <span className="ml-2 text-[var(--accent)]">✨ Generada con IA</span>}
          </p>
        </div>
      </div>

      {recipe.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {recipe.tags.map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full border border-[var(--border)]
              text-[var(--text-muted)]">{tag}</span>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-[var(--text-faint)] mb-3">
            Ingredientes
          </h2>
          <ul className="flex flex-col gap-2">
            {ingredients.map((ing, i) => (
              <li key={i} className="flex items-baseline gap-2 text-sm text-[var(--text)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0 mt-1.5" />
                <span>
                  {typeof ing === 'string'
                    ? ing
                    : `${ing.quantity ?? ''} ${ing.unit ?? ''} ${ing.name ?? ''}`.trim()
                  }
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sm text-[var(--text-muted)]">
          {recipe.prep_time && <p>⏱ Prep: {recipe.prep_time} min</p>}
          {recipe.cook_time && <p>🔥 Cocción: {recipe.cook_time} min</p>}
        </div>
      </div>

      {recipe.instructions && (
        <div>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-[var(--text-faint)] mb-3">
            Preparación
          </h2>
          <p className="text-sm text-[var(--text)] leading-relaxed whitespace-pre-line">
            {recipe.instructions}
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests + commit**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run && git add src/lib/anthropic.js src/pages/app/modules/Recipes.jsx src/pages/app/modules/RecipeDetail.jsx && git commit -m "feat(recipes): AI recipe suggestions with direct Anthropic API + RecipeDetail"
```

---

## Phase 7 — Final cleanup

### Task 9: Update ESTADO-PROYECTO.md + final smoke test

- [ ] **Step 1: Build production bundle**

```bash
cd /home/user/mi-portfolio-proyectos && npm run build
```

Expected: no errors.

- [ ] **Step 2: Run full test suite**

```bash
cd /home/user/mi-portfolio-proyectos && npx vitest run
```

Expected: all pass.

- [ ] **Step 3: Update ESTADO-PROYECTO.md**

Add a new section to ESTADO-PROYECTO.md documenting:
- The new `/app/*` routes
- The 6 Supabase tables (projects, project_members, calendar_tasks, shopping_items, menu_items, recipes)
- The `VITE_ANTHROPIC_API_KEY` env var needed for Recipes AI
- The project-based architecture (all data scoped to project_id)

- [ ] **Step 4: Final commit**

```bash
cd /home/user/mi-portfolio-proyectos && git add ESTADO-PROYECTO.md && git commit -m "docs: update ESTADO-PROYECTO with project-based architecture"
```

---

## Manual steps (outside codebase)

1. **Add `VITE_ANTHROPIC_API_KEY`** to `.env.local` with your real Anthropic key
2. **Vercel**: add all 3 env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_FUNCTIONS_URL`, `VITE_ANTHROPIC_API_KEY`) in dashboard → Settings → Environment Variables
