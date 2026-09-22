import { describe, expect, it } from 'vitest'
import { mapServerErrors, toFieldName } from './serverErrors.ts'

describe('toFieldName', () => {
  it('lower-camel-cases the first character only', () => {
    expect(toFieldName('MaxCapacity')).toBe('maxCapacity')
    expect(toFieldName('Name')).toBe('name')
    expect(toFieldName('playerName')).toBe('playerName')
    expect(toFieldName('')).toBe('')
  })
})

describe('mapServerErrors', () => {
  it('maps property names to camelCase fields automatically', () => {
    const { fieldErrors, general } = mapServerErrors({
      Name: ['Name is required.'],
      MaxCapacity: ['Capacity must be at least 1.'],
    })
    expect(fieldErrors).toEqual({ name: 'Name is required.', maxCapacity: 'Capacity must be at least 1.' })
    expect(general).toBeNull()
  })

  it('joins multiple messages for one field', () => {
    const { fieldErrors } = mapServerErrors({ Name: ['Too short.', 'Too plain.'] })
    expect(fieldErrors).toEqual({ name: 'Too short. Too plain.' })
  })

  it('applies aliases before camel-casing', () => {
    const { fieldErrors } = mapServerErrors(
      { StartDateTime: ['Start time is required.'], Name: ['Name is required.'] },
      { aliases: { StartDateTime: 'startTime' } },
    )
    expect(fieldErrors).toEqual({ startTime: 'Start time is required.', name: 'Name is required.' })
  })

  it('sends names outside the known fields to general', () => {
    const { fieldErrors, general } = mapServerErrors(
      { Name: ['Name is required.'], Secret: ['Nope.'] },
      { fields: ['name'] as const },
    )
    expect(fieldErrors).toEqual({ name: 'Name is required.' })
    expect(general).toBe('Nope.')
  })

  it('treats the empty key as a general error', () => {
    const { fieldErrors, general } = mapServerErrors({ '': ['The request body is missing or malformed.'] })
    expect(fieldErrors).toEqual({})
    expect(general).toBe('The request body is missing or malformed.')
  })

  it('merges an alias and a same-named field into one message', () => {
    const { fieldErrors } = mapServerErrors(
      { EndDateTime: ['End time is required.'], endTime: ['Pick a time.'] },
      { aliases: { EndDateTime: 'endTime' } },
    )
    expect(fieldErrors).toEqual({ endTime: 'End time is required. Pick a time.' })
  })

  it('ignores entries with no messages', () => {
    const { fieldErrors, general } = mapServerErrors({ Name: [] })
    expect(fieldErrors).toEqual({})
    expect(general).toBeNull()
  })
})
