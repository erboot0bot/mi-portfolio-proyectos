// src/data/demo/personal.js
import { addDays, subDays, format } from 'date-fns'

const fmt = d => format(d, 'yyyy-MM-dd')
const fmtTs = d => d.toISOString()
const hoy = new Date()

export const mockPersonal = {
  personal_tasks: [
    { id: 'demo-pt-1', app_id: 'demo-personal', title: 'Renovar pasaporte', description: 'Pedir cita previa en la web', due_date: fmt(addDays(hoy, 3)), priority: 'high',   status: 'pending', completed_at: null, created_at: fmtTs(subDays(hoy, 5)) },
    { id: 'demo-pt-2', app_id: 'demo-personal', title: 'Llamar al seguro',   description: null,                           due_date: fmt(addDays(hoy, 1)), priority: 'medium', status: 'pending', completed_at: null, created_at: fmtTs(subDays(hoy, 3)) },
    { id: 'demo-pt-3', app_id: 'demo-personal', title: 'Comprar regalo cumpleaños Ana', description: null,                due_date: fmt(addDays(hoy, 7)), priority: 'medium', status: 'pending', completed_at: null, created_at: fmtTs(subDays(hoy, 2)) },
    { id: 'demo-pt-4', app_id: 'demo-personal', title: 'Revisar declaración IRPF', description: 'Campaña mayo',          due_date: null,                 priority: 'low',    status: 'pending', completed_at: null, created_at: fmtTs(subDays(hoy, 7)) },
    { id: 'demo-pt-5', app_id: 'demo-personal', title: 'Revisar suscripciones',    description: 'Cancelar las que no uso', due_date: null,                priority: 'low',   status: 'done',    completed_at: fmtTs(subDays(hoy, 1)), created_at: fmtTs(subDays(hoy, 10)) },
  ],

  personal_notes: [
    { id: 'demo-nota-1', app_id: 'demo-personal', title: 'Ideas para las vacaciones', content: 'Portugal en junio o julio. Mirar Airbnb en Oporto. Presupuesto ~1200€ para dos personas.', color: '#3b82f6', pinned: true,  updated_at: fmtTs(subDays(hoy, 2)),  created_at: fmtTs(subDays(hoy, 8)) },
    { id: 'demo-nota-2', app_id: 'demo-personal', title: 'Libros pendientes',          content: '1. El problema de los tres cuerpos\n2. Sapiens\n3. Piense y hágase rico',               color: '#f59e0b', pinned: false, updated_at: fmtTs(subDays(hoy, 10)), created_at: fmtTs(subDays(hoy, 15)) },
    { id: 'demo-nota-3', app_id: 'demo-personal', title: 'Contraseñas WiFi',           content: 'Casa: MiWifi2024\nOficina: Empresa123!',                                               color: '#6b7280', pinned: false, updated_at: fmtTs(subDays(hoy, 25)), created_at: fmtTs(subDays(hoy, 30)) },
  ],

  personal_ideas: [
    { id: 'demo-idea-1', app_id: 'demo-personal', title: 'App de seguimiento de hábitos',    description: 'Una app sencilla que te mande notificaciones y lleve racha.', tags: ['app', 'productividad'], created_at: fmtTs(subDays(hoy, 12)) },
    { id: 'demo-idea-2', app_id: 'demo-personal', title: 'Blog técnico sobre mi experiencia', description: 'Escribir sobre proyectos, aprendizajes y herramientas.',      tags: ['blog', 'escritura'],   created_at: fmtTs(subDays(hoy, 5)) },
  ],

  events: [
    { id: 'demo-pev-1', app_id: 'demo-personal', event_type: 'task', title: 'Reunión equipo', description: '10:00 – meet.google.com', color: '#3b82f6', all_day: false, start_time: addDays(hoy, 2).toISOString(), end_time: null, recurrence: null, metadata: {}, created_at: hoy.toISOString() },
    { id: 'demo-pev-2', app_id: 'demo-personal', event_type: 'task', title: 'Gym',            description: null,                      color: '#10b981', all_day: false, start_time: addDays(hoy, 1).toISOString(), end_time: null, recurrence: 'weekly', metadata: {}, created_at: hoy.toISOString() },
  ],
}
