import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

const mockNavigate = vi.fn()
const { mockMaybySingle } = vi.hoisted(() => ({
  mockMaybySingle: vi.fn().mockResolvedValue({
    data: { id: 'pet-abc', name: 'Rex', species: 'perro', icon: '🐕', birth_date: null, notes: null, metadata: {} },
    error: null,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams:        () => ({ petId: 'pet-abc' }),
    useOutletContext: () => ({
      app: { id: 'app-1', icon: '🐾', name: 'Mascotas', type: 'mascotas' },
      modules: [{ path: 'mis-mascotas', label: 'Mis Mascotas', icon: '🐾' }],
    }),
    useNavigate:  () => mockNavigate,
    useLocation:  () => ({ pathname: '/app/mascotas/mis-mascotas/pet-abc/alimentacion' }),
    NavLink: ({ to, children, style }) => {
      const active = to === 'alimentacion'
      return <a href={to} style={typeof style === 'function' ? style({ isActive: active }) : style}>{children}</a>
    },
    Outlet: () => <div data-testid="outlet" />,
    Navigate: ({ to }) => <div data-testid={`navigate-${to}`} />,
  }
})

vi.mock('../../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select:      vi.fn().mockReturnThis(),
      eq:          vi.fn().mockReturnThis(),
      maybeSingle: mockMaybySingle,
    }),
  },
}))

import PetDetail from '../PetDetail'

describe('PetDetail', () => {
  it('muestra el nombre de la mascota', async () => {
    render(<PetDetail />)
    await waitFor(() => expect(screen.getByText('Rex')).toBeInTheDocument())
  })

  it('muestra tabs de alimentacion, salud y rutinas para perro', async () => {
    render(<PetDetail />)
    await waitFor(() => screen.getByText('Rex'))
    expect(screen.getByText(/alimentación/i)).toBeInTheDocument()
    expect(screen.getByText(/salud/i)).toBeInTheDocument()
    expect(screen.getByText(/rutinas/i)).toBeInTheDocument()
  })

  it('no muestra tab rutinas para gato', async () => {
    mockMaybySingle.mockResolvedValueOnce({
      data: { id: 'pet-abc', name: 'Misi', species: 'gato', icon: '🐈', birth_date: null, notes: null, metadata: {} },
      error: null,
    })
    render(<PetDetail />)
    await waitFor(() => screen.getByText('Misi'))
    expect(screen.getByText(/alimentación/i)).toBeInTheDocument()
    expect(screen.getByText(/salud/i)).toBeInTheDocument()
    expect(screen.queryByText(/rutinas/i)).not.toBeInTheDocument()
  })

  it('muestra botón eliminar', async () => {
    render(<PetDetail />)
    await waitFor(() => screen.getByText('Rex'))
    expect(screen.getByText('Eliminar')).toBeInTheDocument()
  })

  it('muestra confirmación al pulsar eliminar', async () => {
    render(<PetDetail />)
    await waitFor(() => screen.getByText('Rex'))
    fireEvent.click(screen.getByText('Eliminar'))
    expect(screen.getByText(/¿eliminar a rex\?/i)).toBeInTheDocument()
  })
})
