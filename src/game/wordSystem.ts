import { wordList } from '../data/words'
import { englishWordList } from '../data/englishWords'
import type { Language } from './types'

interface WordEntry { display: string; target: string }

function getWordsByLength(min: number, max: number, lang: Language): WordEntry[] {
  if (lang === 'zh') {
    return wordList
      .filter(w => w.pinyin.length >= min && w.pinyin.length <= max)
      .map(w => ({ display: w.chinese, target: w.pinyin }))
  }
  return englishWordList
    .filter(w => w.word.length >= min && w.word.length <= max)
    .map(w => ({ display: w.word, target: w.word }))
}

const WORD_POOLS: Record<string, (lang: Language) => WordEntry[]> = {
  infantry: (lang) => getWordsByLength(lang === 'zh' ? 2 : 3, lang === 'zh' ? 8 : 5, lang),
  tank:     (lang) => getWordsByLength(lang === 'zh' ? 5 : 6, lang === 'zh' ? 12 : 9, lang),
  speeder:  (lang) => getWordsByLength(lang === 'zh' ? 2 : 3, lang === 'zh' ? 6 : 4, lang),
  elite:    (lang) => getWordsByLength(lang === 'zh' ? 8 : 7, lang === 'zh' ? 16 : 10, lang),
  boss:     (lang) => getWordsByLength(lang === 'zh' ? 10 : 9, lang === 'zh' ? 20 : 14, lang),
}

const usedIndices: Record<string, Set<number>> = {}

export function pickWord(enemyType: string, lang: Language): WordEntry {
  const pool = WORD_POOLS[enemyType]?.(lang) ?? WORD_POOLS.infantry(lang)
  if (pool.length === 0) return { display: 'hello', target: 'hello' }

  const key = `${enemyType}_${lang}`
  if (!usedIndices[key]) usedIndices[key] = new Set()

  if (usedIndices[key].size >= pool.length) usedIndices[key].clear()

  let idx: number
  do { idx = Math.floor(Math.random() * pool.length) } while (usedIndices[key].has(idx))
  usedIndices[key].add(idx)

  return pool[idx]
}

export function resetWordSystem() {
  for (const key of Object.keys(usedIndices)) {
    usedIndices[key].clear()
  }
}

export function matchesPrefix(target: string, typed: string): boolean {
  return target.startsWith(typed)
}

export function isComplete(target: string, typed: string): boolean {
  return typed === target
}
