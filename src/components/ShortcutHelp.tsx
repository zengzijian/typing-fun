const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const modKey = isMac ? '⌘' : 'Ctrl'

const shortcuts: { keys: string[][]; description: string }[] = [
  { keys: [['Tab + Enter']], description: 'Retry' },
  { keys: [['F1'], [modKey, '\\']], description: 'IDE camouflage' },
  { keys: [['F2']], description: 'Focus mode' },
]

export function ShortcutHelp() {
  return (
    <div className="fixed bottom-4 right-4 z-[80] group">
      <button
        className="w-8 h-8 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm text-muted-foreground/50 hover:text-muted-foreground hover:border-border flex items-center justify-center text-sm font-semibold transition-colors cursor-default"
        tabIndex={-1}
        aria-label="Keyboard shortcuts"
      >
        ?
      </button>
      <div className="absolute bottom-10 right-0 hidden group-hover:block dropdown-enter">
        <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-2xl p-4 w-72">
          <div className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/40 uppercase mb-3">
            Keyboard Shortcuts
          </div>
          <div className="space-y-2.5">
            {shortcuts.map(({ keys, description }) => (
              <div key={description} className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground/80 text-sm shrink-0">{description}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {keys.map((combo, i) => (
                    <span key={i} className="flex items-center gap-0.5">
                      {i > 0 && <span className="text-muted-foreground/30 mx-1 text-xs">or</span>}
                      {combo.map((k, j) => (
                        <span key={k} className="flex items-center gap-0.5">
                          {j > 0 && <span className="text-muted-foreground/30 text-xs">+</span>}
                          <kbd className={`inline-flex items-center px-2 py-0.5 rounded-[4px] bg-background text-foreground/75 font-mono border border-border/60 border-b-[2px] leading-5 select-none ${k === '⌘' ? 'text-base' : 'text-xs'}`}>
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
