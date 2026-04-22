import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({ user: null, loading: false, signOut: vi.fn() }),
}))

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App routing', () => {
  it('renders LandingPage at /', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: /herramientas reales/i })).toBeInTheDocument()
  })

  it('renders ProjectsHome at /projects', () => {
    renderAt('/projects')
    expect(screen.getByRole('heading', { name: /proyectos/i })).toBeInTheDocument()
  })

  it('renders ComingSoonPage at /courses', () => {
    renderAt('/courses')
    expect(screen.getByRole('heading', { name: /cursos/i })).toBeInTheDocument()
    expect(screen.getByText(/en desarrollo/i)).toBeInTheDocument()
  })

  it('renders ComingSoonPage at /store', () => {
    renderAt('/store')
    expect(screen.getByRole('heading', { name: /tienda/i })).toBeInTheDocument()
    expect(screen.getByText(/en desarrollo/i)).toBeInTheDocument()
  })

  it('redirects /apps to /login when unauthenticated', async () => {
    renderAt('/apps')
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /hogar/i })).toBeInTheDocument()
    )
  })

  it('renders NotFound at /404', () => {
    renderAt('/404')
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('redirects unknown routes to /404', async () => {
    renderAt('/this-does-not-exist')
    await waitFor(() => expect(screen.getByText('404')).toBeInTheDocument())
  })

  it('renders ProjectDetail for a valid slug', () => {
    renderAt('/projects/portfolio-personal')
    expect(screen.getByRole('heading', { name: /portfolio personal/i })).toBeInTheDocument()
  })

  it('redirects to /404 for an invalid slug', async () => {
    renderAt('/projects/no-existe')
    await waitFor(() => expect(screen.getByText('404')).toBeInTheDocument())
  })
})
