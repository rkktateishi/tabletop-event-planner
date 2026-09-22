import { useNavigate } from 'react-router-dom'
import type { EventDetail } from '../../api/types.ts'
import { eventPath } from '../../App/App.ts'

export interface CreateEventPageViewModel {
  /** Navigates to the newly created event's page. */
  handleCreated: (event: EventDetail) => void
}

export function useCreateEventPage(): CreateEventPageViewModel {
  const navigate = useNavigate()
  return {
    handleCreated: (event) => navigate(eventPath(event.id)),
  }
}
