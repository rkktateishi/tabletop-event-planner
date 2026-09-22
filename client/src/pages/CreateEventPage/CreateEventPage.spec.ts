import { describe, expect, it, vi } from 'vitest'
import { eventDetail, renderHookWithRouter } from '../../test/utils.ts'
import { useCreateEventPage } from './CreateEventPage.ts'

const navigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => navigate }
})

describe('useCreateEventPage', () => {
  it('navigates to the new event page after creation', () => {
    const { result } = renderHookWithRouter(() => useCreateEventPage(), { path: '/events/new' })
    result.current.handleCreated(eventDetail)
    expect(navigate).toHaveBeenCalledWith('/events/evt-1')
  })
})
