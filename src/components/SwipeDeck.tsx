import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import NameCard from './NameCard'
import PillSelect from './PillSelect'
import { getVariants } from '../lib/nameVariants'
import { FONT_ORDER, FONTS, FORMAT_ORDER, FORMAT_LABELS, type FontKey, type FormatKey } from '../lib/nameDisplay'
import type { Name } from '../types'

const SWIPE_THRESHOLD = 100
const EXIT_DISTANCE = 500

// Deterministic hash for stable deck ordering (pure — no Math.random)
function stableHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}

interface SwipeDeckProps {
  names: Name[]
  lastName?: string
  middleName?: string
  onVote: (name: Name, value: 'like' | 'pass') => void
  onUndo?: () => void
  canUndo?: boolean
  onMiddleNameChange?: (value: string) => void
  onSelectVariant?: (original: Name, variantValue: string, variantLang?: string) => Promise<Name>
  disabled?: boolean
}

export default function SwipeDeck({ names, lastName, middleName, onVote, onUndo, canUndo, onMiddleNameChange, onSelectVariant, disabled }: SwipeDeckProps) {
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null)
  const [showVariants, setShowVariants] = useState(false)
  const [replacedName, setReplacedName] = useState<Name | null>(null)
  const [localMiddleName, setLocalMiddleName] = useState(middleName ?? '')
  const [deckIndex, setDeckIndex] = useState(0)
  const [font, setFont] = useState<FontKey>('fraunces')
  const [format, setFormat] = useState<FormatKey>('first')
  const dragging = useRef(false)
  const startX = useRef(0)
  const didDrag = useRef(false)
  const swipingRef = useRef(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Stable ordering: hash-based sort so deck order is consistent across refetches
  const stableNames = useMemo(
    () => [...names].sort((a, b) => stableHash(a.id) - stableHash(b.id)),
    [names],
  )

  // Derived clamped index — no setState, no race conditions
  const effectiveIndex = Math.min(deckIndex, Math.max(stableNames.length - 1, 0))

  const baseName = stableNames[effectiveIndex]
  const currentName = replacedName ?? baseName
  // Always compute variants from the original base name, not the replacement
  const variants = baseName ? getVariants(baseName.value) : []

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      if (!currentName || exiting || swipingRef.current || disabled) return
      swipingRef.current = true
      setExiting(direction)
      // Wait for exit animation, then reset state and trigger vote.
      // Reset state BEFORE onVote so the optimistic update (which removes
      // the name from the array) doesn't cause the next card to briefly
      // inherit the exit animation.
      const nameToVote = currentName
      setTimeout(() => {
        setExiting(null)
        setDragX(0)
        setShowVariants(false)
        setReplacedName(null)
        onVote(nameToVote, direction === 'right' ? 'like' : 'pass')
        swipingRef.current = false
      }, 250)
    },
    [currentName, exiting, onVote, disabled],
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (exiting || disabled) return
      dragging.current = true
      didDrag.current = false
      startX.current = e.clientX
      setIsDragging(true)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [exiting, disabled],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - startX.current
      if (Math.abs(dx) > 5) didDrag.current = true
      setDragX(dx)
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

  const handleNameTap = useCallback(() => {
    if (didDrag.current) return
    if (variants.length > 0) {
      setShowVariants((v) => !v)
    }
  }, [variants.length])

  const handleVariantSelect = useCallback(
    async (variantValue: string, variantLang?: string) => {
      if (!baseName || !onSelectVariant) return
      // Selecting the original name again clears the replacement
      if (variantValue === baseName.value) {
        setReplacedName(null)
        return
      }
      const newName = await onSelectVariant(baseName, variantValue, variantLang)
      setReplacedName(newName)
    },
    [baseName, onSelectVariant],
  )

  const handleMiddleNameBlur = useCallback(() => {
    const trimmed = localMiddleName.trim()
    if (trimmed !== (middleName ?? '') && onMiddleNameChange) {
      onMiddleNameChange(trimmed)
    }
  }, [localMiddleName, middleName, onMiddleNameChange])

  const goBack = useCallback(() => {
    if (effectiveIndex <= 0) return
    setDeckIndex(effectiveIndex - 1)
    setShowVariants(false)
    setReplacedName(null)
  }, [effectiveIndex])

  const goForward = useCallback(() => {
    if (effectiveIndex >= stableNames.length - 1) return
    setDeckIndex(effectiveIndex + 1)
    setShowVariants(false)
    setReplacedName(null)
  }, [effectiveIndex, stableNames.length])

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handleSwipe('left')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleSwipe('right')
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        goBack()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        goForward()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && canUndo && onUndo) {
        e.preventDefault()
        onUndo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSwipe, goBack, goForward, canUndo, onUndo])

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
    <div className="relative flex h-full w-full flex-col items-center">
      {/* Card stack */}
      <div className="relative h-80 w-full max-w-sm sm:h-96 sm:max-w-lg md:h-[28rem] md:max-w-2xl lg:h-[32rem] lg:max-w-3xl">
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
            <div className="absolute left-5 top-5 z-20 rounded-full bg-match/90 px-4 py-1 text-sm font-medium uppercase tracking-[0.14em] text-white shadow-sm">
              Like
            </div>
          )}
          {dragX < -30 && (
            <div className="absolute right-5 top-5 z-20 rounded-full bg-pass/90 px-4 py-1 text-sm font-medium uppercase tracking-[0.14em] text-white shadow-sm">
              Pass
            </div>
          )}

          <NameCard
            name={currentName}
            lastName={lastName}
            middleName={middleName}
            onTapName={variants.length > 0 ? handleNameTap : undefined}
            font={font}
            format={format}
          />
        </div>
      </div>

      {/* Variant pills */}
      {showVariants && variants.length > 0 && baseName && (
        <div className="mt-2 flex flex-wrap justify-center gap-2 px-4">
          <span className="w-full text-center text-xs text-pass">Variants:</span>
          {/* Original name pill */}
          <button
            onClick={() => handleVariantSelect(baseName.value)}
            className={`rounded-full border px-3 py-1 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match ${
              !replacedName
                ? 'border-match bg-match text-white'
                : 'border-match/30 bg-white text-match hover:bg-match/10'
            }`}
          >
            {baseName.value}
          </button>
          {variants.map((v) => {
            const isActive = replacedName?.value === v.name
            return (
              <button
                key={v.name}
                onClick={() => handleVariantSelect(v.name, v.lang)}
                className={`rounded-full border px-3 py-1 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match ${
                  isActive
                    ? 'border-match bg-match text-white'
                    : 'border-match/30 bg-white text-match hover:bg-match/10'
                }`}
              >
                {v.name}{v.lang && <span className="ml-1 text-xs opacity-60">{v.lang}</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* Middle name */}
      {onMiddleNameChange && (
        <div className="mt-3 flex justify-center">
          <input
            type="text"
            value={localMiddleName}
            onChange={(e) => setLocalMiddleName(e.target.value)}
            onBlur={handleMiddleNameBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
            placeholder="middle name"
            aria-label="Middle name"
            className="w-40 border-b border-pass/30 bg-transparent text-center text-sm text-pass focus:border-match focus:text-ink focus-visible:outline-none"
          />
        </div>
      )}

      {/* Deck navigation */}
      {stableNames.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-4">
          <button
            onClick={goBack}
            disabled={effectiveIndex <= 0}
            aria-label="Previous name"
            className="rounded-full p-1.5 text-pass transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match disabled:opacity-30"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="min-w-[4rem] text-center text-xs tabular-nums text-pass">
            {effectiveIndex + 1} / {stableNames.length}
          </span>
          <button
            onClick={goForward}
            disabled={effectiveIndex >= stableNames.length - 1}
            aria-label="Next name"
            className="rounded-full p-1.5 text-pass transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match disabled:opacity-30"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}

      {/* Display options — hero font + name format */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <PillSelect
          ariaLabel="Name font"
          value={font}
          onChange={(v) => setFont(v as FontKey)}
          options={FONT_ORDER.map((k) => ({ value: k, label: FONTS[k].label }))}
        />
        {(lastName || middleName) && (
          <PillSelect
            ariaLabel="Name format"
            value={format}
            onChange={(v) => setFormat(v as FormatKey)}
            options={FORMAT_ORDER.map((k) => ({ value: k, label: FORMAT_LABELS[k] }))}
          />
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex items-center gap-8">
        <button
          onClick={() => handleSwipe('left')}
          disabled={!!exiting}
          aria-label="Pass on this name"
          className="flex h-16 w-16 items-center justify-center rounded-full border border-pass/25 bg-[#FFFCF8] text-pass shadow-[0_4px_14px_rgba(154,149,163,0.18)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pass disabled:opacity-50"
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-pass/20 bg-[#FFFCF8] text-pass shadow-[0_2px_8px_rgba(154,149,163,0.15)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pass"
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
          className="flex h-16 w-16 items-center justify-center rounded-full border border-match/40 bg-[#FFFCF8] text-match shadow-[0_4px_16px_rgba(154,111,192,0.22)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match disabled:opacity-50"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
