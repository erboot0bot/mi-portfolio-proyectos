import { describe, it, expect, beforeEach } from 'vitest'
import { initDemoData, demoRead } from '../index.js'

describe('personal demo data — Fase 5', () => {
  beforeEach(() => {
    sessionStorage.clear()
    initDemoData('personal')
  })

  it('trabajo has required fields', () => {
    const t = demoRead('personal', 'trabajo')
    expect(t).toHaveProperty('empresa')
    expect(t).toHaveProperty('municipio')
    expect(t).toHaveProperty('horario')
    expect(t.horario).toHaveProperty('inicio')
    expect(t.horario).toHaveProperty('fin')
    expect(t.horario).toHaveProperty('dias')
    expect(Array.isArray(t.horario.dias)).toBe(true)
    expect(t.horario.dias.length).toBeGreaterThan(0)
    expect(t).toHaveProperty('trayecto')
    expect(t.trayecto).toHaveProperty('tiempo_min')
  })

  it('habitos has valid items with required fields', () => {
    const h = demoRead('personal', 'habitos')
    expect(Array.isArray(h)).toBe(true)
    expect(h.length).toBeGreaterThan(0)
    h.forEach(hab => {
      expect(hab).toHaveProperty('id')
      expect(hab).toHaveProperty('nombre')
      expect(hab).toHaveProperty('icono')
      expect(hab).toHaveProperty('racha')
      expect(typeof hab.completado_hoy).toBe('boolean')
      expect(Array.isArray(hab.historial)).toBe(true)
    })
  })

  it('salud_contactos has valid items', () => {
    const c = demoRead('personal', 'salud_contactos')
    expect(Array.isArray(c)).toBe(true)
    expect(c.length).toBeGreaterThan(0)
    c.forEach(ct => {
      expect(ct).toHaveProperty('id')
      expect(ct).toHaveProperty('tipo')
      expect(ct).toHaveProperty('nombre')
      expect(ct).toHaveProperty('centro')
      expect(ct).toHaveProperty('telefono')
    })
  })

  it('documentacion has valid items and Pasaporte is expired', () => {
    const d = demoRead('personal', 'documentacion')
    expect(Array.isArray(d)).toBe(true)
    expect(d.length).toBeGreaterThan(0)
    d.forEach(doc => {
      expect(doc).toHaveProperty('id')
      expect(doc).toHaveProperty('tipo')
      expect(doc).toHaveProperty('numero')
    })
    const pasaporte = d.find(doc => doc.tipo === 'Pasaporte')
    expect(pasaporte).toBeDefined()
    expect(new Date(pasaporte.caducidad) < new Date()).toBe(true)
  })
})
