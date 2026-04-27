// src/pages/Contact.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  },
}))

import Contact from './Contact'

function renderContact() {
  return render(<MemoryRouter><Contact /></MemoryRouter>)
}

describe('Contact', () => {
  it('renders heading and form fields', () => {
    renderContact()
    expect(screen.getByRole('heading', { name: /contacto/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument()
  })

  it('shows validation error when name is too short', () => {
    renderContact()
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('shows validation error when email is invalid', () => {
    renderContact()
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana García' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'not-an-email' } })
    fireEvent.change(screen.getByLabelText(/mensaje/i), { target: { value: 'Hola, me gustaría hablar contigo.' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))
    expect(screen.getByText(/email válido/i)).toBeInTheDocument()
  })

  it('shows success state after valid submission', async () => {
    renderContact()
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana García' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ana@example.com' } })
    fireEvent.change(screen.getByLabelText(/mensaje/i), { target: { value: 'Hola, me gustaría hablar contigo sobre un proyecto.' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText(/mensaje enviado/i)).toBeInTheDocument()
    })
  })
})
