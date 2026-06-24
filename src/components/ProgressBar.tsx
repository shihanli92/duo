interface ProgressBarProps {
  label: string
  voted: number
  total: number
  color: string
}

export default function ProgressBar({ label, voted, total, color }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((voted / total) * 100) : 0

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink">{label}</span>
        <span className="text-pass">
          {voted}/{total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-pass/15">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
