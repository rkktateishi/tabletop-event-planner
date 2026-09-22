import type {
  CreateEventRequest,
  EventDetail,
  EventSummary,
  Format,
  Game,
  Registration,
  Template,
} from './types.ts'

export class ApiError extends Error {
  status: number
  /** Field-level validation errors (ASP.NET ValidationProblemDetails) */
  errors: Record<string, string[]>

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  let message = res.statusText || `Request failed (${res.status})`
  let errors: Record<string, string[]> = {}
  try {
    const body = await res.json()
    if (body && typeof body === 'object') {
      if (typeof body.detail === 'string') message = body.detail
      else if (typeof body.title === 'string') message = body.title
      else if (typeof body.message === 'string') message = body.message
      if (body.errors && typeof body.errors === 'object') errors = body.errors
    }
  } catch {
    // non-JSON body; keep the default message
  }
  return new ApiError(res.status, message, errors)
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw await toApiError(res)
  return (await res.json()) as T
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw await toApiError(res)
  return (await res.json()) as T
}

const withGame = (base: string, game?: string) =>
  game ? `${base}?game=${encodeURIComponent(game)}` : base

export const api = {
  getGames: () => getJson<Game[]>('/api/games'),
  getFormats: (game?: string) => getJson<Format[]>(withGame('/api/formats', game)),
  getTemplates: (game?: string) => getJson<Template[]>(withGame('/api/templates', game)),
  getEvents: () => getJson<EventSummary[]>('/api/events'),
  getEvent: (id: string) => getJson<EventDetail>(`/api/events/${encodeURIComponent(id)}`),
  createEvent: (req: CreateEventRequest) => postJson<EventDetail>('/api/events', req),
  registerForEvent: (id: string, playerName: string) =>
    postJson<Registration>(`/api/events/${encodeURIComponent(id)}/registrations`, { playerName }),
}
