import { useEffect, useMemo, useState } from 'react'
import { Copy, FileText, Play } from 'lucide-react'
import { generateReadme, type ReadmeInput } from '@/shared/lib/readme'

const initialInput: ReadmeInput = {
  projectName: 'Proyecto Developer Tools',
  description: 'Coleccion de utilidades client-side para desarrolladores.',
  installCommand: 'npm install',
  usageCommand: 'npm run dev',
  mainFeatures: 'Formateador JSON\nVisualizador JWT\nGenerador UUID',
  license: 'MIT',
}

export function ReadmeGeneratorTool() {
  const [form, setForm] = useState<ReadmeInput>(initialInput)
  const [preview, setPreview] = useState('')

  const readme = useMemo(() => generateReadme(form), [form])
  const isGenerating = preview.length < readme.length

  useEffect(() => {
    let index = 0

    const timer = window.setInterval(() => {
      index = Math.min(index + 12, readme.length)
      setPreview(readme.slice(0, index))

      if (index >= readme.length) {
        window.clearInterval(timer)
      }
    }, 16)

    return () => window.clearInterval(timer)
  }, [readme])

  const updateField = <Key extends keyof ReadmeInput>(key: Key, value: ReadmeInput[Key]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const copyReadme = async () => {
    await navigator.clipboard.writeText(readme)
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="rounded-xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/85">
        <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
          <FileText className="size-4.5" />
          Generador README
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Completa los campos y visualiza el README mientras se genera.
        </p>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Nombre del proyecto
            <input
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case outline-none transition focus:border-blue-500 dark:border-slate-600 dark:bg-slate-950"
              value={form.projectName}
              onChange={(event) => updateField('projectName', event.target.value)}
            />
          </label>

          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Descripcion
            <textarea
              className="min-h-[76px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case outline-none transition focus:border-blue-500 dark:border-slate-600 dark:bg-slate-950"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
            />
          </label>

          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Funcionalidades (una por linea)
            <textarea
              className="min-h-[96px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case outline-none transition focus:border-blue-500 dark:border-slate-600 dark:bg-slate-950"
              value={form.mainFeatures}
              onChange={(event) => updateField('mainFeatures', event.target.value)}
            />
          </label>

          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Comando instalacion
            <input
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case outline-none transition focus:border-blue-500 dark:border-slate-600 dark:bg-slate-950"
              value={form.installCommand}
              onChange={(event) => updateField('installCommand', event.target.value)}
            />
          </label>

          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Comando uso
            <input
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case outline-none transition focus:border-blue-500 dark:border-slate-600 dark:bg-slate-950"
              value={form.usageCommand}
              onChange={(event) => updateField('usageCommand', event.target.value)}
            />
          </label>

          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Licencia
            <input
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case outline-none transition focus:border-blue-500 dark:border-slate-600 dark:bg-slate-950"
              value={form.license}
              onChange={(event) => updateField('license', event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-slate-300/70 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/85">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Play className={`size-4 ${isGenerating ? 'animate-pulse' : ''}`} />
            {isGenerating ? 'Generando vista previa...' : 'Vista previa lista'}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
            onClick={copyReadme}
          >
            <Copy className="size-3.5" />
            Copiar README
          </button>
        </div>

        <pre className="max-h-[680px] overflow-auto rounded-md border border-slate-300 bg-slate-50 p-3 text-xs leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
          {preview}
          {isGenerating ? <span className="animate-pulse">|</span> : null}
        </pre>
      </section>
    </section>
  )
}
