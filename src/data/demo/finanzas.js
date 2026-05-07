// src/data/demo/finanzas.js
import { subDays, startOfMonth, format } from 'date-fns'

const hoy = new Date()
const fmt = d => format(d, 'yyyy-MM-dd')
const mes = format(hoy, 'yyyy-MM')

export const mockFinanzas = {
  fin_categories: [
    { id: 'demo-cat-1', app_id: 'demo-finanzas', type: 'expense', name: 'Alimentación', icon: '🛒', color: '#f97316', created_at: fmt(subDays(hoy, 60)) },
    { id: 'demo-cat-2', app_id: 'demo-finanzas', type: 'expense', name: 'Transporte',   icon: '🚌', color: '#3b82f6', created_at: fmt(subDays(hoy, 60)) },
    { id: 'demo-cat-3', app_id: 'demo-finanzas', type: 'expense', name: 'Vivienda',     icon: '🏠', color: '#10b981', created_at: fmt(subDays(hoy, 60)) },
    { id: 'demo-cat-4', app_id: 'demo-finanzas', type: 'expense', name: 'Ocio',         icon: '🎭', color: '#8b5cf6', created_at: fmt(subDays(hoy, 60)) },
    { id: 'demo-cat-5', app_id: 'demo-finanzas', type: 'expense', name: 'Salud',        icon: '❤️', color: '#ef4444', created_at: fmt(subDays(hoy, 60)) },
    { id: 'demo-cat-6', app_id: 'demo-finanzas', type: 'expense', name: 'Ropa',         icon: '👗', color: '#ec4899', created_at: fmt(subDays(hoy, 60)) },
    { id: 'demo-cat-7', app_id: 'demo-finanzas', type: 'expense', name: 'Otros',        icon: '📦', color: '#6b7280', created_at: fmt(subDays(hoy, 60)) },
    { id: 'demo-cat-8', app_id: 'demo-finanzas', type: 'income',  name: 'Sueldo',       icon: '💼', color: '#10b981', created_at: fmt(subDays(hoy, 60)) },
    { id: 'demo-cat-9', app_id: 'demo-finanzas', type: 'income',  name: 'Freelance',    icon: '💻', color: '#3b82f6', created_at: fmt(subDays(hoy, 60)) },
    { id: 'demo-cat-10',app_id: 'demo-finanzas', type: 'income',  name: 'Otros',        icon: '➕', color: '#6b7280', created_at: fmt(subDays(hoy, 60)) },
  ],

  fin_transactions: [
    { id: 'demo-tx-1', app_id: 'demo-finanzas', type: 'income', amount: 2400, category_id: 'demo-cat-8', description: 'Nómina', date: fmt(startOfMonth(hoy)),
      fin_categories: { name: 'Sueldo', icon: '💼', color: '#10b981', type: 'income' } },
    { id: 'demo-tx-2', app_id: 'demo-finanzas', type: 'income', amount: 350, category_id: 'demo-cat-9', description: 'Proyecto web', date: fmt(subDays(hoy, 8)),
      fin_categories: { name: 'Freelance', icon: '💻', color: '#3b82f6', type: 'income' } },
    { id: 'demo-tx-3',  app_id: 'demo-finanzas', type: 'expense', amount: 850,  category_id: 'demo-cat-3', description: 'Alquiler', date: fmt(startOfMonth(hoy)),
      fin_categories: { name: 'Vivienda', icon: '🏠', color: '#10b981', type: 'expense' } },
    { id: 'demo-tx-4',  app_id: 'demo-finanzas', type: 'expense', amount: 94,   category_id: 'demo-cat-3', description: 'Electricidad', date: fmt(subDays(hoy, 3)),
      fin_categories: { name: 'Vivienda', icon: '🏠', color: '#10b981', type: 'expense' } },
    { id: 'demo-tx-5',  app_id: 'demo-finanzas', type: 'expense', amount: 85.4, category_id: 'demo-cat-1', description: 'Mercadona', date: fmt(subDays(hoy, 2)),
      fin_categories: { name: 'Alimentación', icon: '🛒', color: '#f97316', type: 'expense' } },
    { id: 'demo-tx-6',  app_id: 'demo-finanzas', type: 'expense', amount: 32.8, category_id: 'demo-cat-1', description: 'Carrefour', date: fmt(subDays(hoy, 5)),
      fin_categories: { name: 'Alimentación', icon: '🛒', color: '#f97316', type: 'expense' } },
    { id: 'demo-tx-7',  app_id: 'demo-finanzas', type: 'expense', amount: 71.6, category_id: 'demo-cat-2', description: 'Gasolina', date: fmt(subDays(hoy, 4)),
      fin_categories: { name: 'Transporte', icon: '🚌', color: '#3b82f6', type: 'expense' } },
    { id: 'demo-tx-8',  app_id: 'demo-finanzas', type: 'expense', amount: 35,   category_id: 'demo-cat-4', description: 'Gym mensual', date: fmt(startOfMonth(hoy)),
      fin_categories: { name: 'Ocio', icon: '🎭', color: '#8b5cf6', type: 'expense' } },
    { id: 'demo-tx-9',  app_id: 'demo-finanzas', type: 'expense', amount: 18,   category_id: 'demo-cat-4', description: 'Netflix', date: fmt(subDays(hoy, 7)),
      fin_categories: { name: 'Ocio', icon: '🎭', color: '#8b5cf6', type: 'expense' } },
    { id: 'demo-tx-10', app_id: 'demo-finanzas', type: 'expense', amount: 28.5, category_id: 'demo-cat-5', description: 'Farmacia', date: fmt(subDays(hoy, 6)),
      fin_categories: { name: 'Salud', icon: '❤️', color: '#ef4444', type: 'expense' } },
    { id: 'demo-tx-11', app_id: 'demo-finanzas', type: 'expense', amount: 45,   category_id: 'demo-cat-6', description: 'Ropa online', date: fmt(subDays(hoy, 9)),
      fin_categories: { name: 'Ropa', icon: '👗', color: '#ec4899', type: 'expense' } },
    { id: 'demo-tx-12', app_id: 'demo-finanzas', type: 'expense', amount: 23.5, category_id: 'demo-cat-4', description: 'Cena con amigos', date: fmt(subDays(hoy, 1)),
      fin_categories: { name: 'Ocio', icon: '🎭', color: '#8b5cf6', type: 'expense' } },
    { id: 'demo-tx-13', app_id: 'demo-finanzas', type: 'expense', amount: 15,   category_id: 'demo-cat-2', description: 'Taxi', date: fmt(subDays(hoy, 1)),
      fin_categories: { name: 'Transporte', icon: '🚌', color: '#3b82f6', type: 'expense' } },
  ],

  fin_budgets: [
    { id: 'demo-b-1', app_id: 'demo-finanzas', category_id: 'demo-cat-1', month: mes, limit_amount: 400,
      fin_categories: { name: 'Alimentación', icon: '🛒', color: '#f97316' } },
    { id: 'demo-b-2', app_id: 'demo-finanzas', category_id: 'demo-cat-2', month: mes, limit_amount: 200,
      fin_categories: { name: 'Transporte', icon: '🚌', color: '#3b82f6' } },
    { id: 'demo-b-3', app_id: 'demo-finanzas', category_id: 'demo-cat-3', month: mes, limit_amount: 1000,
      fin_categories: { name: 'Vivienda', icon: '🏠', color: '#10b981' } },
    { id: 'demo-b-4', app_id: 'demo-finanzas', category_id: 'demo-cat-4', month: mes, limit_amount: 150,
      fin_categories: { name: 'Ocio', icon: '🎭', color: '#8b5cf6' } },
  ],
}
