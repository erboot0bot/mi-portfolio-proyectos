import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import Mantenimiento from '../Mantenimiento'

vi.setConfig({ testTimeout: 15000 })

const MOCK_VEHICLE = { id: 'v1', marca: 'Toyota', modelo: 'Corolla', matricula: 'ABC123' }

const { demoWrite, demoRead } = vi.hoisted(() => {
  const demoWrite = vi.fn()
  const demoRead  = vi.fn((_t, key) => {
    if (key === 'maintenance_logs') return []
    if (key === 'events') return []
    return []
  })
  return { demoWrite, demoRead }
})

vi.mock('react-router-dom', () => ({
  useOutletContext: () => ({ app: { id: 'demo-vehiculo', type: 'vehiculo' }, vehicle: MOCK_VEHICLE }),
}))
vi.mock('../../../../../contexts/ModeContext', () => ({ useMode: () => ({ mode: 'demo' }) }))
vi.mock('../../../../../lib/supabase', () => ({
  supabase: { from: () => ({ select: () => ({ eq: () => ({ order: () => ({ then: () => {} }) }) }) }) },
}))
vi.mock('../../../../../data/demo/index.js', () => ({ demoRead, demoWrite }))

async function renderAndWait() {
  render(<Mantenimiento />)
  await waitFor(() => screen.getByRole('button', { name: /\+ Mantenimiento/i }))
}

describe('Mantenimiento — calendar integration', () => {
  beforeEach(() => {
    demoWrite.mockClear()
    demoRead.mockClear()
    demoRead.mockImplementation((_t, key) => {
      if (key === 'maintenance_logs') return []
      if (key === 'events') return []
      return []
    })
  })

  it('shows the add form button', async () => {
    await renderAndWait()
    expect(screen.getByRole('button', { name: /\+ Mantenimiento/i })).toBeInTheDocument()
  })

  it('shows añadir al calendario checkbox when next_date is filled', async () => {
    await renderAndWait()
    fireEvent.click(screen.getByRole('button', { name: /\+ Mantenimiento/i }))

    // Before filling next_date, checkbox should NOT be visible
    expect(screen.queryByLabelText(/añadir al calendario/i)).not.toBeInTheDocument()

    // The next_date input is the last date input (first is form.date = today)
    const allDateInputs = document.querySelectorAll('input[type="date"]')
    expect(allDateInputs.length).toBeGreaterThanOrEqual(2)
    const nextDateInput = allDateInputs[allDateInputs.length - 1]
    fireEvent.change(nextDateInput, { target: { value: '2027-01-15' } })

    // Now the checkbox should appear
    expect(screen.getByLabelText(/añadir al calendario/i)).toBeInTheDocument()
  })

  it('does NOT call demoWrite for events when checkbox is unchecked', async () => {
    await renderAndWait()
    fireEvent.click(screen.getByRole('button', { name: /\+ Mantenimiento/i }))

    const allDateInputs = document.querySelectorAll('input[type="date"]')
    const nextDateInput = allDateInputs[allDateInputs.length - 1]
    fireEvent.change(nextDateInput, { target: { value: '2027-01-15' } })

    // Leave checkbox unchecked and submit
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    // demoWrite should be called for maintenance_logs but NOT for events
    const eventsCalls = demoWrite.mock.calls.filter(([, key]) => key === 'events')
    expect(eventsCalls.length).toBe(0)
  })

  it('writes a vehicle_maintenance event when checkbox checked and form saved', async () => {
    await renderAndWait()
    fireEvent.click(screen.getByRole('button', { name: /\+ Mantenimiento/i }))

    const allDateInputs = document.querySelectorAll('input[type="date"]')
    const nextDateInput = allDateInputs[allDateInputs.length - 1]
    fireEvent.change(nextDateInput, { target: { value: '2027-01-15' } })

    // Check the calendar checkbox
    fireEvent.click(screen.getByLabelText(/añadir al calendario/i))

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    expect(demoWrite).toHaveBeenCalledWith('vehiculo', 'events', expect.arrayContaining([
      expect.objectContaining({ event_type: 'vehicle_maintenance' })
    ]))
  })

  it('resets addToCalendar state when form is cancelled', async () => {
    await renderAndWait()
    fireEvent.click(screen.getByRole('button', { name: /\+ Mantenimiento/i }))

    const allDateInputs = document.querySelectorAll('input[type="date"]')
    const nextDateInput = allDateInputs[allDateInputs.length - 1]
    fireEvent.change(nextDateInput, { target: { value: '2027-01-15' } })

    // Check the checkbox
    fireEvent.click(screen.getByLabelText(/añadir al calendario/i))
    expect(screen.getByLabelText(/añadir al calendario/i)).toBeChecked()

    // Cancel
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))

    // Open form again
    fireEvent.click(screen.getByRole('button', { name: /\+ Mantenimiento/i }))
    const allDateInputs2 = document.querySelectorAll('input[type="date"]')
    const nextDateInput2 = allDateInputs2[allDateInputs2.length - 1]
    fireEvent.change(nextDateInput2, { target: { value: '2027-03-10' } })

    // Checkbox should be unchecked (reset)
    expect(screen.getByLabelText(/añadir al calendario/i)).not.toBeChecked()
  })
})
