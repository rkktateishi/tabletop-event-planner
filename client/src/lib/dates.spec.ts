import { describe, expect, it } from 'vitest'
import { addMinutes, combineDateTime, formatTimeRange, toDateInput, toTimeInput } from './dates.ts'

describe('dates', () => {
  it('formats local dates and times for form inputs with zero padding', () => {
    const d = new Date(2026, 0, 5, 9, 7)
    expect(toDateInput(d)).toBe('2026-01-05')
    expect(toTimeInput(d)).toBe('09:07')
  })

  it('combines date and time inputs into a local Date', () => {
    expect(combineDateTime('2026-09-25', '18:30')).toEqual(new Date(2026, 8, 25, 18, 30))
  })

  it('returns null for incomplete or malformed input', () => {
    expect(combineDateTime('', '18:30')).toBeNull()
    expect(combineDateTime('2026-09-25', '')).toBeNull()
    expect(combineDateTime('nope', '18:30')).toBeNull()
  })

  it('adds minutes across day boundaries', () => {
    expect(addMinutes(new Date(2026, 8, 25, 23, 0), 120)).toEqual(new Date(2026, 8, 26, 1, 0))
  })

  it('renders a time range with an en dash', () => {
    const start = new Date(2026, 8, 25, 18, 0).toISOString()
    const end = new Date(2026, 8, 25, 23, 0).toISOString()
    expect(formatTimeRange(start, end)).toMatch(/^.+ – .+$/)
  })
})
