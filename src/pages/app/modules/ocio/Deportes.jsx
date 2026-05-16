import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const inp = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }
const DEPORTE_ICON = { Fútbol: '⚽', Baloncesto: '🏀', Tenis: '🎾', 'Fórmula 1': '🏎️', MotoGP: '🏍️', Ciclismo: '🚴', Pádel: '🏓', Golf: '⛳', Rugby: '🏉', Otros: '🏅' }
const BLANK_EQUIPO = { deporte: 'Fútbol', equipo: '', competicion: '' }
const BLANK_RESULT = { goles_local: '', goles_visitante: '' }

export default function Deportes() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'ocio'
  const [items, setItems] = useState(() => demoRead(appType, 'deportes_seguimiento') ?? [])
  const [selectedId, setSelectedId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(BLANK_EQUIPO)
  const [resultForms, setResultForms] = useState({})

  const save = next => { setItems(next); demoWrite(appType, 'deportes_seguimiento', next) }
  const selected = items.find(d => d.id === selectedId) ?? null

  function addEquipo(e) {
    e.preventDefault()
    if (!form.equipo.trim()) return
    save([...items, { id: crypto.randomUUID(), ...form, partidos: [] }])
    setForm(BLANK_EQUIPO); setShowAdd(false)
  }

  function saveResult(partidoId) {
    const r = resultForms[partidoId] ?? {}
    if (r.goles_local === '' || r.goles_visitante === '') return
    save(items.map(d => d.id === selectedId ? {
      ...d, partidos: d.partidos.map(p => p.id === partidoId ? {
        ...p, goles_local: parseInt(r.goles_local), goles_visitante: parseInt(r.goles_visitante)
      } : p)
    } : d))
    setResultForms(f => { const n = { ...f }; delete n[partidoId]; return n })
  }

  const today = new Date().toISOString().slice(0, 10)

  if (selected) {
    const proximos  = selected.partidos.filter(p => p.fecha >= today && p.goles_local === null).sort((a, b) => a.fecha.localeCompare(b.fecha))
    const pasados   = selected.partidos.filter(p => p.goles_local !== null || p.fecha < today).sort((a, b) => b.fecha.localeCompare(a.fecha))
    const icon = DEPORTE_ICON[selected.deporte] ?? '🏅'

    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button onClick={() => setSelectedId(null)} style={{ marginBottom: 16, background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 14, padding: 0 }}>← Deportes</button>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: '2px solid #a855f7', borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{icon} {selected.equipo}</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{selected.deporte} · {selected.competicion}</p>
        </div>

        {proximos.length > 0 && (
          <>
            <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Próximos partidos</h3>
            {proximos.map(p => (
              <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{p.es_local ? selected.equipo : p.rival} vs {p.es_local ? p.rival : selected.equipo}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)', marginLeft: 8 }}>{p.es_local ? '(local)' : '(visitante)'}</span>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.fecha}</span>
                </div>
              </div>
            ))}
          </>
        )}

        {pasados.length > 0 && (
          <>
            <h3 style={{ margin: '16px 0 10px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Resultados</h3>
            {pasados.map(p => {
              const scored = p.goles_local !== null
              const won = scored && (p.es_local ? p.goles_local > p.goles_visitante : p.goles_visitante > p.goles_local)
              const lost = scored && (p.es_local ? p.goles_local < p.goles_visitante : p.goles_visitante < p.goles_local)
              return (
                <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{p.es_local ? selected.equipo : p.rival} vs {p.es_local ? p.rival : selected.equipo}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {scored
                        ? <span style={{ fontSize: 16, fontWeight: 700, color: won ? '#22c55e' : lost ? '#ef4444' : 'var(--text)' }}>{p.goles_local} - {p.goles_visitante}</span>
                        : (
                          resultForms[p.id] !== undefined
                            ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input type="number" min="0" placeholder="0" value={resultForms[p.id]?.goles_local ?? ''} onChange={e => setResultForms(f => ({ ...f, [p.id]: { ...f[p.id], goles_local: e.target.value } }))} style={{ ...inp, width: 50, textAlign: 'center' }} />
                                <span>-</span>
                                <input type="number" min="0" placeholder="0" value={resultForms[p.id]?.goles_visitante ?? ''} onChange={e => setResultForms(f => ({ ...f, [p.id]: { ...f[p.id], goles_visitante: e.target.value } }))} style={{ ...inp, width: 50, textAlign: 'center' }} />
                                <button onClick={() => saveResult(p.id)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>✓</button>
                              </div>
                            : <button onClick={() => setResultForms(f => ({ ...f, [p.id]: BLANK_RESULT }))} style={{ fontSize: 11, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: 'var(--text-muted)' }}>+ Resultado</button>
                        )
                      }
                      <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{p.fecha}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {selected.partidos.length === 0 && (
          <p style={{ color: 'var(--text-faint)', fontSize: 13, fontStyle: 'italic' }}>Sin partidos registrados</p>
        )}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>⚽ Deportes</h2>
        <button onClick={() => setShowAdd(v => !v)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Seguir equipo</button>
      </div>
      {showAdd && (
        <form onSubmit={addEquipo} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16, display: 'grid', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 8 }}>
            <select value={form.deporte} onChange={e => setForm(f => ({ ...f, deporte: e.target.value }))} style={inp}>
              {Object.keys(DEPORTE_ICON).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input placeholder="Equipo / piloto *" value={form.equipo} onChange={e => setForm(f => ({ ...f, equipo: e.target.value }))} required style={inp} />
            <input placeholder="Competición" value={form.competicion} onChange={e => setForm(f => ({ ...f, competicion: e.target.value }))} style={inp} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAdd(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>Cancelar</button>
            <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Seguir</button>
          </div>
        </form>
      )}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-faint)' }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>⚽</p>
          <p style={{ fontSize: 14 }}>No sigues ningún equipo todavía</p>
        </div>
      ) : items.map(d => {
        const icon = DEPORTE_ICON[d.deporte] ?? '🏅'
        const proximo = d.partidos.find(p => p.fecha >= today && p.goles_local === null)
        return (
          <div key={d.id} onClick={() => setSelectedId(d.id)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 10, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{icon} {d.equipo}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{d.deporte} · {d.competicion}</div>
              </div>
              {proximo && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Próximo</div>
                  <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>vs {proximo.rival}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{proximo.fecha}</div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
