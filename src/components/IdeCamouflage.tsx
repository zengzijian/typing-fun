import type { ReactNode } from 'react'

const FAKE_FILES = ['utils.ts', 'index.tsx', 'main.py', 'App.tsx', 'server.ts', 'helpers.ts']

export function pickFakeFile(): string {
  return FAKE_FILES[Math.floor(Math.random() * FAKE_FILES.length)]
}

interface Props {
  timeLeft: number
  wpm: number
  activeFile: string
  children: ReactNode
}

export function IdeCamouflage({ timeLeft, wpm, activeFile, children }: Props) {
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
        {/* Line numbers */}
        <div className="flex flex-col items-end pt-6 px-3 text-muted-foreground/25 text-sm font-mono select-none bg-background border-r border-border/20 shrink-0 w-12">
          {Array.from({ length: 30 }, (_, i) => (
            <span key={i} className="leading-loose">{i + 1}</span>
          ))}
        </div>

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
          <span>WPM {wpm}</span>
        </div>
      </div>
    </div>
  )
}
