import { describe, it, expect, beforeEach } from 'vitest'
import { initDemoData, demoRead } from '../index.js'
import { mockPersonal } from '../personal.js'

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

  it('deporte — rutinas shape', () => {
    expect(Array.isArray(mockPersonal.deporte_rutinas)).toBe(true)
    expect(mockPersonal.deporte_rutinas.length).toBeGreaterThanOrEqual(2)
    const r = mockPersonal.deporte_rutinas[0]
    expect(r).toHaveProperty('id')
    expect(r).toHaveProperty('nombre')
    expect(Array.isArray(r.ejercicios)).toBe(true)
  })

  it('vehiculos — shape', () => {
    expect(Array.isArray(mockPersonal.vehiculos)).toBe(true)
    expect(mockPersonal.vehiculos.length).toBeGreaterThanOrEqual(1)
    const v = mockPersonal.vehiculos[0]
    expect(v).toHaveProperty('id')
    expect(v).toHaveProperty('marca')
    expect(v).toHaveProperty('matricula')
    expect(v).toHaveProperty('itv_proxima')
  })

  it('mascotas — shape', () => {
    expect(Array.isArray(mockPersonal.mascotas)).toBe(true)
    expect(mockPersonal.mascotas.length).toBeGreaterThanOrEqual(1)
    const m = mockPersonal.mascotas[0]
    expect(m).toHaveProperty('id')
    expect(m).toHaveProperty('nombre')
    expect(m).toHaveProperty('especie')
    expect(Array.isArray(m.vacunas)).toBe(true)
  })

  it('ropa — prendas shape', () => {
    expect(Array.isArray(mockPersonal.ropa_prendas)).toBe(true)
    expect(mockPersonal.ropa_prendas.length).toBeGreaterThanOrEqual(3)
    const p = mockPersonal.ropa_prendas[0]
    expect(p).toHaveProperty('id')
    expect(p).toHaveProperty('nombre')
    expect(p).toHaveProperty('categoria')
    expect(p).toHaveProperty('temporada')
  })

  it('formacion — cursos shape', () => {
    expect(Array.isArray(mockPersonal.formacion_cursos)).toBe(true)
    expect(mockPersonal.formacion_cursos.length).toBeGreaterThanOrEqual(2)
    const c = mockPersonal.formacion_cursos[0]
    expect(c).toHaveProperty('id')
    expect(c).toHaveProperty('titulo')
    expect(c).toHaveProperty('plataforma')
    expect(typeof c.progreso).toBe('number')
  })
})
