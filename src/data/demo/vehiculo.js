// src/data/demo/vehiculo.js
import { subDays, subMonths, format } from 'date-fns'

const fmt = d => format(d, 'yyyy-MM-dd')
const hoy = new Date()

export const mockVehiculo = {
  vehicles: [
    {
      id: 'demo-v1', app_id: 'demo-vehiculo',
      name: 'Mi coche', type: 'coche',
      brand: 'Volkswagen', model: 'Golf', year: 2019,
      plate: '1234 ABC', fuel_type: 'gasolina', initial_km: 85000,
      created_at: fmt(subMonths(hoy, 6)),
    },
  ],

  fuel_logs: [
    { id: 'demo-fl-1', vehicle_id: 'demo-v1', app_id: 'demo-vehiculo', date: fmt(subDays(hoy, 5)),  liters: 42.3, price_per_liter: 1.689, total_cost: 71.45, km_at_fill: 87420, full_tank: true,  notes: null, created_at: fmt(subDays(hoy, 5)) },
    { id: 'demo-fl-2', vehicle_id: 'demo-v1', app_id: 'demo-vehiculo', date: fmt(subDays(hoy, 19)), liters: 38.7, price_per_liter: 1.712, total_cost: 66.25, km_at_fill: 86880, full_tank: true,  notes: null, created_at: fmt(subDays(hoy, 19)) },
    { id: 'demo-fl-3', vehicle_id: 'demo-v1', app_id: 'demo-vehiculo', date: fmt(subDays(hoy, 35)), liters: 40.1, price_per_liter: 1.695, total_cost: 67.97, km_at_fill: 86320, full_tank: true,  notes: null, created_at: fmt(subDays(hoy, 35)) },
    { id: 'demo-fl-4', vehicle_id: 'demo-v1', app_id: 'demo-vehiculo', date: fmt(subDays(hoy, 51)), liters: 20.0, price_per_liter: 1.720, total_cost: 34.40, km_at_fill: 85900, full_tank: false, notes: 'Parada rápida', created_at: fmt(subDays(hoy, 51)) },
    { id: 'demo-fl-5', vehicle_id: 'demo-v1', app_id: 'demo-vehiculo', date: fmt(subDays(hoy, 65)), liters: 41.5, price_per_liter: 1.699, total_cost: 70.51, km_at_fill: 85600, full_tank: true,  notes: null, created_at: fmt(subDays(hoy, 65)) },
    { id: 'demo-fl-6', vehicle_id: 'demo-v1', app_id: 'demo-vehiculo', date: fmt(subDays(hoy, 80)), liters: 39.2, price_per_liter: 1.680, total_cost: 65.86, km_at_fill: 85050, full_tank: true,  notes: null, created_at: fmt(subDays(hoy, 80)) },
  ],

  maintenance_logs: [
    { id: 'demo-ml-1', vehicle_id: 'demo-v1', app_id: 'demo-vehiculo', date: fmt(subDays(hoy, 45)), type: 'Cambio de aceite',      cost: 85,  km: 86200, notes: 'Aceite 5W-30 sintético', created_at: fmt(subDays(hoy, 45)) },
    { id: 'demo-ml-2', vehicle_id: 'demo-v1', app_id: 'demo-vehiculo', date: fmt(subDays(hoy, 45)), type: 'Filtro de aire',        cost: 25,  km: 86200, notes: null,                     created_at: fmt(subDays(hoy, 45)) },
    { id: 'demo-ml-3', vehicle_id: 'demo-v1', app_id: 'demo-vehiculo', date: fmt(subDays(hoy, 90)), type: 'Neumáticos delanteros', cost: 280, km: 85300, notes: 'Michelin Primacy 4',      created_at: fmt(subDays(hoy, 90)) },
  ],
}
