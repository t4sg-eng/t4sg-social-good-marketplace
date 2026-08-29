# Social Good Marketplace — Engineering Guide

> **Status:** Active development
> **Owner:** T4SG Engineering · **Questions:** ask your PM
> **Production:** not deployed yet · **Staging:** none

A Next.js app that connects student engineers with nonprofits that have tech project
needs. Nonprofits post projects, an admin approves them, engineers express interest,
and nonprofits accept or reject applicants. Everything except the UI lives in Supabase —
if Supabase is down, the app is down.

For the full narrative version of this document, see [README.md](README.md).

---

## Why this exists

The Tech Product Marketplace is a project
management platform designed for T4SG (Tech for Social
Good) to bridge the gap between nonprofit organizations
and student software engineering volunteers. The application
serves as a prototype for nonprofits to list opportunities and
for students to browse and sign up based on their technical
skills.

This project began in Fall 2025 (Kyle Zheng, PM and
Yareh Constant, SSWE project leads), and has continued into
Spring 2026 (Alisona Le, PM & SSWE project lead) and Summer 2026 (Athena Zhou, PM & SSWE project lead).


---

## Architecture

```
  browser ──> Next.js App Router (server components by default)
                 │
                 ├── direct Supabase queries (reads, admin actions)  ──> Postgres + RLS
                 │
                 └── /api/* route handlers (interest, decisions) ───> Postgres + RLS
                                                          │
                                                          └──> Resend (email)

  Postgres triggers ──> notifications table ──> header bell (polls every 30s)
```

| Component       | Location                   | Responsibility                                   |
| --------------- | -------------------------- | ------------------------------------------------ |
| Dashboard       | `app/dashboard/page.tsx`   | Role-aware project lists; the main screen        |
| Role resolution | `lib/roles.ts`             | `getViewer()` → user, role, permission flags     |
| Interest API    | `app/api/interest/`        | Records a signup, sends two emails               |
| Decision API    | `app/api/signups/.../`     | Accept/reject a signup, sends the decision email |
| Email           | `lib/email.ts`             | Resend wrapper; simulates delivery without a key |
| Notifications   | `notifications.sql`        | Table, RLS, and the `notify_user()` trigger      |
| Bell UI         | `app/(components-navbar)/` | Polls notifications, marks read                  |
| Schema types    | `lib/schema.ts`            | Generated types mirroring the database           |

**Key data flows**

1. NPO posts a project → row inserted as `pending` → admin approves → `status = 'approved'`
   → visible in the gallery, and a trigger notifies the organizer.
2. SWE clicks "I'm interested" → `POST /api/interest` → `signups` row as `interested` →
   emails to the NPO and the SWE.
3. NPO accepts/rejects → `PATCH /api/signups/[id]/decision` → status becomes `onboarded`
   or `declined` → decision email, and a trigger notifies the volunteer.

---

## Code map

| If you're changing...     | Start in...                                     |
| ------------------------- | ----------------------------------------------- |
| Who can see or do what    | `lib/roles.ts`, then the RLS policies           |
| The main project listing  | `app/dashboard/page.tsx`                        |
| The post-a-project form   | `components/ui/add-opportunity-modal.tsx`       |
| Cards and detail views    | `components/ui/opportunity-*.tsx`               |
| Email content or delivery | `lib/email.ts`, `app/api/`                      |
| In-app notifications      | `notifications.sql` (one `CREATE TRIGGER`)      |
| Colors, fonts, utilities  | `app/globals.css`, `tailwind.config.ts`, `/lab` |
| Database types            | `lib/schema.ts` (`npm run types` regenerates)   |

`components/ui/` also holds unmodified shadcn/ui primitives — not worth reading.

---

## Local development

**Prerequisites**

- Node.js 18+ and npm
- Access to the shared Supabase project (ask your PM)
- Supabase CLI, optional, for regenerating types

**Setup**

```bash
git clone <repo> && cd t4sg-social-good-marketplace
npm install
cp env.example .env.local   # fill in the values below
npm run dev
```

Open http://localhost:3000 and sign in with GitHub. You should land on `/dashboard`
with the project gallery.

**Environment variables**

| Variable                        | Required | Default                | Notes                                    |
| ------------------------------- | -------- | ---------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | yes      | —                      | Build fails without it                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes      | —                      | Supabase dashboard calls it the _Publishable key_ |
| `RESEND_API_KEY`                | no       | — (emails simulated)   | Sending-access key, domain-restricted    |
| `EMAIL_FROM`                    | no       | `engineering@t4sg.dev` | Domain must be verified in Resend        |
| `EMAIL_TEAM`                    | no       | `engineering@t4sg.dev` | Primary recipient for decision emails    |

