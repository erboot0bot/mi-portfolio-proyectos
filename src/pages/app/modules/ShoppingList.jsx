import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import ModuleShell from './ModuleShell'
import ModuleTopNav from '../../../components/ModuleTopNav'
import { usePWAManifest } from '../../../hooks/usePWAManifest'
import { itemFromDb, itemToDb } from '../../../utils/itemTransformers'
import { computeConsumptionUpdate } from '../../../utils/consumptionUtils'
import { useMode } from '../../../contexts/ModeContext'
import { demoRead, demoWrite } from '../../../data/demo/index.js'
import { addCalendarEvent } from '../../../utils/calendarUtils'

const CATEGORIES = [
  { id: 'frutas',   label: 'Frutas & Verduras', icon: '🥦' },
  { id: 'carnes',   label: 'Carnes & Pescados',  icon: '🥩' },
  { id: 'lacteos',  label: 'Lácteos & Huevos',   icon: '🥛' },
  { id: 'pan',      label: 'Pan & Cereales',     icon: '🍞' },
  { id: 'bebidas',  label: 'Bebidas',            icon: '🧃' },
  { id: 'limpieza', label: 'Limpieza',           icon: '🧹' },
  { id: 'otros',    label: 'Otros',              icon: '📦' },
]
const STORES = ['Mercadona', 'Lidl', 'Carrefour', 'La Sirena', 'General', 'Otros']

const STORE_COLORS = {
  'Mercadona': '#ee7c00',
  'Lidl':      '#0050aa',
  'Carrefour': '#0061a7',
  'La Sirena': '#007a3d',
  'General':   '#64748b',
  'Otros':     '#64748b',
}

// ── Store tabs + ⚙️ ───────────────────────────────────────────────
function StoreTabs({ activeStore, onChange, onSettings, compact }) {
  return (
    <div style={{
      display: 'flex', gap: 6, alignItems: 'center', overflowX: 'auto',
      padding: compact ? '8px 12px' : '8px 0',
      background: compact ? 'var(--bg-card)' : 'transparent',
      borderBottom: compact ? '1px solid var(--border)' : 'none',
    }}>
      {STORES.map(s => (
        <button key={s} onClick={() => onChange(s)} style={{
          padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 500,
          border: `1px solid ${activeStore === s ? 'var(--accent)' : 'var(--border)'}`,
          background: activeStore === s ? 'var(--accent)' : 'transparent',
          color: activeStore === s ? '#fff' : 'var(--text-muted)',
          cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s', flexShrink: 0,
        }}>{s}</button>
      ))}
      <button
        onClick={onSettings}
        title="Supermercado por defecto"
        style={{
          background: 'none', border: '1px solid var(--border)', borderRadius: 999,
          width: 28, height: 28, display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', flexShrink: 0, fontSize: 14,
        }}
      >⚙️</button>
    </div>
  )
}

// ── Default store modal ───────────────────────────────────────────
function DefaultStoreModal({ current, onSelect, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
    >
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, minWidth: 240, border: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Supermercado por defecto</div>
        {STORES.map(s => (
          <button key={s} onClick={() => onSelect(s)} style={{
            display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px',
            borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13,
            background: current === s ? 'rgba(249,115,22,.15)' : 'transparent',
            color: current === s ? 'var(--accent)' : 'var(--text)',
            fontWeight: current === s ? 700 : 400, marginBottom: 2,
          }}>
            {current === s ? '✓ ' : '   '}{s}
          </button>
        ))}
        <button onClick={onClose} style={{ marginTop: 12, width: '100%', padding: 8, borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 12 }}>
          Cerrar
        </button>
      </div>
    </div>
  )
}

