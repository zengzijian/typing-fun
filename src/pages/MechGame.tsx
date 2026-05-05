import { useEffect, useRef, useState, useCallback } from 'react'
import type { GameEngineState, Language } from '../game/types'
import { createInitialState, gameLoop, handleKeyInput, handleUpgradeKey, startGame, renderStatic } from '../game/engine'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants'
import { getCategoryColor } from '../game/upgrades'
import { playSound, setMuted, isMuted } from '../game/audio'
import { loadRecord, updateRecord } from '../game/storage'
import type { GameRecord } from '../game/storage'
import { useTranslation } from 'react-i18next'

// --- screen shake ---
function useScreenShake(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const shakeRef = useRef(0)
  const rafRef = useRef(0)

  const animateShake = useCallback(() => {
    const el = canvasRef.current
    if (!el) return
    shakeRef.current *= 0.82
    if (shakeRef.current < 0.4) {
      el.style.transform = ''
      return
    }
    const i = shakeRef.current
    el.style.transform = `translate(${(Math.random() - 0.5) * i}px, ${(Math.random() - 0.5) * i}px)`
    rafRef.current = requestAnimationFrame(animateShake)
  }, [canvasRef])

  const triggerShake = useCallback((intensity: number) => {
    cancelAnimationFrame(rafRef.current)
    shakeRef.current = Math.max(shakeRef.current, intensity)
    rafRef.current = requestAnimationFrame(animateShake)
  }, [animateShake])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  return triggerShake
}

