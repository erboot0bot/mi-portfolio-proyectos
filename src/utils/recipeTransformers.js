export function recipeIngredientFromDb(row) {
  return {
    id:         row.id,
    recipe_id:  row.recipe_id,
    name:       row.name,
    quantity:   row.quantity ?? null,
    unit:       row.unit ?? '',
    sort_order: row.sort_order ?? 0,
  }
}

export function recipeIngredientToDb(recipeId, name, quantity, unit, sortOrder = 0) {
  return {
    recipe_id:  recipeId,
    name:       String(name ?? '').trim(),
    quantity:   quantity !== '' && quantity !== null && quantity !== undefined
                  ? Number(quantity)
                  : null,
    unit:       String(unit ?? '').trim(),
    sort_order: sortOrder ?? 0,
  }
}
