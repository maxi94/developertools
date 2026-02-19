export interface ReadmeInput {
  projectName: string
  tagline: string
  description: string
  badges: string
  logoUrl: string
  demoUrl: string
  docsUrl: string
  repositoryUrl: string
  prerequisites: string
  techStack: string
  installCommand: string
  usageCommand: string
  testCommand: string
  buildCommand: string
  environmentVariables: string
  mainFeatures: string
  roadmap: string
  faq: string
  contributing: string
  support: string
  acknowledgements: string
  authorName: string
  authorUrl: string
  customSections: string
  includeTableOfContents: boolean
  license: string
}

interface CustomSection {
  title: string
  content: string
}

function toLines(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function toFaqEntries(rawFaq: string): Array<{ question: string; answer: string }> {
  return rawFaq
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [question, answer] = line.split('|')
      return {
        question: question?.trim() ?? '',
        answer: answer?.trim() ?? '',
      }
    })
    .filter((entry) => entry.question && entry.answer)
}

function toCustomSections(raw: string): CustomSection[] {
  return raw
    .split('\n---\n')
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      const [firstLine = '', ...restLines] = block.split('\n')
      if (firstLine.includes('::')) {
        const [title, content] = firstLine.split('::')
        return {
          title: title?.trim() || `Seccion personalizada ${index + 1}`,
          content: content?.trim() ?? '',
        }
      }

      return {
        title: firstLine.trim() || `Seccion personalizada ${index + 1}`,
        content: restLines.join('\n').trim(),
      }
    })
    .filter((section) => section.content)
}

function toAnchor(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function markdownList(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n')
}

function codeBlock(code: string): string {
  return ['```bash', code.trim(), '```'].join('\n')
}

export function generateReadme(input: ReadmeInput): string {
  const features = toLines(input.mainFeatures)
  const prerequisites = toLines(input.prerequisites)
  const stack = toLines(input.techStack)
  const envVars = toLines(input.environmentVariables)
  const roadmap = toLines(input.roadmap)
  const acknowledgements = toLines(input.acknowledgements)
  const faqEntries = toFaqEntries(input.faq)
  const badges = toLines(input.badges)
  const customSections = toCustomSections(input.customSections)

  const sections: Array<{ title: string; content: string }> = []

  if (input.description.trim()) {
    sections.push({ title: 'Descripcion', content: input.description.trim() })
  }

  if (input.demoUrl.trim() || input.docsUrl.trim() || input.repositoryUrl.trim()) {
    const links: string[] = []
    if (input.demoUrl.trim()) {
      links.push(`- Demo: ${input.demoUrl.trim()}`)
    }
    if (input.docsUrl.trim()) {
      links.push(`- Documentacion: ${input.docsUrl.trim()}`)
    }
    if (input.repositoryUrl.trim()) {
      links.push(`- Repositorio: ${input.repositoryUrl.trim()}`)
    }
    sections.push({ title: 'Enlaces', content: links.join('\n') })
  }

  if (features.length > 0) {
    sections.push({ title: 'Caracteristicas', content: markdownList(features) })
  }

  if (stack.length > 0) {
    sections.push({ title: 'Stack tecnologico', content: markdownList(stack) })
  }

  if (prerequisites.length > 0) {
    sections.push({ title: 'Prerequisitos', content: markdownList(prerequisites) })
  }

  if (input.installCommand.trim()) {
    sections.push({ title: 'Instalacion', content: codeBlock(input.installCommand) })
  }

  if (envVars.length > 0) {
    sections.push({
      title: 'Variables de entorno',
      content: envVars.map((item) => `- \`${item}\``).join('\n'),
    })
  }

  if (input.usageCommand.trim()) {
    sections.push({ title: 'Uso', content: codeBlock(input.usageCommand) })
  }

  if (input.testCommand.trim() || input.buildCommand.trim()) {
    const scripts: string[] = []
    if (input.testCommand.trim()) {
      scripts.push(`- Test: \`${input.testCommand.trim()}\``)
    }
    if (input.buildCommand.trim()) {
      scripts.push(`- Build: \`${input.buildCommand.trim()}\``)
    }
    sections.push({ title: 'Scripts', content: scripts.join('\n') })
  }

  if (roadmap.length > 0) {
    sections.push({ title: 'Roadmap', content: markdownList(roadmap) })
  }

  if (faqEntries.length > 0) {
    sections.push({
      title: 'FAQ',
      content: faqEntries.map((entry) => `### ${entry.question}\n${entry.answer}`).join('\n\n'),
    })
  }

  if (input.contributing.trim()) {
    sections.push({ title: 'Contribuir', content: input.contributing.trim() })
  }

  if (input.support.trim()) {
    sections.push({ title: 'Soporte', content: input.support.trim() })
  }

  if (acknowledgements.length > 0) {
    sections.push({ title: 'Agradecimientos', content: markdownList(acknowledgements) })
  }

  if (input.authorName.trim()) {
    const author = input.authorUrl.trim()
      ? `${input.authorName.trim()} (${input.authorUrl.trim()})`
      : input.authorName.trim()
    sections.push({ title: 'Autor', content: author })
  }

  sections.push({ title: 'Licencia', content: input.license.trim() || 'MIT' })

  customSections.forEach((section) => {
    sections.push({ title: section.title, content: section.content })
  })

  const parts: string[] = []
  parts.push(`# ${input.projectName.trim() || 'Mi Proyecto'}`)

  if (input.tagline.trim()) {
    parts.push(`> ${input.tagline.trim()}`)
  }

  if (input.logoUrl.trim()) {
    parts.push(`![Logo del proyecto](${input.logoUrl.trim()})`)
  }

  if (badges.length > 0) {
    parts.push(badges.join(' '))
  }

  if (input.includeTableOfContents && sections.length > 0) {
    const toc = sections
      .map((section) => `- [${section.title}](#${toAnchor(section.title)})`)
      .join('\n')
    parts.push(`## Tabla de contenidos\n${toc}`)
  }

  sections.forEach((section) => {
    parts.push(`## ${section.title}\n${section.content}`)
  })

  return `${parts.join('\n\n')}\n`
}
