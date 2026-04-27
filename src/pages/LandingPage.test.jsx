// src/pages/LandingPage.test.jsx
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
  it('renders the hero h1', () => {
    renderLanding()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders the stats section with metric values', () => {
    renderLanding()
    expect(screen.getByText('4+')).toBeInTheDocument()
    expect(screen.getByText('Apps en producción')).toBeInTheDocument()
  })

  it('renders the Lab section card', () => {
    renderLanding()
    expect(screen.getByRole('heading', { name: /lab/i })).toBeInTheDocument()
  })

  it('renders primary CTA linking to /apps', () => {
    renderLanding()
    const appsLink = screen.getByRole('link', { name: /ver mis apps/i })
    expect(appsLink).toHaveAttribute('href', '/apps')
  })
})
