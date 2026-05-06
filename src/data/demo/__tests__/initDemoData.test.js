import { describe, it, expect, beforeEach } from 'vitest'
import { initDemoData, demoRead, demoWrite, clearDemoData } from '../index.js'

describe('initDemoData', () => {
  beforeEach(() => sessionStorage.clear())

  it('loads finanzas categories into sessionStorage', () => {
    initDemoData('finanzas')
    const cats = demoRead('finanzas', 'fin_categories')
    expect(cats.length).toBeGreaterThan(0)
    expect(cats[0]).toHaveProperty('id')
    expect(cats[0]).toHaveProperty('name')
    expect(cats[0]).toHaveProperty('type')
  })

  it('loads vehiculo vehicles into sessionStorage', () => {
    initDemoData('vehiculo')
    const vehicles = demoRead('vehiculo', 'vehicles')
    expect(vehicles).toHaveLength(1)
    expect(vehicles[0].id).toBe('demo-v1')
  })

  it('does not overwrite existing demo data', () => {
    demoWrite('finanzas', 'fin_categories', [{ id: 'custom' }])
    initDemoData('finanzas')
    const cats = demoRead('finanzas', 'fin_categories')
    expect(cats[0].id).toBe('custom')
  })

  it('clearDemoData removes all keys for the app', () => {
    initDemoData('finanzas')
    clearDemoData('finanzas')
    const cats = demoRead('finanzas', 'fin_categories')
    expect(cats).toHaveLength(0)
  })

  it('returns empty array for unknown key', () => {
    const result = demoRead('finanzas', 'nonexistent_table')
    expect(result).toEqual([])
  })
})
