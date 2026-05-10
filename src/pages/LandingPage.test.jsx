import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LanguageProvider } from '../contexts/LanguageContext'
import LandingPage from './LandingPage'

function renderLanding() {
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <LandingPage />
      </LanguageProvider>
    </MemoryRouter>
  )
}

describe('LandingPage', () => {
  it('renders the hero section with kicker text', () => {
    renderLanding()
    expect(screen.getByText(/H3NKY · DEV · 2026/i)).toBeInTheDocument()
  })

  it('renders the hero logo image', () => {
    renderLanding()
    const logos = screen.getAllByRole('img', { name: /h3nky/i })
    expect(logos.length).toBeGreaterThan(0)
  })

  it('renders the stats section with metric values', () => {
    renderLanding()
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('Apps en producción')).toBeInTheDocument()
  })

  it('renders the pillars section with Demo pillar', () => {
    renderLanding()
    expect(screen.getByRole('heading', { name: /demo/i })).toBeInTheDocument()
  })

  it('renders primary CTA linking to /apps', () => {
    renderLanding()
    const appsLink = screen.getByRole('link', { name: /ver mis apps/i })
    expect(appsLink).toHaveAttribute('href', '/apps')
  })

  it('renders the auth section with Google login link', () => {
    renderLanding()
    const loginLink = screen.getByRole('link', { name: /continuar con google/i })
    expect(loginLink).toHaveAttribute('href', '/login')
  })
})
