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
