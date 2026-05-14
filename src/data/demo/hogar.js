// src/data/demo/hogar.js
import { addDays, subDays, startOfWeek, format } from 'date-fns'

const fmt   = d => format(d, 'yyyy-MM-dd')
const fmtTs = d => d.toISOString()
const hoy   = new Date()
const semana = startOfWeek(hoy, { weekStartsOn: 1 })
const weekStartStr = format(semana, 'yyyy-MM-dd')

// UTC-based timestamp — matches menuEventToDb so Menu.jsx filter works correctly
const mealTs = (dayOffset, utcHour) => {
  const d = new Date(weekStartStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + dayOffset)
  d.setUTCHours(utcHour, 0, 0, 0)
  return d.toISOString()
}

// meal event builder — mirrors menuEventToDb metadata shape
const mealEv = (id, dayOffset, mealKey, name, recipeId = null) => {
  const HOURS = { desayuno: 8, almuerzo: 11, comida: 14, cena: 21 }
  return {
    id, app_id: 'demo-hogar', event_type: 'meal',
    title: name,
    color: '#f59e0b',
    all_day: false,
    start_time: mealTs(dayOffset, HOURS[mealKey]),
    end_time: null,
    recurrence: null,
    metadata: {
      meal_type:   mealKey,
      day_of_week: dayOffset,
      week_start:  weekStartStr,
      custom_name: name,
      recipe_id:   recipeId,
    },
    created_at: fmtTs(subDays(hoy, 1)),
  }
}

