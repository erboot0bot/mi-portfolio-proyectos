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

const CATEGORIES = [
  { id: 'frutas',   label: 'Frutas & Verduras', icon: '🥦' },
  { id: 'carnes',   label: 'Carnes & Pescados',  icon: '🥩' },
  { id: 'lacteos',  label: 'Lácteos & Huevos',   icon: '🥛' },
  { id: 'pan',      label: 'Pan & Cereales',     icon: '🍞' },
  { id: 'bebidas',  label: 'Bebidas',            icon: '🧃' },
  { id: 'limpieza', label: 'Limpieza',           icon: '🧹' },
  { id: 'otros',    label: 'Otros',              icon: '📦' },
]
const STORES = ['Mercadona', 'Lidl', 'Carrefour', 'La Sirena', 'General']

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
function DesktopItem({ item, onToggle, onDelete }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)',
      background: 'var(--bg-card)', marginBottom: 5, transition: 'all .15s',
    }}>
      {/* Círculo: único elemento que marca como comprado */}
      <div
        onClick={() => onToggle(item.id)}
        title="Marcar como comprado"
        style={{
          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
          border: '2px solid var(--border)', background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      />
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.name}</span>
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
  const startX = useRef(0)

  function onPointerDown(e) {
    startX.current = e.clientX
    setActive(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function onPointerMove(e) {
    if (!active) return
    setOffset(Math.max(-120, Math.min(80, e.clientX - startX.current)))
  }
  function onPointerUp() {
    if (!active) return
    setActive(false)
    if (offset < -70)     onToggle(item.id)
    else if (offset > 50) onDelete(item.id)
    setOffset(0)
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', margin: '2px 10px', borderRadius: 12 }}>
      {offset > 20  && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, borderRadius: '12px 0 0 12px' }}>🗑</div>}
      {offset < -20 && <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, borderRadius: '0 12px 12px 0' }}>✓</div>}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => { if (Math.abs(offset) < 5) onToggle(item.id) }}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', borderRadius: 12,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          position: 'relative', zIndex: 2, cursor: 'grab', userSelect: 'none',
          touchAction: 'pan-y',
          transform: `translateX(${offset}px)`,
          transition: active ? 'none' : 'transform .2s ease',
        }}
      >
        <div style={{
          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
          border: '2px solid var(--border)', background: 'transparent',
        }} />
        <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{item.name}</span>
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
  const [activeCat, setActiveCat]       = useState(null)
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

  // ── Shared UI pieces ──────────────────────────────────────────

  const CartSection = ({ compact }) => (
    inCart.length > 0 ? (
      <div style={{ borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', background: '#1c1c1c' }}>
        <div style={{ padding: '10px 16px', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-faint)' }}>
          En el carro ({inCart.length})
        </div>
        {compact
          ? inCart.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
                <button onClick={() => toggleItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 14, padding: 0, flexShrink: 0 }}>↩</button>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, textDecoration: 'line-through', color: 'var(--text-faint)', opacity: 0.7 }}>{item.name}</span>
                <button onClick={() => deleteItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 16, padding: '0 2px' }}>×</button>
              </div>
            ))
          : <div style={{ padding: '0 8px' }}>
              {inCart.map(item => (
                <CartItem key={item.id} item={item} onUncheck={toggleItem} onDelete={deleteItem} />
              ))}
            </div>
        }
        <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
          <button
            onClick={saveCart}
            style={{ width: compact ? '100%' : 'auto', padding: compact ? '10px' : '8px 20px', borderRadius: 9, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >Guardar compra</button>
        </div>
      </div>
    ) : null
  )

  // ── Mobile view ───────────────────────────────────────────────
  if (isMobile) {
    const storeItems = pending.filter(i => activeStore === 'General' || i.store === activeStore)
    const byCat = CATEGORIES.reduce((acc, c) => {
      const its = storeItems.filter(i => i.category === c.id)
      if (its.length) acc[c.id] = its
      return acc
    }, {})

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
          {Object.entries(byCat).map(([catId, catItems]) => {
            const cat = CATEGORIES.find(c => c.id === catId)
            return (
              <div key={catId}>
                <div style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-faint)', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 5 }}>
                  {cat?.icon} {cat?.label}
                </div>
                {catItems.map(item => (
                  <SwipeItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
                ))}
              </div>
            )
          })}
          {storeItems.length === 0 && inCart.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-faint)', fontSize: 13 }}>
              Sin productos en {activeStore}
            </div>
          )}

          {inCart.length > 0 && (
            <div style={{ margin: '8px 10px 0' }}>
              <CartSection compact />
            </div>
          )}


          <div style={{ height: 80 }} />
        </div>

        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', gap: 8 }}>
          <input
            value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="Añadir producto..."
            style={{ flex: 1, padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 15, outline: 'none' }}
          />
          <button onClick={addItem} style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
        </div>

        {toast && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#09090b', color: '#fff', padding: '10px 18px', borderRadius: 999, fontSize: 12, fontWeight: 500, zIndex: 500, whiteSpace: 'nowrap' }}>{toast}</div>}
        {showDefaultModal && <DefaultStoreModal current={activeStore} onSelect={handleDefaultStoreSelect} onClose={() => setShowDefaultModal(false)} />}
      </div>
    )
  }

  // ── Desktop view ──────────────────────────────────────────────
  const filteredPending = pending.filter(i =>
    (activeStore === 'General' || i.store === activeStore) &&
    (!activeCat || i.category === activeCat) &&
    (!query || i.name.toLowerCase().includes(query.toLowerCase()))
  )
  const byCat = CATEGORIES.reduce((acc, c) => {
    const its = filteredPending.filter(i => i.category === c.id)
    if (its.length) acc[c.id] = its
    return acc
  }, {})

  return (
    <ModuleShell app={app} modules={modules}>
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* Category sidebar */}
      <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid var(--border)', overflow: 'auto', padding: '16px 12px', background: 'var(--bg-card)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-faint)', marginBottom: 8 }}>Categorías</div>
        {[{ id: null, label: 'Todos', icon: '📋' }, ...CATEGORIES].map(c => {
          const count = c.id ? pending.filter(i => i.category === c.id).length : pending.length
          if (c.id && !count) return null
          return (
            <div key={c.id ?? 'all'} onClick={() => setActiveCat(c.id)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500,
              color: activeCat === c.id ? 'var(--accent)' : 'var(--text-muted)',
              background: activeCat === c.id ? 'rgba(249,115,22,.1)' : 'transparent',
              transition: 'all .15s', marginBottom: 1,
            }}>
              <span>{c.icon} {c.label}</span>
              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 999, background: activeCat === c.id ? 'var(--accent)' : 'var(--border)', color: activeCat === c.id ? '#fff' : 'var(--text-faint)' }}>{count}</span>
            </div>
          )
        })}
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '16px 20px' }}>
        <StoreTabs activeStore={activeStore} onChange={setActiveStore} onSettings={() => setShowDefaultModal(true)} compact={false} />

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0' }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: '#10b981', borderRadius: 2, transition: 'width .3s' }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{inCart.length}</span>/{items.length}
          </span>
        </div>

        {/* Search */}
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="🔍 Buscar productos..."
          style={{ width: '100%', padding: '9px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', marginBottom: 10 }} />

        {/* Add form */}
        <form onSubmit={addItem} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre del producto"
            style={{ flex: 1, padding: '8px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
          <input value={newQty} onChange={e => setNewQty(e.target.value)} placeholder="Cant." type="number" min="0"
            style={{ width: 70, padding: '8px 10px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
          <select value={newCat} onChange={e => setNewCat(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 12, outline: 'none' }}>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
          <button type="submit" style={{ padding: '8px 16px', borderRadius: 9, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            + Añadir
          </button>
        </form>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Sugerencias */}
          <SugerenciasSection
            suggestions={suggestions}
            editingFreqId={editingFreqId}
            setEditingFreqId={setEditingFreqId}
            addSuggestion={addSuggestion}
            dismissSuggestion={dismissSuggestion}
            updateFrequency={updateFrequency}
          />
          {/* Active items by category */}
          {Object.entries(byCat).map(([catId, catItems]) => {
            const cat = CATEGORIES.find(c => c.id === catId)
            return (
              <div key={catId}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-faint)', marginBottom: 6 }}>
                  {cat?.icon} {cat?.label}
                </div>
                {catItems.map(item => (
                  <DesktopItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
                ))}
              </div>
            )
          })}

          {filteredPending.length === 0 && inCart.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-faint)', fontSize: 13 }}>Lista vacía</div>
          )}

          <CartSection compact={false} />
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#09090b', color: '#fff', padding: '10px 18px', borderRadius: 999, fontSize: 12, fontWeight: 500, zIndex: 500, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
      {showDefaultModal && <DefaultStoreModal current={activeStore} onSelect={handleDefaultStoreSelect} onClose={() => setShowDefaultModal(false)} />}
    </div>
    </ModuleShell>
  )
}
