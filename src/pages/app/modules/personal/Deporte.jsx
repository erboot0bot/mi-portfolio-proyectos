import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const DIFICULTAD_COLOR = { facil: '#22c55e', media: '#f59e0b', dificil: '#ef4444' }
const TIPO_ICON = { senderismo: '🥾', bici: '🚴', running: '🏃', otro: '🏅' }
const BLANK_RUTINA = { nombre: '', dias: [] }
const BLANK_EJ = { nombre: '', series: 3, reps: 10, peso: 0 }
const BLANK_RUTA = { nombre: '', tipo: 'senderismo', distancia_km: '', desnivel_m: '', dificultad: 'media', tiempo_h: '', notas: '' }

export default function Deporte() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'personal'

  const [tab, setTab] = useState('rutinas')
  const [rutinas, setRutinas] = useState(() => demoRead(appType, 'deporte_rutinas') ?? [])
  const [rutas, setRutas]     = useState(() => demoRead(appType, 'deporte_rutas') ?? [])
  const [showRutinaForm, setShowRutinaForm] = useState(false)
  const [rutinaForm, setRutinaForm]         = useState(BLANK_RUTINA)
  const [showRutaForm, setShowRutaForm]     = useState(false)
  const [rutaForm, setRutaForm]             = useState(BLANK_RUTA)
  const [expandedRutina, setExpandedRutina] = useState(() => (demoRead(appType, 'deporte_rutinas') ?? [])[0]?.id ?? null)
  const [ejForms, setEjForms]               = useState({})

  const saveRutinas = (next) => { setRutinas(next); demoWrite(appType, 'deporte_rutinas', next) }
  const saveRutas   = (next) => { setRutas(next);   demoWrite(appType, 'deporte_rutas', next) }

  const addRutina = (e) => {
    e.preventDefault()
    if (!rutinaForm.nombre.trim()) return
    saveRutinas([...rutinas, { id: crypto.randomUUID(), nombre: rutinaForm.nombre.trim(), dias: rutinaForm.dias, ejercicios: [] }])
    setRutinaForm(BLANK_RUTINA); setShowRutinaForm(false)
  }

  const toggleDia = (dia) => setRutinaForm(f => ({ ...f, dias: f.dias.includes(dia) ? f.dias.filter(d => d !== dia) : [...f.dias, dia] }))

  const addEjercicio = (rutinaId) => {
    const form = ejForms[rutinaId] ?? BLANK_EJ
    if (!form.nombre.trim()) return
    const entry = { id: crypto.randomUUID(), nombre: form.nombre.trim(), series: Number(form.series), reps: Number(form.reps), peso: Number(form.peso) }
    saveRutinas(rutinas.map(r => r.id === rutinaId ? { ...r, ejercicios: [...r.ejercicios, entry] } : r))
    setEjForms(f => ({ ...f, [rutinaId]: BLANK_EJ }))
  }

  const addRuta = (e) => {
    e.preventDefault()
    if (!rutaForm.nombre.trim()) return
    saveRutas([...rutas, { id: crypto.randomUUID(), nombre: rutaForm.nombre.trim(), tipo: rutaForm.tipo, distancia_km: parseFloat(rutaForm.distancia_km)||0, desnivel_m: parseInt(rutaForm.desnivel_m,10)||0, dificultad: rutaForm.dificultad, tiempo_h: parseFloat(rutaForm.tiempo_h)||0, fecha: new Date().toISOString().slice(0,10), notas: rutaForm.notas.trim() }])
    setRutaForm(BLANK_RUTA); setShowRutaForm(false)
  }

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{ padding: '0.5rem 1.25rem', border: tab === id ? 'none' : '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, background: tab === id ? 'var(--accent)' : 'var(--bg-card)', color: tab === id ? '#fff' : 'var(--text-muted)' }}>{label}</button>
  )
  const inp = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 680 }}>
      <h2 style={{ margin: '0 0 1.25rem' }}>Deporte</h2>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {tabBtn('rutinas', '🏋️ Rutinas')}
        {tabBtn('rutas', '🗺️ Rutas')}
      </div>

      {tab === 'rutinas' && (
        <div>
          {rutinas.map(r => (
            <div key={r.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: '0.75rem', overflow: 'hidden' }}>
              <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setExpandedRutina(expandedRutina === r.id ? null : r.id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{r.nombre}</div>
                  <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.4rem' }}>
                    {DIAS_SEMANA.map(d => (
                      <span key={d} style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, background: r.dias.includes(d) ? 'var(--accent)' : 'var(--border)', color: r.dias.includes(d) ? '#fff' : 'var(--text-faint)' }}>{d}</span>
                    ))}
                  </div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{r.ejercicios.length} ejercicios</span>
                <button onClick={e => { e.stopPropagation(); saveRutinas(rutinas.filter(x => x.id !== r.id)) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>🗑</button>
                <span style={{ color: 'var(--text-faint)' }}>{expandedRutina === r.id ? '▲' : '▼'}</span>
              </div>
              {expandedRutina === r.id && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead><tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '0.25rem 0.5rem' }}>Ejercicio</th>
                      <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' }}>Series</th>
                      <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' }}>Reps</th>
                      <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center' }}>Peso</th>
                      <th />
                    </tr></thead>
                    <tbody>
                      {r.ejercicios.map(ej => (
                        <tr key={ej.id}>
                          <td style={{ padding: '0.3rem 0.5rem', fontWeight: 500 }}>{ej.nombre}</td>
                          <td style={{ padding: '0.3rem 0.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{ej.series}</td>
                          <td style={{ padding: '0.3rem 0.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{ej.reps}</td>
                          <td style={{ padding: '0.3rem 0.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{ej.peso > 0 ? `${ej.peso} kg` : 'PC'}</td>
                          <td><button onClick={() => saveRutinas(rutinas.map(x => x.id === r.id ? { ...x, ejercicios: x.ejercicios.filter(e => e.id !== ej.id) } : x))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '0.8rem' }}>✕</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 4rem 4rem 4rem auto', gap: '0.4rem', marginTop: '0.75rem' }}>
                    <input placeholder="Ejercicio" value={(ejForms[r.id] ?? BLANK_EJ).nombre} onChange={e => setEjForms(f => ({ ...f, [r.id]: { ...(f[r.id] ?? BLANK_EJ), nombre: e.target.value } }))} style={inp} />
                    <input type="number" min="1" placeholder="S" value={(ejForms[r.id] ?? BLANK_EJ).series} onChange={e => setEjForms(f => ({ ...f, [r.id]: { ...(f[r.id] ?? BLANK_EJ), series: e.target.value } }))} style={{ ...inp, textAlign: 'center' }} />
                    <input type="number" min="1" placeholder="R" value={(ejForms[r.id] ?? BLANK_EJ).reps} onChange={e => setEjForms(f => ({ ...f, [r.id]: { ...(f[r.id] ?? BLANK_EJ), reps: e.target.value } }))} style={{ ...inp, textAlign: 'center' }} />
                    <input type="number" min="0" placeholder="kg" value={(ejForms[r.id] ?? BLANK_EJ).peso} onChange={e => setEjForms(f => ({ ...f, [r.id]: { ...(f[r.id] ?? BLANK_EJ), peso: e.target.value } }))} style={{ ...inp, textAlign: 'center' }} />
                    <button onClick={() => addEjercicio(r.id)} style={{ padding: '0.5rem 0.75rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>+</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {rutinas.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin rutinas.</p>}
          {!showRutinaForm ? (
            <button onClick={() => setShowRutinaForm(true)} style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>+ Nueva rutina</button>
          ) : (
            <form onSubmit={addRutina} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input placeholder="Nombre de la rutina" value={rutinaForm.nombre} onChange={e => setRutinaForm(f => ({ ...f, nombre: e.target.value }))} required style={inp} />
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {DIAS_SEMANA.map(d => (
                  <button key={d} type="button" onClick={() => toggleDia(d)} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', background: rutinaForm.dias.includes(d) ? 'var(--accent)' : 'var(--border)', color: rutinaForm.dias.includes(d) ? '#fff' : 'var(--text-faint)' }}>{d}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Crear</button>
                <button type="button" onClick={() => { setShowRutinaForm(false); setRutinaForm(BLANK_RUTINA) }} style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}

      {tab === 'rutas' && (
        <div>
          {rutas.map(r => (
            <div key={r.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '2rem' }}>{TIPO_ICON[r.tipo] ?? '🏅'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{r.nombre}</div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span>📏 {r.distancia_km} km</span>
                  <span>⛰️ {r.desnivel_m} m</span>
                  <span>⏱️ {r.tiempo_h} h</span>
                  <span style={{ color: DIFICULTAD_COLOR[r.dificultad] ?? 'var(--text-muted)', fontWeight: 600 }}>{r.dificultad}</span>
                  <span>{r.fecha}</span>
                </div>
                {r.notas && <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginTop: '0.3rem' }}>{r.notas}</div>}
              </div>
              <button onClick={() => saveRutas(rutas.filter(x => x.id !== r.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>🗑</button>
            </div>
          ))}
          {rutas.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin rutas registradas.</p>}
          {!showRutaForm ? (
            <button onClick={() => setShowRutaForm(true)} style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>+ Añadir ruta</button>
          ) : (
            <form onSubmit={addRuta} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input placeholder="Nombre" value={rutaForm.nombre} onChange={e => setRutaForm(f => ({ ...f, nombre: e.target.value }))} required style={inp} />
                <select value={rutaForm.tipo} onChange={e => setRutaForm(f => ({ ...f, tipo: e.target.value }))} style={inp}>
                  <option value="senderismo">🥾 Senderismo</option>
                  <option value="bici">🚴 Bici</option>
                  <option value="running">🏃 Running</option>
                  <option value="otro">🏅 Otro</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                <input type="number" step="0.1" placeholder="Km" value={rutaForm.distancia_km} onChange={e => setRutaForm(f => ({ ...f, distancia_km: e.target.value }))} style={inp} />
                <input type="number" placeholder="Desnivel m" value={rutaForm.desnivel_m} onChange={e => setRutaForm(f => ({ ...f, desnivel_m: e.target.value }))} style={inp} />
                <input type="number" step="0.5" placeholder="Horas" value={rutaForm.tiempo_h} onChange={e => setRutaForm(f => ({ ...f, tiempo_h: e.target.value }))} style={inp} />
                <select value={rutaForm.dificultad} onChange={e => setRutaForm(f => ({ ...f, dificultad: e.target.value }))} style={inp}>
                  <option value="facil">Fácil</option>
                  <option value="media">Media</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>
              <input placeholder="Notas" value={rutaForm.notas} onChange={e => setRutaForm(f => ({ ...f, notas: e.target.value }))} style={inp} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Añadir</button>
                <button type="button" onClick={() => { setShowRutaForm(false); setRutaForm(BLANK_RUTA) }} style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}

      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center' }}>💡 Demo — los cambios se guardan en esta sesión</p>
    </div>
  )
}
