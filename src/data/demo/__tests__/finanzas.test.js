import { describe, it, expect, beforeEach } from 'vitest'
import { initDemoData, demoRead } from '../index.js'

describe('finanzas demo data — Fase 6', () => {
  beforeEach(() => {
    sessionStorage.clear()
    initDemoData('finanzas')
  })

  it('fin_budgets use monthly_limit (not limit_amount)', () => {
    const budgets = demoRead('finanzas', 'fin_budgets')
    expect(Array.isArray(budgets)).toBe(true)
    expect(budgets.length).toBeGreaterThan(0)
    budgets.forEach(b => {
      expect(b).toHaveProperty('monthly_limit')
      expect(b).not.toHaveProperty('limit_amount')
      expect(typeof b.monthly_limit).toBe('number')
      expect(b.monthly_limit).toBeGreaterThan(0)
    })
  })

  it('fin_transactions have required shape with fin_categories embedded', () => {
    const txs = demoRead('finanzas', 'fin_transactions')
    expect(Array.isArray(txs)).toBe(true)
    expect(txs.length).toBeGreaterThan(0)
    txs.forEach(tx => {
      expect(tx).toHaveProperty('id')
      expect(tx).toHaveProperty('type')
      expect(['income', 'expense']).toContain(tx.type)
      expect(tx).toHaveProperty('amount')
      expect(tx).toHaveProperty('date')
      expect(tx).toHaveProperty('fin_categories')
    })
  })

  it('fin_categories have required shape', () => {
    const cats = demoRead('finanzas', 'fin_categories')
    expect(Array.isArray(cats)).toBe(true)
    expect(cats.length).toBeGreaterThan(0)
    cats.forEach(c => {
      expect(c).toHaveProperty('id')
      expect(c).toHaveProperty('name')
      expect(c).toHaveProperty('icon')
      expect(c).toHaveProperty('color')
      expect(['income', 'expense']).toContain(c.type)
    })
  })
})
