import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { wordList } from '@/data/words'
import { englishWordList } from '@/data/englishWords'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { TypingResults, type TypingEvent } from '@/components/TypingResults'
import { IdeTerminalResults } from '@/components/IdeTerminalResults'
import { useTheme } from '@/hooks/useTheme'
import { ThemeSelector } from '@/components/ThemeSelector'
import { IdeCamouflage, pickFakeFile } from '@/components/IdeCamouflage'
import { useTranslation } from 'react-i18next'
import { ShortcutHelp } from '@/components/ShortcutHelp'

type WordStatus = 'pending' | 'correct' | 'error'
type TypingMode = 'chinese' | 'english'

type GameWord = { display: string; target: string }

const TIME_OPTIONS = [15, 30, 60, 90] as const

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// Ensure no two consecutive single-character display words.
// Picks N unique random insertion slots among the (multis.length + 1) gaps of
// the multi-char sequence, then places singles there. Because each slot is
// unique and separated by at least one multi, consecutive singles are
// mathematically impossible as long as multis.length + 1 >= singles.length.
function spreadSingleCharWords(words: GameWord[]): GameWord[] {
  const singles = words.filter((w) => w.display.length === 1)
  const multis = words.filter((w) => w.display.length > 1)

  if (singles.length === 0) return words

  const slots = shuffleArray(Array.from({ length: multis.length + 1 }, (_, i) => i))
    .slice(0, singles.length)
    .sort((a, b) => a - b)

  const result: GameWord[] = []
  let si = 0

  for (let mi = 0; mi <= multis.length; mi++) {
    while (si < slots.length && slots[si] === mi) {
      result.push(singles[si++])
    }
    if (mi < multis.length) result.push(multis[mi])
  }

  return result
}

const SINGLE_CHAR_RATIO = 0.1

function samplePool<T>(pool: T[], n: number): T[] {
  const result: T[] = []
  while (result.length < n) {
    result.push(...shuffleArray(pool).slice(0, n - result.length))
  }
  return result
}

function sampleChineseWords(total: number): GameWord[] {
  const allSingles = wordList.filter((e) => e.chinese.length === 1)
  const allDoubles = wordList.filter((e) => e.chinese.length === 2)
  const allTriples = wordList.filter((e) => e.chinese.length === 3)

  const nSingles = Math.floor(total * SINGLE_CHAR_RATIO)
  const nMulti = total - nSingles
  // 2-char : 3-char = 7 : 3
  const nDoubles = Math.round(nMulti * 7 / 10)
  const nTriples = nMulti - nDoubles

  const singles = samplePool(allSingles, nSingles).map((e) => ({ display: e.chinese, target: e.pinyin }))
  const doubles = samplePool(allDoubles, nDoubles).map((e) => ({ display: e.chinese, target: e.pinyin }))
  const triples = samplePool(allTriples, nTriples).map((e) => ({ display: e.chinese, target: e.pinyin }))

  return spreadSingleCharWords([...singles, ...shuffleArray([...doubles, ...triples])])
}

const INITIAL_WORD_COUNT = 200
const APPEND_WORD_COUNT = 50

function toGameWords(mode: TypingMode): GameWord[] {
  if (mode === 'english') {
    return shuffleArray(englishWordList).slice(0, INITIAL_WORD_COUNT).map((e) => ({
      display: e.word,
      target: e.word,
    }))
  }
  return sampleChineseWords(INITIAL_WORD_COUNT)
}

function appendGameWords(mode: TypingMode): GameWord[] {
  if (mode === 'english') {
    return shuffleArray(englishWordList).slice(0, APPEND_WORD_COUNT).map((e) => ({
      display: e.word,
      target: e.word,
    }))
  }
  return sampleChineseWords(APPEND_WORD_COUNT)
}