Only the two Supabase variables are validated by `env.mjs`. The email three are read
straight from `process.env` with the fallback as `engineering@t4sg.dev`, so a typo in the name fails silently.

Never put the Supabase **service role** key in `.env.local`. It bypasses RLS, which is
the only thing enforcing the permission model.

---

## Testing

```bash
npm run lint        # ESLint
npm run prettier    # format check
npm run format      # fix both
```

Role and permission changes need manual testing across all four roles. **Testing for RLS related-policies should occur in Supabase.**

---

## Deployment

**The newest version is not yet deployed.** Goal is to host in Vercel environment. `npm run build` works locally only.

---

## Operations

Supabase's own dashboard
(logs, table editor, auth users) contains all data relating to users and interactions.

**Common problems**

| Symptom                              | Likely cause                       | Fix                                         |
| ------------------------------------ | ---------------------------------- | ------------------------------------------- |
| Every query fails on a fresh project (i.e. not editing the original Supabase project) | Schema isn't in the repo           | Point at the shared project; see Gotchas    |
| Emails never arrive                  | `RESEND_API_KEY` unset             | Expected — check the server console         |
| Resend rejects a send                | `EMAIL_FROM` domain unverified     | Verify the domain before setting a real key |
| An action 403s but the button showed | UI flags and RLS policies disagree | RLS is correct; fix `lib/roles.ts`          |

---

## Gotchas

- **Make sure to use the shared, original Supabase project rather than trying to create your own new one** Point at the shared project, not a fresh one.
- **RLS is the real permission system.** `lib/roles.ts` only decides what to render.
  Every flag there has a matching policy in the database, and the database wins.
  Changing one without the other produces buttons that 403. The point is that security has to be on the backend, and not the frontend. You can think of the RLS policies as the actual security, while the UI is just for convenience.
- **Admins deliberately can't express interest.** `canJoin` requires `role === 'swe'`,
  because the `signups` policy admits SWEs alone.
- **`notify_user()` skips self-notifications and profile-less users.** The second guard
  matters: `opportunities.created_by` has no foreign key, so notifying a missing
  profile would raise an FK violation and roll back the status update that triggered
  it — an admin's approve click would just fail.
- **The GitHub OAuth app is T4SG-owned**, not on a member's personal account. Don't
  register a replacement under your own — rotate credentials from the T4SG account.

---

## Conventions

- **Branches:** feature branches off `main`, merged by PR
- **Commits:** `.gitmessage` template — `git config commit.template .gitmessage`
- **Style:** Prettier and ESLint, enforced by CI. Don't restate the rules; the configs
  are `.prettierrc.cjs` and `.eslintrc.cjs`. CI auto-commits formatting fixes to your
  branch, so pull after a push.
- **Schema changes:** belong in a committed `.sql` file _and_ run against the database.

---

## Decisions

| Date    | Decision                                   | Rationale                                                          |
| ------- | ------------------------------------------ | ------------------------------------------------------------------ |
| 2026-08 | Roles enforced by RLS, not the app         | The UI can be bypassed; the database can't                         |
| 2026-08 | GitHub OAuth app moved to a T4SG account   | Credentials outlive members, looks more professional than a student name; consent screen shows T4SG             |
| 2026-08 | Notifications written by triggers          | A new notification is one `CREATE TRIGGER`, no app code            |
| 2026-08 | Email sent from route handlers, not client | The browser can't be trusted with the sender or the recipient list |
| 2026-08 | Resend API key scoped to sending, one domain   | Caps the blast radius of a leak                                    |
| 2026-08 | Projects start `pending`, admin approves   | Nothing reaches the public gallery unreviewed                      |

---

## Known limitations & planned work

- The live schema isn't in version control. Baseline it with `supabase db dump` into
  `supabase/migrations/`. This is the highest-value cleanup available.
- Role approval has no admin UI — it means editing `profiles` rows by hand.
- `emailShell()` interpolates unescaped HTML.
- The notification bell polls every 30 seconds rather than using Supabase realtime.
- Email and in-app notifications cover overlapping but different events. Need to decide which events should do both.
- **Emails are currently simulated, not broken.** Without `RESEND_API_KEY`, `lib/email.ts` logs
  each message and returns `{ ok: true, simulated: true }`.
- **`emailShell()` does not escape HTML.** Project titles and nonprofit names are
  interpolated into email markup raw. Escape before interpolating if you touch it.
- **Skills are a comma-separated string, not an array.** Parsed and re-joined on every
  edit by `parseSkills()`. Custom entries are deduped case-insensitively against the
  presets so `react` reuses the `React` chip.