import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ToolCard } from '@/features/tool-registry/ui/ToolCard'
import type { ToolDefinition } from '@/shared/types/tool'

const baseTool: ToolDefinition = {
  id: 'json-formatter',
  name: 'Formateador JSON',
  description: 'Formatea y valida JSON localmente en tu navegador.',
  category: 'Formateadores',
  status: 'ready',
  version: '1.5.0',
}

describe('ToolCard', () => {
  it('selecciona la tool con click y teclado', () => {
    const onSelect = vi.fn()
    const onToggleFavorite = vi.fn()

    render(
      <ToolCard
        tool={baseTool}
        isActive={false}
        isFavorite={false}
        onSelect={onSelect}
        onToggleFavorite={onToggleFavorite}
      />,
    )

    const trigger = screen.getByRole('button', { name: /formateador json/i })
    fireEvent.click(trigger)
    fireEvent.keyDown(trigger, { key: 'Enter' })
    fireEvent.keyDown(trigger, { key: ' ' })

    expect(onSelect).toHaveBeenCalledTimes(3)
    expect(onSelect).toHaveBeenNthCalledWith(1, 'json-formatter')
  })

  it('togglea favorito sin disparar seleccion', () => {
    const onSelect = vi.fn()
    const onToggleFavorite = vi.fn()

    render(
      <ToolCard
        tool={baseTool}
        isActive={false}
        isFavorite={false}
        onSelect={onSelect}
        onToggleFavorite={onToggleFavorite}
      />,
    )

    fireEvent.click(screen.getAllByRole('button', { name: /agregar a favoritos/i })[0])

    expect(onToggleFavorite).toHaveBeenCalledTimes(1)
    expect(onToggleFavorite).toHaveBeenCalledWith('json-formatter')
    expect(onSelect).not.toHaveBeenCalled()
  })
})
