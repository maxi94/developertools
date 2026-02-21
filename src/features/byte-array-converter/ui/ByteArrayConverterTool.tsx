import { useEffect, useMemo, useState } from 'react'
import { Copy, Download, FileCode2, Sparkles } from 'lucide-react'
import { detectFileType, parseByteArrayInput } from '@/shared/lib/byte-array'
import { useI18n } from '@/shared/i18n/useI18n'
import type { AppLanguage } from '@/shared/i18n/config'

type UiCopy = {
  title: string
  description: string
  usePngExample: string
  fileName: string
  download: string
  copyNormalized: string
  bytesDetected: string
  detectedType: string
  parseError: string
  inputLabel: string
  outputLabel: string
  placeholder: string
  noPreview: string
  imagePreview: string
  pdfPreview: string
}

const uiCopy: Record<AppLanguage, UiCopy> = {
  es: {
    title: 'byte[] a archivo',
    description: 'Convierte arreglos byte[] (C#/JSON/lista) a imagen, PDF u otros archivos.',
    usePngExample: 'Usar ejemplo PNG',
    fileName: 'Nombre archivo',
    download: 'Descargar archivo',
    copyNormalized: 'Copiar bytes',
    bytesDetected: 'Bytes detectados',
    detectedType: 'Tipo detectado',
    parseError: 'Error al parsear byte[]',
    inputLabel: 'Entrada byte[]',
    outputLabel: 'Salida normalizada',
    placeholder: 'Ej: new byte[] { 137, 80, 78, 71, 13, 10, 26, 10, ... }',
    noPreview: 'Sin preview para este tipo. Puedes descargar el archivo generado.',
    imagePreview: 'Preview imagen',
    pdfPreview: 'Preview PDF',
  },
  en: {
    title: 'byte[] to file',
    description: 'Convert byte[] arrays (C#/JSON/list) into image, PDF, or other files.',
    usePngExample: 'Use PNG sample',
    fileName: 'File name',
    download: 'Download file',
    copyNormalized: 'Copy bytes',
    bytesDetected: 'Detected bytes',
    detectedType: 'Detected type',
    parseError: 'byte[] parse error',
    inputLabel: 'byte[] input',
    outputLabel: 'Normalized output',
    placeholder: 'Ex: new byte[] { 137, 80, 78, 71, 13, 10, 26, 10, ... }',
    noPreview: 'No preview for this type. You can still download the generated file.',
    imagePreview: 'Image preview',
    pdfPreview: 'PDF preview',
  },
  pt: {
    title: 'byte[] para arquivo',
    description: 'Converte arrays byte[] (C#/JSON/lista) em imagem, PDF ou outros arquivos.',
    usePngExample: 'Usar exemplo PNG',
    fileName: 'Nome do arquivo',
    download: 'Baixar arquivo',
    copyNormalized: 'Copiar bytes',
    bytesDetected: 'Bytes detectados',
    detectedType: 'Tipo detectado',
    parseError: 'Erro ao processar byte[]',
    inputLabel: 'Entrada byte[]',
    outputLabel: 'Saida normalizada',
    placeholder: 'Ex: new byte[] { 137, 80, 78, 71, 13, 10, 26, 10, ... }',
    noPreview: 'Sem preview para este tipo. Voce pode baixar o arquivo gerado.',
    imagePreview: 'Preview imagem',
    pdfPreview: 'Preview PDF',
  },
}

const pngSample = [
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82,
  0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196,
  137, 0, 0, 0, 13, 73, 68, 65, 84, 120, 156, 99, 248, 255, 255,
  63, 0, 5, 254, 2, 254, 167, 53, 129, 189, 0, 0, 0, 0, 73, 69,
  78, 68, 174, 66, 96, 130,
]

