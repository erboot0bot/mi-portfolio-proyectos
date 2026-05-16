import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'
import { addCalendarEvent } from '../../../../utils/calendarUtils'

const TIPO_ICONS = { hogar: '🏠', vida: '❤️', dental: '🦷', coche: '🚗', otros: '📋' }
const TIPOS = ['hogar', 'vida', 'dental', 'coche', 'otros']

const BLANK = { tipo: 'hogar', nombre: '', compania: '', poliza: '', vencimiento: '', coste_anual: '' }

function diasHasta(fechaStr) {
  if (!fechaStr) return null
  const diff = new Date(fechaStr) - new Date()
  return Math.ceil(diff / 86400000)
}

function semaforo(dias) {
  if (dias === null) return { color: 'var(--text-faint)', label: 'Sin fecha' }
  if (dias < 0)  return { color: '#ef4444', label: `Vencido hace ${Math.abs(dias)} días` }
  if (dias < 30) return { color: '#ef4444', label: `Vence en ${dias} días` }
  if (dias < 90) return { color: '#f59e0b', label: `Vence en ${dias} días` }
  return { color: '#22c55e', label: `Válido ${dias} días` }
}

export default function Seguros() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'finanzas'

  const [seguros, setSeguros] = useState(() => demoRead(appType, 'seguros') ?? [])
  const [form, setForm] = useState(BLANK)
  const [showForm, setShowForm] = useState(false)

  const save = (next) => { setSeguros(next); demoWrite(appType, 'seguros', next) }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.coste_anual) return
    const entry = {
      id: crypto.randomUUID(),
      tipo: form.tipo,
      nombre: form.nombre.trim(),
      compania: form.compania.trim(),
      poliza: form.poliza.trim(),
      vencimiento: form.vencimiento || null,
      coste_anual: parseFloat(form.coste_anual),
    }
    save([...seguros, entry])
    setForm(BLANK)
    setShowForm(false)
  }

  const deleteSeg = (id) => save(seguros.filter(s => s.id !== id))

  function addSeguroToCalendar(seg) {
    addCalendarEvent(appType, {
      event_type: 'insurance_expiry',
      title: `🛡️ ${seg.nombre} — vencimiento`,
      start_time: new Date(seg.vencimiento + 'T09:00:00').toISOString(),
      all_day: true,
      metadata: { seguro_id: seg.id, compania: seg.compania, coste_anual: seg.coste_anual },
    })
  }

  const totalAnual = seguros.reduce((acc, s) => acc + (s.coste_anual ?? 0), 0)

  return (
    <div style={{ padding: '1.5rem', maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Seguros</h2>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total anual</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
            {totalAnual.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {seguros.map(seg => {
          const dias = diasHasta(seg.vencimiento)
          const sem = semaforo(dias)
          return (
            <div key={seg.id}
              style={{ background: 'var(--bg-card)', border: `1px solid ${dias !== null && dias < 30 ? '#ef444440' : 'var(--border)'}`, borderRadius: 12, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>{TIPO_ICONS[seg.tipo] ?? '📋'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{seg.nombre}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{seg.compania} · Póliza: {seg.poliza || '—'}</div>
                <div style={{ fontSize: '0.8rem', color: sem.color, marginTop: 4, fontWeight: dias !== null && dias < 90 ? 600 : 400 }}>
                  {sem.label}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{(seg.coste_anual ?? 0).toLocaleString('es-ES')} €</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ año</div>
              </div>
              <button onClick={() => addSeguroToCalendar(seg)} title="Añadir al calendario"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}>📅</button>
              <button onClick={() => deleteSeg(seg.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '1rem' }}>🗑</button>
            </div>
          )
        })}
        {seguros.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin seguros registrados.</p>
        )}
      </div>

      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: `1px dashed var(--border)`, borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>
          + Añadir seguro
        </button>
      ) : (
        <form onSubmit={handleAdd}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)' }}>
              {TIPOS.map(t => <option key={t} value={t}>{TIPO_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <input placeholder="Nombre del seguro" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <input placeholder="Compañía" value={form.compania} onChange={e => setForm(f => ({ ...f, compania: e.target.value }))}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)' }} />
            <input placeholder="Nº póliza" value={form.poliza} onChange={e => setForm(f => ({ ...f, poliza: e.target.value }))}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Vencimiento</label>
              <input type="date" value={form.vencimiento} onChange={e => setForm(f => ({ ...f, vencimiento: e.target.value }))}
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Coste anual (€)</label>
              <input type="number" step="0.01" min="0" placeholder="0.00" value={form.coste_anual} onChange={e => setForm(f => ({ ...f, coste_anual: e.target.value }))} required
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit"
              style={{ flex: 1, padding: '0.6rem', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              Añadir
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(BLANK) }}
              style={{ padding: '0.6rem 1rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center' }}>
        💡 Demo — los cambios se guardan en esta sesión
      </p>
    </div>
  )
}
