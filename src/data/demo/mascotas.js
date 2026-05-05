// src/data/demo/mascotas.js
import { addDays, subDays, subMonths, format } from 'date-fns'

const fmt = d => format(d, 'yyyy-MM-dd')
const fmtTs = d => d.toISOString()
const hoy = new Date()

export const mockMascotas = {
  pets: [
    { id: 'demo-pet-1', app_id: 'demo-mascotas', name: 'Luna',  species: 'perro', icon: '🐕', birth_date: fmt(subMonths(hoy, 36)), notes: 'Labrador muy activa y juguetona', metadata: {}, created_at: fmtTs(subMonths(hoy, 24)) },
    { id: 'demo-pet-2', app_id: 'demo-mascotas', name: 'Mochi', species: 'gato',  icon: '🐈', birth_date: fmt(subMonths(hoy, 18)), notes: 'Gato persa, muy tranquilo',      metadata: {}, created_at: fmtTs(subMonths(hoy, 12)) },
  ],

  items_alimentacion: [
    { id: 'demo-al-1', app_id: 'demo-mascotas', module: 'alimentacion', type: 'feeding', title: 'Pienso Luna — 300g',   checked: false, checked_at: null, owner_id: 'demo', visibility: 'shared', metadata: { pet_id: 'demo-pet-1', schedule: 'mañana' }, created_at: fmtTs(subDays(hoy, 1)) },
    { id: 'demo-al-2', app_id: 'demo-mascotas', module: 'alimentacion', type: 'feeding', title: 'Pienso Mochi — 80g',   checked: false, checked_at: null, owner_id: 'demo', visibility: 'shared', metadata: { pet_id: 'demo-pet-2', schedule: 'mañana y tarde' }, created_at: fmtTs(subDays(hoy, 1)) },
  ],

  items_salud: [
    { id: 'demo-sal-1', app_id: 'demo-mascotas', module: 'salud', type: 'health', title: 'Vacuna antirrábica Luna', checked: false, checked_at: null, owner_id: 'demo', visibility: 'shared', metadata: { pet_id: 'demo-pet-1', date: fmt(subDays(hoy, 30)), next_date: fmt(addDays(hoy, 335)) }, created_at: fmtTs(subDays(hoy, 30)) },
    { id: 'demo-sal-2', app_id: 'demo-mascotas', module: 'salud', type: 'health', title: 'Desparasitación Mochi',    checked: false, checked_at: null, owner_id: 'demo', visibility: 'shared', metadata: { pet_id: 'demo-pet-2', date: fmt(subDays(hoy, 15)), next_date: fmt(addDays(hoy, 75)) }, created_at: fmtTs(subDays(hoy, 15)) },
  ],

  items_rutinas: [
    { id: 'demo-rut-1', app_id: 'demo-mascotas', module: 'rutinas', type: 'routine', title: 'Paseo Luna — mañana (30 min)', checked: false, checked_at: null, owner_id: 'demo', visibility: 'shared', metadata: { pet_id: 'demo-pet-1', frequency: 'daily' }, created_at: fmtTs(subDays(hoy, 5)) },
    { id: 'demo-rut-2', app_id: 'demo-mascotas', module: 'rutinas', type: 'routine', title: 'Cepillado Mochi',              checked: false, checked_at: null, owner_id: 'demo', visibility: 'shared', metadata: { pet_id: 'demo-pet-2', frequency: 'weekly' }, created_at: fmtTs(subDays(hoy, 3)) },
  ],
}
