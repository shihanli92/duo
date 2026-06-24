import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, useProfile } from '../lib/queries'

export default function ProtectedRoute() {
  const { user, loading: authLoading } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile(user)

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-ink/50">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!profile || !profile.couple_id) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
