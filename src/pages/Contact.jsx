// src/pages/Contact.jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'

function validate(form) {
  const errs = {}
  if (form.name.trim().length < 2)
    errs.name = 'El nombre debe tener al menos 2 caracteres.'
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
    errs.email = 'Introduce un email válido.'
  if (form.message.trim().length < 10)
    errs.message = 'El mensaje debe tener al menos 10 caracteres.'
  return errs
}

export default function Contact() {
  const [form, setForm]     = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'success' | 'error'
  const [errors, setErrors] = useState({})

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); setStatus('idle'); return }
    setErrors({})
    setStatus('sending')
    const { error } = await supabase.from('contact_messages').insert({
      name:    form.name.trim(),
      email:   form.email.trim().toLowerCase(),
      message: form.message.trim(),
    })
    if (error) { setStatus('error'); return }
    setStatus('success')
    setForm({ name: '', email: '', message: '' })
  }

  const inputClass = 'w-full px-4 py-2.5 rounded-lg border bg-[var(--bg)] text-[var(--text)] ' +
    'text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)] border-[var(--border)]'

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <title>Contacto | H3nky</title>

      <h1 className="text-3xl font-extrabold text-[var(--text)] mb-2">Contacto</h1>
      <p className="text-[var(--text-muted)] mb-10">
        ¿Tienes una idea, propuesta o simplemente quieres saludar? Escríbeme.
      </p>

      {status === 'success' ? (
        <div role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50
            dark:bg-emerald-500/10 dark:border-emerald-500/30 p-10 text-center">
          <p className="text-3xl mb-3">✅</p>
          <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-lg">
            ¡Mensaje enviado!
          </p>
          <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
            Te responderé lo antes posible.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-6 text-sm underline underline-offset-4
              text-emerald-600 dark:text-emerald-400 hover:opacity-80 transition-opacity"
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <div>
            <label htmlFor="contact-name"
              className="block text-sm font-medium text-[var(--text)] mb-1.5">
              Nombre <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <input
              id="contact-name"
              type="text"
              required
              autoComplete="name"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={inputClass}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-xs text-red-500">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="contact-email"
              className="block text-sm font-medium text-[var(--text)] mb-1.5">
              Email <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={inputClass}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="contact-message"
              className="block text-sm font-medium text-[var(--text)] mb-1.5">
              Mensaje <span aria-hidden="true" className="text-red-400">*</span>
            </label>
            <textarea
              id="contact-message"
              required
              rows={5}
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'message-error' : undefined}
              className={`${inputClass} resize-none`}
            />
            {errors.message && (
              <p id="message-error" className="mt-1 text-xs text-red-500">
                {errors.message}
              </p>
            )}
          </div>

          {Object.keys(errors).length > 0 && (
            <p role="alert" className="text-sm text-red-500">
              Por favor, corrige los errores del formulario.
            </p>
          )}

          {status === 'error' && (
            <p role="alert" className="text-sm text-red-500">
              No se pudo enviar el mensaje. Inténtalo de nuevo.
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="self-start px-6 py-2.5 rounded-lg bg-[var(--accent)] text-white
              text-sm font-semibold hover:opacity-90 active:scale-95 transition-all
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === 'sending' ? 'Enviando…' : 'Enviar mensaje'}
          </button>
        </form>
      )}
    </div>
  )
}
