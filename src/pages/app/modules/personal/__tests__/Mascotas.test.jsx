import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Mascotas from '../Mascotas'
vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'personal' } }) }))
const today = new Date()
const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) }
vi.mock('../../../../../data/demo', () => ({
  demoRead: () => [{
    id: 'mas-1', nombre: 'Luna', especie: 'perro', raza: 'Labrador', edad_anios: 3, icono: '🐕',
    veterinario: { nombre: 'VetCare', telefono: '93 456 78 90', direccion: 'Calle Mayor 12' },
    vacunas: [{ id: 'vac-1', nombre: 'Rabia', fecha_ultima: '2026-02-15', proxima: addDays(275) }],
    medicacion: [], notas: 'Alérgica al pollo.',
  }],
  demoWrite: vi.fn(),
}))
describe('Mascotas', () => {
  it('renders pet name', () => { render(<Mascotas />); expect(screen.getByText('Luna')).toBeInTheDocument() })
  it('shows raza', () => { render(<Mascotas />); expect(screen.getByText(/Labrador/)).toBeInTheDocument() })
  it('shows vet name', () => { render(<Mascotas />); expect(screen.getByText(/VetCare/)).toBeInTheDocument() })
  it('shows vaccine name', () => { render(<Mascotas />); expect(screen.getByText('Rabia')).toBeInTheDocument() })
})
