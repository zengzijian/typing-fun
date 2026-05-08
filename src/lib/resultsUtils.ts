export type TypingEvent = { elapsed: number; correct: boolean }

export function computeChartData(events: TypingEvent[], timeLimit: number) {
  const bucketSize = 5
  const bucketCount = Math.ceil(timeLimit / bucketSize)
  const initial = [{ time: '0s', wpm: 0, errors: 0 }]
  return [
    ...initial,
    ...Array.from({ length: bucketCount }, (_, i) => {
      const start = i * bucketSize
      const end = Math.min((i + 1) * bucketSize, timeLimit)
      const bucket = events.filter((e) => e.elapsed >= start && e.elapsed < end)
      const correct = bucket.filter((e) => e.correct).length
      const errors = bucket.filter((e) => !e.correct).length
      return { time: `${end}s`, wpm: Math.round(correct * (60 / bucketSize)), errors }
    }),
  ]
}
