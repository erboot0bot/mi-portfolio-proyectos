import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import esLocale from '@fullcalendar/core/locales/es'
import { supabase } from '../../../lib/supabase'

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444']

function TaskModal({ task, slot, onSave, onDelete, onClose }) {
  const isNew = !task?.id
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.extendedProps?.description ?? '')
  const [color, setColor] = useState(task?.backgroundColor ?? COLORS[0])
  const [allDay, setAllDay] = useState(task?.allDay ?? slot?.allDay ?? false)
  const [startStr, setStartStr] = useState(
    task?.startStr ?? slot?.startStr?.slice(0, 16) ?? ''
  )
  const [endStr, setEndStr] = useState(
    task?.endStr ?? slot?.endStr?.slice(0, 16) ?? ''
  )

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="font-bold text-lg text-[var(--text)] mb-4">
          {isNew ? 'Nueva tarea' : 'Editar tarea'}
        </h2>
        <div className="flex flex-col gap-3">
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título *"
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
              text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none
              focus:border-[var(--accent)] transition-colors"
          />
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
              text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none
              focus:border-[var(--accent)] transition-colors"
          />
          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer">
            <input
              type="checkbox"
              checked={allDay}
              onChange={e => setAllDay(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Todo el día
          </label>
          {!allDay && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-[var(--text-faint)] mb-1">Inicio</label>
                <input type="datetime-local" value={startStr}
                  onChange={e => setStartStr(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--border)]
                    bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[var(--accent)]" />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-[var(--text-faint)] mb-1">Fin</label>
                <input type="datetime-local" value={endStr}
                  onChange={e => setEndStr(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--border)]
                    bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[var(--accent)]" />
              </div>
            </div>
          )}
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full transition-transform"
                style={{
                  backgroundColor: c,
                  transform: color === c ? 'scale(1.3)' : 'scale(1)',
                  outline: color === c ? `2px solid ${c}` : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-4">
          {!isNew && (
            <button onClick={() => onDelete(task.id)}
              className="px-4 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
              Eliminar
            </button>
          )}
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => title.trim() && onSave({ title: title.trim(), description, color, allDay, startStr, endStr })}
            disabled={!title.trim()}
            className="px-4 py-2 rounded-lg text-sm bg-[var(--accent)] text-white font-medium
              hover:opacity-90 disabled:opacity-40 transition-opacity">
            {isNew ? 'Crear' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Calendar() {
  const { project } = useOutletContext()
  const [events, setEvents] = useState([])
  const [modal, setModal] = useState(null)

  useEffect(() => {
    supabase
      .from('calendar_tasks')
      .select('*')
      .eq('project_id', project.id)
      .then(({ data }) => {
        if (data) setEvents(data.map(dbToEvent))
      })
  }, [project.id])

  function dbToEvent(t) {
    return {
      id: t.id,
      title: t.title,
      start: t.start_time,
      end: t.end_time,
      allDay: t.all_day,
      backgroundColor: t.color,
      borderColor: t.color,
      extendedProps: { description: t.description },
    }
  }

  async function handleSave({ title, description, color, allDay, startStr, endStr }) {
    const payload = {
      project_id: project.id,
      title,
      description,
      color,
      all_day: allDay,
      start_time: startStr || new Date().toISOString(),
      end_time: endStr || null,
    }
    if (modal?.task?.id) {
      const { error } = await supabase.from('calendar_tasks').update(payload).eq('id', modal.task.id)
      if (!error) {
        setEvents(prev => prev.map(e =>
          e.id === modal.task.id
            ? { ...e, title, allDay, start: payload.start_time, end: payload.end_time,
                backgroundColor: color, borderColor: color,
                extendedProps: { description } }
            : e
        ))
      }
    } else {
      const { data, error } = await supabase.from('calendar_tasks').insert(payload).select().single()
      if (!error && data) setEvents(prev => [...prev, dbToEvent(data)])
    }
    setModal(null)
  }

  async function handleDelete(id) {
    await supabase.from('calendar_tasks').delete().eq('id', id)
    setEvents(prev => prev.filter(e => e.id !== id))
    setModal(null)
  }

  async function handleEventDrop({ event }) {
    await supabase.from('calendar_tasks').update({
      start_time: event.startStr,
      end_time: event.endStr || null,
      all_day: event.allDay,
    }).eq('id', event.id)
    setEvents(prev => prev.map(e =>
      e.id === event.id ? { ...e, start: event.startStr, end: event.endStr, allDay: event.allDay } : e
    ))
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[var(--text)] mb-6">Calendario</h1>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4
        [&_.fc-button]:bg-[var(--accent)] [&_.fc-button]:border-[var(--accent)] [&_.fc-button]:text-white
        [&_.fc-button-active]:opacity-70 [&_.fc-day-today]:bg-orange-50
        dark:[&_.fc-day-today]:bg-orange-950/20 [&_.fc-toolbar-title]:text-[var(--text)]
        [&_.fc-col-header-cell]:text-[var(--text-muted)] [&_.fc-timegrid-slot-label]:text-[var(--text-faint)]">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="timeGridWeek"
          locale={esLocale}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek,dayGridMonth,listWeek',
          }}
          buttonText={{ day: 'Día', week: 'Semana', month: 'Mes', list: 'Agenda' }}
          events={events}
          selectable
          editable
          select={info => setModal({ task: null, slot: info })}
          eventClick={info => setModal({ task: info.event, slot: null })}
          eventDrop={handleEventDrop}
          eventResize={handleEventDrop}
          height="auto"
        />
      </div>
      {modal && (
        <TaskModal
          task={modal.task}
          slot={modal.slot}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
