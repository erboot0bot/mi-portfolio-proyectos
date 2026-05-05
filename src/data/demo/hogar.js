// src/data/demo/hogar.js
import { addDays, subDays, startOfWeek, format } from 'date-fns'

const fmt = d => format(d, 'yyyy-MM-dd')
const fmtTs = d => d.toISOString()
const hoy = new Date()
const semana = startOfWeek(hoy, { weekStartsOn: 1 })

export const mockHogar = {
  items_supermercado: [
    { id: 'demo-item-1', app_id: 'demo-hogar', module: 'supermercado', type: 'product', title: 'Leche', checked: false, checked_at: null, owner_id: 'demo', visibility: 'shared', metadata: { quantity: 2, unit: 'L', category: 'lacteos', store: 'Mercadona' }, created_at: fmtTs(subDays(hoy, 1)) },
    { id: 'demo-item-2', app_id: 'demo-hogar', module: 'supermercado', type: 'product', title: 'Pan integral', checked: false, checked_at: null, owner_id: 'demo', visibility: 'shared', metadata: { quantity: 1, unit: 'unidad', category: 'pan', store: 'Mercadona' }, created_at: fmtTs(subDays(hoy, 1)) },
    { id: 'demo-item-3', app_id: 'demo-hogar', module: 'supermercado', type: 'product', title: 'Tomates', checked: false, checked_at: null, owner_id: 'demo', visibility: 'shared', metadata: { quantity: 1, unit: 'kg', category: 'frutas', store: 'Mercadona' }, created_at: fmtTs(subDays(hoy, 1)) },
    { id: 'demo-item-4', app_id: 'demo-hogar', module: 'supermercado', type: 'product', title: 'Pechuga de pollo', checked: false, checked_at: null, owner_id: 'demo', visibility: 'shared', metadata: { quantity: 500, unit: 'g', category: 'carnes', store: 'Mercadona' }, created_at: fmtTs(subDays(hoy, 1)) },
    { id: 'demo-item-5', app_id: 'demo-hogar', module: 'supermercado', type: 'product', title: 'Huevos', checked: true, checked_at: fmtTs(hoy), owner_id: 'demo', visibility: 'shared', metadata: { quantity: 12, unit: 'unidades', category: 'lacteos', store: 'Mercadona' }, created_at: fmtTs(subDays(hoy, 2)) },
    { id: 'demo-item-6', app_id: 'demo-hogar', module: 'supermercado', type: 'product', title: 'Cerveza', checked: false, checked_at: null, owner_id: 'demo', visibility: 'shared', metadata: { quantity: 6, unit: 'unidades', category: 'bebidas', store: 'Lidl' }, created_at: fmtTs(subDays(hoy, 1)) },
    { id: 'demo-item-7', app_id: 'demo-hogar', module: 'supermercado', type: 'product', title: 'Detergente', checked: false, checked_at: null, owner_id: 'demo', visibility: 'shared', metadata: { quantity: 1, unit: 'unidad', category: 'limpieza', store: 'Carrefour' }, created_at: fmtTs(subDays(hoy, 1)) },
    { id: 'demo-item-8', app_id: 'demo-hogar', module: 'supermercado', type: 'product', title: 'Pasta', checked: true, checked_at: fmtTs(hoy), owner_id: 'demo', visibility: 'shared', metadata: { quantity: 500, unit: 'g', category: 'pan', store: 'Mercadona' }, created_at: fmtTs(subDays(hoy, 3)) },
  ],

  events: [
    { id: 'demo-ev-1', app_id: 'demo-hogar', event_type: 'task', title: 'Revisión ITV', description: null, color: '#ef4444', all_day: true, start_time: fmtTs(addDays(semana, 1)), end_time: null, recurrence: null, metadata: {}, created_at: fmtTs(subDays(hoy, 3)) },
    { id: 'demo-ev-2', app_id: 'demo-hogar', event_type: 'task', title: 'Dentista', description: '17:30h', color: '#3b82f6', all_day: false, start_time: fmtTs(addDays(semana, 3)), end_time: null, recurrence: null, metadata: {}, created_at: fmtTs(subDays(hoy, 5)) },
    { id: 'demo-ev-3', app_id: 'demo-hogar', event_type: 'meal', title: 'Paella', description: null, color: '#f59e0b', all_day: true, start_time: fmtTs(addDays(semana, 6)), end_time: null, recurrence: null, metadata: { meal_type: 'lunch' }, created_at: fmtTs(subDays(hoy, 2)) },
  ],

  recipes: [
    { id: 'demo-r-1', app_id: 'demo-hogar', title: 'Tortilla de patatas', ingredients: [{ name: 'Huevos', quantity: 4, unit: 'unidades' }, { name: 'Patatas', quantity: 400, unit: 'g' }, { name: 'Aceite de oliva', quantity: 100, unit: 'ml' }], instructions: 'Pela y corta las patatas. Fríelas en aceite. Mezcla con huevo batido y cuaja la tortilla.', tags: ['española', 'fácil'], prep_time: 10, cook_time: 20, servings: 4, image_url: null, ai_generated: false, created_at: fmtTs(subDays(hoy, 10)) },
    { id: 'demo-r-2', app_id: 'demo-hogar', title: 'Pasta con tomate', ingredients: [{ name: 'Pasta', quantity: 200, unit: 'g' }, { name: 'Tomate triturado', quantity: 400, unit: 'g' }, { name: 'Ajo', quantity: 2, unit: 'dientes' }], instructions: 'Cuece la pasta. Prepara la salsa con ajo y tomate. Mezcla.', tags: ['italiana', 'rápida'], prep_time: 5, cook_time: 15, servings: 2, image_url: null, ai_generated: false, created_at: fmtTs(subDays(hoy, 7)) },
    { id: 'demo-r-3', app_id: 'demo-hogar', title: 'Ensalada César', ingredients: [{ name: 'Lechuga romana', quantity: 1, unit: 'unidad' }, { name: 'Pechuga de pollo', quantity: 200, unit: 'g' }, { name: 'Parmesano', quantity: 50, unit: 'g' }], instructions: 'Asa el pollo. Mezcla con lechuga, parmesano y aliño César.', tags: ['ensalada', 'sana'], prep_time: 10, cook_time: 10, servings: 2, image_url: null, ai_generated: false, created_at: fmtTs(subDays(hoy, 4)) },
  ],
}
