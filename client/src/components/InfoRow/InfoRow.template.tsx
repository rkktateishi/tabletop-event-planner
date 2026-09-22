import { Typography } from '@mui/material'
import type { InfoRowProps } from './InfoRow.ts'
import './InfoRow.css'

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="info-row">
      <span className="info-row__icon">{icon}</span>
      <Typography variant="body2" color="text.secondary" className="info-row__label">
        {label}
      </Typography>
      <Typography>{value}</Typography>
    </div>
  )
}
