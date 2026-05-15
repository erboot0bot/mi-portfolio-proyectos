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

  deporte_rutinas: [
    {
      id: 'rut-1', nombre: 'Fuerza — Upper body', dias: ['L', 'X', 'V'],
      ejercicios: [
        { id: 'ej-1', nombre: 'Press banca',   series: 4, reps: 8,  peso: 70 },
        { id: 'ej-2', nombre: 'Dominadas',     series: 3, reps: 10, peso: 0  },
        { id: 'ej-3', nombre: 'Press militar', series: 3, reps: 10, peso: 40 },
        { id: 'ej-4', nombre: 'Curl bíceps',   series: 3, reps: 12, peso: 15 },
      ],
    },
    {
      id: 'rut-2', nombre: 'Fuerza — Lower body', dias: ['M', 'J'],
      ejercicios: [
        { id: 'ej-5', nombre: 'Sentadilla', series: 4, reps: 8,  peso: 90  },
        { id: 'ej-6', nombre: 'Peso muerto', series: 3, reps: 6, peso: 100 },
        { id: 'ej-7', nombre: 'Prensa',      series: 3, reps: 12, peso: 120 },
      ],
    },
  ],
  deporte_rutas: [
    { id: 'ruta-1', nombre: 'Montserrat circular',    tipo: 'senderismo', distancia_km: 12, desnivel_m: 650, dificultad: 'media', tiempo_h: 4.5, fecha: fmt(subDays(hoy, 14)), notas: 'Espectacular, mucha gente en verano' },
    { id: 'ruta-2', nombre: 'Collserola — Sant Cugat', tipo: 'bici',       distancia_km: 35, desnivel_m: 420, dificultad: 'media', tiempo_h: 2.0, fecha: fmt(subDays(hoy, 7)),  notas: 'Buen firme hasta la bajada final' },
  ],

  vehiculos: [
    {
      id: 'veh-1', marca: 'Volkswagen', modelo: 'Golf', anio: 2018, matricula: '1234 ABC', color: 'Gris',
      itv_ultima: '2022-11-15', itv_proxima: fmt(addDays(hoy, 180)),
      seguro_compania: 'Mapfre', seguro_vencimiento: fmt(addDays(hoy, 45)),
      taller: 'Taller García — 93 123 45 67',
      incidencias: [
        { id: 'inc-1', fecha: fmt(subDays(hoy, 30)), descripcion: 'Pinchazo rueda delantera derecha. Cambiada por la de repuesto.' },
      ],
    },
  ],

  mascotas: [
    {
      id: 'mas-1', nombre: 'Luna', especie: 'perro', raza: 'Labrador', edad_anios: 3, icono: '🐕',
      veterinario: { nombre: 'Clínica VetCare', telefono: '93 456 78 90', direccion: 'Calle Mayor 12' },
      vacunas: [
        { id: 'vac-1', nombre: 'Rabia',       fecha_ultima: fmt(subDays(hoy, 90)), proxima: fmt(addDays(hoy, 275)) },
        { id: 'vac-2', nombre: 'Polivalente', fecha_ultima: fmt(subDays(hoy, 90)), proxima: fmt(addDays(hoy, 275)) },
      ],
      medicacion: [],
      notas: 'Alérgica al pollo. Revisar oídos cada mes.',
      alimentacion_stock: [
        { id: 'alst-1', nombre: 'Pienso adulto Royal Canin', current_stock: 3000, min_stock: 500, unit: 'g' },
        { id: 'alst-2', nombre: 'Snacks premio',             current_stock: 20,   min_stock: 5,   unit: 'uds' },
      ],
      alimentacion_schedule: [
        { time: '08:00', amount: '200g', label: 'Mañana' },
        { time: '19:00', amount: '200g', label: 'Noche'  },
      ],
    },
  ],

  mascotas_eventos: [
    {
      id: 'mev-1', pet_id: 'mas-1',
      tipo: 'vet_visit', titulo: 'Revisión anual',
      start_time: new Date(fmt(addDays(hoy, 15)) + 'T10:00:00').toISOString(),
      all_day: true,
      metadata: { notes: 'Revisar oídos y peso', interval_days: null, duration_minutes: null },
      created_at: fmtTs(subDays(hoy, 2)),
    },
    {
      id: 'mev-2', pet_id: 'mas-1',
      tipo: 'walk', titulo: 'Paseo',
      start_time: new Date(new Date().setHours(8, 30, 0, 0)).toISOString(),
      all_day: false,
      metadata: { duration_minutes: 45, notes: null, interval_days: null },
      created_at: fmtTs(hoy),
    },
    {
      id: 'mev-3', pet_id: 'mas-1',
      tipo: 'walk', titulo: 'Paseo',
      start_time: new Date(new Date().setHours(19, 0, 0, 0)).toISOString(),
      all_day: false,
      metadata: { duration_minutes: 30, notes: 'Parque cerca de casa', interval_days: null },
      created_at: fmtTs(hoy),
    },
  ],

  vehiculos_mantenimiento: [
    {
      id: 'mant-1', vehicle_id: 'veh-1',
      type: 'aceite', date: fmt(subDays(hoy, 180)),
      km: 45000, description: 'Cambio aceite 5W30 + filtro aceite',
      cost: 85, next_km: 50000, next_date: fmt(addDays(hoy, 90)),
      created_at: fmtTs(subDays(hoy, 180)),
    },
    {
      id: 'mant-2', vehicle_id: 'veh-1',
      type: 'ITV', date: fmt(subDays(hoy, 548)),
      km: 38000, description: 'ITV superada con observaciones menores',
      cost: 52, next_km: null, next_date: fmt(addDays(hoy, 180)),
      created_at: fmtTs(subDays(hoy, 548)),
    },
    {
      id: 'mant-3', vehicle_id: 'veh-1',
      type: 'ruedas', date: fmt(subDays(hoy, 365)),
      km: 40000, description: 'Cambio 4 neumáticos Michelin Primacy 4',
      cost: 420, next_km: 80000, next_date: null,
      created_at: fmtTs(subDays(hoy, 365)),
    },
  ],

  ropa_prendas: [
    { id: 'ropa-1', nombre: 'Vaqueros slim azul',    categoria: 'pantalon', color: 'Azul',   marca: "Levi's", temporada: 'todo_año',    en_trastero: false },
    { id: 'ropa-2', nombre: 'Camiseta básica blanca', categoria: 'camiseta', color: 'Blanco', marca: 'Uniqlo', temporada: 'verano',       en_trastero: true  },
    { id: 'ropa-3', nombre: 'Chaqueta cuero marrón',  categoria: 'chaqueta', color: 'Marrón', marca: 'Zara',   temporada: 'entretiempo', en_trastero: false },
    { id: 'ropa-4', nombre: 'Zapatillas running',     categoria: 'calzado',  color: 'Negro',  marca: 'Nike',   temporada: 'todo_año',    en_trastero: false },
    { id: 'ropa-5', nombre: 'Abrigo gris',            categoria: 'abrigo',   color: 'Gris',   marca: 'Mango',  temporada: 'invierno',    en_trastero: true  },
  ],
  ropa_tallas: { camiseta: 'M', pantalon: '32x32', calzado: '43', chaqueta: 'L' },
  ropa_wishlist: [
    { id: 'wish-1', nombre: 'Sudadera técnica running', marca: 'Decathlon',      precio_aprox: 35, url: '' },
    { id: 'wish-2', nombre: 'Chinos beige',             marca: 'Massimo Dutti', precio_aprox: 70, url: '' },
  ],

  formacion_cursos: [
    { id: 'cur-1', titulo: 'React 18 + TypeScript Avanzado', plataforma: 'Udemy',         progreso: 68,  fecha_limite: fmt(addDays(hoy, 45)), estado: 'activo'     },
    { id: 'cur-2', titulo: 'AWS Solutions Architect',         plataforma: 'A Cloud Guru',  progreso: 30,  fecha_limite: fmt(addDays(hoy, 90)), estado: 'activo'     },
    { id: 'cur-3', titulo: 'Docker & Kubernetes',             plataforma: 'Udemy',         progreso: 100, fecha_limite: null,                  estado: 'completado' },
  ],
  formacion_idiomas: [
    { id: 'idm-1', idioma: 'Inglés',  nivel: 'B2', metodo: 'Italki + series en VO', objetivo: 'C1' },
    { id: 'idm-2', idioma: 'Francés', nivel: 'A2', metodo: 'Duolingo',              objetivo: 'B1' },
  ],
  formacion_certificaciones: [
    { id: 'cert-1', nombre: 'AWS Cloud Practitioner', entidad: 'Amazon', fecha: '2024-03-15', estado: 'obtenida'    },
    { id: 'cert-2', nombre: 'Google Analytics 4',     entidad: 'Google', fecha: null,         estado: 'en_progreso' },
  ],
}
