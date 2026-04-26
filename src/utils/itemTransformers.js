export function itemFromDb(row) {
  return {
    ...row,
    name:       row.title,
    quantity:   row.metadata?.quantity ?? null,
    unit:       row.metadata?.unit ?? '',
    category:   row.metadata?.category ?? 'otros',
    store:      row.metadata?.store ?? 'General',
    price_unit: row.metadata?.price_unit ?? null,
  }
}

export function itemToDb(appId, name, quantity, unit, category, store, priceUnit = null) {
  return {
    app_id:  appId,
    module:  'supermercado',
    type:    'product',
    title:   name,
    metadata: { quantity, unit, category, store, price_unit: priceUnit },
  }
}
