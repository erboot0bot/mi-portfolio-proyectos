import { describe, it, expect, beforeEach } from 'vitest'
import { initDemoData, demoRead, demoWrite } from '../index.js'

describe('comparticion demo data', () => {
  beforeEach(() => {
    sessionStorage.clear()
    initDemoData('hogar')
  })

  it('has personas and secciones', () => {
    const c = demoRead('hogar', 'comparticion')
    expect(c).toHaveProperty('personas')
    expect(c).toHaveProperty('secciones')
    expect(c.personas).toHaveLength(1)
    expect(c.personas[0]).toMatchObject({ id: 'maria', nombre: 'María' })
    expect(c.secciones.length).toBeGreaterThan(0)
  })

  it('each sección has a valid nivel', () => {
    const { secciones } = demoRead('hogar', 'comparticion')
    secciones.forEach(s => {
      expect(['editar', 'ver', 'privado']).toContain(s.nivel)
      expect(s).toHaveProperty('id')
      expect(s).toHaveProperty('icono')
      expect(s).toHaveProperty('label')
    })
  })

  it('lista-compra defaults to editar', () => {
    const { secciones } = demoRead('hogar', 'comparticion')
    const lc = secciones.find(s => s.id === 'lista-compra')
    expect(lc.nivel).toBe('editar')
  })

  it('demoWrite persists nivel change for an object-shaped key', () => {
    const original = demoRead('hogar', 'comparticion')
    const updated = {
      ...original,
      secciones: original.secciones.map(s =>
        s.id === 'nevera' ? { ...s, nivel: 'privado' } : s
      ),
    }
    demoWrite('hogar', 'comparticion', updated)
    const reread = demoRead('hogar', 'comparticion')
    const nevera = reread.secciones.find(s => s.id === 'nevera')
    expect(nevera.nivel).toBe('privado')
  })
})
