import { describe, it, expect } from 'vitest'
import { computeConsumptionUpdate } from '../consumptionUtils'

describe('computeConsumptionUpdate', () => {
  it('primera compra (existing = null): devuelve baja confidence y sin avg/estimated', () => {
    const result = computeConsumptionUpdate(null, '2026-04-26')
    expect(result.last_purchase_date).toBe('2026-04-26')
    expect(result.avg_days_between_purchases).toBeNull()
    expect(result.estimated_next_purchase).toBeNull()
    expect(result.confidence).toBe('baja')
  })

  it('primera compra con existing.last_purchase_date = null: trata como primera', () => {
    const result = computeConsumptionUpdate(
      { last_purchase_date: null, avg_days_between_purchases: null },
      '2026-04-26'
    )
    expect(result.avg_days_between_purchases).toBeNull()
    expect(result.confidence).toBe('baja')
  })

  it('segunda compra (sin avg previo): avg = daysSinceLast, confidence = media', () => {
    const existing = { last_purchase_date: '2026-03-27', avg_days_between_purchases: null }
    const result = computeConsumptionUpdate(existing, '2026-04-26')
    expect(result.avg_days_between_purchases).toBe(30)
    expect(result.estimated_next_purchase).toBe('2026-05-26')
    expect(result.confidence).toBe('media')
  })

  it('tercera compra (avg previo = 30, 20 días después): aplica EMA α=0.3 → 27', () => {
    const existing = { last_purchase_date: '2026-03-27', avg_days_between_purchases: 30 }
    const result = computeConsumptionUpdate(existing, '2026-04-16')
    // round(0.3 * 20 + 0.7 * 30) = round(6 + 21) = 27
    expect(result.avg_days_between_purchases).toBe(27)
    expect(result.estimated_next_purchase).toBe('2026-05-13')
    expect(result.confidence).toBe('alta')
  })

  it('misma fecha (daysSinceLast=0): usa mínimo de 1 día', () => {
    const existing = { last_purchase_date: '2026-04-26', avg_days_between_purchases: null }
    const result = computeConsumptionUpdate(existing, '2026-04-26')
    expect(result.avg_days_between_purchases).toBe(1)
    expect(result.confidence).toBe('media')
  })

  it('actualiza last_purchase_date a la nueva fecha', () => {
    const existing = { last_purchase_date: '2026-03-01', avg_days_between_purchases: 14 }
    const result = computeConsumptionUpdate(existing, '2026-04-26')
    expect(result.last_purchase_date).toBe('2026-04-26')
  })
})
