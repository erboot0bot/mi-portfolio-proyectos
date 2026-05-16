import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const inp = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }
const ESTADO = {
  pendiente: { label: 'Pendiente', bg: '#f59e0b22', color: '#f59e0b' },
  comprado:  { label: 'Comprado',  bg: '#38bdf822', color: '#38bdf8' },
  entregado: { label: 'Entregado', bg: '#22c55e22', color: '#22c55e' },
}
const BLANK_REG = { persona: '', relacion: 'amigo', ocasion: 'cumpleanos', fecha: '', presupuesto_max: '', notas: '' }
const BLANK_IDEA = { descripcion: '', precio_aprox: '', url: '' }

export default function Regalos() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'ocio'
  const [items, setItems] = useState(() => demoRead(appType, 'regalos') ?? [])
  const [selectedId, setSelectedId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(BLANK_REG)
  const [ideaForm, setIdeaForm] = useState(BLANK_IDEA)
  const [showIdeaForm, setShowIdeaForm] = useState(false)

  const save = next => { setItems(next); demoWrite(appType, 'regalos', next) }
  const selected = items.find(r => r.id === selectedId) ?? null

  function addRegalo(e) {
    e.preventDefault()
    if (!form.persona.trim()) return
    save([...items, { id: crypto.randomUUID(), ...form, presupuesto_max: parseFloat(form.presupuesto_max) || 0, coste_real: 0, estado: 'pendiente', ideas: [] }])
    setForm(BLANK_REG); setShowAdd(false)
  }

  function addIdea(e) {
    e.preventDefault()
    if (!ideaForm.descripcion.trim()) return
    save(items.map(r => r.id === selectedId ? { ...r, ideas: [...r.ideas, { id: crypto.randomUUID(), ...ideaForm, precio_aprox: parseFloat(ideaForm.precio_aprox) || 0 }] } : r))
    setIdeaForm(BLANK_IDEA); setShowIdeaForm(false)
  }

  function removeIdea(ideaId) {
    save(items.map(r => r.id === selectedId ? { ...r, ideas: r.ideas.filter(i => i.id !== ideaId) } : r))
  }

  function advanceEstado() {
    const order = ['pendiente', 'comprado', 'entregado']
    save(items.map(r => r.id === selectedId ? { ...r, estado: order[Math.min(order.indexOf(r.estado) + 1, 2)] } : r))
  }

  if (selected) {
    const est = ESTADO[selected.estado] ?? ESTADO.pendiente
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button onClick={() => setSelectedId(null)} style={{ marginBottom: 16, background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 14, padding: 0 }}>← Regalos</button>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: '2px solid #a855f7', borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{selected.persona}</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{selected.relacion} · {selected.ocasion} · {selected.fecha}</p>
              {selected.presupuesto_max > 0 && <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Presupuesto: {selected.presupuesto_max}€{selected.coste_real > 0 ? ` · Real: ${selected.coste_real}€` : ''}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <span style={{ fontSize: 12, background: est.bg, color: est.color, borderRadius: 20, padding: '4px 12px', fontWeight: 600 }}>{est.label}</span>
              {selected.estado !== 'entregado' && (
                <button onClick={advanceEstado} style={{ fontSize: 11, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  → {selected.estado === 'pendiente' ? 'Marcar comprado' : 'Marcar entregado'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Ideas ({selected.ideas.length})</h3>
          <button onClick={() => setShowIdeaForm(v => !v)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Añadir idea</button>
        </div>

        {showIdeaForm && (
          <form onSubmit={addIdea} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12, display: 'grid', gap: 8 }}>
            <input placeholder="Descripción *" value={ideaForm.descripcion} onChange={e => setIdeaForm(f => ({ ...f, descripcion: e.target.value }))} required style={inp} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input type="number" placeholder="Precio aprox. (€)" value={ideaForm.precio_aprox} onChange={e => setIdeaForm(f => ({ ...f, precio_aprox: e.target.value }))} style={inp} />
              <input placeholder="URL (opcional)" value={ideaForm.url} onChange={e => setIdeaForm(f => ({ ...f, url: e.target.value }))} style={inp} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowIdeaForm(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>Cancelar</button>
              <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Añadir</button>
            </div>
          </form>
        )}

        {selected.ideas.length === 0
          ? <p style={{ color: 'var(--text-faint)', fontSize: 13, fontStyle: 'italic' }}>Sin ideas aún. ¡Añade la primera!</p>
          : selected.ideas.map(idea => (
            <div key={idea.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{idea.descripcion}</div>
                {idea.precio_aprox > 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>~{idea.precio_aprox}€</div>}
                {idea.url && <a href={idea.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--accent)' }}>Ver enlace</a>}
              </div>
              <button onClick={() => removeIdea(idea.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: 16, padding: 0 }}>✕</button>
            </div>
          ))
        }
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>🎁 Regalos</h2>
        <button onClick={() => setShowAdd(v => !v)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Añadir</button>
      </div>
      {showAdd && (
        <form onSubmit={addRegalo} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16, display: 'grid', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <input placeholder="Persona *" value={form.persona} onChange={e => setForm(f => ({ ...f, persona: e.target.value }))} required style={inp} />
            <select value={form.relacion} onChange={e => setForm(f => ({ ...f, relacion: e.target.value }))} style={inp}>
              {['pareja', 'familia', 'amigo', 'compañero', 'otro'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={form.ocasion} onChange={e => setForm(f => ({ ...f, ocasion: e.target.value }))} style={inp}>
              {['cumpleanos', 'navidad', 'boda', 'nacimiento', 'otro'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} style={inp} />
            <input type="number" placeholder="Presupuesto máx. (€)" value={form.presupuesto_max} onChange={e => setForm(f => ({ ...f, presupuesto_max: e.target.value }))} style={inp} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAdd(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>Cancelar</button>
            <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
          </div>
        </form>
      )}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-faint)' }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>🎁</p>
          <p style={{ fontSize: 14 }}>Sin regalos registrados</p>
        </div>
      ) : items.map(r => {
        const est = ESTADO[r.estado] ?? ESTADO.pendiente
        return (
          <div key={r.id} onClick={() => setSelectedId(r.id)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 10, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{r.persona}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{r.relacion} · {r.ocasion}{r.fecha ? ` · ${r.fecha}` : ''}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span style={{ fontSize: 11, background: est.bg, color: est.color, borderRadius: 20, padding: '2px 10px', fontWeight: 600 }}>{est.label}</span>
                <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{r.ideas.length} idea{r.ideas.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
