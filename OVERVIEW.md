<h1 align="center">Social Good Marketplace</h1>

<p align="center">
  <b>A queue of real nonprofit tech projects, and a way for student engineers to take one on.</b>
</p>

<p align="center">
  <i>Next.js · Supabase · Tailwind · Resend</i>
</p>

---

Nonprofits have software they need built and no budget to build it. Students have
skills and need a place to drive impact and hone their skills further. The Tech Product Marketplace is a project
management platform designed for T4SG (Tech for Social
Good) to bridge the gap between nonprofit organizations
and student software engineering volunteers. The application
serves as a prototype for nonprofits to list opportunities and
for students to browse and sign up based on their technical
skills. This project began in Fall 2025 (Kyle Zheng, PM and
Yareh Constant, SSWE project leads), and has continued into
Spring 2026 (Alisona Le, PM & SSWE project lead) and Summer 2026 (Athena Zhou, PM & SSWE project lead).


This app makes that state visible. Nonprofits post projects, an admin reviews them,
engineers browse and express interest, and nonprofits accept or reject applicants.
Everyone gets an email and an in-app notification when something changes. With this project, we are able to increase accessibility for software developers to make social good contributions to real social impact projects.

---

## Who can do what

Every account has a role. Roles are requested from your profile page and approved by
an admin.

| Role     | Can                                                      |
| -------- | -------------------------------------------------------- |
| `member` | Browse approved projects. The default for new accounts.  |
| `swe`    | Express interest in projects, once each.                 |
| `npo`    | Post projects; accept or reject applicants to their own. |
| `admin`  | Approve or reject submitted projects.                    |

Permissions are enforced by Postgres row-level security, not by the interface. The UI
hides what you can't do; the database is what actually stops you.

---

## Quickstart

```bash
git clone <repo> && cd t4sg-social-good-marketplace
npm install
cp env.example .env.local   # add your Supabase URL and publishable key
npm run dev
```

Open http://localhost:3000 and sign in with GitHub. Your profile is created
automatically as a `member`.

You now have a running app against the shared database. To do anything beyond
browsing, request a role at `/settings/profile` and ask an admin to approve it.

You do **not** need a Resend API key. Without one, emails are logged to your server
console instead of sent, and every flow still works end to end.

---

## How it works

### Posting a project

A nonprofit or admin fills in the Add Opportunity form: title, nonprofit, an optional
website link, description, start and end dates, contact email, and skills. Skills is a
searchable multi-select with presets and an "Other" field for anything not listed.

New projects are saved as **pending** and don't appear in the public gallery until an
admin approves them.

### Expressing interest

Approved engineers see "I'm interested" on any project they don't own. One click
records the signup, emails the nonprofit, and sends a confirmation. A second click
does nothing (to prevent duplicate signups and emails).

### Accepting or rejecting

Project owners see their applicants under each posting. Accept or Reject writes the
decision and emails both parties. A decision can't be reversed once made.

### Staying informed

Two channels. **Email** for interest and decisions, sent from authenticated server
routes. **In-app notifications** in the header bell for status changes — added to a
project, declined, or your project approved, rejected, or closed. Notification rows
are written by database triggers, so adding a new one is a single `CREATE TRIGGER`
statement with no application code.

---

## Configuration

| Variable                        | Required | Default                | Description                         |
| ------------------------------- | -------- | ---------------------- | ----------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | yes      | —                      | Supabase project URL                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes      | —                      | The dashboard's _Publishable key_   |
| `RESEND_API_KEY`                | no       | — (emails simulated)   | Scope to sending access, one domain |
| `EMAIL_FROM`                    | no       | `engineering@t4sg.dev` | Domain must be verified in Resend   |
| `EMAIL_TEAM`                    | no       | `engineering@t4sg.dev` | Receives decision emails            |

Never add the Supabase **service role** key. It bypasses row-level security, which is
the only thing enforcing the permission model.

---

## Troubleshooting

**Every query fails and the dashboard is empty**
You're probably pointed at a fresh Supabase project. The repo can't recreate its own
schema — only `notifications.sql` is tracked. Use the shared project.

**"Couldn't post the project. You may need approved organizer access."**
Your role isn't an approved `npo` or `admin`. Request organizer access at
`/settings/profile`.

**"I'm interested" is greyed out**
You aren't an approved `swe` yet, or you own the project. The button explains which.

**No emails arrive**
Expected without `RESEND_API_KEY` — check your server console for
`[email:simulated]` lines. With a key set, the `EMAIL_FROM` domain must be verified
in Resend or Resend rejects the send.

---

## FAQ

**Why GitHub sign-in and nothing else?**
The users are student engineers, who all have GitHub accounts, and it gives us a
verified identity and avatar without storing passwords. The OAuth app is registered to
a T4SG account rather than a member's personal one, so credentials outlive any one
student and the consent screen names the organization.

**Is there a test suite?**
No. CI runs Prettier and ESLint only. Permission changes need manual testing through Supabase.

**Where do I change the colors?**
`app/globals.css` defines the palette as CSS variables. `/lab` is an internal tool for
editing them live against real components and copying the result back out.

---

## Known limitations

- The database schema isn't in version control.
- No tests, and no deployment pipeline — the app isn't hosted anywhere yet.
- Approving a role request means editing a `profiles` row by hand in Supabase.
- `emailShell()` interpolates values into email HTML without escaping them.
- The notification bell polls every 30 seconds instead of using realtime.

---

## More

- [README.md](README.md) — full documentation
- [ENGINEERING.md](ENGINEERING.md) — architecture, code map, and gotchas
- `docs/` — weekly progress notes from the Spring 2026 version
