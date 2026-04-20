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
