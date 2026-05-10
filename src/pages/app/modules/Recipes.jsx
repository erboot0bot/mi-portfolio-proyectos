import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import ModuleShell from './ModuleShell'
import ModuleTopNav from '../../../components/ModuleTopNav'
import { motion } from 'framer-motion'
import { supabase } from '../../../lib/supabase'
import { recipeIngredientToDb } from '../../../utils/recipeTransformers'
import { usePWAManifest } from '../../../hooks/usePWAManifest'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead, demoWrite } from '../../../data/demo/index.js'

async function suggestRecipes({ ingredients, restrictions, timeMinutes, servings }) {
  const { data: { session } } = await supabase.auth.getSession()
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/generate-recipe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ ingredients, restrictions, timeMinutes, servings }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error ?? `HTTP ${response.status}`)
  }
  return response.json()
}

function AIModal({ appId, onSaved, onClose }) {
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
    const { data, error: recipeErr } = await supabase.from('recipes').insert({
      app_id:       appId,
      title:        recipe.title,
      ingredients:  recipe.ingredients,
      instructions: recipe.instructions,
      tags:         recipe.tags ?? [],
      prep_time:    recipe.prep_time,
      cook_time:    recipe.cook_time,
      servings:     recipe.servings,
      ai_generated: true,
    }).select().single()

    if (recipeErr || !data) {
      setSaving(p => ({ ...p, [index]: false }))
      return
    }

    // Guardar ingredientes normalizados
    const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
    if (ings.length) {
      const rows = ings
        .map((ing, i) =>
          recipeIngredientToDb(
            data.id,
            typeof ing === 'string' ? ing : (ing.name ?? ''),
            typeof ing === 'object' ? (ing.quantity ?? null) : null,
            typeof ing === 'object' ? (ing.unit ?? '') : '',
            i
          )
        )
        .filter(r => r.name)
      if (rows.length) await supabase.from('recipe_ingredients').insert(rows)
    }

    onSaved(data)
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

function ManualModal({ appId, recipe: existingRecipe, onSaved, onClose, mode, appType }) {
  const [form, setForm] = useState({
    title: existingRecipe?.title ?? '',
    instructions: existingRecipe?.instructions ?? '',
    prep_time: existingRecipe?.prep_time ?? '',
    cook_time: existingRecipe?.cook_time ?? '',
    servings: existingRecipe?.servings ?? 4,
    tags: existingRecipe?.tags?.join(', ') ?? '',
  })
  const [ingredients, setIngredients] = useState(
    existingRecipe?.ingredients?.length
      ? existingRecipe.ingredients.map(ing =>
          typeof ing === 'string'
            ? { name: ing, quantity: '', unit: '' }
            : { name: ing.name ?? '', quantity: ing.quantity ?? '', unit: ing.unit ?? '' }
        )
      : [{ name: '', quantity: '', unit: '' }]
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function updateIngredient(i, field, value) {
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing))
  }

  function addIngredientRow() {
    setIngredients(prev => [...prev, { name: '', quantity: '', unit: '' }])
  }

  function removeIngredient(i) {
    setIngredients(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    setError(null)
    const ings = ingredients.filter(i => i.name.trim()).map(i => ({
      name: i.name.trim(),
      quantity: i.quantity ? Number(i.quantity) : null,
      unit: i.unit.trim() || null,
    }))
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const payload = {
      app_id: appId,
      title: form.title.trim(),
      ingredients: ings,
      instructions: form.instructions.trim(),
      prep_time: form.prep_time ? Number(form.prep_time) : null,
      cook_time: form.cook_time ? Number(form.cook_time) : null,
      servings: form.servings,
      tags,
    }

    if (mode === 'demo') {
      if (existingRecipe) {
        const updated = { ...existingRecipe, ...payload }
        const all = demoRead(appType, 'recipes')
        demoWrite(appType, 'recipes', all.map(r => r.id === existingRecipe.id ? updated : r))
        setSaving(false)
        onSaved(updated)
      } else {
        const newR = { ...payload, id: crypto.randomUUID(), ai_generated: false, created_at: new Date().toISOString() }
        const all = demoRead(appType, 'recipes')
        demoWrite(appType, 'recipes', [newR, ...all])
        setSaving(false)
        onSaved(newR)
      }
      return
    }

    let data, err
    if (existingRecipe) {
      // UPDATE
      ;({ data, error: err } = await supabase.from('recipes')
        .update(payload)
        .eq('id', existingRecipe.id)
        .select().single())
    } else {
      // INSERT
      payload.ai_generated = false
      ;({ data, error: err } = await supabase.from('recipes')
        .insert(payload)
        .select().single())
    }

    if (err) { setError(err.message); setSaving(false); return }

    // Sincronizar recipe_ingredients (DELETE + re-INSERT)
    const { error: delErr } = await supabase.from('recipe_ingredients').delete().eq('recipe_id', data.id)
    if (delErr) { setError('Error al actualizar ingredientes: ' + delErr.message); setSaving(false); return }
    if (ings.length) {
      const rows = ings.map((ing, i) =>
        recipeIngredientToDb(data.id, ing.name, ing.quantity ?? null, ing.unit ?? '', i)
      )
      const { error: insErr } = await supabase.from('recipe_ingredients').insert(rows)
      if (insErr) { setError('Error al guardar ingredientes: ' + insErr.message); setSaving(false); return }
    }

    setSaving(false)
    onSaved(data)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-xl
        shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-[var(--text)]">
            {existingRecipe ? 'Editar receta' : 'Nueva receta'}
          </h2>
          <button onClick={onClose} className="text-[var(--text-faint)] hover:text-[var(--text)] text-xl">×</button>
        </div>
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Título de la receta *" autoFocus
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
              text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)] transition-colors" />

          <div>
            <p className="text-xs text-[var(--text-faint)] mb-2">Ingredientes</p>
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 mb-1">
                <input value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)}
                  placeholder="Nombre" className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-[var(--border)]
                  bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[var(--accent)]" />
                <input value={ing.quantity} onChange={e => updateIngredient(i, 'quantity', e.target.value)}
                  placeholder="Cant." type="number" min="0" step="any"
                  className="w-16 px-3 py-1.5 text-sm rounded-lg border border-[var(--border)]
                  bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[var(--accent)]" />
                <input value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)}
                  placeholder="Ud."
                  className="w-14 px-3 py-1.5 text-sm rounded-lg border border-[var(--border)]
                  bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[var(--accent)]" />
                {ingredients.length > 1 && (
                  <button type="button" onClick={() => removeIngredient(i)}
                    className="text-[var(--text-faint)] hover:text-red-500 text-lg leading-none">×</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addIngredientRow}
              className="text-xs text-[var(--accent)] hover:opacity-80 transition-opacity">+ Añadir ingrediente</button>
          </div>

          <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
            placeholder="Instrucciones de preparación..." rows={4}
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
              text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)]
              resize-none transition-colors" />

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-[var(--text-faint)] mb-1">Prep (min)</label>
              <input type="number" min="0" value={form.prep_time}
                onChange={e => setForm(f => ({ ...f, prep_time: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
                  text-[var(--text)] outline-none focus:border-[var(--accent)]" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[var(--text-faint)] mb-1">Cocción (min)</label>
              <input type="number" min="0" value={form.cook_time}
                onChange={e => setForm(f => ({ ...f, cook_time: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
                  text-[var(--text)] outline-none focus:border-[var(--accent)]" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[var(--text-faint)] mb-1">Personas</label>
              <input type="number" min="1" max="20" value={form.servings}
                onChange={e => setForm(f => ({ ...f, servings: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
                  text-[var(--text)] outline-none focus:border-[var(--accent)]" />
            </div>
          </div>

          <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            placeholder="Tags separados por coma (vegetariano, rápido...)"
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
              text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)] transition-colors" />

          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={!form.title.trim() || saving}
              className="px-4 py-2 rounded-lg text-sm bg-[var(--accent)] text-white font-medium
                hover:opacity-90 disabled:opacity-40 transition-opacity">
              {saving ? 'Guardando...' : existingRecipe ? 'Guardar cambios' : 'Guardar receta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Recipes() {
  usePWAManifest('recipes')
  const { app, modules } = useOutletContext()
  const { mode } = useMode()
  const appType = app.id.replace('demo-', '')
  const navigate = useNavigate()
  const [recipes, setRecipes]           = useState([])
  const [showAI, setShowAI]             = useState(false)
  const [showManual, setShowManual]     = useState(false)
  const [menuOpen, setMenuOpen]         = useState(null)
  const [editRecipe, setEditRecipe]     = useState(null)
  const [deleteRecipe, setDeleteRecipe] = useState(null)
  const [deleteConfirming, setDeleteConfirming] = useState(false)
  // New: tabs + filters + AI panel
  const isMobile = window.innerWidth < 768
  const [tab, setTab]               = useState('fav') // 'fav'|'all'|'ai'|'quick'
  const [timeFilter, setTimeFilter] = useState(null)  // null|15|30|60
  const [favIds, setFavIds]         = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [ingredients, setIngredients] = useState('')

  function toggleFav(id) {
    setFavIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  useEffect(() => {
    if (mode === 'demo') {
      const all = demoRead(appType, 'recipes')
      setRecipes(all)
      setFavIds(new Set(['demo-r-1', 'demo-r-2', 'demo-r-4']))
      return
    }
    supabase.from('recipes').select('*').eq('app_id', app.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setRecipes(data) })
  }, [app.id, mode, appType])

  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [menuOpen])

  function handleSaved(recipe) {
    setRecipes(p => [recipe, ...p])
  }

  async function handleDelete(recipe) {
    setDeleteConfirming(true)
    if (mode === 'demo') {
      const all = demoRead(appType, 'recipes')
      demoWrite(appType, 'recipes', all.filter(r => r.id !== recipe.id))
      setRecipes(prev => prev.filter(r => r.id !== recipe.id))
      setDeleteRecipe(null)
      setDeleteConfirming(false)
      return
    }
    await supabase.from('recipes').delete().eq('id', recipe.id)
    setRecipes(prev => prev.filter(r => r.id !== recipe.id))
    setDeleteRecipe(null)
    setDeleteConfirming(false)
  }

  function handleEdited(updated) {
    setRecipes(prev => prev.map(r => r.id === updated.id ? updated : r))
    setEditRecipe(null)
  }

  // Filter logic
  let visibleRecipes = recipes.filter(r =>
    !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  if (tab === 'fav')   visibleRecipes = visibleRecipes.filter(r => favIds.has(r.id))
  if (tab === 'ai')    visibleRecipes = visibleRecipes.filter(r => r.ai_generated)
  if (tab === 'quick') visibleRecipes = visibleRecipes.filter(r => (r.prep_time ?? 0) + (r.cook_time ?? 0) <= 20)
  if (timeFilter)      visibleRecipes = visibleRecipes.filter(r => (r.prep_time ?? 0) + (r.cook_time ?? 0) <= timeFilter)

  const RECIPE_TABS = [
    { key: 'fav',   label: '⭐ Favoritas' },
    { key: 'all',   label: 'Todas' },
    { key: 'ai',    label: '✨ IA' },
    { key: 'quick', label: "⚡ Rápidas" },
  ]

  return (
    <ModuleShell app={app} modules={modules}>
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Unified top nav for mobile / header for desktop */}
      {isMobile ? (
        <ModuleTopNav
          title="Recetas"
          subtitle={`${recipes.length} guardadas`}
          rightAction={{ icon: '+', onClick: () => setShowManual(true) }}
          tabs={RECIPE_TABS}
          activeTab={tab}
          onTabChange={setTab}
        />
      ) : (
        <div style={{ display:'flex', gap:2, padding:'12px 20px', borderBottom:'1px solid var(--border)', flexShrink:0, overflowX:'auto', alignItems:'center' }}>
          {RECIPE_TABS.map(({ key: v, label: l }) => (
            <button key={v} onClick={() => setTab(v)} style={{
              padding:'6px 14px', borderRadius:8, fontSize:13, fontWeight:500, border:'none',
              cursor:'pointer', whiteSpace:'nowrap', transition:'all .15s',
              background: tab === v ? 'var(--accent)' : 'none',
              color: tab === v ? '#fff' : 'var(--text-muted)',
            }}>{l}</button>
          ))}
          <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
            <button onClick={() => setShowManual(true)} style={{
              padding:'6px 14px', borderRadius:8, fontSize:13, fontWeight:500,
              border:'1px solid var(--border)', background:'none', color:'var(--text-muted)',
              cursor:'pointer', transition:'all .15s', whiteSpace:'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
              + Nueva receta
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <input
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar recetas..."
          style={{ flex:1, padding:'8px 12px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg)', color:'var(--text)', fontSize:13, outline:'none', transition:'border-color .15s' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <div style={{ display:'flex', gap:4 }}>
          {[null, 15, 30, 60].map(t => (
            <button key={t ?? 'all'} onClick={() => setTimeFilter(t)} style={{
              padding:'5px 10px', borderRadius:999, fontSize:11, fontWeight:500,
              border:`1px solid ${timeFilter === t ? 'var(--accent)' : 'var(--border)'}`,
              background: timeFilter === t ? 'var(--accent)' : 'transparent',
              color: timeFilter === t ? '#fff' : 'var(--text-muted)',
              cursor:'pointer', transition:'all .15s',
            }}>{t ? `≤${t}'` : 'Todos'}</button>
          ))}
        </div>
      </div>

      {/* Grid + AI panel */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        {/* Recipe grid */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>
          {visibleRecipes.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 24px', textAlign:'center', gap:12 }}>
              <span style={{ fontSize:48 }}>{tab === 'fav' ? '⭐' : '👨‍🍳'}</span>
              <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text)', margin:0 }}>
                {tab === 'fav' ? 'Sin recetas favoritas' : 'Sin recetas aún'}
              </h3>
              <p style={{ fontSize:13, color:'var(--text-muted)', margin:0 }}>
                {tab === 'fav' ? 'Marca recetas como favoritas para verlas aquí' : 'Usa la IA para generar las primeras'}
              </p>
              {tab === 'fav' && (
                <button
                  onClick={() => setTab('all')}
                  style={{ marginTop:4, padding:'10px 20px', borderRadius:'var(--radius-full)', background:'var(--accent)', color:'#fff', border:'none', cursor:'pointer', fontSize:13, fontWeight:600 }}
                >
                  Ver todas las recetas
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleRecipes.map((r, i) => (
                <motion.div key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative group">
                  {/* Three-dot menu */}
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === r.id ? null : r.id) }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center
                        bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)]
                        hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors text-base">
                      ⋯
                    </button>
                    {menuOpen === r.id && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-[var(--bg-card)] border border-[var(--border)]
                        rounded-xl shadow-lg overflow-hidden z-20">
                        <button
                          onClick={e => { e.stopPropagation(); setEditRecipe(r); setMenuOpen(null) }}
                          className="w-full text-left px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--accent)] hover:text-white transition-colors">
                          ✏️ Editar
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setDeleteRecipe(r); setMenuOpen(null) }}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                          🗑 Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Fav button */}
                  <button
                    onClick={e => { e.stopPropagation(); toggleFav(r.id) }}
                    className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity
                      w-7 h-7 rounded-lg flex items-center justify-center
                      bg-[var(--bg)] border border-[var(--border)] text-base"
                    style={{ color: favIds.has(r.id) ? '#f59e0b' : 'var(--text-faint)' }}>
                    {favIds.has(r.id) ? '⭐' : '☆'}
                  </button>
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
        </div>

        {/* AI panel sidebar */}
        <div style={{ width:260, borderLeft:'1px solid var(--border)', padding:16, overflowY:'auto', flexShrink:0, display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ fontWeight:700, fontSize:13, color:'var(--text)', display:'flex', alignItems:'center', gap:6 }}>
            ✨ ¿Qué tenemos en casa?
          </div>
          <p style={{ fontSize:11, color:'var(--text-faint)', lineHeight:1.6, margin:0 }}>
            Dime qué ingredientes tienes y la IA sugiere recetas posibles.
          </p>
          <textarea
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
            placeholder="pollo, arroz, tomate, espinacas..."
            rows={3}
            style={{ width:'100%', padding:'8px 10px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg)', color:'var(--text)', fontSize:12, outline:'none', resize:'none', transition:'border-color .15s' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            onClick={() => setShowAI(true)}
            disabled={!ingredients.trim()}
            style={{ width:'100%', padding:10, borderRadius:10, background:'linear-gradient(135deg, var(--accent), #e05c00)', color:'#fff', border:'none', fontSize:12, fontWeight:700, cursor:'pointer', opacity: ingredients.trim() ? 1 : .4, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            ✨ Sugerir recetas
          </button>
          <div style={{ borderTop:'1px solid var(--border)', paddingTop:10 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'var(--text-faint)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.08em' }}>O crea manualmente</div>
            <button onClick={() => setShowManual(true)} style={{ width:'100%', padding:'8px 10px', borderRadius:9, border:'1px solid var(--border)', background:'none', color:'var(--text-muted)', fontSize:12, fontWeight:500, cursor:'pointer', transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
              + Nueva receta
            </button>
          </div>
        </div>
      </div>

      {showAI && (
        <AIModal
          appId={app.id}
          onSaved={handleSaved}
          onClose={() => setShowAI(false)}
        />
      )}
      {showManual && (
        <ManualModal
          appId={app.id}
          onSaved={r => { handleSaved(r); setShowManual(false) }}
          onClose={() => setShowManual(false)}
          mode={mode}
          appType={appType}
        />
      )}

      {/* Delete confirmation */}
      {deleteRecipe && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="font-bold text-lg text-[var(--text)] mb-2">¿Eliminar receta?</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              ¿Eliminar <span className="font-semibold text-[var(--text)]">{deleteRecipe.title}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteRecipe(null)} disabled={deleteConfirming}
                className="px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors disabled:opacity-40">
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteRecipe)} disabled={deleteConfirming}
                className="px-4 py-2 rounded-lg text-sm bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-40 transition-colors">
                {deleteConfirming ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editRecipe && (
        <ManualModal
          appId={app.id}
          recipe={editRecipe}
          onSaved={handleEdited}
          onClose={() => setEditRecipe(null)}
          mode={mode}
          appType={appType}
        />
      )}
    </div>
    </ModuleShell>
  )
}
