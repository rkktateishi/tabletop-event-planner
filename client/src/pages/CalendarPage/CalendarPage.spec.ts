import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SchedulerEventEditingStartEventDetails } from '@mui/x-scheduler/models'
import { eventSummary, renderHookWithRouter } from '../../test/utils.ts'
import { toSchedulerEvents, useCalendarPage } from './CalendarPage.ts'

const navigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => navigate }
})

vi.mock('../../api/client.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/client.ts')>()
  return { ...actual, api: { getEvents: vi.fn() } }
})

const { api } = await import('../../api/client.ts')
const mockedApi = vi.mocked(api)

const details = (reason: 'view' | 'edit' | 'creation') =>
  ({ reason, cancel: vi.fn() }) as unknown as SchedulerEventEditingStartEventDetails

describe('toSchedulerEvents', () => {
  it('maps API summaries to read-only scheduler events', () => {
    expect(toSchedulerEvents([eventSummary])).toEqual([
      {
        id: 'evt-1',
        title: 'Friday Night CC',
        description: 'Flesh and Blood – Classic Constructed (CC)',
        start: eventSummary.startDateTime,
        end: eventSummary.endDateTime,
        readOnly: true,
      },
    ])
  })
})

describe('useCalendarPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads events and exposes them for the scheduler', async () => {
    mockedApi.getEvents.mockResolvedValue([eventSummary])
    const { result } = renderHookWithRouter(() => useCalendarPage())
    expect(result.current.events).toBeNull()

    await waitFor(() => expect(result.current.events).toEqual([eventSummary]))
    expect(result.current.schedulerEvents[0].title).toBe('Friday Night CC')
    expect(result.current.error).toBeNull()
  })

  it('surfaces load errors', async () => {
    mockedApi.getEvents.mockRejectedValue(new Error('boom'))
    const { result } = renderHookWithRouter(() => useCalendarPage())
    await waitFor(() => expect(result.current.error).toBe('boom'))
  })

  it('cancels the built-in dialog and navigates to the event page on click', async () => {
    mockedApi.getEvents.mockResolvedValue([])
    const { result } = renderHookWithRouter(() => useCalendarPage())
    const d = details('view')
    act(() => result.current.handleEventEditingStart({ id: 'evt-1' }, d))
    expect(d.cancel).toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith('/events/evt-1')
  })

  it('cancels creation without navigating', async () => {
    mockedApi.getEvents.mockResolvedValue([])
    const { result } = renderHookWithRouter(() => useCalendarPage())
    const d = details('creation')
    act(() => result.current.handleEventEditingStart({ id: 'draft' }, d))
    expect(d.cancel).toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })
})
