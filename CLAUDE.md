# CLAUDE.md — U Logix

Read this file first, every session. Then read `harness/PASS.md` to learn where the
previous session stopped.

## What we're building

U Logix is a freight aggregator for SME shippers in Central Asia and CIS — think
Booking.com for cargo. A user prices a shipment across six carriers, compares
all-in costs against a market benchmark, and books in one click.

This repo is the **Phase 1 web MVP**: a two-day build for an investor demo.

## Stack

| Layer    | Choice |
|----------|--------|
| Framework | Next.js 15, App Router, TypeScript strict |
| Styling  | Tailwind CSS v4 |
| DB       | Postgres (Neon) via Prisma |
| Auth     | bcrypt + `jose` JWT in an httpOnly cookie |
| i18n     | `next-intl`, locales `en` / `uz` / `ru` |
| Icons    | `lucide-react` |
| Deploy   | Vercel |

No Express. No NextAuth. Both were considered and rejected — see
`harness/DECISIONS.md` before proposing either.

## The five rules

**1. Small files, few comments.**
A team takes this over after the demo. Comment the *why* behind non-obvious
business logic, workarounds, and constraints. Never comment what the code or the
types already say. No JSDoc block on every function. If a file passes 200 lines,
split it.

```ts
// GOOD — explains a non-obvious business rule
// Volumetric divisor is 6000, the IATA standard for air freight. Ocean and road
// use the same divisor here so a single chargeable-weight helper covers all modes.

// BAD — restates the signature
// Takes a shipment and returns quotes.
```

**2. One branch per feature. Never commit to main.**
Branches are `feature-N-slug`, numbered per `harness/TODO.md`.

**3. Log every commit to `harness/TODO-COMMITS.md` as you make it.**
The CTO reads this file to follow progress. Write the entry when you commit, not
in a batch at the end.

**4. Planning files stay local.**
Everything in `harness/` is gitignored. Never `git add` it, never mention it in a
PR. Tracked docs are `README.md`, `design/`, and `design-system/` only.

**5. The pricing engine imports nothing from Next.js.**
`src/lib/pricing/` is pure TypeScript — no `next/*`, no React, no Prisma, no
environment access. Phase 2 extracts it into a standalone service for the
Telegram bot, and that must be a file move, not a rewrite.

## Feature workflow

```
1. git checkout main && git pull
2. git checkout -b feature-N-slug
3. Work task by task. One logical change per commit.
   After each commit, append it to harness/TODO-COMMITS.md under this feature,
   status "pending".
4. When the feature is done:
   - npm run build   (must pass)
   - npx tsc --noEmit  (must pass)
   - git push -u origin feature-N-slug
   - gh pr create  (title and body from harness/PR-TEMPLATE.md)
   - merge to main
5. Mark the feature's commits "pushed" in harness/TODO-COMMITS.md.
   Tick the feature in harness/TODO.md.
   Append a session note to harness/PASS.md.
```

main must always build and run.

## Commit format

`type: short imperative description` — lowercase, no trailing period.

| Type | Use |
|------|-----|
| `init:` | start of a project or module |
| `feat:` | new functionality from the spec |
| `fix:` | fix previously implemented behaviour |
| `refactor:` | no behaviour change — move, rename, delete, reformat |
| `docs:` | README or tracked documentation |
| `test:` | tests only |
| `chore:` | tooling, deps, config |

## Design

`design-system/MASTER.md` is the source of truth for colours, typography,
spacing, and component shapes. It was hand-written from the PM's comps — do not
regenerate it.

`design/U_Logix_Web_dc.html` is the PM's interactive comp. It is a custom
template format, not runnable React. Read it to check exact copy, spacing, and
state behaviour. Do not try to execute it or port its runtime.

`harness/DESIGN.md` has the screen-by-screen UX spec: flows, states, edge cases.

### ui-ux-pro-max skill

Installed at `.claude/skills/ui-ux-pro-max/`. Use it for **review and stack
guidance only**:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "form validation" --stack react
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "responsive layout" --stack nextjs
```

Never run `--design-system`. It generates a palette and typography from scratch
and will contradict `design-system/MASTER.md`. Our design system already exists.

Before opening any PR that touches UI, run the skill's pre-delivery checklist
(in `design-system/MASTER.md` § Pre-delivery).

## Things that will bite you

- **The comps use emoji as icons.** We use Lucide instead. The mapping is in
  `design-system/MASTER.md` § Icons. Never copy an emoji into a component.
- **Lane distance is a hack.** `KM` is distance-from-Tashkent per city; a lane is
  the absolute difference. Almaty→Berlin comes out roughly right by luck. Keep it
  for the demo, note it in release notes, do not "fix" it silently.
- **Carrier ratings are read-only.** They're displayed and sortable but nothing
  writes them. Two-way ranking is Phase 2.
- **Quotes must persist before the gate resolves.** The whole signup pitch is
  "your quotes are saved." A quote that dies on refresh breaks the demo.
- **Every user-facing string goes through next-intl.** All three locales, always.
  A missing `uz` key is a build-time failure, not a runtime fallback.
