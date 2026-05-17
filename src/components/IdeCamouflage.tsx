import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { CAMOUFLAGE_THEMES } from '@/data/themes'

const FAKE_FILES = ['utils.ts', 'index.tsx', 'main.py', 'App.tsx', 'server.ts', 'helpers.ts']

export function pickFakeFile(): string {
  return FAKE_FILES[Math.floor(Math.random() * FAKE_FILES.length)]
}

interface Props {
  timeLeft: number
  wpm: number
  activeFile: string
  children: ReactNode
  themeId?: string
  onThemeChange?: (id: string) => void
  onExit?: () => void
  isFocusMode?: boolean
  onFocusToggle?: () => void
  typingMode?: 'chinese' | 'english'
  onTypingModeToggle?: () => void
  timeLimit?: number
  onTimeLimitChange?: (t: number) => void
  timeOptions?: readonly number[]
  isTerminal?: boolean
}

export function IdeCamouflage({ timeLeft, wpm, activeFile, children, themeId = 'one-dark', onThemeChange, onExit, isFocusMode, onFocusToggle, typingMode = 'chinese', onTypingModeToggle, timeLimit, onTimeLimitChange, timeOptions, isTerminal = false }: Props) {
  const { t } = useTranslation()
  const tabs = [activeFile, ...FAKE_FILES.filter((f) => f !== activeFile).slice(0, 2)]
  const lang = activeFile.endsWith('.py') ? 'Python' : activeFile.endsWith('.tsx') ? 'TSX' : 'TypeScript'

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* macOS-style title bar */}
      <div className="flex items-center gap-2 px-4 h-8 bg-card border-b border-border text-xs text-muted-foreground/50 select-none shrink-0">
        <div className="group flex gap-[10px] mr-2">
          <button
            onClick={onExit}
            className="w-[14px] h-[14px] rounded-full bg-red-500/70 group-hover:bg-red-500 transition-colors cursor-pointer flex items-center justify-center"
            title="退出摸鱼模式"
          >
            <svg className="hidden group-hover:block w-1.5 h-1.5" viewBox="0 0 6 6" fill="none" stroke="#7a0000" strokeWidth="1.2" strokeLinecap="round">
              <line x1="1" y1="1" x2="5" y2="5" />
              <line x1="5" y1="1" x2="1" y2="5" />
            </svg>
          </button>
          <span className="w-[14px] h-[14px] rounded-full bg-yellow-500/70 group-hover:bg-yellow-500 transition-colors flex items-center justify-center">
            <svg className="hidden group-hover:block w-1.5 h-1.5" viewBox="0 0 6 6" fill="none" stroke="#6a4400" strokeWidth="1.2" strokeLinecap="round">
              <line x1="1" y1="3" x2="5" y2="3" />
            </svg>
          </span>
          <span className="w-[14px] h-[14px] rounded-full bg-green-500/70 group-hover:bg-green-500 transition-colors flex items-center justify-center">
            <svg className="hidden group-hover:block w-1.5 h-1.5" viewBox="0 0 6 6" fill="none" stroke="#006420" strokeWidth="1.2" strokeLinecap="round">
              <line x1="1" y1="5" x2="5" y2="1" />
              <line x1="3" y1="1" x2="5" y2="1" /><line x1="5" y1="1" x2="5" y2="3" />
              <line x1="1" y1="3" x2="1" y2="5" /><line x1="1" y1="5" x2="3" y2="5" />
            </svg>
          </span>
        </div>
        <span className="flex-1 text-center">{activeFile} — Visual Studio Code</span>
        <div className="flex items-center gap-2 ml-2">
          {onFocusToggle && (
            <button
              onClick={onFocusToggle}
              title={isFocusMode ? t('typing.focusExit') : t('typing.focusEnter')}
              className={`transition-opacity text-base leading-none cursor-pointer ${isFocusMode ? 'opacity-80 text-primary' : 'opacity-40 hover:opacity-80 text-muted-foreground'}`}
            >
              <i className={isFocusMode ? 'ri-focus-3-fill' : 'ri-focus-3-line'} />
            </button>
          )}
          {onThemeChange && (
            <MiniThemeSelector themeId={themeId} onThemeChange={onThemeChange} />
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center border-b border-border bg-card text-xs select-none shrink-0">
        <div className="flex flex-1">
          {tabs.map((file) => (
            <div
              key={file}
              className={`flex items-center gap-2 px-4 py-2 border-r border-border cursor-default whitespace-nowrap ${
                file === activeFile
                  ? 'bg-background text-foreground border-t-2 border-t-primary'
                  : 'text-muted-foreground/50'
              }`}
            >
              <span>{file}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 font-mono text-primary font-semibold shrink-0">
          {timeLeft}s
        </div>
      </div>

      {/* Editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Line numbers — hidden in terminal mode */}
        {!isTerminal && (
          <div className="flex flex-col items-end pt-2 px-3 text-muted-foreground/25 text-sm font-mono select-none bg-background border-r border-border/20 shrink-0 w-12">
            {typingMode === 'chinese'
              ? Array.from({ length: 60 }, (_, i) => (
                  <span key={i} className="leading-6">{i + 1}</span>
                ))
              : Array.from({ length: 30 }, (_, i) => (
                  <span key={i} className="leading-loose">{i + 1}</span>
                ))
            }
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 h-6 bg-primary text-primary-foreground text-xs font-mono select-none shrink-0">
        <div className="flex items-center gap-4">
          <span>{lang}</span>
          <span>Ln 1, Col {wpm > 0 ? (wpm % 80) + 1 : 1}</span>
          <span>UTF-8</span>
          <span>LF</span>
        </div>
        <div className="flex items-center gap-4">
          {onTypingModeToggle && (
            <button
              onClick={onTypingModeToggle}
              title={typingMode === 'chinese' ? t('typing.modeEn') : t('typing.modeZh')}
              className="opacity-80 hover:opacity-100 cursor-pointer transition-opacity"
            >
              {typingMode === 'chinese' ? t('typing.modeZh') : t('typing.modeEn')}
            </button>
          )}
          {onTimeLimitChange && timeOptions && timeLimit !== undefined && (
            <div className="flex items-center gap-1">
              {timeOptions.map((sec) => (
                <button
                  key={sec}
                  onClick={() => onTimeLimitChange(sec)}
                  className={`cursor-pointer transition-opacity ${
                    sec === timeLimit ? 'opacity-100' : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          )}
          <span>WPM {wpm}</span>
        </div>
      </div>
    </div>
  )
}

function MiniThemeSelector({ themeId, onThemeChange }: { themeId: string; onThemeChange: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = CAMOUFLAGE_THEMES.find((t) => t.id === themeId) ?? CAMOUFLAGE_THEMES[0]

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-muted-foreground/60 hover:text-muted-foreground text-xs cursor-pointer transition-colors"
      >
        <MiniSwatches preview={current.preview} preview2={current.preview2} />
        <span>{current.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded shadow-xl z-50 w-44 max-h-64 overflow-y-auto">
          {CAMOUFLAGE_THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => { onThemeChange(t.id); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left transition-colors hover:bg-secondary/60 ${
                t.id === themeId ? 'text-primary bg-secondary/40' : 'text-muted-foreground'
              }`}
            >
              <MiniSwatches preview={t.preview} preview2={t.preview2} />
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function MiniSwatches({ preview, preview2 }: { preview: string; preview2: string }) {
  return (
    <span className="flex flex-shrink-0 overflow-hidden rounded-sm border border-white/15">
      <span className="w-3 h-3 flex-shrink-0" style={{ background: preview }} />
      <span className="w-3 h-3 flex-shrink-0" style={{ background: preview2 }} />
    </span>
  )
}
