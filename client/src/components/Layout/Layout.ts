import { useLocation } from 'react-router-dom'
import { routes } from '../../App/App.ts'

export interface LayoutViewModel {
  /** True when the calendar (home) route is active; controls the Create Event button. */
  showCreateButton: boolean
}

export function useLayout(): LayoutViewModel {
  const { pathname } = useLocation()
  return { showCreateButton: pathname === routes.calendar }
}
