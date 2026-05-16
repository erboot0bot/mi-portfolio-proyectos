import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Entretenimiento from '../Entretenimiento'

vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'ocio' } }) }))

const MOCK_VG  = [{ id: 'vg1', titulo: 'Hollow Knight', plataforma: 'PC', estado: 'completado', horas: 42, puntuacion: 5, critica: '' }]
const MOCK_LIB = [{ id: 'l1', titulo: 'Dune', autor: 'Herbert', estado: 'leyendo', puntuacion: 0, critica: '', fecha_lectura: null }]
const MOCK_PEL = [{ id: 'p1', titulo: 'Oppenheimer', tipo: 'pelicula', plataforma: 'HBO', estado: 'visto', puntuacion: 5, critica: '', anio: 2023 }]
const MOCK_MUS = [{ id: 'm1', titulo: 'Discovery', artista: 'Daft Punk', anio: 2001, puntuacion: 5, critica: '' }]
const MOCK_POD = [{ id: 'pod1', nombre: 'Lex Fridman', autor: 'Lex', estado: 'siguiendo', episodios_guardados: 2, notas: '' }]

vi.mock('../../../../../data/demo', () => ({
  demoRead: (_t, key) => {
    if (key === 'entretenimiento_videojuegos') return MOCK_VG
    if (key === 'entretenimiento_libros')      return MOCK_LIB
    if (key === 'entretenimiento_peliculas')   return MOCK_PEL
    if (key === 'entretenimiento_musica')      return MOCK_MUS
    if (key === 'entretenimiento_podcasts')    return MOCK_POD
    return []
  },
  demoWrite: vi.fn(),
}))

describe('Entretenimiento', () => {
  it('renders videojuego in default tab', () => {
    render(<Entretenimiento />)
    expect(screen.getByText('Hollow Knight')).toBeInTheDocument()
  })

  it('switches to Libros tab', () => {
    render(<Entretenimiento />)
    fireEvent.click(screen.getByText(/Libros/))
    expect(screen.getByText('Dune')).toBeInTheDocument()
  })

  it('switches to Películas tab', () => {
    render(<Entretenimiento />)
    fireEvent.click(screen.getByText(/Películas/))
    expect(screen.getByText('Oppenheimer')).toBeInTheDocument()
  })

  it('switches to Música tab', () => {
    render(<Entretenimiento />)
    fireEvent.click(screen.getByText(/Música/))
    expect(screen.getByText('Discovery')).toBeInTheDocument()
  })

  it('switches to Podcasts tab', () => {
    render(<Entretenimiento />)
    fireEvent.click(screen.getByText(/Podcasts/))
    expect(screen.getByText('Lex Fridman')).toBeInTheDocument()
  })
})
