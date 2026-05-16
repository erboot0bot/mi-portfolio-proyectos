import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const inp = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }
const Stars = ({ n }) => <span>{Array.from({ length: 5 }, (_, i) => <span key={i} style={{ color: i < n ? '#f59e0b' : 'var(--border)', fontSize: 13 }}>★</span>)}</span>
function Pill({ label, active, onClick }) {
  return <button onClick={onClick} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: active ? 700 : 500, color: active ? '#fff' : 'var(--text-muted)', background: active ? 'var(--accent)' : 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer' }}>{label}</button>
}
const BLANK = { nombre: '', tipo_cocina: '', ciudad: '', wishlist: false }
const BLANK_V = { fecha: new Date().toISOString().slice(0, 10), con_quien: '', importe: '', nota: '', valoracion: 5 }

export default function Restaurantes() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'ocio'
  const [items, setItems] = useState(() => demoRead(appType, 'restaurantes') ?? [])
  const [filtro, setFiltro] = useState('todos')
  const [selectedId, setSelectedId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [showVisit, setShowVisit] = useState(false)
  const [visitForm, setVisitForm] = useState(BLANK_V)

  const save = next => { setItems(next); demoWrite(appType, 'restaurantes', next) }

  const filtered = items.filter(r =>
    filtro === 'visitados' ? r.visitas.length > 0 && !r.wishlist
    : filtro === 'wishlist' ? r.wishlist
    : true
  )
  const selected = items.find(r => r.id === selectedId) ?? null

  function addRestaurante(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return
    save([...items, { id: crypto.randomUUID(), ...form, valoracion: 0, repetirias: null, visitas: [], tags: [] }])
    setForm(BLANK); setShowAdd(false)
  }

  function addVisita(e) {
    e.preventDefault()
    if (!visitForm.fecha) return
    const val = parseInt(visitForm.valoracion)
    save(items.map(r => r.id === selectedId ? {
      ...r, wishlist: false, valoracion: val, repetirias: val >= 3,
      visitas: [...r.visitas, { id: crypto.randomUUID(), ...visitForm, importe: parseFloat(visitForm.importe) || 0, valoracion: val }],
    } : r))
    setVisitForm(BLANK_V); setShowVisit(false)
  }

  if (selected) {
    const visitas = [...selected.visitas].sort((a, b) => b.fecha.localeCompare(a.fecha))
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button onClick={() => setSelectedId(null)} style={{ marginBottom: 16, background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 14, padding: 0 }}>← Restaurantes</button>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: '2px solid #a855f7', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{selected.nombre}</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{selected.tipo_cocina}{selected.ciudad ? ` · ${selected.ciudad}` : ''}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              {selected.valoracion > 0 && <div><Stars n={selected.valoracion} /></div>}
              {selected.wishlist && <span style={{ fontSize: 11, background: '#f59e0b22', color: '#f59e0b', borderRadius: 6, padding: '2px 8px' }}>📌 Wishlist</span>}
              {selected.repetirias === true && <span style={{ fontSize: 11, background: '#22c55e22', color: '#22c55e', borderRadius: 6, padding: '2px 8px', marginLeft: 4 }}>✓ Repetiría</span>}
            </div>
          </div>
          {selected.tags.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {selected.tags.map(t => <span key={t} style={{ fontSize: 11, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '2px 8px', color: 'var(--text-muted)' }}>{t}</span>)}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Historial de visitas ({visitas.length})</h3>
          <button onClick={() => setShowVisit(v => !v)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Añadir visita</button>
        </div>
        {showVisit && (
          <form onSubmit={addVisita} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16, display: 'grid', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input type="date" value={visitForm.fecha} onChange={e => setVisitForm(f => ({ ...f, fecha: e.target.value }))} required style={inp} />
              <input placeholder="Con quién" value={visitForm.con_quien} onChange={e => setVisitForm(f => ({ ...f, con_quien: e.target.value }))} style={inp} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input type="number" placeholder="Importe (€)" value={visitForm.importe} onChange={e => setVisitForm(f => ({ ...f, importe: e.target.value }))} style={inp} />
              <select value={visitForm.valoracion} onChange={e => setVisitForm(f => ({ ...f, valoracion: e.target.value }))} style={inp}>
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{'★'.repeat(n)} {n}/5</option>)}
              </select>
            </div>
            <input placeholder="Nota (opcional)" value={visitForm.nota} onChange={e => setVisitForm(f => ({ ...f, nota: e.target.value }))} style={inp} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowVisit(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>Cancelar</button>
              <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
            </div>
          </form>
        )}
        {visitas.length === 0
          ? <p style={{ color: 'var(--text-faint)', fontSize: 13, fontStyle: 'italic' }}>Sin visitas registradas aún.</p>
          : visitas.map(v => (
            <div key={v.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{v.fecha}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {v.con_quien && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>con {v.con_quien}</span>}
                  {v.importe > 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.importe}€</span>}
                  {v.valoracion > 0 && <Stars n={v.valoracion} />}
                </div>
              </div>
              {v.nota && <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{v.nota}</p>}
            </div>
          ))
        }
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>🍽️ Restaurantes</h2>
        <button onClick={() => setShowAdd(v => !v)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Añadir</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['todos', 'visitados', 'wishlist'].map(f => <Pill key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} active={filtro === f} onClick={() => setFiltro(f)} />)}
      </div>
      {showAdd && (
        <form onSubmit={addRestaurante} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16, display: 'grid', gap: 8 }}>
          <input placeholder="Nombre del restaurante *" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required style={inp} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input placeholder="Tipo de cocina" value={form.tipo_cocina} onChange={e => setForm(f => ({ ...f, tipo_cocina: e.target.value }))} style={inp} />
            <input placeholder="Ciudad" value={form.ciudad} onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))} style={inp} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.wishlist} onChange={e => setForm(f => ({ ...f, wishlist: e.target.checked }))} />
            Añadir a wishlist (no visitado aún)
          </label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAdd(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>Cancelar</button>
            <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
          </div>
        </form>
      )}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-faint)' }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>🍽️</p>
          <p style={{ fontSize: 14 }}>{filtro === 'wishlist' ? 'Sin restaurantes en wishlist' : 'Sin restaurantes registrados'}</p>
        </div>
      ) : filtered.map(r => (
        <div key={r.id} onClick={() => setSelectedId(r.id)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 10, cursor: 'pointer', transition: 'border-color 0.15s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{r.nombre}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{r.tipo_cocina}{r.ciudad ? ` · ${r.ciudad}` : ''}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              {r.valoracion > 0 && <Stars n={r.valoracion} />}
              {r.wishlist && <span style={{ fontSize: 10, background: '#f59e0b22', color: '#f59e0b', borderRadius: 6, padding: '2px 6px' }}>📌 Wishlist</span>}
              {r.visitas.length > 0 && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{r.visitas.length} visita{r.visitas.length !== 1 ? 's' : ''}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
