import { describe, it, expect } from 'vitest'
import { recipeIngredientFromDb, recipeIngredientToDb } from '../recipeTransformers'

describe('recipeIngredientFromDb', () => {
  it('mapea fila DB a forma UI', () => {
    const row = { id: 'ri1', recipe_id: 'r1', name: 'Harina', quantity: 200, unit: 'g', sort_order: 0 }
    const result = recipeIngredientFromDb(row)
    expect(result.name).toBe('Harina')
    expect(result.quantity).toBe(200)
    expect(result.unit).toBe('g')
    expect(result.sort_order).toBe(0)
    expect(result.recipe_id).toBe('r1')
  })

  it('asigna defaults para nulls', () => {
    const row = { id: 'ri2', recipe_id: 'r1', name: 'Sal', quantity: null, unit: null, sort_order: 1 }
    const result = recipeIngredientFromDb(row)
    expect(result.quantity).toBeNull()
    expect(result.unit).toBe('')
  })
})

describe('recipeIngredientToDb', () => {
  it('mapea UI a DB', () => {
    const result = recipeIngredientToDb('r1', 'Aceite', 2, 'cucharadas', 3)
    expect(result.recipe_id).toBe('r1')
    expect(result.name).toBe('Aceite')
    expect(result.quantity).toBe(2)
    expect(result.unit).toBe('cucharadas')
    expect(result.sort_order).toBe(3)
  })

  it('convierte cantidad vacía a null', () => {
    const result = recipeIngredientToDb('r1', 'Sal', '', '', 0)
    expect(result.quantity).toBeNull()
    expect(result.unit).toBe('')
  })

  it('trimea nombre y unidad', () => {
    const result = recipeIngredientToDb('r1', '  Pimienta  ', 1, ' g ', 0)
    expect(result.name).toBe('Pimienta')
    expect(result.unit).toBe('g')
  })

  it('sort_order por defecto es 0', () => {
    const result = recipeIngredientToDb('r1', 'Tomate', null, '', undefined)
    expect(result.sort_order).toBe(0)
  })
})
