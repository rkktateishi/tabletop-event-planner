import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InfoRow } from './InfoRow.template.tsx'

describe('InfoRow', () => {
  it('renders the icon, label and value', () => {
    render(
      createElement(InfoRow, {
        icon: createElement('span', { 'data-testid': 'icon' }),
        label: 'Date',
        value: 'Friday, September 25, 2026',
      }),
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Friday, September 25, 2026')).toBeInTheDocument()
  })
})
