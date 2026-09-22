import {
  Alert,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import { useEventForm, type EventFormProps } from './EventForm.ts'
import './EventForm.css'

export function EventForm(props: EventFormProps) {
  const {
    form,
    games,
    formats,
    templates,
    fieldErrors,
    loadError,
    submitError,
    submitting,
    canSubmit,
    setField,
    handleGameChange,
    handleTemplateChange,
    handleStartChange,
    handleSubmit,
  } = useEventForm(props)

  return (
    <form className="event-form" onSubmit={handleSubmit} noValidate>
      {loadError && (
        <Alert severity="error" className="event-form__alert">
          Could not load reference data: {loadError}
        </Alert>
      )}
      {submitError && (
        <Alert severity="error" className="event-form__alert">
          {submitError}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            label="Event name"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            error={!!fieldErrors.name}
            helperText={fieldErrors.name}
            required
            fullWidth
            autoFocus
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth required error={!!fieldErrors.game}>
            <InputLabel id="game-label">Game</InputLabel>
            <Select
              labelId="game-label"
              label="Game"
              value={form.game}
              onChange={(e) => handleGameChange(e.target.value)}
            >
              {games.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.name}
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.game && <FormHelperText>{fieldErrors.game}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth disabled={!form.game}>
            <InputLabel id="template-label">Template</InputLabel>
            <Select
              labelId="template-label"
              label="Template"
              value={form.template}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {templates.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Fills format, capacity and duration</FormHelperText>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth required disabled={!form.game} error={!!fieldErrors.format}>
            <InputLabel id="format-label">Format</InputLabel>
            <Select
              labelId="format-label"
              label="Format"
              value={form.format}
              onChange={(e) => setField('format', e.target.value)}
            >
              {formats.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {f.name}
                </MenuItem>
              ))}
            </Select>
            {fieldErrors.format && <FormHelperText>{fieldErrors.format}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setField('date', e.target.value)}
            error={!!fieldErrors.date}
            helperText={fieldErrors.date}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <TextField
            label="Start time"
            type="time"
            value={form.startTime}
            onChange={(e) => handleStartChange(e.target.value)}
            error={!!fieldErrors.startTime}
            helperText={fieldErrors.startTime}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4 }}>
          <TextField
            label="End time"
            type="time"
            value={form.endTime}
            onChange={(e) => setField('endTime', e.target.value)}
            error={!!fieldErrors.endTime}
            helperText={fieldErrors.endTime}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="Player capacity"
            type="number"
            value={form.maxCapacity}
            onChange={(e) => setField('maxCapacity', e.target.value)}
            error={!!fieldErrors.maxCapacity}
            helperText={fieldErrors.maxCapacity}
            required
            fullWidth
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
          />
        </Grid>

        <Grid size={12}>
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            error={!!fieldErrors.description}
            helperText={fieldErrors.description}
            fullWidth
            multiline
            minRows={4}
          />
        </Grid>

        <Grid size={12} className="event-form__actions">
          <Button type="submit" variant="contained" size="large" disabled={!canSubmit || submitting}>
            {submitting ? 'Creating…' : 'Create event'}
          </Button>
        </Grid>
      </Grid>
    </form>
  )
}
