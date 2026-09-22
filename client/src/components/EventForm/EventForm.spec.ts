import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/client.ts'
import { eventDetail, formats, games, templates } from '../../test/utils.ts'
import {
  endTimeFromTemplate,
  initialFormState,
  mapApiErrors,
  toCreateEventRequest,
  useEventForm,
  type EventFormState,
} from './EventForm.ts'

vi.mock('../../api/client.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/client.ts')>()
  return {
    ...actual,
    api: {
      getGames: vi.fn(),
      getFormats: vi.fn(),
      getTemplates: vi.fn(),
      getEvents: vi.fn(),
      getEvent: vi.fn(),
      createEvent: vi.fn(),
      registerForEvent: vi.fn(),
    },
  }
})

const { api } = await import('../../api/client.ts')
const mockedApi = vi.mocked(api)

const filledForm = (): EventFormState => ({
  name: 'Friday Night CC',
  game: 'game-fab',
  template: 'tpl-fab-cc',
  format: 'fmt-cc',
  date: '2026-09-25',
  startTime: '18:00',
  endTime: '23:00',
  maxCapacity: '30',
  description: 'Weekly tournament',
})

const submit = { preventDefault() {} } as never

describe('initialFormState', () => {
  it("defaults to today's date and an 18:00 start", () => {
    const state = initialFormState(new Date(2026, 8, 22, 9, 30))
    expect(state.date).toBe('2026-09-22')
    expect(state.startTime).toBe('18:00')
    expect(state.endTime).toBe('')
  })
})

describe('endTimeFromTemplate', () => {
  it('adds the template duration to the start time', () => {
    expect(endTimeFromTemplate('2026-09-25', '18:00', templates[0])).toBe('23:00')
  })

  it('returns null without a template or with an incomplete start', () => {
    expect(endTimeFromTemplate('2026-09-25', '18:00', undefined)).toBeNull()
    expect(endTimeFromTemplate('', '18:00', templates[0])).toBeNull()
  })
})

describe('toCreateEventRequest', () => {
  it('sends filled values with ISO timestamps and does not trim or validate', () => {
    const request = toCreateEventRequest({ ...filledForm(), name: '  Padded  ' })
    expect(request).toMatchObject({
      name: '  Padded  ',
      game: 'game-fab',
      format: 'fmt-cc',
      maxCapacity: 30,
      description: 'Weekly tournament',
    })
    expect(new Date(request.startDateTime!)).toEqual(new Date(2026, 8, 25, 18, 0))
    expect(new Date(request.endDateTime!)).toEqual(new Date(2026, 8, 25, 23, 0))
  })

  it('sends null for every blank so the server can report what is missing', () => {
    expect(toCreateEventRequest({ ...initialFormState(), date: '' })).toEqual({
      name: '',
      game: null,
      format: null,
      startDateTime: null,
      endDateTime: null,
      maxCapacity: null,
      description: '',
    })
  })

  it('passes a non-integer capacity through for the server to reject', () => {
    expect(toCreateEventRequest({ ...filledForm(), maxCapacity: '2.5' }).maxCapacity).toBe(2.5)
    expect(toCreateEventRequest({ ...filledForm(), maxCapacity: 'abc' }).maxCapacity).toBeNull()
  })
})

describe('mapApiErrors', () => {
  it('routes server property names onto form fields and joins messages', () => {
    const { fieldErrors, general } = mapApiErrors(
      { Name: ['Name is required.'], MaxCapacity: ['Capacity is required.', 'Extra.'] },
      filledForm(),
    )
    expect(fieldErrors).toEqual({ name: 'Name is required.', maxCapacity: 'Capacity is required. Extra.' })
    expect(general).toBeNull()
  })

  it('shows date-time errors on the time fields when a date is present', () => {
    const { fieldErrors } = mapApiErrors(
      { StartDateTime: ['Start time is required.'], EndDateTime: ['End time must be after start time.'] },
      filledForm(),
    )
    expect(fieldErrors).toEqual({
      startTime: 'Start time is required.',
      endTime: 'End time must be after start time.',
    })
  })

  it('shows date-time errors on the date field when the date is blank', () => {
    const { fieldErrors } = mapApiErrors(
      { StartDateTime: ['Start time is required.'], EndDateTime: ['End time is required.'] },
      { ...filledForm(), date: '' },
    )
    expect(fieldErrors).toEqual({ date: 'Start time is required. End time is required.' })
  })

  it('collects errors that do not belong to a field as general', () => {
    const { fieldErrors, general } = mapApiErrors({ '': ['The request body is malformed.'] }, filledForm())
    expect(fieldErrors).toEqual({})
    expect(general).toBe('The request body is malformed.')
  })
})

