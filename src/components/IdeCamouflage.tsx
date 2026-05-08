import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

const FAKE_FILES = ['utils.ts', 'index.tsx', 'main.py', 'App.tsx', 'server.ts', 'helpers.ts']

export function pickFakeFile(): string {
  return FAKE_FILES[Math.floor(Math.random() * FAKE_FILES.length)]
}

interface Props {
  timeLeft: number
  wpm: number
  activeFile: string
  children: ReactNode
  isDark?: boolean
  onThemeToggle?: () => void
  isFocusMode?: boolean
  onFocusToggle?: () => void
  typingMode?: 'chinese' | 'english'
  onTypingModeToggle?: () => void
  timeLimit?: number
  onTimeLimitChange?: (t: number) => void
  timeOptions?: readonly number[]
  isTerminal?: boolean
}

export function IdeCamouflage({ timeLeft, wpm, activeFile, children, isDark = true, onThemeToggle, isFocusMode, onFocusToggle, typingMode = 'chinese', onTypingModeToggle, timeLimit, onTimeLimitChange, timeOptions, isTerminal = false }: Props) {
  const { t } = useTranslation()
  const tabs = [activeFile, ...FAKE_FILES.filter((f) => f !== activeFile).slice(0, 2)]
  const lang = activeFile.endsWith('.py') ? 'Python' : activeFile.endsWith('.tsx') ? 'TSX' : 'TypeScript'

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* macOS-style title bar */}
      <div className="flex items-center gap-2 px-4 h-8 bg-card border-b border-border text-xs text-muted-foreground/50 select-none shrink-0">
        <div className="flex gap-1.5 mr-2">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <span className="w-3 h-3 rounded-full bg-green-500/70" />
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
          {onThemeToggle && (
            <button
              onClick={onThemeToggle}
              title={isDark ? t('typing.themeLight') : t('typing.themeDark')}
              className="opacity-40 hover:opacity-80 transition-opacity text-muted-foreground cursor-pointer text-base leading-none"
            >
              <i className={isDark ? 'ri-moon-line' : 'ri-sun-line'} />
            </button>
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
