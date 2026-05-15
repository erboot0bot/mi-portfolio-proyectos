// src/data/demo/personal.js
import { addDays, subDays, startOfWeek, format } from 'date-fns'

const fmt   = d => format(d, 'yyyy-MM-dd')
const fmtTs = d => d.toISOString()
const hoy   = new Date()
const semana = startOfWeek(hoy, { weekStartsOn: 1 })

const ts = (dayOffset, h, m = 0) =>
  new Date(semana.getFullYear(), semana.getMonth(), semana.getDate() + dayOffset, h, m, 0).toISOString()

export const mockPersonal = {
  personal_tasks: [
    { id: 'demo-pt-1', app_id: 'demo-personal', title: 'Renovar pasaporte',            description: 'Pedir cita previa en la web',    due_date: fmt(addDays(hoy, 3)), priority: 'high',   status: 'pending', completed_at: null,                    created_at: fmtTs(subDays(hoy, 5)) },
    { id: 'demo-pt-2', app_id: 'demo-personal', title: 'Llamar al seguro',              description: null,                             due_date: fmt(addDays(hoy, 1)), priority: 'medium', status: 'pending', completed_at: null,                    created_at: fmtTs(subDays(hoy, 3)) },
    { id: 'demo-pt-3', app_id: 'demo-personal', title: 'Comprar regalo cumpleaños Ana', description: null,                             due_date: fmt(addDays(hoy, 7)), priority: 'medium', status: 'pending', completed_at: null,                    created_at: fmtTs(subDays(hoy, 2)) },
    { id: 'demo-pt-4', app_id: 'demo-personal', title: 'Revisar declaración IRPF',      description: 'Campaña mayo',                   due_date: null,                 priority: 'low',    status: 'pending', completed_at: null,                    created_at: fmtTs(subDays(hoy, 7)) },
    { id: 'demo-pt-5', app_id: 'demo-personal', title: 'Revisar suscripciones',         description: 'Cancelar las que no uso',        due_date: null,                 priority: 'low',    status: 'done',    completed_at: fmtTs(subDays(hoy, 1)), created_at: fmtTs(subDays(hoy, 10)) },
    { id: 'demo-pt-6', app_id: 'demo-personal', title: 'Preparar presentación sprint',  description: 'Slides para review del viernes', due_date: fmt(addDays(hoy, 4)), priority: 'high',   status: 'pending', completed_at: null,                    created_at: fmtTs(subDays(hoy, 1)) },
  ],

  personal_notes: [
    { id: 'demo-nota-1', app_id: 'demo-personal', title: 'Ideas para las vacaciones', content: 'Portugal en junio o julio. Mirar Airbnb en Oporto. Presupuesto ~1200€ para dos personas.', color: '#3b82f6', pinned: true,  updated_at: fmtTs(subDays(hoy, 2)),  created_at: fmtTs(subDays(hoy, 8)) },
    { id: 'demo-nota-2', app_id: 'demo-personal', title: 'Libros pendientes',          content: '1. El problema de los tres cuerpos\n2. Sapiens\n3. Piense y hágase rico',               color: '#f59e0b', pinned: false, updated_at: fmtTs(subDays(hoy, 10)), created_at: fmtTs(subDays(hoy, 15)) },
    { id: 'demo-nota-3', app_id: 'demo-personal', title: 'Contraseñas WiFi',           content: 'Casa: MiWifi2024\nOficina: Empresa123!',                                               color: '#6b7280', pinned: false, updated_at: fmtTs(subDays(hoy, 25)), created_at: fmtTs(subDays(hoy, 30)) },
    { id: 'demo-nota-4', app_id: 'demo-personal', title: 'Objetivos Q2',               content: '- Lanzar MVP antes del 30 junio\n- Conseguir 3 clientes nuevos\n- Mejorar inglés B2→C1', color: '#10b981', pinned: true,  updated_at: fmtTs(subDays(hoy, 1)),  created_at: fmtTs(subDays(hoy, 4)) },
  ],

  personal_ideas: [
    { id: 'demo-idea-1', app_id: 'demo-personal', title: 'App de seguimiento de hábitos',     description: 'Una app sencilla que te mande notificaciones y lleve racha.', tags: ['app', 'productividad'], created_at: fmtTs(subDays(hoy, 12)) },
    { id: 'demo-idea-2', app_id: 'demo-personal', title: 'Blog técnico sobre mi experiencia', description: 'Escribir sobre proyectos, aprendizajes y herramientas.',      tags: ['blog', 'escritura'],   created_at: fmtTs(subDays(hoy, 5)) },
  ],

  events: [
    // ─── Work blocks Mon–Fri ──────────────────────────────────────────
    { id: 'demo-pev-work-1', app_id: 'demo-personal', event_type: 'work', title: 'Trabajo', color: '#38bdf8', all_day: false, start_time: ts(0, 9),  end_time: ts(0, 18), recurrence: 'weekdays', metadata: { location: 'Oficina' }, created_at: hoy.toISOString() },
    { id: 'demo-pev-work-2', app_id: 'demo-personal', event_type: 'work', title: 'Trabajo', color: '#38bdf8', all_day: false, start_time: ts(1, 9),  end_time: ts(1, 18), recurrence: 'weekdays', metadata: { location: 'Oficina' }, created_at: hoy.toISOString() },
    { id: 'demo-pev-work-3', app_id: 'demo-personal', event_type: 'work', title: 'Trabajo', color: '#38bdf8', all_day: false, start_time: ts(2, 9),  end_time: ts(2, 18), recurrence: 'weekdays', metadata: { location: 'Oficina' }, created_at: hoy.toISOString() },
    { id: 'demo-pev-work-4', app_id: 'demo-personal', event_type: 'work', title: 'Trabajo', color: '#38bdf8', all_day: false, start_time: ts(3, 9),  end_time: ts(3, 18), recurrence: 'weekdays', metadata: { location: 'Oficina' }, created_at: hoy.toISOString() },
    { id: 'demo-pev-work-5', app_id: 'demo-personal', event_type: 'work', title: 'Trabajo', color: '#38bdf8', all_day: false, start_time: ts(4, 9),  end_time: ts(4, 18), recurrence: 'weekdays', metadata: { location: 'Oficina' }, created_at: hoy.toISOString() },

    // ─── Daily standup Mon–Fri ────────────────────────────────────────
    { id: 'demo-pev-standup-1', app_id: 'demo-personal', event_type: 'meeting', title: 'Daily standup', color: '#a78bfa', all_day: false, start_time: ts(0, 9, 30), end_time: ts(0, 9, 45), recurrence: 'weekdays', metadata: { link: 'meet.google.com/abc-xyz' }, created_at: hoy.toISOString() },
    { id: 'demo-pev-standup-2', app_id: 'demo-personal', event_type: 'meeting', title: 'Daily standup', color: '#a78bfa', all_day: false, start_time: ts(1, 9, 30), end_time: ts(1, 9, 45), recurrence: 'weekdays', metadata: { link: 'meet.google.com/abc-xyz' }, created_at: hoy.toISOString() },
    { id: 'demo-pev-standup-3', app_id: 'demo-personal', event_type: 'meeting', title: 'Daily standup', color: '#a78bfa', all_day: false, start_time: ts(2, 9, 30), end_time: ts(2, 9, 45), recurrence: 'weekdays', metadata: { link: 'meet.google.com/abc-xyz' }, created_at: hoy.toISOString() },
    { id: 'demo-pev-standup-4', app_id: 'demo-personal', event_type: 'meeting', title: 'Daily standup', color: '#a78bfa', all_day: false, start_time: ts(3, 9, 30), end_time: ts(3, 9, 45), recurrence: 'weekdays', metadata: { link: 'meet.google.com/abc-xyz' }, created_at: hoy.toISOString() },
    { id: 'demo-pev-standup-5', app_id: 'demo-personal', event_type: 'meeting', title: 'Daily standup', color: '#a78bfa', all_day: false, start_time: ts(4, 9, 30), end_time: ts(4, 9, 45), recurrence: 'weekdays', metadata: { link: 'meet.google.com/abc-xyz' }, created_at: hoy.toISOString() },

    // ─── Specific meetings this week ──────────────────────────────────
    { id: 'demo-pev-meet-1', app_id: 'demo-personal', event_type: 'meeting', title: 'Planning de sprint',    color: '#f59e0b', all_day: false, start_time: ts(0, 10),    end_time: ts(0, 11),      recurrence: null,        metadata: { link: 'meet.google.com/sprint' }, created_at: hoy.toISOString() },
    { id: 'demo-pev-meet-2', app_id: 'demo-personal', event_type: 'meeting', title: 'Revisión con cliente',  color: '#f97316', all_day: false, start_time: ts(2, 16),    end_time: ts(2, 17),      recurrence: null,        metadata: { link: 'zoom.us/j/123456'       }, created_at: hoy.toISOString() },
    { id: 'demo-pev-meet-3', app_id: 'demo-personal', event_type: 'meeting', title: 'Sprint review',         color: '#f59e0b', all_day: false, start_time: ts(4, 15),    end_time: ts(4, 16, 30),  recurrence: null,        metadata: { link: 'meet.google.com/review'  }, created_at: hoy.toISOString() },
    { id: 'demo-pev-meet-4', app_id: 'demo-personal', event_type: 'meeting', title: 'One-on-one manager',    color: '#a78bfa', all_day: false, start_time: ts(1, 11),    end_time: ts(1, 11, 30),  recurrence: 'biweekly',  metadata: {},                                created_at: hoy.toISOString() },

    // ─── Gym Tue / Thu / Sat ─────────────────────────────────────────
    { id: 'demo-pev-gym-1', app_id: 'demo-personal', event_type: 'sport', title: 'Gym 💪', color: '#10b981', all_day: false, start_time: ts(1, 7), end_time: ts(1, 8, 15), recurrence: 'weekly', metadata: { type: 'fuerza'         }, created_at: hoy.toISOString() },
    { id: 'demo-pev-gym-2', app_id: 'demo-personal', event_type: 'sport', title: 'Gym 💪', color: '#10b981', all_day: false, start_time: ts(3, 7), end_time: ts(3, 8, 15), recurrence: 'weekly', metadata: { type: 'cardio'         }, created_at: hoy.toISOString() },
    { id: 'demo-pev-gym-3', app_id: 'demo-personal', event_type: 'sport', title: 'Gym 💪', color: '#10b981', all_day: false, start_time: ts(5, 9), end_time: ts(5, 10, 30),recurrence: 'weekly', metadata: { type: 'fuerza+cardio'  }, created_at: hoy.toISOString() },
  ],

  trabajo: {
    empresa: 'Startup Tech SL',
    municipio: 'Madrid',
    horario: {
      inicio: '09:00',
      fin: '18:00',
      modalidad: 'híbrido',
      dias: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
    },
    trayecto: { tiempo_min: 35, transporte: 'Metro + caminando' },
    trabaja_festivos: false,
  },

  habitos: [
    { id: 'hab-1', nombre: 'Beber 2L de agua', icono: '💧', racha: 5,  completado_hoy: true,  historial: [true,  true,  true,  true,  true,  false, true]  },
    { id: 'hab-2', nombre: 'Leer 20 min',       icono: '📚', racha: 12, completado_hoy: false, historial: [true,  true,  false, true,  true,  true,  true]  },
    { id: 'hab-3', nombre: 'Meditar',            icono: '🧘', racha: 3,  completado_hoy: false, historial: [false, true,  true,  true,  false, false, false] },
    { id: 'hab-4', nombre: 'Ejercicio 30 min',   icono: '🏃', racha: 0,  completado_hoy: false, historial: [false, false, true,  true,  false, true,  true]  },
    { id: 'hab-5', nombre: 'Sin alcohol',        icono: '🚫', racha: 8,  completado_hoy: true,  historial: [true,  true,  true,  true,  true,  true,  true]  },
  ],

  salud_contactos: [
    { id: 'sal-1', tipo: 'medico_cabecera', nombre: 'Dr. García López', centro: 'CS Retiro',         telefono: '915 234 567', ultima_visita: fmt(subDays(hoy, 45)),  proxima_visita: fmt(addDays(hoy, 135)), especialidad: null },
    { id: 'sal-2', tipo: 'dentista',        nombre: 'Dra. Martínez',    centro: 'Clínica Sonrisa',   telefono: '914 567 890', ultima_visita: fmt(subDays(hoy, 120)), proxima_visita: fmt(addDays(hoy, 20)),  especialidad: null },
    { id: 'sal-3', tipo: 'especialista',    nombre: 'Dr. Ruiz',         centro: 'Hospital La Paz',   telefono: '917 345 678', ultima_visita: fmt(subDays(hoy, 200)), proxima_visita: null,                   especialidad: 'Traumatología' },
  ],

  documentacion: [
    { id: 'doc-1', tipo: 'DNI',               numero: '12345678A',  caducidad: fmt(addDays(hoy, 730)),  notas: null },
    { id: 'doc-2', tipo: 'Pasaporte',          numero: 'AAB123456',  caducidad: fmt(subDays(hoy, 30)),   notas: 'Caducado — pedir cita' },
    { id: 'doc-3', tipo: 'Carnet de conducir', numero: 'B-12345678', caducidad: fmt(addDays(hoy, 1825)), notas: null },
    { id: 'doc-4', tipo: 'Tarjeta sanitaria',  numero: 'MAD-987654', caducidad: null,                   notas: 'Madrid' },
  ],
}
