import { vi, describe, it, expect, beforeEach } from 'vitest'

const demoRead  = vi.fn()
const demoWrite = vi.fn()

vi.mock('../../data/demo/index.js', () => ({ demoRead, demoWrite }))

const { addCalendarEvent, removeCalendarEvent } = await import('../calendarUtils.js')

describe('addCalendarEvent', () => {
  beforeEach(() => { demoRead.mockReturnValue([]); demoWrite.mockClear() })

  it('writes a new event to demo_[appType]_events', () => {
    addCalendarEvent('hogar', { event_type: 'shopping_trip', title: 'Mercadona', start_time: '2026-06-01T10:00:00.000Z' })
    expect(demoWrite).toHaveBeenCalledWith('hogar', 'events', expect.arrayContaining([
      expect.objectContaining({ event_type: 'shopping_trip', title: 'Mercadona' })
    ]))
  })

  it('preserves existing events', () => {
    const existing = [{ id: 'old', event_type: 'meal', title: 'Desayuno', start_time: '2026-06-01T08:00:00.000Z' }]
    demoRead.mockReturnValue(existing)
    addCalendarEvent('hogar', { event_type: 'shopping_trip', title: 'Lidl', start_time: '2026-06-02T10:00:00.000Z' })
    const written = demoWrite.mock.calls[0][2]
    expect(written).toHaveLength(2)
    expect(written[0].id).toBe('old')
  })

  it('returns the new event with an id', () => {
    const ev = addCalendarEvent('ocio', { event_type: 'match', title: 'vs Real Madrid', start_time: '2026-06-10T20:00:00.000Z' })
    expect(ev.id).toBeTruthy()
    expect(ev.event_type).toBe('match')
  })

  it('applies sensible defaults for optional fields', () => {
    const ev = addCalendarEvent('hogar', { event_type: 'shopping_trip', title: 'Mercadona', start_time: '2026-06-01T10:00:00.000Z' })
    expect(ev.recurrence).toBe('none')
    expect(ev.all_day).toBe(false)
    expect(ev.color).toBeTruthy()
  })
})

describe('removeCalendarEvent', () => {
  beforeEach(() => { demoRead.mockReturnValue([]); demoWrite.mockClear() })

  it('removes an event by id', () => {
    const existing = [
      { id: 'a', event_type: 'match', title: 'vs Barça', start_time: '2026-06-01T20:00:00.000Z' },
      { id: 'b', event_type: 'match', title: 'vs Atlético', start_time: '2026-06-08T20:00:00.000Z' },
    ]
    demoRead.mockReturnValue(existing)
    removeCalendarEvent('ocio', 'a')
    expect(demoWrite).toHaveBeenCalledWith('ocio', 'events', [existing[1]])
  })
})
