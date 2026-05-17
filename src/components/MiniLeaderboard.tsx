import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUserId } from '@/lib/auth'
import { useTranslation } from 'react-i18next'

interface Score {
  id: string
  user_id: string
  nickname: string
  wpm: number
  accuracy: number
  created_at: string
}

interface Props {
  timeLimit: number
  mode: 'chinese' | 'english'
  refreshKey?: number
}

const RANK_ICON = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : String(i + 1))

export function MiniLeaderboard({ timeLimit, mode, refreshKey }: Props) {
  const { t } = useTranslation()
  const [scores, setScores] = useState<Score[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentUserId().then(setCurrentUserId)
    setLoading(true)
    supabase
      .from('typing_scores')
      .select('id, user_id, nickname, wpm, accuracy, created_at')
      .eq('time_limit', timeLimit)
      .eq('mode', mode)
      .order('wpm', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setScores(data ?? [])
        setLoading(false)
      })
  }, [timeLimit, mode, refreshKey])

  if (loading) {
    return <p className="text-muted-foreground text-xs py-4 text-center">{t('leaderboard.loading')}</p>
  }
  if (scores.length === 0) {
    return <p className="text-muted-foreground text-xs py-4 text-center">{t('leaderboard.empty')}</p>
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-card border-b border-border text-muted-foreground uppercase tracking-wide">
            <th className="px-3 py-2 text-left w-8">#</th>
            <th className="px-3 py-2 text-left">{t('leaderboard.player')}</th>
            <th className="px-3 py-2 text-right">WPM</th>
            <th className="px-3 py-2 text-right">{t('results.accuracy')}</th>
            <th className="px-3 py-2 text-right">{t('leaderboard.date')}</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score, i) => {
            const isMe = score.user_id === currentUserId
            return (
              <tr
                key={score.id}
                className={`border-b border-border/50 last:border-0 ${isMe ? 'bg-primary/5' : ''}`}
              >
                <td className="px-3 py-2 font-mono text-muted-foreground">{RANK_ICON(i)}</td>
                <td className="px-3 py-2 font-medium truncate max-w-[120px]">
                  {score.nickname}
                  {isMe && <span className="ml-1.5 text-primary/60">(you)</span>}
                </td>
                <td className="px-3 py-2 text-right font-mono font-semibold text-primary">{score.wpm}</td>
                <td className="px-3 py-2 text-right font-mono text-muted-foreground">{score.accuracy}%</td>
                <td className="px-3 py-2 text-right font-mono text-muted-foreground">{new Date(score.created_at).toLocaleString()}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
