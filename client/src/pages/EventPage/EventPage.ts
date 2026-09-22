import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, ApiError } from '../../api/client.ts'
import type { EventDetail } from '../../api/types.ts'
import { eventPath, registerPath } from '../../App/App.ts'
import { formatDate, formatTimeRange } from '../../lib/dates.ts'
import { downloadIcs } from '../../lib/ics.ts'

export interface EventPageViewModel {
  /** null while loading or on error */
  event: EventDetail | null
  error: string | null
  icsError: string | null
  /** Derived display values; empty until the event has loaded. */
  dateLabel: string
  timeLabel: string
  playersLabel: string
  spotsLeft: number
  registerPath: string
  registerUrl: string
  eventUrl: string
  handleDownload: () => void
}

export const NOT_FOUND_MESSAGE = 'Event not found.'

export function describeLoadError(e: unknown): string {
  if (e instanceof ApiError && e.status === 404) return NOT_FOUND_MESSAGE
  return (e as Error).message
}

export function useEventPage(origin: string = window.location.origin): EventPageViewModel {
  const { id = '' } = useParams()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [icsError, setIcsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setEvent(null)
    setError(null)
    api
      .getEvent(id)
      .then((e) => {
        if (!cancelled) setEvent(e)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(describeLoadError(e))
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const register = registerPath(id)
  const eventUrl = `${origin}${eventPath(id)}`
  const registerUrl = `${origin}${register}`

  const handleDownload = () => {
    if (!event) return
    setIcsError(null)
    try {
      downloadIcs(event, eventUrl)
    } catch (e) {
      setIcsError((e as Error).message)
    }
  }

  return {
    event,
    error,
    icsError,
    dateLabel: event ? formatDate(event.startDateTime) : '',
    timeLabel: event ? formatTimeRange(event.startDateTime, event.endDateTime) : '',
    playersLabel: event ? `${event.registrationCount} / ${event.maxCapacity} registered` : '',
    spotsLeft: event ? Math.max(event.maxCapacity - event.registrationCount, 0) : 0,
    registerPath: register,
    registerUrl,
    eventUrl,
    handleDownload,
  }
}
