import { useEffect, useMemo, useState } from 'react'

type ResolvedTheme = 'light' | 'dark'
export type ThemeMode = ResolvedTheme | 'system'

const THEME_KEY = 'developer-tools-theme-mode'

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system'
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialThemeMode(): ThemeMode {
  const storedThemeMode = window.localStorage.getItem(THEME_KEY)
  if (isThemeMode(storedThemeMode)) {
    return storedThemeMode
  }

  return 'system'
}

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const onThemeChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', onThemeChange)
    return () => {
      mediaQuery.removeEventListener('change', onThemeChange)
    }
  }, [])

  const resolvedTheme = useMemo<ResolvedTheme>(() => {
    if (themeMode === 'system') {
      return systemTheme
    }

    return themeMode
  }, [themeMode, systemTheme])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    document.documentElement.style.colorScheme = resolvedTheme
    window.localStorage.setItem(THEME_KEY, themeMode)
  }, [resolvedTheme, themeMode])

  return { themeMode, resolvedTheme, setThemeMode }
}
