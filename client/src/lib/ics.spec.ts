import { describe, expect, it } from 'vitest'
import { eventDetail } from '../test/utils.ts'
import { buildIcs } from './ics.ts'

describe('buildIcs', () => {
  it('produces a VCALENDAR with the event name, times, location and link', () => {
    const ics = buildIcs(eventDetail, 'https://example.test/events/evt-1')
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('SUMMARY:Friday Night CC')
    expect(ics).toContain('LOCATION:Local Game Store')
    expect(ics).toContain('URL:https://example.test/events/evt-1')
    expect(ics).toContain('UID:evt-1@tabletop-game-events')
    expect(ics).toMatch(/DTSTART:\d{8}T\d{6}Z/)
    expect(ics).toMatch(/DTEND:\d{8}T\d{6}Z/)
  })

  it('includes the game/format line and the description', () => {
    const ics = buildIcs(eventDetail, 'https://example.test/events/evt-1')
    expect(ics).toContain('Flesh and Blood – Classic Constructed (CC)')
    expect(ics).toContain('Weekly tournament')
  })
})
