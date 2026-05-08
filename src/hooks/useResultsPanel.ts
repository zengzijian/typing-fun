import { useState } from 'react'
import { computeChartData, type TypingEvent } from '@/lib/resultsUtils'

interface Params {
  events: TypingEvent[]
  timeLimit: number
  wpm: number
  correctCount: number
  totalCount: number
  mode: 'chinese' | 'english'
}

export function useResultsPanel({ events, timeLimit, wpm, correctCount, totalCount }: Params) {
  const [showSubmit, setShowSubmit] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
  const chartData = computeChartData(events, timeLimit)

  return {
    accuracy,
    chartData,
    showSubmit,
    setShowSubmit,
    refreshKey,
    onSubmitSuccess: () => setRefreshKey((k) => k + 1),
  }
}
