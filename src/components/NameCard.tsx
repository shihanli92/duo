import { useLayoutEffect, useRef, useState } from 'react'
import type { Name } from '../types'

interface NameCardProps {
  name: Name
  lastName?: string
  middleName?: string
  onTapName?: () => void
  style?: React.CSSProperties
  className?: string
  inlineName?: boolean // put middle/last on the same row as the first name
}

// Each gender wears its own accent — the card border, shadow tint, and the
// small label above the name all pick up the color. Hex (not token classes)
// so the border/shadow can be tinted with alpha inline.
const genderConfig: Record<string, { accent: string; text: string }> = {
  girl: { accent: '#e07a93', text: 'text-accent-b' },
  boy: { accent: '#6e80d8', text: 'text-accent-a' },
  unisex: { accent: '#9a6fc0', text: 'text-match' },
}

// The card hugs the name. The hero font is derived from the AVAILABLE WIDTH,
// not the name — so it's the same size for every name on a given screen. The
// SHEET then grows or shrinks in width to wrap each name. Only a genuinely
// extreme name (longer than the widest card can hold) forces a font step-down.
const MAX_FONT = 80 // hero cap on wide screens
const MIN_FONT = 32 // never smaller than this
const FONT_RATIO = 0.15 // hero size ≈ 15% of available width
const PAD_X = 32 // matches the card's horizontal padding (px-8)
const WIDTH_SCALE = 2 // how much wider than a tight hug the sheet sits
const MIN_CARD = 280 // px — floor so a 2–3 letter name still reads as a card
const MAX_CARD = 720 // px — ceiling before names get too wide

function useAdaptiveCard(text: string) {
  const boundsRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [dims, setDims] = useState({ width: MIN_CARD, fontSize: MAX_FONT })

  useLayoutEffect(() => {
    const bounds = boundsRef.current
    const measure = measureRef.current
    if (!bounds || !measure) return

    const fit = () => {
      const avail = bounds.clientWidth
      if (!avail) return

      const maxCard = Math.min(MAX_CARD, avail)
      const maxInner = maxCard - PAD_X * 2

      // Font depends on the screen, not the name → constant across names
      let fontSize = Math.max(MIN_FONT, Math.min(MAX_FONT, Math.round(avail * FONT_RATIO)))

      // Measure at the ACTUAL render size — Fraunces is optically sized, so its
      // width-per-letter shifts with font size; scaling from one size lies.
      measure.style.fontSize = `${fontSize}px`
      let contentW = measure.scrollWidth

      // Safety net: a name too long for the widest card steps the font down,
      // re-measured at the smaller size so it truly fits.
      if (contentW > maxInner) {
        fontSize = Math.max(MIN_FONT, Math.floor(fontSize * (maxInner / contentW)))
        measure.style.fontSize = `${fontSize}px`
        contentW = Math.min(measure.scrollWidth, maxInner)
      }

      const hug = contentW + PAD_X * 2
      const width = Math.round(Math.min(maxCard, Math.max(MIN_CARD, hug * WIDTH_SCALE)))
      setDims({ width, fontSize })
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(bounds)
    // Re-fit once the display font loads — its metrics differ from the fallback
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) fit()
    })
    return () => {
      cancelled = true
      ro.disconnect()
    }
  }, [text])

  return { boundsRef, measureRef, dims }
}

function formatInitials(firstName: string, middleName: string, lastName: string): string {
  const fi = firstName.charAt(0).toUpperCase()
  const mi = middleName ? middleName.charAt(0).toUpperCase() : ''
  const li = lastName.charAt(0).toUpperCase()
  return mi ? `${fi}.${mi}.${li}.` : `${fi}.${li}.`
}

export default function NameCard({ name, lastName, middleName, onTapName, style, className = '', inlineName = false }: NameCardProps) {
  const cfg = genderConfig[name.gender] ?? { accent: '#9a95a3', text: 'text-pass' }
  const secondary = `${middleName ? ` ${middleName}` : ''}${lastName ? ` ${lastName}` : ''}`.trim()
  const showInline = inlineName && !!secondary
  // Measure the whole row when inline, so the fit sizes the font + card to the full name
  const { boundsRef, measureRef, dims } = useAdaptiveCard(showInline ? `${name.value} ${secondary}` : name.value)

  return (
    <div ref={boundsRef} className="flex h-full w-full items-center justify-center">
      {/* Off-screen measurer — its font size is set imperatively during fit */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute whitespace-nowrap font-display font-medium"
        style={{ fontSize: MAX_FONT }}
      >
        {name.value}
        {showInline && <span style={{ fontSize: '0.55em' }}>{' '}{secondary}</span>}
      </span>

      <div
        role="article"
        aria-label={`Baby name: ${name.value}${secondary ? ` ${secondary}` : ''}, ${name.gender}${name.origin ? `, origin: ${name.origin}` : ''}`}
        className={`flex h-full flex-col items-center justify-center rounded-[20px] px-8 py-8 ${className}`}
        style={{
          width: dims.width,
          backgroundColor: '#FFFCF8',
          border: `1px solid ${cfg.accent}2E`,
          boxShadow: `0 6px 22px ${cfg.accent}1A`,
          transition: 'width 200ms ease-out',
          ...style,
        }}
      >
        {/* Gender label — small, above the name, so the name stays the hero */}
        <div className={`mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] md:mb-5 ${cfg.text}`}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.accent }} aria-hidden="true" />
          {name.gender}
        </div>

        <h2 className="font-display font-medium leading-[1.05] text-ink">
          <span
            onClick={onTapName}
            className={`inline-block whitespace-nowrap ${onTapName ? 'cursor-pointer underline decoration-match/25 decoration-2 underline-offset-[6px] transition-colors hover:decoration-match/60' : ''}`}
            style={{ fontSize: dims.fontSize }}
          >
            {name.value}
            {showInline && (
              <span className="font-normal text-pass/60" style={{ fontSize: '0.55em' }}>{' '}{secondary}</span>
            )}
          </span>
        </h2>

        {secondary && !showInline && (
          <p className="mt-1.5 text-center font-display text-xl font-normal text-pass/60 sm:text-2xl">
            {secondary}
          </p>
        )}

        {lastName && (
          <p className="mt-1.5 text-sm tracking-[0.12em] text-pass/60 md:text-base">
            {formatInitials(name.value, middleName ?? '', lastName)}
          </p>
        )}

        {name.meaning && (
          <p className="mt-4 text-center font-display text-base italic text-match/90 md:mt-5 md:text-lg">
            &ldquo;{name.meaning}&rdquo;
          </p>
        )}

        {name.origin && (
          <>
            <span className="mt-5 h-px w-7 bg-pass/25 md:mt-6" aria-hidden="true" />
            <span className="mt-3 text-xs uppercase tracking-[0.14em] text-pass md:text-[13px]">
              {name.origin}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
