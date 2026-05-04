import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { type Theme } from '@/data/themes'

type Props = {
  themeId: string
  themes: Theme[]
  onThemeChange: (id: string) => void
}

export function ThemeSelector({ themeId, themes, onThemeChange }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const current = themes.find((t) => t.id === themeId) ?? themes[0]

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  // Scroll active item into view when opening
  useEffect(() => {
    if (!open || !listRef.current) return
    const active = listRef.current.querySelector('[data-active="true"]') as HTMLElement | null
    active?.scrollIntoView({ block: 'nearest' })
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 bg-card border border-border rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 focus:outline-none focus:border-primary transition-colors"
      >
        <ColorDots theme={current} />
        <span>{current.name}</span>
        <ChevronDown
          className={`w-3 h-3 ml-0.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          ref={listRef}
          className="absolute bottom-full mb-1.5 left-0 bg-card border border-border rounded-md shadow-xl z-50 w-48 max-h-72 overflow-y-auto"
        >
          {themes.map((t) => (
            <button
              key={t.id}
              data-active={t.id === themeId}
              onClick={() => {
                onThemeChange(t.id)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors hover:bg-secondary/60 ${
                t.id === themeId
                  ? 'text-primary bg-secondary/40'
                  : 'text-muted-foreground'
              }`}
            >
              <ColorDots theme={t} />
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ColorDots({ theme }: { theme: Theme }) {
  return (
    <span className="flex flex-shrink-0 overflow-hidden rounded-sm border border-white/15">
      <span
        className="w-5 h-5 flex-shrink-0"
        style={{ background: theme.preview }}
      />
      <span
        className="w-5 h-5 flex-shrink-0"
        style={{ background: theme.preview2 }}
      />
    </span>
  )
}
