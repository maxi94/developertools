export const SUPPORTED_LANGUAGES = [
  { code: 'es', label: 'ES', nativeName: 'Español' },
  { code: 'en', label: 'EN', nativeName: 'English' },
] as const

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]['code']

export const DEFAULT_LANGUAGE: AppLanguage = 'es'

const LANGUAGE_CODE_SET = new Set<string>(SUPPORTED_LANGUAGES.map((language) => language.code))

export function isSupportedLanguage(value: string): value is AppLanguage {
  return LANGUAGE_CODE_SET.has(value)
}

export function normalizeLanguage(value: string | null | undefined): AppLanguage {
  if (!value) {
    return DEFAULT_LANGUAGE
  }
  return isSupportedLanguage(value) ? value : DEFAULT_LANGUAGE
}
