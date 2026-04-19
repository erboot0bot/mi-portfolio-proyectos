import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../contexts/AuthContext'

describe('ProtectedRoute', () => {
  it('shows spinner while loading', () => {
    useAuth.mockReturnValue({ user: null, loading: true })
    render(
      <MemoryRouter>
        <ProtectedRoute><div>secret</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.queryByText('secret')).toBeNull()
    expect(document.querySelector('.animate-spin')).toBeTruthy()
  })

  it('redirects to /login when not authenticated', () => {
    useAuth.mockReturnValue({ user: null, loading: false })
    render(
      <MemoryRouter initialEntries={['/hogar']}>
        <Routes>
          <Route path="/hogar" element={<ProtectedRoute><div>secret</div></ProtectedRoute>} />
          <Route path="/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('login page')).toBeInTheDocument()
    expect(screen.queryByText('secret')).toBeNull()
  })

  it('renders children when authenticated', () => {
    useAuth.mockReturnValue({ user: { id: '123', email: 'a@b.com' }, loading: false })
    render(
      <MemoryRouter>
        <ProtectedRoute><div>secret</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.getByText('secret')).toBeInTheDocument()
  })
})
