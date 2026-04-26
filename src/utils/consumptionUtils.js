/**
 * Calcula los campos a upsert en product_consumption tras una compra.
 *
 * @param {object|null} existing  Fila actual de product_consumption (o null si es la primera)
 * @param {string}      purchaseDateStr  Fecha de compra en formato YYYY-MM-DD
 * @returns {{ last_purchase_date, avg_days_between_purchases, estimated_next_purchase, confidence }}
 *
 * Algoritmo:
 * - Primera compra: sin avg/estimated, confidence='baja'
 * - Segunda compra: avg = daysSinceLast, confidence='media'
 * - Tercera+: EMA α=0.3, confidence='alta'
 * - daysSinceLast tiene mínimo de 1 para proteger contra misma-fecha
 */
export function computeConsumptionUpdate(existing, purchaseDateStr) {
  if (!existing || !existing.last_purchase_date) {
    return {
      last_purchase_date:         purchaseDateStr,
      avg_days_between_purchases: null,
      estimated_next_purchase:    null,
      confidence:                 'baja',
    }
  }

  const purchaseDate  = new Date(purchaseDateStr)
  const lastDate      = new Date(existing.last_purchase_date)
  const daysSinceLast = Math.max(1, Math.round(
    (purchaseDate - lastDate) / (1000 * 60 * 60 * 24)
  ))

  const prevAvg = existing.avg_days_between_purchases
  const newAvg  = prevAvg == null
    ? daysSinceLast
    : Math.round(0.3 * daysSinceLast + 0.7 * prevAvg)

  const estimated = new Date(purchaseDateStr)
  estimated.setDate(estimated.getDate() + newAvg)

  return {
    last_purchase_date:         purchaseDateStr,
    avg_days_between_purchases: newAvg,
    estimated_next_purchase:    estimated.toISOString().slice(0, 10),
    confidence:                 prevAvg == null ? 'media' : 'alta',
  }
}
