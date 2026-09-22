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
 * Only built once every required field has a value (the form disables submit until then).
 * The server still validates content and returns field errors keyed by the PascalCase
 * property name (Name, Game, StartDateTime, …).
 */
export interface CreateEventRequest {
  name: string
  game: string
  format: string
  startDateTime: string
  endDateTime: string
  maxCapacity: number
  description: string
}

export interface RegisterRequest {
  playerName: string
}

export interface Registration {
  id: string
  /** FK to Event */
  event: string
  playerName: string
}
