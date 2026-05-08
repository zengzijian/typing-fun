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
import { useTranslation } from 'react-i18next'

interface ChartPoint {
  time: string
  wpm: number
  errors: number
}

interface Props {
  data: ChartPoint[]
  height?: number
  fontSize?: number
  dotRadius?: number
}

export function ResultsChart({ data, height = 160, fontSize = 12, dotRadius = 3 }: Props) {
  const { t } = useTranslation()
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fontSize, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          width={fontSize === 12 ? 32 : 28}
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: fontSize === 12 ? '6px' : '4px',
            fontSize,
          }}
          cursor={{ stroke: 'hsl(var(--border))' }}
        />
        <Legend wrapperStyle={{ fontSize }} />
        <Line
          type="monotone"
          dataKey="wpm"
          name={t('results.wpm')}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: dotRadius, fill: 'hsl(var(--primary))' }}
          activeDot={{ r: dotRadius + 2 }}
        />
        <Line
          type="monotone"
          dataKey="errors"
          name={t('results.errors')}
          stroke="hsl(var(--destructive))"
          strokeWidth={fontSize === 12 ? 2 : 1.5}
          strokeOpacity={0.7}
          dot={{ r: dotRadius, fill: 'hsl(var(--destructive))' }}
          activeDot={{ r: dotRadius + 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
