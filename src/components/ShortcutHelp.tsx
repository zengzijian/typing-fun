const shortcuts: { keys: string[][]; description: string }[] = [
  { keys: [['Tab + Enter']], description: 'Retry' },
  { keys: [['F1'], ['Ctrl', '\\']], description: 'IDE camouflage' },
  { keys: [['F2']], description: 'Focus mode' },
  { keys: [['Space']], description: 'Submit word' },
  { keys: [['a–z']], description: 'Start game' },
]

export function ShortcutHelp() {
  return (
    <div className="fixed bottom-4 right-4 z-[80] group">
      <button
        className="w-8 h-8 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 flex items-center justify-center text-sm font-semibold shadow-md transition-colors cursor-default"
        tabIndex={-1}
        aria-label="Keyboard shortcuts"
      >
        ?
      </button>
      <div className="absolute bottom-10 right-0 hidden group-hover:block">
        <div className="bg-popover border border-border rounded-lg shadow-lg p-3 w-64 text-xs">
          <div className="text-muted-foreground font-semibold mb-2 tracking-wide uppercase text-[10px]">
            Keyboard Shortcuts
          </div>
          <div className="space-y-1.5">
            {shortcuts.map(({ keys, description }) => (
              <div key={description} className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{description}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {keys.map((combo, i) => (
                    <span key={i} className="flex items-center gap-0.5">
                      {i > 0 && <span className="text-muted-foreground/40 mx-1">or</span>}
                      {combo.map((k, j) => (
                        <span key={k} className="flex items-center gap-0.5">
                          {j > 0 && <span className="text-muted-foreground/40">+</span>}
                          <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-[10px] border border-border">
                            {k}
                          </kbd>
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
