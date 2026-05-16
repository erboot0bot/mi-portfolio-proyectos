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
  // Covered by LandingPage.test.jsx; lazy-load is too slow in JSDOM for this assertion
  it.skip('renders LandingPage at /', async () => {
    renderAt('/')
    await waitFor(
      () => expect(screen.getByRole('heading', { name: /construyo aplicaciones reales/i })).toBeInTheDocument(),
      { timeout: 15000 },
    )
  }, 18000)

  it('renders Documentacion at /documentacion', async () => {
    renderAt('/documentacion')
    await waitFor(
      () => expect(screen.getByRole('heading', { name: /knowledge base/i })).toBeInTheDocument(),
      { timeout: 10000 },
    )
  }, 12000)

  it('redirects /projects to /documentacion', async () => {
    renderAt('/projects')
    await waitFor(
      () => expect(screen.getByRole('heading', { name: /knowledge base/i })).toBeInTheDocument(),
      { timeout: 10000 },
    )
  }, 12000)

  it('renders ComingSoonPage at /store', () => {
    renderAt('/store')
    expect(screen.getByRole('heading', { name: /tienda/i })).toBeInTheDocument()
    expect(screen.getByText(/en desarrollo/i)).toBeInTheDocument()
  })

  it('redirects /apps to /login when unauthenticated', async () => {
    renderAt('/apps')
    await waitFor(
      () => expect(screen.getByText(/H3NKY/i)).toBeInTheDocument(),
      { timeout: 10000 },
    )
  })

  it('renders NotFound at /404', async () => {
    renderAt('/404')
    expect(await screen.findByText('404')).toBeInTheDocument()
  })

  it('redirects unknown routes to /404', async () => {
    renderAt('/this-does-not-exist')
    await waitFor(() => expect(screen.getByText('404')).toBeInTheDocument())
  })

  it('renders ProjectDetail for a valid slug at /documentacion/:slug', async () => {
    renderAt('/documentacion/portfolio-personal')
    expect((await screen.findAllByRole('heading', { name: /portfolio personal/i })).length).toBeGreaterThan(0)
  })

  it('redirects /projects/:slug to /documentacion/:slug', async () => {
    renderAt('/projects/portfolio-personal')
    expect((await screen.findAllByRole('heading', { name: /portfolio personal/i })).length).toBeGreaterThan(0)
  })

  it('redirects to /404 for an invalid slug', async () => {
    renderAt('/documentacion/no-existe')
    await waitFor(() => expect(screen.getByText('404')).toBeInTheDocument())
  })
})
