import { createElement } from 'react'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderHookWithRouter, renderWithRouter } from '../../test/utils.ts'
import { useLayout } from './Layout.ts'
import { Layout } from './Layout.template.tsx'

describe('useLayout', () => {
  it('shows the create button on the calendar route', () => {
    const { result } = renderHookWithRouter(() => useLayout(), { path: '/' })
    expect(result.current.showCreateButton).toBe(true)
  })

  it('hides the create button on other routes', () => {
    const { result } = renderHookWithRouter(() => useLayout(), { path: '/events/new' })
    expect(result.current.showCreateButton).toBe(false)
  })
})

describe('Layout', () => {
  it('renders the title linking home and the Create Event link on the calendar', () => {
    renderWithRouter(createElement(Layout), { path: '/' })
    expect(screen.getByRole('link', { name: 'Tabletop Game Events' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /create event/i })).toHaveAttribute('href', '/events/new')
  })

  it('omits the Create Event link away from the calendar', () => {
    renderWithRouter(createElement(Layout), { path: '/events/new' })
    expect(screen.queryByRole('link', { name: /create event/i })).not.toBeInTheDocument()
  })
})
