import { useState } from 'react'
import { Link } from 'react-router-dom'

const DEMO_KEYS = {
  telegram_token: '7291048563:AAFk3mXpL8_demo_bot_token_h3nky',
  telegram_chat_id: '-1001987654321',
  groq_api_key: 'gsk_demo_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  anthropic_api_key: 'sk-ant-demo-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxxxxxxxxx',
}

const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
  </svg>
)

const IconEye = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const SECTIONS = [
  {
    id: 'telegram',
    title: 'Telegram Bot',
    color: '#229ED9',
    bg: 'rgba(34,158,217,0.08)',
    border: 'rgba(34,158,217,0.25)',
    description: 'Recibe notificaciones y alertas inteligentes directamente en Telegram.',
    fields: [
      { key: 'telegram_token',   label: 'Bot Token',  hint: 'Obtenlo desde @BotFather en Telegram' },
      { key: 'telegram_chat_id', label: 'Chat ID',    hint: 'ID del chat donde recibirás los mensajes' },
    ],
  },
  {
    id: 'groq',
    title: 'Groq AI',
    color: '#F55036',
    bg: 'rgba(245,80,54,0.08)',
    border: 'rgba(245,80,54,0.25)',
    description: 'Inferencia ultrarrápida para respuestas en tiempo real con modelos Llama.',
    fields: [
      { key: 'groq_api_key', label: 'API Key', hint: 'Disponible en console.groq.com' },
    ],
  },
  {
    id: 'anthropic',
    title: 'Claude (Anthropic)',
    color: '#D97706',
    bg: 'rgba(217,119,6,0.08)',
    border: 'rgba(217,119,6,0.25)',
    description: 'Genera recetas, analiza gastos y extrae insights con Claude Sonnet.',
    fields: [
      { key: 'anthropic_api_key', label: 'API Key', hint: 'Disponible en console.anthropic.com' },
    ],
  },
]

function ApiField({ fieldKey, label, hint, value, onChange }) {
  const [visible, setVisible] = useState(false)
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 600,
        color: 'var(--text-muted)', marginBottom: 6,
        fontFamily: 'var(--font-mono)', letterSpacing: '0.5px',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(fieldKey, e.target.value)}
          style={{
            width: '100%', padding: '10px 40px 10px 12px',
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text)', fontSize: 13,
            fontFamily: 'var(--font-mono)', outline: 'none',
            boxSizing: 'border-box', transition: 'border-color 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-faint)', padding: 4, display: 'flex',
          }}
        >
          <IconEye open={visible} />
        </button>
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4, fontFamily: 'var(--font-body)' }}>
        {hint}
      </p>
    </div>
  )
}

export default function DemoSettings() {
  const [values, setValues] = useState(DEMO_KEYS)
  const [saved, setSaved] = useState(false)

  const handleChange = (key, val) => {
    setSaved(false)
    setValues(prev => ({ ...prev, [key]: val }))
  }

  const handleSave = e => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text)',
      fontFamily: 'var(--font-body)',
    }}>
      {/* Top bar */}
      <div style={{
        borderBottom: '1px solid var(--border)', padding: '0 32px',
        height: 52, display: 'flex', alignItems: 'center', gap: 16,
        background: 'var(--bg-subtle)',
      }}>
        <Link to="/demo" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13,
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <IconBack /> Demo
        </Link>
        <span style={{ color: 'var(--border)' }}>›</span>
        <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>Configuración</span>
        <span style={{
          marginLeft: 8, fontSize: 10, padding: '2px 8px', borderRadius: 99,
          background: 'rgba(254,112,0,0.15)', color: 'var(--accent)',
          fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.5px',
        }}>DEMO</span>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
          }}>
            <div style={{ width: 36, height: 36, overflow: 'hidden', flexShrink: 0 }}>
              <img src="/logo-horizontal.png" alt="H3nky" style={{ height: 36, maxWidth: 'none', display: 'block' }} />
            </div>
            <h1 style={{
              fontSize: 24, fontWeight: 700, margin: 0,
              fontFamily: 'var(--font-tech)', letterSpacing: '1px',
            }}>
              APIs &amp; Integraciones
            </h1>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
            Conecta tus servicios externos para activar notificaciones inteligentes,
            generación de recetas con IA y análisis de gastos. En modo demo los datos
            están prerellenados — no se guardan al cerrar la sesión.
          </p>
        </div>

        <form onSubmit={handleSave}>
          {SECTIONS.map(section => (
            <div key={section.id} style={{
              marginBottom: 24, padding: '20px 24px',
              background: section.bg, border: `1px solid ${section.border}`,
              borderRadius: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: section.color, flexShrink: 0 }} />
                <h2 style={{
                  fontSize: 14, fontWeight: 700, margin: 0,
                  color: section.color, fontFamily: 'var(--font-tech)', letterSpacing: '0.5px',
                }}>
                  {section.title}
                </h2>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                {section.description}
              </p>
              {section.fields.map(f => (
                <ApiField
                  key={f.key}
                  fieldKey={f.key}
                  label={f.label}
                  hint={f.hint}
                  value={values[f.key]}
                  onChange={handleChange}
                />
              ))}
            </div>
          ))}

          {/* Save button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button type="button" onClick={() => setValues(DEMO_KEYS)} style={{
              padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontFamily: 'var(--font-body)',
            }}>
              Restablecer demo
            </button>
            <button type="submit" style={{
              padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
              fontWeight: 600, fontFamily: 'var(--font-body)', border: 'none',
              background: saved ? '#22c55e' : 'var(--accent)',
              color: 'white', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'background 0.2s',
            }}>
              {saved ? <><IconCheck /> Guardado</> : 'Guardar configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
