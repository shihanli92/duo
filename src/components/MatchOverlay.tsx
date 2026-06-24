import { useEffect } from 'react'

interface MatchOverlayProps {
  name: string
  onDismiss: () => void
}

export default function MatchOverlay({ name, onDismiss }: MatchOverlayProps) {
  // Auto-dismiss after 2.5s
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2500)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onDismiss}
      role="dialog"
      aria-label={`It's a match! You both like ${name}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-match/40 backdrop-blur-sm motion-safe:animate-[fadeIn_0.3s_ease-out]" />

      {/* Content */}
      <div className="relative flex flex-col items-center motion-safe:animate-[scaleIn_0.4s_ease-out]">
        {/* Venn circles animation */}
        <svg
          width="200"
          height="120"
          viewBox="0 0 200 120"
          aria-hidden="true"
          className="mb-4"
        >
          <circle
            cx="70"
            cy="60"
            r="45"
            fill="var(--color-accent-a)"
            opacity="0.5"
            className="motion-safe:animate-[slideRight_0.5s_ease-out]"
          />
          <circle
            cx="130"
            cy="60"
            r="45"
            fill="var(--color-accent-b)"
            opacity="0.5"
            className="motion-safe:animate-[slideLeft_0.5s_ease-out]"
          />
          {/* Heart in the overlap */}
          <path
            d="M100 55 l-4-4a4.5 4.5 0 0 0-6.36 6.36L100 68l10.36-10.64a4.5 4.5 0 0 0-6.36-6.36z"
            fill="white"
            className="motion-safe:animate-[pulse_1s_ease-in-out_0.4s_infinite]"
          />
        </svg>

        <h2 className="font-display text-4xl font-semibold text-white drop-shadow-lg">
          It&apos;s a match!
        </h2>
        <p className="mt-2 font-display text-2xl text-white/90 drop-shadow">
          {name}
        </p>
        <p className="mt-4 text-sm text-white/70">Tap to continue</p>
      </div>
    </div>
  )
}
