import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/client.ts'
import { eventDetail, formats, games, templates } from '../../test/utils.ts'
import {
  endTimeFromTemplate,
  initialFormState,
  isFormComplete,
  mapApiErrors,
  REQUIRED_FIELDS,
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

describe('isFormComplete', () => {
  it('is true when every required field has a value', () => {
    expect(isFormComplete(filledForm())).toBe(true)
  })

  it('does not require template or description', () => {
    expect(isFormComplete({ ...filledForm(), template: '', description: '' })).toBe(true)
  })

  it.each(REQUIRED_FIELDS)('is false when %s is blank', (field) => {
    expect(isFormComplete({ ...filledForm(), [field]: '' })).toBe(false)
    expect(isFormComplete({ ...filledForm(), [field]: '   ' })).toBe(false)
  })

  it('is false for the initial form', () => {
    expect(isFormComplete(initialFormState())).toBe(false)
  })
})

describe('toCreateEventRequest', () => {
  it('builds a strict request from a complete form without trimming or validating content', () => {
    const request = toCreateEventRequest({ ...filledForm(), name: '  Padded  ' })
    expect(request).not.toBeNull()
    expect(request).toMatchObject({
      name: '  Padded  ',
      game: 'game-fab',
      format: 'fmt-cc',
      maxCapacity: 30,
      description: 'Weekly tournament',
    })
    expect(new Date(request!.startDateTime)).toEqual(new Date(2026, 8, 25, 18, 0))
    expect(new Date(request!.endDateTime)).toEqual(new Date(2026, 8, 25, 23, 0))
  })

  it('returns null while a required field is blank', () => {
    expect(toCreateEventRequest(initialFormState())).toBeNull()
    expect(toCreateEventRequest({ ...filledForm(), maxCapacity: '' })).toBeNull()
  })

  it('passes a non-integer capacity through for the server to reject', () => {
    expect(toCreateEventRequest({ ...filledForm(), maxCapacity: '2.5' })?.maxCapacity).toBe(2.5)
  })
})

describe('mapApiErrors', () => {
  it('routes server property names onto form fields and joins messages', () => {
    const { fieldErrors, general } = mapApiErrors({
      Name: ['Name is required.'],
      MaxCapacity: ['Capacity is required.', 'Extra.'],
      EndDateTime: ['End time must be after start time.'],
    })
    expect(fieldErrors).toEqual({
      name: 'Name is required.',
      maxCapacity: 'Capacity is required. Extra.',
      endTime: 'End time must be after start time.',
    })
    expect(general).toBeNull()
  })

  it('collects errors that do not belong to a field as general', () => {
    const { fieldErrors, general } = mapApiErrors({ '': ['The request body is malformed.'] })
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

  /** Drives the hook to a complete form via a game + template selection and a name. */
  async function fillViaTemplate(result: { current: ReturnType<typeof useEventForm> }) {
    act(() => result.current.handleGameChange('game-fab'))
    await waitFor(() => expect(result.current.templates).toHaveLength(1))
    act(() => {
      result.current.setField('name', 'Friday Night CC')
      result.current.handleTemplateChange('tpl-fab-cc')
    })
  }

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

  it('disables submit until every required field is filled', async () => {
    const { result } = renderHook(() => useEventForm({ onCreated: vi.fn() }))
    expect(result.current.canSubmit).toBe(false)

    await fillViaTemplate(result)
    expect(result.current.canSubmit).toBe(true)

    act(() => result.current.setField('name', '   '))
    expect(result.current.canSubmit).toBe(false)
  })

  it('ignores a submit while the form is incomplete', async () => {
    const { result } = renderHook(() => useEventForm({ onCreated: vi.fn() }))
    await act(() => result.current.handleSubmit(submit))
    expect(mockedApi.createEvent).not.toHaveBeenCalled()
    expect(result.current.fieldErrors).toEqual({})
  })

  it('submits a complete form and reports the created event', async () => {
    mockedApi.createEvent.mockResolvedValue(eventDetail)
    const onCreated = vi.fn()
    const { result } = renderHook(() => useEventForm({ onCreated }))
    await fillViaTemplate(result)

    await act(() => result.current.handleSubmit(submit))

    expect(mockedApi.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Friday Night CC', format: 'fmt-cc', maxCapacity: 30 }),
    )
    expect(onCreated).toHaveBeenCalledWith(eventDetail)
    expect(result.current.submitting).toBe(false)
  })

  it('shows server field errors for a complete but invalid form', async () => {
    mockedApi.createEvent.mockRejectedValue(
      new ApiError(400, 'One or more validation errors occurred.', {
        EndDateTime: ['End time must be after start time.'],
        Format: ['Format does not belong to the selected game.'],
      }),
    )
    const { result } = renderHook(() => useEventForm({ onCreated: vi.fn() }))
    await fillViaTemplate(result)

    await act(() => result.current.handleSubmit(submit))

    expect(result.current.fieldErrors).toEqual({
      endTime: 'End time must be after start time.',
      format: 'Format does not belong to the selected game.',
    })
    expect(result.current.submitError).toBeNull()
  })

  it('shows a general error when the 400 has no field errors', async () => {
    mockedApi.createEvent.mockRejectedValue(new ApiError(400, 'Bad request', {}))
    const { result } = renderHook(() => useEventForm({ onCreated: vi.fn() }))
    await fillViaTemplate(result)
    await act(() => result.current.handleSubmit(submit))
    expect(result.current.submitError).toBe('Bad request')
  })

  it('surfaces non-validation failures as a general error', async () => {
    mockedApi.createEvent.mockRejectedValue(new Error('network down'))
    const { result } = renderHook(() => useEventForm({ onCreated: vi.fn() }))
    await fillViaTemplate(result)
    await act(() => result.current.handleSubmit(submit))
    expect(result.current.submitError).toBe('network down')
    expect(result.current.fieldErrors).toEqual({})
  })

  it('clears previous field errors when resubmitting', async () => {
    mockedApi.createEvent.mockRejectedValueOnce(new ApiError(400, 'Invalid', { Name: ['Name is required.'] }))
    mockedApi.createEvent.mockResolvedValueOnce(eventDetail)
    const { result } = renderHook(() => useEventForm({ onCreated: vi.fn() }))
    await fillViaTemplate(result)

    await act(() => result.current.handleSubmit(submit))
    expect(result.current.fieldErrors.name).toBe('Name is required.')

    await act(() => result.current.handleSubmit(submit))
    expect(result.current.fieldErrors).toEqual({})
  })
})
