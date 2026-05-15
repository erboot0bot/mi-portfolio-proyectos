// src/data/demo/index.js
import { mockFinanzas }  from './finanzas.js'
import { mockVehiculo }  from './vehiculo.js'
import { mockHogar }     from './hogar.js'
import { mockPersonal }  from './personal.js'
import { mockMascotas }  from './mascotas.js'

const MOCK_BY_APP = {
  finanzas: mockFinanzas,
  vehiculo:  mockVehiculo,
  hogar:     mockHogar,
  personal:  mockPersonal,
  mascotas:  mockMascotas,
}

// Bump this to force-clear stale sessionStorage when demo data changes
const DEMO_VERSION = '9'

// Loads mock data into sessionStorage for a given appType.
// Checks version on every call so HMR changes always clear stale data.
export function initDemoData(appType) {
  if (sessionStorage.getItem('demo_version') !== DEMO_VERSION) {
    Object.keys(sessionStorage).filter(k => k.startsWith('demo_')).forEach(k => sessionStorage.removeItem(k))
    sessionStorage.setItem('demo_version', DEMO_VERSION)
  }

  const mock = MOCK_BY_APP[appType]
  if (!mock) return

  Object.entries(mock).forEach(([tableKey, data]) => {
    const ssKey = `demo_${appType}_${tableKey}`
    if (!sessionStorage.getItem(ssKey)) {
      sessionStorage.setItem(ssKey, JSON.stringify(data))
    }
  })
}

// Reads a key from sessionStorage for demo mode.
export function demoRead(appType, tableKey) {
  const raw = sessionStorage.getItem(`demo_${appType}_${tableKey}`)
  return raw ? JSON.parse(raw) : []
}

// Writes a full array to sessionStorage for demo mode.
export function demoWrite(appType, tableKey, data) {
  sessionStorage.setItem(`demo_${appType}_${tableKey}`, JSON.stringify(data))
}

// Clears all demo data for an appType (used in tests).
export function clearDemoData(appType) {
  const mock = MOCK_BY_APP[appType]
  if (!mock) return
  Object.keys(mock).forEach(tableKey => {
    sessionStorage.removeItem(`demo_${appType}_${tableKey}`)
  })
}
