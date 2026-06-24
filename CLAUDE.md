# CLAUDE.md

Project context for Claude Code. Read this before making changes. Keep it updated as the project evolves.

## What we're building

**Duo** — a private baby-name matcher for two people (a couple). Each partner votes privately on a deck of names; the app surfaces only the names you **both** liked. Think "name Tinder for two," but the whole point is that neither person is biased by the other's choices.

Audience: one couple per account-pair. Tone: warm, intimate, a keepsake — not a corporate SaaS.

## Core product rules (do not break these)

1. **Privacy invariant — the soul of the app.** A user must **never** be able to see their partner's individual votes. The client only ever receives: (a) **mutual matches** (names both liked), and (b) **aggregate counts** (e.g. "your partner has voted on 40 names"). This is enforced **server-side** (RLS + a security-definer function), not just hidden in the UI. Any change that would let one partner read the other's raw votes is a bug.
2. **A match = both partners voted `like` on the same name.** Nothing else is a match.
3. **One couple = exactly two people.** A third join attempt must be rejected.
4. **One vote per (name, user).** Votes can be changed or undone, never duplicated.
5. **Custom names are couple-scoped.** A name added by either partner appears in both partners' decks; it is never visible to other couples.

## Stack (default — confirm before deviating)

- **Frontend:** Vite + React 19 + TypeScript (strict) + Tailwind CSS v4
- **Routing:** React Router
- **Server state:** TanStack Query + Supabase JS client; Supabase Realtime for live match updates
- **Backend:** Supabase (Postgres, Auth, Realtime, RLS)
- **Auth:** Supabase magic-link email
- **Couple linking:** invite code (creator generates a code; partner joins with it)
- **Tooling:** ESLint + Prettier, Vitest + React Testing Library (Playwright optional for E2E)
- **Package manager:** pnpm
- **Deploy:** Vercel Hobby (web, free `*.vercel.app` URL) + hosted Supabase Free tier

> **Hard constraint: this stays $0/month.** It's a private app for two people, never sold or made public. Everything must fit inside free tiers (see "Hosting & cost" below). Do not introduce anything that requires a paid plan, a custom domain, or a credit card without flagging it first.

## Commands

```bash
pnpm install
pnpm dev          # local dev server
pnpm build        # production build
pnpm preview      # serve the build
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest
```

## Project structure

```
CLAUDE.md
.env.example                 # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
supabase/
  migrations/
    00001_create_tables.sql
    00002_rls_policies.sql
    00003_functions.sql
  seed.sql                   # built-in name list (~110 names)
src/
  main.tsx
  App.tsx                    # routing + auth gate
  theme.css                  # design tokens (palette + fonts)
  index.css                  # Tailwind entry + base styles
  types.ts                   # shared TS types
  vite-env.d.ts
  lib/
    supabase.ts              # single client instance
    database.types.ts        # auto-generated from supabase gen types
    queries.ts               # ALL data access lives here (hooks + functions)
    queryClient.ts           # TanStack Query client config
  routes/
    Login.tsx
    Onboarding.tsx           # create/join couple; choose accent + display name
    Swipe.tsx                # the deck
    Matches.tsx              # the overlap (realtime)
    AddNames.tsx             # add custom names
    Settings.tsx             # rename, switch accent, reset
  components/
    ProtectedRoute.tsx
    NameCard.tsx
    SwipeDeck.tsx
    GenderFilter.tsx
    VennHeader.tsx
    MatchList.tsx
    ProgressBar.tsx
    TabBar.tsx
    EmptyState.tsx
    ErrorBoundary.tsx
  test/
    setup.ts
```

**Rule:** all Supabase calls go through `src/lib/queries.ts`. No scattered `supabase.from(...)` in components.

## Data model (Postgres)

- `couples(id uuid pk, invite_code text unique, created_at)`
- `profiles(id uuid pk = auth.uid, couple_id uuid fk, display_name text, accent text check in ('a','b'), created_at)` — unique on `(couple_id, accent)`
- `names(id uuid pk, couple_id uuid null, value text, gender text check in ('girl','boy','unisex'), origin text, created_by uuid null, created_at)`
  - `couple_id IS NULL` → built-in seed name (visible to everyone)
  - `couple_id` set → custom name for that couple only
- `votes(id uuid pk, couple_id uuid fk, name_id uuid fk names, user_id uuid fk auth, value text check in ('like','pass'), created_at, unique(name_id, user_id))`

The deck for a couple = `names WHERE couple_id IS NULL OR couple_id = my_couple`, minus the names I've already voted on, filtered by gender.

## Server-enforced privacy (RLS + functions)

- **`names`** — SELECT allowed when `couple_id IS NULL OR couple_id = my_couple`. INSERT only with own `couple_id`.
- **`votes`** — SELECT/INSERT/UPDATE/DELETE allowed **only where `user_id = auth.uid()`**. A user can read **only their own votes**. Never expose another user's vote rows to the client.
- **`get_matches()`** — `SECURITY DEFINER` function returning names where **both** members of the caller's couple voted `like`. This is the only way matches reach the client.
- **`partner_progress()`** — `SECURITY DEFINER` function returning **counts only** (e.g. partner's total votes). Must not leak which specific names the partner liked.

If you cannot satisfy the privacy invariant with a given approach, stop and ask rather than weakening it.

## Design direction

The signature concept: **the two of you are a Venn diagram.** Each partner has an accent color; matches live in the overlap, rendered in the blend of the two.

- **Palette:** paper `#FAF6F0`, ink `#2C2833`, Partner A periwinkle `#6E80D8`, Partner B rose `#E07A93`, match/overlap violet `#9A6FC0`, pass/neutral `#9A95A3`.
- **Type:** **Fraunces** for the names themselves (the hero on each card) and headings; **Hanken Grotesk** for UI/body. Load from Google Fonts with system fallbacks.
- **`VennHeader`** is the signature element: two overlapping translucent circles (A + B) with the match count sitting in the overlap.
- **Like = violet heart** (pushes toward the overlap), **Pass = neutral X**. Don't use rose/red for the like button (it clashes with Partner B's accent).
- Swipe deck: one big name per card in Fraunces, gender badge + origin underneath, a peek of the next card behind for depth. Support drag-to-swipe **and** buttons **and** keyboard (← pass / → like). Provide undo for the last vote.

## Conventions

- TypeScript `strict`; avoid `any`. Functional components + hooks only.
- Optimistic updates for votes; reconcile against realtime/refetch.
- Every interactive control: `aria-label`, visible `focus-visible` ring, respect `prefers-reduced-motion`.
- Empty/error/loading states are real screens, not afterthoughts.
- Don't add a new dependency without flagging it first.
- Small, focused commits. Run `pnpm typecheck && pnpm lint && pnpm test` before considering a task done.

## Hosting & cost (must stay free)

- **Web:** Vercel Hobby plan, served from the free `*.vercel.app` URL. No custom domain.
- **Backend:** Supabase Free tier (500 MB DB, 50k MAU — we'll use a few MB and 2 users).
- **The pause gotcha:** Supabase Free pauses after **7 days of no activity**. A GitHub Actions keep-alive workflow (`.github/workflows/keep-alive.yml`) pings daily.
- **Stay well inside limits:** paginate queries, cache with TanStack Query, prefer RPCs over raw row pulls.

If any task would require leaving a free tier, **stop and ask** instead of upgrading.
