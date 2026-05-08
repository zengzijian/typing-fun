import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { ensureAnonymousAuth, getCurrentUserId } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/components/Toaster'

const NICKNAME_KEY = 'typing-fun-nickname'

interface Props {
  wpm: number
  accuracy: number
  timeLimit: number
  mode: 'chinese' | 'english'
  onClose: () => void
  onSuccess?: () => void
}

export function SubmitScore({ wpm, accuracy, timeLimit, mode, onClose, onSuccess }: Props) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [nickname, setNickname] = useState(() => localStorage.getItem(NICKNAME_KEY) ?? '')
  const [showInput, setShowInput] = useState(() => !localStorage.getItem(NICKNAME_KEY))
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [rank, setRank] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async () => {
    const trimmed = nickname.trim()
    if (!trimmed) return

    setStatus('submitting')
    try {
      let userId = await getCurrentUserId()
      if (!userId) {
        await ensureAnonymousAuth()
        userId = await getCurrentUserId()
      }
      if (!userId) throw new Error('Not authenticated')

      const { error: insertError } = await supabase
        .from('typing_scores')
        .insert({ user_id: userId, nickname: trimmed, wpm, accuracy, time_limit: timeLimit, mode })

      if (insertError) throw insertError

      // Sync nickname across all existing records if it changed
      const prevNickname = localStorage.getItem(NICKNAME_KEY)
      if (prevNickname && prevNickname !== trimmed) {
        await supabase
          .from('typing_scores')
          .update({ nickname: trimmed })
          .eq('user_id', userId)
          .neq('nickname', trimmed)
      }

      localStorage.setItem(NICKNAME_KEY, trimmed)

      const { count } = await supabase
        .from('typing_scores')
        .select('*', { count: 'exact', head: true })
        .eq('time_limit', timeLimit)
        .eq('mode', mode)
        .gt('wpm', wpm)

      setRank((count ?? 0) + 1)
      setStatus('success')
      toast(t('leaderboard.submitSuccess'))
      onSuccess?.()
    } catch (err) {
      console.error(err)
      setErrorMsg(t('leaderboard.error'))
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        {status === 'success' ? (
          <div className="text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-primary mb-2">{t('leaderboard.submitSuccess')}</h3>
            <p className="text-muted-foreground mb-6">
              {t('leaderboard.rank', { rank })}
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/leaderboard" onClick={onClose}>
                <Button variant="outline" size="sm">{t('leaderboard.view')}</Button>
              </Link>
              <Button size="sm" onClick={onClose}>{t('leaderboard.close')}</Button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4">{t('leaderboard.submitTitle')}</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mb-4">
              <span className="text-muted-foreground">WPM</span>
              <span className="font-mono font-semibold text-primary">{wpm}</span>
              <span className="text-muted-foreground">{t('results.accuracy')}</span>
              <span className="font-mono font-semibold">{accuracy}%</span>
              <span className="text-muted-foreground">{t('leaderboard.timeLimit')}</span>
              <span className="font-mono font-semibold">{timeLimit}s</span>
              <span className="text-muted-foreground">{t('leaderboard.modeLabel')}</span>
              <span className="font-mono font-semibold">
                {mode === 'chinese' ? t('typing.modeZh') : t('typing.modeEn')}
              </span>
              <span className="text-muted-foreground">{t('leaderboard.nickname')}</span>
              {showInput ? (
                <span />
              ) : (
                <span className="flex items-center gap-2 font-mono font-semibold">
                  {nickname}
                  <button
                    onClick={() => setShowInput(true)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {t('leaderboard.changeNickname')}
                  </button>
                </span>
              )}
            </div>
            {showInput && (
              <div className="mb-4">
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={t('leaderboard.nicknamePlaceholder')}
                  maxLength={20}
                  autoFocus
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            )}
            {status === 'error' && (
              <p className="text-destructive text-xs mb-3">{errorMsg}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={onClose}>{t('leaderboard.cancel')}</Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={status === 'submitting' || !nickname.trim()}
              >
                {status === 'submitting' ? t('leaderboard.submitting') : t('leaderboard.submit')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
