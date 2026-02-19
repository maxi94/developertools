export interface ReadmeInput {
  projectName: string
  description: string
  installCommand: string
  usageCommand: string
  mainFeatures: string
  license: string
}

function toFeatureList(rawFeatures: string): string[] {
  return rawFeatures
    .split('\n')
    .map((feature) => feature.trim())
    .filter(Boolean)
}

export function generateReadme(input: ReadmeInput): string {
  const features = toFeatureList(input.mainFeatures)

  const featuresBlock =
    features.length > 0
      ? features.map((feature) => `- ${feature}`).join('\n')
      : '- Define aqui las funcionalidades principales.'

  return `# ${input.projectName || 'Mi Proyecto'}

${input.description || 'Describe aqui de que se trata tu proyecto.'}

## Caracteristicas
${featuresBlock}

## Instalacion
\`\`\`bash
${input.installCommand || 'npm install'}
\`\`\`

## Uso
\`\`\`bash
${input.usageCommand || 'npm run dev'}
\`\`\`

## Licencia
${input.license || 'MIT'}
`
}
