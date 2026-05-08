import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { SubmitScore } from '@/components/SubmitScore'
import { MiniLeaderboard } from '@/components/MiniLeaderboard'
import { ResultsChart } from '@/components/ResultsChart'
import { useResultsPanel } from '@/hooks/useResultsPanel'

export type { TypingEvent } from '@/lib/resultsUtils'
import type { TypingEvent } from '@/lib/resultsUtils'

type Props = {
  events: TypingEvent[]
  timeLimit: number
  wpm: number
  correctCount: number
  totalCount: number
  mode: 'chinese' | 'english'
  onRetry: () => void
}

export function TypingResults({ events, timeLimit, wpm, correctCount, totalCount, mode, onRetry }: Props) {
  const { t } = useTranslation()
  const { accuracy, chartData, showSubmit, setShowSubmit, refreshKey, onSubmitSuccess } =
    useResultsPanel({ events, timeLimit, wpm, correctCount, totalCount, mode })

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-primary mb-6 text-center">{t('results.title')}</h2>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">{wpm}</div>
            <div className="text-sm text-muted-foreground mt-1">{t('results.wpm')}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">{accuracy}%</div>
            <div className="text-sm text-muted-foreground mt-1">{t('results.accuracy')}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">{correctCount}</div>
            <div className="text-sm text-muted-foreground mt-1">{t('results.correct')}</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm text-muted-foreground mb-3">{t('results.chart')}</div>
          <ResultsChart data={chartData} height={160} fontSize={12} dotRadius={3} />
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <Button onClick={onRetry} size="lg" variant="outline">{t('results.retry')}</Button>
          <Button size="lg" onClick={() => setShowSubmit(true)}>{t('results.submitBtn')}</Button>
        </div>

        <MiniLeaderboard timeLimit={timeLimit} mode={mode} refreshKey={refreshKey} />
      </div>

      {showSubmit && (
        <SubmitScore
          wpm={wpm}
          accuracy={accuracy}
          timeLimit={timeLimit}
          mode={mode}
          onClose={() => setShowSubmit(false)}
          onSuccess={onSubmitSuccess}
        />
      )}
    </div>
  )
}
