import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import ModuleShell from './ModuleShell'
import { format, startOfWeek, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '../../../lib/supabase'

const MEALS = [
  { key: 'desayuno', label: 'Desayuno', icon: '☀️', hour: 8  },
  { key: 'almuerzo', label: 'Almuerzo', icon: '🍎', hour: 11 },
  { key: 'comida',   label: 'Comida',   icon: '🍽️', hour: 14 },
  { key: 'cena',     label: 'Cena',     icon: '🌙', hour: 21 },
]
const DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function Menu() {
  const { project, modules } = useOutletContext()
  const [menu, setMenu]             = useState({})
  const [weekStart, setWeekStart]   = useState(() =>
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  )
  const [modal, setModal]           = useState(null)
  const [editVal, setEditVal]       = useState('')
  const [recipes, setRecipes]       = useState([])
  const [toast, setToast]           = useState(null)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  useEffect(() => {
    supabase.from('recipes').select('id, title')
      .eq('project_id', project.id)
      .then(({ data }) => { if (data) setRecipes(data) })
  }, [project.id])

  useEffect(() => {
    supabase.from('menu_items').select('*')
      .eq('project_id', project.id)
      .eq('week_start', weekStart)
      .then(({ data }) => {
        if (data) {
          const map = {}
          data.forEach(e => { map[`${e.day_of_week}-${e.meal_type}`] = e })
          setMenu(map)
        }
      })
  }, [project.id, weekStart])

  function shiftWeek(delta) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + delta * 7)
    setWeekStart(format(d, 'yyyy-MM-dd'))
    setMenu({})
  }

  async function saveCell(value, recipeId = null) {
    if (!modal) return
    const { dayIdx, mealKey, key } = modal
    const existing = menu[key]
    const payload = {
      project_id: project.id, week_start: weekStart,
      day_of_week: dayIdx, meal_type: mealKey,
      custom_name: value, recipe_id: recipeId,
    }
    if (existing) {
      await supabase.from('menu_items').update(payload).eq('id', existing.id)
      setMenu(p => ({ ...p, [key]: { ...existing, ...payload } }))
    } else {
      const { data } = await supabase.from('menu_items').insert(payload).select().single()
      if (data) setMenu(p => ({ ...p, [key]: data }))
    }
    setModal(null)
  }

  async function clearCell(key, e) {
    e.stopPropagation()
    const existing = menu[key]
    if (existing) {
      await supabase.from('menu_items').delete().eq('id', existing.id)
      setMenu(p => { const n = { ...p }; delete n[key]; return n })
    }
  }

  async function addToCalendar() {
    const entries = Object.values(menu)
    if (!entries.length) { showToast('El menú está vacío'); return }
    const tasks = entries.map(e => {
      const meal = MEALS.find(m => m.key === e.meal_type)
      const day = new Date(weekStart)
      day.setDate(day.getDate() + e.day_of_week)
      day.setHours(meal?.hour ?? 12, 0, 0, 0)
      const end = new Date(day); end.setHours(day.getHours() + 1)
      return {
        project_id: project.id,
        title: `${meal?.icon ?? ''} ${e.custom_name}`,
        start_time: day.toISOString(),
        end_time: end.toISOString(),
        all_day: false,
        color: '#f97316',
        recurrence: 'none',
      }
    })
    await supabase.from('calendar_tasks').insert(tasks)
    showToast(`📅 ${tasks.length} eventos añadidos al calendario`)
  }

  async function addIngredientsToList() {
    const recipeIds = Object.values(menu).filter(e => e.recipe_id).map(e => e.recipe_id)
    if (!recipeIds.length) { showToast('No hay recetas enlazadas en el menú'); return }
    const { data } = await supabase.from('recipes').select('ingredients').in('id', [...new Set(recipeIds)])
    if (!data) return
    const items = data.flatMap(r => Array.isArray(r.ingredients) ? r.ingredients : [])
      .map(ing => ({
        project_id: project.id,
        name: typeof ing === 'string' ? ing : (ing.name ?? ''),
        quantity: typeof ing === 'object' ? (ing.quantity ?? null) : null,
        unit: typeof ing === 'object' ? (ing.unit ?? null) : null,
        category: 'otros', store: 'General',
      })).filter(i => i.name)
    if (items.length) {
      await supabase.from('shopping_items').insert(items)
      showToast(`🛒 ${items.length} ingredientes añadidos a la lista`)
    }
  }

  const today = new Date()
  const todayDow = (today.getDay() + 6) % 7
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d
  })
  const isCurrentWeek = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd') === weekStart
  const weekLabel = `${format(weekDates[0], "d MMM", { locale: es })} – ${format(weekDates[6], "d MMM", { locale: es })}`

  return (
    <ModuleShell project={project} modules={modules}>
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 20px', borderBottom:'1px solid var(--border)', flexShrink:0, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={() => shiftWeek(-1)} style={{ width:28, height:28, borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text-muted)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>‹</button>
          <span style={{ fontSize:13, fontWeight:600, color:'var(--text)', minWidth:150, textAlign:'center' }}>{weekLabel}</span>
          <button onClick={() => shiftWeek(1)} style={{ width:28, height:28, borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text-muted)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11 }}>›</button>
        </div>
        {!isCurrentWeek && (
          <button onClick={() => { setWeekStart(format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')); setMenu({}) }}
            style={{ fontSize:11, color:'var(--accent)', background:'none', border:'1px solid var(--border)', borderRadius:7, padding:'4px 10px', cursor:'pointer' }}>
            Esta semana
          </button>
        )}
        <div style={{ display:'flex', gap:6, marginLeft:'auto' }}>
          <button onClick={addToCalendar}
            style={{ padding:'6px 14px', borderRadius:9, background:'#3b82f6', color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
            📅 Añadir al calendario
          </button>
          <button onClick={addIngredientsToList}
            style={{ padding:'6px 14px', borderRadius:9, border:'1px solid var(--border)', background:'none', color:'var(--text-muted)', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5, transition:'all .15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            🛒 Añadir a la lista
          </button>
        </div>
      </div>

      {/* Grid + panel */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>
          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'80px repeat(7,1fr)', gap:6, marginBottom:10 }}>
            <div />
            {DAYS_SHORT.map((d, i) => (
              <div key={i} style={{
                textAlign:'center', fontSize:11, fontWeight:600, padding:'4px 0', borderRadius:7,
                color: i === todayDow && isCurrentWeek ? 'var(--accent)' : 'var(--text-faint)',
                background: i === todayDow && isCurrentWeek ? 'rgba(249,115,22,.1)' : 'transparent',
              }}>
                <div>{d}</div>
                <div style={{ fontSize:10, fontWeight:400, color:'var(--text-faint)' }}>
                  {format(weekDates[i], 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Meal rows */}
          {MEALS.map(meal => (
            <div key={meal.key} style={{ marginBottom:16 }}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--text-faint)', marginBottom:6 }}>
                {meal.icon} {meal.label}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'80px repeat(7,1fr)', gap:6 }}>
                <div style={{ fontSize:10, color:'var(--text-faint)', alignSelf:'center', fontFamily:'monospace' }}>{String(meal.hour).padStart(2,'0')}:00</div>
                {Array.from({ length: 7 }, (_, dayIdx) => {
                  const key = `${dayIdx}-${meal.key}`
                  const val = menu[key]
                  const isToday = dayIdx === todayDow && isCurrentWeek
                  return (
                    <div key={dayIdx}
                      onClick={() => { setEditVal(val?.custom_name ?? ''); setModal({ dayIdx, mealKey: meal.key, key }) }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = val ? 'var(--border)' : isToday ? 'rgba(249,115,22,.4)' : 'var(--border)'}
                      style={{
                        borderRadius:10,
                        border:`1px ${val ? 'solid' : 'dashed'} ${isToday && !val ? 'rgba(249,115,22,.4)' : 'var(--border)'}`,
                        minHeight:52, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                        cursor:'pointer', transition:'all .15s', padding:6, position:'relative',
                        background: val ? 'var(--bg-card)' : isToday ? 'rgba(249,115,22,.04)' : 'transparent',
                      }}
                    >
                      {val ? (
                        <>
                          <div style={{ fontSize:11, fontWeight:600, color:'var(--text)', textAlign:'center', lineHeight:1.3 }}>{val.custom_name}</div>
                          <button
                            onClick={e => clearCell(key, e)}
                            style={{ position:'absolute', top:3, right:3, width:14, height:14, borderRadius:'50%', background:'#ef4444', color:'#fff', fontSize:9, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity .15s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                          >×</button>
                        </>
                      ) : (
                        <div style={{ fontSize:18, color:'var(--text-faint)' }}>+</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations sidebar */}
        <div style={{ width:240, borderLeft:'1px solid var(--border)', overflowY:'auto', padding:16, flexShrink:0 }}>
          <button
            onClick={() => showToast('✨ Generando menú con IA...')}
            style={{ width:'100%', padding:10, borderRadius:10, background:'linear-gradient(135deg,#8b5cf6,#3b82f6)', color:'#fff', border:'none', fontSize:12, fontWeight:700, cursor:'pointer', marginBottom:12, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            ✨ IA: rellenar semana
          </button>
          <div style={{ fontSize:12, fontWeight:700, color:'var(--text)', marginBottom:8 }}>⭐ Sugerencias</div>
          <div style={{ fontSize:10, color:'var(--text-faint)', marginBottom:8 }}>Basadas en tus recetas guardadas</div>
          {recipes.slice(0, 6).map(r => (
            <div key={r.id}
              onClick={() => { if (modal) setEditVal(r.title); else showToast(`Selecciona un slot y elige "${r.title}"`) }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              style={{ padding:'10px 12px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-card)', marginBottom:6, cursor:'pointer', transition:'all .15s' }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{r.title}</div>
            </div>
          ))}
          {recipes.length === 0 && (
            <div style={{ fontSize:11, color:'var(--text-faint)', textAlign:'center', padding:'20px 0' }}>
              Añade recetas para ver sugerencias
            </div>
          )}
        </div>
      </div>

      {/* Slot modal */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', backdropFilter:'blur(4px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:18, padding:24, width:'100%', maxWidth:400, boxShadow:'0 8px 24px rgba(0,0,0,.15)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontWeight:700, fontSize:15, color:'var(--text)' }}>
                {MEALS.find(m => m.key === modal.mealKey)?.icon} {MEALS.find(m => m.key === modal.mealKey)?.label} — {DAYS_SHORT[modal.dayIdx]}
              </div>
              <button onClick={() => setModal(null)} style={{ background:'none', border:'none', color:'var(--text-faint)', cursor:'pointer', fontSize:18 }}>×</button>
            </div>
            <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && editVal.trim() && saveCell(editVal.trim())}
              placeholder="Plato o receta..."
              style={{ width:'100%', padding:'9px 12px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg)', color:'var(--text)', fontSize:13, outline:'none', marginBottom:10 }} />
            {recipes.length > 0 && (
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--text-faint)', marginBottom:6 }}>O elige de tus recetas</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {recipes.slice(0, 8).map(r => (
                    <button key={r.id} onClick={() => saveCell(r.title, r.id)}
                      style={{ padding:'4px 10px', borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-muted)', fontSize:11, cursor:'pointer', transition:'all .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                      {r.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button onClick={() => setModal(null)} style={{ padding:'7px 16px', borderRadius:9, background:'none', border:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer' }}>Cancelar</button>
              <button onClick={() => editVal.trim() && saveCell(editVal.trim())} disabled={!editVal.trim()}
                style={{ padding:'7px 18px', borderRadius:9, background:'var(--accent)', color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', opacity: editVal.trim() ? 1 : .4 }}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', background:'#09090b', color:'#fff', padding:'10px 18px', borderRadius:999, fontSize:12, fontWeight:500, zIndex:500 }}>
          {toast}
        </div>
      )}
    </div>
    </ModuleShell>
  )
}
