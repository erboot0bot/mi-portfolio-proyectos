import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import ModuleShell from './ModuleShell'

const CATEGORIES = [
  { id: 'frutas',   label: 'Frutas & Verduras', icon: '🥦' },
  { id: 'carnes',   label: 'Carnes & Pescados',  icon: '🥩' },
  { id: 'lacteos',  label: 'Lácteos & Huevos',   icon: '🥛' },
  { id: 'pan',      label: 'Pan & Cereales',     icon: '🍞' },
  { id: 'bebidas',  label: 'Bebidas',            icon: '🧃' },
  { id: 'limpieza', label: 'Limpieza',           icon: '🧹' },
  { id: 'otros',    label: 'Otros',              icon: '📦' },
]
const STORES = ['Mercadona', 'Lidl', 'Carrefour', 'General']

// ── Desktop item ─────────────────────────────────────────────────
function DesktopItem({ item, onToggle, onDelete }) {
  const delRef = useRef(null)
  return (
    <div
      onClick={() => onToggle(item.id)}
      onMouseEnter={() => delRef.current && (delRef.current.style.opacity = '1')}
      onMouseLeave={() => delRef.current && (delRef.current.style.opacity = '0')}
      style={{
        display:'flex', alignItems:'center', gap:10,
        padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)',
        background:'var(--bg-card)', marginBottom:5, cursor:'pointer',
        opacity: item.checked ? 0.55 : 1, transition:'all .15s',
      }}
    >
      <div style={{
        width:20, height:20, borderRadius:'50%', flexShrink:0,
        border:`2px solid ${item.checked ? '#10b981' : 'var(--border)'}`,
        background: item.checked ? '#10b981' : 'transparent',
        display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s',
      }}>
        {item.checked && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
      </div>
      <span style={{ flex:1, fontSize:13, fontWeight:500, textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? 'var(--text-faint)' : 'var(--text)' }}>
        {item.name}
      </span>
      {item.quantity && <span style={{ fontSize:11, color:'var(--text-faint)', fontFamily:'monospace' }}>{item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>}
      <button
        ref={delRef}
        onClick={e => { e.stopPropagation(); onDelete(item.id) }}
        style={{ background:'none', border:'none', color:'var(--text-faint)', cursor:'pointer', fontSize:16, padding:'0 2px', opacity:0, transition:'opacity .15s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
      >×</button>
    </div>
  )
}

// ── Swipeable item (mobile) ───────────────────────────────────────
function SwipeItem({ item, onToggle, onDelete }) {
  const [offset, setOffset] = useState(0)
  const [active, setActive]   = useState(false)
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
      {offset > 20  && <div style={{ position:'absolute',left:0,top:0,bottom:0,width:80,background:'#ef4444',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:18,borderRadius:'12px 0 0 12px' }}>🗑</div>}
      {offset < -20 && <div style={{ position:'absolute',right:0,top:0,bottom:0,width:80,background:'#10b981',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:18,borderRadius:'0 12px 12px 0' }}>✓</div>}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => { if (Math.abs(offset) < 5) onToggle(item.id) }}
        style={{
          display:'flex', alignItems:'center', gap:12,
          padding:'14px 16px', borderRadius:12,
          background:'var(--bg-card)', border:'1px solid var(--border)',
          position:'relative', zIndex:2, cursor:'grab', userSelect:'none',
          touchAction:'pan-y',
          transform:`translateX(${offset}px)`,
          transition: active ? 'none' : 'transform .2s ease',
          opacity: item.checked ? 0.6 : 1,
        }}
      >
        <div style={{
          width:24, height:24, borderRadius:'50%', flexShrink:0,
          border:`2px solid ${item.checked ? '#10b981' : 'var(--border)'}`,
          background: item.checked ? '#10b981' : 'transparent',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          {item.checked && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
        </div>
        <span style={{
          flex:1, fontSize:15, fontWeight:500,
          textDecoration: item.checked ? 'line-through' : 'none',
          color: item.checked ? 'var(--text-faint)' : 'var(--text)',
        }}>
          {item.name}
        </span>
        {item.quantity && (
          <span style={{ fontSize:12, color:'var(--text-faint)', fontFamily:'monospace' }}>
            {item.quantity}{item.unit ? ` ${item.unit}` : ''}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
export default function ShoppingList() {
  const { project, modules } = useOutletContext()
  const [items, setItems]           = useState([])
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 640)
  const [activeCat, setActiveCat]   = useState(null)
  const [activeStore, setActiveStore] = useState('Mercadona')
  const [query, setQuery]           = useState('')
  const [newName, setNewName]       = useState('')
  const [newQty, setNewQty]         = useState('')
  const [newUnit, setNewUnit]       = useState('')
  const [newCat, setNewCat]         = useState('otros')
  const [toast, setToast]           = useState(null)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    supabase.from('shopping_items').select('*')
      .eq('project_id', project.id).order('created_at')
      .then(({ data }) => { if (data) setItems(data) })
  }, [project.id])

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2200) }

  async function toggleItem(id) {
    const item = items.find(i => i.id === id)
    if (!item) return
    await supabase.from('shopping_items').update({ checked: !item.checked }).eq('id', id)
    setItems(p => p.map(i => i.id === id ? { ...i, checked: !i.checked } : i))
  }

  async function deleteItem(id) {
    await supabase.from('shopping_items').delete().eq('id', id)
    setItems(p => p.filter(i => i.id !== id))
    showToast('Eliminado')
  }

  async function clearChecked() {
    const ids = items.filter(i => i.checked).map(i => i.id)
    if (!ids.length) return
    await supabase.from('shopping_items').delete().in('id', ids)
    setItems(p => p.filter(i => !i.checked))
    showToast(`${ids.length} productos eliminados`)
  }

  async function addItem(e) {
    if (e) e.preventDefault()
    if (!newName.trim()) return
    const payload = {
      project_id: project.id,
      name: newName.trim(),
      quantity: newQty ? Number(newQty) : null,
      unit: newUnit.trim() || null,
      category: newCat,
      store: isMobile ? activeStore : 'General',
      checked: false,
    }
    const { data, error } = await supabase.from('shopping_items').insert(payload).select().single()
    if (!error && data) {
      setItems(p => [...p, data])
      setNewName(''); setNewQty(''); setNewUnit('')
      showToast('Añadido ✓')
    }
  }

  const checked = items.filter(i => i.checked).length
  const pct = items.length ? Math.round(checked / items.length * 100) : 0

  // ── Mobile view (no shell — full screen) ──────────────────────
  if (isMobile) {
    const storeItems = items.filter(i => i.store === activeStore || activeStore === 'General')
    const byCat = CATEGORIES.reduce((acc, c) => {
      const its = storeItems.filter(i => i.category === c.id)
      if (its.length) acc[c.id] = its
      return acc
    }, {})

    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg)' }}>
        <div style={{ padding:'12px 16px', background:'var(--bg-card)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontWeight:800, fontSize:16 }}>Lista de la compra</span>
          <span style={{ fontSize:12, color:'var(--text-faint)' }}>
            <span style={{ color:'#10b981', fontWeight:700 }}>{checked}</span>/{items.length}
          </span>
        </div>
        <div style={{ padding:'4px 14px 0', background:'var(--bg-card)' }}>
          <div style={{ height:4, borderRadius:2, background:'var(--border)', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:'#10b981', borderRadius:2, transition:'width .3s ease' }} />
          </div>
        </div>
        <div style={{ display:'flex', gap:6, padding:'8px 12px', overflowX:'auto', background:'var(--bg-card)', borderBottom:'1px solid var(--border)' }}>
          {STORES.map(s => (
            <button key={s} onClick={() => setActiveStore(s)} style={{
              padding:'5px 12px', borderRadius:999, fontSize:11, fontWeight:500,
              border:`1px solid ${activeStore === s ? 'var(--accent)' : 'var(--border)'}`,
              background: activeStore === s ? 'var(--accent)' : 'transparent',
              color: activeStore === s ? '#fff' : 'var(--text-muted)',
              cursor:'pointer', whiteSpace:'nowrap', transition:'all .15s',
            }}>{s}</button>
          ))}
        </div>
        <div style={{ flex:1, overflowY:'auto', paddingBottom:8 }}>
          {Object.entries(byCat).map(([catId, catItems]) => {
            const cat = CATEGORIES.find(c => c.id === catId)
            return (
              <div key={catId}>
                <div style={{ padding:'8px 16px 4px', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--text-faint)', position:'sticky', top:0, background:'var(--bg)', zIndex:5 }}>
                  {cat?.icon} {cat?.label}
                </div>
                {catItems.map(item => (
                  <SwipeItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
                ))}
              </div>
            )
          })}
          {storeItems.length === 0 && (
            <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--text-faint)', fontSize:13 }}>
              Sin productos en {activeStore}
            </div>
          )}
          <div style={{ height:80 }} />
        </div>
        <div style={{ padding:'10px 12px', borderTop:'1px solid var(--border)', background:'var(--bg-card)', display:'flex', gap:8 }}>
          <input
            value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="Añadir producto..."
            style={{ flex:1, padding:'12px 14px', borderRadius:12, border:'1px solid var(--border)', background:'var(--bg)', color:'var(--text)', fontSize:15, outline:'none' }}
          />
          <button onClick={addItem} style={{ width:48, height:48, borderRadius:12, background:'var(--accent)', color:'#fff', border:'none', fontSize:24, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>+</button>
        </div>
        {toast && <div style={{ position:'fixed', bottom:80, left:'50%', transform:'translateX(-50%)', background:'#09090b', color:'#fff', padding:'10px 18px', borderRadius:999, fontSize:12, fontWeight:500, zIndex:500 }}>{toast}</div>}
      </div>
    )
  }

  // ── Desktop view ───────────────────────────────────────────────
  const filteredItems = items.filter(i =>
    (!activeCat || i.category === activeCat) &&
    (!query || i.name.toLowerCase().includes(query.toLowerCase()))
  )
  const byCat = CATEGORIES.reduce((acc, c) => {
    const its = filteredItems.filter(i => i.category === c.id)
    if (its.length) acc[c.id] = its
    return acc
  }, {})

  return (
    <ModuleShell project={project} modules={modules}>
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>
      {/* Category sidebar */}
      <div style={{ width:200, flexShrink:0, borderRight:'1px solid var(--border)', overflow:'auto', padding:'16px 12px', background:'var(--bg-card)' }}>
        <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--text-faint)', marginBottom:8 }}>Categorías</div>
        {[{ id: null, label:'Todos', icon:'📋' }, ...CATEGORIES].map(c => {
          const count = c.id ? items.filter(i => i.category === c.id).length : items.length
          if (c.id && !count) return null
          return (
            <div key={c.id ?? 'all'} onClick={() => setActiveCat(c.id)} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'6px 10px', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:500,
              color: activeCat === c.id ? 'var(--accent)' : 'var(--text-muted)',
              background: activeCat === c.id ? 'rgba(249,115,22,.1)' : 'transparent',
              transition:'all .15s', marginBottom:1,
            }}>
              <span>{c.icon} {c.label}</span>
              <span style={{ fontSize:10, padding:'1px 6px', borderRadius:999, background: activeCat === c.id ? 'var(--accent)' : 'var(--border)', color: activeCat === c.id ? '#fff' : 'var(--text-faint)' }}>{count}</span>
            </div>
          )
        })}
      </div>

      {/* Main */}
      <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column', padding:'16px 20px' }}>
        {/* Progress */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <div style={{ flex:1, height:4, borderRadius:2, background:'var(--border)', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, background:'#10b981', borderRadius:2, transition:'width .3s' }} />
          </div>
          <span style={{ fontSize:11, color:'var(--text-faint)', whiteSpace:'nowrap' }}>
            <span style={{ color:'#10b981', fontWeight:700 }}>{checked}</span>/{items.length}
          </span>
          {checked > 0 && (
            <button onClick={clearChecked} style={{ fontSize:11, color:'#ef4444', background:'none', border:'none', cursor:'pointer', whiteSpace:'nowrap' }}>
              Limpiar marcados
            </button>
          )}
        </div>

        {/* Search */}
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="🔍 Buscar productos..."
          style={{ width:'100%', padding:'9px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg)', color:'var(--text)', fontSize:13, outline:'none', marginBottom:10 }} />

        {/* Add form */}
        <form onSubmit={addItem} style={{ display:'flex', gap:8, marginBottom:16 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre del producto"
            style={{ flex:1, padding:'8px 12px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg)', color:'var(--text)', fontSize:13, outline:'none' }} />
          <input value={newQty} onChange={e => setNewQty(e.target.value)} placeholder="Cant." type="number" min="0"
            style={{ width:70, padding:'8px 10px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg)', color:'var(--text)', fontSize:13, outline:'none' }} />
          <select value={newCat} onChange={e => setNewCat(e.target.value)}
            style={{ padding:'8px 10px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg)', color:'var(--text)', fontSize:12, outline:'none' }}>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
          <button type="submit" style={{ padding:'8px 16px', borderRadius:9, background:'var(--accent)', color:'#fff', fontSize:13, fontWeight:600, border:'none', cursor:'pointer' }}>
            + Añadir
          </button>
        </form>

        {/* Items */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {Object.entries(byCat).map(([catId, catItems]) => {
            const cat = CATEGORIES.find(c => c.id === catId)
            return (
              <div key={catId} style={{ marginBottom:16 }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--text-faint)', marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
                  {cat?.icon} {cat?.label}
                </div>
                {catItems.map(item => (
                  <DesktopItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
                ))}
              </div>
            )
          })}
          {filteredItems.length === 0 && (
            <div style={{ textAlign:'center', padding:'40px', color:'var(--text-faint)', fontSize:13 }}>Lista vacía</div>
          )}
        </div>
      </div>

      {toast && (
        <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', background:'#09090b', color:'#fff', padding:'10px 18px', borderRadius:999, fontSize:12, fontWeight:500, zIndex:500 }}>
          {toast}
        </div>
      )}
    </div>
    </ModuleShell>
  )
}
