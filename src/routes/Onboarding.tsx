import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  useAuth,
  useProfile,
  useCreateCouple,
  useJoinCouple,
  useCreateProfile,
} from '../lib/queries'
import type { Accent, Couple } from '../types'

type Step = 'choose' | 'create' | 'join' | 'accent' | 'name'

export default function Onboarding() {
  const { user, loading: authLoading } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile(user)
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('choose')
  const [couple, setCouple] = useState<Couple | null>(null)
  const [inviteCode, setInviteCode] = useState('')
  const [accent, setAccent] = useState<Accent>('a')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createCouple = useCreateCouple()
  const joinCouple = useJoinCouple()
  const createProfile = useCreateProfile()

  // If user already has a profile with a couple, redirect to swipe
  if (!authLoading && !profileLoading && profile?.couple_id) {
    return <Navigate to="/swipe" replace />
  }

  if (!authLoading && !user) {
    return <Navigate to="/login" replace />
  }

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-pass">Loading...</p>
      </div>
    )
  }

  const handleCreate = async () => {
    setError(null)
    try {
      const newCouple = await createCouple.mutateAsync()
      setCouple(newCouple)
      setStep('create')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create couple')
    }
  }

  const handleJoin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const found = await joinCouple.mutateAsync(inviteCode)
      setCouple(found)
      setStep('accent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join')
    }
  }

  const handleFinish = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !couple) return
    setError(null)
    try {
      await createProfile.mutateAsync({
        userId: user.id,
        coupleId: couple.id,
        displayName: displayName.trim(),
        accent,
      })
      navigate('/swipe', { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create profile'
      if (msg.includes('unique') || msg.includes('duplicate')) {
        setError('Your partner already picked that color. Try the other one!')
      } else {
        setError(msg)
      }
    }
  }

  const copyCode = async () => {
    if (couple) {
      await navigator.clipboard.writeText(couple.invite_code)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="font-display text-4xl font-semibold text-ink">Welcome to Duo</h1>

        {/* Step: Choose create or join */}
        {step === 'choose' && (
          <div className="space-y-4">
            <p className="text-pass">Start swiping on baby names together.</p>
            <button
              onClick={handleCreate}
              disabled={createCouple.isPending}
              className="w-full rounded-xl bg-accent-a px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-a focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {createCouple.isPending ? 'Creating...' : 'Start a new couple'}
            </button>
            <button
              onClick={() => setStep('join')}
              className="w-full rounded-xl border border-pass/30 bg-white px-4 py-3 font-semibold text-ink transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pass focus-visible:ring-offset-2"
            >
              I have an invite code
            </button>
            {error && <p className="text-sm text-accent-b">{error}</p>}
          </div>
        )}

        {/* Step: Show invite code after creating */}
        {step === 'create' && couple && (
          <div className="space-y-4">
            <p className="text-pass">Share this code with your partner:</p>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="font-display text-3xl tracking-wider text-ink">
                {couple.invite_code}
              </p>
            </div>
            <button
              onClick={copyCode}
              className="w-full rounded-xl border border-pass/30 bg-white px-4 py-3 font-semibold text-ink transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pass focus-visible:ring-offset-2"
              aria-label="Copy invite code to clipboard"
            >
              Copy code
            </button>
            <button
              onClick={() => setStep('accent')}
              className="w-full rounded-xl bg-match px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match focus-visible:ring-offset-2"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step: Enter invite code */}
        {step === 'join' && (
          <form onSubmit={handleJoin} className="space-y-4">
            <p className="text-pass">Enter the code your partner shared:</p>
            <input
              type="text"
              required
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="e.g. a3f1b2c9"
              aria-label="Invite code"
              className="w-full rounded-xl border border-pass/30 bg-white px-4 py-3 text-center font-display text-xl tracking-wider text-ink placeholder:text-pass/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match"
            />
            <button
              type="submit"
              disabled={joinCouple.isPending}
              className="w-full rounded-xl bg-match px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {joinCouple.isPending ? 'Joining...' : 'Join'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('choose')
                setError(null)
              }}
              className="text-sm text-pass hover:text-ink"
            >
              Back
            </button>
            {error && <p className="text-sm text-accent-b">{error}</p>}
          </form>
        )}

        {/* Step: Pick accent color */}
        {step === 'accent' && (
          <div className="space-y-4">
            <p className="text-pass">Pick your color:</p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setAccent('a')}
                aria-label="Periwinkle"
                className={`h-20 w-20 rounded-full bg-accent-a transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-a focus-visible:ring-offset-4 ${
                  accent === 'a' ? 'scale-110 ring-4 ring-accent-a ring-offset-2' : 'opacity-60'
                }`}
              />
              <button
                onClick={() => setAccent('b')}
                aria-label="Rose"
                className={`h-20 w-20 rounded-full bg-accent-b transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-b focus-visible:ring-offset-4 ${
                  accent === 'b' ? 'scale-110 ring-4 ring-accent-b ring-offset-2' : 'opacity-60'
                }`}
              />
            </div>
            <button
              onClick={() => setStep('name')}
              className="w-full rounded-xl bg-match px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match focus-visible:ring-offset-2"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step: Display name */}
        {step === 'name' && (
          <form onSubmit={handleFinish} className="space-y-4">
            <p className="text-pass">What should your partner see you as?</p>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              aria-label="Display name"
              className="w-full rounded-xl border border-pass/30 bg-white px-4 py-3 text-center text-ink placeholder:text-pass/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match"
            />
            <button
              type="submit"
              disabled={createProfile.isPending}
              className="w-full rounded-xl bg-match px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {createProfile.isPending ? 'Setting up...' : "Let's go!"}
            </button>
            <button
              type="button"
              onClick={() => setStep('accent')}
              className="text-sm text-pass hover:text-ink"
            >
              Back
            </button>
            {error && <p className="text-sm text-accent-b">{error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}
