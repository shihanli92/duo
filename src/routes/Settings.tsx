import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useAuth,
  useProfile,
  useCouple,
  usePartnerProfile,
  useUpdateProfile,
  useUpdateCouple,
  useResetVotes,
} from '../lib/queries'
import TabBar from '../components/TabBar'

function NameForm({ coupleId, initialLastName, initialMiddleName }: { coupleId: string; initialLastName: string; initialMiddleName: string }) {
  const [middleName, setMiddleName] = useState(initialMiddleName)
  const [lastName, setLastName] = useState(initialLastName)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const updateCouple = useUpdateCouple()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await updateCouple.mutateAsync({ coupleId, middleName: middleName.trim(), lastName: lastName.trim() })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-2 border-t border-pass/10 pt-2 mt-2">
        <input
          type="text"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          placeholder="Middle name (optional)"
          aria-label="Middle name"
          className="w-full rounded-xl border border-pass/30 px-4 py-3 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name (shown on cards)"
            aria-label="Last name"
            className="flex-1 rounded-xl border border-pass/30 px-4 py-3 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match"
          />
          <button
            type="submit"
            disabled={updateCouple.isPending}
            className="rounded-lg bg-match px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {success ? 'Saved!' : 'Save'}
          </button>
        </div>
      </form>
      {error && <p className="text-xs text-accent-b mt-1">{error}</p>}
    </>
  )
}

export default function Settings() {
  const { user, signOut } = useAuth()
  const { data: profile } = useProfile(user)
  const coupleId = profile?.couple_id
  const { data: couple } = useCouple(coupleId)
  const { data: partner } = usePartnerProfile(coupleId, user?.id)
  const updateProfile = useUpdateProfile()
  const updateCouple = useUpdateCouple()
  const resetVotes = useResetVotes()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [nameSuccess, setNameSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)

  const handleUpdateName = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError(null)
    try {
      await updateProfile.mutateAsync({ userId: user.id, displayName: displayName.trim() })
      setNameSuccess(true)
      setTimeout(() => setNameSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  const handleAccentSwap = async () => {
    if (!user || !profile) return
    setError(null)
    const newAccent = profile.accent === 'a' ? 'b' as const : 'a' as const
    try {
      await updateProfile.mutateAsync({ userId: user.id, accent: newAccent })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to switch'
      if (msg.includes('unique') || msg.includes('duplicate')) {
        setError('Your partner already has that color!')
      } else {
        setError(msg)
      }
    }
  }

  const handleReset = async () => {
    if (!user) return
    try {
      await resetVotes.mutateAsync(user.id)
      setConfirmReset(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset')
    }
  }

  const handleLeave = async () => {
    if (!user) return
    try {
      await updateProfile.mutateAsync({ userId: user.id, coupleId: null })
      setConfirmLeave(false)
      navigate('/onboarding', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave')
    }
  }

  const handleToggleExtended = async () => {
    if (!couple) return
    setError(null)
    try {
      await updateCouple.mutateAsync({ coupleId: couple.id, includeExtended: !couple.include_extended })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const copyCode = async () => {
    if (couple) {
      await navigator.clipboard.writeText(couple.invite_code)
    }
  }

  return (
    <div className="flex min-h-svh flex-col pb-20">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-center font-display text-2xl font-semibold text-ink">Settings</h1>
      </div>

      <div className="mx-auto w-full max-w-sm space-y-6 px-4">
        {/* Display name */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-pass">
            Display name
          </h2>
          <form onSubmit={handleUpdateName} className="flex gap-2">
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              aria-label="Display name"
              className="flex-1 rounded-xl border border-pass/30 px-4 py-3 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match"
            />
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="rounded-lg bg-match px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {nameSuccess ? 'Saved!' : 'Save'}
            </button>
          </form>
        </section>

        {/* Accent color */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-pass">
            Your color
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-full"
                style={{
                  backgroundColor:
                    profile?.accent === 'a'
                      ? 'var(--color-accent-a)'
                      : 'var(--color-accent-b)',
                }}
              />
              <span className="text-sm text-ink">
                {profile?.accent === 'a' ? 'Periwinkle' : 'Rose'}
              </span>
            </div>
            <button
              onClick={handleAccentSwap}
              disabled={updateProfile.isPending}
              className="rounded-lg border border-pass/30 px-3 py-1.5 text-sm text-pass hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match disabled:opacity-50"
            >
              Switch
            </button>
          </div>
        </section>

        {/* Couple info */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-pass">
            Couple
          </h2>
          {couple && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-pass">Invite code</span>
                <button
                  onClick={copyCode}
                  className="font-display text-sm tracking-wider text-ink hover:text-match focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match"
                  aria-label="Copy invite code"
                >
                  {couple.invite_code} 📋
                </button>
              </div>
              {partner && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-pass">Partner</span>
                  <span className="text-sm text-ink">{partner.display_name}</span>
                </div>
              )}
              {!partner && (
                <p className="text-sm text-pass">Waiting for partner to join...</p>
              )}
              <NameForm coupleId={couple.id} initialLastName={couple.last_name} initialMiddleName={couple.middle_name} />
            </div>
          )}
        </section>

        {/* Name library */}
        {couple && (
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-pass">Name library</h2>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm text-ink">Extended name pack</p>
                <p className="mt-0.5 text-xs text-pass">
                  Adds thousands of rarer and international names to your deck. Off by default.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={!!couple.include_extended}
                aria-label="Extended name pack"
                onClick={handleToggleExtended}
                disabled={updateCouple.isPending}
                className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match rounded-full disabled:opacity-50"
              >
                <span className={`relative block h-6 w-11 rounded-full transition-colors ${couple.include_extended ? 'bg-match' : 'bg-pass/30'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${couple.include_extended ? 'left-[1.375rem]' : 'left-0.5'}`} />
                </span>
              </button>
            </div>
          </section>
        )}

        {/* Danger zone */}
        <section className="rounded-2xl border border-accent-b/20 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent-b">
            Danger zone
          </h2>
          <div className="space-y-3">
            {confirmReset ? (
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  disabled={resetVotes.isPending}
                  className="flex-1 rounded-lg bg-accent-b px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {resetVotes.isPending ? 'Resetting...' : 'Yes, reset all votes'}
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="rounded-lg border border-pass/30 px-3 py-2 text-sm text-pass"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full rounded-lg border border-accent-b/30 px-3 py-2 text-sm text-accent-b hover:bg-accent-b/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-b"
              >
                Reset all my votes
              </button>
            )}

            {confirmLeave ? (
              <div className="flex gap-2">
                <button
                  onClick={handleLeave}
                  disabled={updateProfile.isPending}
                  className="flex-1 rounded-lg bg-accent-b px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {updateProfile.isPending ? 'Leaving...' : 'Yes, leave couple'}
                </button>
                <button
                  onClick={() => setConfirmLeave(false)}
                  className="rounded-lg border border-pass/30 px-3 py-2 text-sm text-pass"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmLeave(true)}
                className="w-full rounded-lg border border-accent-b/30 px-3 py-2 text-sm text-accent-b hover:bg-accent-b/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-b"
              >
                Leave couple
              </button>
            )}

            <button
              onClick={handleSignOut}
              className="w-full rounded-lg border border-pass/30 px-3 py-2 text-sm text-pass hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pass"
            >
              Sign out
            </button>
          </div>
        </section>

        {error && <p className="text-center text-sm text-accent-b">{error}</p>}
      </div>

      <TabBar />
    </div>
  )
}
