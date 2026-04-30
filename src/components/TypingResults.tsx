import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Button } from '@/components/ui/button'

export type TypingEvent = { elapsed: number; correct: boolean }

type Props = {
  events: TypingEvent[]
  timeLimit: number
  wpm: number
  correctCount: number
  totalCount: number
  mode: 'chinese' | 'english'
  onRetry: () => void
}

function computeChartData(events: TypingEvent[], timeLimit: number) {
  const bucketCount = 6
  const bucketSize = timeLimit / bucketCount

  return Array.from({ length: bucketCount }, (_, i) => {
    const start = i * bucketSize
    const end = (i + 1) * bucketSize
    const bucket = events.filter((e) => e.elapsed >= start && e.elapsed < end)
    const correct = bucket.filter((e) => e.correct).length
    const errors = bucket.filter((e) => !e.correct).length
    return {
      time: `${Math.round(start)}s`,
      wpm: Math.round(correct * (60 / bucketSize)),
      errors,
    }
  })
}

export function TypingResults({
  events,
  timeLimit,
  wpm,
  correctCount,
  totalCount,
  mode,
  onRetry,
}: Props) {
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
  const chartData = computeChartData(events, timeLimit)

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-primary mb-6 text-center">
          {mode === 'chinese' ? '完成！' : 'Done!'}
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">{wpm}</div>
            <div className="text-sm text-muted-foreground mt-1">WPM</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">{accuracy}%</div>
            <div className="text-sm text-muted-foreground mt-1">
              {mode === 'chinese' ? '准确率' : 'Accuracy'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">{correctCount}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {mode === 'chinese' ? '正确词数' : 'Correct'}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-sm text-muted-foreground mb-3">
            {mode === 'chinese' ? '每段 WPM' : 'WPM over time'}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: 12,
                }}
                cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
              />
              <Bar dataKey="wpm" name="WPM" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              <Bar dataKey="errors" name={mode === 'chinese' ? '错误' : 'Errors'} fill="hsl(var(--destructive))" radius={[3, 3, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="text-center">
          <Button onClick={onRetry} size="lg">
            {mode === 'chinese' ? '再来一次' : 'Try Again'}
          </Button>
        </div>
      </div>
    </div>
  )
}
