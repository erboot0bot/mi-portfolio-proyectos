import { useOutletContext } from 'react-router-dom'
import { demoRead } from '../../../../data/demo'

function aniosRestantes(fechaFinStr) {
  if (!fechaFinStr) return null
  const diff = new Date(fechaFinStr) - new Date()
  return Math.max(0, Math.round(diff / (365.25 * 24 * 3600 * 1000)))
}

export default function Hipoteca() {
  const { app } = useOutletContext()
  const appType = app?.type ?? 'finanzas'

  const raw = demoRead(appType, 'hipoteca')
  const hipoteca = Array.isArray(raw) ? null : raw

  if (!hipoteca) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>No hay hipoteca registrada.</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>Esta app es solo demo — los datos se muestran tal cual.</p>
      </div>
    )
  }

  const amortizado = hipoteca.capital_inicial - hipoteca.capital_pendiente
  const pct = hipoteca.capital_inicial > 0 ? (amortizado / hipoteca.capital_inicial) * 100 : 0
  const aniosRest = aniosRestantes(hipoteca.fecha_fin)

  const statStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '1.25rem',
  }

  const labelStyle = { fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }
  const valueStyle = { fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.4rem', color: 'var(--text)' }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Hipoteca</h2>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          🏦 {hipoteca.banco}
        </div>
      </div>

      {/* Capital progress */}
      <div style={{ ...statStyle, marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <div style={labelStyle}>Capital amortizado</div>
            <div style={{ ...valueStyle, color: 'var(--accent)' }}>
              {amortizado.toLocaleString('es-ES')} € <span style={{ fontSize: '1rem', fontWeight: 400 }}>({pct.toFixed(1)}%)</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={labelStyle}>Capital pendiente</div>
            <div style={valueStyle}>{hipoteca.capital_pendiente.toLocaleString('es-ES')} €</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ background: 'var(--border)', borderRadius: 999, height: 10, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: 'var(--accent)', borderRadius: 999, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: 'var(--text-faint)' }}>
          <span>Inicio: {hipoteca.fecha_inicio}</span>
          <span>Fin: {hipoteca.fecha_fin}{aniosRest !== null ? ` (${aniosRest} años)` : ''}</span>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={statStyle}>
          <div style={labelStyle}>Cuota mensual</div>
          <div style={{ ...valueStyle, color: 'var(--accent)' }}>{hipoteca.cuota_mensual.toLocaleString('es-ES')} €</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: 4 }}>Día {hipoteca.dia_cobro} de mes</div>
        </div>
        <div style={statStyle}>
          <div style={labelStyle}>Tipo de interés</div>
          <div style={{ ...valueStyle, textTransform: 'capitalize' }}>{hipoteca.tipo_interes}</div>
          {hipoteca.diferencial && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: 4 }}>Diferencial: {hipoteca.diferencial}%</div>
          )}
        </div>
      </div>

      <div style={{ ...statStyle }}>
        <div style={labelStyle}>Gestor / Contacto</div>
        <div style={{ fontWeight: 500 }}>{hipoteca.gestor || '—'}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: 2 }}>Banco: {hipoteca.banco}</div>
      </div>

      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center' }}>
        💡 Demo — panel informativo. Los datos se cargan del perfil demo.
      </p>
    </div>
  )
}
