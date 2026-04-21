import { useState, useEffect, useRef, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import ModuleShell from './ModuleShell'
import './Calendar.css'

// ── Constantes ────────────────────────────────────────────────────
const HOUR_HEIGHT = 48
const START_HOUR = 7
const END_HOUR = 23
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAYS_ES_LONG = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio',
                   'Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const COLORS = [
  { hex: '#f97316' }, { hex: '#3b82f6' }, { hex: '#10b981' },
  { hex: '#8b5cf6' }, { hex: '#ef4444' }, { hex: '#ec4899' }, { hex: '#f59e0b' },
]

const RECURRENCE_OPTIONS = [
  { value: 'none',     label: 'Sin repetir' },
  { value: 'daily',    label: 'Diario' },
  { value: 'weekdays', label: 'L–V' },
  { value: 'weekly',   label: 'Semanal' },
  { value: 'monthly',  label: 'Mensual' },
]

const RECURRENCE_LABELS = {
  none: '', daily: '↻ Diario', weekdays: '↻ L–V',
  weekly: '↻ Semanal', monthly: '↻ Mensual',
}

// ── Helpers ───────────────────────────────────────────────────────
function ymd(d) { return d.toISOString().slice(0, 10) }

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

function getWeekDays(anchor) {
  const d = new Date(anchor)
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday); dd.setDate(monday.getDate() + i); return dd
  })
}

function minutesFromMidnight(dateStr) {
  const d = new Date(dateStr)
  return d.getHours() * 60 + d.getMinutes()
}

function fmt(dateStr) {
  const d = new Date(dateStr)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function eventOccursOnDay(ev, day) {
  if (ev.allDay) return sameDay(new Date(ev.start), day)
  const evDate = new Date(ev.start)
  const wd = day.getDay()
  if (ev.recurrence === 'daily')    return true
  if (ev.recurrence === 'weekdays') return wd >= 1 && wd <= 5
  if (ev.recurrence === 'weekly')   return evDate.getDay() === wd
  if (ev.recurrence === 'monthly')  return evDate.getDate() === day.getDate()
  return sameDay(evDate, day)
}

function getEventTop(ev) {
  const mins = minutesFromMidnight(ev.start) - START_HOUR * 60
  return Math.max(0, (mins / 60) * HOUR_HEIGHT)
}

function getEventHeight(ev) {
  const startMins = minutesFromMidnight(ev.start)
  const endMins   = ev.end ? minutesFromMidnight(ev.end) : startMins + 60
  return (Math.max(30, endMins - startMins) / 60) * HOUR_HEIGHT
}

function nowTop() {
  const now = new Date()
  return ((now.getHours() * 60 + now.getMinutes() - START_HOUR * 60) / 60) * HOUR_HEIGHT
}

function dbToEvent(t) {
  return {
    id:          t.id,
    title:       t.title,
    description: t.description ?? '',
    start:       t.start_time,
    end:         t.end_time,
    allDay:      t.all_day,
    color:       t.color ?? '#f97316',
    recurrence:  t.recurrence ?? 'none',
  }
}

function toLocalInputStr(isoOrDate) {
  const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function getMiniCalDays(year, month) {
  const first = new Date(year, month, 1)
  const last  = new Date(year, month + 1, 0)
  const startDow = (first.getDay() + 6) % 7 // Mon=0
  const days = []
  for (let i = 0; i < startDow; i++) {
    days.push({ date: new Date(year, month, 1 - startDow + i), other: true })
  }
  for (let i = 1; i <= last.getDate(); i++) {
    days.push({ date: new Date(year, month, i), other: false })
  }
  const remaining = (7 - days.length % 7) % 7
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), other: true })
  }
  return days
}

