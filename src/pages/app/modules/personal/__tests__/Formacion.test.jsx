import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Formacion from '../Formacion'
vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'personal' } }) }))
vi.mock('../../../../../data/demo', () => ({
  demoRead: (_, key) => {
    if (key === 'formacion_cursos') return [
      { id: 'c-1', titulo: 'React Avanzado', plataforma: 'Udemy', progreso: 68, fecha_limite: '2026-06-30', estado: 'activo' },
      { id: 'c-2', titulo: 'Docker', plataforma: 'Udemy', progreso: 100, fecha_limite: null, estado: 'completado' },
    ]
    if (key === 'formacion_idiomas') return [{ id: 'i-1', idioma: 'Inglés', nivel: 'B2', metodo: 'Italki', objetivo: 'C1' }]
    if (key === 'formacion_certificaciones') return [{ id: 'cert-1', nombre: 'AWS Cloud Practitioner', entidad: 'Amazon', fecha: '2024-03-15', estado: 'obtenida' }]
    return []
  },
  demoWrite: vi.fn(),
}))
describe('Formacion', () => {
  it('renders course title', () => { render(<Formacion />); expect(screen.getByText('React Avanzado')).toBeInTheDocument() })
  it('shows progress percentage', () => { render(<Formacion />); expect(screen.getByText(/68\s*%/)).toBeInTheDocument() })
  it('shows idiomas tab content', () => { render(<Formacion />); fireEvent.click(screen.getByText('Idiomas')); expect(screen.getByText('Inglés')).toBeInTheDocument() })
  it('shows certificaciones tab content', () => { render(<Formacion />); fireEvent.click(screen.getByText('Certificaciones')); expect(screen.getByText('AWS Cloud Practitioner')).toBeInTheDocument() })
})
