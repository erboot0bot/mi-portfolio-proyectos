import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import ModuleShell from './ModuleShell'
import { useMode } from '../../../contexts/ModeContext'

export default function Inventario() {
  const { app, modules } = useOutletContext()
  const { mode } = useMode()
  const [inventory, setInventory] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showAdd, setShowAdd]     = useState(false)
  const [form, setForm]           = useState({ name: '', current_stock: '', min_stock: '', unit: 'unidad' })
  const [error, setError]         = useState(null)
  const [fetchError, setFetchError] = useState(null)
  const adjusting                 = useRef(new Set())

  useEffect(() => {
    if (mode === 'demo') { setLoading(false); return }
    let cancelled = false
    supabase.from('inventory')
      .select('*, product:products(*)')
      .eq('app_id', app.id)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setFetchError(error.message); setLoading(false); return }
        if (data) setInventory(data)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [app.id, mode])

  async function handleAdd() {
    if (!form.name.trim()) return
    setError(null)

    if (mode === 'demo') {
      const newItem = {
        id: crypto.randomUUID(),
        app_id: app.id,
        product_id: crypto.randomUUID(),
        current_stock: Number(form.current_stock) || 0,
        min_stock: Number(form.min_stock) || 0,
        unit: form.unit,
        product: { name: form.name.trim() },
      }
      setInventory(p => [...p, newItem])
      setForm({ name: '', current_stock: '', min_stock: '', unit: 'unidad' })
      setShowAdd(false)
      return
    }

    // Buscar o crear producto en catálogo global
    const { data: existing } = await supabase.from('products')
      .select('id').ilike('name', form.name.trim()).maybeSingle()

    let productId = existing?.id
    if (!productId) {
      const { data: created } = await supabase.from('products')
        .insert({ name: form.name.trim(), purchase_unit: form.unit })
        .select('id').single()
      productId = created?.id
    }
    if (!productId) {
      setError('No se pudo crear el producto. Inténtalo de nuevo.')
      return
    }

    const { data, error } = await supabase.from('inventory')
      .insert({
        app_id:        app.id,
        product_id:    productId,
        current_stock: Number(form.current_stock) || 0,
        min_stock:     Number(form.min_stock) || 0,
        unit:          form.unit,
      })
      .select('*, product:products(*)')
      .single()

    if (error) {
      setError('No se pudo añadir el producto al inventario. Inténtalo de nuevo.')
      return
    }

    if (data) {
      setInventory(p => [...p, data])
      setForm({ name: '', current_stock: '', min_stock: '', unit: 'unidad' })
      setShowAdd(false)
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
    if (mode === 'demo') { setInventory(p => p.filter(i => i.id !== id)); return }
    const { error } = await supabase.from('inventory').delete().eq('id', id)
    if (!error) setInventory(p => p.filter(i => i.id !== id))
  }

  const lowStock = inventory.filter(i => i.min_stock > 0 && (i.current_stock ?? 0) <= i.min_stock)

  return (
    <ModuleShell app={app} modules={modules}>
      <div style={{ padding: '20px', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Inventario</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {inventory.length} producto{inventory.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowAdd(p => !p)}
            style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >+ Añadir</button>
        </div>

        {/* Alerta stock bajo */}
        {lowStock.length > 0 && (
          <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#ef4444' }}>⚠ Stock bajo ({lowStock.length})</p>
            {lowStock.map(i => (
              <p key={i.id} style={{ margin: '2px 0', fontSize: 12, color: 'var(--text-muted)' }}>
                {i.product?.name} — {i.current_stock} {i.unit} (mín. {i.min_stock})
              </p>
            ))}
          </div>
        )}

        {/* Formulario añadir */}
        {showAdd && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Nuevo producto</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Nombre del producto *"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={form.current_stock} onChange={e => setForm(p => ({ ...p, current_stock: e.target.value }))}
                  placeholder="Stock actual" type="number" min="0"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                <input value={form.min_stock} onChange={e => setForm(p => ({ ...p, min_stock: e.target.value }))}
                  placeholder="Stock mínimo" type="number" min="0"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
                <input value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                  placeholder="Unidad"
                  style={{ width: 90, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAdd(false)}
                  style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                  Cancelar
                </button>
                <button onClick={handleAdd} disabled={!form.name.trim()}
                  style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: form.name.trim() ? 1 : 0.4 }}>
                  Añadir
                </button>
              </div>
              {error && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ef4444' }}>{error}</p>
              )}
            </div>
          </div>
        )}

        {/* Lista */}
        {fetchError ? (
          <p style={{ color: '#ef4444', fontSize: 13 }}>Error al cargar el inventario: {fetchError}</p>
        ) : loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : inventory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: 40, margin: '0 0 8px' }}>📦</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Inventario vacío</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Añade productos para controlar tu stock</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {inventory.map(item => {
              const isLow = item.min_stock > 0 && (item.current_stock ?? 0) <= item.min_stock
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 12,
                    border: `1px solid ${isLow ? 'rgba(239,68,68,.4)' : 'var(--border)'}`,
                    background: 'var(--bg-card)',
                  }}
                  onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                  onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: isLow ? '#ef4444' : 'var(--text)' }}>
                      {isLow ? '⚠ ' : ''}{item.product?.name}
                    </p>
                    {item.min_stock > 0 && (
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>
                        mín. {item.min_stock} {item.unit}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => adjustStock(item.id, -1)}
                      style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ minWidth: 52, textAlign: 'center', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                      {item.current_stock ?? 0}
                      <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-faint)', marginLeft: 3 }}>{item.unit}</span>
                    </span>
                    <button onClick={() => adjustStock(item.id, 1)}
                      style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                  <button className="del-btn" onClick={() => removeItem(item.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
                  >×</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ModuleShell>
  )
}
