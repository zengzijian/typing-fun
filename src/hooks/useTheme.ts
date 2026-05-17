import { useState, useLayoutEffect } from 'react'
import { themes, sharedThemes, defaultThemeId, type Theme } from '@/data/themes'

const STORAGE_KEY = 'typing-fun-theme'

function applyTheme(theme: Theme) {
  const root = document.documentElement
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })
}

export function useTheme() {
  const [themeId, setThemeId] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const valid = stored && sharedThemes.some((t) => t.id === stored)
    return valid ? stored : defaultThemeId
  })

  useLayoutEffect(() => {
    const theme = themes.find((t) => t.id === themeId) ?? sharedThemes[0]
    applyTheme(theme)
    localStorage.setItem(STORAGE_KEY, themeId)
  }, [themeId])

  return { themeId, setThemeId, themes: sharedThemes }
}
