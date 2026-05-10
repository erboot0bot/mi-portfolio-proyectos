import { isToday } from 'date-fns'
import { demoRead } from './index.js'

const APP_SOURCES = [
  { appType: 'hogar',    label: 'HOGAR',    color: '#f97316' },
  { appType: 'mascotas', label: 'MASCOTAS', color: '#a855f7' },
]

export function getDemoTodayItems() {
  const items = []

  for (const { appType, label, color } of APP_SOURCES) {
    const events = demoRead(appType, 'events')
    for (const ev of events) {
      if (isToday(new Date(ev.start_time))) {
        items.push({
          id:       ev.id,
          time:     ev.start_time,
          title:    ev.title,
          appLabel: label,
          appColor: color,
          allDay:   ev.all_day ?? false,
        })
      }
    }
  }

  // Tareas pending de personal con due_date hoy
  const tasks = demoRead('personal', 'personal_tasks')
  for (const t of tasks) {
    if (t.status === 'done') continue
    if (!t.due_date) continue
    if (isToday(new Date(t.due_date + 'T12:00:00'))) {
      items.push({
        id:       t.id,
        time:     t.due_date + 'T09:00:00',
        title:    t.title,
        appLabel: 'PERSONAL',
        appColor: '#38bdf8',
        allDay:   true,
      })
    }
  }

  return items.sort((a, b) => new Date(a.time) - new Date(b.time))
}

export function getActiveItem(items) {
  const now = new Date()
  return items.find(item => {
    if (item.allDay) return false
    const diffMin = (now - new Date(item.time)) / (1000 * 60)
    return diffMin >= 0 && diffMin < 120
  }) ?? null
}
