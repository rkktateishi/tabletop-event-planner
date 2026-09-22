import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { CalendarPage } from '../pages/CalendarPage'
import { CreateEventPage } from '../pages/CreateEventPage'
import { EventPage } from '../pages/EventPage'
import { RegisterPage } from '../pages/RegisterPage'
import { routes } from './App.ts'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path={routes.calendar} element={<CalendarPage />} />
        <Route path={routes.createEvent} element={<CreateEventPage />} />
        <Route path={routes.event} element={<EventPage />} />
        <Route path={routes.register} element={<RegisterPage />} />
        <Route path="*" element={<Navigate to={routes.calendar} replace />} />
      </Route>
    </Routes>
  )
}
