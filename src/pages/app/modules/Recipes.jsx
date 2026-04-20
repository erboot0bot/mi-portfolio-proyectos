import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