describe('useEventForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedApi.getGames.mockResolvedValue(games)
    mockedApi.getFormats.mockImplementation(async (game) => formats.filter((f) => f.game === game))
    mockedApi.getTemplates.mockImplementation(async (game) => templates.filter((t) => t.game === game))
  })

  it('loads games on mount and formats/templates for the chosen game', async () => {
    const { result } = renderHook(() => useEventForm({ onCreated: vi.fn() }))
    await waitFor(() => expect(result.current.games).toEqual(games))

    act(() => result.current.handleGameChange('game-fab'))
    await waitFor(() => expect(result.current.formats).toHaveLength(2))
    expect(mockedApi.getFormats).toHaveBeenCalledWith('game-fab')
    expect(result.current.templates).toEqual(templates)
  })

  it('clears template and format when the game changes', async () => {
    const { result } = renderHook(() => useEventForm({ onCreated: vi.fn() }))
    act(() => result.current.handleGameChange('game-fab'))
    await waitFor(() => expect(result.current.templates).toHaveLength(1))
    act(() => result.current.handleTemplateChange('tpl-fab-cc'))
    expect(result.current.form.format).toBe('fmt-cc')

    act(() => result.current.handleGameChange('game-mtg'))
    expect(result.current.form.template).toBe('')
    expect(result.current.form.format).toBe('')
  })

  it('applies template defaults and keeps end time in sync with start time', async () => {
    const { result } = renderHook(() => useEventForm({ onCreated: vi.fn() }))
    act(() => result.current.handleGameChange('game-fab'))
    await waitFor(() => expect(result.current.templates).toHaveLength(1))

    act(() => result.current.handleTemplateChange('tpl-fab-cc'))
    expect(result.current.form).toMatchObject({ format: 'fmt-cc', maxCapacity: '30', endTime: '23:00' })

    act(() => result.current.handleStartChange('12:30'))
    expect(result.current.form.endTime).toBe('17:30')
  })

  it('submits the form as entered and reports the created event', async () => {
    mockedApi.createEvent.mockResolvedValue(eventDetail)
    const onCreated = vi.fn()
    const { result } = renderHook(() => useEventForm({ onCreated }))
    act(() => result.current.handleGameChange('game-fab'))
    await waitFor(() => expect(result.current.templates).toHaveLength(1))
    act(() => {
      result.current.setField('name', 'Friday Night CC')
      result.current.handleTemplateChange('tpl-fab-cc')
    })

    await act(() => result.current.handleSubmit(submit))

    expect(mockedApi.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Friday Night CC', format: 'fmt-cc', maxCapacity: 30 }),
    )
    expect(onCreated).toHaveBeenCalledWith(eventDetail)
    expect(result.current.submitting).toBe(false)
  })

  it('submits an empty form without client-side checks and shows the server field errors', async () => {
    mockedApi.createEvent.mockRejectedValue(
      new ApiError(400, 'One or more validation errors occurred.', {
        Name: ['Name is required.'],
        Game: ['Select a game.'],
        MaxCapacity: ['Capacity is required.'],
      }),
    )
    const { result } = renderHook(() => useEventForm({ onCreated: vi.fn() }))

    await act(() => result.current.handleSubmit(submit))

    expect(mockedApi.createEvent).toHaveBeenCalledWith(expect.objectContaining({ name: '', game: null }))
    expect(result.current.fieldErrors).toEqual({
      name: 'Name is required.',
      game: 'Select a game.',
      maxCapacity: 'Capacity is required.',
    })
    expect(result.current.submitError).toBeNull()
  })

  it('shows a general error when the 400 has no field errors', async () => {
    mockedApi.createEvent.mockRejectedValue(new ApiError(400, 'Bad request', {}))
    const { result } = renderHook(() => useEventForm({ onCreated: vi.fn() }))
    await act(() => result.current.handleSubmit(submit))
    expect(result.current.submitError).toBe('Bad request')
  })

  it('surfaces non-validation failures as a general error', async () => {
    mockedApi.createEvent.mockRejectedValue(new Error('network down'))
    const { result } = renderHook(() => useEventForm({ onCreated: vi.fn() }))
    await act(() => result.current.handleSubmit(submit))
    expect(result.current.submitError).toBe('network down')
    expect(result.current.fieldErrors).toEqual({})
  })

  it('clears previous field errors when resubmitting', async () => {
    mockedApi.createEvent.mockRejectedValueOnce(new ApiError(400, 'Invalid', { Name: ['Name is required.'] }))
    mockedApi.createEvent.mockResolvedValueOnce(eventDetail)
    const { result } = renderHook(() => useEventForm({ onCreated: vi.fn() }))

    await act(() => result.current.handleSubmit(submit))
    expect(result.current.fieldErrors.name).toBe('Name is required.')

    await act(() => result.current.handleSubmit(submit))
    expect(result.current.fieldErrors).toEqual({})
  })
})
