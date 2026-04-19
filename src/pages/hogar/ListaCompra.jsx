import { useState, useEffect } from 'react'
import { startOfWeek, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const MEAL_TYPES = ['Desayuno', 'Comida', 'Cena']
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const CATEGORIES = ['general', 'frutas', 'verduras', 'carnes', 'lácteos', 'limpieza', 'otros']

function ShoppingList({ user }) {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [newQty, setNewQty] = useState('')
  const [category, setCategory] = useState('general')

  useEffect(() => {
    supabase
      .from('shopping_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setItems(data) })
  }, [user.id])

  async function addItem(e) {
    e.preventDefault()
    if (!newItem.trim()) return
    const { data, error } = await supabase
      .from('shopping_items')
      .insert({ name: newItem.trim(), quantity: newQty.trim(), category, user_id: user.id })
      .select()
      .single()
    if (!error && data) {
      setItems(prev => [...prev, data])
      setNewItem('')
      setNewQty('')
    }
  }

  async function toggleItem(id, checked) {
    await supabase.from('shopping_items').update({ checked: !checked }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !checked } : i))
  }

  async function deleteItem(id) {
    await supabase.from('shopping_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  async function clearChecked() {
    const checkedIds = items.filter(i => i.checked).map(i => i.id)
    if (!checkedIds.length) return
    await supabase.from('shopping_items').delete().in('id', checkedIds)
    setItems(prev => prev.filter(i => !i.checked))
  }

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catItems = items.filter(i => i.category === cat)
    if (catItems.length) acc[cat] = catItems
    return acc
  }, {})

  const checkedCount = items.filter(i => i.checked).length

  return (
    <div>
      <form onSubmit={addItem} className="flex gap-2 mb-6 flex-wrap">
        <input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          placeholder="Añadir producto..."
          className="flex-1 min-w-32 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
            text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none
            focus:border-[var(--accent)] transition-colors"
        />
        <input
          value={newQty}
          onChange={e => setNewQty(e.target.value)}
          placeholder="Cantidad"
          className="w-24 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
            text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none
            focus:border-[var(--accent)] transition-colors"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
            text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium
            hover:opacity-90 transition-opacity"
        >
          Añadir
        </button>
      </form>

      {checkedCount > 0 && (
        <button
          onClick={clearChecked}
          className="mb-4 text-sm text-[var(--text-muted)] hover:text-red-500 transition-colors"
        >
          Limpiar {checkedCount} marcados
        </button>
      )}

      {Object.entries(grouped).map(([cat, catItems]) => (
        <div key={cat} className="mb-4">
          <h3 className="text-xs font-semibold tracking-widest uppercase text-[var(--text-faint)] mb-2">
            {cat}
          </h3>
          <ul className="flex flex-col gap-1">
            {catItems.map(item => (
              <li
                key={item.id}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[var(--bg-card)]
                  border border-[var(--border)] group"
              >
                <button
                  onClick={() => toggleItem(item.id, item.checked)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                    transition-colors ${item.checked
                      ? 'bg-[var(--accent)] border-[var(--accent)]'
                      : 'border-[var(--border)] hover:border-[var(--accent)]'
                    }`}
                >
                  {item.checked && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>
                <span className={`flex-1 text-sm ${item.checked ? 'line-through text-[var(--text-faint)]' : 'text-[var(--text)]'}`}>
                  {item.name}
                  {item.quantity && <span className="text-[var(--text-faint)] ml-2">{item.quantity}</span>}
                </span>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-faint)]
                    hover:text-red-500 transition-all text-lg leading-none"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {items.length === 0 && (
        <p className="text-[var(--text-faint)] text-sm text-center py-12">
          Lista vacía — añade el primer producto arriba
        </p>
      )}
    </div>
  )
}

function MenuSemanal({ user }) {
  const [menu, setMenu] = useState({})
  const [weekStart, setWeekStart] = useState(() =>
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  )
  const [editing, setEditing] = useState(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    supabase
      .from('weekly_menus')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .then(({ data }) => {
        if (data) {
          const map = {}
          data.forEach(entry => {
            map[`${entry.day}-${entry.meal_type}`] = entry
          })
          setMenu(map)
        }
      })
  }, [user.id, weekStart])

  function prevWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(format(d, 'yyyy-MM-dd'))
  }

  function nextWeek() {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(format(d, 'yyyy-MM-dd'))
  }

  async function saveCell(day, mealType, recipeName) {
    const key = `${day}-${mealType}`
    const existing = menu[key]
    if (existing) {
      await supabase.from('weekly_menus').update({ recipe_name: recipeName }).eq('id', existing.id)
      setMenu(prev => ({ ...prev, [key]: { ...existing, recipe_name: recipeName } }))
    } else {
      const { data } = await supabase
        .from('weekly_menus')
        .insert({ user_id: user.id, day, meal_type: mealType, recipe_name: recipeName, week_start: weekStart })
        .select()
        .single()
      if (data) setMenu(prev => ({ ...prev, [key]: data }))
    }
    setEditing(null)
  }

  async function clearCell(day, mealType) {
    const key = `${day}-${mealType}`
    const existing = menu[key]
    if (existing) {
      await supabase.from('weekly_menus').delete().eq('id', existing.id)
      setMenu(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const weekDates = DAYS.map((_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return format(d, 'd MMM', { locale: es })
  })

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={prevWeek} className="p-2 rounded-lg border border-[var(--border)]
          text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors">
          ←
        </button>
        <span className="text-sm text-[var(--text-muted)]">
          Semana del {format(new Date(weekStart), "d 'de' MMMM", { locale: es })}
        </span>
        <button onClick={nextWeek} className="p-2 rounded-lg border border-[var(--border)]
          text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-colors">
          →
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left py-2 pr-4 text-xs font-semibold text-[var(--text-faint)] uppercase tracking-widest w-24">
                Comida
              </th>
              {DAYS.map((day, i) => (
                <th key={day} className="text-center py-2 px-2 text-xs font-semibold text-[var(--text-muted)]">
                  <div>{day.slice(0, 3)}</div>
                  <div className="text-[var(--text-faint)] font-normal">{weekDates[i]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEAL_TYPES.map(meal => (
              <tr key={meal}>
                <td className="py-2 pr-4 text-xs text-[var(--text-faint)] font-medium">{meal}</td>
                {DAYS.map(day => {
                  const key = `${day}-${meal}`
                  const entry = menu[key]
                  const isEditing = editing === key
                  return (
                    <td key={day} className="py-1 px-1">
                      {isEditing
                        ? (
                          <input
                            autoFocus
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => editValue.trim() ? saveCell(day, meal, editValue.trim()) : setEditing(null)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') editValue.trim() ? saveCell(day, meal, editValue.trim()) : setEditing(null)
                              if (e.key === 'Escape') setEditing(null)
                            }}
                            className="w-full px-2 py-1.5 rounded border border-[var(--accent)] bg-[var(--bg)]
                              text-xs text-[var(--text)] outline-none"
                          />
                        )
                        : (
                          <div
                            onClick={() => { setEditing(key); setEditValue(entry?.recipe_name ?? '') }}
                            className={`min-h-[36px] px-2 py-1.5 rounded border cursor-pointer text-xs
                              transition-colors group relative ${
                              entry
                                ? 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] hover:border-[var(--accent)]'
                                : 'border-dashed border-[var(--border)] text-[var(--text-faint)] hover:border-[var(--accent)] hover:text-[var(--text-muted)]'
                            }`}
                          >
                            {entry?.recipe_name ?? '+'}
                            {entry && (
                              <button
                                onClick={e => { e.stopPropagation(); clearCell(day, meal) }}
                                className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100
                                  text-[var(--text-faint)] hover:text-red-500 text-base leading-none"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        )
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

export default function ListaCompra() {
  const { user } = useAuth()
  const [tab, setTab] = useState('lista')

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[var(--text)] mb-6">Lista & Menú</h1>

      <div className="flex gap-1 mb-8 p-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] w-fit">
        {[{ id: 'lista', label: '🛒 Lista de la compra' }, { id: 'menu', label: '📋 Menú semanal' }].map(t => (
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

      {tab === 'lista' ? <ShoppingList user={user} /> : <MenuSemanal user={user} />}
    </div>
  )
}
