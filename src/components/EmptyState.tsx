import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      {icon && <div className="mb-4 text-pass">{icon}</div>}
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-xs text-sm text-pass">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-xl bg-match px-6 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match focus-visible:ring-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
