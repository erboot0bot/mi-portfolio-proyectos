import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMode } from '../../../../contexts/ModeContext'
import { demoRead, demoWrite } from '../../../../data/demo/index.js'

const TIPOS_DOC = ['DNI', 'Pasaporte', 'Carnet de conducir', 'Tarjeta sanitaria', 'Otros']

function diasHasta(fechaStr) {
  if (!fechaStr) return null
  return Math.round((new Date(fechaStr) - new Date()) / (1000 * 60 * 60 * 24))
}

function semaforo(dias) {
  if (dias === null) return { color: 'var(--text-faint)', label: 'Sin fecha',           border: 'var(--border)',          bg: 'var(--bg-card)' }
  if (dias < 0)     return { color: '#ef4444',           label: `Caducado hace ${Math.abs(dias)}d`, border: 'rgba(239,68,68,.4)',  bg: 'rgba(239,68,68,.05)' }
  if (dias < 60)    return { color: '#f59e0b',           label: `Caduca en ${dias}d`,  border: 'rgba(245,158,11,.4)',    bg: 'rgba(245,158,11,.05)' }
  return              { color: '#22c55e',           label: `Válido ${dias}d`,    border: 'var(--border)',          bg: 'var(--bg-card)' }
}

export default function Documentacion() {
  const { app } = useOutletContext()
  const { mode } = useMode()

  const [docs, setDocs] = useState(() =>
    mode === 'demo' ? (demoRead(app.type ?? 'personal', 'documentacion') ?? []) : []
  )
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ tipo: 'DNI', numero: '', caducidad: '', notas: '' })

  function handleAdd() {
    const nuevo = {
      id: crypto.randomUUID(),
      tipo: form.tipo,
      numero: form.numero.trim() || '—',
      caducidad: form.caducidad || null,
      notas: form.notas.trim() || null,
    }
    const next = [...docs, nuevo]
    setDocs(next)
    if (mode === 'demo') demoWrite(app.type ?? 'personal', 'documentacion', next)
    setForm({ tipo: 'DNI', numero: '', caducidad: '', notas: '' })
    setShowAdd(false)
  }

  function eliminar(id) {
    const next = docs.filter(d => d.id !== id)
    setDocs(next)
    if (mode === 'demo') demoWrite(app.type ?? 'personal', 'documentacion', next)
  }

  const caducados = docs.filter(d => { const n = diasHasta(d.caducidad); return n !== null && n < 0 }).length
  const proximos  = docs.filter(d => { const n = diasHasta(d.caducidad); return n !== null && n >= 0 && n < 60 }).length

  return (
    <div style={{ padding: '20px', maxWidth: 580, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>📄 Documentación</h1>
          <p style={{ fontSize: 13, margin: '4px 0 0',
            color: caducados > 0 ? '#ef4444' : proximos > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
            {caducados > 0
              ? `⚠️ ${caducados} doc${caducados !== 1 ? 's' : ''} caducado${caducados !== 1 ? 's' : ''}`
              : proximos > 0
              ? `⏰ ${proximos} próximo${proximos !== 1 ? 's' : ''} a caducar`
              : `${docs.length} documentos`}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(p => !p)}
          style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, flexShrink: 0 }}
        >+ Añadir</button>
      </div>

      {/* Formulario */}
      {showAdd && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Nuevo documento</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
              {TIPOS_DOC.map(t => <option key={t}>{t}</option>)}
            </select>
            <input value={form.numero} onChange={e => setForm(p => ({ ...p, numero: e.target.value }))}
              placeholder="Número / identificador"
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Caducidad</label>
                <input type="date" value={form.caducidad} onChange={e => setForm(p => ({ ...p, caducidad: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--text-faint)', display: 'block', marginBottom: 3 }}>Notas</label>
                <input value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
                  placeholder="Opcional"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
                Cancelar
              </button>
              <button onClick={handleAdd}
                style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {docs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 40, margin: '0 0 8px' }}>📄</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>Sin documentos</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            Añade tus documentos importantes para recibir alertas de caducidad
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {docs.map(d => {
            const dias = diasHasta(d.caducidad)
            const sem  = semaforo(dias)
            return (
              <div key={d.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 12,
                background: sem.bg, border: `1px solid ${sem.border}`,
              }}
                onMouseEnter={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '1' }}
                onMouseLeave={e => { const b = e.currentTarget.querySelector('.del-btn'); if (b) b.style.opacity = '0' }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>📄</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{d.tipo}</p>
                  <p style={{ margin: '1px 0 0', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {d.numero}
                  </p>
                  {d.notas && (
                    <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>{d.notas}</p>
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: sem.color, flexShrink: 0 }}>
                  {sem.label}
                </span>
                <button className="del-btn" onClick={() => eliminar(d.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 18, padding: '0 4px', opacity: 0, transition: 'opacity .15s', marginLeft: 4 }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ef4444' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)' }}
                >×</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
