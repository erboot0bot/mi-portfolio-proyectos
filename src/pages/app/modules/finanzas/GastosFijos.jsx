import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { demoRead, demoWrite } from '../../../../data/demo'

const CATEGORIAS = ['vivienda', 'suministros', 'conectividad', 'otros']
const CAT_ICONS = { vivienda: '🏠', suministros: '⚡', conectividad: '📡', otros: '💳' }
const CAT_LABELS = { vivienda: 'Vivienda', suministros: 'Suministros', conectividad: 'Conectividad', otros: 'Otros' }

const BLANK = { nombre: '', icono: '💳', categoria: 'vivienda', importe: '', dia_cobro: '1' }

export default function GastosFijos() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'finanzas'

  const [gastos, setGastos] = useState(() => demoRead(appType, 'gastos_fijos') ?? [])
  const [form, setForm] = useState(BLANK)
  const [showForm, setShowForm] = useState(false)

  const save = (next) => { setGastos(next); demoWrite(appType, 'gastos_fijos', next) }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.importe) return
    const entry = {
      id: crypto.randomUUID(),
      nombre: form.nombre.trim(),
      icono: form.icono || '💳',
      categoria: form.categoria,
      importe: parseFloat(form.importe),
      dia_cobro: parseInt(form.dia_cobro, 10) || 1,
    }
    save([...gastos, entry])
    setForm(BLANK)
    setShowForm(false)
  }

  const deleteGasto = (id) => save(gastos.filter(g => g.id !== id))

  const totalMensual = gastos.reduce((acc, g) => acc + g.importe, 0)

  const byCategory = CATEGORIAS.reduce((acc, cat) => {
    acc[cat] = gastos.filter(g => g.categoria === cat)
    return acc
  }, {})

  const inputStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.75rem', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Gastos fijos</h2>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total mensual</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
            {totalMensual.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
          </div>
        </div>
      </div>

      {/* Groups */}
      {CATEGORIAS.map(cat => {
        const items = byCategory[cat]
        if (items.length === 0) return null
        const catTotal = items.reduce((acc, g) => acc + g.importe, 0)
        return (
          <div key={cat} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {CAT_ICONS[cat]} {CAT_LABELS[cat]}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {catTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/mes
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {items.map(g => (
                <div key={g.id}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{g.icono}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{g.nombre}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>Día {g.dia_cobro} de cada mes</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '1rem' }}>
                    {g.importe.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </div>
                  <button onClick={() => deleteGasto(g.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', fontSize: '0.9rem' }}>🗑</button>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {gastos.length === 0 && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.5rem' }}>Sin gastos fijos registrados.</p>
      )}

      {/* Add form */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: `1px dashed var(--border)`, borderRadius: 10, color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>
          + Añadir gasto fijo
        </button>
      ) : (
        <form onSubmit={handleAdd}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.5rem 1fr', gap: '0.5rem' }}>
            <input value={form.icono} onChange={e => setForm(f => ({ ...f, icono: e.target.value }))} maxLength={2}
              style={{ ...inputStyle, textAlign: 'center', fontSize: '1.2rem', padding: '0.5rem' }} />
            <input placeholder="Nombre del gasto" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
              style={{ ...inputStyle, padding: '0.5rem' }}>
              {CATEGORIAS.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
            <input type="number" step="0.01" min="0" placeholder="Importe (€)" value={form.importe} onChange={e => setForm(f => ({ ...f, importe: e.target.value }))} required style={inputStyle} />
            <input type="number" min="1" max="31" placeholder="Día cobro" value={form.dia_cobro} onChange={e => setForm(f => ({ ...f, dia_cobro: e.target.value }))} style={inputStyle} />
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
