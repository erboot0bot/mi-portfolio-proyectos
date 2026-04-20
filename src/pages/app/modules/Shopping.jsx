import { useState, useEffect } from 'react'
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
