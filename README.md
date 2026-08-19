# Social Good Marketplace

A web platform that connects volunteers and developers with nonprofits that have tech project needs. Nonprofits can list opportunities, and users can browse and express interest in taking them on.

---

- [Social Good Marketplace](#social-good-marketplace)
  - [Project Status](#project-status)
  - [Features](#features)
  - [Next Steps](#next-steps)
  - [Setup](#setup)
    - [(1) Clone repository](#1-clone-repository)
    - [(2) Package installation](#2-package-installation)
    - [(3) Supabase Connection Setup](#3-supabase-connection-setup)
    - [(4) Resend Email Setup](#4-resend-email-setup)
      - [(4a) Verify `t4sg.dev` as a sending domain](#4a-verify-t4sgdev-as-a-sending-domain)
      - [(4b) Create an API key scoped to sending only](#4b-create-an-api-key-scoped-to-sending-only)
    - [(5) Supabase CLI Setup](#5-supabase-cli-setup)
    - [(6) Run the webapp](#6-run-the-webapp)
    - [(7) (Recommended) Configure git message template](#7-recommended-configure-git-message-template)
    - [(8) Github CI workflow (for SSWEs, do during project setup)](#8-github-ci-workflow-for-sswes-do-during-project-setup)
  - [File Walkthrough](#file-walkthrough)
    - [`app/`](#app)
    - [`components/`](#components)
    - [`lib/`](#lib)
    - [Configuration Files & More](#configuration-files--more)
  - [Stack References](#stack-references)
    - [Typescript](#typescript)
    - [Components and Styling: `shadcn/ui`, Radix, and Tailwind CSS](#components-and-styling-shadcnui-radix-and-tailwind-css)
    - [Design system: "The Open Queue"](#design-system-the-open-queue)
    - [Next.js](#nextjs)
    - [Supabase](#supabase)
      - [Roles and approval](#roles-and-approval)
      - [Schema history](#schema-history)
      - [Notifications](#notifications)
    - [Environment variables](#environment-variables)
  - [Development Tools](#development-tools)
    - [Code formatting and linting tools](#code-formatting-and-linting-tools)
    - [VSCode Extensions](#vscode-extensions)
  - [Progress Log](#progress-log)
  - [Feature Changes Since June 2026](#feature-changes-since-june-2026)
  - [Interest and Decision Notifications](#interest-and-decision-notifications)

---

## Project Status

This project is actively under development. GitHub authentication, database-backed opportunity cards, expressions of interest, and nonprofit accept/reject decisions are implemented.

Since the UI experiments merge (`7716ac3`) the app has grown three layers on top of that base:

1. **A role system.** Every profile carries an `app_role` (`member`, `swe`, `npo`, `admin`) plus an approval flag. Roles decide who can post projects, who can express interest, and who reviews the queue. Users request a role from their profile page; an admin approves it.
2. **Notification delivery, in two channels.** Transactional email through Resend (`/api/interest`, `/api/signups/[signupId]/decision`) and in-app notifications written by database triggers and surfaced in a header bell.
3. **A distinct visual identity.** An editorial "Open Queue" redesign — serif/script/sans type system, semantic status colors, and a color lab at `/lab` for tuning the palette.

Email delivery is simulated in development when a Resend API key is not configured.

---

## Features

- **GitHub OAuth Authentication** — Users sign in with their GitHub account via Supabase Auth. On first login, a profile row is automatically created in the database with their username and avatar URL.
- **Protected Dashboard** — The `/dashboard` route is only accessible to signed-in users. Unauthenticated visitors are redirected to the home page.
- **Roles and Approval** — Profiles carry a role (`member`, `swe`, `npo`, `admin`) and an approval flag. Users request contributor (SWE) or organizer (NPO) access from `/settings/profile`; an admin approves it. The UI reads the role through `getViewer()` and shows a different dashboard to each: organizers get a post button and applicant controls, admins get a review queue, approved SWEs get the "I'm interested" CTA, and unapproved members see it disabled with a prompt to request access. RLS on the database is the real gate — the UI only avoids offering actions that would 403.
- **Project Submission** — Organizers post projects through a modal form validated with Zod: title, nonprofit, optional nonprofit website, description, start and end dates (end must be on or after start), contact email, and skills. Skills use a searchable multi-select of nine presets (React, Next.js, TypeScript, Python, Java, Design, Data Analysis, Mobile, DevOps) with an "Other" field for free-text entries; selections render as removable chips and persist as a comma-separated string.
- **Admin Review Queue** — New projects land as `pending`. Admins see them in a dedicated queue on the dashboard and approve or reject each one; only `approved` projects appear in the public gallery. Owners can also delete their own projects.
- **Opportunity Cards** — The dashboard displays a grid of nonprofit project cards, each showing the project title, nonprofit name, description, and required skills.
- **Detail Modals** — Clicking any opportunity card or project row opens a modal overlay with the full project details — timeline, skill chips, a link to the nonprofit's site, a `mailto:` contact link, and the "I'm interested" button. The modal can be closed by clicking the backdrop, clicking the X button, or pressing Escape.
- **Status Badges** — Projects show their state (Approved / Under review / Rejected / Closed) as a semantic color-coded badge, so an organizer can tell at a glance where each of their postings stands.
- **Interest Notifications** — An approved SWE can express interest once per project. The signup is recorded in Supabase, the nonprofit is notified, and the SWE receives a confirmation email.
- **Applicant Decisions** — Project owners see interested engineers under their projects and can accept or reject each one. The decision is saved in Supabase and both parties receive an email update.
- **Navbar** — Includes links to Home and, for logged-in users, the Dashboard. Auth status is shown in the top right corner.
- **Notifications** — A bell in the header shows in-app notifications addressed to the signed-in user, with an unread badge and mark-as-read. Rows are written by database triggers, so any state change we care about can become a notification without new application code. See [Notifications](#notifications) below.
- **Settings Pages** — Users can navigate to `/settings` to view and edit their profile and general preferences.
- **Auth Error Handling** — A dedicated error page is shown if the GitHub OAuth login flow fails.

---

## Next Steps

- **Email configuration** — Verify the `t4sg.dev` sending domain in Resend and issue a sending-access key restricted to it. Steps in [(4) Resend Email Setup](#4-resend-email-setup).
- **Flow testing** — Test interest, acceptance, and rejection emails with SWE and NPO accounts.
- **Commit the schema** — Baseline the live database (roles, opportunities, signups, policies, functions) into `supabase/migrations/`. See [Schema history](#schema-history); right now the app cannot recreate its own database.
- **Admin role management UI** — Role requests are written from the profile page, but approving them still means editing `profiles` by hand in Supabase.
- **Close the loop on the two notification channels** — Interest and decision events send email from route handlers; status changes write in-app rows from triggers. Decide which events should do both.
- **Maintain documentation** — Keep the `docs/` folder and this README up to date as features are added.

---

## Setup

#### (1) Clone repository

In your terminal, navigate to the directory where you want to store this project and run:

```bash
git clone <your-repo-url>
cd t4sg-social-good-marketplace
```

#### (2) Package installation

Make sure you have [Node.js](https://nodejs.org/en) (v18+) and `npm` installed. Then run:

```bash
npm install
```

#### (3) Supabase Connection Setup

1. Create a free account at [supabase.com](https://supabase.com) and make sure you are added to the Supabase project for Social Good Marketplace (contact your PM).
2. In the Supabase project, go to **Project Overview** and copy the **Project URL** and **Publishable key**.
3. Copy the `env.example` file to `.env.local`:
   ```bash
   cp env.example .env.local
   ```
4. Fill in all five values in `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key>
   RESEND_API_KEY=<your Resend API key>
   EMAIL_FROM="T4SG Engineering <engineering@t4sg.dev>"
   EMAIL_TEAM="engineering@t4sg.dev"
   ```

   Notes on each:

   - **`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`** — the two values you copied in step 2. The variable is named `..._ANON_KEY` for historical reasons; Supabase now labels that same value the **Publishable key** in the dashboard. It is safe to expose to the browser — RLS is what protects the data. Never put the **service role** / secret key in this file.
   - **`RESEND_API_KEY`** — get one at [resend.com](https://resend.com). **If you don't have a key yet, that's fine — leave it blank and keep going.** `lib/email.ts` detects the missing key and simulates delivery by logging each message to the server console, so the interest and decision flows still work end to end. Only set a real key once the domain in `EMAIL_FROM` is verified in Resend; Resend rejects sends from an unverified domain, so a real key with an unverified sender is worse than no key at all. See [(4) Resend Email Setup](#4-resend-email-setup) for verifying the domain and creating a properly scoped key.
   - **`EMAIL_FROM`** — the sender address. The domain must be verified in Resend; the prefix (`engineering@`, `support@`, …) is yours to choose.
   - **`EMAIL_TEAM`** — the team mailbox that receives decision emails, with the SWE and nonprofit CC'd.

   The two Supabase variables are declared in `env.mjs` and validated at build time, so a missing one fails the build. The three email variables are read straight from `process.env` and each has a hardcoded fallback — so fill them in deliberately, because a typo in the name silently uses the default instead of raising an error.

5. If you are pointing at a **fresh** Supabase project rather than the shared one, the database will be empty and every query will fail. `notifications.sql` is the only schema this repo can replay — the rest (`profiles` roles, `opportunities`, `signups`, their policies and functions) exists only in the shared project's dashboard. Read [Schema history](#schema-history) before going down this path.

#### (4) Resend Email Setup

Skip this if you left `RESEND_API_KEY` blank — the app simulates delivery and everything else works. Do it when you want real emails to go out. There are two parts, and **both are required**: Resend will not send from `engineering@t4sg.dev` until the domain is verified, and the key you use to send should never be a full-access one.

##### (4a) Verify `t4sg.dev` as a sending domain

A new Resend account can only send from `onboarding@resend.dev`. Sending from `engineering@t4sg.dev` — the address this project uses in `EMAIL_FROM` — means proving you own `t4sg.dev` first:

1. Open the [Resend Domains dashboard](https://resend.com/domains) and click **Add Domain**.
2. Enter `t4sg.dev`. A subdomain such as `mail.t4sg.dev` also works and keeps this app's sending reputation separate from any other mail on the root domain — but it changes the sender to `engineering@mail.t4sg.dev`, so pick one and set `EMAIL_FROM` to match.
3. Resend generates the **DNS records** for it: a DKIM `TXT` record for the signing key, an SPF `TXT` record authorizing Resend's servers, and an `MX` record for bounce handling.
4. Log in to whoever hosts DNS for `t4sg.dev` — Vercel, Cloudflare, Namecheap — and add those records exactly as Resend shows them, including the record names. Ask your PM if you don't have registrar access; this is the step that usually needs someone else.
5. Wait for the domain to flip to **Verified** in Resend. Propagation is usually minutes, occasionally up to an hour.
6. Once verified, **any** prefix on that domain is a valid sender — `engineering@t4sg.dev`, `no-reply@t4sg.dev`, `support@t4sg.dev` — with no further setup per address. `EMAIL_FROM` is already set to `T4SG Engineering <engineering@t4sg.dev>`, so nothing to change unless you want a different prefix.

##### (4b) Create an API key scoped to sending only

**Make sure the key is scoped to Sending Access, not Full Access.** A full-access key can read your account, create and revoke other keys, and send as any domain you own; this app only ever needs to send.

1. Go to **API Keys** in Resend and click **Create API Key**.
2. Change **Permission** from `Full Access` to **`Sending Access`**.
3. Select `t4sg.dev` from the **Restricted Domain** dropdown, so the key cannot send as any other domain on the account.
4. Copy the key into `RESEND_API_KEY` in `.env.local`. Resend shows it once — if you lose it, revoke it and make a new one rather than reusing anything.

That combination caps the blast radius: a leaked key can send mail as `t4sg.dev` and nothing else. `.env.local` is gitignored, but scope the key anyway — how bad a leak gets shouldn't depend on that file staying secret.

#### (5) Supabase CLI Setup

The Supabase CLI is optional but useful for managing database migrations locally.

1. Install it: [Supabase CLI docs](https://supabase.com/docs/guides/cli/getting-started) or `brew install supabase/tap/supabase`
2. Log in: `supabase login` or `npx supabase login`
3. Link to your project: `npx supabase link --project-ref <your-project-ref>`. Your project ref is the subdomain in your Supabase project URL — `https://<project-ref>.supabase.co` — also visible in your .`env.local` (likely as `NEXT_PUBLIC_SUPABASE_URL`).

#### (6) Run the webapp

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. (The 3000 might be a slightly different number.)

#### (7) (Recommended) Configure git message template

This repo includes a `.gitmessage` template to encourage consistent commit messages. To use it:

```bash
git config commit.template .gitmessage
```

#### (8) Github CI workflow (for SSWEs, do during project setup)

The repo includes a GitHub Actions workflow (`.github/`) that runs ESLint and Prettier checks on every pull request. To enable it, make sure the workflow files are present and that the repository has Actions enabled under **Settings → Actions**.

---

## File Walkthrough

#### `app/`

Contains all pages and route-level components, following Next.js App Router conventions.

- **`api/interest/route.ts`** — Authenticates an SWE, records one expression of interest, and sends the NPO and SWE emails.
- **`api/signups/[signupId]/decision/route.ts`** — Authenticates a project owner, records an accept/reject decision, and sends the decision email.

- **`(components-navbar)/`** — Components that make up the top navigation bar:

  - `auth-status.tsx` — Checks if the user is logged in and renders either `UserNav` or `LoginButton`.
  - `login-button.tsx` — Triggers the GitHub OAuth sign-in flow.
  - `mode-toggle.tsx` — Dropdown to switch between light, dark, and system themes.
  - `navbar.tsx` — Main nav bar. Shows a "Dashboard" link only when a user is signed in. Edit this file to add new nav links.
  - `notification-bell.tsx` — The bell dropdown. Client component; re-reads the `notifications` table every 30s (and on tab focus) and marks rows read.
  - `notifications-nav.tsx` — Server wrapper that renders the bell only for signed-in users, seeded with a server-side read so the badge is right on first paint.
  - `user-nav.tsx` — Avatar dropdown with links to profile, settings, and sign-out.

- **`auth/`** — Auth-related routes:

  - `auth-code-error/` — Page displayed when the GitHub OAuth login fails.
  - `callback/route.ts` — Handles the redirect from GitHub/Supabase after login. Exchanges the auth code for a session and sets cookies.

- **`dashboard/page.tsx`** — Protected page, and the one screen that changes most by role. It resolves the viewer with `getViewer()`, then loads approved projects, the viewer's own projects, and (for admins) the pending queue in parallel. Organizers see their applicants and accept/reject controls beneath each posting; admins see the review queue; approved SWEs see the interest CTA on cards they didn't post.

- **`lab/page.tsx`** — `/lab`, an internal color lab. Lets you edit the palette live in the browser, preview it against real components (cards, badges, toasts) in light and dark mode, and copy the resulting CSS variables to paste into `app/globals.css`. Development tooling, not a user-facing route.

- **`settings/`** — User settings pages:

  - `general/page.tsx` — General settings (placeholder).
  - `profile/page.tsx` and `profile/profile-form.tsx` — Shows the viewer's current role and hosts the role request form. A user picks Contributor (SWE) or Organizer (Nonprofit), which writes `requested_role` on their profile and shows a pending state until an admin approves it.
  - `layout.tsx` — Shared layout for settings pages; enforces authentication and renders the sidebar.
  - `page.tsx` — Redirects `/settings` to `/settings/general`.

- **`layout.tsx`** — Root layout; wraps all pages with the navbar and context providers.
- **`page.tsx`** — Home page with a static nonprofit canvas placeholder grid.
- **`not-found.tsx`** / **`loading.tsx`** — Fallback pages for 404s and loading states.
- **`providers.tsx`** — Sets up app-wide context providers (e.g. toast notifications, theme).
- **`globals.css`** — Global CSS styles.

#### `components/`

Shared components used across multiple pages.

- **`global/sidebar-nav.tsx`** — Sidebar navigation used in the settings layout.
- **`ui/`** — UI component library:
  - `opportunity-card.tsx` — The card component for a nonprofit project listing. Clicking it opens the detail modal. Takes `showJoin` / `canJoin` / `joinReason` so the dashboard, not the card, decides whether the CTA appears, is live, or is disabled with an explanation.
  - `opportunity-detail-modal.tsx` — Full project view: formatted timeline (`formatTimeline`), parsed skill chips (`parseSkills`), nonprofit website link, and `mailto:` contact link.
  - `project-list-row.tsx` — A compact numbered row used by the admin queue and the "projects you posted" list. The row body is clickable and opens the same detail modal; `actions` and `footer` slots carry the per-role controls.
  - `add-opportunity-modal.tsx` — The organizer's project submission form: Zod-validated fields, date range check, and the searchable skills multi-select with preset chips plus custom entries.
  - `project-actions.tsx` — `AdminReviewActions` (approve/reject a pending project) and `DeleteProjectButton` (owner deletes their own posting). Both write to Supabase directly and `router.refresh()`.
  - `interest-button.tsx` — Posts to `/api/interest`. Renders disabled with a reason when the viewer isn't an approved SWE.
  - `signup-decision-actions.tsx` — Client-side Accept and Reject buttons for project owners.
  - `status-badge.tsx` — Color-coded opportunity status pill (Approved / Under review / Rejected / Closed).
  - `modal.tsx` — A reusable overlay modal. Supports closing via backdrop click, X button, or Escape key.
  - `modals/providers.tsx` — Context provider for modal state management.
  - Other components: `button`, `avatar`, `dropdown-menu`, `form`, `input`, `label`, `select`, `separator`, `textarea`, `toast`, `toaster`, `typography`.

#### `lib/`

Utility functions and type definitions.

- `client-utils.ts` — Creates a Supabase client for use in browser (client) components.
- `server-utils.ts` — Creates a Supabase client for use in server components and route handlers. Also manages auth cookies.
- `email.ts` — Server-only Resend wrapper with simulated delivery and CC support.
- `roles.ts` — Server-only `getViewer()`. Returns the signed-in user, their profile, and the derived permission flags (`isAdmin`, `canPost`, `canJoin`, `showJoinCta`) that the dashboard and cards branch on. Falls back to `member` if the profile can't be read rather than locking the dashboard — RLS is still the real gate on every write.
- `schema.ts` — TypeScript types that mirror the Supabase database schema. **Update this file whenever the database schema changes** to keep type safety intact.
- `utils.ts` — General-purpose utilities: Tailwind class merging (`cn`), a sleep helper, and a profile fetcher.
- `reset.d.ts` — Enables the `ts-reset` package for stricter TypeScript type checking.

#### Configuration Files & More

- `.env.local` — Local environment variables (not committed to git). See `env.example` for required keys.
- `env.mjs` — Validates environment variables at build time using Zod.
- `notifications.sql` — SQL for the notifications table, its RLS policies, and the triggers that write to it. Run it in the Supabase SQL editor. See [Schema history](#schema-history) for why it's the only SQL file here.
- `middleware.ts` — Runs on every request to refresh the Supabase Auth session cookie.
- `next.config.local.js` — Gitignored, and no longer tracked. It held a local-only override that switched dev file watching to polling, to work around macOS `EMFILE` ("too many open files") errors that break hot reload. Nothing in `next.config.js` ever loaded it. If you hit that watcher bug on macOS, add `watchOptions: { poll: 1000, aggregateTimeout: 300, ignored: /node_modules/ }` to the dev branch of a `webpack()` override in `next.config.js` locally.
- `next.config.js` — Next.js configuration.
- `components.json` — `shadcn/ui` configuration.
- `tailwind.config.ts` — Tailwind CSS configuration.
- `tsconfig.json` — TypeScript configuration.
- `.eslintrc.cjs` / `.prettierrc.cjs` — Linting and formatting rules.

---

## Stack References

### Typescript

The entire project is written in TypeScript. Strict mode is enabled. The `schema.ts` file in `lib/` contains types that correspond to the Supabase database tables — keep this in sync as the schema evolves.

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [ts-reset](https://github.com/total-typescript/ts-reset)

### Components and Styling: `shadcn/ui`, Radix, and Tailwind CSS

UI components come from [`shadcn/ui`](https://ui.shadcn.com), which are built on [Radix UI](https://www.radix-ui.com) primitives and styled with [Tailwind CSS](https://tailwindcss.com). Components are copied directly into `components/ui/` and can be customized freely.

- [shadcn/ui docs](https://ui.shadcn.com/docs)
- [Tailwind CSS docs](https://tailwindcss.com/docs)

### Design system: "The Open Queue"

The UI was redesigned around an editorial identity — the site reads like a printed catalogue of projects rather than a generic dashboard. The pieces that make it consistent:

**Type.** Three Google fonts are loaded in `app/layout.tsx` and exposed as Tailwind families:

| Family                                   | Font     | Used for                                 |
| ---------------------------------------- | -------- | ---------------------------------------- |
| `font-serif` (aliased as `font-display`) | Fraunces | Headings, titles, italic asides          |
| `font-sans`                              | Inter    | Body copy, UI controls                   |
| `font-script`                            | Caveat   | The handwritten accent word in headlines |

**Utility classes.** Defined once in `app/globals.css` under `@layer components`, so the editorial voice doesn't get re-implemented per page:

- `.caps` — small, letter-spaced uppercase eyebrow labels ("The collection", "Admin", "Yours").
- `.annot` — muted annotation text for counts, empty states, and hints.
- `.dot-field` — dotted-paper background used behind empty states and CTAs.

**Color.** `tailwind.config.ts` adds semantic `success` / `warning` / `danger` tokens, each with a `soft` variant for badge backgrounds, on top of the existing shadcn tokens. Everything is defined as HSL CSS variables in `globals.css` with a dark-mode override, so components never hardcode a hex value and both themes stay in sync. `/lab` exists to tune these variables against live components and copy the result back out.

### Next.js

This project uses the [Next.js App Router](https://nextjs.org/docs/app). Pages are defined by `page.tsx` files inside the `app/` directory. Server Components are the default — add `"use client"` at the top of a file only when you need client-side interactivity (e.g. `useState`, `useEffect`, event handlers).

- [Next.js docs](https://nextjs.org/docs)
- [App Router: Server vs. Client Components](https://nextjs.org/docs/app/building-your-application/rendering)

### Supabase

Supabase provides the database (PostgreSQL), authentication, and real-time features.

- Auth is handled via GitHub OAuth. The session is managed through cookies and refreshed in `middleware.ts`.
- Always use `supabase.auth.getUser()` (not `getSession()`) to verify identity in server code.
- The `profiles` table mirrors data from `auth.users` and is auto-populated via a database trigger.

- [Supabase docs](https://supabase.com/docs)
- [Supabase Auth + Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

#### Roles and approval

`profiles` carries the role columns the whole permission model rests on:

| Column                        | Meaning                                                     |
| ----------------------------- | ----------------------------------------------------------- |
| `role`                        | `app_role` enum — `member` (default), `swe`, `npo`, `admin` |
| `role_approved`               | Whether the current role is admin-approved                  |
| `requested_role`              | What the user asked for from `/settings/profile`            |
| `approved_by` / `approved_at` | Who granted it, and when                                    |

The derived permissions, computed in `lib/roles.ts`:

| Flag          | True for                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| `isAdmin`     | `admin`                                                                                                            |
| `canPost`     | `admin`, or an approved `npo`                                                                                      |
| `canJoin`     | An approved `swe` — deliberately _not_ admins, because the `signups` policy admits `role = 'swe'` alone            |
| `showJoinCta` | Anyone who isn't an `npo` or `admin`; an unapproved `member` still sees it disabled, as a prompt to request access |

Opportunities carry `status` (`pending` → `approved` / `rejected` / `closed`), plus `t4sg_verified`, `nonprofit_link`, `start_date`, `end_date`, and `contact_email`. Newly posted projects start `pending` and only reach the public gallery once an admin approves them, which is also the event that fires the organizer's approval notification.

These role functions and policies (`approve_role`, `is_admin`, `can_join_projects`, and the `signups` policies) live only in the Supabase dashboard — see the warning below.

#### Schema history

**This repo cannot currently recreate its own database.** Worth knowing before you point the app at a fresh Supabase project and wonder why every query fails.

There used to be a `setup.sql` at the repo root, added in the initial commit, which created the `profiles` table, its RLS policies, and the `handle_new_user` trigger. **It was deleted in `e60742e` ("Add supabase support for dashboard", 2026-05-09.)** It is still in git history and can be recovered:

```bash
git show c6781a3:setup.sql > setup.sql
```

Everything added since — `opportunities`, `signups`, the `app_role` / `opportunity_status` / `signup_status` enums, the role-approval functions (`approve_role`, `is_admin`, `can_join_projects`, …) — was applied directly in the Supabase dashboard and was never committed. The only record of it is `lib/schema.ts`, which describes the shape but contains no DDL, no RLS policies, and no function bodies.

`notifications.sql` is the one piece of schema that is tracked. Keep it that way: schema changes belong in a committed `.sql` file _and_ run against the database, never just run. If you want this enforced rather than agreed to, baseline the live schema into `supabase/migrations/` with the Supabase CLI (`supabase db dump`) — that would recover the untracked schema into version control at the same time.

#### Notifications

Notifications live in a single `notifications` table (`user_id`, `message`, `link`, `read`, `created_at`). Clients never insert into it — RLS grants `select` on your own rows and `update` on the `read` column only. Rows are written by one reusable trigger function, `public.notify_user()`, which takes three arguments:

| Argument     | Meaning                                                   |
| ------------ | --------------------------------------------------------- |
| `tg_argv[0]` | Column on the changed row holding the recipient's user id |
| `tg_argv[1]` | Message to display                                        |
| `tg_argv[2]` | Link to open (optional)                                   |

Which field change fires it is decided by the trigger's `WHEN` clause, so **adding a notification is one `CREATE TRIGGER` statement** — no new function, no `schema.ts` edit, no UI change:

```sql
create trigger opportunity_approved_notify
  after update of status on public.opportunities
  for each row
  when (old.status is distinct from new.status and new.status = 'approved')
  execute function public.notify_user(
    'created_by',
    'Your project was approved and is now live in the gallery.',
    '/dashboard'
  );
```

Messages are fixed strings, because a generic function can't know that `signups.opportunity_id` points at `opportunities.title`. If a message needs the project name interpolated into it, give that event its own trigger function that does the lookup — both styles can write to the same table.

Two guards live in `notify_user()`: it skips the notification when the recipient is the person who made the change (no "your project was closed" when you closed it yourself), and when the recipient has no `profiles` row. The second matters because `opportunities.created_by` has no foreign key — inserting against a missing profile would raise a FK violation on `notifications.user_id` and roll back the update that triggered it, so an admin's approve click would just fail.

Currently wired up:

| Event              | Recipient | Fires when                          |
| ------------------ | --------- | ----------------------------------- |
| Added to a project | Volunteer | `signups.status` → `onboarded`      |
| Interest declined  | Volunteer | `signups.status` → `declined`       |
| Project approved   | Organizer | `opportunities.status` → `approved` |
| Project rejected   | Organizer | `opportunities.status` → `rejected` |
| Project closed     | Organizer | `opportunities.status` → `closed`   |

### Environment variables

Environment variables live in `.env.local` (gitignored). `env.example` is the template — keep it in sync when you add a variable.

| Variable                        | Required | If unset                                  | Read by                                        |
| ------------------------------- | -------- | ----------------------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Build fails                               | `client-utils.ts`, `server-utils.ts`           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Build fails                               | `client-utils.ts`, `server-utils.ts`           |
| `RESEND_API_KEY`                | No       | Email is simulated to the server console  | `lib/email.ts`                                 |
| `EMAIL_FROM`                    | No       | `T4SG Engineering <engineering@t4sg.dev>` | `lib/email.ts`                                 |
| `EMAIL_TEAM`                    | No       | `engineering@t4sg.dev`                    | `app/api/signups/[signupId]/decision/route.ts` |

Only the two `NEXT_PUBLIC_SUPABASE_*` variables are declared in `env.mjs`, so only those are validated at build time — a missing or malformed one fails the build with a descriptive error. The three email variables are read directly from `process.env` with the fallbacks above, which means a misspelled name silently produces the default instead of an error. `NODE_ENV` is validated too, but Next.js sets it, not you.

To skip validation entirely (e.g. in a Docker build), set `SKIP_ENV_VALIDATION=1`.

---

## Development Tools

### Code formatting and linting tools

- **[ESLint](https://eslint.org)** — Catches code quality issues. Config is in `.eslintrc.cjs`. Run manually with `npm run lint`.
- **[Prettier](https://prettier.io)** — Auto-formats code. Config is in `.prettierrc.cjs`. Run with `npm run format` or let your editor do it on save.
- **[EditorConfig](https://editorconfig.org)** — Keeps basic formatting (indentation, line endings) consistent across editors. Config is in `.editorconfig`.
- **GitHub CI** — A GitHub Actions workflow runs ESLint and Prettier checks automatically on every pull request.

### VSCode Extensions

Install these for the best experience:

- **ESLint** (`dbaeumer.vscode-eslint`) — Inline linting.
- **Prettier** (`esbenp.prettier-vscode`) — Auto-format on save.
- **EditorConfig** (`editorconfig.editorconfig`) — Applies `.editorconfig` rules.
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) — Autocomplete for Tailwind classes.
- **[BetterComments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments)** — Color-coded comment annotations.
- **[Live Share](https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare)** — Real-time collaborative editing.
- **[Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)** — Inline error and warning messages.
- **[Pretty TypeScript Errors](https://marketplace.visualstudio.com/items?itemName=yoavbls.pretty-ts-errors)** — More readable TypeScript error messages.

---

## Progress Log

For the Spring 2026 version, we made weekly progress notes are tracked in the `docs/` folder. For future development, we suggest adding to this progress log.

| Date    | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4/22/26 | GitHub OAuth auth working. Opportunity cards added. Minimal viable UI in place. Auth error page added.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 4/30/26 | Modal components added — clicking a card now opens a detail view with an "I'm interested" button. Documentation updated.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 5/9/26  | Supabase-backed dashboard. (`setup.sql` deleted here — see [Schema history](#schema-history)).                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 7/19/26 | (`020c4c0`) README updated for the Supabase connection and CLI setup steps; `supabase/` working directories added to `.gitignore`.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 8/7/26  | Capped a two-week effort on the Supabase security model: rewrote and tightened the RLS policies across `profiles`, `opportunities`, and `signups` so role permissions are enforced by the database rather than the UI. This is what makes `member` / `swe` / `npo` / `admin` mean anything — e.g. only an approved `swe` can insert a `signup`, and only an admin can move an opportunity out of `pending`. Applied in the Supabase dashboard, so none of it is in this repo — see [Schema history](#schema-history) and [Roles and approval](#roles-and-approval). |
| 8/13/26 | (`7716ac3`, ui-experiments) "The Open Queue" editorial redesign: Fraunces/Inter/Caveat type system, `.caps` / `.annot` / `.dot-field` utilities, semantic status colors, and the `/lab` color tool. Studio identity landed alongside the role/approval model and the first email wiring.                                                                                                                                                                                                                                                                            |
| 8/16/26 | In-app notifications added: `notifications` table, a reusable `notify_user()` trigger, and a bell in the header. Signup status changes (`onboarded`, `declined`) notify the volunteer; opportunity status changes (`approved`, `rejected`, `closed`) notify the organizer.                                                                                                                                                                                                                                                                                          |
| 8/17/26 | Email routing finished: `/api/interest` and `/api/signups/[signupId]/decision` handle auth, writes, and Resend delivery server-side.                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 8/18/26 | Role-aware dashboard merged to main: admin review queue, owner delete, clickable project rows opening the shared detail modal, status badges, and the expanded submission form (nonprofit link, start/end dates, searchable skills multi-select).                                                                                                                                                                                                                                                                                                                   |

## Feature Changes Since June 2026

Everything below is in the current version of `main`. Each entry lists what changed and the files that changed.

### Roles and permissions

**Summary**

- Every profile has a role: `member`, `swe`, `npo`, or `admin`. New users start as `member`.
- Users request Contributor (SWE) or Organizer (NPO) access from their profile page. An admin approves it.
- The role decides what the dashboard shows. NPOs and admins get a post button. Admins get a review queue. Approved SWEs get "I'm interested".
- RLS policies in Supabase enforce the same rules, so the UI only hides actions the database would reject anyway.

**Files**

- `lib/roles.ts` — `getViewer()`, which returns the user, role, and the `isAdmin` / `canPost` / `canJoin` / `showJoinCta` flags
- `lib/schema.ts` — `app_role` enum, `role`, `role_approved`, `requested_role`, `approved_by`, `approved_at`
- `app/settings/profile/profile-form.tsx` — role request form
- `app/dashboard/page.tsx` — branches on the viewer's flags

### Posting and reviewing projects

**Summary**

- NPOs and admins post projects through the Add Opportunity modal.
- New projects start as `pending` and do not appear in the public gallery.
- Admins see a review queue and approve or reject each project.
- Project owners (NPO, Admin) can delete their own projects.
- Every project shows a status badge: Approved, Under review, Rejected, or Closed.

**Files**

- `components/ui/add-opportunity-modal.tsx` — the post form
- `components/ui/project-actions.tsx` — `AdminReviewActions` and `DeleteProjectButton`
- `components/ui/status-badge.tsx` — the status pill
- `components/ui/project-list-row.tsx` — compact row used by the queue and the owner's list
- `lib/schema.ts` — `opportunity_status` enum

### Opportunity details

**Summary**

- NPOs and admins can add a nonprofit website link when posting. It shows as "Learn more" on the card and "About the nonprofit" in the detail modal.
- Add Opportunity includes required start and end dates. The end date must be on or after the start date. The timeline shows on the card and in the detail modal.
- Skills is a multi-select dropdown with search, chips, and an Other field for custom skills. Values still save as a comma-separated string.
- Each project has a contact email, shown as a `mailto:` link in the modal.

**Files**

- `lib/schema.ts` — `nonprofit_link`, `start_date`, `end_date`, `contact_email`, `created_by`
- `components/ui/add-opportunity-modal.tsx` — form fields, skills picker, `created_by` on insert
- `components/ui/opportunity-detail-modal.tsx` — timeline, skill chips, link, contact
- `components/ui/opportunity-card.tsx` — link, timeline, owner CTA
- `app/dashboard/page.tsx` — passes the new fields; still sorts by `created_at` newest first

### Shared detail modal

**Summary**

- Clicking an opportunity opens the same read-only detail modal for NPOs as for SWEs.
- Project rows in the admin queue and the owner's list open that same modal.
- "I'm interested" is hidden when the viewer owns the listing (`created_by === current user`).
- The button is disabled with a reason for anyone who is not an approved SWE.

**Files**

- `components/ui/opportunity-detail-modal.tsx` — the shared modal
- `components/ui/opportunity-card.tsx` — takes `showJoin`, `canJoin`, `joinReason`
- `components/ui/project-list-row.tsx` — clickable rows
- `components/ui/interest-button.tsx` — the CTA and its disabled state

### Email notifications

**Summary**

- An approved SWE can express interest once per project. The NPO gets an email and the SWE gets a confirmation.
- The project owner accepts or rejects each applicant. Both parties get an email.
- Emails send from authenticated route handlers, never from the browser.
- Without a Resend API key, emails are logged to the server console instead of sent.

**Files**

- `app/api/interest/route.ts` — records interest and sends both emails
- `app/api/signups/[signupId]/decision/route.ts` — records the decision and sends the email
- `lib/email.ts` — Resend wrapper with CC support and simulated delivery
- `components/ui/signup-decision-actions.tsx` — Accept and Reject buttons
- `lib/schema.ts` — `signups` table and `signup_status` enum

### In-app notifications

**Summary**

- A bell in the header shows notifications for the signed-in user, with an unread badge and mark-as-read.
- Rows are written by database triggers, not by the app.
- Volunteers are notified when they are added to a project or declined.
- Organizers are notified when their project is approved, rejected, or closed.
- Adding a new notification takes one `CREATE TRIGGER` statement and no app code.

**Files**

- `notifications.sql` — table, RLS policies, and the reusable `notify_user()` trigger function
- `app/(components-navbar)/notification-bell.tsx` — the dropdown
- `app/(components-navbar)/notifications-nav.tsx` — server wrapper that seeds the badge

### UI redesign

**Summary**

- The site was redesigned around an editorial identity, "The Open Queue".
- Three fonts: Fraunces for headings, Inter for body, Caveat for accents.
- Reusable classes replace one-off styling: `.caps`, `.annot`, `.dot-field`.
- Semantic color tokens for `success`, `warning`, and `danger`, each with a soft variant, defined once and overridden for dark mode.
- `/lab` is an internal tool for editing the palette live and copying the CSS back out.

**Files**

- `app/layout.tsx` — font loading
- `app/globals.css` — color variables and utility classes
- `tailwind.config.ts` — font families and semantic colors
- `app/(home)/page.tsx` — redesigned landing page
- `app/lab/page.tsx` — the color lab
- `components/ui/typography.tsx` — updated type scale

### Earlier UI fixes

**Summary**

- The dashboard grid is responsive: one column on mobile, two on tablet, three on desktop.
- Modals cap at 90% of the viewport height and scroll long content instead of overflowing.
- Long titles clamp to two lines; long descriptions wrap.
- Hardcoded light-mode colors were replaced with theme-aware Tailwind values.

**Files**

- `components/ui/modal.tsx` — height cap and scrolling
- `components/ui/opportunity-card.tsx` — clamping and theme colors
- `app/dashboard/page.tsx` — responsive grid

## Interest and Decision Notifications

The email workflow uses authenticated Next.js Route Handlers rather than calling Resend or performing trusted database updates from the browser.

### SWE expresses interest

1. `InterestButton` sends `POST /api/interest` with an `opportunityId`.
2. The route gets the authenticated user from Supabase; it never accepts a volunteer ID from the browser.
3. A `signups` row is inserted with status `interested`. The database's unique opportunity/volunteer constraint prevents duplicate signups and duplicate emails.
4. The nonprofit receives an interest notification and the SWE receives a confirmation.

### NPO accepts or rejects an SWE

1. The project owner sees applicants beneath each project on the dashboard.
2. Accept or Reject sends `PATCH /api/signups/[signupId]/decision` with a decision of `accept` or `reject`.
3. The route authenticates the caller, derives the opportunity and volunteer from the signup, and verifies that the caller created the opportunity.
4. The route changes `interested` to `onboarded` for acceptance or `declined` for rejection. A signup that was already decided cannot be changed again.
5. The decision email is sent from the configured T4SG sender to the engineering mailbox with the SWE and nonprofit CC'd.

The shared mail wrapper is in `lib/email.ts`. It supports CC recipients and simulates delivery when `RESEND_API_KEY` is absent. Configure `EMAIL_FROM` with a sender on a domain verified by Resend before enabling real delivery.
