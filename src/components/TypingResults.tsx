import { Button } from '@/components/ui/button'
import { RotateCw, Trophy } from 'lucide-react'
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
    <div className="w-full max-w-2xl mx-auto">
      <div className="p-8 w-full">
        <h2 className="result-item text-3xl font-bold text-primary mb-6 text-center" style={{ animationDelay: '0ms' }}>{t('results.title')}</h2>

        <div className="grid grid-cols-3 gap-4 mb-8 result-item" style={{ animationDelay: '80ms' }}>
          <div className="text-center p-4 rounded-lg bg-card border border-border/60">
            <div className="text-4xl font-bold text-foreground tabular-nums">{wpm}</div>
            <div className="text-sm text-muted-foreground mt-1">{t('results.wpm')}</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-card border border-border/60">
            <div className="text-4xl font-bold text-foreground tabular-nums">{accuracy}%</div>
            <div className="text-sm text-muted-foreground mt-1">{t('results.accuracy')}</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-card border border-border/60">
            <div className="text-4xl font-bold text-foreground tabular-nums">{correctCount}</div>
            <div className="text-sm text-muted-foreground mt-1">{t('results.correct')}</div>
          </div>
        </div>

        <div className="mb-6 result-item" style={{ animationDelay: '160ms' }}>
          <div className="text-sm text-muted-foreground mb-3">{t('results.chart')}</div>
          <ResultsChart data={chartData} height={160} fontSize={12} dotRadius={3} />
        </div>

        <div className="flex items-center justify-center gap-3 mb-6 result-item" style={{ animationDelay: '240ms' }}>
          <Button onClick={onRetry} size="lg" variant="outline" className="gap-2 hover:[&_svg]:rotate-180 [&_svg]:transition-transform [&_svg]:duration-300">
            <RotateCw className="w-4 h-4" />
            {t('results.retry')}
          </Button>
          <Button size="lg" onClick={() => setShowSubmit(true)} className="gap-2">
            <Trophy className="w-4 h-4" />
            {t('results.submitBtn')}
          </Button>
        </div>

        <div className="result-item" style={{ animationDelay: '320ms' }}>
          <MiniLeaderboard timeLimit={timeLimit} mode={mode} refreshKey={refreshKey} />
        </div>
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
