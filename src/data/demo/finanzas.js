// src/data/demo/finanzas.js
import { subDays, addDays, startOfMonth, startOfWeek, format } from 'date-fns'

const hoy    = new Date()
const fmt    = d => format(d, 'yyyy-MM-dd')
const mes    = format(hoy, 'yyyy-MM')
const semana = startOfWeek(hoy, { weekStartsOn: 1 })
const day    = n => fmt(new Date(semana.getFullYear(), semana.getMonth(), semana.getDate() + n))

export const mockFinanzas = {
  fin_categories: [
    { id: 'demo-cat-1',  app_id: 'demo-finanzas', type: 'expense', name: 'Alimentación', icon: '🛒', color: '#f97316', created_at: fmt(subDays(hoy, 60)) },
    { id: 'demo-cat-2',  app_id: 'demo-finanzas', type: 'expense', name: 'Transporte',   icon: '🚌', color: '#3b82f6', created_at: fmt(subDays(hoy, 60)) },
    { id: 'demo-cat-3',  app_id: 'demo-finanzas', type: 'expense', name: 'Vivienda',     icon: '🏠', color: '#10b981', created_at: fmt(subDays(hoy, 60)) },
    { id: 'demo-cat-4',  app_id: 'demo-finanzas', type: 'expense', name: 'Ocio',         icon: '🎭', color: '#8b5cf6', created_at: fmt(subDays(hoy, 60)) },
    { id: 'demo-cat-5',  app_id: 'demo-finanzas', type: 'expense', name: 'Salud',        icon: '❤️', color: '#ef4444', created_at: fmt(subDays(hoy, 60)) },
    { id: 'demo-cat-6',  app_id: 'demo-finanzas', type: 'expense', name: 'Ropa',         icon: '👗', color: '#ec4899', created_at: fmt(subDays(hoy, 60)) },
    { id: 'demo-cat-7',  app_id: 'demo-finanzas', type: 'expense', name: 'Otros',        icon: '📦', color: '#6b7280', created_at: fmt(subDays(hoy, 60)) },
    { id: 'demo-cat-8',  app_id: 'demo-finanzas', type: 'income',  name: 'Sueldo',       icon: '💼', color: '#10b981', created_at: fmt(subDays(hoy, 60)) },
    { id: 'demo-cat-9',  app_id: 'demo-finanzas', type: 'income',  name: 'Freelance',    icon: '💻', color: '#3b82f6', created_at: fmt(subDays(hoy, 60)) },
    { id: 'demo-cat-10', app_id: 'demo-finanzas', type: 'income',  name: 'Otros',        icon: '➕', color: '#6b7280', created_at: fmt(subDays(hoy, 60)) },
  ],

  fin_transactions: [
    // ─── Ingresos ─────────────────────────────────────────────────────
    { id: 'demo-tx-1',  app_id: 'demo-finanzas', type: 'income',  amount: 2400,  category_id: 'demo-cat-8', description: 'Nómina',       date: fmt(startOfMonth(hoy)), fin_categories: { name: 'Sueldo',       icon: '💼', color: '#10b981', type: 'income'  } },
    { id: 'demo-tx-2',  app_id: 'demo-finanzas', type: 'income',  amount: 350,   category_id: 'demo-cat-9', description: 'Proyecto web', date: day(3),                 fin_categories: { name: 'Freelance',    icon: '💻', color: '#3b82f6', type: 'income'  } },

    // ─── Gastos fijos del mes ──────────────────────────────────────────
    { id: 'demo-tx-3',  app_id: 'demo-finanzas', type: 'expense', amount: 850,   category_id: 'demo-cat-3', description: 'Alquiler',     date: fmt(startOfMonth(hoy)), fin_categories: { name: 'Vivienda',     icon: '🏠', color: '#10b981', type: 'expense' } },
    { id: 'demo-tx-8',  app_id: 'demo-finanzas', type: 'expense', amount: 35,    category_id: 'demo-cat-4', description: 'Gym mensual',  date: fmt(startOfMonth(hoy)), fin_categories: { name: 'Ocio',         icon: '🎭', color: '#8b5cf6', type: 'expense' } },
    { id: 'demo-tx-26', app_id: 'demo-finanzas', type: 'expense', amount: 9.99,  category_id: 'demo-cat-4', description: 'Spotify',      date: day(0),                 fin_categories: { name: 'Ocio',         icon: '🎭', color: '#8b5cf6', type: 'expense' } },
    { id: 'demo-tx-27', app_id: 'demo-finanzas', type: 'expense', amount: 18,    category_id: 'demo-cat-4', description: 'Netflix',      date: day(1),                 fin_categories: { name: 'Ocio',         icon: '🎭', color: '#8b5cf6', type: 'expense' } },

    // ─── Lunes ────────────────────────────────────────────────────────
    { id: 'demo-tx-l1', app_id: 'demo-finanzas', type: 'expense', amount: 2.5,   category_id: 'demo-cat-1', description: 'Café mañana',        date: day(0), fin_categories: { name: 'Alimentación', icon: '🛒', color: '#f97316', type: 'expense' } },
    { id: 'demo-tx-l2', app_id: 'demo-finanzas', type: 'expense', amount: 11.8,  category_id: 'demo-cat-1', description: 'Menú del día',        date: day(0), fin_categories: { name: 'Alimentación', icon: '🛒', color: '#f97316', type: 'expense' } },
    { id: 'demo-tx-l3', app_id: 'demo-finanzas', type: 'expense', amount: 2.2,   category_id: 'demo-cat-2', description: 'Metro',               date: day(0), fin_categories: { name: 'Transporte',   icon: '🚌', color: '#3b82f6', type: 'expense' } },

    // ─── Martes ───────────────────────────────────────────────────────
    { id: 'demo-tx-m1', app_id: 'demo-finanzas', type: 'expense', amount: 2.5,   category_id: 'demo-cat-1', description: 'Café mañana',        date: day(1), fin_categories: { name: 'Alimentación', icon: '🛒', color: '#f97316', type: 'expense' } },
    { id: 'demo-tx-m2', app_id: 'demo-finanzas', type: 'expense', amount: 13.5,  category_id: 'demo-cat-1', description: 'Almuerzo',            date: day(1), fin_categories: { name: 'Alimentación', icon: '🛒', color: '#f97316', type: 'expense' } },
    { id: 'demo-tx-m3', app_id: 'demo-finanzas', type: 'expense', amount: 4.4,   category_id: 'demo-cat-2', description: 'Metro ida/vuelta',    date: day(1), fin_categories: { name: 'Transporte',   icon: '🚌', color: '#3b82f6', type: 'expense' } },

    // ─── Miércoles ────────────────────────────────────────────────────
    { id: 'demo-tx-x1', app_id: 'demo-finanzas', type: 'expense', amount: 3.1,   category_id: 'demo-cat-1', description: 'Café y cruasán',      date: day(2), fin_categories: { name: 'Alimentación', icon: '🛒', color: '#f97316', type: 'expense' } },
    { id: 'demo-tx-x2', app_id: 'demo-finanzas', type: 'expense', amount: 10.9,  category_id: 'demo-cat-1', description: 'Bocadillo',           date: day(2), fin_categories: { name: 'Alimentación', icon: '🛒', color: '#f97316', type: 'expense' } },
    { id: 'demo-tx-x3', app_id: 'demo-finanzas', type: 'expense', amount: 18,    category_id: 'demo-cat-4', description: 'Cine',                date: day(2), fin_categories: { name: 'Ocio',         icon: '🎭', color: '#8b5cf6', type: 'expense' } },
    { id: 'demo-tx-x4', app_id: 'demo-finanzas', type: 'expense', amount: 94,    category_id: 'demo-cat-3', description: 'Electricidad',        date: day(2), fin_categories: { name: 'Vivienda',     icon: '🏠', color: '#10b981', type: 'expense' } },

    // ─── Jueves ───────────────────────────────────────────────────────
    { id: 'demo-tx-j1', app_id: 'demo-finanzas', type: 'expense', amount: 2.5,   category_id: 'demo-cat-1', description: 'Café mañana',        date: day(3), fin_categories: { name: 'Alimentación', icon: '🛒', color: '#f97316', type: 'expense' } },
    { id: 'demo-tx-j2', app_id: 'demo-finanzas', type: 'expense', amount: 85.4,  category_id: 'demo-cat-1', description: 'Mercadona',          date: day(3), fin_categories: { name: 'Alimentación', icon: '🛒', color: '#f97316', type: 'expense' } },
    { id: 'demo-tx-j3', app_id: 'demo-finanzas', type: 'expense', amount: 71.6,  category_id: 'demo-cat-2', description: 'Gasolina',           date: day(3), fin_categories: { name: 'Transporte',   icon: '🚌', color: '#3b82f6', type: 'expense' } },

    // ─── Viernes ──────────────────────────────────────────────────────
    { id: 'demo-tx-v1', app_id: 'demo-finanzas', type: 'expense', amount: 3.8,   category_id: 'demo-cat-1', description: 'Café y napolitana',   date: day(4), fin_categories: { name: 'Alimentación', icon: '🛒', color: '#f97316', type: 'expense' } },
    { id: 'demo-tx-v2', app_id: 'demo-finanzas', type: 'expense', amount: 23.5,  category_id: 'demo-cat-4', description: 'Cena con amigos',     date: day(4), fin_categories: { name: 'Ocio',         icon: '🎭', color: '#8b5cf6', type: 'expense' } },
    { id: 'demo-tx-v3', app_id: 'demo-finanzas', type: 'expense', amount: 15,    category_id: 'demo-cat-2', description: 'Taxi noche',          date: day(4), fin_categories: { name: 'Transporte',   icon: '🚌', color: '#3b82f6', type: 'expense' } },

    // ─── Sábado ───────────────────────────────────────────────────────
    { id: 'demo-tx-s1', app_id: 'demo-finanzas', type: 'expense', amount: 32.8,  category_id: 'demo-cat-1', description: 'Carrefour',          date: day(5), fin_categories: { name: 'Alimentación', icon: '🛒', color: '#f97316', type: 'expense' } },
    { id: 'demo-tx-s2', app_id: 'demo-finanzas', type: 'expense', amount: 45,    category_id: 'demo-cat-6', description: 'Ropa online',        date: day(5), fin_categories: { name: 'Ropa',         icon: '👗', color: '#ec4899', type: 'expense' } },
    { id: 'demo-tx-s3', app_id: 'demo-finanzas', type: 'expense', amount: 38,    category_id: 'demo-cat-4', description: 'Concierto',          date: day(5), fin_categories: { name: 'Ocio',         icon: '🎭', color: '#8b5cf6', type: 'expense' } },

    // ─── Domingo ──────────────────────────────────────────────────────
    { id: 'demo-tx-d1', app_id: 'demo-finanzas', type: 'expense', amount: 28.5,  category_id: 'demo-cat-5', description: 'Farmacia',           date: day(6), fin_categories: { name: 'Salud',         icon: '❤️', color: '#ef4444', type: 'expense' } },
    { id: 'demo-tx-d2', app_id: 'demo-finanzas', type: 'expense', amount: 12,    category_id: 'demo-cat-1', description: 'Brunch',             date: day(6), fin_categories: { name: 'Alimentación', icon: '🛒', color: '#f97316', type: 'expense' } },
  ],

  fin_budgets: [
    { id: 'demo-b-1', app_id: 'demo-finanzas', category_id: 'demo-cat-1', month: mes, monthly_limit: 400,  fin_categories: { name: 'Alimentación', icon: '🛒', color: '#f97316' } },
    { id: 'demo-b-2', app_id: 'demo-finanzas', category_id: 'demo-cat-2', month: mes, monthly_limit: 200,  fin_categories: { name: 'Transporte',   icon: '🚌', color: '#3b82f6' } },
    { id: 'demo-b-3', app_id: 'demo-finanzas', category_id: 'demo-cat-3', month: mes, monthly_limit: 1000, fin_categories: { name: 'Vivienda',     icon: '🏠', color: '#10b981' } },
    { id: 'demo-b-4', app_id: 'demo-finanzas', category_id: 'demo-cat-4', month: mes, monthly_limit: 150,  fin_categories: { name: 'Ocio',         icon: '🎭', color: '#8b5cf6' } },
  ],

  suscripciones: [
    { id: 'sub-1', nombre: 'Netflix',         icono: '🎬', coste: 15.99, periodicidad: 'mensual', fecha_renovacion: fmt(addDays(hoy, 12)),  estado: 'activa',  compartida: true  },
    { id: 'sub-2', nombre: 'Spotify',         icono: '🎵', coste: 9.99,  periodicidad: 'mensual', fecha_renovacion: fmt(addDays(hoy, 8)),   estado: 'activa',  compartida: false },
    { id: 'sub-3', nombre: 'Disney+',         icono: '🏰', coste: 11.99, periodicidad: 'mensual', fecha_renovacion: fmt(addDays(hoy, 25)),  estado: 'activa',  compartida: true  },
    { id: 'sub-4', nombre: 'iCloud 200GB',    icono: '☁️', coste: 2.99,  periodicidad: 'mensual', fecha_renovacion: fmt(addDays(hoy, 5)),   estado: 'activa',  compartida: false },
    { id: 'sub-5', nombre: 'YouTube Premium', icono: '▶️', coste: 13.99, periodicidad: 'mensual', fecha_renovacion: fmt(addDays(hoy, 18)),  estado: 'pausada', compartida: false },
    { id: 'sub-6', nombre: 'Amazon Prime',    icono: '📦', coste: 49.90, periodicidad: 'anual',   fecha_renovacion: fmt(addDays(hoy, 180)), estado: 'activa',  compartida: true  },
  ],

  seguros: [
    { id: 'seg-1', tipo: 'hogar',  nombre: 'Seguro Hogar Mapfre',     compania: 'Mapfre',         poliza: 'MF-2024-001234', vencimiento: fmt(addDays(hoy, 45)),  coste_anual: 380 },
    { id: 'seg-2', tipo: 'vida',   nombre: 'Seguro de Vida Generali', compania: 'Generali',        poliza: 'GN-2023-567890', vencimiento: fmt(addDays(hoy, 210)), coste_anual: 520 },
    { id: 'seg-3', tipo: 'dental', nombre: 'Dental Sanitas',          compania: 'Sanitas',         poliza: 'SN-2024-112233', vencimiento: fmt(addDays(hoy, 90)),  coste_anual: 240 },
    { id: 'seg-4', tipo: 'coche',  nombre: 'Seguro Coche Mutua',      compania: 'Mutua Madrileña', poliza: 'MM-2024-445566', vencimiento: fmt(addDays(hoy, 15)),  coste_anual: 650 },
  ],

  gastos_fijos: [
    { id: 'gf-1', nombre: 'Alquiler',         icono: '🏠', categoria: 'vivienda',     importe: 850, dia_cobro: 1  },
    { id: 'gf-2', nombre: 'Luz (Iberdrola)',   icono: '💡', categoria: 'suministros',  importe: 94,  dia_cobro: 15 },
    { id: 'gf-3', nombre: 'Gas Natural',       icono: '🔥', categoria: 'suministros',  importe: 45,  dia_cobro: 20 },
    { id: 'gf-4', nombre: 'Agua',              icono: '💧', categoria: 'suministros',  importe: 28,  dia_cobro: 10 },
    { id: 'gf-5', nombre: 'Internet + Móvil',  icono: '📡', categoria: 'conectividad', importe: 55,  dia_cobro: 5  },
    { id: 'gf-6', nombre: 'Comunidad',         icono: '🏢', categoria: 'vivienda',     importe: 80,  dia_cobro: 1  },
  ],

  hipoteca: {
    banco: 'BBVA', gestor: 'Ana García',
    cuota_mensual: 750, dia_cobro: 1,
    capital_inicial: 180000, capital_pendiente: 142500,
    fecha_inicio: '2019-03-01', fecha_fin: '2049-03-01',
    tipo_interes: 'variable', diferencial: 0.75,
  },
}
