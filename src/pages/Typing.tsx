import { useState, useEffect, useRef } from 'react'
import { wordList } from '@/data/words'
import { englishWordList } from '@/data/englishWords'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

type WordStatus = 'pending' | 'correct' | 'error'
type CursorStyle = 'caret' | 'pulse'
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

function toGameWords(mode: TypingMode): GameWord[] {
  if (mode === 'english') {
    return shuffleArray(englishWordList).slice(0, 100).map((e) => ({
      display: e.word,
      target: e.word,
    }))
  }
  return shuffleArray(wordList).slice(0, 100).map((e) => ({
    display: e.chinese,
    target: e.pinyin,
  }))
}

function appendGameWords(mode: TypingMode): GameWord[] {
  if (mode === 'english') {
    return shuffleArray(englishWordList).slice(0, 20).map((e) => ({
      display: e.word,
      target: e.word,
    }))
  }
  return shuffleArray(wordList).slice(0, 20).map((e) => ({
    display: e.chinese,
    target: e.pinyin,
  }))
}

function Typing() {
  const [mode, setMode] = useState<TypingMode>('chinese')
  const [words, setWords] = useState<GameWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentInput, setCurrentInput] = useState('')
  const [statuses, setStatuses] = useState<WordStatus[]>([])
  const [timeLimit, setTimeLimit] = useState<number>(60)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isActive, setIsActive] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [cursorStyle, setCursorStyle] = useState<CursorStyle>('caret')

  const currentWordRef = useRef<HTMLDivElement>(null)

  const initGame = (limit: number, nextMode: TypingMode = mode) => {
    setWords(toGameWords(nextMode))
    setStatuses(new Array(100).fill('pending'))
    setCurrentIndex(0)
    setCurrentInput('')
    setTimeLimit(limit)
    setTimeLeft(limit)
    setIsActive(false)
    setIsComplete(false)
    setCorrectCount(0)
    setWpm(0)
  }

  const handleModeChange = (nextMode: TypingMode) => {
    setMode(nextMode)
    initGame(timeLimit, nextMode)
  }

  useEffect(() => {
    initGame(60)
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
    if (currentWordRef.current) {
      currentWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [currentIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete) return

      if (e.key === 'Tab') {
        e.preventDefault()
        initGame(timeLimit)
        return
      }

      if (!isActive && /^[a-z]$/.test(e.key)) {
        setIsActive(true)
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (currentInput.trim() === '') return

        const currentWord = words[currentIndex]
        const isCorrect = currentInput === currentWord.target

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
          if (next >= words.length - 10) {
            const newWords = appendGameWords(mode)
            setWords((prevWords) => [...prevWords, ...newWords])
            setStatuses((prevStatuses) => [
              ...prevStatuses,
              ...new Array(20).fill('pending'),
            ])
          }
          return next
        })

        setCurrentInput('')
        return
      }

      if (e.key === 'Backspace') {
        setCurrentInput((prev) => prev.slice(0, -1))
        return
      }

      if (/^[a-z]$/.test(e.key)) {
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
  ])

  const handleTimeChange = (newTime: number) => {
    initGame(newTime)
  }

  const currentWord = words[currentIndex]
  const expectedTarget = currentWord?.target || ''

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-2">
            {mode === 'chinese' ? '中文打字练习' : 'English Typing'}
          </h1>
          <p className="text-muted-foreground text-lg">
            an elegant typing experience, just start typing
          </p>
        </header>

        <div className="relative mb-8">
          <div className="h-64 overflow-hidden">
            <div className="flex flex-wrap gap-6 p-6">
              {words.map((word, index) => {
                const status = statuses[index]
                const isCurrent = index === currentIndex
                const isPending = status === 'pending' && !isCurrent
                const isCorrect = status === 'correct'
                const isError = status === 'error'

                return (
                  <div
                    key={`${word.display}-${index}`}
                    ref={isCurrent ? currentWordRef : null}
                    className="flex flex-col items-center gap-1"
                  >
                    {mode === 'chinese' && (
                      <div
                        className={`text-2xl ${
                          isPending
                            ? 'text-muted-foreground/60'
                            : isCurrent
                            ? 'text-foreground'
                            : isCorrect
                            ? 'text-muted-foreground/30'
                            : 'text-destructive/40'
                        }`}
                      >
                        {word.display}
                      </div>
                    )}
                    <div
                      className={`text-3xl font-mono tracking-wide ${
                        isPending
                          ? 'text-muted-foreground'
                          : isCurrent
                          ? ''
                          : isCorrect
                          ? 'text-primary/30'
                          : 'text-destructive/40'
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
                                    className={`absolute -left-[2px] top-0 bottom-0 w-[2px] bg-primary ${
                                      cursorStyle === 'caret'
                                        ? 'animate-blink'
                                        : 'animate-pulse'
                                    }`}
                                  />
                                )}
                                {isCharError ? (
                                  <span className="relative inline-block">
                                    <span className="text-muted-foreground/30">
                                      {expectedChar}
                                    </span>
                                    <span className="absolute inset-0 text-destructive">
                                      {inputChar}
                                    </span>
                                  </span>
                                ) : (
                                  <span
                                    className={
                                      isCharCorrect
                                        ? 'text-primary'
                                        : 'text-muted-foreground'
                                    }
                                  >
                                    {expectedChar}
                                  </span>
                                )}
                              </span>
                            )
                          })}
                          {currentInput.length === expectedTarget.length && (
                            <span
                              className={`absolute right-0 translate-x-full top-0 bottom-0 w-[2px] bg-primary ${
                                cursorStyle === 'caret'
                                  ? 'animate-blink'
                                  : 'animate-pulse'
                              }`}
                            />
                          )}
                        </span>
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
          </div>
        </div>

        <div className="flex items-center justify-between mb-8 px-6">
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
            className="bg-transparent border border-border rounded px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground focus:outline-none focus:border-primary cursor-pointer transition-colors"
          >
            <option value="chinese">中文拼音</option>
            <option value="english">English</option>
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

          <div className="flex gap-2 ml-8">
            <Button
              variant="ghost"
              onClick={() => setCursorStyle('pulse')}
              className={`${
                cursorStyle === 'pulse'
                  ? 'text-primary border border-primary'
                  : 'text-muted-foreground'
              }`}
            >
              pulse
            </Button>
            <Button
              variant="ghost"
              onClick={() => setCursorStyle('caret')}
              className={`${
                cursorStyle === 'caret'
                  ? 'text-primary border border-primary'
                  : 'text-muted-foreground'
              }`}
            >
              caret
            </Button>
          </div>
        </div>

        {isComplete && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-card border border-border rounded-lg p-12 text-center max-w-md">
              <h2 className="text-4xl font-bold text-primary mb-4">
                {mode === 'chinese' ? '完成！' : 'Done!'}
              </h2>
              <div className="space-y-4 text-2xl">
                <div>
                  <span className="text-muted-foreground">WPM: </span>
                  <span className="text-foreground font-bold">{wpm}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">正确数: </span>
                  <span className="text-foreground font-bold">
                    {correctCount}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">准确率: </span>
                  <span className="text-foreground font-bold">
                    {currentIndex > 0
                      ? Math.round((correctCount / currentIndex) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
              <Button
                onClick={() => initGame(timeLimit)}
                className="mt-8"
                size="lg"
              >
                {mode === 'chinese' ? '再来一次' : 'Try Again'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Typing
