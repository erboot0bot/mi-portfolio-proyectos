import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import esLocale from '@fullcalendar/core/locales/es'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b']

function EventModal({ event, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(event?.title ?? '')
  const [color, setColor] = useState(event?.backgroundColor ?? COLORS[0])
  const [description, setDescription] = useState(event?.extendedProps?.description ?? '')
  const isNew = !event?.id

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="font-bold text-lg text-[var(--text)] mb-4">
          {isNew ? 'Nuevo evento' : 'Editar evento'}
        </h2>
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Título del evento"
          className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
            text-[var(--text)] placeholder:text-[var(--text-faint)] mb-4 outline-none
            focus:border-[var(--accent)] transition-colors"
        />
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Descripción (opcional)"
          className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]
            text-[var(--text)] placeholder:text-[var(--text-faint)] mb-4 outline-none
            focus:border-[var(--accent)] transition-colors"
        />
        <div className="flex gap-2 mb-6">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full transition-transform"
              style={{
                backgroundColor: c,
                transform: color === c ? 'scale(1.25)' : 'scale(1)',
                outline: color === c ? `2px solid ${c}` : 'none',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>
        <div className="flex gap-3 justify-end">
          {!isNew && (
            <button
              onClick={() => onDelete(event.id)}
              className="px-4 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50
                dark:hover:bg-red-950 transition-colors"
            >
              Eliminar
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-[var(--text-muted)]
              hover:bg-[var(--bg-subtle)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => title.trim() && onSave({ title: title.trim(), color, description })}
            disabled={!title.trim()}
            className="px-4 py-2 rounded-lg text-sm bg-[var(--accent)] text-white font-medium
              hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {isNew ? 'Crear' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Calendario() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [modal, setModal] = useState(null)
  const [pendingDate, setPendingDate] = useState(null)

  async function loadEvents() {
    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
    if (data) {
      setEvents(data.map(e => ({
        id: e.id,
        title: e.title,
        start: e.start_date,
        end: e.end_date,
        backgroundColor: e.color,
        borderColor: e.color,
        extendedProps: { description: e.description },
      })))
    }
  }

  useEffect(() => {
    loadEvents() // eslint-disable-line react-hooks/set-state-in-effect
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleDateClick(info) {
    setPendingDate(info.dateStr)
    setModal({ event: null })
  }

  function handleEventClick(info) {
    setModal({ event: info.event })
  }

  async function handleSave({ title, color, description }) {
    if (modal.event?.id) {
      const { error } = await supabase
        .from('calendar_events')
        .update({ title, color, description })
        .eq('id', modal.event.id)
      if (!error) {
        setEvents(prev => prev.map(e =>
          e.id === modal.event.id
            ? { ...e, title, backgroundColor: color, borderColor: color, extendedProps: { description } }
            : e
        ))
      }
    } else {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({ title, color, description, start_date: pendingDate, user_id: user.id })
        .select()
        .single()
      if (!error && data) {
        setEvents(prev => [...prev, {
          id: data.id,
          title: data.title,
          start: data.start_date,
          backgroundColor: data.color,
          borderColor: data.color,
          extendedProps: { description: data.description },
        }])
      }
    }
    setModal(null)
    setPendingDate(null)
  }

  async function handleDelete(id) {
    await supabase.from('calendar_events').delete().eq('id', id)
    setEvents(prev => prev.filter(e => e.id !== id))
    setModal(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[var(--text)] mb-6">Calendario</h1>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4
        [&_.fc-button]:bg-[var(--accent)] [&_.fc-button]:border-[var(--accent)]
        [&_.fc-button]:text-white [&_.fc-button-active]:opacity-70
        [&_.fc-day-today]:bg-orange-50 dark:[&_.fc-day-today]:bg-orange-950/20">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek',
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          editable
          selectable
        />
      </div>
      {modal && (
        <EventModal
          event={modal.event}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
