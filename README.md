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
    - [(4) Supabase CLI Setup](#4-supabase-cli-setup)
    - [(5) Run the webapp](#5-run-the-webapp)
    - [(6) (Recommended) Configure git message template](#6-recommended-configure-git-message-template)
    - [(7) Github CI workflow (for SSWEs, do during project setup)](#7-github-ci-workflow-for-sswes-do-during-project-setup)
  - [File Walkthrough](#file-walkthrough)
    - [`app/`](#app)
    - [`components/`](#components)
    - [`lib/`](#lib)
    - [Configuration Files & More](#configuration-files--more)
  - [Stack References](#stack-references)
    - [Typescript](#typescript)
    - [Components and Styling: `shadcn/ui`, Radix, and Tailwind CSS](#components-and-styling-shadcnui-radix-and-tailwind-css)
    - [Next.js](#nextjs)
    - [Supabase](#supabase)
    - [Environment variables](#environment-variables)
  - [Development Tools](#development-tools)
    - [Code formatting and linting tools](#code-formatting-and-linting-tools)
    - [VSCode Extensions](#vscode-extensions)
  - [Progress Log](#progress-log)
  - [Interest and Decision Notifications](#interest-and-decision-notifications)

---

## Project Status

This project is actively under development. GitHub authentication, database-backed opportunity cards, expressions of interest, and nonprofit accept/reject decisions are implemented. Email delivery is simulated in development when a Resend API key is not configured.

---

## Features

- **GitHub OAuth Authentication** — Users sign in with their GitHub account via Supabase Auth. On first login, a profile row is automatically created in the database with their username and avatar URL.
- **Protected Dashboard** — The `/dashboard` route is only accessible to signed-in users. Unauthenticated visitors are redirected to the home page.
- **Opportunity Cards** — The dashboard displays a grid of nonprofit project cards, each showing the project title, nonprofit name, description, and required skills.
- **Detail Modals** — Clicking any opportunity card opens a modal overlay with the full project details and an "I'm interested" button. The modal can be closed by clicking the backdrop, clicking the X button, or pressing Escape.
- **Interest Notifications** — An approved SWE can express interest once per project. The signup is recorded in Supabase, the nonprofit is notified, and the SWE receives a confirmation email.
- **Applicant Decisions** — Project owners see interested engineers under their projects and can accept or reject each one. The decision is saved in Supabase and both parties receive an email update.
- **Navbar** — Includes links to Home and, for logged-in users, the Dashboard. Auth status is shown in the top right corner.
- **Settings Pages** — Users can navigate to `/settings` to view and edit their profile and general preferences.
- **Auth Error Handling** — A dedicated error page is shown if the GitHub OAuth login flow fails.

---

## Next Steps

- **Email configuration** — Verify the `t4sg.dev` sending domain and configure the engineering sender in Resend.
- **Flow testing** — Test interest, acceptance, and rejection emails with SWE and NPO accounts.
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
4. Fill in the values in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

#### (4) Supabase CLI Setup

The Supabase CLI is optional but useful for managing database migrations locally.

1. Install it: [Supabase CLI docs](https://supabase.com/docs/guides/cli/getting-started) or `brew install supabase/tap/supabase`
2. Log in: `supabase login` or `npx supabase login`
3. Link to your project: `npx supabase link --project-ref <your-project-ref>`. Your project ref is the subdomain in your Supabase project URL — `https://<project-ref>.supabase.co` — also visible in your .`env.local` (likely as `NEXT_PUBLIC_SUPABASE_URL`).

#### (5) Run the webapp

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. (The 3000 might be a slightly different number.)

#### (6) (Recommended) Configure git message template

This repo includes a `.gitmessage` template to encourage consistent commit messages. To use it:

```bash
git config commit.template .gitmessage
```

#### (7) Github CI workflow (for SSWEs, do during project setup)

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
  - `user-nav.tsx` — Avatar dropdown with links to profile, settings, and sign-out.

- **`auth/`** — Auth-related routes:

  - `auth-code-error/` — Page displayed when the GitHub OAuth login fails.
  - `callback/route.ts` — Handles the redirect from GitHub/Supabase after login. Exchanges the auth code for a session and sets cookies.

- **`dashboard/page.tsx`** — Protected page that renders database-backed opportunities. Project owners also see their applicants and decision controls here.

- **`settings/`** — User settings pages:

  - `general/page.tsx` — General settings (placeholder).
  - `profile/page.tsx` and `profile/profile-form.tsx` — Profile settings with a form for updating username and avatar.
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
  - `opportunity-card.tsx` — The card component for a nonprofit project listing. Clicking it opens a `Modal` with full details and an "I'm interested" button.
  - `signup-decision-actions.tsx` — Client-side Accept and Reject buttons for project owners.
  - `modal.tsx` — A reusable overlay modal. Supports closing via backdrop click, X button, or Escape key.
  - `modals/providers.tsx` — Context provider for modal state management.
  - Other components: `button`, `avatar`, `dropdown-menu`, `form`, `input`, `label`, `select`, `separator`, `textarea`, `toast`, `toaster`, `typography`.

#### `lib/`

Utility functions and type definitions.

- `client-utils.ts` — Creates a Supabase client for use in browser (client) components.
- `server-utils.ts` — Creates a Supabase client for use in server components and route handlers. Also manages auth cookies.
- `email.ts` — Server-only Resend wrapper with simulated delivery and CC support.
- `schema.ts` — TypeScript types that mirror the Supabase database schema. **Update this file whenever the database schema changes** to keep type safety intact.
- `utils.ts` — General-purpose utilities: Tailwind class merging (`cn`), a sleep helper, and a profile fetcher.
- `reset.d.ts` — Enables the `ts-reset` package for stricter TypeScript type checking.

#### Configuration Files & More

- `.env.local` — Local environment variables (not committed to git). See `env.example` for required keys.
- `env.mjs` — Validates environment variables at build time using Zod.
- `setup.sql` — SQL to initialize the Supabase database (profiles table, RLS policies, trigger).
- `middleware.ts` — Runs on every request to refresh the Supabase Auth session cookie.
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

### Environment variables

Required environment variables (defined in `.env.local`):

| Variable                        | Description                                                          |
| ------------------------------- | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL                                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase project anon/public key                                |
| `RESEND_API_KEY`                | Optional Resend API key. Without it, email is logged as simulated.   |
| `EMAIL_FROM`                    | Verified sender, normally `T4SG Engineering <engineering@t4sg.dev>`. |
| `EMAIL_TEAM`                    | Team mailbox used as the primary recipient for decision emails.      |

These are validated at build time by `env.mjs`. If a required variable is missing, the build will fail with a descriptive error.

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

| Date    | Summary                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------ |
| 4/22/26 | GitHub OAuth auth working. Opportunity cards added. Minimal viable UI in place. Auth error page added.                   |
| 4/30/26 | Modal components added — clicking a card now opens a detail view with an "I'm interested" button. Documentation updated. |

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
