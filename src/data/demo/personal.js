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

  items_notas: [
    { id: 'demo-nota-1', app_id: 'demo-personal', module: 'notas', type: 'note', title: 'Ideas para las vacaciones', visibility: 'private', owner_id: 'demo', checked: false, checked_at: null, metadata: { content: 'Portugal en junio o julio. Mirar Airbnb en Oporto. Presupuesto ~1200€ para dos personas.' }, created_at: fmtTs(subDays(hoy, 8)) },
    { id: 'demo-nota-2', app_id: 'demo-personal', module: 'notas', type: 'note', title: 'Libros pendientes',          visibility: 'private', owner_id: 'demo', checked: false, checked_at: null, metadata: { content: '1. El problema de los tres cuerpos\n2. Sapiens\n3. Piense y hágase rico' }, created_at: fmtTs(subDays(hoy, 15)) },
    { id: 'demo-nota-3', app_id: 'demo-personal', module: 'notas', type: 'note', title: 'Contraseñas WiFi',           visibility: 'private', owner_id: 'demo', checked: false, checked_at: null, metadata: { content: 'Casa: MiWifi2024\nOficina: Empresa123!' }, created_at: fmtTs(subDays(hoy, 30)) },
  ],

  items_ideas: [
    { id: 'demo-idea-1', app_id: 'demo-personal', module: 'ideas', type: 'idea', title: 'App de seguimiento de hábitos',    visibility: 'private', owner_id: 'demo', checked: false, checked_at: null, metadata: { content: 'Una app sencilla que te mande notificaciones y lleve racha.' }, created_at: fmtTs(subDays(hoy, 12)) },
    { id: 'demo-idea-2', app_id: 'demo-personal', module: 'ideas', type: 'idea', title: 'Blog técnico sobre mi experiencia', visibility: 'private', owner_id: 'demo', checked: false, checked_at: null, metadata: { content: 'Escribir sobre proyectos, aprendizajes y herramientas.' }, created_at: fmtTs(subDays(hoy, 5)) },
  ],

  events: [
    { id: 'demo-pev-1', app_id: 'demo-personal', event_type: 'task', title: 'Reunión equipo', description: '10:00 – meet.google.com', color: '#3b82f6', all_day: false, start_time: addDays(hoy, 2).toISOString(), end_time: null, recurrence: null, metadata: {}, created_at: hoy.toISOString() },
    { id: 'demo-pev-2', app_id: 'demo-personal', event_type: 'task', title: 'Gym',            description: null,                      color: '#10b981', all_day: false, start_time: addDays(hoy, 1).toISOString(), end_time: null, recurrence: 'weekly', metadata: {}, created_at: hoy.toISOString() },
  ],
}
