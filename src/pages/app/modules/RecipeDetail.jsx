import { useState, useEffect } from 'react'
import { useParams, useOutletContext, useNavigate } from 'react-router-dom'
import { format, startOfWeek } from 'date-fns'
import { supabase } from '../../../lib/supabase'
import { menuEventToDb } from '../../../utils/menuTransformers'
import { recipeIngredientFromDb } from '../../../utils/recipeTransformers'

const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
const MEAL_TYPES = [
  { key: 'desayuno', label: 'Desayuno' },
  { key: 'almuerzo', label: 'Almuerzo' },
  { key: 'comida',   label: 'Comida' },
  { key: 'cena',     label: 'Cena' },
]

function AddToMenuModal({ recipe, app, onClose }) {
  const [day, setDay] = useState(0)
  const [meal, setMeal] = useState('comida')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  async function handleAdd() {
    setSaving(true)
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    const payload = menuEventToDb(app.id, weekStart, day, meal, recipe.title, recipe.id)
    await supabase.from('events').insert(payload)
    setDone(true)
    setTimeout(onClose, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="font-bold text-[var(--text)] mb-4">Añadir al menú de esta semana</h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-[var(--text-faint)] mb-1">Día</label>
            <select value={day} onChange={e => setDay(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[var(--accent)]">
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-faint)] mb-1">Comida</label>
            <select value={meal} onChange={e => setMeal(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[var(--accent)]">
              {MEAL_TYPES.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors">Cancelar</button>
          <button onClick={handleAdd} disabled={saving}
            className="px-4 py-2 rounded-lg text-sm bg-[var(--accent)] text-white font-medium hover:opacity-90 disabled:opacity-40 transition-opacity">
            {done ? '✓ Añadido' : saving ? '...' : 'Añadir'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RecipeDetail() {
  const { recipeId } = useParams()
  const { app } = useOutletContext()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addedMsg, setAddedMsg] = useState(null)
  const [showMenuPicker, setShowMenuPicker] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [normalizedIngredients, setNormalizedIngredients] = useState(null) // null = not yet loaded
  const [deleteConfirming, setDeleteConfirming] = useState(false)

  useEffect(() => {
    supabase.from('recipes').select('*').eq('id', recipeId).single()
      .then(async ({ data, error }) => {
        if (error || !data) { navigate('..'); return }
        setRecipe(data)

        // Load normalized ingredients; fallback to JSONB if no rows
        const { data: riRows } = await supabase
          .from('recipe_ingredients')
          .select('*')
          .eq('recipe_id', data.id)
          .order('sort_order')

        setNormalizedIngredients(
          riRows?.length
            ? riRows.map(recipeIngredientFromDb)
            : null // signal to use JSONB fallback
        )

        setLoading(false)
      })
  }, [recipeId, navigate])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[30vh]">
      <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const ingredients = normalizedIngredients
    ?? (Array.isArray(recipe?.ingredients) ? recipe.ingredients : [])

  async function handleDelete() {
    setDeleteConfirming(true)
    await supabase.from('recipes').delete().eq('id', recipeId)
    navigate('..')
  }

  async function addToShoppingList() {
    const items = ingredients.map(ing => ({
      app_id: app.id,
      module: 'supermercado',
      type: 'product',
      title: typeof ing === 'string' ? ing : (ing.name ?? ''),
      metadata: {
        quantity: typeof ing === 'object' ? (ing.quantity ?? null) : null,
        unit: typeof ing === 'object' ? (ing.unit ?? '') : '',
        category: 'otros',
        store: 'General',
        price_unit: null,
      },
    })).filter(i => i.title)

    if (!items.length) return
    await supabase.from('items').insert(items)
    setAddedMsg(`${items.length} ingredientes añadidos`)
    setTimeout(() => setAddedMsg(null), 3000)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('..')}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors flex items-center gap-1">
          ← Volver a recetas
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-sm text-[var(--text-faint)] hover:text-red-500 transition-colors flex items-center gap-1"
          title="Eliminar receta"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
          Eliminar
        </button>
      </div>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text)]">{recipe.title}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {recipe.servings} personas · {(recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)} min total
            {recipe.ai_generated && <span className="ml-2 text-[var(--accent)]">✨ Generada con IA</span>}
          </p>
        </div>
        <button onClick={() => setShowMenuPicker(true)}
          className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
          📋 Añadir al menú
        </button>
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
          <div className="mt-3 flex items-center gap-3">
            <button onClick={addToShoppingList}
              className="text-sm px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)]
              hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
              🛒 Añadir ingredientes al carrito
            </button>
            {addedMsg && <span className="text-xs text-green-600 dark:text-green-400">{addedMsg}</span>}
          </div>
        </div>
        <div className="text-sm text-[var(--text-muted)]">
          {recipe.prep_time && <p>⏱ Prep: {recipe.prep_time} min</p>}
          {recipe.cook_time && <p>🔥 Cocción: {recipe.cook_time} min</p>}
        </div>
      </div>

      {recipe.instructions && (
        <div>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-[var(--text-faint)] mb-3">Preparación</h2>
          <ol className="flex flex-col gap-3">
            {recipe.instructions.split('\n').filter(s => s.trim()).map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-[var(--text)]">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step.replace(/^\d+\.?\s*/, '')}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {showMenuPicker && <AddToMenuModal recipe={recipe} app={app} onClose={() => setShowMenuPicker(false)} />}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="font-bold text-lg text-[var(--text)] mb-2">¿Eliminar receta?</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              ¿Eliminar <span className="font-semibold text-[var(--text)]">{recipe.title}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleteConfirming}
                className="px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors disabled:opacity-40">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleteConfirming}
                className="px-4 py-2 rounded-lg text-sm bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-40 transition-colors">
                {deleteConfirming ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
