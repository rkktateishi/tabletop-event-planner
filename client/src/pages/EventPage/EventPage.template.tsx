import { Alert, Button, Chip, CircularProgress, Divider, Grid, Link, Paper, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DownloadIcon from '@mui/icons-material/Download'
import EventIcon from '@mui/icons-material/Event'
import GroupIcon from '@mui/icons-material/Group'
import PlaceIcon from '@mui/icons-material/Place'
import ScheduleIcon from '@mui/icons-material/Schedule'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import { QRCodeSVG } from 'qrcode.react'
import { Link as RouterLink } from 'react-router-dom'
import { routes } from '../../App/App.ts'
import { InfoRow } from '../../components/InfoRow'
import { useEventPage } from './EventPage.ts'
import './EventPage.css'

export function EventPage() {
  const {
    event,
    error,
    icsError,
    dateLabel,
    timeLabel,
    playersLabel,
    spotsLeft,
    registerPath,
    registerUrl,
    handleDownload,
  } = useEventPage()

  if (error) {
    return (
      <div className="event-page">
        <Alert severity="error">{error}</Alert>
        <Button component={RouterLink} to={routes.calendar} startIcon={<ArrowBackIcon />}>
          Back to calendar
        </Button>
      </div>
    )
  }
  if (!event) {
    return (
      <div className="event-page__loading">
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className="event-page">
      <Button
        component={RouterLink}
        to={routes.calendar}
        startIcon={<ArrowBackIcon />}
        className="event-page__back"
      >
        Back to calendar
      </Button>

      <Paper className="event-page__panel">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <div className="event-page__details">
              <div>
                <Typography variant="h3" component="h1" gutterBottom>
                  {event.name}
                </Typography>
                <div className="event-page__chips">
                  <Chip label={event.gameName} color="primary" />
                  <Chip label={event.formatName} variant="outlined" />
                  {event.isFull ? (
                    <Chip label="Full" color="error" />
                  ) : (
                    <Chip label={`${spotsLeft} spots left`} color="success" variant="outlined" />
                  )}
                </div>
              </div>

              <Divider />

              <div className="event-page__info">
                <InfoRow icon={<EventIcon />} label="Date" value={dateLabel} />
                <InfoRow icon={<ScheduleIcon />} label="Time" value={timeLabel} />
                <InfoRow icon={<PlaceIcon />} label="Location" value={event.location} />
                <InfoRow icon={<GroupIcon />} label="Players" value={playersLabel} />
              </div>

              {event.description && (
                <>
                  <Divider />
                  <div>
                    <Typography variant="h6" gutterBottom>
                      About this event
                    </Typography>
                    <Typography className="event-page__description">{event.description}</Typography>
                  </div>
                </>
              )}

              <Divider />

              <div className="event-page__actions">
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownload}>
                  Download .ics
                </Button>
                <Button
                  component={RouterLink}
                  to={registerPath}
                  variant="outlined"
                  startIcon={<HowToRegIcon />}
                >
                  Register
                </Button>
              </div>
              {icsError && <Alert severity="error">Could not build calendar file: {icsError}</Alert>}
            </div>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" className="event-page__qr" sx={{ bgcolor: 'background.default' }}>
              <Typography variant="subtitle1" className="event-page__qr-title">
                Scan to register
              </Typography>
              <div className="event-page__qr-code">
                <QRCodeSVG value={registerUrl} size={200} level="M" />
              </div>
              <Link component={RouterLink} to={registerPath} variant="body2" className="event-page__qr-link">
                {registerUrl}
              </Link>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </div>
  )
}
