import { useEffect, useMemo, useState } from 'react'
import type { SchedulerEvent, SchedulerEventEditingStartEventDetails } from '@mui/x-scheduler/models'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client.ts'
import type { EventSummary } from '../../api/types.ts'
import { eventPath } from '../../App/App.ts'

export interface CalendarPageViewModel {
  /** null while loading */
  events: EventSummary[] | null
  schedulerEvents: SchedulerEvent[]
  error: string | null
  handleEventEditingStart: (
    occurrence: { id: SchedulerEvent['id'] },
    details: SchedulerEventEditingStartEventDetails,
  ) => void
}

/** Maps API events onto the shape the MUI X Scheduler expects. */
export function toSchedulerEvents(events: EventSummary[]): SchedulerEvent[] {
  return events.map((e) => ({
    id: e.id,
    title: e.name,
    description: `${e.gameName} – ${e.formatName}`,
    start: e.startDateTime,
    end: e.endDateTime,
    readOnly: true,
  }))
}

export function useCalendarPage(): CalendarPageViewModel {
  const navigate = useNavigate()
  const [events, setEvents] = useState<EventSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    api
      .getEvents()
      .then((data) => {
        if (!cancelled) setEvents(data)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const schedulerEvents = useMemo(() => toSchedulerEvents(events ?? []), [events])

  // The scheduler's built-in dialog is replaced by navigation to the event page.
  const handleEventEditingStart: CalendarPageViewModel['handleEventEditingStart'] = (occurrence, details) => {
    details.cancel()
    if (details.reason !== 'creation') navigate(eventPath(String(occurrence.id)))
  }

  return { events, schedulerEvents, error, handleEventEditingStart }
}
