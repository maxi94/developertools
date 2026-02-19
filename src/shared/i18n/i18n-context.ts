import { createContext } from 'react'
import type { AppLanguage } from '@/shared/i18n/config'

export interface I18nContextValue {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
}

export const I18nContext = createContext<I18nContextValue | null>(null)