// ── Desktop active item ───────────────────────────────────────────
function DesktopItem({ item, onToggle, onDelete, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart && onDragStart(item.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)',
        background: 'var(--bg-card)', marginBottom: 5, cursor: 'grab',
        transition: 'all .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        title="Marcar como comprado"
        style={{
          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
          border: '2px solid var(--border)', background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', padding: 0,
        }}
      />
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.name}</span>
      {item.owner_id === 'maria' && item.owner_name && (
        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, flexShrink: 0, background: 'rgba(139,92,246,.15)', color: '#8b5cf6', fontWeight: 700 }}>
          {item.owner_name}
        </span>
      )}
      {item.quantity && <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'monospace' }}>{item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>}
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        title="Eliminar"
        style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 16, padding: '0 4px', transition: 'color .15s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
      >×</button>
    </div>
  )
}

// ── Desktop cart item (checked) ───────────────────────────────────
function CartItem({ item, onUncheck, onDelete }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,.06)',
      marginBottom: 3, opacity: 0.7,
    }}>
      <button
        onClick={() => onUncheck(item.id)}
        title="Devolver a la lista"
        style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 14, padding: 0, flexShrink: 0 }}
      >↩</button>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, textDecoration: 'line-through', color: 'var(--text-faint)' }}>{item.name}</span>
      {item.quantity && (
        <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'monospace' }}>
          {item.quantity}{item.unit ? ` ${item.unit}` : ''}
        </span>
      )}
      <button
        onClick={() => onDelete(item.id)}
        title="Eliminar"
        style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 16, padding: '0 4px', transition: 'color .15s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
      >×</button>
    </div>
  )
}

