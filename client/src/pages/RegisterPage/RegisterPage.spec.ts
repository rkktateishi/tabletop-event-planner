import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/client.ts'
import { eventDetail, renderHookWithRouter } from '../../test/utils.ts'
import { useRegisterPage } from './RegisterPage.ts'

vi.mock('../../api/client.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/client.ts')>()
  return { ...actual, api: { getEvent: vi.fn(), registerForEvent: vi.fn() } }
})

const { api } = await import('../../api/client.ts')
const mockedApi = vi.mocked(api)

const submitEvent = { preventDefault() {} } as never

const renderPage = () =>
  renderHookWithRouter(() => useRegisterPage(), { path: '/events/evt-1/register', route: '/events/:id/register' })

describe('useRegisterPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads the event and opens the form when there is room', async () => {
    mockedApi.getEvent.mockResolvedValue(eventDetail)
    const { result } = renderPage()
    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('open'))
    expect(result.current.eventPath).toBe('/events/evt-1')
    expect(result.current.whenLabel).toContain(',')
  })

  it('shows the full state when the event is already at capacity', async () => {
    mockedApi.getEvent.mockResolvedValue({ ...eventDetail, isFull: true })
    const { result } = renderPage()
    await waitFor(() => expect(result.current.status).toBe('full'))
  })

  it('reports load errors', async () => {
    mockedApi.getEvent.mockRejectedValue(new ApiError(404, 'Not Found'))
    const { result } = renderPage()
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.loadError).toBe('Event not found.')
  })

  it('disables submit until a name is entered and ignores submits while blank', async () => {
    mockedApi.getEvent.mockResolvedValue(eventDetail)
    const { result } = renderPage()
    await waitFor(() => expect(result.current.status).toBe('open'))
    expect(result.current.canSubmit).toBe(false)

    act(() => result.current.setPlayerName('   '))
    expect(result.current.canSubmit).toBe(false)
    await act(() => result.current.handleSubmit(submitEvent))
    expect(mockedApi.registerForEvent).not.toHaveBeenCalled()

    act(() => result.current.setPlayerName('Alice'))
    expect(result.current.canSubmit).toBe(true)
  })

  it('shows the server validation message for a name it rejects', async () => {
    mockedApi.getEvent.mockResolvedValue(eventDetail)
    mockedApi.registerForEvent.mockRejectedValue(
      new ApiError(400, 'One or more validation errors occurred.', {
        PlayerName: ['Name must be 255 characters or fewer.'],
      }),
    )
    const { result } = renderPage()
    await waitFor(() => expect(result.current.status).toBe('open'))

    act(() => result.current.setPlayerName('x'.repeat(300)))
    await act(() => result.current.handleSubmit(submitEvent))

    expect(mockedApi.registerForEvent).toHaveBeenCalledWith('evt-1', 'x'.repeat(300))
    expect(result.current.nameError).toBe('Name must be 255 characters or fewer.')
    expect(result.current.status).toBe('open')
  })

  it('registers the name as typed and moves to the registered state', async () => {
    mockedApi.getEvent.mockResolvedValue(eventDetail)
    mockedApi.registerForEvent.mockResolvedValue({ id: 'r1', event: 'evt-1', playerName: 'Alice' })
    const { result } = renderPage()
    await waitFor(() => expect(result.current.status).toBe('open'))

    act(() => result.current.setPlayerName('Alice'))
    await act(() => result.current.handleSubmit(submitEvent))
    expect(mockedApi.registerForEvent).toHaveBeenCalledWith('evt-1', 'Alice')
    expect(result.current.status).toBe('registered')
    expect(result.current.submitting).toBe(false)
  })

  it('clears a previous name error on resubmit', async () => {
    mockedApi.getEvent.mockResolvedValue(eventDetail)
    mockedApi.registerForEvent
      .mockRejectedValueOnce(new ApiError(400, 'Invalid', { PlayerName: ['Please enter your name.'] }))
      .mockResolvedValueOnce({ id: 'r1', event: 'evt-1', playerName: 'Bob' })
    const { result } = renderPage()
    await waitFor(() => expect(result.current.status).toBe('open'))

    act(() => result.current.setPlayerName('Bob'))
    await act(() => result.current.handleSubmit(submitEvent))
    expect(result.current.nameError).toBe('Please enter your name.')

    await act(() => result.current.handleSubmit(submitEvent))
    expect(result.current.nameError).toBeNull()
    expect(result.current.status).toBe('registered')
  })

  it('switches to the full state when the server answers 409', async () => {
    mockedApi.getEvent.mockResolvedValue(eventDetail)
    mockedApi.registerForEvent.mockRejectedValue(new ApiError(409, 'Event is full'))
    const { result } = renderPage()
    await waitFor(() => expect(result.current.status).toBe('open'))

    act(() => result.current.setPlayerName('Bob'))
    await act(() => result.current.handleSubmit(submitEvent))
    expect(result.current.status).toBe('full')
  })

  it('surfaces other server errors without leaving the form', async () => {
    mockedApi.getEvent.mockResolvedValue(eventDetail)
    mockedApi.registerForEvent.mockRejectedValue(new Error('network down'))
    const { result } = renderPage()
    await waitFor(() => expect(result.current.status).toBe('open'))

    act(() => result.current.setPlayerName('Bob'))
    await act(() => result.current.handleSubmit(submitEvent))
    expect(result.current.status).toBe('open')
    expect(result.current.submitError).toBe('network down')
  })
})
