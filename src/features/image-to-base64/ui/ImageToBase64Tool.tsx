import { useMemo, useState } from 'react'
import { Copy, FileImage } from 'lucide-react'
import { getI18nCopy } from '@/shared/i18n/catalog'
import { useI18n } from '@/shared/i18n/useI18n'

interface ConvertedImage {
  id: string
  name: string
  dataUrl: string
  size: number
}

function readAsDataUrl(file: File, readFileError: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error(readFileError))
    reader.readAsDataURL(file)
  })
}

export function ImageToBase64Tool() {
  const { language } = useI18n()
  const ui = getI18nCopy(language, 'imageToBase64')
  const [items, setItems] = useState<ConvertedImage[]>([])
  const [error, setError] = useState<string | null>(null)

  const output = useMemo(() => items.map((item) => item.dataUrl).join('\n\n'), [items])

  const onFilesSelected = async (fileList: FileList | null) => {
    if (!fileList?.length) {
      return
    }

    setError(null)
    try {
      const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'))
      const converted = await Promise.all(
        files.map(async (file, index) => ({
          id: `${file.name}-${index}-${file.lastModified}`,
          name: file.name,
          dataUrl: await readAsDataUrl(file, ui.readFileError),
          size: file.size,
        })),
      )
      setItems(converted)
    } catch {
      setError(ui.processError)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-300/70 bg-white/80 p-4 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/40">
      <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
        <FileImage className="size-5" />
        {ui.title}
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{ui.description}</p>

      <label className="mt-4 grid gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {ui.imageFiles}
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => onFilesSelected(event.target.files)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
        />
      </label>

      {error ? (
        <p className="mt-3 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      {items.length > 0 ? (
        <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="grid gap-2">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-slate-300/70 bg-white p-2 dark:border-slate-700 dark:bg-slate-900/60"
              >
                <img src={item.dataUrl} alt={item.name} className="h-28 w-full rounded-md object-contain" />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {item.name}
                  </p>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {(item.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </article>
            ))}
          </section>

          <section className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {ui.dataUrls}
              </span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(output)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
              >
                <Copy className="size-3.5" />
                {ui.copyAll}
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              className="min-h-[280px] w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-100"
            />
          </section>
        </div>
      ) : null}
    </section>
  )
}
