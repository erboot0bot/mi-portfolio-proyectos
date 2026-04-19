import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

function GenerateForm({ onGenerated }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    ingredients: '',
    servings: 4,
    restrictions: '',
    timeMinutes: 30,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.ingredients.trim()) return
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/generate-recipe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(form),
        }
      )
      const recipe = await res.json()
      if (recipe.error) throw new Error(recipe.error)
      onGenerated({ ...recipe, ai_generated: true, user_id: user.id })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-1">
          Ingredientes disponibles *
        </label>
        <textarea
          value={form.ingredients}
          onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))}
          placeholder="pollo, arroz, ajo, cebolla, pimiento..."
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
            text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none
            focus:border-[var(--accent)] transition-colors resize-none"
        />
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-32">
          <label className="block text-sm font-medium text-[var(--text)] mb-1">Personas</label>
          <input
            type="number"
            min={1}
            max={12}
            value={form.servings}
            onChange={e => setForm(f => ({ ...f, servings: Number(e.target.value) }))}
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
              text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
        <div className="flex-1 min-w-32">
          <label className="block text-sm font-medium text-[var(--text)] mb-1">Tiempo máximo</label>
          <select
            value={form.timeMinutes}
            onChange={e => setForm(f => ({ ...f, timeMinutes: Number(e.target.value) }))}
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
              text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
          >
            {[15, 30, 45, 60, 90, 120].map(t => (
              <option key={t} value={t}>{t} min</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text)] mb-1">
          Restricciones dietéticas (opcional)
        </label>
        <input
          value={form.restrictions}
          onChange={e => setForm(f => ({ ...f, restrictions: e.target.value }))}
          placeholder="vegetariano, sin gluten, sin lactosa..."
          className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
            text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none
            focus:border-[var(--accent)] transition-colors"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!form.ingredients.trim() || loading}
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl
          bg-[var(--accent)] text-white font-medium hover:opacity-90
          disabled:opacity-40 transition-opacity"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generando...
          </>
        ) : '✨ Generar receta con IA'}
      </button>
    </form>
  )
}

function RecipeCard({ recipe, onSave, isSaved }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[var(--accent)] bg-[var(--bg-card)] p-6"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--text)]">{recipe.name}</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {recipe.servings} personas · {recipe.time_minutes} min · {recipe.category}
          </p>
        </div>
        {!isSaved
          ? (
            <button
              onClick={onSave}
              className="shrink-0 px-4 py-2 rounded-lg bg-[var(--accent)] text-white
                text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Guardar
            </button>
          )
          : <span className="text-sm text-green-600 dark:text-green-400 font-medium shrink-0">✓ Guardada</span>
        }
      </div>

      <div className="mb-4">
        <h4 className="text-xs font-semibold tracking-widest uppercase text-[var(--text-faint)] mb-2">
          Ingredientes
        </h4>
        <ul className="flex flex-col gap-1">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-[var(--text)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
              {ing}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h4 className="text-xs font-semibold tracking-widest uppercase text-[var(--text-faint)] mb-2">
          Preparación
        </h4>
        <p className="text-sm text-[var(--text)] leading-relaxed whitespace-pre-line">
          {recipe.instructions}
        </p>
      </div>

      {recipe.tips && (
        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg px-4 py-3">
          <p className="text-sm text-orange-700 dark:text-orange-300">
            💡 {recipe.tips}
          </p>
        </div>
      )}
    </motion.div>
  )
}

function SavedRecipes({ recipes, onDelete }) {
  if (!recipes.length) {
    return (
      <p className="text-[var(--text-faint)] text-sm text-center py-12">
        No tienes recetas guardadas aún
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {recipes.map(recipe => (
        <div key={recipe.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="font-bold text-[var(--text)]">{recipe.name}</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {recipe.servings} personas · {recipe.time_minutes} min · {recipe.category}
                {recipe.ai_generated && <span className="ml-2 text-[var(--accent)]">✨ IA</span>}
              </p>
            </div>
            <button
              onClick={() => onDelete(recipe.id)}
              className="text-[var(--text-faint)] hover:text-red-500 transition-colors text-lg shrink-0"
            >
              ×
            </button>
          </div>
          <details className="group">
            <summary className="text-xs text-[var(--text-muted)] cursor-pointer hover:text-[var(--text)]
              list-none flex items-center gap-1 transition-colors select-none">
              <span className="group-open:rotate-90 transition-transform inline-block">›</span>
              Ver receta completa
            </summary>
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <ul className="flex flex-col gap-1 mb-3">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="text-xs text-[var(--text)] flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[var(--accent)] shrink-0" />
                    {ing}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-[var(--text)] leading-relaxed whitespace-pre-line">
                {recipe.instructions}
              </p>
            </div>
          </details>
        </div>
      ))}
    </div>
  )
}

export default function Recetas() {
  const { user } = useAuth()
  const [tab, setTab] = useState('generar')
  const [saved, setSaved] = useState([])
  const [generatedRecipe, setGeneratedRecipe] = useState(null)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setSaved(data) })
  }, [user.id])

  async function saveRecipe() {
    const { data, error } = await supabase
      .from('recipes')
      .insert({
        user_id: user.id,
        name: generatedRecipe.name,
        ingredients: generatedRecipe.ingredients,
        instructions: generatedRecipe.instructions,
        category: generatedRecipe.category,
        servings: generatedRecipe.servings,
        time_minutes: generatedRecipe.time_minutes,
        ai_generated: true,
      })
      .select()
      .single()
    if (!error && data) {
      setSaved(prev => [data, ...prev])
      setIsSaved(true)
    }
  }

  async function deleteRecipe(id) {
    await supabase.from('recipes').delete().eq('id', id)
    setSaved(prev => prev.filter(r => r.id !== id))
  }

  function handleGenerated(recipe) {
    setGeneratedRecipe(recipe)
    setIsSaved(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[var(--text)] mb-6">Recetas</h1>

      <div className="flex gap-1 mb-8 p-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] w-fit">
        {[
          { id: 'generar', label: '✨ Generar con IA' },
          { id: 'guardadas', label: `📖 Guardadas (${saved.length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'generar' ? (
          <motion.div
            key="generar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl"
          >
            <GenerateForm onGenerated={handleGenerated} />
            {generatedRecipe && (
              <div className="mt-6">
                <RecipeCard
                  recipe={generatedRecipe}
                  onSave={saveRecipe}
                  isSaved={isSaved}
                />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="guardadas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SavedRecipes recipes={saved} onDelete={deleteRecipe} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
