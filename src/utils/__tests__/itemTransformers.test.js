import { describe, it, expect } from 'vitest'
import { itemFromDb, itemToDb } from '../itemTransformers'

describe('itemFromDb', () => {
  it('aplana los campos de metadata al nivel raíz', () => {
    const dbRow = {
      id: 'abc',
      app_id: 'app1',
      module: 'supermercado',
      title: 'Leche',
      checked: false,
      checked_at: null,
      created_at: '2026-04-01T00:00:00Z',
      metadata: { quantity: 2, unit: 'L', category: 'lacteos', store: 'Mercadona', price_unit: 1.2 },
    }
    const result = itemFromDb(dbRow)
    expect(result.name).toBe('Leche')
    expect(result.quantity).toBe(2)
    expect(result.unit).toBe('L')
    expect(result.category).toBe('lacteos')
    expect(result.store).toBe('Mercadona')
    expect(result.price_unit).toBe(1.2)
  })

  it('usa valores por defecto cuando faltan campos en metadata', () => {
    const dbRow = {
      id: 'abc', app_id: 'app1', module: 'supermercado',
      title: 'Pan', checked: false, checked_at: null,
      created_at: '2026-04-01T00:00:00Z',
      metadata: {},
    }
    const result = itemFromDb(dbRow)
    expect(result.category).toBe('otros')
    expect(result.store).toBe('General')
    expect(result.quantity).toBeNull()
    expect(result.unit).toBe('')
    expect(result.price_unit).toBeNull()
  })
})

describe('itemToDb', () => {
  it('construye el payload correcto para INSERT', () => {
    const result = itemToDb('app1', 'Huevos', 12, 'ud', 'lacteos', 'Lidl')
    expect(result).toEqual({
      app_id: 'app1',
      module: 'supermercado',
      type: 'product',
      title: 'Huevos',
      metadata: { quantity: 12, unit: 'ud', category: 'lacteos', store: 'Lidl', price_unit: null },
    })
  })

  it('permite price_unit opcional', () => {
    const result = itemToDb('app1', 'Pasta', 1, 'kg', 'pan', 'Mercadona', 2.5)
    expect(result.metadata.price_unit).toBe(2.5)
  })
})
