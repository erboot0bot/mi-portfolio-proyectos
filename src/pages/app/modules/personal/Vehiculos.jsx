import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const BLANK = { marca: '', modelo: '', anio: new Date().getFullYear(), matricula: '', color: '', itv_proxima: '', seguro_compania: '', seguro_vencimiento: '', taller: '' }

function diasHasta(fechaStr) {
  if (!fechaStr) return null
  return Math.ceil((new Date(fechaStr) - new Date()) / 86400000)
}
function semaforo(dias, label) {
  if (dias === null) return { color: 'var(--text-faint)', text: `${label}: —` }
  if (dias < 0)  return { color: '#ef4444', text: `${label}: vencido` }
  if (dias < 30) return { color: '#ef4444', text: `${label}: ${dias} días` }
  if (dias < 90) return { color: '#f59e0b', text: `${label}: ${dias} días` }
  return { color: '#22c55e', text: `${label}: ${dias} días` }
}

export default function Vehiculos() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'personal'
  const [vehiculos, setVehiculos] = useState(() => demoRead(appType, 'vehiculos') ?? [])
  const [expanded, setExpanded] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [incForms, setIncForms] = useState({})

  const save = (next) => { setVehiculos(next); demoWrite(appType, 'vehiculos', next) }
  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.marca.trim() || !form.matricula.trim()) return
    save([...vehiculos, { ...form, id: crypto.randomUUID(), anio: Number(form.anio), incidencias: [] }])
    setForm(BLANK); setShowForm(false)
  }
  const addIncidencia = (vehId) => {
    const desc = (incForms[vehId] ?? '').trim()
    if (!desc) return
    const inc = { id: crypto.randomUUID(), fecha: new Date().toISOString().slice(0, 10), descripcion: desc }
    save(vehiculos.map(v => v.id === vehId ? { ...v, incidencias: [...(v.incidencias ?? []), inc] } : v))
    setIncForms(f => ({ ...f, [vehId]: '' }))
  }
  const inp = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 640 }}>
      <h2 style={{ margin: '0 0 1.25rem' }}>Vehículos</h2>
      {vehiculos.map(v => {
        const itv = semaforo(diasHasta(v.itv_proxima), 'ITV')
        const seg = semaforo(diasHasta(v.seguro_vencimiento), 'Seguro')
        const isExp = expanded === v.id
        return (
          <div key={v.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: '0.75rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setExpanded(isExp ? null : v.id)}>
              <span style={{ fontSize: '2rem' }}>🚗</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{v.marca} {v.modelo} <span style={{ color: 'var(--text-faint)', fontWeight: 400, fontSize: '0.9rem' }}>({v.anio})</span></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}><span>{v.matricula}</span> · <span>{v.color}</span></div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                  <span style={{ color: itv.color, fontWeight: 600 }}>{itv.text}</span>
                  <span style={{ color: seg.color, fontWeight: 600 }}>{seg.text}</span>
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); save(vehiculos.filter(x => x.id !== v.id)) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>🗑</button>
              <span style={{ color: 'var(--text-faint)' }}>{isExp ? '▲' : '▼'}</span>
            </div>
            {isExp && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '1rem' }}>
                {v.taller && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>🔧 {v.taller}</div>}
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Incidencias</div>
                {(v.incidencias ?? []).map(inc => (
                  <div key={inc.id} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-faint)', marginRight: '0.5rem' }}>{inc.fecha}</span>{inc.descripcion}
                  </div>
                ))}
                {(v.incidencias ?? []).length === 0 && <div style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>Sin incidencias.</div>}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <input placeholder="Nueva incidencia…" value={incForms[v.id] ?? ''} onChange={e => setIncForms(f => ({ ...f, [v.id]: e.target.value }))} style={inp} />
                  <button onClick={() => addIncidencia(v.id)} style={{ padding: '0.5rem 0.75rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>+ Añadir</button>
                </div>
              </div>
            )}
          </div>
        )
      })}
      {vehiculos.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin vehículos registrados.</p>}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>+ Añadir vehículo</button>
      ) : (
        <form onSubmit={handleAdd} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 5rem', gap: '0.5rem' }}>
            <input placeholder="Marca" value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))} required style={inp} />
            <input placeholder="Modelo" value={form.modelo} onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))} style={inp} />
            <input type="number" placeholder="Año" value={form.anio} onChange={e => setForm(f => ({ ...f, anio: e.target.value }))} style={inp} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <input placeholder="Matrícula" value={form.matricula} onChange={e => setForm(f => ({ ...f, matricula: e.target.value }))} required style={inp} />
            <input placeholder="Color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={inp} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>ITV próxima</label><input type="date" value={form.itv_proxima} onChange={e => setForm(f => ({ ...f, itv_proxima: e.target.value }))} style={inp} /></div>
            <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Seguro vencimiento</label><input type="date" value={form.seguro_vencimiento} onChange={e => setForm(f => ({ ...f, seguro_vencimiento: e.target.value }))} style={inp} /></div>
          </div>
          <input placeholder="Compañía seguro" value={form.seguro_compania} onChange={e => setForm(f => ({ ...f, seguro_compania: e.target.value }))} style={inp} />
          <input placeholder="Taller de confianza" value={form.taller} onChange={e => setForm(f => ({ ...f, taller: e.target.value }))} style={inp} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Añadir</button>
            <button type="button" onClick={() => { setShowForm(false); setForm(BLANK) }} style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </form>
      )}
      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center' }}>💡 Demo — los cambios se guardan en esta sesión</p>
    </div>
  )
}
