import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export type TypingEvent = { elapsed: number; correct: boolean }

type Props = {
  events: TypingEvent[]
  timeLimit: number
  wpm: number
  correctCount: number
  totalCount: number
  onRetry: () => void
}

function computeChartData(events: TypingEvent[], timeLimit: number) {
  const bucketSize = 5
  const bucketCount = Math.ceil(timeLimit / bucketSize)

  return Array.from({ length: bucketCount }, (_, i) => {
    const start = i * bucketSize
    const end = Math.min((i + 1) * bucketSize, timeLimit)
    const bucket = events.filter((e) => e.elapsed >= start && e.elapsed < end)
    const correct = bucket.filter((e) => e.correct).length
    const errors = bucket.filter((e) => !e.correct).length
    return {
      time: `${start}s`,
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
  onRetry,
}: Props) {
  const { t } = useTranslation()
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
  const chartData = computeChartData(events, timeLimit)

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-primary mb-6 text-center">
          {t('results.title')}
        </h2>

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
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
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
                cursor={{ stroke: 'hsl(var(--border))' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="wpm"
                name={t('results.wpm')}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3, fill: 'hsl(var(--primary))' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="errors"
                name={t('results.errors')}
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                strokeOpacity={0.7}
                dot={{ r: 3, fill: 'hsl(var(--destructive))' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="text-center">
          <Button onClick={onRetry} size="lg">
            {t('results.retry')}
          </Button>
        </div>
      </div>
    </div>
  )
}
