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

  it('suscripciones — shape and required fields', () => {
    const data = demoRead('finanzas', 'suscripciones')
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThanOrEqual(4)
    const sub = data[0]
    expect(sub).toHaveProperty('id')
    expect(sub).toHaveProperty('nombre')
    expect(sub).toHaveProperty('icono')
    expect(sub).toHaveProperty('coste')
    expect(sub).toHaveProperty('periodicidad')
    expect(sub).toHaveProperty('fecha_renovacion')
    expect(['activa', 'pausada', 'cancelada']).toContain(sub.estado)
    expect(typeof sub.compartida).toBe('boolean')
  })

  it('seguros — shape and required fields', () => {
    const data = demoRead('finanzas', 'seguros')
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThanOrEqual(3)
    const seg = data[0]
    expect(seg).toHaveProperty('id')
    expect(seg).toHaveProperty('tipo')
    expect(seg).toHaveProperty('nombre')
    expect(seg).toHaveProperty('compania')
    expect(seg).toHaveProperty('poliza')
    expect(seg).toHaveProperty('vencimiento')
    expect(typeof seg.coste_anual).toBe('number')
  })

  it('gastos_fijos — shape and required fields', () => {
    const data = demoRead('finanzas', 'gastos_fijos')
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThanOrEqual(4)
    const gf = data[0]
    expect(gf).toHaveProperty('id')
    expect(gf).toHaveProperty('nombre')
    expect(gf).toHaveProperty('icono')
    expect(gf).toHaveProperty('categoria')
    expect(typeof gf.importe).toBe('number')
    expect(typeof gf.dia_cobro).toBe('number')
  })

  it('hipoteca — object with required fields', () => {
    const data = demoRead('finanzas', 'hipoteca')
    expect(data).toBeTruthy()
    expect(!Array.isArray(data)).toBe(true)
    expect(data).toHaveProperty('banco')
    expect(data).toHaveProperty('cuota_mensual')
    expect(data).toHaveProperty('capital_inicial')
    expect(data).toHaveProperty('capital_pendiente')
    expect(data).toHaveProperty('fecha_inicio')
    expect(data).toHaveProperty('fecha_fin')
    expect(data.capital_pendiente).toBeLessThan(data.capital_inicial)
  })
})