// ── Swipeable item (mobile) ───────────────────────────────────────
function SwipeItem({ item, onToggle, onDelete }) {
  const [offset, setOffset] = useState(0)
  const [active, setActive] = useState(false)
  const [axis, setAxis] = useState(null)
  const startX = useRef(0)
  const startY = useRef(0)

  function onPointerDown(e) {
    startX.current = e.clientX
    startY.current = e.clientY
    setActive(true)
    setAxis(null)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function onPointerMove(e) {
    if (!active) return
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current
    if (!axis) {
      if (Math.abs(dx) > Math.abs(dy) + 5) setAxis('x')
      else if (Math.abs(dy) > Math.abs(dx) + 5) setAxis('y')
    }
    if (axis === 'x') {
      e.preventDefault()
      setOffset(Math.max(-140, Math.min(100, dx)))
    }
  }
  function onPointerUp() {
    if (!active) return
    setActive(false)
    if (offset <= -70) {
      setOffset(-500)
      setTimeout(() => onDelete(item.id), 250)
    } else if (offset >= 70) {
      onToggle(item.id)
      setOffset(0)
    } else {
      setOffset(0)
    }
    setAxis(null)
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', margin: '2px 10px', borderRadius: 12 }}>
      {offset > 20  && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, borderRadius: '12px 0 0 12px' }}>✓ Hecho</div>}
      {offset < -20 && <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, borderRadius: '0 12px 12px 0' }}>Borrar ✕</div>}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', borderRadius: 12,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          position: 'relative', zIndex: 2, cursor: 'grab', userSelect: 'none',
          touchAction: axis === 'x' ? 'none' : 'pan-y',
          transform: `translateX(${offset}px)`,
          transition: active ? 'none' : 'transform .2s ease',
        }}
      >
        <div style={{
          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
          border: '2px solid var(--border)', background: 'transparent',
        }} />
        <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{item.name}</span>
        {item.owner_id === 'maria' && item.owner_name && (
          <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 99, flexShrink: 0, background: 'rgba(139,92,246,.15)', color: '#8b5cf6', fontWeight: 700 }}>
            {item.owner_name}
          </span>
        )}
        {item.quantity && (
          <span style={{ fontSize: 12, color: 'var(--text-faint)', fontFamily: 'monospace' }}>
            {item.quantity}{item.unit ? ` ${item.unit}` : ''}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Sugerencias section ───────────────────────────────────────────
function SugerenciasSection({ suggestions, editingFreqId, setEditingFreqId, addSuggestion, dismissSuggestion, updateFrequency }) {
  if (!suggestions.length) return null
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 8px' }}>
        💡 Sugerencias
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {suggestions.map(s => (
          <div
            key={s.product_id}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
              borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {s.product?.name}
              </p>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                {editingFreqId === s.product_id ? (
                  <input
                    type="number" min="1"
                    defaultValue={s.avg_days_between_purchases}
                    autoFocus
                    onBlur={e  => updateFrequency(s.product_id, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter')  updateFrequency(s.product_id, e.target.value)
                      if (e.key === 'Escape') setEditingFreqId(null)
                    }}
                    style={{ width: 52, padding: '2px 6px', borderRadius: 6, border: '1px solid var(--accent)', background: 'var(--bg)', color: 'var(--text)', fontSize: 11, outline: 'none' }}
                  />
                ) : (
                  <button
                    onClick={() => setEditingFreqId(s.product_id)}
                    title="Editar frecuencia"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)', padding: 0, textDecoration: 'underline dotted' }}
                  >
                    cada {s.avg_days_between_purchases} días
                  </button>
                )}
                <span style={{
                  fontSize: 10, padding: '1px 6px', borderRadius: 999, flexShrink: 0,
                  background: s.confidence === 'alta'  ? 'rgba(16,185,129,.12)'
                             : s.confidence === 'media' ? 'rgba(245,158,11,.12)'
                             : 'rgba(156,163,175,.12)',
                  color: s.confidence === 'alta'  ? '#10b981'
                       : s.confidence === 'media' ? '#f59e0b'
                       : 'var(--text-faint)',
                }}>
                  {s.confidence}
                </span>
              </div>
            </div>

            <button
              onClick={() => addSuggestion(s)}
              style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, flexShrink: 0 }}
            >
              + Añadir
            </button>

            <button
              onClick={() => dismissSuggestion(s.product_id)}
              title="No sugerir más"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-faint)', padding: '0 2px', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
            >×</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
export default function ShoppingList() {
  usePWAManifest('shopping')
  const { app, modules } = useOutletContext()
  const { mode } = useMode()
  const appType = app.id.replace('demo-', '')
  const [items, setItems]               = useState([])
  const [showDefaultModal, setShowDefaultModal] = useState(false)
  const [isMobile, setIsMobile]         = useState(window.innerWidth < 640)
  const [activeStore, setActiveStore]   = useState(
    () => localStorage.getItem('sl_default_store') || 'Mercadona'
  )
  const [query, setQuery]     = useState('')
  const [newName, setNewName] = useState('')
  const [newQty, setNewQty]   = useState('')
  const [newUnit, setNewUnit] = useState('')
  const [newCat, setNewCat]   = useState('otros')
  const [toast, setToast]     = useState(null)
  const [suggestions,   setSuggestions]   = useState([])
  const [editingFreqId, setEditingFreqId] = useState(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [planForm, setPlanForm] = useState({ fecha: new Date().toISOString().slice(0, 10), hora: '10:00' })
  const [colNames, setColNames] = useState(STORES)
  const [dragItem, setDragItem] = useState(null)
  const [showFAB, setShowFAB] = useState(false)
  const [fabStore, setFabStore] = useState(() => localStorage.getItem('sl_default_store') || 'Mercadona')
  const [fabName, setFabName] = useState('')
  const [fabQty, setFabQty] = useState('')

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Persiste el super activo en localStorage para que sobreviva F5
  useEffect(() => {
    localStorage.setItem('sl_default_store', activeStore)
  }, [activeStore])

  useEffect(() => {
    if (mode === 'demo') {
      setItems(demoRead(appType, 'items_supermercado').map(itemFromDb))
      return
    }
    let cancelled = false
    supabase.from('items')
      .select('*')
      .eq('app_id', app.id)
      .eq('module', 'supermercado')
      .order('created_at')
      .then(({ data }) => {
        if (cancelled) return
        if (data) setItems(data.map(itemFromDb))
      })

    supabase
      .from('product_consumption')
      .select('*, product:products(name)')
      .eq('app_id', app.id)
      .not('avg_days_between_purchases', 'is', null)
      .lte('estimated_next_purchase', (() => {
        const h = new Date(); h.setDate(h.getDate() + 7); return h.toISOString().slice(0, 10)
      })())
      .order('estimated_next_purchase')
      .then(({ data }) => {
        if (cancelled) return
        setSuggestions(data ?? [])
      })

    return () => { cancelled = true }
  }, [app.id, mode, appType])

  async function loadSuggestions() {
    const horizon = new Date()
    horizon.setDate(horizon.getDate() + 7)
    const horizonStr = horizon.toISOString().slice(0, 10)

    const { data } = await supabase
      .from('product_consumption')
      .select('*, product:products(name)')
      .eq('app_id', app.id)
      .not('avg_days_between_purchases', 'is', null)
      .lte('estimated_next_purchase', horizonStr)
      .order('estimated_next_purchase')

    setSuggestions(data ?? [])
  }

  async function addSuggestion(suggestion) {
    const payload = {
      app_id:   app.id,
      module:   'supermercado',
      type:     'product',
      title:    suggestion.product?.name ?? '',
      metadata: { quantity: null, unit: '', category: 'otros', store: activeStore, price_unit: null },
    }
    const { data, error } = await supabase.from('items').insert(payload).select().single()
    if (error) { showToast('Error al añadir el producto'); return }
    if (data) {
      setItems(p => [...p, itemFromDb(data)])
      setSuggestions(p => p.filter(s => s.product_id !== suggestion.product_id))
      showToast(`${suggestion.product?.name} añadido ✓`)
    }
  }

  async function dismissSuggestion(productId) {
    const snooze = new Date()
    snooze.setDate(snooze.getDate() + 30)
    const snoozeStr = snooze.toISOString().slice(0, 10)

    await supabase.from('product_consumption')
      .update({
        estimated_next_purchase: snoozeStr,
        updated_at:              new Date().toISOString(),
      })
      .eq('product_id', productId)
      .eq('app_id', app.id)
    setSuggestions(p => p.filter(s => s.product_id !== productId))
  }

  async function updateFrequency(productId, newDaysStr) {
    const days = parseInt(newDaysStr)
    if (!days || days < 1) { setEditingFreqId(null); dismissSuggestion(productId); return }

    const suggestion = suggestions.find(s => s.product_id === productId)
    if (!suggestion || !suggestion.last_purchase_date) { setEditingFreqId(null); return }

    const newEstimated = new Date(suggestion.last_purchase_date)
    newEstimated.setDate(newEstimated.getDate() + days)
    const newEstimatedStr = newEstimated.toISOString().slice(0, 10)

    const { error } = await supabase.from('product_consumption')
      .update({
        avg_days_between_purchases: days,
        estimated_next_purchase:    newEstimatedStr,
        updated_at:                 new Date().toISOString(),
      })
      .eq('product_id', productId)
      .eq('app_id', app.id)

    if (error) {
      // Keep editor open so user can retry
      showToast('Error al guardar la frecuencia')
      return
    }

    setEditingFreqId(null)
    setSuggestions(p => p.map(s =>
      s.product_id === productId
        ? { ...s, avg_days_between_purchases: days, estimated_next_purchase: newEstimatedStr }
        : s
    ))
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2600) }

  function planificarCompra() {
    const start = new Date(`${planForm.fecha}T${planForm.hora}:00`)
    const end   = new Date(start.getTime() + 60 * 60 * 1000)
    addCalendarEvent(appType, {
      event_type: 'shopping_trip',
      title: `🛒 Compra ${activeStore}`,
      start_time: start.toISOString(),
      end_time:   end.toISOString(),
      metadata: { store: activeStore },
    })
    setShowPlanModal(false)
    showToast('Compra añadida al calendario ✓')
  }

  async function toggleItem(id) {
    const item = items.find(i => i.id === id)
    if (!item) return
    const checked = !item.checked
    const checked_at = checked ? new Date().toISOString() : null
    if (mode === 'demo') {
      const raw = demoRead(appType, 'items_supermercado')
      demoWrite(appType, 'items_supermercado', raw.map(r => r.id === id ? { ...r, checked, checked_at } : r))
      setItems(p => p.map(i => i.id === id ? { ...i, checked, checked_at } : i))
      return
    }
    await supabase.from('items').update({ checked, checked_at }).eq('id', id)
    setItems(p => p.map(i => i.id === id ? { ...i, checked, checked_at } : i))
  }

  async function deleteItem(id) {
    setItems(p => p.filter(i => i.id !== id))
    if (mode === 'demo') {
      const raw = demoRead(appType, 'items_supermercado')
      demoWrite(appType, 'items_supermercado', raw.filter(r => r.id !== id))
      return
    }
    await supabase.from('items').delete().eq('id', id)
  }

  function handleDefaultStoreSelect(store) {
    localStorage.setItem('sl_default_store', store)
    setActiveStore(store)
    setShowDefaultModal(false)
  }

  async function updateConsumptionForItem(title, purchaseDateStr) {
    // Buscar producto en catálogo por nombre (case-insensitive)
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .ilike('name', title.trim())
      .maybeSingle()
    if (!product) return // item sin producto en catálogo → ignorar

    // Cargar registro actual de consumo
    const { data: existing } = await supabase
      .from('product_consumption')
      .select('last_purchase_date, avg_days_between_purchases')
      .eq('product_id', product.id)
      .eq('app_id', app.id)
      .maybeSingle()

    const update = computeConsumptionUpdate(existing, purchaseDateStr)

    await supabase.from('product_consumption').upsert({
      product_id: product.id,
      app_id:     app.id,
      ...update,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'product_id,app_id' })
  }

  async function saveCart() {
    const cartItems = items.filter(i => i.checked)
      .sort((a, b) => new Date(b.checked_at || 0) - new Date(a.checked_at || 0))
    if (!cartItems.length) return

    const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

    if (mode === 'demo') {
      const ids = cartItems.map(i => i.id)
      const raw = demoRead(appType, 'items_supermercado')
      demoWrite(appType, 'items_supermercado', raw.map(r => ids.includes(r.id) ? { ...r, checked: false, checked_at: null } : r))
      setItems(p => p.map(i => ids.includes(i.id) ? { ...i, checked: false, checked_at: null } : i))
      showToast(`✅ Compra guardada — ${activeStore} · ${dateStr} · ${cartItems.length} productos`)
      return
    }

    const itemsPayload = cartItems.map(i => ({
      name: i.name,
      category: i.category ?? null,
      store: i.store ?? null,
      quantity: i.quantity ?? null,
      unit: i.unit ?? null,
      price_unit: i.price_unit ?? null,
      checked_at: i.checked_at,
    }))

    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('purchase_history').insert({
      user_id: user?.id,
      store: activeStore,
      items: itemsPayload,
      item_count: cartItems.length,
    })
    if (error) { showToast('Error al guardar la compra'); return }

    // Actualizar product_consumption (errores silenciosos — no bloquean el flujo)
    const purchaseDate = new Date().toISOString().slice(0, 10)
    await Promise.allSettled(
      cartItems.map(item => updateConsumptionForItem(item.name, purchaseDate))
    )

    const ids = cartItems.map(i => i.id)
    await supabase.from('items').update({ checked: false, checked_at: null }).in('id', ids)
    setItems(p => p.map(i => ids.includes(i.id) ? { ...i, checked: false, checked_at: null } : i))
    loadSuggestions()
    showToast(`✅ Compra guardada — ${activeStore} · ${dateStr} · ${cartItems.length} productos`)
  }

  async function addItem(e) {
    if (e) e.preventDefault()
    if (!newName.trim()) return
    const payload = itemToDb(app.id, newName.trim(), newQty ? Number(newQty) : null, newUnit || '', newCat, activeStore)
    if (mode === 'demo') {
      const newRow = { ...payload, id: crypto.randomUUID(), checked: false, checked_at: null }
      const raw = demoRead(appType, 'items_supermercado')
      demoWrite(appType, 'items_supermercado', [...raw, newRow])
      setItems(p => [...p, itemFromDb(newRow)])
      setNewName(''); setNewQty(''); setNewUnit('')
      showToast('Añadido ✓')
      return
    }
    const { data, error } = await supabase.from('items').insert(payload).select().single()
    if (!error && data) {
      setItems(p => [...p, itemFromDb(data)])
      setNewName(''); setNewQty(''); setNewUnit('')
      showToast('Añadido ✓')
    }
  }

  const pending = items.filter(i => !i.checked)
  const inCart  = items.filter(i => i.checked)
    .sort((a, b) => new Date(b.checked_at || 0) - new Date(a.checked_at || 0))
  const pct = items.length ? Math.round(inCart.length / items.length * 100) : 0

  // ── Mobile view ───────────────────────────────────────────────
  if (isMobile) {
    const storeItems = pending.filter(i => activeStore === 'General' || i.store === activeStore)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
        <ModuleTopNav
          title="Lista de la compra"
          subtitle={`${inCart.length} / ${items.length} productos`}
          rightAction={{ icon: '⚙️', onClick: () => setShowDefaultModal(true) }}
          tabs={STORES.map(s => ({ key: s, label: s === 'La Sirena' ? 'Sirena' : s }))}
          activeTab={activeStore}
          onTabChange={setActiveStore}
        />
        <div style={{ padding: '4px 14px 6px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: '#10b981', borderRadius: 2, transition: 'width .3s ease' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 2px 0', fontFamily: 'var(--font-mono)' }}>
            <strong>{inCart.length}</strong> en el carro · <strong>{pending.length}</strong> pendientes
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
          <div style={{ margin: '8px 10px 0' }}>
            <SugerenciasSection
              suggestions={suggestions}
              editingFreqId={editingFreqId}
              setEditingFreqId={setEditingFreqId}
              addSuggestion={addSuggestion}
              dismissSuggestion={dismissSuggestion}
              updateFrequency={updateFrequency}
            />
          </div>

          {/* Lista pendiente — plana, sin cabeceras de categoría */}
          {storeItems.map(item => (
            <SwipeItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
          ))}

          {storeItems.length === 0 && inCart.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-faint)', fontSize: 13 }}>
              Sin productos en {activeStore}
            </div>
          )}

          {/* Carrito */}
          {inCart.length > 0 && (
            <div style={{ margin: '16px 10px 0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px' }}>
                🧺 En el carro
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: 99, color: 'var(--text-muted)' }}>{inCart.length}</span>
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
                {inCart.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <button type="button" onClick={() => toggleItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: 0, flexShrink: 0 }}>↶</button>
                    <span style={{ flex: 1, fontSize: 14, textDecoration: 'line-through', color: 'var(--text-faint)' }}>{item.name}</span>
                    {item.quantity && <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-faint)' }}>{item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>}
                  </div>
                ))}
                <div style={{ padding: '14px 16px' }}>
                  <button type="button" onClick={saveCart} style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700, boxShadow: 'var(--shadow-cta)' }}>
                    Guardar compra
                  </button>
                </div>
              </div>
            </div>
          )}
          {inCart.length === 0 && storeItems.length === 0 && (
            <div style={{ margin: '16px 10px 0', padding: '24px', border: '1px dashed var(--border)', borderRadius: 14, textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
              Marca productos en la lista y aparecerán aquí.
            </div>
          )}

          <div style={{ height: 80 }} />
        </div>

        {/* FAB */}
        <button
          type="button"
          onClick={() => { setFabStore(activeStore); setShowFAB(true) }}
          aria-label="Añadir producto"
          style={{
            position: 'fixed', bottom: 20, right: 20, width: 56, height: 56, borderRadius: '50%',
            background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 28, cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(254,112,0,0.4)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >+</button>

        {showFAB && (
          <>
            <div onClick={() => setShowFAB(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300 }} />
            <div style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 301,
              background: 'var(--bg-card)', borderRadius: '20px 20px 0 0',
              padding: '12px 20px 32px',
              animation: 'slideUp 0.3s cubic-bezier(.2,.7,.2,1) both',
            }}>
              <style>{`
  @keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
  @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; } }
`}</style>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Añadir producto</div>
              <input value={fabName} onChange={e => setFabName(e.target.value)} placeholder="Nombre del producto *" autoFocus
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 15, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }} />
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input value={fabQty} onChange={e => setFabQty(e.target.value)} placeholder="Cant." type="number" min="0"
                  style={{ flex: 1, padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
                <select value={fabStore} onChange={e => setFabStore(e.target.value)}
                  style={{ flex: 2, padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, outline: 'none' }}>
                  {STORES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowFAB(false)} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 15, cursor: 'pointer', fontWeight: 500 }}>Cancelar</button>
                <button
                  type="button"
                  disabled={!fabName.trim()}
                  onClick={async () => {
                    if (!fabName.trim()) return
                    const payload = itemToDb(app.id, fabName.trim(), fabQty ? Number(fabQty) : null, '', 'otros', fabStore)
                    if (mode === 'demo') {
                      const newRow = { ...payload, id: crypto.randomUUID(), checked: false, checked_at: null }
                      const raw = demoRead(appType, 'items_supermercado')
                      demoWrite(appType, 'items_supermercado', [...raw, newRow])
                      setItems(p => [...p, itemFromDb(newRow)])
                      showToast('Añadido ✓')
                    } else {
                      const { data, error } = await supabase.from('items').insert(payload).select().single()
                      if (!error && data) {
                        setItems(p => [...p, itemFromDb(data)])
                        showToast('Añadido ✓')
                      }
                    }
                    setFabName('')
                    setFabQty('')
                    setShowFAB(false)
                  }}
                  style={{ flex: 2, padding: '13px', borderRadius: 12, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-cta)', opacity: fabName.trim() ? 1 : 0.4 }}
                >Añadir</button>
              </div>
            </div>
          </>
        )}

        {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#09090b', color: '#fff', padding: '10px 18px', borderRadius: 999, fontSize: 12, fontWeight: 500, zIndex: 500, whiteSpace: 'nowrap' }}>{toast}</div>}
        {showDefaultModal && <DefaultStoreModal current={activeStore} onSelect={handleDefaultStoreSelect} onClose={() => setShowDefaultModal(false)} />}
      </div>
    )
  }

  // ── Desktop view ──────────────────────────────────────────────
  // Only show stores that have pending items, plus always show "General"
  const storesWithItems = STORES.filter(s =>
    pending.some(i => i.store === s || (s === 'General' && !STORES.slice(0, -1).includes(i.store)))
  )
  const filteredByQuery = q => !query || q.name.toLowerCase().includes(query.toLowerCase())

  function itemsByStore(store) {
    return pending.filter(i => {
      const match = store === 'General'
        ? (i.store === 'General' || !STORES.slice(0, -1).includes(i.store))
        : i.store === store
      return match && filteredByQuery(i)
    })
  }

  const colCount = Math.max(1, storesWithItems.length)

  return (
    <ModuleShell app={app} modules={modules}>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Top bar: add form + search */}
      <div style={{ padding: '12px 20px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
        <form onSubmit={addItem} style={{ display: 'flex', gap: 8 }}>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="🔍 Buscar..."
            style={{ width: 130, padding: '8px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Añadir producto..."
            style={{ flex: 1, padding: '8px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
          <input value={newQty} onChange={e => setNewQty(e.target.value)} placeholder="Cant." type="number" min="0"
            style={{ width: 70, padding: '8px 10px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
          <select value={activeStore} onChange={e => setActiveStore(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 12, outline: 'none' }}>
            {STORES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" style={{ padding: '8px 16px', borderRadius: 9, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            + Añadir
          </button>
          <button
            type="button"
            onClick={() => setShowPlanModal(true)}
            style={{ padding: '8px 14px', borderRadius: 10, background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}
          >🗓️ Planificar compra</button>
        </form>
      </div>

      {/* One column per store */}
      <div style={{
        flex: 1, overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: `repeat(${colCount}, 1fr)`,
      }}>
        {storesWithItems.map((store, idx) => {
          const storeItems = itemsByStore(store)
          return (
            <div key={store} style={{
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              borderRight: idx < storesWithItems.length - 1 ? '1px solid var(--border)' : 'none',
            }}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = 'var(--accent-light)' }}
              onDragLeave={e => { e.currentTarget.style.background = '' }}
              onDrop={e => {
                e.preventDefault()
                e.currentTarget.style.background = ''
                if (dragItem) {
                  const targetId = dragItem
                  const draggedItem = items.find(i => i.id === targetId)
                  setItems(p => p.map(i => i.id === targetId ? { ...i, store } : i))
                  if (mode === 'demo') {
                    const raw = demoRead(appType, 'items_supermercado')
                    demoWrite(appType, 'items_supermercado', raw.map(r => r.id === targetId ? { ...r, metadata: { ...r.metadata, store } } : r))
                  } else if (draggedItem) {
                    supabase.from('items')
                      .update({ metadata: { quantity: draggedItem.quantity ?? null, unit: draggedItem.unit ?? '', category: draggedItem.category ?? 'otros', store, price_unit: draggedItem.price_unit ?? null } })
                      .eq('id', targetId)
                      .then(() => {})
                  }
                  setDragItem(null)
                }
              }}
            >
              {/* Column header */}
              <div style={{ padding: '14px 16px 10px', flexShrink: 0, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: `${STORE_COLORS[store] ?? '#64748b'}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, color: STORE_COLORS[store] ?? '#64748b',
                }}>
                  {(colNames[STORES.indexOf(store)] ?? store)[0]}
                </div>
                <div
                  contentEditable suppressContentEditableWarning
                  onBlur={e => {
                    const names = [...colNames]
                    names[STORES.indexOf(store)] = e.currentTarget.textContent.trim() || store
                    setColNames(names)
                    e.currentTarget.style.borderColor = 'transparent'
                    e.currentTarget.style.background = 'transparent'
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-subtle)' }}
                  style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', outline: 'none', borderBottom: '1px solid transparent', cursor: 'text', flex: 1, padding: '2px 4px', borderRadius: 4, transition: 'border-color 200ms, background 200ms' }}
                >
                  {colNames[STORES.indexOf(store)] ?? store}
                </div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', flexShrink: 0 }}>{storeItems.length} items</span>
              </div>

              {/* Items */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {storeItems.map(item => (
                  <DesktopItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} onDragStart={setDragItem} />
                ))}
                {storeItems.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-faint)', fontSize: 12 }}>
                    {query ? 'Sin resultados' : '—'}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {storesWithItems.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
            Lista vacía — añade productos arriba
          </div>
        )}
      </div>
    </div>

    {toast && (
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#09090b', color: '#fff', padding: '10px 18px', borderRadius: 999, fontSize: 12, fontWeight: 500, zIndex: 500, whiteSpace: 'nowrap' }}>
        {toast}
      </div>
    )}
    {showDefaultModal && <DefaultStoreModal current={activeStore} onSelect={handleDefaultStoreSelect} onClose={() => setShowDefaultModal(false)} />}
    {showPlanModal && (
      <div onClick={() => setShowPlanModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
        <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, width: 300, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🛒 Planificar compra</h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Supermercado: <strong>{activeStore}</strong></p>
          <label style={{ fontSize: 13 }}>
            Fecha
            <input type="date" aria-label="Fecha" value={planForm.fecha}
              onChange={e => setPlanForm(f => ({ ...f, fecha: e.target.value }))}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }} />
          </label>
          <label style={{ fontSize: 13 }}>
            Hora
            <input type="time" aria-label="Hora" value={planForm.hora}
              onChange={e => setPlanForm(f => ({ ...f, hora: e.target.value }))}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13 }} />
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowPlanModal(false)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
            <button onClick={planificarCompra} disabled={!planForm.fecha || !planForm.hora}
              style={{ flex: 2, padding: '8px 0', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
              Añadir al calendario
            </button>
          </div>
        </div>
      </div>
    )}
    </ModuleShell>
  )
}
