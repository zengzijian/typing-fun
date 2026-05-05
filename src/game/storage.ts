import type { Language } from './types'

export interface GameRecord {
  highScore: number
  bestCombo: number
  maxLevel: number
  totalGames: number
}

const DEFAULT: GameRecord = { highScore: 0, bestCombo: 0, maxLevel: 0, totalGames: 0 }

function key(lang: Language): string {
  return `typing-fun-game-${lang}`
}

export function loadRecord(lang: Language): GameRecord {
  try {
    const raw = localStorage.getItem(key(lang))
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT }
  } catch {
    return { ...DEFAULT }
  }
}

export function updateRecord(lang: Language, score: number, combo: number, level: number): GameRecord {
  const current = loadRecord(lang)
  const updated: GameRecord = {
    highScore: Math.max(current.highScore, score),
    bestCombo: Math.max(current.bestCombo, combo),
    maxLevel: Math.max(current.maxLevel, level),
    totalGames: current.totalGames + 1,
  }
  try {
    localStorage.setItem(key(lang), JSON.stringify(updated))
  } catch {
    // localStorage may be unavailable
  }
  return updated
}
