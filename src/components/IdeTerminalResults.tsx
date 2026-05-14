import { useTranslation } from 'react-i18next'
import type { TypingEvent } from '@/lib/resultsUtils'
import { SubmitScore } from './SubmitScore'
import { MiniLeaderboard } from './MiniLeaderboard'
import { ResultsChart } from './ResultsChart'
import { useResultsPanel } from '@/hooks/useResultsPanel'

type Props = {
  events: TypingEvent[]
  timeLimit: number
  wpm: number
  correctCount: number
  totalCount: number
  mode: 'chinese' | 'english'
  onRetry: () => void
}

export function IdeTerminalResults({ events, timeLimit, wpm, correctCount, totalCount, mode, onRetry }: Props) {
  useTranslation()
  const { accuracy, chartData, showSubmit, setShowSubmit, refreshKey, onSubmitSuccess } =
    useResultsPanel({ events, timeLimit, wpm, correctCount, totalCount, mode })

  return (
    <div className="h-full overflow-y-auto font-mono text-sm p-6 select-text">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <span className="text-green-500">❯</span>
          <span>typing-fun --mode={mode} --time={timeLimit}s</span>
        </div>

        <div className="text-green-500 mb-5">✓ session complete</div>

        <div className="mb-6 space-y-1">
          <StatRow label="wpm" value={String(wpm)} />
          <StatRow label="accuracy" value={`${accuracy}%`} />
          <StatRow label="correct" value={String(correctCount)} />
        </div>

        <div className="text-muted-foreground/50 text-xs mb-2"># wpm over time</div>
        <div className="mb-7">
          <ResultsChart data={chartData} height={130} fontSize={11} dotRadius={2} />
        </div>

        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <span className="text-green-500">❯</span>
          <button onClick={onRetry} className="text-primary hover:opacity-70 cursor-pointer transition-opacity">
            retry
          </button>
          <span className="text-muted-foreground/30">·</span>
          <button onClick={() => setShowSubmit(true)} className="text-primary hover:opacity-70 cursor-pointer transition-opacity">
            submit --leaderboard
          </button>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground mb-6">
          <span className="text-green-500">❯</span>
          <span className="animate-pulse">▋</span>
        </div>

        <div className="text-muted-foreground/50 text-xs mb-2"># leaderboard ({mode} · {timeLimit}s)</div>
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

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-muted-foreground w-24 shrink-0">{label}</span>
      <span className="text-foreground font-semibold">{value}</span>
    </div>
  )
}
