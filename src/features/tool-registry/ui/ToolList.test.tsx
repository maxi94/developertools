import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WEB_VERSION } from '@/features/tool-registry/model/tools'
import { ToolList } from '@/features/tool-registry/ui/ToolList'
import { I18nProvider } from '@/shared/i18n/I18nProvider'

function renderToolList() {
  return render(
    <I18nProvider>
      <ToolList />
    </I18nProvider>,
  )
}

beforeEach(() => {
  window.scrollTo = vi.fn()
  window.localStorage.clear()
  window.history.replaceState({}, '', '/')
})

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('ToolList', () => {
  it('renderiza home con version web visible', () => {
    renderToolList()

    expect(screen.getByRole('heading', { name: /panel principal/i })).toBeInTheDocument()
    expect(screen.getAllByText(new RegExp(`web ${WEB_VERSION}`, 'i')).length).toBeGreaterThan(0)
  }, 20000)

  it('permite navegar a una categoria desde el menu', () => {
    renderToolList()

    fireEvent.click(screen.getAllByRole('button', { name: /^datos$/i })[0])

    expect(screen.getAllByRole('heading', { name: /^datos$/i }).length).toBeGreaterThan(0)
    expect(window.location.pathname).toBe('/datos')
  }, 20000)

  it('filtra herramientas por termino de busqueda', async () => {
    renderToolList()

    fireEvent.change(screen.getAllByPlaceholderText(/buscar en menu/i)[0], {
      target: { value: 'zzznothing' },
    })

    await waitFor(() => {
      expect(screen.getAllByText(/no se encontraron herramientas para/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/zzznothing/i).length).toBeGreaterThan(0)
    })
  })
})