// local-time timestamp — for non-meal events
const ts = (dayOffset, h, m = 0) =>
  new Date(semana.getFullYear(), semana.getMonth(), semana.getDate() + dayOffset, h, m, 0).toISOString()

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
    { id: 'demo-item-9', app_id: 'demo-hogar', module: 'supermercado', type: 'product', title: 'Yogur natural', checked: false, checked_at: null, owner_id: 'demo', visibility: 'shared', metadata: { quantity: 4, unit: 'unidades', category: 'lacteos', store: 'Mercadona' }, created_at: fmtTs(subDays(hoy, 1)) },
    { id: 'demo-item-10', app_id: 'demo-hogar', module: 'supermercado', type: 'product', title: 'Manzanas', checked: false, checked_at: null, owner_id: 'demo', visibility: 'shared', metadata: { quantity: 1, unit: 'kg', category: 'frutas', store: 'Mercadona' }, created_at: fmtTs(subDays(hoy, 1)) },
  ],

  events: [
    // ─── Household tasks ──────────────────────────────────────────────
    { id: 'demo-ev-1',       app_id: 'demo-hogar', event_type: 'task',     title: 'Revisión ITV',        description: null,     color: '#ef4444', all_day: true,  start_time: fmtTs(addDays(semana, 1)), metadata: {}, created_at: fmtTs(subDays(hoy, 3)) },
    { id: 'demo-ev-2',       app_id: 'demo-hogar', event_type: 'task',     title: 'Dentista',            description: '17:30h', color: '#3b82f6', all_day: false, start_time: ts(3, 17, 30),            metadata: {}, created_at: fmtTs(subDays(hoy, 5)) },
    { id: 'demo-ev-clean-1', app_id: 'demo-hogar', event_type: 'cleaning', title: 'Limpiar baño',        description: null,     color: '#10b981', all_day: true,  start_time: ts(1, 10),                metadata: { interval_days: 7  }, created_at: fmtTs(subDays(hoy, 5)) },
    { id: 'demo-ev-clean-2', app_id: 'demo-hogar', event_type: 'cleaning', title: 'Pasar la aspiradora', description: null,     color: '#10b981', all_day: true,  start_time: ts(3, 11),                metadata: { interval_days: 3  }, created_at: fmtTs(subDays(hoy, 3)) },
    { id: 'demo-ev-clean-3', app_id: 'demo-hogar', event_type: 'cleaning', title: 'Limpiar cocina',      description: null,     color: '#10b981', all_day: true,  start_time: ts(0, 10),                metadata: { interval_days: 7  }, created_at: fmtTs(subDays(hoy, 7)) },
    { id: 'demo-ev-clean-4', app_id: 'demo-hogar', event_type: 'cleaning', title: 'Cambiar sábanas',     description: null,     color: '#10b981', all_day: true,  start_time: ts(5, 10),                metadata: { interval_days: 14 }, created_at: fmtTs(subDays(hoy, 9)) },

    // ─── Menú semanal (formato menuEventToDb) ─────────────────────────
    // Lunes
    mealEv('demo-menu-l-d', 0, 'desayuno', 'Tostadas con aguacate'),
    mealEv('demo-menu-l-a', 0, 'almuerzo', 'Fruta y yogur'),
    mealEv('demo-menu-l-c', 0, 'comida',   'Lentejas estofadas',          'demo-r-9'),
    mealEv('demo-menu-l-e', 0, 'cena',     'Ensalada César con pollo',    'demo-r-3'),
    // Martes
    mealEv('demo-menu-m-d', 1, 'desayuno', 'Avena con plátano y miel'),
    mealEv('demo-menu-m-a', 1, 'almuerzo', 'Manzana y frutos secos'),
    mealEv('demo-menu-m-c', 1, 'comida',   'Pasta carbonara',             'demo-r-10'),
    mealEv('demo-menu-m-e', 1, 'cena',     'Huevos revueltos con jamón',  'demo-r-4'),
    // Miércoles
    mealEv('demo-menu-x-d', 2, 'desayuno', 'Tostadas con tomate y aceite'),
    mealEv('demo-menu-x-a', 2, 'almuerzo', 'Yogur con granola'),
    mealEv('demo-menu-x-c', 2, 'comida',   'Pollo al curry con arroz',    'demo-r-14'),
    mealEv('demo-menu-x-e', 2, 'cena',     'Crema de calabaza',           'demo-r-8'),
    // Jueves
    mealEv('demo-menu-j-d', 3, 'desayuno', 'Café con leche y tostadas'),
    mealEv('demo-menu-j-a', 3, 'almuerzo', 'Plátano y almendras'),
    mealEv('demo-menu-j-c', 3, 'comida',   'Lentejas con chorizo',        'demo-r-9'),
    mealEv('demo-menu-j-e', 3, 'cena',     'Pizza margarita casera',      'demo-r-13'),
    // Viernes
    mealEv('demo-menu-v-d', 4, 'desayuno', 'Café y croissant'),
    mealEv('demo-menu-v-a', 4, 'almuerzo', 'Wrap de aguacate y atún',     'demo-r-7'),
    mealEv('demo-menu-v-c', 4, 'comida',   'Pollo al limón con arroz',    'demo-r-6'),
    mealEv('demo-menu-v-e', 4, 'cena',     'Paella valenciana',           'demo-r-11'),
    // Sábado
    mealEv('demo-menu-s-d', 5, 'desayuno', 'Tortitas americanas',         'demo-r-15'),
    mealEv('demo-menu-s-a', 5, 'almuerzo', 'Zumo y fruta'),
    mealEv('demo-menu-s-c', 5, 'comida',   'Croquetas de jamón',          'demo-r-12'),
    mealEv('demo-menu-s-e', 5, 'cena',     'Gazpacho andaluz',            'demo-r-5'),
    // Domingo
    mealEv('demo-menu-d-d', 6, 'desayuno', 'Brunch completo'),
    mealEv('demo-menu-d-c', 6, 'comida',   'Tortilla de patatas',         'demo-r-1'),
    mealEv('demo-menu-d-e', 6, 'cena',     'Pasta con tomate',            'demo-r-2'),
  ],

  recipes: [
    { id: 'demo-r-1', app_id: 'demo-hogar', title: 'Tortilla de patatas', ingredients: [{ name: 'Huevos', quantity: 4, unit: 'unidades' }, { name: 'Patatas', quantity: 400, unit: 'g' }, { name: 'Aceite de oliva', quantity: 100, unit: 'ml' }, { name: 'Cebolla', quantity: 1, unit: 'unidad' }], instructions: 'Pela y corta las patatas en láminas finas. Fríelas a fuego lento en aceite con la cebolla. Escurre y mezcla con los huevos batidos. Cuaja la tortilla por ambos lados.', tags: ['española', 'fácil', 'clásica'], prep_time: 10, cook_time: 25, servings: 4, image_url: null, ai_generated: false, created_at: fmtTs(subDays(hoy, 10)) },
    { id: 'demo-r-2', app_id: 'demo-hogar', title: 'Pasta con tomate', ingredients: [{ name: 'Pasta', quantity: 200, unit: 'g' }, { name: 'Tomate triturado', quantity: 400, unit: 'g' }, { name: 'Ajo', quantity: 2, unit: 'dientes' }, { name: 'Albahaca', quantity: 1, unit: 'puñado' }], instructions: 'Cuece la pasta al dente. En paralelo sofríe el ajo y añade el tomate. Cocina 10 min. Mezcla con la pasta y sirve con albahaca fresca.', tags: ['italiana', 'rápida', 'vegetariana'], prep_time: 5, cook_time: 15, servings: 2, image_url: null, ai_generated: false, created_at: fmtTs(subDays(hoy, 7)) },
    { id: 'demo-r-3', app_id: 'demo-hogar', title: 'Ensalada César', ingredients: [{ name: 'Lechuga romana', quantity: 1, unit: 'unidad' }, { name: 'Pechuga de pollo', quantity: 200, unit: 'g' }, { name: 'Parmesano', quantity: 50, unit: 'g' }, { name: 'Crutones', quantity: 50, unit: 'g' }, { name: 'Salsa César', quantity: 3, unit: 'cucharadas' }], instructions: 'Asa la pechuga a la plancha y córtala en tiras. Trocea la lechuga. Mezcla con los crutones, el parmesano rallado y la salsa César.', tags: ['ensalada', 'sana', 'proteína'], prep_time: 10, cook_time: 10, servings: 2, image_url: null, ai_generated: false, created_at: fmtTs(subDays(hoy, 4)) },
    { id: 'demo-r-4', app_id: 'demo-hogar', title: 'Huevos revueltos con jamón', ingredients: [{ name: 'Huevos', quantity: 3, unit: 'unidades' }, { name: 'Jamón serrano', quantity: 60, unit: 'g' }, { name: 'Mantequilla', quantity: 10, unit: 'g' }], instructions: 'Derrite la mantequilla a fuego bajo. Bate los huevos y échalos. Remueve constantemente sin dejar que cuajen del todo. Añade el jamón en el último momento.', tags: ['rápida', 'proteína', 'desayuno'], prep_time: 2, cook_time: 5, servings: 1, image_url: null, ai_generated: false, created_at: fmtTs(subDays(hoy, 3)) },
    { id: 'demo-r-5', app_id: 'demo-hogar', title: 'Gazpacho andaluz', ingredients: [{ name: 'Tomates maduros', quantity: 1, unit: 'kg' }, { name: 'Pepino', quantity: 1, unit: 'unidad' }, { name: 'Pimiento rojo', quantity: 0.5, unit: 'unidad' }, { name: 'Ajo', quantity: 1, unit: 'diente' }, { name: 'Aceite de oliva', quantity: 50, unit: 'ml' }, { name: 'Vinagre', quantity: 20, unit: 'ml' }], instructions: 'Trocea todas las verduras. Tritura en la batidora hasta obtener una textura fina. Cuela, añade aceite y vinagre. Refrigera al menos 1 hora antes de servir.', tags: ['española', 'verano', 'sin cocción', 'vegana'], prep_time: 15, cook_time: 0, servings: 4, image_url: null, ai_generated: false, created_at: fmtTs(subDays(hoy, 6)) },
    { id: 'demo-r-6', app_id: 'demo-hogar', title: 'Pollo al limón con arroz', ingredients: [{ name: 'Muslos de pollo', quantity: 4, unit: 'unidades' }, { name: 'Limón', quantity: 2, unit: 'unidades' }, { name: 'Ajo', quantity: 3, unit: 'dientes' }, { name: 'Romero', quantity: 1, unit: 'ramita' }, { name: 'Arroz', quantity: 200, unit: 'g' }], instructions: 'Marina el pollo con zumo de limón, ajo y romero durante 30 min. Hornea a 200°C durante 40 min. Cuece el arroz aparte y sirve juntos.', tags: ['pollo', 'horno', 'completa'], prep_time: 35, cook_time: 40, servings: 4, image_url: null, ai_generated: false, created_at: fmtTs(subDays(hoy, 8)) },
    { id: 'demo-r-7',  app_id: 'demo-hogar', title: 'Wrap de aguacate y atún',  ingredients: [{ name: 'Tortilla de trigo', quantity: 2, unit: 'unidades' }, { name: 'Atún en lata', quantity: 1, unit: 'lata' }, { name: 'Aguacate', quantity: 1, unit: 'unidad' }, { name: 'Tomate', quantity: 1, unit: 'unidad' }, { name: 'Lechuga', quantity: 2, unit: 'hojas' }], instructions: 'Aplasta el aguacate con un tenedor y salpimienta. Extiende sobre la tortilla, añade el atún escurrido, el tomate en rodajas y la lechuga. Enrolla y sirve.', tags: ['rápida', 'saludable', 'sin cocción'], prep_time: 8, cook_time: 0, servings: 2, image_url: null, ai_generated: true, created_at: fmtTs(subDays(hoy, 2)) },
    { id: 'demo-r-8',  app_id: 'demo-hogar', title: 'Crema de calabaza',         ingredients: [{ name: 'Calabaza', quantity: 600, unit: 'g' }, { name: 'Caldo de verduras', quantity: 500, unit: 'ml' }, { name: 'Cebolla', quantity: 1, unit: 'unidad' }, { name: 'Nata para cocinar', quantity: 100, unit: 'ml' }, { name: 'Nuez moscada', quantity: 1, unit: 'pizca' }], instructions: 'Sofríe la cebolla. Añade la calabaza en dados y el caldo. Cocina 20 min. Tritura, añade la nata y la nuez moscada. Rectifica de sal.', tags: ['sopa', 'vegetal', 'otoño'], prep_time: 10, cook_time: 25, servings: 4, image_url: null, ai_generated: true, created_at: fmtTs(subDays(hoy, 1)) },
    { id: 'demo-r-9',  app_id: 'demo-hogar', title: 'Lentejas estofadas',        ingredients: [{ name: 'Lentejas', quantity: 300, unit: 'g' }, { name: 'Chorizo', quantity: 100, unit: 'g' }, { name: 'Cebolla', quantity: 1, unit: 'unidad' }, { name: 'Zanahoria', quantity: 2, unit: 'unidades' }, { name: 'Ajo', quantity: 2, unit: 'dientes' }, { name: 'Pimentón', quantity: 1, unit: 'cucharadita' }], instructions: 'Sofríe la cebolla, ajo y zanahoria. Añade el chorizo en rodajas y el pimentón. Agrega las lentejas lavadas y cubre con agua. Cuece 30 min a fuego medio. Rectifica de sal.', tags: ['española', 'legumbres', 'invierno', 'económica'], prep_time: 10, cook_time: 35, servings: 4, image_url: null, ai_generated: false, created_at: fmtTs(subDays(hoy, 2)) },
    { id: 'demo-r-10', app_id: 'demo-hogar', title: 'Pasta carbonara',           ingredients: [{ name: 'Espaguetis', quantity: 200, unit: 'g' }, { name: 'Panceta', quantity: 100, unit: 'g' }, { name: 'Huevos', quantity: 2, unit: 'unidades' }, { name: 'Parmesano rallado', quantity: 60, unit: 'g' }, { name: 'Pimienta negra', quantity: 1, unit: 'al gusto' }], instructions: 'Cuece la pasta. Fríe la panceta hasta que esté crujiente. Bate los huevos con el parmesano y pimienta. Mezcla la pasta caliente con la panceta, apaga el fuego y añade la mezcla de huevo removiendo rápido.', tags: ['italiana', 'rápida', 'clásica'], prep_time: 5, cook_time: 15, servings: 2, image_url: null, ai_generated: false, created_at: fmtTs(subDays(hoy, 3)) },
    { id: 'demo-r-11', app_id: 'demo-hogar', title: 'Paella valenciana',         ingredients: [{ name: 'Arroz', quantity: 400, unit: 'g' }, { name: 'Pollo', quantity: 500, unit: 'g' }, { name: 'Judías verdes', quantity: 200, unit: 'g' }, { name: 'Garrofón', quantity: 100, unit: 'g' }, { name: 'Tomate', quantity: 2, unit: 'unidades' }, { name: 'Azafrán', quantity: 1, unit: 'pizca' }, { name: 'Pimentón dulce', quantity: 1, unit: 'cucharadita' }], instructions: 'Sofríe el pollo hasta dorar. Añade las verduras, el tomate rallado y el pimentón. Vierte el agua y el azafrán. Cuando hierva añade el arroz. Cocina 18 min sin remover. Reposa 5 min.', tags: ['española', 'arroz', 'festiva', 'fin de semana'], prep_time: 15, cook_time: 40, servings: 6, image_url: null, ai_generated: false, created_at: fmtTs(subDays(hoy, 5)) },
    { id: 'demo-r-12', app_id: 'demo-hogar', title: 'Croquetas de jamón',        ingredients: [{ name: 'Jamón serrano', quantity: 150, unit: 'g' }, { name: 'Mantequilla', quantity: 60, unit: 'g' }, { name: 'Harina', quantity: 80, unit: 'g' }, { name: 'Leche', quantity: 500, unit: 'ml' }, { name: 'Pan rallado', quantity: 200, unit: 'g' }, { name: 'Huevos', quantity: 2, unit: 'unidades' }], instructions: 'Derrite la mantequilla, añade la harina y tuéstala. Incorpora la leche poco a poco removiendo para evitar grumos. Añade el jamón picado. Deja enfriar la masa. Forma las croquetas, pásalas por huevo y pan rallado. Fríe en aceite caliente.', tags: ['española', 'clásica', 'aperitivo'], prep_time: 20, cook_time: 30, servings: 4, image_url: null, ai_generated: false, created_at: fmtTs(subDays(hoy, 4)) },
    { id: 'demo-r-13', app_id: 'demo-hogar', title: 'Pizza margarita casera',    ingredients: [{ name: 'Masa de pizza', quantity: 1, unit: 'base' }, { name: 'Tomate frito', quantity: 150, unit: 'g' }, { name: 'Mozzarella', quantity: 200, unit: 'g' }, { name: 'Albahaca fresca', quantity: 1, unit: 'puñado' }, { name: 'Aceite de oliva', quantity: 2, unit: 'cucharadas' }], instructions: 'Precalienta el horno a 250°C. Extiende la masa, añade el tomate, la mozzarella troceada y un chorrito de aceite. Hornea 12-15 min. Finaliza con albahaca fresca.', tags: ['italiana', 'pizza', 'fácil'], prep_time: 15, cook_time: 15, servings: 2, image_url: null, ai_generated: false, created_at: fmtTs(subDays(hoy, 6)) },
    { id: 'demo-r-14', app_id: 'demo-hogar', title: 'Pollo al curry',            ingredients: [{ name: 'Pechuga de pollo', quantity: 400, unit: 'g' }, { name: 'Leche de coco', quantity: 400, unit: 'ml' }, { name: 'Curry en polvo', quantity: 2, unit: 'cucharadas' }, { name: 'Cebolla', quantity: 1, unit: 'unidad' }, { name: 'Ajo', quantity: 2, unit: 'dientes' }, { name: 'Arroz basmati', quantity: 200, unit: 'g' }], instructions: 'Sofríe la cebolla y el ajo. Añade el pollo en dados y sella. Incorpora el curry y la leche de coco. Cocina 20 min a fuego medio. Sirve sobre arroz basmati cocido.', tags: ['asiático', 'curry', 'exótico'], prep_time: 10, cook_time: 25, servings: 3, image_url: null, ai_generated: false, created_at: fmtTs(subDays(hoy, 3)) },
    { id: 'demo-r-15', app_id: 'demo-hogar', title: 'Tortitas americanas',       ingredients: [{ name: 'Harina', quantity: 200, unit: 'g' }, { name: 'Leche', quantity: 250, unit: 'ml' }, { name: 'Huevos', quantity: 2, unit: 'unidades' }, { name: 'Levadura', quantity: 1, unit: 'sobre' }, { name: 'Azúcar', quantity: 2, unit: 'cucharadas' }, { name: 'Mantequilla', quantity: 30, unit: 'g' }], instructions: 'Mezcla los ingredientes secos. Aparte bate los huevos con la leche y la mantequilla derretida. Une todo y deja reposar 5 min. Cuece porciones en sartén antiadherente hasta que salgan burbujas, da la vuelta.', tags: ['desayuno', 'dulce', 'finde'], prep_time: 10, cook_time: 20, servings: 2, image_url: null, ai_generated: false, created_at: fmtTs(subDays(hoy, 7)) },
  ],

  inventory: [
    { id: 'demo-inv-1',  app_id: 'demo-hogar', product_id: 'demo-prod-1',  current_stock: 0.4, min_stock: 0.5, unit: 'L',        product: { name: 'Aceite de oliva virgen extra' } },
    { id: 'demo-inv-2',  app_id: 'demo-hogar', product_id: 'demo-prod-2',  current_stock: 5,   min_stock: 6,   unit: 'unidades', product: { name: 'Huevos' } },
    { id: 'demo-inv-3',  app_id: 'demo-hogar', product_id: 'demo-prod-3',  current_stock: 1,   min_stock: 1,   unit: 'L',        product: { name: 'Leche entera' } },
    { id: 'demo-inv-4',  app_id: 'demo-hogar', product_id: 'demo-prod-4',  current_stock: 2,   min_stock: 2,   unit: 'latas',    product: { name: 'Atún en lata' } },
    { id: 'demo-inv-5',  app_id: 'demo-hogar', product_id: 'demo-prod-5',  current_stock: 350, min_stock: 400, unit: 'g',        product: { name: 'Arroz' } },
    { id: 'demo-inv-6',  app_id: 'demo-hogar', product_id: 'demo-prod-6',  current_stock: 600, min_stock: 200, unit: 'g',        product: { name: 'Harina de trigo' } },
    { id: 'demo-inv-7',  app_id: 'demo-hogar', product_id: 'demo-prod-7',  current_stock: 3,   min_stock: 2,   unit: 'botes',    product: { name: 'Tomate triturado' } },
    { id: 'demo-inv-8',  app_id: 'demo-hogar', product_id: 'demo-prod-8',  current_stock: 1,   min_stock: 1,   unit: 'rollo',    product: { name: 'Papel de cocina' } },
    { id: 'demo-inv-9',  app_id: 'demo-hogar', product_id: 'demo-prod-9',  current_stock: 2,   min_stock: 3,   unit: 'pack 6L',  product: { name: 'Agua mineral' } },
    { id: 'demo-inv-10', app_id: 'demo-hogar', product_id: 'demo-prod-10', current_stock: 1,   min_stock: 1,   unit: 'bote',     product: { name: 'Sal fina' } },
    { id: 'demo-inv-11', app_id: 'demo-hogar', product_id: 'demo-prod-11', current_stock: 250, min_stock: 200, unit: 'g',        product: { name: 'Pasta (espaguetis)' } },
    { id: 'demo-inv-12', app_id: 'demo-hogar', product_id: 'demo-prod-12', current_stock: 200, min_stock: 300, unit: 'g',        product: { name: 'Lentejas secas' } },
    { id: 'demo-inv-13', app_id: 'demo-hogar', product_id: 'demo-prod-13', current_stock: 0,   min_stock: 1,   unit: 'lata',     product: { name: 'Leche de coco' } },
    { id: 'demo-inv-14', app_id: 'demo-hogar', product_id: 'demo-prod-14', current_stock: 4,   min_stock: 2,   unit: 'unidades', product: { name: 'Yogur natural' } },
    { id: 'demo-inv-15', app_id: 'demo-hogar', product_id: 'demo-prod-15', current_stock: 1,   min_stock: 1,   unit: 'kg',       product: { name: 'Patatas' } },
  ],

  factory_tasks: [
    { id: 'ft-1',  key: 'barrer',           label: 'Barrer',                    icon: '🧹', default_interval: 3,  active: true,  next_date: fmt(addDays(hoy, 1)) },
    { id: 'ft-2',  key: 'fregar',           label: 'Fregar suelo',              icon: '🪣', default_interval: 7,  active: true,  next_date: fmt(addDays(hoy, 3)) },
    { id: 'ft-3',  key: 'aspirar',          label: 'Aspirar',                   icon: '🌀', default_interval: 4,  active: false, next_date: null },
    { id: 'ft-4',  key: 'roomba',           label: 'Pasar Roomba',              icon: '🤖', default_interval: 2,  active: true,  next_date: fmt(addDays(hoy, 0)) },
    { id: 'ft-5',  key: 'limpiar_bano',     label: 'Limpiar baño',              icon: '🚿', default_interval: 7,  active: true,  next_date: fmt(subDays(hoy, 1)) },
    { id: 'ft-6',  key: 'limpiar_cocina',   label: 'Limpiar cocina',            icon: '🍳', default_interval: 7,  active: true,  next_date: fmt(addDays(hoy, 2)) },
    { id: 'ft-7',  key: 'limpiar_horno',    label: 'Limpiar horno',             icon: '♨️', default_interval: 30, active: false, next_date: null },
    { id: 'ft-8',  key: 'limpiar_micro',    label: 'Limpiar microondas',        icon: '📡', default_interval: 14, active: false, next_date: null },
    { id: 'ft-9',  key: 'cristales',        label: 'Limpiar cristales',         icon: '🪟', default_interval: 30, active: false, next_date: null },
    { id: 'ft-10', key: 'sabanas',          label: 'Cambiar sábanas',           icon: '🛏️', default_interval: 7,  active: true,  next_date: fmt(addDays(hoy, 4)) },
    { id: 'ft-11', key: 'ropa',             label: 'Lavar ropa',                icon: '👕', default_interval: 3,  active: true,  next_date: fmt(addDays(hoy, 1)) },
    { id: 'ft-12', key: 'nevera',           label: 'Limpiar nevera',            icon: '🧊', default_interval: 30, active: false, next_date: null },
    { id: 'ft-13', key: 'filtro_lavadora',  label: 'Limpiar filtro lavadora',   icon: '🌀', default_interval: 90, active: false, next_date: null },
    { id: 'ft-14', key: 'filtro_roomba',    label: 'Limpiar filtro Roomba',     icon: '🤖', default_interval: 30, active: true,  next_date: fmt(subDays(hoy, 2)) },
  ],

  productos_limpieza: [
    { id: 'pl-1', nombre: 'Lejía',          icon: '🫧', cantidad: 1.5, unidad: 'L',    minimo: 1,   categoria: 'desinfectante' },
    { id: 'pl-2', nombre: 'Friegasuelos',   icon: '🪣', cantidad: 2,   unidad: 'L',    minimo: 1,   categoria: 'suelos' },
    { id: 'pl-3', nombre: 'Limpiacristales',icon: '🪟', cantidad: 0.5, unidad: 'L',    minimo: 0.5, categoria: 'cristales' },
    { id: 'pl-4', nombre: 'Multiusos spray',icon: '🧴', cantidad: 1,   unidad: 'bote', minimo: 1,   categoria: 'multiusos' },
    { id: 'pl-5', nombre: 'Bayetas',        icon: '🧽', cantidad: 6,   unidad: 'ud',   minimo: 4,   categoria: 'utensilios' },
    { id: 'pl-6', nombre: 'Guantes',        icon: '🧤', cantidad: 2,   unidad: 'par',  minimo: 1,   categoria: 'utensilios' },
    { id: 'pl-7', nombre: 'WC gel',         icon: '🚽', cantidad: 1,   unidad: 'bote', minimo: 1,   categoria: 'baño' },
    { id: 'pl-8', nombre: 'Quitagrasas',    icon: '🧴', cantidad: 0,   unidad: 'bote', minimo: 1,   categoria: 'cocina' },
  ],

  roomba: {
    modelo: 'iRobot Roomba i7+',
    ultimo_pase: fmt(subDays(hoy, 1)),
    proximo_pase: fmt(addDays(hoy, 1)),
    duracion_ultimo: 52,
    estado: 'cargando',
    consumibles: [
      { id: 'rc-1', nombre: 'Filtro HEPA',        icono: '🌀', cada_dias: 60,  ultimo_cambio: fmt(subDays(hoy, 45)) },
      { id: 'rc-2', nombre: 'Cepillo lateral',    icono: '🔄', cada_dias: 30,  ultimo_cambio: fmt(subDays(hoy, 28)) },
      { id: 'rc-3', nombre: 'Cepillo principal',  icono: '🪥', cada_dias: 90,  ultimo_cambio: fmt(subDays(hoy, 20)) },
      { id: 'rc-4', nombre: 'Bolsa de residuos',  icono: '🗑️', cada_dias: 10,  ultimo_cambio: fmt(subDays(hoy, 8))  },
    ],
  },

  personal_limpieza: [
    {
      id: 'pers-1',
      nombre: 'Carmen',
      telefono: '612 345 678',
      dias: ['lunes', 'jueves'],
      hora: '10:00',
      tarifa: 12,
      unidad_tarifa: '€/hora',
      horas_por_sesion: 3,
      notas: 'Lleva sus propios productos. Tiene llave.',
      tareas: ['limpiar_bano', 'fregar', 'aspirar', 'limpiar_cocina'],
      activo: true,
    },
  ],

  nevera: [
    { id: 'nev-1', nombre: 'Leche entera',      icono: '🥛', cantidad: 2,   unidad: 'L',    caducidad: fmt(addDays(hoy, 3)),  categoria: 'lácteos'   },
    { id: 'nev-2', nombre: 'Yogures',            icono: '🥄', cantidad: 8,   unidad: 'ud',   caducidad: fmt(addDays(hoy, 7)),  categoria: 'lácteos'   },
    { id: 'nev-3', nombre: 'Huevos',             icono: '🥚', cantidad: 6,   unidad: 'ud',   caducidad: fmt(addDays(hoy, 14)), categoria: 'proteínas' },
    { id: 'nev-4', nombre: 'Pollo filetes',      icono: '🍗', cantidad: 500, unidad: 'g',    caducidad: fmt(addDays(hoy, 1)),  categoria: 'carnes'    },
    { id: 'nev-5', nombre: 'Queso manchego',     icono: '🧀', cantidad: 200, unidad: 'g',    caducidad: fmt(addDays(hoy, 20)), categoria: 'lácteos'   },
    { id: 'nev-6', nombre: 'Ensalada bolsa',     icono: '🥗', cantidad: 1,   unidad: 'bolsa',caducidad: fmt(subDays(hoy, 1)),  categoria: 'verduras'  },
    { id: 'nev-7', nombre: 'Mermelada fresa',    icono: '🍓', cantidad: 1,   unidad: 'tarro',caducidad: fmt(addDays(hoy, 90)), categoria: 'otros'     },
    { id: 'nev-8', nombre: 'Mantequilla',        icono: '🧈', cantidad: 1,   unidad: 'paquete', caducidad: fmt(addDays(hoy, 30)), categoria: 'lácteos' },
  ],

  congelador: [
    { id: 'con-1', nombre: 'Pollo entero',    icono: '🍗', cantidad: 1,   unidad: 'ud', fecha_congelado: fmt(subDays(hoy, 30)), tiempo_max: 180, categoria: 'carnes'    },
    { id: 'con-2', nombre: 'Carne picada',    icono: '🥩', cantidad: 500, unidad: 'g',  fecha_congelado: fmt(subDays(hoy, 14)), tiempo_max: 90,  categoria: 'carnes'    },
    { id: 'con-3', nombre: 'Gambas',          icono: '🦐', cantidad: 500, unidad: 'g',  fecha_congelado: fmt(subDays(hoy, 7)),  tiempo_max: 90,  categoria: 'pescados'  },
    { id: 'con-4', nombre: 'Judías verdes',   icono: '🫘', cantidad: 400, unidad: 'g',  fecha_congelado: fmt(subDays(hoy, 60)), tiempo_max: 365, categoria: 'verduras'  },
    { id: 'con-5', nombre: 'Helado vainilla', icono: '🍦', cantidad: 500, unidad: 'g',  fecha_congelado: fmt(subDays(hoy, 3)),  tiempo_max: 365, categoria: 'postres'   },
    { id: 'con-6', nombre: 'Pan de molde',    icono: '🍞', cantidad: 1,   unidad: 'bolsa', fecha_congelado: fmt(subDays(hoy, 5)), tiempo_max: 90, categoria: 'panadería' },
  ],

  despensa_items: [
    { id: 'des-1',  nombre: 'Arroz',            icono: '🍚', cantidad: 2,    unidad: 'kg',   minimo: 0.5, categoria: 'cereales'    },
    { id: 'des-2',  nombre: 'Pasta macarrones', icono: '🍝', cantidad: 0.5,  unidad: 'kg',   minimo: 0.5, categoria: 'cereales'    },
    { id: 'des-3',  nombre: 'Lentejas',         icono: '🫘', cantidad: 1,    unidad: 'kg',   minimo: 0.5, categoria: 'legumbres'   },
    { id: 'des-4',  nombre: 'Tomate frito',     icono: '🥫', cantidad: 3,    unidad: 'bote', minimo: 2,   categoria: 'conservas'   },
    { id: 'des-5',  nombre: 'Atún en lata',     icono: '🐟', cantidad: 2,    unidad: 'lata', minimo: 3,   categoria: 'conservas'   },
    { id: 'des-6',  nombre: 'Aceite de oliva',  icono: '🫙', cantidad: 1,    unidad: 'L',    minimo: 0.5, categoria: 'aceites'     },
    { id: 'des-7',  nombre: 'Azúcar',           icono: '🍬', cantidad: 0,    unidad: 'kg',   minimo: 0.5, categoria: 'otros'       },
    { id: 'des-8',  nombre: 'Harina',           icono: '🌾', cantidad: 1,    unidad: 'kg',   minimo: 0.5, categoria: 'cereales'    },
    { id: 'des-9',  nombre: 'Café molido',      icono: '☕', cantidad: 0.25, unidad: 'kg',   minimo: 0.25,categoria: 'bebidas'     },
    { id: 'des-10', nombre: 'Sal',              icono: '🧂', cantidad: 1,    unidad: 'kg',   minimo: 0.5, categoria: 'condimentos' },
  ],

  bano: {
    consumibles: [
      { id: 'ban-1', nombre: 'Papel higiénico', icono: '🧻', cantidad: 6,   unidad: 'rollos', minimo: 4 },
      { id: 'ban-2', nombre: 'Jabón de manos',  icono: '🫧', cantidad: 2,   unidad: 'bote',   minimo: 1 },
      { id: 'ban-3', nombre: 'Pasta de dientes',icono: '🪥', cantidad: 1,   unidad: 'tubo',   minimo: 1 },
      { id: 'ban-4', nombre: 'Champú',          icono: '🧴', cantidad: 0.5, unidad: 'bote',   minimo: 1 },
      { id: 'ban-5', nombre: 'Gel de ducha',    icono: '🚿', cantidad: 1,   unidad: 'bote',   minimo: 1 },
      { id: 'ban-6', nombre: 'Desodorante',     icono: '💨', cantidad: 2,   unidad: 'ud',     minimo: 1 },
    ],
    durables: [
      { id: 'ban-d1', nombre: 'Cepillo dientes (adulto 1)', icono: '🪥', ultimo_cambio: fmt(subDays(hoy, 70)), intervalo_dias: 90 },
      { id: 'ban-d2', nombre: 'Cepillo dientes (adulto 2)', icono: '🪥', ultimo_cambio: fmt(subDays(hoy, 30)), intervalo_dias: 90 },
      { id: 'ban-d3', nombre: 'Toallas baño',               icono: '🛁', ultimo_cambio: fmt(subDays(hoy, 15)), intervalo_dias: 7  },
      { id: 'ban-d4', nombre: 'Esponja ducha',              icono: '🧽', ultimo_cambio: fmt(subDays(hoy, 25)), intervalo_dias: 30 },
    ],
  },
}
