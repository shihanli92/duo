import { useState, useRef, useCallback, useEffect } from 'react'
import NameCard from './NameCard'
import type { Name } from '../types'

const SWIPE_THRESHOLD = 100
const EXIT_DISTANCE = 500

interface SwipeDeckProps {
  names: Name[]
  lastName?: string
  onVote: (name: Name, value: 'like' | 'pass') => void
  onUndo?: () => void
  canUndo?: boolean
}

export default function SwipeDeck({ names, lastName, onVote, onUndo, canUndo }: SwipeDeckProps) {
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null)
  const dragging = useRef(false)
  const startX = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const currentName = names[0]
  const nextName = names[1]

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      if (!currentName || exiting) return
      setExiting(direction)
      // Wait for exit animation, then trigger vote
      setTimeout(() => {
        onVote(currentName, direction === 'right' ? 'like' : 'pass')
        setExiting(null)
        setDragX(0)
      }, 250)
    },
    [currentName, exiting, onVote],
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (exiting) return
      dragging.current = true
      startX.current = e.clientX
      setIsDragging(true)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [exiting],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      setDragX(e.clientX - startX.current)
    },
    [],
  )

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    setIsDragging(false)

    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      handleSwipe(dragX > 0 ? 'right' : 'left')
    } else {
      setDragX(0)
    }
  }, [dragX, handleSwipe])

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handleSwipe('left')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleSwipe('right')
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && canUndo && onUndo) {
        e.preventDefault()
        onUndo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSwipe, canUndo, onUndo])

  if (!currentName) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        <p className="font-display text-2xl text-ink">All caught up!</p>
        <p className="mt-2 text-pass">
          You've seen every name. Add more or check your matches.
        </p>
      </div>
    )
  }

  const rotation = dragX * 0.1
  const exitX = exiting === 'right' ? EXIT_DISTANCE : exiting === 'left' ? -EXIT_DISTANCE : 0

  return (
    <div className="relative flex h-full flex-col items-center">
      {/* Card stack */}
      <div className="relative h-80 w-full max-w-xs sm:h-96 md:h-[28rem] md:max-w-md lg:h-[32rem] lg:max-w-lg">
        {/* Next card peek */}
        {nextName && !exiting && (
          <div className="absolute inset-0 scale-95 opacity-60">
            <NameCard name={nextName} lastName={lastName} />
          </div>
        )}

        {/* Current card */}
        <div
          ref={cardRef}
          className="absolute inset-0 touch-none select-none"
          style={{
            transform: exiting
              ? `translateX(${exitX}px) rotate(${exitX * 0.05}deg)`
              : `translateX(${dragX}px) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.25s ease-out',
            zIndex: 10,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {/* Swipe indicators */}
          {dragX > 30 && (
            <div className="absolute left-4 top-4 z-20 rounded-lg bg-match/90 px-3 py-1 font-semibold text-white">
              LIKE
            </div>
          )}
          {dragX < -30 && (
            <div className="absolute right-4 top-4 z-20 rounded-lg bg-pass/90 px-3 py-1 font-semibold text-white">
              PASS
            </div>
          )}

          <NameCard name={currentName} lastName={lastName} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex items-center gap-8">
        <button
          onClick={() => handleSwipe('left')}
          disabled={!!exiting}
          aria-label="Pass on this name"
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-pass/30 bg-white text-pass shadow-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pass disabled:opacity-50"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {canUndo && onUndo && (
          <button
            onClick={onUndo}
            aria-label="Undo last vote"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-pass/20 bg-white text-pass transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pass"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
        )}

        <button
          onClick={() => handleSwipe('right')}
          disabled={!!exiting}
          aria-label="Like this name"
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-match/30 bg-white text-match shadow-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match disabled:opacity-50"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
