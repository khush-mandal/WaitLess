# WaitLess Database (Phase 2)

PostgreSQL via **Supabase**. All credentials stay in `server/.env` — never in the React client.

## Tables

| Table | Purpose |
|-------|---------|
| `sectors` | Reference sectors (hospitality, finance, retail, entertainment) |
| `users` | User profiles and gamification counters |
| `places` | Static venue catalog (name, address, coords, image) |
| `crowd_reports` | User-submitted crowd observations |
| `crowd_history` | Append-only log from real reports (via DB trigger) |
| `saved_places` | User favorites (for future API wiring) |

**Not included:** `notifications` — the current frontend uses hardcoded notification UI in `App.jsx` and does not load notification data from any source.

## Demo data policy

- `demo_seed.sql` seeds **sectors**, **demo places**, and one **demo user** (`is_demo = TRUE`).
- Demo user stats start at **zero** (no fabricated report history).
- **No** demo `crowd_reports` or `crowd_history` rows are seeded.
- Live crowd data must come from real submissions.

## Setup

1. Create a Supabase project.
2. Copy `server/.env.example` → `server/.env`.
3. Set `DATABASE_URL` from Supabase → Project Settings → Database → Connection string (URI).
4. Install dependencies and run migrations:

```bash
cd server
npm install
npm run db:setup
npm run db:test
```

## Scripts

| Command | Action |
|---------|--------|
| `npm run db:migrate` | Apply SQL migrations (tracked in `schema_migrations`) |
| `npm run db:seed` | Insert idempotent demo catalog data |
| `npm run db:test` | Connection + read + write (rollback) tests |
| `npm run db:setup` | migrate + seed |

## Relationships

```
sectors 1──* places
users   1──* crowd_reports *──1 places
places  1──* crowd_history
users   *──* places (saved_places)
crowd_reports 1──0..1 crowd_history (via trigger on insert)
```
