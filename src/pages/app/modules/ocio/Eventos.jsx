import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const inp = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }
const TIPO_ICON = { concierto: '🎵', teatro: '🎭', festival: '🎪', exposicion: '🖼️', otro: '🎟️' }
const BLANK = { tipo: 'concierto', titulo: '', artista: '', recinto: '', ciudad: '', fecha: '', precio: '', estado: 'confirmado', notas: '' }
function Pill({ label, active, onClick }) {
  return <button onClick={onClick} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: active ? 700 : 500, color: active ? '#fff' : 'var(--text-muted)', background: active ? 'var(--accent)' : 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer' }}>{label}</button>
}

export default function Eventos() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'ocio'
  const [items, setItems] = useState(() => demoRead(appType, 'eventos') ?? [])
  const [filtro, setFiltro] = useState('todos')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(BLANK)

  const save = next => { setItems(next); demoWrite(appType, 'eventos', next) }
  const today = new Date().toISOString().slice(0, 10)

  const filtered = items.filter(e =>
    filtro === 'proximos' ? e.fecha >= today
    : filtro === 'pasados' ? e.fecha < today
    : true
  ).sort((a, b) => {
    if (filtro === 'pasados') return b.fecha.localeCompare(a.fecha)
    return a.fecha.localeCompare(b.fecha)
  })

  function addEvento(e) {
    e.preventDefault()
    if (!form.titulo.trim() || !form.fecha) return
    save([...items, { id: crypto.randomUUID(), ...form, precio: parseFloat(form.precio) || 0, valoracion: 0 }])
    setForm(BLANK); setShowAdd(false)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>🎟️ Eventos</h2>
        <button onClick={() => setShowAdd(v => !v)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Añadir</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[['todos', 'Todos'], ['proximos', 'Próximos'], ['pasados', 'Pasados']].map(([val, label]) => (
          <Pill key={val} label={label} active={filtro === val} onClick={() => setFiltro(val)} />
        ))}
      </div>
      {showAdd && (
        <form onSubmit={addEvento} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 16, display: 'grid', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
            <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} style={inp}>
              {Object.keys(TIPO_ICON).map(t => <option key={t} value={t}>{TIPO_ICON[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <input placeholder="Título del evento *" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} required style={inp} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input placeholder="Artista / Compañía" value={form.artista} onChange={e => setForm(f => ({ ...f, artista: e.target.value }))} style={inp} />
            <input placeholder="Recinto" value={form.recinto} onChange={e => setForm(f => ({ ...f, recinto: e.target.value }))} style={inp} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <input placeholder="Ciudad" value={form.ciudad} onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))} style={inp} />
            <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} required style={inp} />
            <input type="number" placeholder="Precio (€)" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} style={inp} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAdd(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>Cancelar</button>
            <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
          </div>
        </form>
      )}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-faint)' }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>🎟️</p>
          <p style={{ fontSize: 14 }}>Sin eventos {filtro === 'proximos' ? 'próximos' : filtro === 'pasados' ? 'pasados' : ''}</p>
        </div>
      ) : filtered.map(ev => (
        <div key={ev.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, background: '#a855f722', color: '#a855f7', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>{TIPO_ICON[ev.tipo] ?? '🎟️'} {ev.tipo}</span>
                {ev.estado === 'asistido' && <span style={{ fontSize: 11, background: '#22c55e22', color: '#22c55e', borderRadius: 6, padding: '2px 8px' }}>✓ Asistido</span>}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{ev.titulo}</div>
              {ev.artista && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{ev.artista}</div>}
              {ev.recinto && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ev.recinto}{ev.ciudad ? ` · ${ev.ciudad}` : ''}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{ev.fecha}</div>
              {ev.precio > 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{ev.precio}€</div>}
              {ev.valoracion > 0 && <div style={{ fontSize: 12, color: '#f59e0b' }}>{'★'.repeat(ev.valoracion)}</div>}
            </div>
          </div>
          {ev.notas && <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{ev.notas}</p>}
        </div>
      ))}
    </div>
  )
}
