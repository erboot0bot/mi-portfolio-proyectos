import { describe, it, expect, vi } from 'vitest'
import { getDemoTodayItems, getActiveItem } from '../getDemoTodayItems.js'

vi.mock('../index.js', () => ({
  demoRead: vi.fn((appType, key) => {
    const today = new Date()
    const todayIso = today.toISOString()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (appType === 'hogar' && key === 'events') return [
      { id: 'h1', start_time: todayIso, title: 'Compra hoy', all_day: false },
      { id: 'h2', start_time: tomorrow.toISOString(), title: 'Mañana', all_day: false },
    ]
    if (appType === 'mascotas' && key === 'events') return [
      { id: 'm1', start_time: todayIso, title: 'Paseo Luna', all_day: false },
    ]
    if (appType === 'personal' && key === 'personal_tasks') {
      const todayDate = today.toISOString().slice(0, 10)
      return [
        { id: 'p1', due_date: todayDate, title: 'Llamar al seguro', status: 'pending' },
        { id: 'p2', due_date: tomorrow.toISOString().slice(0, 10), title: 'Mañana', status: 'pending' },
        { id: 'p3', due_date: todayDate, title: 'Done task', status: 'done' },
      ]
    }
    return []
  }),
}))

describe('getDemoTodayItems', () => {
  it('retorna solo eventos de hoy de hogar y mascotas', () => {
    const items = getDemoTodayItems()
    const titles = items.map(i => i.title)
    expect(titles).toContain('Compra hoy')
    expect(titles).toContain('Paseo Luna')
    expect(titles).not.toContain('Mañana')
  })

  it('incluye tareas pending de personal con due_date hoy', () => {
    const items = getDemoTodayItems()
    expect(items.some(i => i.title === 'Llamar al seguro')).toBe(true)
  })

  it('excluye tareas done aunque sean de hoy', () => {
    const items = getDemoTodayItems()
    expect(items.some(i => i.title === 'Done task')).toBe(false)
  })

  it('ordena por hora ascendente', () => {
    const items = getDemoTodayItems()
    for (let i = 1; i < items.length; i++) {
      expect(new Date(items[i].time) >= new Date(items[i - 1].time)).toBe(true)
    }
  })

  it('cada item tiene id, time, title, appLabel, appColor, allDay', () => {
    const items = getDemoTodayItems()
    for (const item of items) {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('time')
      expect(item).toHaveProperty('title')
      expect(item).toHaveProperty('appLabel')
      expect(item).toHaveProperty('appColor')
      expect(item).toHaveProperty('allDay')
    }
  })
})

describe('getActiveItem', () => {
  it('retorna el item cuya hora está en el pasado reciente (< 120 min)', () => {
    const now = new Date()
    const recentPast = new Date(now.getTime() - 30 * 60 * 1000).toISOString()
    const oldPast = new Date(now.getTime() - 180 * 60 * 1000).toISOString()
    const items = [
      { id: 'a', time: oldPast,   allDay: false },
      { id: 'b', time: recentPast, allDay: false },
    ]
    expect(getActiveItem(items)?.id).toBe('b')
  })

  it('ignora eventos all_day para el estado activo', () => {
    const now = new Date()
    const recentPast = new Date(now.getTime() - 10 * 60 * 1000).toISOString()
    const items = [{ id: 'a', time: recentPast, allDay: true }]
    expect(getActiveItem(items)).toBeNull()
  })

  it('retorna null si no hay items activos', () => {
    expect(getActiveItem([])).toBeNull()
  })

  it('retorna el item más reciente cuando hay varios activos', () => {
    const now = new Date()
    const recent = new Date(now.getTime() - 10 * 60 * 1000).toISOString()
    const older  = new Date(now.getTime() - 90 * 60 * 1000).toISOString()
    const items = [
      { id: 'old', time: older,  allDay: false },
      { id: 'new', time: recent, allDay: false },
    ]
    expect(getActiveItem(items)?.id).toBe('new')
  })
})
