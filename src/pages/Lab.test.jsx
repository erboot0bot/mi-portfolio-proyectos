// src/pages/Lab.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Lab from './Lab'

describe('Lab', () => {
  it('renders the Lab heading', () => {
    render(<MemoryRouter><Lab /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /lab/i, level: 1 })).toBeInTheDocument()
  })

  it('renders at least one experiment card', () => {
    render(<MemoryRouter><Lab /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /mascotas/i })).toBeInTheDocument()
  })

  it('renders status badges for experiments', () => {
    render(<MemoryRouter><Lab /></MemoryRouter>)
    expect(screen.getAllByText('Activo').length).toBeGreaterThan(0)
  })
})
