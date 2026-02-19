import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { Copy, Download, FileText, Play, RotateCcw, Sparkles } from 'lucide-react'
import { generateReadme, type ReadmeInput } from '@/shared/lib/readme'

const defaultInput: ReadmeInput = {
  projectName: 'Proyecto Developer Tools',
  tagline: 'Kit de utilidades client-side para developers.',
  description:
    'Aplicacion web con herramientas para trabajar localmente con datos, tokens y conversiones.',
  badges:
    '![React](https://img.shields.io/badge/React-19-61dafb)\n![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)\n![Vite](https://img.shields.io/badge/Vite-7-646cff)',
  logoUrl: '',
  demoUrl: '',
  docsUrl: '',
  repositoryUrl: '',
  prerequisites: 'Node.js >= 20\nNPM >= 10',
  techStack: 'React\nTypeScript\nTailwind CSS\nVitest',
  installCommand: 'npm install',
  usageCommand: 'npm run dev',
  testCommand: 'npm run test',
  buildCommand: 'npm run build',
  environmentVariables: 'VITE_API_URL=https://api.miapp.dev\nVITE_ANALYTICS_KEY=xxxx',
  mainFeatures:
    'Formateador JSON con refs\nVisualizador JWT\nCodificador Base64\nGenerador UUID\nGenerador README',
  roadmap: 'Agregar herramientas de Git\nExportar configuraciones\nAtajos de teclado globales',
  faq: 'Puedo usarlo offline?|Si, funciona del lado del cliente.\nGuarda datos en servidor?|No, todo se procesa en el navegador.',
  contributing:
    'Si queres contribuir, abre un issue con el contexto y luego crea un PR con pruebas incluidas.',
  support: 'Para soporte, abre un issue o escribe a soporte@miapp.dev.',
  acknowledgements: 'Comunidad open source\nEquipo frontend\nContribuidores',
  authorName: 'Tu Nombre',
  authorUrl: 'https://github.com/tuusuario',
  customSections:
    'Arquitectura\n- Feature-based folders\n- Shared libs para logica\n---\nSeguridad::No se suben datos a servidores externos.',
  includeTableOfContents: true,
  license: 'MIT',
}

const webPreset: ReadmeInput = {
  ...defaultInput,
  projectName: 'Web App SaaS',
  tagline: 'Dashboard moderno para equipos productivos.',
  mainFeatures: 'Panel de analitica\nGestion de usuarios\nAlertas en tiempo real',
}

const apiPreset: ReadmeInput = {
  ...defaultInput,
  projectName: 'API REST',
  tagline: 'API escalable y documentada para integraciones.',
  mainFeatures: 'Endpoints versionados\nAutenticacion JWT\nRate limiting',
  usageCommand: 'npm run start:dev',
  techStack: 'Node.js\nTypeScript\nExpress\nPostgreSQL',
}

const libraryPreset: ReadmeInput = {
  ...defaultInput,
  projectName: 'Libreria TypeScript',
  tagline: 'SDK reutilizable para acelerar integraciones.',
  mainFeatures: 'API tipada\nSoporte ESM/CJS\nTests automatizados',
  usageCommand: 'npm run test',
  techStack: 'TypeScript\ntsup\nVitest',
}

const inputClassName =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case outline-none transition focus:border-blue-500 dark:border-slate-600 dark:bg-slate-950'
const textareaClassName = `${inputClassName} min-h-[84px]`

interface SectionProps {
  title: string
  subtitle: string
  children: ReactNode
}

function FormSection({ title, subtitle, children }: SectionProps) {
  return (
    <section className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-900/40">
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
        {title}
      </h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      <div className="mt-3 grid gap-2.5">{children}</div>
    </section>
  )
}

