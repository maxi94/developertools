import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'

type ToastTone = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  tone: ToastTone
  message: string
}

interface ShowToastOptions {
  tone?: ToastTone
  durationMs?: number
}

interface ToastContextValue {
  showToast: (message: string, options?: ShowToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function getToastToneClasses(tone: ToastTone): string {
  if (tone === 'success') {
    return 'border-slate-200 border-l-emerald-500 bg-white text-slate-800 ring-1 ring-emerald-300/70 dark:border-slate-700 dark:border-l-emerald-400 dark:bg-slate-900 dark:text-slate-100 dark:ring-emerald-500/40'
  }
  if (tone === 'error') {
    return 'border-slate-200 border-l-rose-500 bg-white text-slate-800 ring-1 ring-rose-300/70 dark:border-slate-700 dark:border-l-rose-400 dark:bg-slate-900 dark:text-slate-100 dark:ring-rose-500/40'
  }
  return 'border-slate-200 border-l-sky-500 bg-white text-slate-800 ring-1 ring-sky-300/70 dark:border-slate-700 dark:border-l-sky-400 dark:bg-slate-900 dark:text-slate-100 dark:ring-sky-500/40'
}

function ToastIcon({ tone }: { tone: ToastTone }) {
  if (tone === 'success') {
    return <CircleCheck className="size-4" />
  }
  if (tone === 'error') {
    return <CircleAlert className="size-4" />
  }
  return <Info className="size-4" />
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, options?: ShowToastOptions) => {
      const tone = options?.tone ?? 'info'
      const durationMs = options?.durationMs ?? 2200
      const id = ++idRef.current

      setToasts((current) => [...current, { id, tone, message }])
      window.setTimeout(() => {
        removeToast(id)
      }, durationMs)
    },
    [removeToast],
  )

  const contextValue = useMemo<ToastContextValue>(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <section
        className="pointer-events-none fixed right-4 top-4 z-[120] grid max-w-[min(92vw,380px)] gap-2"
        aria-live="polite"
        aria-label="Notificaciones"
      >
        {toasts.map((toast) => (
          <article
            key={toast.id}
            className={`pointer-events-auto grid grid-cols-[auto_1fr_auto] items-start gap-2 rounded-xl border border-l-4 px-3 py-2 text-xs font-semibold shadow-2xl backdrop-blur-sm ${getToastToneClasses(toast.tone)}`}
            role="status"
          >
            <ToastIcon tone={toast.tone} />
            <p className="break-words">{toast.message}</p>
            <button
              type="button"
              className="inline-flex size-5 items-center justify-center rounded text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
              onClick={() => removeToast(toast.id)}
              aria-label="Cerrar notificacion"
            >
              <X className="size-3.5" />
            </button>
          </article>
        ))}
      </section>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider.')
  }
  return context
}
