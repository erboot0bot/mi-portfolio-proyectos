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
      user_id: '00000000-0000-0000-0000-000000000000',
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
