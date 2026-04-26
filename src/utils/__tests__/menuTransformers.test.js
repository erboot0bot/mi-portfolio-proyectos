import { describe, it, expect } from 'vitest'
import { menuEventFromDb, menuEventToDb } from '../menuTransformers'

describe('menuEventFromDb', () => {
  it('expone day_of_week y meal_type desde metadata', () => {
    const ev = {
      id: 'ev1', app_id: 'app1', event_type: 'meal',
      title: 'Paella',
      start_time: '2026-04-28T14:00:00Z',
      metadata: { meal_type: 'comida', recipe_id: 'rec1', day_of_week: 1, week_start: '2026-04-27', custom_name: 'Paella' },
    }
    const result = menuEventFromDb(ev)
    expect(result.meal_type).toBe('comida')
    expect(result.day_of_week).toBe(1)
    expect(result.recipe_id).toBe('rec1')
    expect(result.custom_name).toBe('Paella')
    expect(result.week_start).toBe('2026-04-27')
  })
})

describe('menuEventToDb', () => {
  it('construye un evento de comida con start_time correcto', () => {
    const result = menuEventToDb('app1', '2026-04-27', 1, 'comida', 'Paella', 'rec1')
    expect(result.app_id).toBe('app1')
    expect(result.event_type).toBe('meal')
    expect(result.title).toBe('Paella')
    expect(result.metadata.meal_type).toBe('comida')
    expect(result.metadata.day_of_week).toBe(1)
    expect(result.metadata.recipe_id).toBe('rec1')
    const d = new Date(result.start_time)
    expect(d.getHours()).toBe(14)
  })

  it('asigna hora correcta según meal_type', () => {
    const desayuno = menuEventToDb('app1', '2026-04-27', 0, 'desayuno', 'Tostadas', null)
    const cena     = menuEventToDb('app1', '2026-04-27', 0, 'cena', 'Cena', null)
    expect(new Date(desayuno.start_time).getHours()).toBe(8)
    expect(new Date(cena.start_time).getHours()).toBe(21)
  })
})
