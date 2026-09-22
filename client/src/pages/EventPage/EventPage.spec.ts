import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/client.ts'
import { eventDetail, renderHookWithRouter } from '../../test/utils.ts'
import { describeLoadError, NOT_FOUND_MESSAGE, useEventPage } from './EventPage.ts'

vi.mock('../../api/client.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/client.ts')>()
  return { ...actual, api: { getEvent: vi.fn() } }
})
vi.mock('../../lib/ics.ts', () => ({ downloadIcs: vi.fn() }))

const { api } = await import('../../api/client.ts')
const { downloadIcs } = await import('../../lib/ics.ts')
const mockedApi = vi.mocked(api)
const mockedDownload = vi.mocked(downloadIcs)

const renderPage = () =>
  renderHookWithRouter(() => useEventPage('https://example.test'), {
    path: '/events/evt-1',
    route: '/events/:id',
  })

describe('describeLoadError', () => {
  it('maps 404s to a friendly message and passes other messages through', () => {
    expect(describeLoadError(new ApiError(404, 'Not Found'))).toBe(NOT_FOUND_MESSAGE)
    expect(describeLoadError(new Error('boom'))).toBe('boom')
  })
})

describe('useEventPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads the event from the route id and derives display values', async () => {
    mockedApi.getEvent.mockResolvedValue(eventDetail)
    const { result } = renderPage()
    expect(result.current.event).toBeNull()

    await waitFor(() => expect(result.current.event).toEqual(eventDetail))
    expect(mockedApi.getEvent).toHaveBeenCalledWith('evt-1')
    expect(result.current.spotsLeft).toBe(26)
    expect(result.current.playersLabel).toBe('4 / 30 registered')
    expect(result.current.dateLabel).not.toBe('')
    expect(result.current.registerPath).toBe('/events/evt-1/register')
    expect(result.current.registerUrl).toBe('https://example.test/events/evt-1/register')
    expect(result.current.eventUrl).toBe('https://example.test/events/evt-1')
  })

  it('never reports negative spots left', async () => {
    mockedApi.getEvent.mockResolvedValue({ ...eventDetail, registrationCount: 40 })
    const { result } = renderPage()
    await waitFor(() => expect(result.current.event).not.toBeNull())
    expect(result.current.spotsLeft).toBe(0)
  })

  it('reports a not-found error for 404 responses', async () => {
    mockedApi.getEvent.mockRejectedValue(new ApiError(404, 'Not Found'))
    const { result } = renderPage()
    await waitFor(() => expect(result.current.error).toBe(NOT_FOUND_MESSAGE))
  })

  it('downloads the .ics for the loaded event and captures failures', async () => {
    mockedApi.getEvent.mockResolvedValue(eventDetail)
    const { result } = renderPage()
    await waitFor(() => expect(result.current.event).not.toBeNull())

    act(() => result.current.handleDownload())
    expect(mockedDownload).toHaveBeenCalledWith(eventDetail, 'https://example.test/events/evt-1')
    expect(result.current.icsError).toBeNull()

    mockedDownload.mockImplementationOnce(() => {
      throw new Error('bad ics')
    })
    act(() => result.current.handleDownload())
    expect(result.current.icsError).toBe('bad ics')
  })
})
