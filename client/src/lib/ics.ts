import { createEvent, type DateArray } from 'ics'
import type { EventDetail } from '../api/types.ts'

function toDateArray(iso: string): DateArray {
  const d = new Date(iso)
  return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()]
}

/** Build the .ics text for an event (local time). Throws on failure. */
export function buildIcs(event: EventDetail, eventUrl: string): string {
  const { error, value } = createEvent({
    uid: `${event.id}@tabletop-game-events`,
    title: event.name,
    start: toDateArray(event.startDateTime),
    end: toDateArray(event.endDateTime),
    description: [`${event.gameName} – ${event.formatName}`, event.description]
      .filter(Boolean)
      .join('\n\n'),
    location: event.location,
    url: eventUrl,
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
  })
  if (error || !value) throw error ?? new Error('Failed to build .ics')
  return value
}

export function downloadIcs(event: EventDetail, eventUrl: string) {
  const text = buildIcs(event, eventUrl)
  const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${event.name.replace(/[^\w\- ]+/g, '').trim() || 'event'}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