function Typing() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<TypingMode>('chinese')
  const [words, setWords] = useState<GameWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentInput, setCurrentInput] = useState('')
  const [statuses, setStatuses] = useState<WordStatus[]>([])
  const [completedInputs, setCompletedInputs] = useState<string[]>([])
  const [timeLimit, setTimeLimit] = useState<number>(() => {
    const stored = localStorage.getItem('typing-fun-time-limit')
    const parsed = stored ? parseInt(stored, 10) : NaN
    return (TIME_OPTIONS as readonly number[]).includes(parsed) ? parsed : 60
  })
  const [isCamouflage, setIsCamouflage] = useState(() =>
    localStorage.getItem('typing-fun-camouflage') === 'true'
  )
  const [isFocusMode, setIsFocusMode] = useState(() =>
    localStorage.getItem('typing-fun-focus') === 'true'
  )
  const [gameKey, setGameKey] = useState(0)
  const [activeFile, setActiveFile] = useState(pickFakeFile)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isActive, setIsActive] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [wpm, setWpm] = useState(0)
  const { themeId, setThemeId, themes } = useTheme()

  const currentWordRef = useRef<HTMLDivElement>(null)
  const typingEventsRef = useRef<TypingEvent[]>([])
  const cursorMarkerRef = useRef<HTMLSpanElement>(null)
  const cursorDivRef = useRef<HTMLDivElement>(null)
  const wordsContainerRef = useRef<HTMLDivElement>(null)
  const wordsScrollRef = useRef<HTMLDivElement>(null)
  const prevCursorTopRef = useRef<number | null>(null)
  const tabActiveRef = useRef(false)
  const focusTopOverlayRef = useRef<HTMLDivElement>(null)
  const focusBottomOverlayRef = useRef<HTMLDivElement>(null)

  const initGame = (limit: number, nextMode: TypingMode = mode) => {
    setGameKey((k) => k + 1)
    setWords(toGameWords(nextMode))
    setStatuses(new Array(INITIAL_WORD_COUNT).fill('pending'))
    setCompletedInputs([])
    setActiveFile(pickFakeFile())
    setCurrentIndex(0)
    setCurrentInput('')
    setTimeLimit(limit)
    setTimeLeft(limit)
    setIsActive(false)
    setIsComplete(false)
    setCorrectCount(0)
    setWpm(0)
    typingEventsRef.current = []
    prevCursorTopRef.current = null
    if (wordsScrollRef.current) wordsScrollRef.current.scrollTop = 0
  }

  const handleModeChange = (nextMode: TypingMode) => {
    setMode(nextMode)
    initGame(timeLimit, nextMode)
  }

  useEffect(() => {
    initGame(timeLimit)
  }, [])

  useEffect(() => {
    if (!isActive || isComplete) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsComplete(true)
          setIsActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, isComplete])

  useEffect(() => {
    if (isActive && !isComplete) {
      const elapsed = timeLimit - timeLeft
      if (elapsed > 0) {
        setWpm(Math.round((correctCount / elapsed) * 60))
      }
    }
  }, [timeLeft, correctCount, timeLimit, isActive, isComplete])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        tabActiveRef.current = true
        return
      }

      if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        return
      }

      if (e.key === 'Enter' && tabActiveRef.current) {
        tabActiveRef.current = false
        initGame(timeLimit)
        return
      }

      if (e.key === 'F1' || (e.ctrlKey && e.key === '\\')) {
        e.preventDefault()
        setIsCamouflage((prev) => {
          const next = !prev
          localStorage.setItem('typing-fun-camouflage', String(next))
          return next
        })
        return
      }

      if (isComplete) return

      if (e.key === 'F2') {
        e.preventDefault()
        setIsFocusMode((prev) => {
          const next = !prev
          localStorage.setItem('typing-fun-focus', String(next))
          return next
        })
        return
      }

      tabActiveRef.current = false

      if (!isActive && e.key.length === 1) {
        setIsActive(true)
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (currentInput.trim() === '') return

        const currentWord = words[currentIndex]
        const isCorrect = currentInput === currentWord.target
        const elapsed = timeLimit - timeLeft
        typingEventsRef.current = [...typingEventsRef.current, { elapsed, correct: isCorrect }]

        setCompletedInputs((prev) => {
          const next = [...prev]
          next[currentIndex] = currentInput
          return next
        })

        setStatuses((prev) => {
          const newStatuses = [...prev]
          newStatuses[currentIndex] = isCorrect ? 'correct' : 'error'
          return newStatuses
        })

        if (isCorrect) {
          setCorrectCount((prev) => prev + 1)
        }

        setCurrentIndex((prev) => {
          const next = prev + 1
          if (next >= words.length - 30) {
            const newWords = appendGameWords(mode)
            setWords((prevWords) => [...prevWords, ...newWords])
            setStatuses((prevStatuses) => [
              ...prevStatuses,
              ...new Array(APPEND_WORD_COUNT).fill('pending'),
            ])
          }
          return next
        })

        setCurrentInput('')
        return
      }

      if (e.key === 'Backspace') {
        if (currentInput.length === 0 && currentIndex > 0 && statuses[currentIndex - 1] === 'error') {
          const prevIndex = currentIndex - 1
          const prevInput = completedInputs[prevIndex] ?? ''
          setCurrentIndex(prevIndex)
          setCurrentInput(prevInput)
          setStatuses((prev) => {
            const next = [...prev]
            next[prevIndex] = 'pending'
            return next
          })
          setCompletedInputs((prev) => {
            const next = [...prev]
            next[prevIndex] = ''
            return next
          })
        } else {
          setCurrentInput((prev) => prev.slice(0, -1))
        }
        return
      }

      if (e.key.length === 1) {
        setCurrentInput((prev) => prev + e.key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    words,
    currentIndex,
    currentInput,
    isActive,
    isComplete,
    timeLimit,
    mode,
    isCamouflage,
    isFocusMode,
  ])

  useEffect(() => {
    document.title = isCamouflage ? `${activeFile} — Visual Studio Code` : 'Typing Fun'
    return () => { document.title = 'Typing Fun' }
  }, [isCamouflage, activeFile])

  useLayoutEffect(() => {
    const marker = cursorMarkerRef.current
    const cursorEl = cursorDivRef.current
    const container = wordsContainerRef.current
    if (!marker || !cursorEl || !container) return

    const markerRect = marker.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    const newLeft = markerRect.left - containerRect.left
    const newTop = markerRect.top - containerRect.top

    const prevTop = prevCursorTopRef.current
    const isSameLine = prevTop !== null && Math.abs(newTop - prevTop) < 4
    prevCursorTopRef.current = newTop

    cursorEl.style.transition = isSameLine ? 'left 120ms ease' : 'none'
    cursorEl.style.left = newLeft + 'px'
    cursorEl.style.top = newTop + 'px'
    if (markerRect.height > 0) {
      cursorEl.style.height = markerRect.height + 'px'
    }

    if (wordsScrollRef.current && currentWordRef.current) {
      const wordEl = currentWordRef.current
      const gap = isCamouflage ? 8 : 24 // gap-2 : gap-6
      const rowHeight = wordEl.offsetHeight + gap
      const paddingTop = parseFloat(getComputedStyle(container).paddingTop)
      // paddingTop always equals gap (pt-6==gap-6 for normal; pt-2==gap-2 for camouflage),
      // so max(0, offsetTop - paddingTop - rowHeight) naturally yields 0 for rows 1-2 and
      // scrolls exactly one rowHeight per row after that, keeping row(N-2) just off-screen.
      const targetScrollTop = Math.max(0, wordEl.offsetTop - paddingTop - rowHeight)
      wordsScrollRef.current.scrollTop = targetScrollTop

      if (isFocusMode) {
        const scrollContainer = wordsScrollRef.current
        const wordRect = wordEl.getBoundingClientRect()
        const containerRect = scrollContainer.getBoundingClientRect()
        const rowVisualTop = wordRect.top - containerRect.top
        if (focusTopOverlayRef.current) {
          focusTopOverlayRef.current.style.height = `${Math.max(0, rowVisualTop)}px`
        }
        if (focusBottomOverlayRef.current) {
          focusBottomOverlayRef.current.style.top = `${rowVisualTop + wordRect.height}px`
        }
      }
    }
  }, [currentInput, currentIndex, isCamouflage, isFocusMode, gameKey])

  const handleTimeChange = (newTime: number) => {
    localStorage.setItem('typing-fun-time-limit', String(newTime))
    initGame(newTime)
  }

  const currentWord = words[currentIndex]
  const expectedTarget = currentWord?.target || ''

  // Camouflage mode needs higher contrast; normal mode stays with the subtle palette
  const clr = isCamouflage
    ? {
        pendingCn:   'text-foreground/70',
        doneCn:      'text-foreground/30',
        errorCn:     'text-destructive/80',
        pendingPy:   'text-foreground/70',
        donePy:      'text-primary/60',
        untypedChar: 'text-foreground/60',
        doneCorrect: 'text-primary/60',
        doneError:   'text-destructive/80',
      }
    : {
        pendingCn:   'text-muted-foreground/60',
        doneCn:      'text-muted-foreground/30',
        errorCn:     'text-destructive/40',
        pendingPy:   'text-muted-foreground',
        donePy:      'text-primary/30',
        untypedChar: 'text-muted-foreground',
        doneCorrect: 'text-primary/30',
        doneError:   'text-destructive/60',
      }

  // Exact height = p-6 top-padding (1.5rem) + 4×wordHeight + 3×rowGap
  // Normal modes: gap-6 == p-6 == 1.5rem → p6 + 4×(wh+gap) − gap = 4×rowHeight (gap cancels)
  // Camouflage:   gap-2 = 0.5rem ≠ p-6 = 1.5rem → need +1rem vs the naive ×4 formula
  // Height = pt + 4×wordHeight + 3×gap  (pt == gap in every mode, so = 4×rowHeight)
  // Normal English:     4×(2.25+1.5)rem = 15rem
  // Normal Chinese:     4×(4.5 +1.5)rem = 24rem
  // Camouflage English: 4×(1.25+0.5)rem =  7rem
  // Camouflage Chinese: 4×(2.5 +0.5)rem = 12rem
  const scrollHeightCls = isCamouflage
    ? (mode === 'chinese' ? 'h-[12rem]' : 'h-[7rem]')
    : (mode === 'chinese' ? 'h-[24rem]' : 'h-[15rem]')

  const wordsContainer = (
    <div ref={wordsContainerRef} className={`relative flex flex-wrap px-6 pb-6 ${isCamouflage ? 'pt-2 gap-2' : 'pt-6 gap-6'}`}>
      <div
        ref={cursorDivRef}
        className="absolute pointer-events-none w-[2px] bg-primary"
        style={{ left: 0, top: 0 }}
        aria-hidden="true"
      />
      {words.map((word, index) => {
        const status = statuses[index]
        const isCurrent = index === currentIndex
        const isPending = status === 'pending' && !isCurrent
        const isCorrect = status === 'correct'

        const focusAheadDiff = isFocusMode ? index - currentIndex : 0
        const focusOpacity =
          focusAheadDiff <= 0 ? undefined
          : focusAheadDiff === 1 ? 0.55
          : focusAheadDiff === 2 ? 0.28
          : focusAheadDiff === 3 ? 0.1
          : 0

        return (
          <div
            key={`${word.display}-${index}`}
            ref={isCurrent ? currentWordRef : null}
            className="flex flex-col items-center gap-1 transition-opacity duration-150"
            style={focusOpacity !== undefined ? { opacity: focusOpacity } : undefined}
          >
            {mode === 'chinese' && (
              <div
                className={`${isCamouflage ? 'text-xs' : 'text-2xl'} ${
                  isPending
                    ? clr.pendingCn
                    : isCurrent
                    ? 'text-foreground'
                    : isCorrect
                    ? clr.doneCn
                    : clr.errorCn
                }`}
              >
                {word.display}
              </div>
            )}
            <div
              className={`font-mono ${isCamouflage ? 'text-sm tracking-normal' : 'text-3xl tracking-wide'} ${
                isPending
                  ? clr.pendingPy
                  : isCurrent
                  ? ''
                  : isCorrect
                  ? clr.donePy
                  : ''
              }`}
            >
              {isCurrent ? (
                <span className="inline-flex relative">
                  {expectedTarget.split('').map((expectedChar, i) => {
                    const inputChar = currentInput[i]
                    const isTyped = i < currentInput.length
                    const isCharCorrect = isTyped && inputChar === expectedChar
                    const isCharError = isTyped && inputChar !== expectedChar
                    const isCursor = i === currentInput.length

                    return (
                      <span key={i} className="relative inline-block">
                        {isCursor && (
                          <span
                            ref={cursorMarkerRef}
                            className="absolute w-0 top-0 bottom-0 pointer-events-none"
                            style={{ left: '-2px' }}
                            aria-hidden="true"
                          />
                        )}
                        <span
                          className={
                            isCharError
                              ? 'text-destructive'
                              : isCharCorrect
                              ? 'text-primary'
                              : clr.untypedChar
                          }
                        >
                          {expectedChar}
                        </span>
                      </span>
                    )
                  })}
                  {currentInput.length > expectedTarget.length &&
                    currentInput.slice(expectedTarget.length).split('').map((overflowChar, i) => {
                      const isLast = i === currentInput.length - expectedTarget.length - 1
                      return (
                        <span key={`ov-${i}`} className="relative inline-block text-destructive">
                          {overflowChar}
                          {isLast && (
                            <span
                              ref={cursorMarkerRef}
                              className="absolute top-0 bottom-0 w-0 pointer-events-none"
                              style={{ right: '-2px' }}
                              aria-hidden="true"
                            />
                          )}
                        </span>
                      )
                    })}
                  {currentInput.length === expectedTarget.length && (
                    <span
                      ref={cursorMarkerRef}
                      className="absolute right-0 top-0 bottom-0 w-0 pointer-events-none"
                      aria-hidden="true"
                    />
                  )}
                </span>
              ) : !isCurrent && status === 'error' ? (
                (() => {
                  const submitted = completedInputs[index] ?? ''
                  const target = word.target
                  const maxLen = Math.max(target.length, submitted.length)
                  return (
                    <span className="inline-flex">
                      {Array.from({ length: maxLen }, (_, i) => {
                        const tc = target[i]
                        const sc = submitted[i]
                        const hasError = sc !== tc
                        return (
                          <span
                            key={i}
                            className={hasError ? clr.doneError : clr.doneCorrect}
                          >
                            {tc ?? sc}
                          </span>
                        )
                      })}
                    </span>
                  )
                })()
              ) : mode === 'chinese' ? (
                word.target
              ) : (
                word.display
              )}
            </div>
          </div>
        )
      })}
    </div>
  )


  if (isComplete && !isCamouflage) {
    return (
      <div className="fixed inset-x-0 bottom-0 top-16 bg-background text-foreground flex items-center justify-center p-4 overflow-y-auto">
        <TypingResults
          events={typingEventsRef.current}
          timeLimit={timeLimit}
          wpm={wpm}
          correctCount={correctCount}
          totalCount={currentIndex}
          mode={mode}
          onRetry={() => initGame(timeLimit)}
        />
      </div>
    )
  }

  if (isCamouflage) {
    return (
      <div className="fixed inset-0 bg-background text-foreground z-[60]">
        <IdeCamouflage
          timeLeft={timeLeft}
          wpm={wpm}
          activeFile={isComplete ? 'output.log' : activeFile}
          themeId={themeId}
          onThemeChange={(id) => setThemeId(id)}
          onExit={() => {
            localStorage.setItem('typing-fun-camouflage', 'false')
            setIsCamouflage(false)
          }}
          typingMode={mode}
          onTypingModeToggle={() => handleModeChange(mode === 'chinese' ? 'english' : 'chinese')}
          timeLimit={timeLimit}
          onTimeLimitChange={handleTimeChange}
          timeOptions={TIME_OPTIONS}
          isFocusMode={isFocusMode}
          onFocusToggle={() => setIsFocusMode((prev) => {
            const next = !prev
            localStorage.setItem('typing-fun-focus', String(next))
            return next
          })}
          isTerminal={isComplete}
        >
          {isComplete ? (
            <IdeTerminalResults
              events={typingEventsRef.current}
              timeLimit={timeLimit}
              wpm={wpm}
              correctCount={correctCount}
              totalCount={currentIndex}
              mode={mode}
              onRetry={() => initGame(timeLimit)}
            />
          ) : (
            <div className="relative">
              <div ref={wordsScrollRef} className={`overflow-hidden ${scrollHeightCls}`}>
                {wordsContainer}
              </div>
              {isFocusMode && !isComplete && (
                <>
                  <div ref={focusTopOverlayRef} className="absolute inset-x-0 top-0 pointer-events-none z-10 bg-background" style={{ height: 0 }} />
                  <div ref={focusBottomOverlayRef} className="absolute inset-x-0 bottom-0 pointer-events-none z-10 bg-background" style={{ top: '100%' }} />
                </>
              )}
            </div>
          )}
        </IdeCamouflage>
      </div>
    )
  }

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 bg-background text-foreground flex flex-col items-center px-4 py-8 select-none">
      <div className="w-full max-w-6xl flex flex-col flex-1">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary">
            {t('typing.slogan')}
          </h1>
        </header>

        <div className="flex-1 flex items-center -translate-y-[30px]">
          <div className="relative w-full">
            <div ref={wordsScrollRef} className={`overflow-hidden ${scrollHeightCls}`}>
              {wordsContainer}
            </div>
            {isFocusMode && (
              <>
                <div ref={focusTopOverlayRef} className="absolute inset-x-0 top-0 pointer-events-none z-10 bg-background" style={{ height: 0 }} />
                <div ref={focusBottomOverlayRef} className="absolute inset-x-0 bottom-0 pointer-events-none z-10 bg-background" style={{ top: '100%' }} />
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-6">
          <div className="text-4xl font-bold text-primary">
            {timeLeft}s
          </div>
          <div className="text-3xl font-mono text-muted-foreground">
            WPM: {wpm}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => initGame(timeLimit)}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>

          <select
            value={mode}
            onChange={(e) => handleModeChange(e.target.value as TypingMode)}
            className="bg-card border border-border rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 focus:outline-none focus:border-primary cursor-pointer transition-colors"
          >
            <option value="chinese">{t('typing.modeZh')}</option>
            <option value="english">{t('typing.modeEn')}</option>
          </select>

          <div className="flex gap-2">
            {TIME_OPTIONS.map((time) => (
              <Button
                key={time}
                variant="ghost"
                onClick={() => handleTimeChange(time)}
                className={`${
                  timeLimit === time
                    ? 'text-primary border border-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {time}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeSelector
              themeId={themeId}
              themes={themes}
              onThemeChange={setThemeId}
            />
            <button
              onClick={() => setIsFocusMode((prev) => {
                const next = !prev
                localStorage.setItem('typing-fun-focus', String(next))
                return next
              })}
              title={isFocusMode ? t('typing.focusExit') : t('typing.focusEnter')}
              className={`flex items-center px-2.5 py-1.5 rounded-md border text-sm transition-colors ${
                isFocusMode
                  ? 'border-primary text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/40'
              }`}
            >
              <i className={isFocusMode ? 'ri-focus-3-fill' : 'ri-focus-3-line'} />
            </button>
          </div>
        </div>

      </div>
      <ShortcutHelp />
    </div>
  )
}

export default Typing
