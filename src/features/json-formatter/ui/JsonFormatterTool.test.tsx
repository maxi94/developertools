import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { JsonFormatterTool } from '@/features/json-formatter/ui/JsonFormatterTool'
import { ToastProvider } from '@/shared/ui/toast/ToastProvider'

function renderTool() {
  return render(
    <ToastProvider>
      <JsonFormatterTool />
    </ToastProvider>,
  )
}

describe('JsonFormatterTool', () => {
  it('does not toggle output minify when clicking inside output content', () => {
    renderTool()

    expect(screen.getAllByRole('button', { name: /^Minificar$/i })).toHaveLength(2)

    const token = screen.getAllByText('"definiciones"')[0]
    fireEvent.click(token)

    expect(screen.getAllByRole('button', { name: /^Minificar$/i })).toHaveLength(2)
  })
})
