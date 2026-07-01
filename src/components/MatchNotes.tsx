import { useState } from 'react'
import { useUpsertNote, useDeleteNote } from '../lib/queries'
import type { MatchNote } from '../types'

interface MatchNotesProps {
  coupleId: string
  userId: string
  nameId: string
  notes: MatchNote[] // notes for THIS name (both partners), from get_match_notes
}

export default function MatchNotes({ coupleId, userId, nameId, notes }: MatchNotesProps) {
  const upsert = useUpsertNote()
  const del = useDeleteNote()

  const myNote = notes.find((n) => n.author_id === userId) ?? null
  const partnerNote = notes.find((n) => n.author_id !== userId) ?? null

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(myNote?.body ?? '')

  // Sync the editor when my note changes elsewhere (e.g. a refetch) using the
  // "adjust state during render" pattern rather than an effect.
  const [syncedBody, setSyncedBody] = useState(myNote?.body ?? '')
  if ((myNote?.body ?? '') !== syncedBody) {
    setSyncedBody(myNote?.body ?? '')
    setDraft(myNote?.body ?? '')
  }

  const trimmed = draft.trim()
  const dirty = trimmed !== (myNote?.body ?? '')

  const save = () => {
    if (!trimmed) {
      if (myNote) del.mutate({ coupleId, nameId, userId })
      return
    }
    upsert.mutate({ coupleId, nameId, userId, body: trimmed })
  }

  const remove = () => {
    del.mutate({ coupleId, nameId, userId })
    setDraft('')
  }

  const hasAny = !!myNote || !!partnerNote

  return (
    <div className="mt-2 border-t border-pass/10 pt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-xs font-medium text-pass transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        {hasAny ? 'Notes' : 'Add a note'}
        {hasAny && <span className="h-1.5 w-1.5 rounded-full bg-match" aria-hidden="true" />}
      </button>

      {open && (
        <div className="mt-2 space-y-3">
          {/* Partner's note — read only */}
          {partnerNote ? (
            <div className="rounded-lg bg-match/8 px-3 py-2">
              <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-match">Their note</p>
              <p className="text-sm text-ink/80">{partnerNote.body}</p>
            </div>
          ) : (
            <p className="text-xs italic text-pass/60">No note from them yet.</p>
          )}

          {/* My note — editable */}
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-pass" htmlFor={`note-${nameId}`}>
              Your note
            </label>
            <textarea
              id={`note-${nameId}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="reminds me of grandma…"
              rows={2}
              className="w-full resize-none rounded-lg border border-pass/25 bg-white px-3 py-2 text-sm text-ink placeholder:text-pass/50 focus:border-match focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-match"
            />
            <div className="mt-1.5 flex items-center gap-3">
              <button
                type="button"
                onClick={save}
                disabled={!dirty || upsert.isPending}
                className="rounded-full bg-match px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match disabled:opacity-40"
              >
                {myNote ? 'Update' : 'Save'}
              </button>
              {myNote && (
                <button
                  type="button"
                  onClick={remove}
                  className="text-xs text-pass transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-match"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
