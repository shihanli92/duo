import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth, signInWithMagicLink } from '../lib/queries'

export default function Login() {
  const { user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-pass">Loading...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signInWithMagicLink(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <h1 className="font-display text-5xl font-semibold text-ink">Duo</h1>
          <p className="mt-2 text-pass">Find the names you both love</p>
        </div>

        {sent ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="font-display text-xl text-ink">Check your email</p>
            <p className="mt-2 text-sm text-pass">
              We sent a magic link to <strong className="text-ink">{email}</strong>.
              Click it to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              aria-label="Email address"
              className="w-full rounded-xl border border-pass/30 bg-white px-4 py-3 text-ink placeholder:text-pass/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-match px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send magic link'}
            </button>
            {error && <p className="text-sm text-accent-b">{error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}
