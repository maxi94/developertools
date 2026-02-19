import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  CheckCircle2,
  Copy,
  Download,
  FileDown,
  FileText,
  FileUp,
  ListChecks,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { generateReadme, type ReadmeInput } from '@/shared/lib/readme'
import { useToast } from '@/shared/ui/toast/ToastProvider'

const STORAGE_KEY = 'developer-tools-readme-generator-v2'

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

type StepKey = 'base' | 'links' | 'content' | 'commands' | 'community' | 'advanced'

const steps: Array<{ id: StepKey; label: string }> = [
  { id: 'base', label: 'Base' },
  { id: 'links', label: 'Enlaces' },
  { id: 'content', label: 'Contenido' },
  { id: 'commands', label: 'Comandos' },
  { id: 'community', label: 'Comunidad' },
  { id: 'advanced', label: 'Avanzado' },
]

const inputClassName =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100'
const textareaClassName = `${inputClassName} min-h-[96px]`

function toLines(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function mergeWithDefault(parsed: unknown): ReadmeInput {
  if (!parsed || typeof parsed !== 'object') {
    return defaultInput
  }

  const includeToc = (parsed as Partial<ReadmeInput>).includeTableOfContents

  return {
    ...defaultInput,
    ...(parsed as Partial<ReadmeInput>),
    includeTableOfContents: typeof includeToc === 'boolean' ? includeToc : defaultInput.includeTableOfContents,
  }
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="grid gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
      <span className="uppercase tracking-[0.12em]">{label}</span>
      {children}
      {hint ? <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{hint}</span> : null}
    </label>
  )
}

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-300/70 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/70">
      <div className="grid gap-3">{children}</div>
    </section>
  )
}