export function ReadmeGeneratorTool() {
  const [form, setForm] = useState<ReadmeInput>(defaultInput)
  const [preview, setPreview] = useState('')

  const readme = useMemo(() => generateReadme(form), [form])
  const isGenerating = preview.length < readme.length

  useEffect(() => {
    let index = 0
    const timer = window.setInterval(() => {
      index = Math.min(index + 20, readme.length)
      setPreview(readme.slice(0, index))
      if (index >= readme.length) {
        window.clearInterval(timer)
      }
    }, 12)

    return () => window.clearInterval(timer)
  }, [readme])

  const updateField = <Key extends keyof ReadmeInput>(key: Key, value: ReadmeInput[Key]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const applyPreset = (preset: ReadmeInput) => {
    setForm(preset)
  }

  const copyReadme = async () => {
    await navigator.clipboard.writeText(readme)
  }

  const downloadReadme = () => {
    const blob = new Blob([readme], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'README.md'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(360px,460px)_minmax(0,1fr)]">
      <section className="rounded-xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/85">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
              <FileText className="size-4.5" />
              Generador README Pro
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Editor personalizable con secciones opcionales y bloques custom.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
            onClick={() => applyPreset(defaultInput)}
          >
            <RotateCcw className="size-3.5" />
            Restablecer
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
            onClick={() => applyPreset(webPreset)}
          >
            <Sparkles className="size-3.5" />
            Preset Web
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
            onClick={() => applyPreset(apiPreset)}
          >
            Preset API
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
            onClick={() => applyPreset(libraryPreset)}
          >
            Preset Libreria
          </button>
        </div>

        <div className="mt-4 grid max-h-[760px] gap-3 overflow-y-auto pr-1">
          <FormSection title="Base" subtitle="Identidad y descripcion principal del proyecto.">
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Nombre del proyecto
              <input
                className={inputClassName}
                value={form.projectName}
                onChange={(event) => updateField('projectName', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tagline
              <input
                className={inputClassName}
                value={form.tagline}
                onChange={(event) => updateField('tagline', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Descripcion
              <textarea
                className={textareaClassName}
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Badges (uno por linea en Markdown)
              <textarea
                className={textareaClassName}
                value={form.badges}
                onChange={(event) => updateField('badges', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              URL logo
              <input
                className={inputClassName}
                value={form.logoUrl}
                onChange={(event) => updateField('logoUrl', event.target.value)}
              />
            </label>
          </FormSection>

          <FormSection title="Enlaces" subtitle="URLs para demo, docs y repositorio.">
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Demo URL
              <input
                className={inputClassName}
                value={form.demoUrl}
                onChange={(event) => updateField('demoUrl', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Docs URL
              <input
                className={inputClassName}
                value={form.docsUrl}
                onChange={(event) => updateField('docsUrl', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Repo URL
              <input
                className={inputClassName}
                value={form.repositoryUrl}
                onChange={(event) => updateField('repositoryUrl', event.target.value)}
              />
            </label>
          </FormSection>

          <FormSection title="Contenido" subtitle="Secciones funcionales del README.">
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Caracteristicas (una por linea)
              <textarea
                className={textareaClassName}
                value={form.mainFeatures}
                onChange={(event) => updateField('mainFeatures', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Stack tecnologico (una por linea)
              <textarea
                className={textareaClassName}
                value={form.techStack}
                onChange={(event) => updateField('techStack', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Prerequisitos (una por linea)
              <textarea
                className={textareaClassName}
                value={form.prerequisites}
                onChange={(event) => updateField('prerequisites', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Variables de entorno (una por linea)
              <textarea
                className={textareaClassName}
                value={form.environmentVariables}
                onChange={(event) => updateField('environmentVariables', event.target.value)}
              />
            </label>
          </FormSection>

          <FormSection title="Comandos" subtitle="Instalacion, uso y scripts de calidad.">
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Comando instalacion
              <input
                className={inputClassName}
                value={form.installCommand}
                onChange={(event) => updateField('installCommand', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Comando uso
              <input
                className={inputClassName}
                value={form.usageCommand}
                onChange={(event) => updateField('usageCommand', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Comando test
              <input
                className={inputClassName}
                value={form.testCommand}
                onChange={(event) => updateField('testCommand', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Comando build
              <input
                className={inputClassName}
                value={form.buildCommand}
                onChange={(event) => updateField('buildCommand', event.target.value)}
              />
            </label>
          </FormSection>

          <FormSection title="Comunidad" subtitle="Roadmap, FAQ, contribucion y soporte.">
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Roadmap (una por linea)
              <textarea
                className={textareaClassName}
                value={form.roadmap}
                onChange={(event) => updateField('roadmap', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              FAQ (formato: pregunta|respuesta por linea)
              <textarea
                className={textareaClassName}
                value={form.faq}
                onChange={(event) => updateField('faq', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Contribuir
              <textarea
                className={textareaClassName}
                value={form.contributing}
                onChange={(event) => updateField('contributing', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Soporte
              <textarea
                className={textareaClassName}
                value={form.support}
                onChange={(event) => updateField('support', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Agradecimientos (una por linea)
              <textarea
                className={textareaClassName}
                value={form.acknowledgements}
                onChange={(event) => updateField('acknowledgements', event.target.value)}
              />
            </label>
          </FormSection>

          <FormSection title="Autor y custom" subtitle="Detalles finales y secciones propias.">
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Autor
              <input
                className={inputClassName}
                value={form.authorName}
                onChange={(event) => updateField('authorName', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              URL autor
              <input
                className={inputClassName}
                value={form.authorUrl}
                onChange={(event) => updateField('authorUrl', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Licencia
              <input
                className={inputClassName}
                value={form.license}
                onChange={(event) => updateField('license', event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Secciones personalizadas (bloques separados por ---)
              <textarea
                className={`${textareaClassName} min-h-[140px]`}
                value={form.customSections}
                onChange={(event) => updateField('customSections', event.target.value)}
              />
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
                checked={form.includeTableOfContents}
                onChange={(event) => updateField('includeTableOfContents', event.target.checked)}
              />
              Incluir tabla de contenidos automatica
            </label>
          </FormSection>
        </div>
      </section>

      <section className="rounded-xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/85">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Play className={`size-4 ${isGenerating ? 'animate-pulse' : ''}`} />
            {isGenerating ? 'Generando vista previa...' : 'Vista previa lista'}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
              onClick={downloadReadme}
            >
              <Download className="size-3.5" />
              Descargar README
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
              onClick={copyReadme}
            >
              <Copy className="size-3.5" />
              Copiar README
            </button>
          </div>
        </div>

        <pre className="max-h-[840px] overflow-auto rounded-md border border-slate-300 bg-slate-50 p-3 text-xs leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
          {preview}
          {isGenerating ? <span className="animate-pulse">|</span> : null}
        </pre>
      </section>
    </section>
  )
}
