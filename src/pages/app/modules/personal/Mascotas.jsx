import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const BLANK = { nombre: '', especie: 'perro', raza: '', edad_anios: '', icono: '🐾', notas: '', veterinario: { nombre: '', telefono: '', direccion: '' } }
const ESPECIE_ICON = { perro: '🐕', gato: '🐈', conejo: '🐇', otro: '🐾' }

function diasHasta(f) { if (!f) return null; return Math.ceil((new Date(f) - new Date()) / 86400000) }
function vacSem(dias) {
  if (dias === null) return { color: 'var(--text-faint)', label: '—' }
  if (dias < 0)  return { color: '#ef4444', label: 'Vencida' }
  if (dias < 30) return { color: '#ef4444', label: `${dias}d` }
  if (dias < 90) return { color: '#f59e0b', label: `${dias}d` }
  return { color: '#22c55e', label: `${dias}d` }
}

export default function Mascotas() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'personal'
  const [mascotas, setMascotas] = useState(() => demoRead(appType, 'mascotas') ?? [])
  const [expanded, setExpanded] = useState(() => { const list = demoRead(appType, 'mascotas') ?? []; return list.length > 0 ? list[0].id : null })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(BLANK)

  const save = (next) => { setMascotas(next); demoWrite(appType, 'mascotas', next) }
  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    save([...mascotas, { ...form, id: crypto.randomUUID(), edad_anios: Number(form.edad_anios) || 0, vacunas: [], medicacion: [] }])
    setForm(BLANK); setShowForm(false)
  }
  const inp = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 640 }}>
      <h2 style={{ margin: '0 0 1.25rem' }}>Mascotas</h2>
      {mascotas.map(m => {
        const icon = m.icono || ESPECIE_ICON[m.especie] || '🐾'
        const isExp = expanded === m.id
        return (
          <div key={m.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: '0.75rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setExpanded(isExp ? null : m.id)}>
              <span style={{ fontSize: '2.5rem' }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{m.nombre}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><span>{m.raza}</span> · {m.edad_anios} {m.edad_anios === 1 ? 'año' : 'años'}</div>
              </div>
              <button onClick={e => { e.stopPropagation(); save(mascotas.filter(x => x.id !== m.id)) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>🗑</button>
              <span style={{ color: 'var(--text-faint)' }}>{isExp ? '▲' : '▼'}</span>
            </div>
            {isExp && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Veterinario</div>
                  {m.veterinario?.nombre
                    ? <div style={{ fontSize: '0.9rem' }}>
                        <span style={{ fontWeight: 500 }}>{m.veterinario.nombre}</span>
                        {m.veterinario.telefono && <span style={{ color: 'var(--text-muted)', marginLeft: '0.75rem' }}>📞 {m.veterinario.telefono}</span>}
                        {m.veterinario.direccion && <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginTop: 2 }}>📍 {m.veterinario.direccion}</div>}
                      </div>
                    : <span style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>Sin veterinario.</span>
                  }
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Vacunas</div>
                  {(m.vacunas ?? []).length === 0
                    ? <span style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>Sin vacunas.</span>
                    : (m.vacunas ?? []).map(vac => {
                        const sem = vacSem(diasHasta(vac.proxima))
                        return (
                          <div key={vac.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: 500 }}>{vac.nombre}</span>
                            <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              <span>Última: {vac.fecha_ultima}</span>
                              <span style={{ color: sem.color, fontWeight: 600 }}>Próxima: {sem.label}</span>
                            </div>
                          </div>
                        )
                      })
                  }
                </div>
                {m.notas && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem' }}>📝 {m.notas}</div>}
              </div>
            )}
          </div>
        )
      })}
      {mascotas.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin mascotas.</p>}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>+ Añadir mascota</button>
      ) : (
        <form onSubmit={handleAdd} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.5rem 1fr 1fr', gap: '0.5rem' }}>
            <input value={form.icono} onChange={e => setForm(f => ({ ...f, icono: e.target.value }))} maxLength={2} style={{ ...inp, textAlign: 'center', fontSize: '1.2rem', padding: '0.5rem' }} />
            <input placeholder="Nombre" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required style={inp} />
            <select value={form.especie} onChange={e => setForm(f => ({ ...f, especie: e.target.value }))} style={inp}>
              <option value="perro">🐕 Perro</option><option value="gato">🐈 Gato</option><option value="conejo">🐇 Conejo</option><option value="otro">🐾 Otro</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 4rem', gap: '0.5rem' }}>
            <input placeholder="Raza" value={form.raza} onChange={e => setForm(f => ({ ...f, raza: e.target.value }))} style={inp} />
            <input type="number" min="0" placeholder="Edad" value={form.edad_anios} onChange={e => setForm(f => ({ ...f, edad_anios: e.target.value }))} style={inp} />
          </div>
          <input placeholder="Notas (alergias, comportamiento…)" value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} style={inp} />
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
