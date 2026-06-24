import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/swipe', label: 'Swipe', icon: SwipeIcon },
  { to: '/matches', label: 'Matches', icon: MatchesIcon },
  { to: '/ranking', label: 'Rank', icon: RankIcon },
  { to: '/add-names', label: 'Add', icon: AddIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
] as const

export default function TabBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-10 border-t border-pass/20 bg-paper"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
                isActive ? 'text-match' : 'text-pass hover:text-ink'
              }`
            }
            aria-label={tab.label}
          >
            <tab.icon />
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function SwipeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="14" height="18" rx="2" />
      <rect x="7" y="1" width="14" height="18" rx="2" />
    </svg>
  )
}

function MatchesIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="12" r="6" opacity="0.6" />
      <circle cx="15" cy="12" r="6" opacity="0.6" />
    </svg>
  )
}

function RankIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="6" x2="20" y2="6" />
      <line x1="10" y1="12" x2="20" y2="12" />
      <line x1="10" y1="18" x2="20" y2="18" />
      <circle cx="5" cy="6" r="1.5" fill="currentColor" />
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="5" cy="18" r="1.5" fill="currentColor" />
    </svg>
  )
}

function AddIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  )
}
