import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUserId } from '@/lib/auth'
import { useTranslation } from 'react-i18next'

const TIME_OPTIONS = [15, 30, 60, 90] as const
type TimeOption = (typeof TIME_OPTIONS)[number]

interface Score {
  id: string
  user_id: string
  nickname: string
  wpm: number
  accuracy: number
  time_limit: number
  mode: string
  created_at: string
}

export default function Leaderboard() {
  const { t } = useTranslation()
  const [timeLimit, setTimeLimit] = useState<TimeOption>(60)
  const [mode, setMode] = useState<'chinese' | 'english'>('chinese')
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUserId().then(setCurrentUserId)
  }, [])

  useEffect(() => {
    setLoading(true)
    supabase
      .from('typing_scores')
      .select('*')
      .eq('time_limit', timeLimit)
      .eq('mode', mode)
      .order('wpm', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setScores(data ?? [])
        setLoading(false)
      })
  }, [timeLimit, mode])

  const rankIcon = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(i + 1))

  return (
    <div className="fixed inset-x-0 bottom-0 top-14 bg-background text-foreground overflow-auto">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">{t('leaderboard.title')}</h1>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center rounded-md border border-border overflow-hidden text-sm">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setTimeLimit(opt)}
                className={`px-3 py-1.5 transition-colors ${
                  timeLimit === opt
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                }`}
              >
                {opt}s
              </button>
            ))}
          </div>

          <div className="flex items-center rounded-md border border-border overflow-hidden text-sm">
            {(['chinese', 'english'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 transition-colors ${
                  mode === m
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                }`}
              >
                {m === 'chinese' ? t('typing.modeZh') : t('typing.modeEn')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm py-8 text-center">{t('leaderboard.loading')}</p>
        ) : scores.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">{t('leaderboard.empty')}</p>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-card border-b border-border text-muted-foreground text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left w-12">#</th>
                  <th className="px-4 py-3 text-left">{t('leaderboard.player')}</th>
                  <th className="px-4 py-3 text-right">WPM</th>
                  <th className="px-4 py-3 text-right">{t('results.accuracy')}</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">{t('leaderboard.date')}</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, i) => {
                  const isMe = score.user_id === currentUserId
                  return (
                    <tr
                      key={score.id}
                      className={`border-b border-border/50 last:border-0 transition-colors ${
                        isMe ? 'bg-primary/5' : 'hover:bg-card/60'
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-muted-foreground">{rankIcon(i)}</td>
                      <td className="px-4 py-3 font-medium">
                        {score.nickname}
                        {isMe && (
                          <span className="ml-2 text-xs text-primary/70">(you)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-primary">
                        {score.wpm}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                        {score.accuracy}%
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                        {new Date(score.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
