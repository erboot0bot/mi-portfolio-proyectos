import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'

const NOTE_COLORS = [
  { hex: '#f59e0b', label: 'Ámbar' },
  { hex: '#3b82f6', label: 'Azul' },
  { hex: '#10b981', label: 'Verde' },
  { hex: '#8b5cf6', label: 'Violeta' },
  { hex: '#ef4444', label: 'Rojo' },
  { hex: '#6b7280', label: 'Gris' },
]

export default function Notas() {
  const { app } = useOutletContext()
  const [notes, setNotes]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [modal, setModal]       = useState(null) // null | { id?, title, content, color }
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase.from('personal_notes')
      .select('*')
      .eq('app_id', app.id)
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setFetchError(error.message); setLoading(false); return }
        setNotes(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [app.id])

  async function handleSave() {
    if (!modal) return
    setSaving(true)
    const payload = {
      app_id:  app.id,
      title:   modal.title.trim() || 'Sin título',
      content: modal.content.trim(),
      color:   modal.color,
    }
    if (modal.id) {
      const { error } = await supabase.from('personal_notes')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', modal.id)
      if (!error) {
        setNotes(p => p.map(n => n.id === modal.id ? { ...n, ...payload } : n))
        setModal(null)
      }
    } else {
      const { data, error } = await supabase.from('personal_notes')
        .insert(payload).select().single()
      if (!error && data) { setNotes(p => [data, ...p]); setModal(null) }
    }
    setSaving(false)
  }

  async function togglePin(e, note) {
    e.stopPropagation()
    const { error } = await supabase.from('personal_notes')
      .update({ pinned: !note.pinned }).eq('id', note.id)
    if (!error) {
      setNotes(p => {
        const upd = p.map(n => n.id === note.id ? { ...n, pinned: !n.pinned } : n)
        return upd.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
          new Date(b.updated_at) - new Date(a.updated_at))
      })
    }
  }

  async function deleteNote(e, id) {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar esta nota?')) return
    const { error } = await supabase.from('personal_notes').delete().eq('id', id)
    if (!error) setNotes(p => p.filter(n => n.id !== id))
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Notas</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {notes.length} nota{notes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setModal({ title: '', content: '', color: '#f59e0b' })}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >+ Nueva nota</button>
      </div>

      {fetchError && (
        <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16 }}>Error: {fetchError}</p>
      )}

      {notes.length === 0 && !fetchError ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: 48, margin: '0 0 8px' }}>📝</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin notas</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Crea tu primera nota rápida</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {notes.map(note => (
            <div
              key={note.id}
              onClick={() => setModal({ id: note.id, title: note.title, content: note.content, color: note.color })}
              style={{
                borderRadius: 12, padding: 16, cursor: 'pointer', position: 'relative',
                background: note.color + '22', border: `1px solid ${note.color}44`,
                minHeight: 100, transition: 'transform 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <button onClick={(e) => togglePin(e, note)} title={note.pinned ? 'Desanclar' : 'Anclar'}
                style={{ position: 'absolute', top: 8, right: 32, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: note.pinned ? 1 : 0.25, padding: 2 }}>
                📌
              </button>
              <button onClick={(e) => deleteNote(e, note.id)} title="Eliminar"
                style={{ position: 'absolute', top: 8, right: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.25, padding: 2 }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.25'}
              >×</button>
              <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: 'var(--text)', paddingRight: 48 }}>
                {note.title}
              </p>
              {note.content && (
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {note.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
        >
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480, border: '1px solid var(--border)' }}>
            <input
              value={modal.title}
              onChange={e => setModal(p => ({ ...p, title: e.target.value }))}
              placeholder="Título de la nota"
              autoFocus
              style={{ width: '100%', fontSize: 16, fontWeight: 700, color: 'var(--text)',
                background: 'transparent', border: 'none', outline: 'none',
                borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 12, boxSizing: 'border-box' }}
            />
            <textarea
              value={modal.content}
              onChange={e => setModal(p => ({ ...p, content: e.target.value }))}
              placeholder="Escribe tu nota aquí..."
              rows={6}
              style={{ width: '100%', fontSize: 13, color: 'var(--text)', background: 'transparent',
                border: 'none', outline: 'none', resize: 'vertical', lineHeight: 1.6,
                fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {NOTE_COLORS.map(c => (
                <button key={c.hex} onClick={() => setModal(p => ({ ...p, color: c.hex }))} title={c.label}
                  style={{ width: 24, height: 24, borderRadius: '50%', background: c.hex, padding: 0, cursor: 'pointer',
                    border: modal.color === c.hex ? '2px solid var(--text)' : '2px solid transparent' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Guardando...' : modal.id ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
