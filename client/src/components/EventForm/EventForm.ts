import { useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../api/client.ts'
import type { CreateEventRequest, EventDetail, Format, Game, Template } from '../../api/types.ts'
import { addMinutes, combineDateTime, toDateInput, toTimeInput } from '../../lib/dates.ts'

export interface EventFormProps {
  onCreated: (event: EventDetail) => void
}

export interface EventFormState {
  name: string
  game: string
  template: string
  format: string
  date: string
  startTime: string
  endTime: string
  maxCapacity: string
  description: string
}

export type EventFormErrors = Partial<Record<keyof EventFormState, string>>

export interface EventFormViewModel {
  form: EventFormState
  games: Game[]
  formats: Format[]
  templates: Template[]
  /** Field errors as returned by the server, routed to form fields. */
  fieldErrors: EventFormErrors
  loadError: string | null
  submitError: string | null
  submitting: boolean
  setField: <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => void
  handleGameChange: (game: string) => void
  handleTemplateChange: (templateId: string) => void
  handleStartChange: (startTime: string) => void
  handleSubmit: (e: FormEvent) => Promise<void>
}

export const DEFAULT_START_TIME = '18:00'

export const initialFormState = (today: Date = new Date()): EventFormState => ({
  name: '',
  game: '',
  template: '',
  format: '',
  date: toDateInput(today),
  startTime: DEFAULT_START_TIME,
  endTime: '',
  maxCapacity: '',
  description: '',
})

/** End time (HH:mm) derived from the start time plus the template's default duration. */
export function endTimeFromTemplate(date: string, startTime: string, template?: Template): string | null {
  if (!template) return null
  const start = combineDateTime(date, startTime)
  return start ? toTimeInput(addMinutes(start, template.defaultDurationMinutes)) : null
}

/**
 * Converts the form into the API request without validating it: blanks become null so the
 * server can report exactly which fields are missing.
 */
export function toCreateEventRequest(form: EventFormState): CreateEventRequest {
  const capacity = form.maxCapacity.trim() === '' ? null : Number(form.maxCapacity)
  return {
    name: form.name,
    game: form.game || null,
    format: form.format || null,
    startDateTime: combineDateTime(form.date, form.startTime)?.toISOString() ?? null,
    endDateTime: combineDateTime(form.date, form.endTime)?.toISOString() ?? null,
    maxCapacity: capacity !== null && Number.isFinite(capacity) ? capacity : null,
    description: form.description,
  }
}

/** Server property name → form field. Date/time errors are routed in mapApiErrors. */
const SERVER_FIELD_TO_FORM: Record<string, keyof EventFormState> = {
  Name: 'name',
  Game: 'game',
  Format: 'format',
  StartDateTime: 'startTime',
  EndDateTime: 'endTime',
  MaxCapacity: 'maxCapacity',
  Description: 'description',
}

export interface MappedApiErrors {
  fieldErrors: EventFormErrors
  /** Errors that do not belong to a single field (e.g. a malformed body). */
  general: string | null
}

/**
 * Routes server validation errors onto form fields. The server validates the combined
 * StartDateTime / EndDateTime; when the date input is blank those errors are shown on the date field.
 */
export function mapApiErrors(errors: Record<string, string[]>, form: EventFormState): MappedApiErrors {
  const fieldErrors: EventFormErrors = {}
  const general: string[] = []

  for (const [key, messages] of Object.entries(errors)) {
    const message = messages.join(' ')
    let field = SERVER_FIELD_TO_FORM[key]
    if ((key === 'StartDateTime' || key === 'EndDateTime') && !form.date) field = 'date'
    if (!field) {
      general.push(message)
      continue
    }
    fieldErrors[field] = fieldErrors[field] ? `${fieldErrors[field]} ${message}` : message
  }

  return { fieldErrors, general: general.length ? general.join(' ') : null }
}

export function useEventForm({ onCreated }: EventFormProps): EventFormViewModel {
  const [form, setForm] = useState<EventFormState>(initialFormState)
  const [games, setGames] = useState<Game[]>([])
  const [formats, setFormats] = useState<Format[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<EventFormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.getGames().then(setGames).catch((e: Error) => setLoadError(e.message))
  }, [])

  // Reload formats + templates when the game changes.
  useEffect(() => {
    if (!form.game) {
      setFormats([])
      setTemplates([])
      return
    }
    let cancelled = false
    Promise.all([api.getFormats(form.game), api.getTemplates(form.game)])
      .then(([f, t]) => {
        if (cancelled) return
        setFormats(f)
        setTemplates(t)
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [form.game])

  const selectedTemplate = templates.find((t) => t.id === form.template)

  const setField: EventFormViewModel['setField'] = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleGameChange = (game: string) =>
    setForm((prev) => ({ ...prev, game, template: '', format: '' }))

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    setForm((prev) => ({
      ...prev,
      template: templateId,
      format: template ? template.format : prev.format,
      maxCapacity: template ? String(template.defaultCapacity) : prev.maxCapacity,
      endTime: endTimeFromTemplate(prev.date, prev.startTime, template) ?? prev.endTime,
    }))
  }

  const handleStartChange = (startTime: string) =>
    setForm((prev) => ({
      ...prev,
      startTime,
      endTime: endTimeFromTemplate(prev.date, startTime, selectedTemplate) ?? prev.endTime,
    }))

  // No client-side validation: always submit and let the server decide.
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setFieldErrors({})
    setSubmitting(true)
    try {
      onCreated(await api.createEvent(toCreateEventRequest(form)))
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        const mapped = mapApiErrors(err.errors, form)
        setFieldErrors(mapped.fieldErrors)
        setSubmitError(mapped.general ?? (Object.keys(mapped.fieldErrors).length ? null : err.message))
      } else {
        setSubmitError((err as Error).message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return {
    form,
    games,
    formats,
    templates,
    fieldErrors,
    loadError,
    submitError,
    submitting,
    setField,
    handleGameChange,
    handleTemplateChange,
    handleStartChange,
    handleSubmit,
  }
}
