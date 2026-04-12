import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImageGallery from './ImageGallery'

const images = ['/img/a.webp', '/img/b.webp', '/img/c.webp']

describe('ImageGallery', () => {
  it('renders null when images is empty', () => {
    const { container } = render(<ImageGallery images={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders null when images is undefined', () => {
    const { container } = render(<ImageGallery />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a thumbnail for each image', () => {
    render(<ImageGallery images={images} />)
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('opens lightbox on thumbnail click', async () => {
    const user = userEvent.setup()
    render(<ImageGallery images={images} />)
    await user.click(screen.getAllByRole('button')[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes lightbox on close button click', async () => {
    const user = userEvent.setup()
    render(<ImageGallery images={images} />)
    await user.click(screen.getAllByRole('button')[0])
    await user.click(screen.getByRole('button', { name: /cerrar/i }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('shows image counter in lightbox', async () => {
    const user = userEvent.setup()
    render(<ImageGallery images={images} />)
    await user.click(screen.getAllByRole('button')[0])
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('navigates to next image', async () => {
    const user = userEvent.setup()
    render(<ImageGallery images={images} />)
    await user.click(screen.getAllByRole('button')[0])
    await user.click(screen.getByRole('button', { name: /siguiente/i }))
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('navigates to previous image', async () => {
    const user = userEvent.setup()
    render(<ImageGallery images={images} />)
    await user.click(screen.getAllByRole('button')[1]) // open index 1
    await user.click(screen.getByRole('button', { name: /anterior/i }))
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })
})
