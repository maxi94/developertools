import type { PropsWithChildren } from 'react'
import { I18nProvider } from '@/shared/i18n/I18nProvider'
import { ToastProvider } from '@/shared/ui/toast/ToastProvider'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <I18nProvider>
      <ToastProvider>{children}</ToastProvider>
    </I18nProvider>
  )
}
