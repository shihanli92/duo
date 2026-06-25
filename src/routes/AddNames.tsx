import { useState, type FormEvent } from 'react'
import { useAuth, useProfile, useAddName } from '../lib/queries'
import TabBar from '../components/TabBar'
import type { Gender } from '../types'

export default function AddNames() {
  const { user } = useAuth()
  const { data: profile } = useProfile(user)
  const addName = useAddName()

  const [name, setName] = useState('')
  const [gender, setGender] = useState<Gender>('unisex')
  const [origin, setOrigin] = useState('')
  const [meaning, setMeaning] = useState('')
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const coupleId = profile?.couple_id

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!coupleId) return
    setError(null)
    setSuccess(null)

    try {
      await addName.mutateAsync({
        coupleId,
        value: name.trim(),
        gender,
        origin: origin.trim(),
        meaning: meaning.trim() || undefined,
      })
      setSuccess(`"${name.trim()}" added!`)
      setName('')
      setOrigin('')
      setMeaning('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add name')
    }
  }

  return (
    <div className="flex min-h-svh flex-col pb-20">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-center font-display text-2xl font-semibold text-ink">Add a name</h1>
        <p className="mt-1 text-center text-sm text-pass">
          Custom names appear in both your decks.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm space-y-4 px-4">
        <div>
          <label htmlFor="name-input" className="mb-1 block text-sm font-medium text-ink">
            Name
          </label>
          <input
            id="name-input"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aria"
            className="w-full rounded-xl border border-pass/30 bg-white px-4 py-3 text-ink placeholder:text-pass/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match"
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">Gender</legend>
          <div className="flex gap-3">
            {(['girl', 'boy', 'unisex'] as const).map((g) => (
              <label
                key={g}
                className={`flex-1 cursor-pointer rounded-xl border px-3 py-2 text-center text-sm font-medium capitalize transition-colors ${
                  gender === g
                    ? 'border-match bg-match/10 text-match'
                    : 'border-pass/30 bg-white text-pass hover:text-ink'
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={() => setGender(g)}
                  className="sr-only"
                />
                {g}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="origin-input" className="mb-1 block text-sm font-medium text-ink">
            Origin <span className="text-pass">(optional)</span>
          </label>
          <input
            id="origin-input"
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="e.g. Greek, Hebrew, Modern English"
            className="w-full rounded-xl border border-pass/30 bg-white px-4 py-3 text-ink placeholder:text-pass/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match"
          />
        </div>

        <div>
          <label htmlFor="meaning-input" className="mb-1 block text-sm font-medium text-ink">
            Meaning <span className="text-pass">(optional)</span>
          </label>
          <input
            id="meaning-input"
            type="text"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder="e.g. noble, light-bearer"
            className="w-full rounded-xl border border-pass/30 bg-white px-4 py-3 text-ink placeholder:text-pass/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match"
          />
        </div>

        <button
          type="submit"
          disabled={addName.isPending}
          className="w-full rounded-xl bg-match px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {addName.isPending ? 'Adding...' : 'Add name'}
        </button>

        {success && <p className="text-center text-sm text-match">{success}</p>}
        {error && <p className="text-center text-sm text-accent-b">{error}</p>}
      </form>

      <TabBar />
    </div>
  )
}
