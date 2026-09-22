import { Alert, Button, CircularProgress, Paper, TextField, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Link as RouterLink } from 'react-router-dom'
import { EVENT_FULL_MESSAGE, useRegisterPage } from './RegisterPage.ts'
import './RegisterPage.css'

export function RegisterPage() {
  const {
    event,
    status,
    loadError,
    playerName,
    nameError,
    submitError,
    submitting,
    canSubmit,
    whenLabel,
    eventPath,
    setPlayerName,
    handleSubmit,
  } = useRegisterPage()

  if (status === 'error') return <Alert severity="error">{loadError}</Alert>
  if (status === 'loading' || !event) {
    return (
      <div className="register-page__loading">
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className="register-page">
      <Paper className="register-page__panel">
        <div className="register-page__header">
          <Typography variant="overline" color="text.secondary">
            Event registration
          </Typography>
          <Typography variant="h4" component="h1">
            {event.name}
          </Typography>
          <Typography color="text.secondary">
            {event.gameName} · {event.formatName}
          </Typography>
          <Typography color="text.secondary">{whenLabel}</Typography>
        </div>

        {status === 'registered' && (
          <Alert icon={<CheckCircleIcon />} severity="success">
            You're registered, {playerName.trim()}! See you at {event.location}.
          </Alert>
        )}
        {status === 'full' && <Alert severity="warning">{EVENT_FULL_MESSAGE}</Alert>}
        {status === 'open' && (
          <form className="register-page__form" onSubmit={handleSubmit} noValidate>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <TextField
              label="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              error={!!nameError}
              helperText={nameError}
              required
              fullWidth
              autoFocus
              slotProps={{ htmlInput: { maxLength: 255 } }}
            />
            <Button type="submit" variant="contained" size="large" disabled={!canSubmit || submitting}>
              {submitting ? 'Registering…' : 'Register'}
            </Button>
          </form>
        )}

        <Button component={RouterLink} to={eventPath} size="small">
          View event details
        </Button>
      </Paper>
    </div>
  )
}