// ── MiniCalendar ──────────────────────────────────────────────────
function MiniCalendar({ anchor, onSelectDay, events }) {
  const [miniDate, setMiniDate] = useState(new Date(anchor))
  const year  = miniDate.getFullYear()
  const month = miniDate.getMonth()
  const days  = getMiniCalDays(year, month)
  const today = new Date()

  useEffect(() => {
    // Keep mini calendar in sync when anchor changes month
    const a = new Date(anchor)
    if (a.getFullYear() !== year || a.getMonth() !== month) {
      setMiniDate(new Date(a.getFullYear(), a.getMonth(), 1))
    }
  }, [anchor]) // eslint-disable-line

  return (
    <div className="mini-cal">
      <div className="mini-cal-header">
        <span>{MONTHS_ES[month].slice(0, 3)} {year}</span>
        <div style={{ display: 'flex', gap: 2 }}>
          <button className="mini-cal-nav" onClick={() => setMiniDate(new Date(year, month - 1, 1))}>‹</button>
          <button className="mini-cal-nav" onClick={() => setMiniDate(new Date(year, month + 1, 1))}>›</button>
        </div>
      </div>
      <div className="mini-cal-grid">
        {['L','M','X','J','V','S','D'].map(d => (
          <div key={d} className="mini-cal-dow">{d}</div>
        ))}
        {days.map(({ date, other }, i) => {
          const isToday    = sameDay(date, today)
          const isSelected = !isToday && sameDay(date, new Date(anchor))
          const hasEv      = events.some(e => eventOccursOnDay(e, date))
          return (
            <div
              key={i}
              className={[
                'mini-cal-day',
                isToday    ? 'today'       : '',
                isSelected ? 'selected'    : '',
                other      ? 'other-month' : '',
                hasEv && !isToday ? 'has-event' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelectDay(date)}
            >
              {date.getDate()}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── EventModal ────────────────────────────────────────────────────
function EventModal({ ev, slot, onSave, onDelete, onClose }) {
  const isNew = !ev?.id
  const [title, setTitle]       = useState(ev?.title ?? '')
  const [desc, setDesc]         = useState(ev?.description ?? '')
  const [color, setColor]       = useState(ev?.color ?? '#f97316')
  const [allDay, setAllDay]     = useState(ev?.allDay ?? slot?.allDay ?? false)
  const [recurrence, setRecur]  = useState(ev?.recurrence ?? 'none')
  const [startStr, setStart]    = useState(() => {
    if (ev?.start)   return toLocalInputStr(ev.start)
    if (slot?.start) return toLocalInputStr(slot.start)
    return toLocalInputStr(new Date())
  })
  const [endStr, setEnd]        = useState(() => {
    if (ev?.end)   return toLocalInputStr(ev.end)
    if (slot?.end) return toLocalInputStr(slot.end)
    const d = new Date(); d.setHours(d.getHours() + 1)
    return toLocalInputStr(d)
  })

  function save() {
    if (!title.trim()) return
    onSave({ title: title.trim(), description: desc, color, allDay, recurrence, startStr, endStr })
  }

  return (
    <div className="cal-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cal-modal">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ fontWeight:700, fontSize:17, color:'var(--text)' }}>
            {isNew ? 'Nueva tarea' : 'Editar tarea'}
          </h2>
          <button onClick={onClose}
            style={{ background:'none', border:'none', color:'var(--text-faint)', cursor:'pointer', fontSize:18, lineHeight:1 }}>
            ×
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="cal-field">
            <label>Título</label>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
              placeholder="¿Qué tienes que hacer?"
              onKeyDown={e => e.key === 'Enter' && save()} />
          </div>

          <div className="cal-field">
            <label>Nota (opcional)</label>
            <input value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Descripción o notas..." />
          </div>

          <div className="cal-allday-toggle" onClick={() => setAllDay(v => !v)}>
            <div className="cal-toggle-track" style={{ background: allDay ? 'var(--accent)' : 'var(--border)' }}>
              <div className="cal-toggle-thumb" style={{ transform: allDay ? 'translateX(16px)' : 'none' }} />
            </div>
            <span className="cal-toggle-label">Todo el día</span>
          </div>

          {!allDay && (
            <div style={{ display:'flex', gap:10 }}>
              <div className="cal-field" style={{ flex:1 }}>
                <label>Inicio</label>
                <input type="datetime-local" value={startStr} onChange={e => setStart(e.target.value)} />
              </div>
              <div className="cal-field" style={{ flex:1 }}>
                <label>Fin</label>
                <input type="datetime-local" value={endStr} onChange={e => setEnd(e.target.value)} />
              </div>
            </div>
          )}

          {allDay && (
            <div className="cal-field">
              <label>Fecha</label>
              <input type="date" value={startStr.slice(0, 10)}
                onChange={e => { setStart(e.target.value); setEnd(e.target.value) }} />
            </div>
          )}

          <div className="cal-field">
            <label>Repetir</label>
            <div className="recur-pills">
              {RECURRENCE_OPTIONS.map(o => (
                <button key={o.value}
                  className={`recur-pill ${recurrence === o.value ? 'active' : ''}`}
                  onClick={() => setRecur(o.value)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="cal-field">
            <label>Color</label>
            <div className="color-picker">
              {COLORS.map(c => (
                <div key={c.hex}
                  className={`color-dot ${color === c.hex ? 'selected' : ''}`}
                  style={{ background: c.hex, outlineColor: c.hex, color: c.hex }}
                  onClick={() => setColor(c.hex)} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20, paddingTop:16, borderTop:'1px solid var(--border)' }}>
          {!isNew && (
            <button className="cal-btn cal-btn-danger" onClick={() => onDelete(ev.id)}>
              Eliminar
            </button>
          )}
          <button className="cal-btn cal-btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="cal-btn cal-btn-primary" onClick={save} disabled={!title.trim()}>
            {isNew ? 'Crear tarea' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── WeekView ──────────────────────────────────────────────────────
function WeekView({ days, events, onSlotClick, onEventClick, showWeekends }) {
  const visibleDays = showWeekends ? days : days.slice(0, 5)
  const cols = visibleDays.length
  const gridTemplate = `56px repeat(${cols}, 1fr)`
  const today = new Date()
  const todayColIdx = visibleDays.findIndex(d => sameDay(d, today))
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, (8 - START_HOUR) * HOUR_HEIGHT - 60)
    }
  }, [])

  const allDayEvents = events.filter(e => e.allDay)

  return (
    <div className="week-container">
      <div className="day-header-row" style={{ gridTemplateColumns: gridTemplate }}>
        <div style={{ width: 56, borderRight: '1px solid var(--border)' }} />
        {visibleDays.map((d, i) => (
          <div key={i} className={`day-header ${sameDay(d, today) ? 'today' : ''}`}>
            <div className="day-header-name">{DAYS_ES[d.getDay()]}</div>
            <div className="day-header-num">{d.getDate()}</div>
          </div>
        ))}
      </div>

      <div className="allday-row" style={{ gridTemplateColumns: gridTemplate }}>
        <div className="allday-gutter">todo<br/>el día</div>
        {visibleDays.map((d, i) => {
          const dayEvs = allDayEvents.filter(e => eventOccursOnDay(e, d))
          return (
            <div key={i} className="allday-cell"
              onClick={() => onSlotClick({ start: ymd(d), allDay: true })}>
              {dayEvs.map(e => (
                <div key={e.id} className="allday-event" style={{ background: e.color }}
                  onClick={ev => { ev.stopPropagation(); onEventClick(e) }}>
                  {e.title}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <div className="time-grid-scroll" ref={scrollRef}>
        <div style={{ position: 'relative' }}>
          {todayColIdx >= 0 && nowTop() > 0 && (
            <div className="now-line" style={{ top: nowTop() }}>
              <div className="now-dot" />
            </div>
          )}

          {HOURS.map(h => (
            <div key={h} className="time-row" style={{ display: 'grid', gridTemplateColumns: gridTemplate }}>
              <div className="time-label">{String(h).padStart(2, '0')}:00</div>
              {visibleDays.map((d, ci) => (
                <div key={ci} className={`time-cell ${sameDay(d, today) ? 'today-col' : ''}`}
                  onClick={() => {
                    const start = new Date(d); start.setHours(h, 0, 0, 0)
                    const end   = new Date(d); end.setHours(h + 1, 0, 0, 0)
                    onSlotClick({ start: start.toISOString(), end: end.toISOString(), allDay: false })
                  }}
                />
              ))}
            </div>
          ))}

          {visibleDays.map((d, ci) => {
            const dayEvs = events.filter(e => !e.allDay && eventOccursOnDay(e, d))
            return dayEvs.map(e => {
              const top    = getEventTop(e)
              const height = Math.max(getEventHeight(e), 22)
              return (
                <div key={`${e.id}-${ci}`} className="event-block"
                  style={{
                    top, height,
                    left:  `calc(56px + ${ci} * (100% - 56px) / ${cols} + 3px)`,
                    width: `calc((100% - 56px) / ${cols} - 6px)`,
                    background: e.color,
                  }}
                  onClick={ev => { ev.stopPropagation(); onEventClick(e) }}>
                  <div className="event-title">{e.title}</div>
                  {height > 28 && (
                    <div className="event-time">{fmt(e.start)}{e.end ? ` – ${fmt(e.end)}` : ''}</div>
                  )}
                  {height > 44 && e.recurrence !== 'none' && (
                    <div className="event-recur">{RECURRENCE_LABELS[e.recurrence]}</div>
                  )}
                </div>
              )
            })
          })}
        </div>
      </div>
    </div>
  )
}

// ── AgendaView ────────────────────────────────────────────────────
function AgendaView({ days, events, onEventClick }) {
  const startDay = days[0]
  const agendaDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(startDay); d.setDate(startDay.getDate() + i); return d
  })
  const today = new Date()

  return (
    <div className="agenda">
      {agendaDays.map((d, i) => {
        const evs = events
          .filter(e => eventOccursOnDay(e, d))
          .sort((a, b) => {
            if (a.allDay && !b.allDay) return -1
            if (!a.allDay && b.allDay) return 1
            return new Date(a.start) - new Date(b.start)
          })
        if (!evs.length) return null
        return (
          <div key={i} className="agenda-date-group">
            <div className="agenda-date-header">
              <div className={`agenda-date-dot ${sameDay(d, today) ? 'today' : ''}`} />
              <div className="agenda-date-label">
                {sameDay(d, today)
                  ? 'Hoy'
                  : `${DAYS_ES_LONG[d.getDay()].charAt(0).toUpperCase()}${DAYS_ES_LONG[d.getDay()].slice(1)}, ${d.getDate()} de ${MONTHS_ES[d.getMonth()].toLowerCase()}`
                }
              </div>
            </div>
            {evs.map(e => (
              <div key={e.id} className="agenda-event" onClick={() => onEventClick(e)}>
                <div className="agenda-color-bar" style={{ background: e.color }} />
                <div style={{ flex: 1 }}>
                  <div className="agenda-event-title">{e.title}</div>
                  <div className="agenda-event-time">
                    {e.allDay ? 'Todo el día' : `${fmt(e.start)}${e.end ? ` – ${fmt(e.end)}` : ''}`}
                  </div>
                  {e.recurrence !== 'none' && (
                    <div className="agenda-event-recur">{RECURRENCE_LABELS[e.recurrence]}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ── Calendar (main export) ────────────────────────────────────────
export default function Calendar() {
  const { project, modules } = useOutletContext()
  const [events, setEvents]         = useState([])
  const [anchor, setAnchor]         = useState(new Date())
  const [view, setView]             = useState('week')
  const [showWeekends, setWeekends] = useState(true)
  const [modal, setModal]           = useState(null)

  useEffect(() => {
    supabase
      .from('calendar_tasks')
      .select('*')
      .eq('project_id', project.id)
      .then(({ data }) => { if (data) setEvents(data.map(dbToEvent)) })
  }, [project.id])

  async function handleSave({ title, description, color, allDay, recurrence, startStr, endStr }) {
    const payload = {
      project_id:  project.id,
      title,
      description,
      color,
      all_day:     allDay,
      recurrence,
      start_time:  startStr ? new Date(startStr).toISOString() : new Date().toISOString(),
      end_time:    endStr   ? new Date(endStr).toISOString()   : null,
    }
    if (modal?.ev?.id) {
      const { error } = await supabase
        .from('calendar_tasks').update(payload).eq('id', modal.ev.id)
      if (!error) {
        setEvents(prev => prev.map(e =>
          e.id === modal.ev.id
            ? { ...e, title, description, color, allDay, recurrence,
                start: payload.start_time, end: payload.end_time }
            : e
        ))
      }
    } else {
      const { data, error } = await supabase
        .from('calendar_tasks').insert(payload).select().single()
      if (!error && data) setEvents(prev => [...prev, dbToEvent(data)])
    }
    setModal(null)
  }

  async function handleDelete(id) {
    await supabase.from('calendar_tasks').delete().eq('id', id)
    setEvents(prev => prev.filter(e => e.id !== id))
    setModal(null)
  }

  const weekDays = useMemo(() => getWeekDays(anchor), [anchor])

  function prevWeek() { const d = new Date(anchor); d.setDate(d.getDate() - 7); setAnchor(d) }
  function nextWeek() { const d = new Date(anchor); d.setDate(d.getDate() + 7); setAnchor(d) }
  function goToday()  { setAnchor(new Date()) }

  const d0 = weekDays[0], d1 = weekDays[6]
  const titleStr = d0.getMonth() === d1.getMonth()
    ? `${d0.getDate()}–${d1.getDate()} ${MONTHS_ES[d0.getMonth()]} ${d0.getFullYear()}`
    : `${d0.getDate()} ${MONTHS_ES[d0.getMonth()].slice(0,3)} – ${d1.getDate()} ${MONTHS_ES[d1.getMonth()].slice(0,3)}`

  return (
    <ModuleShell
      project={project}
      modules={modules}
      sidebarExtra={
        <>
          <div className="cal-sidebar-section-title">Navegación</div>
          <MiniCalendar anchor={anchor} events={events} onSelectDay={d => setAnchor(d)} />
          <div className="cal-sidebar-section-title" style={{ marginTop: 8 }}>Vista</div>
          <div className="cal-sidebar-toggle-row">
            <span className="cal-sidebar-toggle-label">Fines de semana</span>
            <button
              className={`cal-weekends-toggle ${showWeekends ? 'on' : ''}`}
              onClick={() => setWeekends(v => !v)}
              aria-label="Mostrar u ocultar fines de semana"
            >
              <span className="cal-weekends-thumb" />
            </button>
          </div>
        </>
      }
    >
      {/* Main calendar area */}
      <div className="cal-main-area">
        <div className="cal-header">
          <button className="cal-nav-btn" onClick={prevWeek}>‹</button>
          <button className="cal-nav-btn" onClick={nextWeek}>›</button>
          <button className="cal-today-btn" onClick={goToday}>Hoy</button>
          <span className="cal-title">{titleStr}</span>

          <div className="cal-view-tabs">
            <button className={`cal-view-tab ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>Semana</button>
            <button className={`cal-view-tab ${view === 'agenda' ? 'active' : ''}`} onClick={() => setView('agenda')}>Agenda</button>
          </div>

          <button className="cal-add-btn" onClick={() => setModal({ ev: null, slot: null })}>
            + Nueva tarea
          </button>
        </div>

        {view === 'week' && (
          <WeekView
            days={weekDays}
            events={events}
            onSlotClick={slot => setModal({ ev: null, slot })}
            onEventClick={ev  => setModal({ ev, slot: null })}
            showWeekends={showWeekends}
          />
        )}
        {view === 'agenda' && (
          <AgendaView
            days={weekDays}
            events={events}
            onEventClick={ev => setModal({ ev, slot: null })}
          />
        )}
      </div>

      {modal && (
        <EventModal
          ev={modal.ev}
          slot={modal.slot}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </ModuleShell>
  )
}
