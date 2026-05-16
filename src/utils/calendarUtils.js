import { demoRead, demoWrite } from '../data/demo/index.js'

const COLOR_BY_TYPE = {
  shopping_trip:        '#10b981',
  roomba:               '#8b5cf6',
  cleaner_visit:        '#3b82f6',
  vehicle_maintenance:  '#f59e0b',
  match:                '#ef4444',
  ocio_event:           '#ec4899',
  travel_checkin:       '#3b82f6',
  travel_checkout:      '#f97316',
  subscription_renewal: '#8b5cf6',
  insurance_expiry:     '#ef4444',
}

export function addCalendarEvent(appType, event) {
  const all = demoRead(appType, 'events') ?? []
  const newEvent = {
    recurrence: 'none',
    all_day: false,
    color: COLOR_BY_TYPE[event.event_type] ?? '#f97316',
    ...event,
    id: crypto.randomUUID(),
    app_id: `demo-${appType}`,
    created_at: new Date().toISOString(),
  }
  demoWrite(appType, 'events', [...all, newEvent])
  return newEvent
}

export function removeCalendarEvent(appType, id) {
  const all = demoRead(appType, 'events') ?? []
  demoWrite(appType, 'events', all.filter(e => e.id !== id))
}
