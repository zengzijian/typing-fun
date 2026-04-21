import { useEffect, useRef, useState, useCallback } from 'react'
import type { GameEngineState, Language } from '../game/types'
import { createInitialState, gameLoop, handleKeyInput, handleUpgradeKey, startGame, renderStatic } from '../game/engine'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants'
import { getCategoryColor } from '../game/upgrades'

export default function MechGame() {
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
  const rafRef = useRef<number>(0)
  const langRef = useRef<Language>('zh')

  const onStateChange = useCallback((s: GameEngineState) => {
    stateRef.current = s
    setUiState(s.gameState)
    setScore(s.score)
    setMaxCombo(s.maxCombo)
    setLevel(s.level)
    setWave(s.wave)
    if (s.gameState === 'UPGRADE') {
      setUpgradeOptions(s.upgradeOptions)
      setUpgradeInput('')
    }
  }, [])

  // game loop
  useEffect(() => {
    if (uiState !== 'PLAYING') return

    const loop = (ts: number) => {
      if (!stateRef.current) return
      stateRef.current.lastTime = stateRef.current.lastTime || ts
      const next = gameLoop(stateRef.current, ts, onStateChange)
      stateRef.current = next
      if (next.gameState === 'PLAYING') {
        rafRef.current = requestAnimationFrame(loop)
      }
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [uiState, onStateChange])

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
        if (next.gameState === 'PLAYING') {
          next.lastTime = performance.now()
          setUiState('PLAYING')
        } else {
          setUpgradeInput(next.upgradeInput)
          if (next.gameState === 'VICTORY') setUiState('VICTORY')
        }
        return
      }

      if (s.gameState === 'PLAYING') {
        e.preventDefault()
        const next = handleKeyInput(s, e.key)
        stateRef.current = next
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

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
    if (stateRef.current) {
      stateRef.current = { ...stateRef.current, language: l }
    }
  }

  const handleStart = () => {
    if (!stateRef.current) return
    const newState = startGame({ ...stateRef.current, language: langRef.current })
    newState.lastTime = performance.now()
    stateRef.current = newState
    setUiState('PLAYING')
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
                  MECH DEFENDER
                </h1>
                <p className="text-[#64748b] text-sm mt-2 tracking-wider">机甲守护者 — 打字防御游戏</p>
              </div>

              <div className="flex justify-center gap-3">
                <LangBtn active={lang === 'zh'} onClick={() => handleLangChange('zh')}>中文拼音</LangBtn>
                <LangBtn active={lang === 'en'} onClick={() => handleLangChange('en')}>English</LangBtn>
              </div>

              <div className="text-[#94a3b8] text-sm space-y-1">
                <p>消灭所有入侵的机甲单位，保护中心核心</p>
                <p>输入敌人上方的文字将其摧毁</p>
                <p><kbd className="px-2 py-0.5 bg-[#1e293b] rounded text-xs">Backspace</kbd> 删除 · <kbd className="px-2 py-0.5 bg-[#1e293b] rounded text-xs">Esc</kbd> 暂停</p>
              </div>

              <button
                onClick={handleStart}
                className="px-8 py-3 bg-[#00e5ff11] border border-[#00e5ff] text-[#00e5ff] rounded font-bold tracking-widest hover:bg-[#00e5ff22] transition-colors"
                style={{ textShadow: '0 0 10px #00e5ff88' }}
              >
                START GAME
              </button>
              <p className="text-[#475569] text-xs">按 Enter 或 Space 快速开始</p>
            </div>
          </Overlay>
        )}

        {/* PAUSED overlay */}
        {uiState === 'PAUSED' && (
          <Overlay>
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-[#94a3b8] tracking-widest">PAUSED</h2>
              <p className="text-[#64748b] text-sm">按 ESC 继续游戏</p>
            </div>
          </Overlay>
        )}

        {/* WAVE_CLEAR overlay */}
        {uiState === 'WAVE_CLEAR' && (
          <Overlay>
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-[#22c55e] tracking-widest" style={{ textShadow: '0 0 20px #22c55e88' }}>
                WAVE CLEAR
              </h2>
              <p className="text-[#94a3b8] text-sm">Wave {wave} 已清除！</p>
              <p className="text-[#64748b] text-xs">按 Enter / Space 继续下一波</p>
            </div>
          </Overlay>
        )}

        {/* UPGRADE overlay */}
        {uiState === 'UPGRADE' && (
          <Overlay>
            <div className="text-center space-y-6 max-w-md w-full">
              <div>
                <h2 className="text-2xl font-bold text-[#00e5ff] tracking-widest">LEVEL {level} COMPLETE</h2>
                <p className="text-[#64748b] text-sm mt-1">选择一项升级</p>
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
                        const key = letter
                        const next = handleUpgradeKey(stateRef.current, key)
                        stateRef.current = next
                        if (next.gameState === 'PLAYING') {
                          next.lastTime = performance.now()
                          setUiState('PLAYING')
                        } else if (next.gameState === 'VICTORY') {
                          setUiState('VICTORY')
                        } else {
                          setUpgradeInput(next.upgradeInput)
                        }
                      }}
                    >
                      <span className="text-lg font-bold font-mono" style={{ color }}>[{letter}]</span>
                      <div className="text-left">
                        <div className="font-bold text-sm" style={{ color }}>{opt.label}</div>
                        <div className="text-[#64748b] text-xs mt-0.5">{opt.description}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="text-[#475569] text-xs">
                输入 A / B / C 选择，或直接点击
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
                GAME OVER
              </h2>
              <div className="text-[#94a3b8] space-y-1 text-sm">
                <p>Score: <span className="text-[#e2e8f0] font-bold">{score}</span></p>
                <p>Max Combo: <span className="text-[#fbbf24] font-bold">×{maxCombo}</span></p>
                <p>Reached Level: <span className="text-[#e2e8f0] font-bold">{level}</span></p>
              </div>
              <button
                onClick={() => {
                  const canvas = canvasRef.current!
                  const fresh = createInitialState(canvas, langRef.current)
                  stateRef.current = fresh
                  setUiState('MENU')
                  setScore(0)
                  setMaxCombo(0)
                }}
                className="px-6 py-2 bg-[#ef444411] border border-[#ef4444] text-[#ef4444] rounded font-bold tracking-widest hover:bg-[#ef444422] transition-colors"
              >
                RETRY
              </button>
              <p className="text-[#475569] text-xs">按 Enter / Space 返回主菜单</p>
            </div>
          </Overlay>
        )}

        {/* VICTORY overlay */}
        {uiState === 'VICTORY' && (
          <Overlay>
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-[#a855f7] tracking-widest" style={{ textShadow: '0 0 20px #a855f788' }}>
                VICTORY
              </h2>
              <p className="text-[#94a3b8] text-sm">你已消灭所有入侵机甲！</p>
              <div className="text-[#94a3b8] space-y-1 text-sm">
                <p>Final Score: <span className="text-[#e2e8f0] font-bold text-lg">{score}</span></p>
                <p>Max Combo: <span className="text-[#fbbf24] font-bold">×{maxCombo}</span></p>
              </div>
              <button
                onClick={() => {
                  const canvas = canvasRef.current!
                  const fresh = createInitialState(canvas, langRef.current)
                  stateRef.current = fresh
                  setUiState('MENU')
                  setScore(0)
                  setMaxCombo(0)
                }}
                className="px-6 py-2 bg-[#a855f711] border border-[#a855f7] text-[#a855f7] rounded font-bold tracking-widest hover:bg-[#a855f722] transition-colors"
              >
                PLAY AGAIN
              </button>
            </div>
          </Overlay>
        )}
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
