import { useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { normalizeLanguage, type AppLanguage } from '@/shared/i18n/config'
import { I18nContext, type I18nContextValue } from '@/shared/i18n/i18n-context'

const LANGUAGE_KEY = 'developer-tools-language'

function getInitialLanguage(): AppLanguage {
  return normalizeLanguage(window.localStorage.getItem(LANGUAGE_KEY))
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<AppLanguage>(getInitialLanguage)

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_KEY, language)
    document.documentElement.lang = language
  }, [language])

  const value = useMemo<I18nContextValue>(() => ({ language, setLanguage }), [language])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
