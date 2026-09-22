import { Button, Paper, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Link as RouterLink } from 'react-router-dom'
import { routes } from '../../App/App.ts'
import { EventForm } from '../../components/EventForm'
import { useCreateEventPage } from './CreateEventPage.ts'
import './CreateEventPage.css'

export function CreateEventPage() {
  const { handleCreated } = useCreateEventPage()

  return (
    <div className="create-event-page">
      <Button
        component={RouterLink}
        to={routes.calendar}
        startIcon={<ArrowBackIcon />}
        className="create-event-page__back"
      >
        Back to calendar
      </Button>
      <Typography variant="h4" component="h1">
        Create event
      </Typography>
      <Paper className="create-event-page__panel">
        <EventForm onCreated={handleCreated} />
      </Paper>
    </div>
  )
}
