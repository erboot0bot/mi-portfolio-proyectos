import { addDays, subDays, subMonths, format } from 'date-fns'

const fmt = d => format(d, 'yyyy-MM-dd')
const fmtTs = d => d.toISOString()
const hoy = new Date()

export const mockMascotas = {
  pets: [
    { id: 'demo-pet-1', app_id: 'demo-mascotas', name: 'Luna',  species: 'perro', icon: '🐕', birth_date: fmt(subMonths(hoy, 36)), notes: 'Labrador muy activa y juguetona', metadata: { feeding_schedule: [{ time: '08:00', amount: '300g', label: 'Mañana' }, { time: '18:00', amount: '300g', label: 'Tarde' }] }, created_at: fmtTs(subMonths(hoy, 24)) },
    { id: 'demo-pet-2', app_id: 'demo-mascotas', name: 'Mochi', species: 'gato',  icon: '🐈', birth_date: fmt(subMonths(hoy, 18)), notes: 'Gato persa, muy tranquilo',      metadata: { feeding_schedule: [{ time: '09:00', amount: '80g', label: 'Mañana' }, { time: '19:00', amount: '80g', label: 'Tarde' }] }, created_at: fmtTs(subMonths(hoy, 12)) },
  ],

  events: [
    // Salud — Luna (vaccination, vet_visit, medication)
    { id: 'demo-mev-1', app_id: 'demo-mascotas', event_type: 'vaccination', title: 'Vacuna antirrábica Luna', all_day: true, start_time: addDays(hoy, 335).toISOString(), metadata: { pet_id: 'demo-pet-1', interval_days: 365 }, created_at: fmtTs(subDays(hoy, 30)) },
    { id: 'demo-mev-2', app_id: 'demo-mascotas', event_type: 'vet_visit',   title: 'Revisión anual Luna',    all_day: true, start_time: addDays(hoy, 60).toISOString(),  metadata: { pet_id: 'demo-pet-1', interval_days: null }, created_at: fmtTs(subDays(hoy, 10)) },
    // Salud — Mochi
    { id: 'demo-mev-3', app_id: 'demo-mascotas', event_type: 'vaccination', title: 'Desparasitación Mochi',  all_day: true, start_time: addDays(hoy, 75).toISOString(),  metadata: { pet_id: 'demo-pet-2', interval_days: 90 },  created_at: fmtTs(subDays(hoy, 15)) },
    // Rutinas — Luna (walk, grooming, task)
    { id: 'demo-mev-4', app_id: 'demo-mascotas', event_type: 'task', title: 'Paseo Luna — mañana', all_day: false, start_time: addDays(hoy, 1).toISOString(), metadata: { pet_id: 'demo-pet-1', duration: 30, frequency: 'daily' }, created_at: fmtTs(subDays(hoy, 5)) },
    { id: 'demo-mev-5', app_id: 'demo-mascotas', event_type: 'grooming', title: 'Baño y cepillado Luna', all_day: true, start_time: addDays(hoy, 7).toISOString(), metadata: { pet_id: 'demo-pet-1', interval_days: 14 }, created_at: fmtTs(subDays(hoy, 3)) },
    // Rutinas — Mochi
    { id: 'demo-mev-6', app_id: 'demo-mascotas', event_type: 'grooming', title: 'Cepillado Mochi', all_day: true, start_time: addDays(hoy, 2).toISOString(), metadata: { pet_id: 'demo-pet-2', interval_days: 7 }, created_at: fmtTs(subDays(hoy, 2)) },
    // Paseos recientes de Luna (walk events for WalksMode)
    { id: 'demo-mev-7', app_id: 'demo-mascotas', event_type: 'walk', title: 'Paseo', all_day: false, start_time: subDays(hoy, 1).toISOString(), metadata: { pet_id: 'demo-pet-1', duration_minutes: 25, notes: null }, created_at: fmtTs(subDays(hoy, 1)) },
    { id: 'demo-mev-8', app_id: 'demo-mascotas', event_type: 'walk', title: 'Paseo', all_day: false, start_time: subDays(hoy, 2).toISOString(), metadata: { pet_id: 'demo-pet-1', duration_minutes: 30, notes: 'Fuimos al parque' }, created_at: fmtTs(subDays(hoy, 2)) },
  ],
}
