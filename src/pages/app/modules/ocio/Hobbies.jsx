import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const inp = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }
const ESTADO_PROY = { en_proceso: { label: 'En proceso', color: '#f59e0b' }, terminado: { label: 'Terminado', color: '#22c55e' }, abandonado: { label: 'Abandonado', color: '#ef4444' } }
const BLANK_HOB = { nombre: '', categoria: '', icono: '🎯', descripcion: '' }
const BLANK_PROY = { titulo: '', estado: 'en_proceso', notas: '', fecha: new Date().toISOString().slice(0, 10) }
const BLANK_MAT = { nombre: '', stock: '', unidad: 'uds' }
function TabBtn({ label, active, onClick }) {
  return <button onClick={onClick} style={{ padding: '8px 14px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: active ? 700 : 500, color: active ? 'var(--accent)' : 'var(--text-muted)', background: 'none', border: 'none', borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent', cursor: 'pointer' }}>{label}</button>
}

export default function Hobbies() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'ocio'
  const [items, setItems] = useState(() => demoRead(appType, 'hobbies') ?? [])
  const [selectedId, setSelectedId] = useState(null)
  const [activeTab, setActiveTab] = useState('proyectos')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(BLANK_HOB)
  const [showProyForm, setShowProyForm] = useState(false)
  const [proyForm, setProyForm] = useState(BLANK_PROY)
  const [showMatForm, setShowMatForm] = useState(false)
  const [matForm, setMatForm] = useState(BLANK_MAT)

  const save = next => { setItems(next); demoWrite(appType, 'hobbies', next) }
  const selected = items.find(h => h.id === selectedId) ?? null

  function addHobby(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return
    save([...items, { id: crypto.randomUUID(), ...form, proyectos: [], materiales: [] }])
    setForm(BLANK_HOB); setShowAdd(false)
  }

  function addProy(e) {
    e.preventDefault()
    if (!proyForm.titulo.trim()) return
    save(items.map(h => h.id === selectedId ? { ...h, proyectos: [...h.proyectos, { id: crypto.randomUUID(), ...proyForm }] } : h))
    setProyForm(BLANK_PROY); setShowProyForm(false)
  }

  function addMat(e) {
    e.preventDefault()
    if (!matForm.nombre.trim()) return
    save(items.map(h => h.id === selectedId ? { ...h, materiales: [...h.materiales, { id: crypto.randomUUID(), ...matForm, stock: parseFloat(matForm.stock) || 0 }] } : h))
    setMatForm(BLANK_MAT); setShowMatForm(false)
  }

  if (selected) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button onClick={() => { setSelectedId(null); setActiveTab('proyectos') }} style={{ marginBottom: 16, background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 14, padding: 0 }}>← Hobbies</button>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: '2px solid #a855f7', borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{selected.icono} {selected.nombre}</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{selected.categoria}{selected.descripcion ? ` · ${selected.descripcion}` : ''}</p>
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
          <TabBtn label="Proyectos" active={activeTab === 'proyectos'} onClick={() => setActiveTab('proyectos')} />
          <TabBtn label="Materiales" active={activeTab === 'materiales'} onClick={() => setActiveTab('materiales')} />
        </div>

        {activeTab === 'proyectos' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Proyectos ({selected.proyectos.length})</h3>
              <button onClick={() => setShowProyForm(v => !v)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Añadir</button>
            </div>
            {showProyForm && (
              <form onSubmit={addProy} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12, display: 'grid', gap: 8 }}>
                <input placeholder="Título *" value={proyForm.titulo} onChange={e => setProyForm(f => ({ ...f, titulo: e.target.value }))} required style={inp} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <select value={proyForm.estado} onChange={e => setProyForm(f => ({ ...f, estado: e.target.value }))} style={inp}>
                    <option value="en_proceso">En proceso</option>
                    <option value="terminado">Terminado</option>
                    <option value="abandonado">Abandonado</option>
                  </select>
                  <input type="date" value={proyForm.fecha} onChange={e => setProyForm(f => ({ ...f, fecha: e.target.value }))} style={inp} />
                </div>
                <input placeholder="Notas" value={proyForm.notas} onChange={e => setProyForm(f => ({ ...f, notas: e.target.value }))} style={inp} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowProyForm(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>Cancelar</button>
                  <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
                </div>
              </form>
            )}
            {selected.proyectos.length === 0
              ? <p style={{ color: 'var(--text-faint)', fontSize: 13, fontStyle: 'italic' }}>Sin proyectos. ¡Añade el primero!</p>
              : selected.proyectos.map(p => {
                const est = ESTADO_PROY[p.estado] ?? ESTADO_PROY.en_proceso
                return (
                  <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{p.titulo}</span>
                      <span style={{ fontSize: 11, color: est.color, fontWeight: 600 }}>● {est.label}</span>
                    </div>
                    {p.notas && <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{p.notas}</p>}
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>{p.fecha}</p>
                  </div>
                )
              })
            }
          </>
        )}

        {activeTab === 'materiales' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Materiales ({selected.materiales.length})</h3>
              <button onClick={() => setShowMatForm(v => !v)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Añadir</button>
            </div>
            {showMatForm && (
              <form onSubmit={addMat} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12, display: 'grid', gap: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
                  <input placeholder="Material *" value={matForm.nombre} onChange={e => setMatForm(f => ({ ...f, nombre: e.target.value }))} required style={inp} />
                  <input type="number" placeholder="Stock" value={matForm.stock} onChange={e => setMatForm(f => ({ ...f, stock: e.target.value }))} style={inp} />
                  <input placeholder="Unidad" value={matForm.unidad} onChange={e => setMatForm(f => ({ ...f, unidad: e.target.value }))} style={inp} />
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowMatForm(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>Cancelar</button>
                  <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Añadir</button>
                </div>
              </form>
            )}
            {selected.materiales.length === 0
              ? <p style={{ color: 'var(--text-faint)', fontSize: 13, fontStyle: 'italic' }}>Sin materiales registrados</p>
              : selected.materiales.map(m => (
                <div key={m.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: 'var(--text)' }}>{m.nombre}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{m.stock} {m.unidad}</span>
                </div>
              ))
            }
          </>
        )}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>🎯 Hobbies</h2>
        <button onClick={() => setShowAdd(v => !v)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Añadir</button>
      </div>
      {showAdd && (
        <form onSubmit={addHobby} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16, display: 'grid', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: 8 }}>
            <input placeholder="🎯" value={form.icono} onChange={e => setForm(f => ({ ...f, icono: e.target.value }))} style={{ ...inp, width: 60 }} maxLength={4} />
            <input placeholder="Nombre *" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required style={inp} />
            <input placeholder="Categoría" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} style={inp} />
          </div>
          <input placeholder="Descripción (opcional)" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} style={inp} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAdd(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>Cancelar</button>
            <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
          </div>
        </form>
      )}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-faint)' }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>🎯</p>
          <p style={{ fontSize: 14 }}>Sin hobbies registrados aún</p>
        </div>
      ) : items.map(h => {
        const activos = h.proyectos.filter(p => p.estado === 'en_proceso').length
        return (
          <div key={h.id} onClick={() => setSelectedId(h.id)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 10, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{h.icono} {h.nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{h.categoria}{h.descripcion ? ` · ${h.descripcion}` : ''}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-faint)' }}>
                {activos > 0 && <div style={{ color: '#f59e0b', fontWeight: 600 }}>{activos} activo{activos !== 1 ? 's' : ''}</div>}
                <div>{h.proyectos.length} proyecto{h.proyectos.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
