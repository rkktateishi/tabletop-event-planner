export interface Game {
  id: string
  name: string
}

export interface Format {
  id: string
  name: string
  /** FK to Game */
  game: string
}

export interface Template {
  id: string
  name: string
  /** Derived through Format */
  game: string
  /** FK to Format */
  format: string
  defaultCapacity: number
  defaultDurationMinutes: number
}

export interface EventSummary {
  id: string
  name: string
  game: string
  format: string
  gameName: string
  formatName: string
  startDateTime: string
  endDateTime: string
}

export interface EventDetail extends EventSummary {
  maxCapacity: number
  description: string
  registrationCount: number
  isFull: boolean
  location: string
}

/**
 * Sent exactly as the user entered it; blanks become null. The server validates and returns
 * field errors keyed by the PascalCase property name (Name, Game, StartDateTime, …).
 */
export interface CreateEventRequest {
  name: string
  game: string | null
  format: string | null
  startDateTime: string | null
  endDateTime: string | null
  maxCapacity: number | null
  description: string
}

export interface RegisterRequest {
  playerName: string
}

export interface Registration {
  id: string
  eventId: string
  playerName: string
}
