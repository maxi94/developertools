import { useRef, useState, type ChangeEventHandler } from 'react'
import { CheckCircle2, Copy, Download, Eraser, FileDown, Minimize2, Sparkles } from 'lucide-react'
import { getDownloadFileName, transformCode, type CodeLanguage } from '@/shared/lib/code-minifier'

const sampleByLanguage: Record<CodeLanguage, string> = {
  javascript: `function greet(name){const profile={active:true,roles:["dev","admin"]};return name?.trim()? \`Hola \${name}\` : "Hola mundo";}`,
  css: `.dashboard { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; } .dashboard .title { color: #0f172a; font-weight: 700; }`,
}

function downloadTextFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function CodeMinifierTool() {
  const [language, setLanguage] = useState<CodeLanguage>('javascript')
  const [source, setSource] = useState(sampleByLanguage.javascript)
  const [output, setOutput] = useState('')
  const [lastMode, setLastMode] = useState<'minify' | 'expand'>('minify')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const setToast = (nextStatus: 'success' | 'error', nextMessage: string) => {
    setStatus(nextStatus)
    setMessage(nextMessage)
    window.setTimeout(() => {
      setStatus('idle')
      setMessage('')
    }, 2200)
  }

  const runTransform = async (mode: 'minify' | 'expand') => {
    try {
      const nextOutput = await transformCode(source, language, mode)
      setOutput(nextOutput)
      setLastMode(mode)
      setToast('success', mode === 'minify' ? 'Contenido minificado' : 'Contenido expandido')
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'No se pudo procesar contenido.'
      setOutput(detail)
      setToast('error', detail)
    }
  }

  const onLanguageChange = (nextLanguage: CodeLanguage) => {
    setLanguage(nextLanguage)
    setSource(sampleByLanguage[nextLanguage])
    setOutput('')
  }

  const onLoadFile: ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const fileName = file.name.toLowerCase()
    const inferredLanguage: CodeLanguage | null = fileName.endsWith('.css')
      ? 'css'
      : fileName.endsWith('.js') || fileName.endsWith('.mjs') || fileName.endsWith('.cjs')
        ? 'javascript'
        : null

    if (!inferredLanguage) {
      setToast('error', 'Archivo no soportado. Usa .js o .css.')
      event.target.value = ''
      return
    }

    try {
      const text = await file.text()
      setLanguage(inferredLanguage)
      setSource(text)
      setOutput('')
      setToast('success', `Archivo cargado: ${file.name}`)
    } catch {
      setToast('error', 'No se pudo leer el archivo.')
    } finally {
      event.target.value = ''
    }
  }

  const copyOutput = async () => {
    if (!output.trim()) {
      return
    }
    await navigator.clipboard.writeText(output)
    setToast('success', 'Salida copiada')
  }

  const downloadOutput = () => {
    if (!output.trim()) {
      return
    }

    const fileName = getDownloadFileName(language, lastMode)
    const mimeType = language === 'javascript' ? 'text/javascript;charset=utf-8' : 'text/css;charset=utf-8'
    downloadTextFile(output, fileName, mimeType)
    setToast('success', 'Archivo descargado')
  }

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <div className="mb-3">
        <h2 className="m-0 text-xl font-semibold">Minificar / Expandir JS-CSS</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Procesa JavaScript o CSS localmente. Puedes pegar codigo o cargar un archivo.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex overflow-hidden rounded-xl border border-slate-300 dark:border-slate-600">
          <button
            type="button"
            className={`px-3 py-2 text-xs font-semibold ${
              language === 'javascript'
                ? 'bg-blue-600 text-white dark:bg-sky-500 dark:text-slate-950'
                : 'bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
            onClick={() => onLanguageChange('javascript')}
          >
            JavaScript
          </button>
          <button
            type="button"
            className={`px-3 py-2 text-xs font-semibold ${
              language === 'css'
                ? 'bg-blue-600 text-white dark:bg-sky-500 dark:text-slate-950'
                : 'bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
            onClick={() => onLanguageChange('css')}
          >
            CSS
          </button>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
          onClick={() => setSource(sampleByLanguage[language])}
        >
          <Sparkles className="size-3.5" />
          Usar ejemplo
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileDown className="size-3.5" />
          Cargar archivo
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".js,.mjs,.cjs,.css"
          className="hidden"
          onChange={onLoadFile}
        />

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-rose-400 hover:text-rose-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-rose-400 dark:hover:text-rose-300"
          onClick={() => {
            setSource('')
            setOutput('')
          }}
        >
          <Eraser className="size-3.5" />
          Limpiar
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-violet-400 hover:text-violet-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-violet-400 dark:hover:text-violet-300"
          onClick={() => void runTransform('minify')}
        >
          <Minimize2 className="size-3.5" />
          Minificar
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
          onClick={() => void runTransform('expand')}
        >
          <CheckCircle2 className="size-3.5" />
          Expandir
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
          onClick={copyOutput}
        >
          <Copy className="size-3.5" />
          Copiar salida
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
          onClick={downloadOutput}
        >
          <Download className="size-3.5" />
          Descargar salida
        </button>
      </div>

      {status !== 'idle' ? (
        <div
          className={`mb-3 rounded-xl border px-3 py-2 text-xs font-semibold ${
            status === 'success'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-300'
          }`}
        >
          {message}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Entrada
          </span>
          <textarea
            className="min-h-[320px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
            aria-label="Entrada de codigo"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Salida
          </span>
          <textarea
            className="min-h-[320px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
            value={output}
            readOnly
            spellCheck={false}
            aria-label="Salida de codigo"
          />
        </label>
      </div>
    </section>
  )
}
