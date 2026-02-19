import { describe, expect, it } from 'vitest'
import { generateReadme } from '@/shared/lib/readme'

describe('generateReadme', () => {
  it('genera un README con secciones principales', () => {
    const result = generateReadme({
      projectName: 'Proyecto X',
      description: 'Herramienta para developers.',
      installCommand: 'npm install',
      usageCommand: 'npm run dev',
      mainFeatures: 'JSON formatter\nJWT decoder',
      license: 'MIT',
    })

    expect(result).toContain('# Proyecto X')
    expect(result).toContain('## Caracteristicas')
    expect(result).toContain('- JSON formatter')
    expect(result).toContain('## Instalacion')
    expect(result).toContain('## Uso')
  })
})
