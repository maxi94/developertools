import { describe, expect, it } from 'vitest'
import { applyDomTranslations } from '@/shared/i18n/dom-translation'

describe('applyDomTranslations', () => {
  it('does not corrupt already translated portuguese strings on repeated runs', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <button>Expandir todo</button>
      <button aria-label="Expandir nodo">+</button>
    `

    applyDomTranslations(root, 'pt')
    applyDomTranslations(root, 'pt')

    expect(root.textContent).toContain('Expandir tudo')
    expect(root.textContent).not.toMatch(/Expandirir+/i)
    expect(root.querySelector('button[aria-label]')?.getAttribute('aria-label')).toBe('Expandir no')
  })

  it('does not replace token fragments inside existing translated words', () => {
    const root = document.createElement('div')
    root.textContent = 'Expandir tudo'

    applyDomTranslations(root, 'pt')

    expect(root.textContent).toBe('Expandir tudo')
  })
})
