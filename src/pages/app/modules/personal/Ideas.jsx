import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../../lib/supabase'
import { useMode } from '../../../../contexts/ModeContext'
import { demoRead, demoWrite } from '../../../../data/demo/index.js'

export default function Ideas() {
  const { app } = useOutletContext()
  const { mode } = useMode()
  const appType = app.id.replace('demo-', '')
  const [ideas, setIdeas]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [modal, setModal]       = useState(null) // null | { id?, title, description, tags, tagInput }
  const [saving, setSaving]     = useState(false)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    if (mode === 'demo') {
      setIdeas(demoRead(appType, 'personal_ideas'))
      setLoading(false)
      return
    }
    let cancelled = false
    supabase.from('personal_ideas')
      .select('*')
      .eq('app_id', app.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setFetchError(error.message); setLoading(false); return }
        setIdeas(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [app.id, mode, appType])

  async function handleSave() {
    if (!modal || !modal.title.trim()) return
    setSaving(true)
    const payload = {
      app_id:      app.id,
      title:       modal.title.trim(),
      description: modal.description.trim(),
      tags:        modal.tags,
    }
    if (mode === 'demo') {
      const all = demoRead(appType, 'personal_ideas')
      if (modal.id) {
        demoWrite(appType, 'personal_ideas', all.map(i => i.id === modal.id ? { ...i, ...payload } : i))
        setIdeas(p => p.map(i => i.id === modal.id ? { ...i, ...payload } : i))
      } else {
        const newIdea = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() }
        demoWrite(appType, 'personal_ideas', [newIdea, ...all])
        setIdeas(p => [newIdea, ...p])
      }
      setModal(null)
      setSaving(false)
      return
    }
    if (modal.id) {
      const { error } = await supabase.from('personal_ideas').update(payload).eq('id', modal.id)
      if (!error) { setIdeas(p => p.map(i => i.id === modal.id ? { ...i, ...payload } : i)); setModal(null) }
    } else {
      const { data, error } = await supabase.from('personal_ideas').insert(payload).select().single()
      if (!error && data) { setIdeas(p => [data, ...p]); setModal(null) }
    }
    setSaving(false)
  }

  async function deleteIdea(id) {
    if (mode === 'demo') {
      const all = demoRead(appType, 'personal_ideas')
      demoWrite(appType, 'personal_ideas', all.filter(i => i.id !== id))
      setIdeas(p => p.filter(i => i.id !== id))
      return
    }
    const { error } = await supabase.from('personal_ideas').delete().eq('id', id)
    if (!error) setIdeas(p => p.filter(i => i.id !== id))
  }

  function handleTagKeyDown(e) {
    if ((e.key === 'Enter' || e.key === ',') && modal?.tagInput?.trim()) {
      e.preventDefault()
      const tag = modal.tagInput.trim()
      if (!modal.tags.includes(tag)) {
        setModal(p => ({ ...p, tags: [...p.tags, tag], tagInput: '' }))
      } else {
        setModal(p => ({ ...p, tagInput: '' }))
      }
    }
  }

  const filtered = ideas.filter(i =>
    !search || i.title.toLowerCase().includes(search.toLowerCase()) ||
    (i.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '20px', maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Ideas</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {ideas.length} idea{ideas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setModal({ title: '', description: '', tags: [], tagInput: '' })}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >+ Nueva idea</button>
      </div>

      {ideas.length > 3 && (
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar ideas..."
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}
        />
      )}

      {fetchError && <p style={{ color: '#ef4444', fontSize: 13 }}>Error: {fetchError}</p>}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: 48, margin: '0 0 8px' }}>💡</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>
            {search ? 'Sin resultados' : 'Sin ideas'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            {search ? 'Prueba con otro término' : 'Captura tu primera idea'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(idea => (
            <div key={idea.id}
              style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer' }}
              onClick={() => setModal({ id: idea.id, title: idea.title, description: idea.description || '', tags: idea.tags || [], tagInput: '' })}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{idea.title}</p>
                <button className="del-btn" onClick={(e) => { e.stopPropagation(); deleteIdea(idea.id) }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 2px', opacity: 0, transition: 'opacity .15s', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
                >×</button>
              </div>
              {idea.description && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {idea.description}
                </p>
              )}
              {idea.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {idea.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--border)', color: 'var(--text-faint)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
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
              placeholder="Título de la idea *"
              autoFocus
              style={{ width: '100%', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'transparent',
                border: 'none', outline: 'none', borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 12, boxSizing: 'border-box' }}
            />
            <textarea
              value={modal.description}
              onChange={e => setModal(p => ({ ...p, description: e.target.value }))}
              placeholder="Desarrolla tu idea..."
              rows={4}
              style={{ width: '100%', fontSize: 13, color: 'var(--text)', background: 'transparent', border: 'none', outline: 'none',
                resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 12 }}
            />
            {/* Tags */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                {modal.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 12, padding: '2px 10px', borderRadius: 20, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {tag}
                    <button onClick={() => setModal(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))}
                      style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
              <input
                value={modal.tagInput}
                onChange={e => setModal(p => ({ ...p, tagInput: e.target.value }))}
                onKeyDown={handleTagKeyDown}
                placeholder="Añadir tag (Enter para confirmar)"
                style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving || !modal.title.trim()}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  opacity: (saving || !modal.title.trim()) ? 0.4 : 1 }}>
                {saving ? 'Guardando...' : modal.id ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
