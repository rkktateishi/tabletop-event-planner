import { useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { api, ApiError } from '../../api/client.ts'
import type { EventDetail } from '../../api/types.ts'
import { eventPath } from '../../App/App.ts'
import { formatDate, formatTimeRange } from '../../lib/dates.ts'
import { mapServerErrors } from '../../lib/serverErrors.ts'

export const EVENT_FULL_MESSAGE = 'Unfortunately this event has already been filled.'

export type RegisterStatus = 'loading' | 'error' | 'open' | 'full' | 'registered'

export interface RegisterPageViewModel {
  event: EventDetail | null
  status: RegisterStatus
  loadError: string | null
  playerName: string
  /** The server's PlayerName validation message, if any. */
  nameError: string | null
  submitError: string | null
  submitting: boolean
  /** True once a name has been entered; the Register button is disabled otherwise. */
  canSubmit: boolean
  whenLabel: string
  eventPath: string
  setPlayerName: (name: string) => void
  handleSubmit: (e: FormEvent) => Promise<void>
}

export function useRegisterPage(): RegisterPageViewModel {
  const { id = '' } = useParams()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [full, setFull] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .getEvent(id)
      .then((e) => {
        if (cancelled) return
        setEvent(e)
        setFull(e.isFull)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setLoadError(e instanceof ApiError && e.status === 404 ? 'Event not found.' : (e as Error).message)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const canSubmit = playerName.trim() !== ''

  // Presence is checked here (to enable the button); content rules and messages come from the server.
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitError(null)
    setNameError(null)
    setSubmitting(true)
    try {
      await api.registerForEvent(id, playerName)
      setRegistered(true)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // The server is the source of truth for capacity.
        setFull(true)
      } else if (err instanceof ApiError && err.status === 400) {
        const { fieldErrors, general } = mapServerErrors(err.errors, { fields: ['playerName'] })
        setNameError(fieldErrors.playerName ?? null)
        setSubmitError(general ?? (fieldErrors.playerName ? null : err.message))
      } else {
        setSubmitError((err as Error).message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const status: RegisterStatus = loadError
    ? 'error'
    : !event
      ? 'loading'
      : registered
        ? 'registered'
        : full
          ? 'full'
          : 'open'

  return {
    event,
    status,
    loadError,
    playerName,
    nameError,
    submitError,
    submitting,
    canSubmit,
    whenLabel: event ? `${formatDate(event.startDateTime)}, ${formatTimeRange(event.startDateTime, event.endDateTime)}` : '',
    eventPath: eventPath(id),
    setPlayerName,
    handleSubmit,
  }
}
