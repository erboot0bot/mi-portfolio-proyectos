import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../../contexts/ModeContext'
import { useFinCategoriasData } from '../../../../hooks/data/useFinCategoriasData'

const DEFAULT_CATEGORIES = [
  // Gastos
  { type: 'expense', name: 'Alimentación', icon: '🛒', color: '#f97316' },
  { type: 'expense', name: 'Transporte',   icon: '🚌', color: '#3b82f6' },
  { type: 'expense', name: 'Vivienda',     icon: '🏠', color: '#10b981' },
  { type: 'expense', name: 'Ocio',         icon: '🎭', color: '#8b5cf6' },
  { type: 'expense', name: 'Salud',        icon: '❤️', color: '#ef4444' },
  { type: 'expense', name: 'Ropa',         icon: '👗', color: '#ec4899' },
  { type: 'expense', name: 'Otros',        icon: '📦', color: '#6b7280' },
  // Ingresos
  { type: 'income',  name: 'Sueldo',       icon: '💼', color: '#10b981' },
  { type: 'income',  name: 'Freelance',    icon: '💻', color: '#3b82f6' },
  { type: 'income',  name: 'Otros',        icon: '➕', color: '#6b7280' },
]

export default function Categorias({ onRefresh }) {
  const { app } = useOutletContext()
  const { mode } = useMode()
  const { cats, loading, add, update, remove } = useFinCategoriasData({ appId: app.id, mode })
  const [seeded, setSeeded] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ name: '', type: 'expense', color: '#6366f1', icon: '💰' })
  const [editId, setEditId]   = useState(null)
  const [editForm, setEditForm] = useState(null)

  useEffect(() => {
    if (loading || seeded || mode === 'demo') return
    if (cats.length === 0) {
      setSeeded(true)
      Promise.all(DEFAULT_CATEGORIES.map(c => add(c)))
    }
  }, [loading, cats.length, seeded, mode])

  async function handleAdd() {
    if (!form.name.trim()) return
    await add({ name: form.name.trim(), type: form.type, color: form.color, icon: form.icon.trim() || '💰' })
    setForm({ name: '', type: 'expense', color: '#6366f1', icon: '💰' })
    setShowAdd(false)
    onRefresh?.()
  }

  async function handleEdit(id) {
    if (!editForm?.name?.trim()) return
    await update(id, { name: editForm.name.trim(), color: editForm.color, icon: editForm.icon || '💰' })
    setEditId(null); setEditForm(null)
    onRefresh?.()
  }

  async function handleDelete(id) {
    await remove(id)
    onRefresh?.()
  }

  const expenses = cats.filter(c => c.type === 'expense')
  const income   = cats.filter(c => c.type === 'income')

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  function CatList({ list }) {
    return list.map(cat => (
      <div key={cat.id}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)' }}
      >
        {editId === cat.id ? (
          <>
            <input value={editForm.icon} onChange={e => setEditForm(p => ({ ...p, icon: e.target.value }))}
              style={{ width: 36, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, textAlign: 'center', outline: 'none' }} />
            <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
              autoFocus style={{ flex: 1, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <input type="color" value={editForm.color} onChange={e => setEditForm(p => ({ ...p, color: e.target.value }))}
              style={{ width: 28, height: 28, padding: 0, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none' }} />
            <button onClick={() => handleEdit(cat.id)}
              style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>✓</button>
            <button onClick={() => { setEditId(null); setEditForm(null) }}
              style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>✕</button>
          </>
        ) : (
          <>
            <span style={{ fontSize: 20 }}>{cat.icon}</span>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{cat.name}</p>
            <button onClick={() => { setEditId(cat.id); setEditForm({ name: cat.name, color: cat.color, icon: cat.icon }) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: 14, padding: '2px 4px' }}>✏️</button>
            <button onClick={() => handleDelete(cat.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: 14, padding: '2px 4px' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
            >×</button>
          </>
        )}
      </div>
    ))
  }

  return (
    <div style={{ padding: '20px', maxWidth: 580, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Categorías</h1>
        <button onClick={() => setShowAdd(p => !p)}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          + Categoría
        </button>
      </div>

      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                placeholder="Emoji" style={{ width: 52, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 16, textAlign: 'center', outline: 'none' }} />
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Nombre *" autoFocus
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
              </select>
              <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                style={{ width: 40, height: 38, padding: 2, border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', background: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              <button onClick={handleAdd} disabled={!form.name.trim()}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: form.name.trim() ? 1 : 0.4 }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {expenses.length > 0 && (
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Gastos</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <CatList list={expenses} />
          </div>
        </div>
      )}

      {income.length > 0 && (
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Ingresos</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <CatList list={income} />
          </div>
        </div>
      )}
    </div>
  )
}
