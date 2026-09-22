import { createElement, type ReactElement, type ReactNode } from 'react'
import { render, renderHook, type RenderOptions } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { EventDetail, EventSummary, Format, Game, Template } from '../api/types.ts'

interface RouterOptions {
  /** Initial URL for the MemoryRouter. */
  path?: string
  /** Route pattern to mount the element under (e.g. "/events/:id"). Defaults to "*". */
  route?: string
}

/** Wraps children in a MemoryRouter so hooks like useNavigate / useParams work in tests. */
export function routerWrapper({ path = '/', route = '*' }: RouterOptions = {}) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(Routes, null, createElement(Route, { path: route, element: children })),
    )
  }
}

export function renderWithRouter(ui: ReactElement, options: RouterOptions & RenderOptions = {}) {
  const { path, route, ...rest } = options
  return render(ui, { wrapper: routerWrapper({ path, route }), ...rest })
}

export function renderHookWithRouter<T>(hook: () => T, options: RouterOptions = {}) {
  return renderHook(hook, { wrapper: routerWrapper(options) })
}

// ---- Fixtures -------------------------------------------------------------

export const games: Game[] = [
  { id: 'game-mtg', name: 'Magic: The Gathering' },
  { id: 'game-fab', name: 'Flesh and Blood' },
]

export const formats: Format[] = [
  { id: 'fmt-edh', name: 'EDH', game: 'game-mtg' },
  { id: 'fmt-cc', name: 'Classic Constructed (CC)', game: 'game-fab' },
  { id: 'fmt-blitz', name: 'Blitz', game: 'game-fab' },
]

export const templates: Template[] = [
  {
    id: 'tpl-fab-cc',
    name: 'FAB - CC',
    game: 'game-fab',
    format: 'fmt-cc',
    defaultCapacity: 30,
    defaultDurationMinutes: 300,
  },
]

export const eventSummary: EventSummary = {
  id: 'evt-1',
  name: 'Friday Night CC',
  game: 'game-fab',
  format: 'fmt-cc',
  gameName: 'Flesh and Blood',
  formatName: 'Classic Constructed (CC)',
  startDateTime: '2026-09-25T18:00:00.000Z',
  endDateTime: '2026-09-25T23:00:00.000Z',
}

export const eventDetail: EventDetail = {
  ...eventSummary,
  maxCapacity: 30,
  description: 'Weekly tournament',
  registrationCount: 4,
  isFull: false,
  location: 'Local Game Store',
}
