import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

vi.setConfig({ testTimeout: 15000 })

vi.mock('../../data/demo/index.js', () => ({
  initDemoData: vi.fn(),
  demoRead: vi.fn((appType, key) => {
    if (appType === 'hogar' && key === 'events') return []
    if (appType === 'hogar' && key === 'items_supermercado') return [
      { id: '1', checked: false },
      { id: '2', checked: true },
    ]
    if (appType === 'personal' && key === 'personal_tasks') return []
    if (appType === 'personal' && key === 'personal_notes') return [
      { id: 'n1' }, { id: 'n2' },
    ]
    if (appType === 'mascotas' && key === 'pets') return [
      { id: 'p1', name: 'Luna', species: 'perro', birth_date: '2023-01-01' },
    ]
    if (appType === 'mascotas' && key === 'events') return []
    if (appType === 'vehiculo' && key === 'vehicles') return [
      { id: 'v1', brand: 'Volkswagen', model: 'Golf', initial_km: 85000 },
    ]
    if (appType === 'vehiculo' && key === 'fuel_logs') return [
      { km_at_fill: 87420 },
    ]
    if (appType === 'finanzas' && key === 'fin_transactions') return []
    if (appType === 'finanzas' && key === 'fin_budgets') return [
      { id: 'b1' }, { id: 'b2' },
    ]
    if (appType === 'ocio' && key === 'restaurantes') return [
      { id: 'r1', nombre: 'El Xampanyet', visitas: [{ fecha: '2025-01-01' }] },
      { id: 'r2', nombre: 'Bar Mut', visitas: [] },
    ]
    if (appType === 'ocio' && key === 'viajes') return [
      { id: 'v1', destino: 'Lisboa', estado: 'planificado' },
    ]
    if (appType === 'ocio' && key === 'eventos') return []
    return []
  }),
}))

vi.mock('../../data/demo/getDemoTodayItems.js', () => ({
  getDemoTodayItems: vi.fn(() => []),
  getActiveItem: vi.fn(() => null),
}))

import DemoHome from '../DemoHome.jsx'

function renderDemoHome() {
  return render(
    <MemoryRouter>
      <DemoHome />
    </MemoryRouter>
  )
}

describe('DemoHome', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
  })

  it('muestra el número del día actual', () => {
    renderDemoHome()
    const dayNum = new Date().getDate().toString()
    // Day number appears in the greeting kicker date string
    const body = document.body.textContent ?? ''
    expect(body).toContain(dayNum)
  })

  it('muestra las 4 app cards con sus labels', () => {
    renderDemoHome()
    // Module card labels are now title-case (redesigned from uppercase)
    expect(screen.getAllByText(/Hogar/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Personal/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Finanzas/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Ocio/i).length).toBeGreaterThan(0)
  })

  it('muestra la tarjeta IA con insight', () => {
    renderDemoHome()
    expect(screen.getByText(/✦ IA/)).toBeInTheDocument()
  })

  it('muestra "Sin eventos hoy" cuando no hay items', () => {
    renderDemoHome()
    const matches = screen.getAllByText(/sin eventos hoy/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('los links de apps navegan a /demo/:type', () => {
    renderDemoHome()
    // Module cards are <Link> wrappers; find the Hogar card by its label text
    const hogarLabel = screen.getAllByText(/^Hogar$/i)[0]
    const hogarLink = hogarLabel.closest('a')
    expect(hogarLink).toHaveAttribute('href', '/demo/hogar')
  })

  it('no modifica el tema si el usuario está en modo claro', () => {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
    renderDemoHome()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('no modifica el tema si el usuario está en modo oscuro', () => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
    renderDemoHome()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('no escribe en localStorage al montar', () => {
    renderDemoHome()
    expect(localStorage.getItem('theme')).toBeNull()
  })
})
