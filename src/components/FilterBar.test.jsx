import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterBar from './FilterBar'

describe('FilterBar', () => {
  const techs = ['React', 'Tailwind', 'Vite']

  it('renders a button for each technology', () => {
    render(<FilterBar techs={techs} active={null} onChange={() => {}} />)
    techs.forEach(t => expect(screen.getByRole('button', { name: t })).toBeInTheDocument())
  })

  it('renders a "Todos" button', () => {
    render(<FilterBar techs={techs} active={null} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: /todos/i })).toBeInTheDocument()
  })

  it('calls onChange with the tech name when clicking a tech', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FilterBar techs={techs} active={null} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'React' }))
    expect(onChange).toHaveBeenCalledWith('React')
  })

  it('calls onChange with null when clicking "Todos"', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FilterBar techs={techs} active="React" onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /todos/i }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('returns null when techs is empty', () => {
    const { container } = render(<FilterBar techs={[]} active={null} onChange={() => {}} />)
    expect(container.firstChild).toBeNull()
  })
})
