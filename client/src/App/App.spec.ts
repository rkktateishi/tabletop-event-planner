import { describe, expect, it } from 'vitest'
import { eventPath, registerPath, routes } from './App.ts'

describe('App routes', () => {
  it('builds event and registration paths that match the route patterns', () => {
    expect(eventPath('abc')).toBe('/events/abc')
    expect(registerPath('abc')).toBe('/events/abc/register')
    expect(routes.event.replace(':id', 'abc')).toBe(eventPath('abc'))
    expect(routes.register.replace(':id', 'abc')).toBe(registerPath('abc'))
  })
})
