import { useState, useLayoutEffect } from 'react'
import { themes, defaultThemeId, type Theme } from '@/data/themes'

const STORAGE_KEY = 'typing-fun-theme'

function applyTheme(theme: Theme) {
  const root = document.documentElement
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })
}

export function useTheme(overrideThemeId?: string) {
  const [themeId, setThemeId] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) ?? defaultThemeId
  )

  useLayoutEffect(() => {
    const effectiveId = overrideThemeId ?? themeId
    const theme = themes.find((t) => t.id === effectiveId) ?? themes[0]
    applyTheme(theme)
    if (!overrideThemeId) {
      localStorage.setItem(STORAGE_KEY, themeId)
    }
  }, [themeId, overrideThemeId])

  return { themeId, setThemeId, themes }
}