export function ReadmeGeneratorTool() {
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [form, setForm] = useState<ReadmeInput>(defaultInput)
  const [activeStep, setActiveStep] = useState<StepKey>('base')
  const [previewMode, setPreviewMode] = useState<'markdown' | 'summary'>('markdown')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        setForm(mergeWithDefault(JSON.parse(raw)))
      }
    } catch {
      // Ignore malformed local storage payloads.
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) {
      return
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
  }, [form, isLoaded])

  const readme = useMemo(() => generateReadme(form), [form])

  const qualityChecks = useMemo(() => {
    const checks = [
      {
        label: 'Nombre y descripcion',
        ok: Boolean(form.projectName.trim() && form.description.trim()),
      },
      {
        label: 'Caracteristicas y stack',
        ok: toLines(form.mainFeatures).length > 0 && toLines(form.techStack).length > 0,
      },
      {
        label: 'Comandos base',
        ok: Boolean(form.installCommand.trim() && form.usageCommand.trim()),
      },
      {
        label: 'URL de repositorio',
        ok: Boolean(form.repositoryUrl.trim()),
      },
    ]
    return checks
  }, [form])

  const qualityScore = useMemo(
    () => Math.round((qualityChecks.filter((item) => item.ok).length / qualityChecks.length) * 100),
    [qualityChecks],
  )

  const summary = useMemo(
    () => ({
      features: toLines(form.mainFeatures).length,
      stack: toLines(form.techStack).length,
      envVars: toLines(form.environmentVariables).length,
      roadmap: toLines(form.roadmap).length,
      chars: readme.length,
    }),
    [form, readme],
  )

  const updateField = <Key extends keyof ReadmeInput>(key: Key, value: ReadmeInput[Key]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const applyPreset = (preset: ReadmeInput, label: string) => {
    setForm(preset)
    showToast(`Preset aplicado: ${label}.`, { tone: 'success' })
  }

  const resetForm = () => {
    setForm(defaultInput)
    window.localStorage.removeItem(STORAGE_KEY)
    showToast('Formulario restablecido.', { tone: 'info' })
  }

  const copyReadme = async () => {
    try {
      await navigator.clipboard.writeText(readme)
      showToast('README copiado al portapapeles.', { tone: 'success' })
    } catch {
      showToast('No se pudo copiar el README.', { tone: 'error' })
    }
  }

  const downloadReadme = () => {
    const blob = new Blob([readme], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'README.md'
    link.click()
    URL.revokeObjectURL(url)
    showToast('README descargado.', { tone: 'success' })
  }

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(form, null, 2)], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'readme-config.json'
    link.click()
    URL.revokeObjectURL(url)
    showToast('Configuracion exportada.', { tone: 'success' })
  }

  const importConfigFromFile = async (file: File) => {
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      setForm(mergeWithDefault(parsed))
      showToast('Configuracion importada.', { tone: 'success' })
    } catch {
      showToast('Archivo invalido. Debe ser JSON.', { tone: 'error' })
    }
  }

  const stepContent = useMemo(() => {
    if (activeStep === 'base') {
      return (
        <SectionCard>
          <Field label="Nombre del proyecto">
            <input
              className={inputClassName}
              value={form.projectName}
              onChange={(event) => updateField('projectName', event.target.value)}
            />
          </Field>
          <Field label="Tagline">
            <input
              className={inputClassName}
              value={form.tagline}
              onChange={(event) => updateField('tagline', event.target.value)}
            />
          </Field>
          <Field label="Descripcion">
            <textarea
              className={textareaClassName}
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
            />
          </Field>
          <Field label="Badges markdown" hint="Uno por linea.">
            <textarea
              className={textareaClassName}
              value={form.badges}
              onChange={(event) => updateField('badges', event.target.value)}
            />
          </Field>
          <Field label="Logo URL">
            <input
              className={inputClassName}
              value={form.logoUrl}
              onChange={(event) => updateField('logoUrl', event.target.value)}
            />
          </Field>
        </SectionCard>
      )
    }

    if (activeStep === 'links') {
      return (
        <SectionCard>
          <Field label="Demo URL">
            <input
              className={inputClassName}
              value={form.demoUrl}
              onChange={(event) => updateField('demoUrl', event.target.value)}
            />
          </Field>
          <Field label="Docs URL">
            <input
              className={inputClassName}
              value={form.docsUrl}
              onChange={(event) => updateField('docsUrl', event.target.value)}
            />
          </Field>
          <Field label="Repositorio URL">
            <input
              className={inputClassName}
              value={form.repositoryUrl}
              onChange={(event) => updateField('repositoryUrl', event.target.value)}
            />
          </Field>
        </SectionCard>
      )
    }

    if (activeStep === 'content') {
      return (
        <SectionCard>
          <Field label="Caracteristicas" hint="Una por linea.">
            <textarea
              className={textareaClassName}
              value={form.mainFeatures}
              onChange={(event) => updateField('mainFeatures', event.target.value)}
            />
          </Field>
          <Field label="Stack tecnologico" hint="Una tecnologia por linea.">
            <textarea
              className={textareaClassName}
              value={form.techStack}
              onChange={(event) => updateField('techStack', event.target.value)}
            />
          </Field>
          <Field label="Prerequisitos">
            <textarea
              className={textareaClassName}
              value={form.prerequisites}
              onChange={(event) => updateField('prerequisites', event.target.value)}
            />
          </Field>
          <Field label="Variables de entorno">
            <textarea
              className={textareaClassName}
              value={form.environmentVariables}
              onChange={(event) => updateField('environmentVariables', event.target.value)}
            />
          </Field>
        </SectionCard>
      )
    }

    if (activeStep === 'commands') {
      return (
        <SectionCard>
          <Field label="Comando instalacion">
            <input
              className={inputClassName}
              value={form.installCommand}
              onChange={(event) => updateField('installCommand', event.target.value)}
            />
          </Field>
          <Field label="Comando uso">
            <input
              className={inputClassName}
              value={form.usageCommand}
              onChange={(event) => updateField('usageCommand', event.target.value)}
            />
          </Field>
          <Field label="Comando test">
            <input
              className={inputClassName}
              value={form.testCommand}
              onChange={(event) => updateField('testCommand', event.target.value)}
            />
          </Field>
          <Field label="Comando build">
            <input
              className={inputClassName}
              value={form.buildCommand}
              onChange={(event) => updateField('buildCommand', event.target.value)}
            />
          </Field>
        </SectionCard>
      )
    }

    if (activeStep === 'community') {
      return (
        <SectionCard>
          <Field label="Roadmap" hint="Una tarea por linea.">
            <textarea
              className={textareaClassName}
              value={form.roadmap}
              onChange={(event) => updateField('roadmap', event.target.value)}
            />
          </Field>
          <Field label="FAQ" hint="Formato: pregunta|respuesta por linea.">
            <textarea
              className={textareaClassName}
              value={form.faq}
              onChange={(event) => updateField('faq', event.target.value)}
            />
          </Field>
          <Field label="Contribuir">
            <textarea
              className={textareaClassName}
              value={form.contributing}
              onChange={(event) => updateField('contributing', event.target.value)}
            />
          </Field>
          <Field label="Soporte">
            <textarea
              className={textareaClassName}
              value={form.support}
              onChange={(event) => updateField('support', event.target.value)}
            />
          </Field>
          <Field label="Agradecimientos">
            <textarea
              className={textareaClassName}
              value={form.acknowledgements}
              onChange={(event) => updateField('acknowledgements', event.target.value)}
            />
          </Field>
        </SectionCard>
      )
    }

    return (
      <SectionCard>
        <Field label="Autor">
          <input
            className={inputClassName}
            value={form.authorName}
            onChange={(event) => updateField('authorName', event.target.value)}
          />
        </Field>
        <Field label="URL autor">
          <input
            className={inputClassName}
            value={form.authorUrl}
            onChange={(event) => updateField('authorUrl', event.target.value)}
          />
        </Field>
        <Field label="Licencia">
          <input
            className={inputClassName}
            value={form.license}
            onChange={(event) => updateField('license', event.target.value)}
          />
        </Field>
        <Field label="Secciones custom" hint="Separar bloques con --- o usar Titulo::Contenido.">
          <textarea
            className={`${textareaClassName} min-h-[140px]`}
            value={form.customSections}
            onChange={(event) => updateField('customSections', event.target.value)}
          />
        </Field>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={form.includeTableOfContents}
            onChange={(event) => updateField('includeTableOfContents', event.target.checked)}
          />
          Incluir tabla de contenidos
        </label>
      </SectionCard>
    )
  }, [activeStep, form])

  return (
    <section className="grid gap-4 2xl:grid-cols-[minmax(0,530px)_minmax(0,1fr)]">
      <section className="grid gap-3 rounded-2xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/85">
        <header className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              <FileText className="size-4.5" />
              Generador README Pro
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Flujo guiado con diagnostico de calidad, autosave e import/export de configuracion.
            </p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <ListChecks className="size-3.5" />
            Calidad: {qualityScore}%
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
            onClick={() => applyPreset(webPreset, 'Web')}
          >
            <Sparkles className="size-3.5" />
            Preset Web
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
            onClick={() => applyPreset(apiPreset, 'API')}
          >
            Preset API
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
            onClick={() => applyPreset(libraryPreset, 'Libreria')}
          >
            Preset Libreria
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
            onClick={resetForm}
          >
            <RefreshCw className="size-3.5" />
            Reset
          </button>
        </div>

        <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {steps.map((step) => (
            <button
              key={step.id}
              type="button"
              className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                activeStep === step.id
                  ? 'border-cyan-400 bg-cyan-50 text-cyan-700 dark:border-cyan-500/60 dark:bg-cyan-900/30 dark:text-cyan-200'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-500'
              }`}
              onClick={() => setActiveStep(step.id)}
            >
              {step.label}
            </button>
          ))}
        </nav>

        {stepContent}

        <div className="rounded-xl border border-slate-300/70 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-900/60">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
            Checklist rapido
          </h3>
          <div className="mt-2 grid gap-1.5">
            {qualityChecks.map((check) => (
              <p
                key={check.label}
                className={`inline-flex items-center gap-1.5 text-xs ${
                  check.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
                }`}
              >
                <CheckCircle2 className="size-3.5" />
                {check.label}
              </p>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Autosave: {isLoaded ? 'activo (localStorage)' : 'cargando...'}
          </p>
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/85">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                previewMode === 'markdown'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
              onClick={() => setPreviewMode('markdown')}
            >
              Markdown
            </button>
            <button
              type="button"
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                previewMode === 'summary'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
              onClick={() => setPreviewMode('summary')}
            >
              Resumen
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
              onClick={copyReadme}
            >
              <Copy className="size-3.5" />
              Copiar
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
              onClick={downloadReadme}
            >
              <Download className="size-3.5" />
              Descargar .md
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
              onClick={exportConfig}
            >
              <FileDown className="size-3.5" />
              Exportar config
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="size-3.5" />
              Importar config
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  void importConfigFromFile(file)
                }
                event.currentTarget.value = ''
              }}
            />
          </div>
        </header>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <div className="rounded-lg border border-slate-300/70 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            Features: {summary.features}
          </div>
          <div className="rounded-lg border border-slate-300/70 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            Stack: {summary.stack}
          </div>
          <div className="rounded-lg border border-slate-300/70 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            Env: {summary.envVars}
          </div>
          <div className="rounded-lg border border-slate-300/70 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            Roadmap: {summary.roadmap}
          </div>
          <div className="rounded-lg border border-slate-300/70 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            Chars: {summary.chars}
          </div>
        </div>

        {previewMode === 'markdown' ? (
          <pre className="max-h-[70dvh] overflow-auto rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
            {readme}
          </pre>
        ) : (
          <section className="grid gap-3 rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-950/70">
            <article>
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Proyecto
              </h4>
              <p className="mt-1 text-slate-800 dark:text-slate-100">{form.projectName || 'Sin nombre'}</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{form.tagline || 'Sin tagline'}</p>
            </article>
            <article>
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Top features
              </h4>
              <ul className="mt-1 list-disc pl-5 text-slate-700 dark:text-slate-200">
                {toLines(form.mainFeatures).slice(0, 5).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article>
              <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Comandos
              </h4>
              <p className="mt-1 font-mono text-xs text-slate-700 dark:text-slate-200">
                install: {form.installCommand || '-'}
              </p>
              <p className="font-mono text-xs text-slate-700 dark:text-slate-200">run: {form.usageCommand || '-'}</p>
              <p className="font-mono text-xs text-slate-700 dark:text-slate-200">test: {form.testCommand || '-'}</p>
            </article>
          </section>
        )}
      </section>
    </section>
  )
}