export default function MechGame() {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<GameEngineState | null>(null)
  const [uiState, setUiState] = useState<GameEngineState['gameState']>('MENU')
  const [lang, setLang] = useState<Language>('zh')
  const [score, setScore] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [upgradeOptions, setUpgradeOptions] = useState<GameEngineState['upgradeOptions']>([])
  const [upgradeInput, setUpgradeInput] = useState('')
  const [level, setLevel] = useState(1)
  const [wave, setWave] = useState(1)
  const [muted, setMutedState] = useState(isMuted)
  const [record, setRecord] = useState<GameRecord>(() => loadRecord('zh'))
  const [isNewRecord, setIsNewRecord] = useState(false)
  const rafRef = useRef<number>(0)
  const langRef = useRef<Language>('zh')
  const triggerShake = useScreenShake(canvasRef)

  const onStateChange = useCallback((s: GameEngineState) => {
    stateRef.current = s
    setUiState(s.gameState)
    setScore(s.score)
    setMaxCombo(s.maxCombo)
    setLevel(s.level)
    setWave(s.wave)

    // consume feedback events
    for (const ev of s.pendingEvents) {
      playSound(ev)
    }
    if (s.pendingShake > 0) {
      triggerShake(s.pendingShake)
    }

    if (s.gameState === 'UPGRADE') {
      setUpgradeOptions(s.upgradeOptions)
      setUpgradeInput('')
    }

    if (s.gameState === 'GAME_OVER' || s.gameState === 'VICTORY') {
      const updated = updateRecord(langRef.current, s.score, s.maxCombo, s.level)
      setRecord(updated)
      setIsNewRecord(
        s.score > loadRecord(langRef.current).highScore ||
        s.maxCombo > loadRecord(langRef.current).bestCombo,
      )
    }
  }, [triggerShake])

  // game loop
  useEffect(() => {
    if (uiState !== 'PLAYING') return

    const loop = (ts: number) => {
      if (!stateRef.current) return
      stateRef.current.lastTime = stateRef.current.lastTime || ts
      const next = gameLoop(stateRef.current, ts, onStateChange)

      // consume feedback events from loop result
      for (const ev of next.pendingEvents) {
        playSound(ev)
      }
      if (next.pendingShake > 0) triggerShake(next.pendingShake)

      stateRef.current = next
      if (next.gameState === 'PLAYING') {
        rafRef.current = requestAnimationFrame(loop)
      }
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [uiState, onStateChange, triggerShake])

  // keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!stateRef.current) return
      const s = stateRef.current

      if (s.gameState === 'MENU') {
        if (e.key === 'Enter' || e.key === ' ') {
          const newState = startGame({ ...s, language: langRef.current })
          newState.lastTime = performance.now()
          stateRef.current = newState
          setRecord(loadRecord(langRef.current))
          setIsNewRecord(false)
          setUiState('PLAYING')
        }
        return
      }

      if (s.gameState === 'GAME_OVER' || s.gameState === 'VICTORY') {
        if (e.key === 'Enter' || e.key === ' ') {
          const canvas = canvasRef.current!
          const fresh = createInitialState(canvas, langRef.current)
          stateRef.current = fresh
          setUiState('MENU')
          setScore(0)
          setMaxCombo(0)
          setIsNewRecord(false)
        }
        return
      }

      if (s.gameState === 'PAUSED') {
        if (e.key === 'Escape') {
          stateRef.current = { ...s, gameState: 'PLAYING', lastTime: performance.now() }
          setUiState('PLAYING')
        }
        return
      }

      if (s.gameState === 'WAVE_CLEAR') {
        if (e.key === 'Enter' || e.key === ' ') {
          stateRef.current = { ...s, gameState: 'PLAYING', lastTime: performance.now() }
          setUiState('PLAYING')
        }
        return
      }

      if (s.gameState === 'UPGRADE') {
        e.preventDefault()
        const next = handleUpgradeKey(s, e.key)
        stateRef.current = next
        for (const ev of next.pendingEvents) playSound(ev)
        if (next.gameState === 'PLAYING') {
          next.lastTime = performance.now()
          setUiState('PLAYING')
        } else {
          setUpgradeInput(next.upgradeInput)
          if (next.gameState === 'VICTORY') {
            const updated = updateRecord(langRef.current, next.score, next.maxCombo, next.level)
            setRecord(updated)
            setUiState('VICTORY')
          }
        }
        return
      }

      if (s.gameState === 'PLAYING') {
        e.preventDefault()
        const next = handleKeyInput(s, e.key)
        for (const ev of next.pendingEvents) playSound(ev)
        if (next.pendingShake > 0) triggerShake(next.pendingShake)
        stateRef.current = next
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [triggerShake])

  // init canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const s = createInitialState(canvas, lang)
    stateRef.current = s
    langRef.current = lang
    renderStatic(s)
  }, [])

  const handleLangChange = (l: Language) => {
    setLang(l)
    langRef.current = l
    setRecord(loadRecord(l))
    if (stateRef.current) {
      stateRef.current = { ...stateRef.current, language: l }
    }
  }

  const handleStart = () => {
    if (!stateRef.current) return
    const newState = startGame({ ...stateRef.current, language: langRef.current })
    newState.lastTime = performance.now()
    stateRef.current = newState
    setRecord(loadRecord(langRef.current))
    setIsNewRecord(false)
    setUiState('PLAYING')
  }

  const handleMuteToggle = () => {
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0d1a] pt-14">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block rounded-lg border border-[#1a2a4a]"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* MENU overlay */}
        {uiState === 'MENU' && (
          <Overlay>
            <div className="text-center space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-[#00e5ff] tracking-widest" style={{ textShadow: '0 0 20px #00e5ff88' }}>
                  {t('game.title')}
                </h1>
                <p className="text-[#64748b] text-sm mt-2 tracking-wider">{t('game.subtitle')}</p>
              </div>

              <div className="flex justify-center gap-3">
                <LangBtn active={lang === 'zh'} onClick={() => handleLangChange('zh')}>{t('game.modeZh')}</LangBtn>
                <LangBtn active={lang === 'en'} onClick={() => handleLangChange('en')}>{t('game.modeEn')}</LangBtn>
              </div>

              {/* Historical record */}
              {record.totalGames > 0 && (
                <div className="text-[#475569] text-xs space-y-0.5">
                  <p>{t('game.highScore')} <span className="text-[#94a3b8] font-bold">{record.highScore.toLocaleString()}</span>
                    {'  ·  '}{t('game.bestCombo')} <span className="text-[#fbbf24] font-bold">×{record.bestCombo}</span></p>
                </div>
              )}

              <div className="text-[#94a3b8] text-sm space-y-1">
                <p>{t('game.desc1')}</p>
                <p>{t('game.desc2')}</p>
                <p><kbd className="px-2 py-0.5 bg-[#1e293b] rounded text-xs">Backspace</kbd> {t('game.deleteHint')} · <kbd className="px-2 py-0.5 bg-[#1e293b] rounded text-xs">Esc</kbd> {t('game.pauseHint')}</p>
              </div>

              <button
                onClick={handleStart}
                className="px-8 py-3 bg-[#00e5ff11] border border-[#00e5ff] text-[#00e5ff] rounded font-bold tracking-widest hover:bg-[#00e5ff22] transition-colors"
                style={{ textShadow: '0 0 10px #00e5ff88' }}
              >
                {t('game.start')}
              </button>
              <p className="text-[#475569] text-xs">{t('game.startHint')}</p>
            </div>
          </Overlay>
        )}

        {/* PAUSED overlay */}
        {uiState === 'PAUSED' && (
          <Overlay>
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-[#94a3b8] tracking-widest">{t('game.paused')}</h2>
              <p className="text-[#64748b] text-sm">{t('game.pausedHint')}</p>
            </div>
          </Overlay>
        )}

        {/* WAVE_CLEAR overlay */}
        {uiState === 'WAVE_CLEAR' && (
          <Overlay>
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-[#22c55e] tracking-widest" style={{ textShadow: '0 0 20px #22c55e88' }}>
                {t('game.waveClear')}
              </h2>
              <p className="text-[#94a3b8] text-sm">{t('game.waveClearMsg', { wave })}</p>
              <p className="text-[#64748b] text-xs">{t('game.waveClearHint')}</p>
            </div>
          </Overlay>
        )}

        {/* UPGRADE overlay */}
        {uiState === 'UPGRADE' && (
          <Overlay>
            <div className="text-center space-y-6 max-w-md w-full">
              <div>
                <h2 className="text-2xl font-bold text-[#00e5ff] tracking-widest">{t('game.levelComplete', { level })}</h2>
                <p className="text-[#64748b] text-sm mt-1">{t('game.chooseUpgrade')}</p>
              </div>

              <div className="space-y-3">
                {upgradeOptions.map((opt, i) => {
                  const letter = ['A', 'B', 'C'][i]
                  const color = getCategoryColor(opt.category)
                  const isTyped = upgradeInput === letter.toLowerCase()
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-start gap-3 p-3 rounded border transition-colors cursor-pointer ${isTyped ? 'border-opacity-100 bg-opacity-20' : 'border-opacity-30 hover:border-opacity-60'}`}
                      style={{ borderColor: color, backgroundColor: isTyped ? color + '22' : color + '0a' }}
                      onClick={() => {
                        if (!stateRef.current) return
                        const next = handleUpgradeKey(stateRef.current, letter)
                        stateRef.current = next
                        for (const ev of next.pendingEvents) playSound(ev)
                        if (next.gameState === 'PLAYING') {
                          next.lastTime = performance.now()
                          setUiState('PLAYING')
                        } else if (next.gameState === 'VICTORY') {
                          const updated = updateRecord(langRef.current, next.score, next.maxCombo, next.level)
                          setRecord(updated)
                          setUiState('VICTORY')
                        } else {
                          setUpgradeInput(next.upgradeInput)
                        }
                      }}
                    >
                      <span className="text-lg font-bold font-mono" style={{ color }}>[{letter}]</span>
                      <div className="text-left">
                        <div className="font-bold text-sm" style={{ color }}>{t(opt.nameKey)}</div>
                        <div className="text-[#64748b] text-xs mt-0.5">{t(opt.descKey)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="text-[#475569] text-xs">
                {t('game.upgradeHint')}
                {upgradeInput && <span className="text-[#00e5ff] ml-2">&gt; {upgradeInput}_</span>}
              </div>
            </div>
          </Overlay>
        )}

        {/* GAME_OVER overlay */}
        {uiState === 'GAME_OVER' && (
          <Overlay>
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-[#ef4444] tracking-widest" style={{ textShadow: '0 0 20px #ef444488' }}>
                {t('game.gameOver')}
              </h2>
              {isNewRecord && (
                <p className="text-[#fbbf24] font-bold text-sm tracking-widest" style={{ textShadow: '0 0 10px #fbbf2488' }}>
                  ★ {t('game.newRecord')}
                </p>
              )}
              <div className="text-[#94a3b8] space-y-1 text-sm">
                <p>{t('game.score')} <span className="text-[#e2e8f0] font-bold">{score}</span>
                  {score >= record.highScore && score > 0 && <span className="text-[#fbbf24] ml-2 text-xs">↑ BEST</span>}
                </p>
                <p>{t('game.maxCombo')} <span className="text-[#fbbf24] font-bold">×{maxCombo}</span></p>
                <p>{t('game.reachedLevel')} <span className="text-[#e2e8f0] font-bold">{level}</span></p>
                {record.totalGames > 1 && (
                  <p className="text-[#475569] text-xs mt-2">
                    {t('game.highScore')} {record.highScore.toLocaleString()} · {t('game.bestCombo')} ×{record.bestCombo}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  const canvas = canvasRef.current!
                  const fresh = createInitialState(canvas, langRef.current)
                  stateRef.current = fresh
                  setUiState('MENU')
                  setScore(0)
                  setMaxCombo(0)
                  setIsNewRecord(false)
                }}
                className="px-6 py-2 bg-[#ef444411] border border-[#ef4444] text-[#ef4444] rounded font-bold tracking-widest hover:bg-[#ef444422] transition-colors"
              >
                {t('game.retry')}
              </button>
              <p className="text-[#475569] text-xs">{t('game.retryHint')}</p>
            </div>
          </Overlay>
        )}

        {/* VICTORY overlay */}
        {uiState === 'VICTORY' && (
          <Overlay>
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-[#a855f7] tracking-widest" style={{ textShadow: '0 0 20px #a855f788' }}>
                {t('game.victory')}
              </h2>
              {isNewRecord && (
                <p className="text-[#fbbf24] font-bold text-sm tracking-widest">★ {t('game.newRecord')}</p>
              )}
              <p className="text-[#94a3b8] text-sm">{t('game.victoryMsg')}</p>
              <div className="text-[#94a3b8] space-y-1 text-sm">
                <p>{t('game.finalScore')} <span className="text-[#e2e8f0] font-bold text-lg">{score}</span></p>
                <p>{t('game.maxCombo')} <span className="text-[#fbbf24] font-bold">×{maxCombo}</span></p>
              </div>
              <button
                onClick={() => {
                  const canvas = canvasRef.current!
                  const fresh = createInitialState(canvas, langRef.current)
                  stateRef.current = fresh
                  setUiState('MENU')
                  setScore(0)
                  setMaxCombo(0)
                  setIsNewRecord(false)
                }}
                className="px-6 py-2 bg-[#a855f711] border border-[#a855f7] text-[#a855f7] rounded font-bold tracking-widest hover:bg-[#a855f722] transition-colors"
              >
                {t('game.playAgain')}
              </button>
            </div>
          </Overlay>
        )}

        {/* mute button (top-right of canvas) */}
        <button
          onClick={handleMuteToggle}
          className="absolute top-2 right-2 px-2 py-1 text-xs rounded border border-[#1e293b] text-[#475569] hover:text-[#94a3b8] hover:border-[#475569] transition-colors"
          title={muted ? t('game.unmute') : t('game.mute')}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  )
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-lg" style={{ background: 'rgba(10,13,26,0.88)' }}>
      {children}
    </div>
  )
}

function LangBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded text-sm font-medium border transition-colors ${active ? 'border-[#00e5ff] text-[#00e5ff] bg-[#00e5ff11]' : 'border-[#1e293b] text-[#64748b] hover:border-[#475569]'}`}
    >
      {children}
    </button>
  )
}
