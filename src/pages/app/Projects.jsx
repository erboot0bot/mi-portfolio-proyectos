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

function DeleteConfirmModal({ project, onConfirm, onClose, deleting }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="font-bold text-lg text-[var(--text)] mb-2">¿Eliminar proyecto?</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          ¿Eliminar proyecto <span className="font-semibold text-[var(--text)]">{project.icon} {project.name}</span>?
          Esta acción no se puede deshacer. Se eliminarán todas las tareas, recetas, lista de la compra y menú.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} disabled={deleting}
            className="px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors disabled:opacity-40">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="px-4 py-2 rounded-lg text-sm bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-40 transition-colors">
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AppProjects() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    // Own projects
    const { data: ownProjects } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    // Shared projects via project_members
    const { data: memberships } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id)
      .eq('accepted', true)

    let sharedProjects = []
    if (memberships?.length) {
      const sharedIds = memberships.map(m => m.project_id)
      const { data: shared } = await supabase
        .from('projects')
        .select('*')
        .in('id', sharedIds)
        .not('owner_id', 'eq', user.id)
      sharedProjects = shared ?? []
    }

    const all = [...(ownProjects ?? []), ...sharedProjects]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    if (all.length === 0) {
      // Onboarding: auto-create "Hogar" if no projects
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

    setProjects(all)
    setLoading(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await supabase.from('projects').delete().eq('id', deleteTarget.id)
    setProjects(prev => prev.filter(p => p.id !== deleteTarget.id))
    setDeleteTarget(null)
    setDeleting(false)
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
            className="relative group"
          >
            {/* Trash button — owner only, visible on hover */}
            {p.owner_id === user.id && (
              <button
                onClick={e => { e.stopPropagation(); setDeleteTarget(p) }}
                className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100
                  w-7 h-7 rounded-lg flex items-center justify-center
                  bg-[var(--bg)] border border-[var(--border)] text-[var(--text-faint)]
                  hover:border-red-400 hover:text-red-500 transition-all"
                title="Eliminar proyecto"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
              </button>
            )}
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
              {p.owner_id !== user.id && (
                <span className="text-xs px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--text-faint)] mt-1 self-start">
                  Compartido
                </span>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <NewProjectModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          project={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  )
}
