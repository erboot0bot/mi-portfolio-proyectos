import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Ropa from '../Ropa'
vi.mock('react-router-dom', () => ({ useOutletContext: () => ({ app: { type: 'personal' } }) }))
vi.mock('../../../../../data/demo', () => ({
  demoRead: (_, key) => {
    if (key === 'ropa_prendas') return [
      { id: 'r-1', nombre: 'Vaqueros slim', categoria: 'pantalon', color: 'Azul', marca: "Levi's", temporada: 'todo_año', en_trastero: false },
      { id: 'r-2', nombre: 'Abrigo gris', categoria: 'abrigo', color: 'Gris', marca: 'Mango', temporada: 'invierno', en_trastero: true },
    ]
    if (key === 'ropa_tallas') return { camiseta: 'M', pantalon: '32x32', calzado: '43' }
    if (key === 'ropa_wishlist') return [{ id: 'w-1', nombre: 'Sudadera técnica', marca: 'Decathlon', precio_aprox: 35, url: '' }]
    return []
  },
  demoWrite: vi.fn(),
}))
describe('Ropa', () => {
  it('renders clothes in armario tab', () => { render(<Ropa />); expect(screen.getByText('Vaqueros slim')).toBeInTheDocument() })
  it('shows tallas when switching tab', () => { render(<Ropa />); fireEvent.click(screen.getByText('Tallas')); expect(screen.getByText(/camiseta/i)).toBeInTheDocument() })
  it('shows wishlist items', () => { render(<Ropa />); fireEvent.click(screen.getByText('Wishlist')); expect(screen.getByText('Sudadera técnica')).toBeInTheDocument() })
  it('marks en_trastero items with badge', () => { render(<Ropa />); expect(screen.getByText(/trastero/i)).toBeInTheDocument() })
})
