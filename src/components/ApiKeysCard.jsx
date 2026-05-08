import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ─────────────────────────────────────────────────────────────
// ApiKeysCard — gestión de API keys del usuario
//
// Seguridad:
//   · El frontend NUNCA recibe el valor de una key guardada
//   · Solo sabe si está configurada (booleano) o no
//   · El guardado va siempre via edge function que cifra antes
//     de tocar la BD (AES-256-GCM, KEYS_ENCRYPTION_SECRET)
// ─────────────────────────────────────────────────────────────

const PROVIDERS = [
  {
    id: 'groq',
    name: 'Groq',
    field: 'groq_key_set',
    saveField: 'groq_key',
    description: 'Para transcripción de voz en Telegram (Whisper)',
    placeholder: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys',
    docsLabel: 'console.groq.com',
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    field: 'anthropic_key_set',
    saveField: 'anthropic_key',
    description: 'Para escanear tickets y generar recetas',
    placeholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    docsLabel: 'console.anthropic.com',
  },
]

function KeyRow({ provider, isSet, onSave, onDelete }) {
  const [editing, setEditing]   = useState(false)
  const [value, setValue]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [showVal, setShowVal]   = useState(false)

  async function handleSave() {
    const trimmed = value.trim()
    if (!trimmed) return
    setLoading(true); setError(null)
    try {
      await onSave(provider.saveField, trimmed)
      setValue('')
      setEditing(false)
    } catch (e) {
      setError(e.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar la API key de ${provider.name}? Las funciones que la usan dejarán de funcionar.`)) return
    setLoading(true); setError(null)
    try {
      await onDelete(provider.saveField)
    } catch (e) {
      setError(e.message || 'Error al eliminar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-3">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${isSet ? 'bg-green-500' : 'bg-[var(--border)]'}`} />
            <p className="text-sm font-semibold text-[var(--text)]">{provider.name}</p>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 pl-4">{provider.description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isSet && !editing && (
            <>
              <span className="text-xs text-green-500 font-medium">✓ Configurada</span>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] underline"
              >Cambiar</button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-xs text-red-500 hover:underline disabled:opacity-50"
              >Eliminar</button>
            </>
          )}
          {!isSet && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-medium text-[var(--accent)] hover:underline"
            >Añadir key →</button>
          )}
        </div>
      </div>

      {/* Formulario de entrada */}
      {editing && (
        <div className="space-y-2 pl-4">
          <p className="text-xs text-[var(--text-muted)]">
            Obtén tu key en{' '}
            <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer"
               className="text-[var(--accent)] hover:underline">{provider.docsLabel}</a>
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showVal ? 'text' : 'password'}
                value={value}
                onChange={e => { setValue(e.target.value); setError(null) }}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder={provider.placeholder}
                autoFocus
                className="w-full px-3 py-2 pr-9 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] focus:outline-none focus:border-[var(--accent)] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowVal(p => !p)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text)] text-xs"
                title={showVal ? 'Ocultar' : 'Mostrar'}
              >{showVal ? '🙈' : '👁'}</button>
            </div>
            <button
              onClick={handleSave}
              disabled={loading || !value.trim()}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold disabled:opacity-50 whitespace-nowrap"
            >{loading ? 'Guardando...' : 'Guardar'}</button>
            <button
              onClick={() => { setEditing(false); setValue(''); setError(null) }}
              className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-muted)]"
            >Cancelar</button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <p className="text-xs text-[var(--text-faint)]">
            🔒 La key se cifra antes de guardarse. Ni tú mismo podrás leerla después.
          </p>
        </div>
      )}
    </div>
  )
}

export function ApiKeysCard() {
  const [status, setStatus]   = useState(null)   // { groq_key_set, anthropic_key_set }
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStatus() }, [])

  async function loadStatus() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }

    const { data } = await supabase
      .from('user_api_keys')
      .select('groq_key_set, anthropic_key_set')
      .eq('user_id', session.user.id)
      .maybeSingle()

    setStatus(data ?? { groq_key_set: false, anthropic_key_set: false })
    setLoading(false)
  }

  async function callSaveEdge(payload) {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-api-keys`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )
    const data = await res.json()
    if (!res.ok || data.error) throw new Error(data.error || 'Error del servidor')
    await loadStatus()   // refresca el estado desde la BD
  }

  async function handleSave(field, value) {
    await callSaveEdge({ [field]: value })
  }

  async function handleDelete(field) {
    await callSaveEdge({ [field]: null })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="rounded-xl border border-[var(--border)] p-4">
            <div className="h-4 bg-[var(--bg)] rounded w-1/3 animate-pulse mb-2" />
            <div className="h-3 bg-[var(--bg)] rounded w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {PROVIDERS.map(provider => (
        <KeyRow
          key={provider.id}
          provider={provider}
          isSet={status?.[provider.field] ?? false}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
