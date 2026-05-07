// src/pages/app/modules/mascotas/Alimentacion.jsx
import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'
import { useMode } from '../../../../contexts/ModeContext'
import { demoRead, demoWrite } from '../../../../data/demo/index.js'

export default function Alimentacion() {
  const { pet, app } = useOutletContext()
  const { mode } = useMode()
  const appType = app.id.replace('demo-', '')
  const adjusting = useRef(new Set())

  // --- Stock state ---
  const [inventory, setInventory]   = useState([])
  const [invLoading, setInvLoading] = useState(true)
  const [invError, setInvError]     = useState(null)
  const [showAddItem, setShowAddItem] = useState(false)
  const [itemForm, setItemForm]     = useState({ name: '', current_stock: '', min_stock: '', unit: 'g' })
  const [itemError, setItemError]   = useState(null)

  // --- Schedule state ---
  const [schedule, setSchedule]     = useState(pet.metadata?.feeding_schedule ?? [])
  const [showAddToma, setShowAddToma] = useState(false)
  const [tomaForm, setTomaForm]     = useState({ time: '08:00', amount: '', label: 'Mañana' })
  const [schedError, setSchedError] = useState(null)

  useEffect(() => {
    if (mode === 'demo') {
      setInvLoading(false)
      return
    }
    let cancelled = false
    supabase.from('inventory')
      .select('*, product:products(*)')
      .eq('app_id', app.id)
      .contains('metadata', { pet_id: pet.id })
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setInvError(error.message); setInvLoading(false); return }
        setInventory(data ?? [])
        setInvLoading(false)
      })
    return () => { cancelled = true }
  }, [app.id, pet.id, mode, appType])

  async function handleAddItem() {
    if (!itemForm.name.trim()) return
    setItemError(null)
    if (mode === 'demo') {
      const newItem = {
        id: crypto.randomUUID(),
        app_id: app.id,
        product_id: crypto.randomUUID(),
        product: { name: itemForm.name.trim() },
        current_stock: Number(itemForm.current_stock) || 0,
        min_stock: Number(itemForm.min_stock) || 0,
        unit: itemForm.unit,
        metadata: { pet_id: pet.id },
        created_at: new Date().toISOString(),
      }
      setInventory(p => [...p, newItem])
      setItemForm({ name: '', current_stock: '', min_stock: '', unit: 'g' })
      setShowAddItem(false)
      return
    }
    const { data: existing } = await supabase.from('products')
      .select('id').ilike('name', itemForm.name.trim()).maybeSingle()
    let productId = existing?.id
    if (!productId) {
      const { data: created } = await supabase.from('products')
        .insert({ name: itemForm.name.trim(), purchase_unit: itemForm.unit })
        .select('id').single()
      productId = created?.id
    }
    if (!productId) { setItemError('No se pudo crear el producto.'); return }

    const { data, error } = await supabase.from('inventory')
      .insert({
        app_id:        app.id,
        product_id:    productId,
        current_stock: Number(itemForm.current_stock) || 0,
        min_stock:     Number(itemForm.min_stock) || 0,
        unit:          itemForm.unit,
        metadata:      { pet_id: pet.id },
      })
      .select('*, product:products(*)')
      .single()

    if (error) { setItemError('No se pudo añadir el producto.'); return }
    if (data) {
      setInventory(p => [...p, data])
      setItemForm({ name: '', current_stock: '', min_stock: '', unit: 'g' })
      setShowAddItem(false)
    }
  }

  async function adjustStock(id, delta) {
    if (adjusting.current.has(id)) return
    adjusting.current.add(id)
    const item = inventory.find(i => i.id === id)
    if (!item) { adjusting.current.delete(id); return }
    const newStock = Math.max(0, (item.current_stock ?? 0) + delta)
    if (mode === 'demo') {
      adjusting.current.delete(id)
      setInventory(p => p.map(i => i.id === id ? { ...i, current_stock: newStock } : i))
      return
    }
    const { error } = await supabase.from('inventory')
      .update({ current_stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', id)
    adjusting.current.delete(id)
    if (!error) setInventory(p => p.map(i => i.id === id ? { ...i, current_stock: newStock } : i))
  }

  async function removeItem(id) {
    if (mode === 'demo') {
      setInventory(p => p.filter(i => i.id !== id))
      return
    }
    const { error } = await supabase.from('inventory').delete().eq('id', id)
    if (!error) setInventory(p => p.filter(i => i.id !== id))
  }

  async function handleAddToma() {
    if (!tomaForm.amount.trim()) return
    setSchedError(null)
    const newSchedule = [
      ...schedule,
      { time: tomaForm.time, amount: tomaForm.amount.trim(), label: tomaForm.label.trim() || tomaForm.time },
    ]
    if (mode === 'demo') {
      const allPets = demoRead(appType, 'pets')
      demoWrite(appType, 'pets', allPets.map(p => p.id === pet.id ? { ...p, metadata: { ...p.metadata, feeding_schedule: newSchedule } } : p))
      setSchedule(newSchedule)
      setTomaForm({ time: '08:00', amount: '', label: 'Mañana' })
      setShowAddToma(false)
      return
    }
    const { error } = await supabase.from('pets')
      .update({ metadata: { ...pet.metadata, feeding_schedule: newSchedule } })
      .eq('id', pet.id)
    if (error) { setSchedError('No se pudo guardar el horario.'); return }
    setSchedule(newSchedule)
    setTomaForm({ time: '08:00', amount: '', label: 'Mañana' })
    setShowAddToma(false)
  }

  async function removeToma(idx) {
    const newSchedule = schedule.filter((_, i) => i !== idx)
    if (mode === 'demo') {
      const allPets = demoRead(appType, 'pets')
      demoWrite(appType, 'pets', allPets.map(p => p.id === pet.id ? { ...p, metadata: { ...p.metadata, feeding_schedule: newSchedule } } : p))
      setSchedule(newSchedule)
      return
    }
    const { error } = await supabase.from('pets')
      .update({ metadata: { ...pet.metadata, feeding_schedule: newSchedule } })
      .eq('id', pet.id)
    if (!error) setSchedule(newSchedule)
  }

  const lowStock = inventory.filter(i => i.min_stock > 0 && (i.current_stock ?? 0) <= i.min_stock)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Stock ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>🏪 Stock de alimento</h2>
          <button onClick={() => setShowAddItem(p => !p)}
            style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            + Añadir
          </button>
        </div>

        {lowStock.length > 0 && (
          <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 10 }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#ef4444' }}>⚠ Stock bajo ({lowStock.length})</p>
            {lowStock.map(i => (
              <p key={i.id} style={{ margin: '2px 0', fontSize: 12, color: 'var(--text-muted)' }}>
                {i.product?.name} — {i.current_stock} {i.unit} (mín. {i.min_stock})
              </p>
            ))}
          </div>
        )}

        {showAddItem && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input value={itemForm.name} onChange={e => setItemForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Nombre del alimento *" autoFocus
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={itemForm.current_stock} onChange={e => setItemForm(p => ({ ...p, current_stock: e.target.value }))}
                  placeholder="Stock" type="number" min="0"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                <input value={itemForm.min_stock} onChange={e => setItemForm(p => ({ ...p, min_stock: e.target.value }))}
                  placeholder="Mínimo" type="number" min="0"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                <input value={itemForm.unit} onChange={e => setItemForm(p => ({ ...p, unit: e.target.value }))}
                  placeholder="Unidad"
                  style={{ width: 70, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAddItem(false)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
                <button onClick={handleAddItem} disabled={!itemForm.name.trim()}
                  style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: itemForm.name.trim() ? 1 : 0.4 }}>Añadir</button>
              </div>
              {itemError && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{itemError}</p>}
            </div>
          </div>
        )}

        {invLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : invError ? (
          <p style={{ fontSize: 13, color: '#ef4444' }}>Error: {invError}</p>
        ) : inventory.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>Sin alimentos registrados</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {inventory.map(item => {
              const isLow = item.min_stock > 0 && (item.current_stock ?? 0) <= item.min_stock
              return (
                <div key={item.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${isLow ? 'rgba(239,68,68,.4)' : 'var(--border)'}`, background: 'var(--bg-card)' }}
                  onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                  onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: isLow ? '#ef4444' : 'var(--text)' }}>
                      {isLow ? '⚠ ' : ''}{item.product?.name}
                    </p>
                    {item.min_stock > 0 && (
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>mín. {item.min_stock} {item.unit}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => adjustStock(item.id, -1)}
                      style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ minWidth: 48, textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                      {item.current_stock ?? 0}
                      <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-faint)', marginLeft: 2 }}>{item.unit}</span>
                    </span>
                    <button onClick={() => adjustStock(item.id, 1)}
                      style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                  <button className="del-btn" onClick={() => removeItem(item.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 17, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}>×</button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Schedule ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>🕐 Horario de tomas</h2>
          <button onClick={() => setShowAddToma(p => !p)}
            style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            + Añadir
          </button>
        </div>

        {showAddToma && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Hora</label>
                  <input type="time" value={tomaForm.time}
                    onChange={e => setTomaForm(p => ({ ...p, time: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Cantidad *</label>
                  <input value={tomaForm.amount}
                    onChange={e => setTomaForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="200g"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Etiqueta</label>
                  <input value={tomaForm.label}
                    onChange={e => setTomaForm(p => ({ ...p, label: e.target.value }))}
                    placeholder="Mañana"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAddToma(false)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
                <button onClick={handleAddToma} disabled={!tomaForm.amount.trim()}
                  style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: tomaForm.amount.trim() ? 1 : 0.4 }}>Guardar</button>
              </div>
              {schedError && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{schedError}</p>}
            </div>
          </div>
        )}

        {schedule.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>Sin tomas programadas</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {schedule.map((toma, idx) => (
              <div key={idx}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)' }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-toma'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-toma'); if (b) b.style.opacity = '0' }}
              >
                <span style={{ fontSize: 20 }}>🕐</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{toma.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>{toma.time} · {toma.amount}</p>
                </div>
                <button className="del-toma" onClick={() => removeToma(idx)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 17, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