export function ByteArrayConverterTool() {
  const { language } = useI18n()
  const t = uiCopy[language]

  const [source, setSource] = useState('')
  const [baseName, setBaseName] = useState('archivo')
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const parsed = useMemo(() => {
    if (!source.trim()) {
      return { status: 'empty' as const }
    }

    try {
      const parsedResult = parseByteArrayInput(source)
      const fileType = detectFileType(parsedResult.bytes)
      const blobBytes = new Uint8Array(parsedResult.bytes.length)
      blobBytes.set(parsedResult.bytes)
      const blob = new Blob([blobBytes.buffer], { type: fileType.mime })

      return {
        status: 'success' as const,
        parsed: parsedResult,
        fileType,
        blob,
      }
    } catch (error) {
      return {
        status: 'error' as const,
        message: error instanceof Error ? error.message : t.parseError,
      }
    }
  }, [source, t.parseError])

  useEffect(() => {
    if (parsed.status !== 'success') {
      setDownloadUrl(null)
      return
    }

    const url = URL.createObjectURL(parsed.blob)
    setDownloadUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [parsed])

  const normalized = parsed.status === 'success' ? parsed.parsed.normalized : ''

  const copyNormalized = async () => {
    if (!normalized) {
      return
    }
    await navigator.clipboard.writeText(normalized)
  }

  const downloadFile = () => {
    if (parsed.status !== 'success' || !downloadUrl) {
      return
    }

    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `${baseName || 'archivo'}.${parsed.fileType.extension}`
    link.click()
  }

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
        <FileCode2 className="size-5" />
        {t.title}
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
          onClick={() => setSource(`new byte[] { ${pngSample.join(', ')} }`)}
        >
          <Sparkles className="size-3.5" />
          {t.usePngExample}
        </button>

        <input
          type="text"
          className="w-44 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          value={baseName}
          onChange={(event) => setBaseName(event.target.value)}
          placeholder={t.fileName}
        />

        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
          onClick={downloadFile}
          disabled={parsed.status !== 'success'}
        >
          <Download className="size-3.5" />
          {t.download}
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
          onClick={() => void copyNormalized()}
          disabled={parsed.status !== 'success'}
        >
          <Copy className="size-3.5" />
          {t.copyNormalized}
        </button>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t.inputLabel}</span>
          <textarea
            className="min-h-[200px] rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs outline-none dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
            placeholder={t.placeholder}
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t.outputLabel}</span>
          <textarea
            className="min-h-[200px] rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs outline-none data-[status=error]:border-rose-500 data-[status=error]:text-rose-600 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100 dark:data-[status=error]:text-rose-300"
            readOnly
            value={
              parsed.status === 'success'
                ? parsed.parsed.normalized
                : parsed.status === 'error'
                  ? `${t.parseError}: ${parsed.message}`
                  : ''
            }
            data-status={parsed.status}
            spellCheck={false}
          />
        </label>
      </div>

      {parsed.status === 'success' ? (
        <div className="mt-3 grid gap-2 rounded-xl border border-slate-300/70 bg-slate-50/80 p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900/45 dark:text-slate-200">
          <p>
            <strong>{t.bytesDetected}:</strong> {parsed.parsed.bytes.length}
          </p>
          <p>
            <strong>{t.detectedType}:</strong> {parsed.fileType.mime}
          </p>
        </div>
      ) : null}

      {parsed.status === 'success' && downloadUrl ? (
        parsed.fileType.category === 'image' ? (
          <div className="mt-3 rounded-xl border border-slate-300/70 bg-white p-2 dark:border-slate-700 dark:bg-slate-900/60">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t.imagePreview}</p>
            <img src={downloadUrl} alt={t.imagePreview} className="max-h-[48vh] w-full rounded-md object-contain" />
          </div>
        ) : parsed.fileType.category === 'pdf' ? (
          <div className="mt-3 rounded-xl border border-slate-300/70 bg-white p-2 dark:border-slate-700 dark:bg-slate-900/60">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t.pdfPreview}</p>
            <iframe src={downloadUrl} title={t.pdfPreview} className="h-[52vh] min-h-[260px] w-full rounded-md border-0 sm:h-[360px]" />
          </div>
        ) : (
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">{t.noPreview}</p>
        )
      ) : null}
    </section>
  )
}
