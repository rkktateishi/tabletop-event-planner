import { Alert, CircularProgress } from '@mui/material'
import { EventCalendar } from '@mui/x-scheduler/event-calendar'
import { useCalendarPage } from './CalendarPage.ts'
import './CalendarPage.css'

export function CalendarPage() {
  const { events, schedulerEvents, error, handleEventEditingStart } = useCalendarPage()

  if (error) return <Alert severity="error">Could not load events: {error}</Alert>
  if (events === null) {
    return (
      <div className="calendar-page__loading">
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className="calendar-page">
      <EventCalendar
        events={schedulerEvents}
        readOnly
        eventCreation={false}
        areEventsDraggable={false}
        areEventsResizable={false}
        defaultView="month"
        views={['day', 'week', 'month', 'agenda']}
        defaultPreferences={{ isSidePanelOpen: false }}
        onEventEditingStart={handleEventEditingStart}
        className="calendar-page__calendar"
      />
    </div>
  )
}
