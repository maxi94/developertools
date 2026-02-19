import { describe, expect, it } from 'vitest'
import { generateReadme, type ReadmeInput } from '@/shared/lib/readme'

const baseInput: ReadmeInput = {
  projectName: 'Proyecto X',
  tagline: 'Tagline',
  description: 'Herramienta para developers.',
  badges: '![CI](https://img.shields.io/badge/ci-pass-success)',
  logoUrl: 'https://example.com/logo.png',
  demoUrl: 'https://demo.example.com',
  docsUrl: 'https://docs.example.com',
  repositoryUrl: 'https://github.com/example/repo',
  prerequisites: 'Node.js >= 20',
  techStack: 'React\nTypeScript',
  installCommand: 'npm install',
  usageCommand: 'npm run dev',
  testCommand: 'npm run test',
  buildCommand: 'npm run build',
  environmentVariables: 'API_URL=https://api.example.com',
  mainFeatures: 'JSON formatter\nJWT decoder',
  roadmap: 'Exportar settings',
  faq: 'Se puede usar offline?|Si',
  contributing: 'Abrir issue y luego PR.',
  support: 'support@example.com',
  acknowledgements: 'Open source',
  authorName: 'Matti',
  authorUrl: 'https://github.com/matti',
  customSections: 'Arquitectura\n- Modulos\n---\nSeguridad::Sin envio de datos externos.',
  includeTableOfContents: true,
  license: 'MIT',
}

describe('generateReadme', () => {
  it('genera un README completo con tabla de contenidos y secciones dinamicas', () => {
    const result = generateReadme(baseInput)

    expect(result).toContain('# Proyecto X')
    expect(result).toContain('## Tabla de contenidos')
    expect(result).toContain('## Caracteristicas')
    expect(result).toContain('- JSON formatter')
    expect(result).toContain('## Variables de entorno')
    expect(result).toContain('## FAQ')
    expect(result).toContain('## Arquitectura')
    expect(result).toContain('## Seguridad')
  })

  it('omite tabla de contenidos cuando esta desactivada', () => {
    const result = generateReadme({
      ...baseInput,
      includeTableOfContents: false,
      customSections: '',
      faq: '',
      roadmap: '',
    })

    expect(result).not.toContain('## Tabla de contenidos')
    expect(result).toContain('## Licencia')
  })
})
