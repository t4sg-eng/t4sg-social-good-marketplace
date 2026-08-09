import LoginButton from "@/app/(components-navbar)/login-button";
import { Button } from "@/components/ui/button";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// A small, honest preview of the product's core object: the open queue.
const previewRows = [
  {
    ref: "PRJ-0142",
    title: "Rebuild the donor dashboard",
    org: "food-bank-boston",
    labels: ["React", "TypeScript"],
    status: "verified" as const,
  },
  {
    ref: "PRJ-0138",
    title: "Volunteer shift scheduler",
    org: "city-year",
    labels: ["Python", "REST API"],
    status: "review" as const,
  },
  {
    ref: "PRJ-0131",
    title: "Clean up the intake data pipeline",
    org: "shelter-network",
    labels: ["SQL", "Airflow"],
    status: "verified" as const,
  },
];

const steps = [
  {
    n: "01",
    title: "Sign in with GitHub",
    body: "One click — your GitHub account is your identity here. No forms, no new password.",
  },
  {
    n: "02",
    title: "Read the queue",
    body: "Every project lists the nonprofit behind it, the stack, and the exact skills it needs.",
  },
  {
    n: "03",
    title: "Take one on",
    body: "Signal interest on a project and the nonprofit is notified to reach out to you directly.",
  },
];

const principles = [
  {
    tag: "no busywork",
    title: "Every project is real",
    body: "Each listing comes from a nonprofit with a genuine technical need — not a practice exercise. What you build gets used.",
  },
  {
    tag: "skills first",
    title: "You see the stack up front",
    body: "Projects surface the languages and tools required, so you can find the ones where your skills actually move the needle.",
  },
  {
    tag: "low commitment",
    title: "Browse before you commit",
    body: "Read the whole queue, and only reach out when a project genuinely resonates. Interest is a signal, not a contract.",
  },
  {
    tag: "open source",
    title: "Built in the open",
    body: "Made by HCS Tech for Social Good. The marketplace itself is an open-source project, same as the work it lists.",
  },
];

function StatusPill({ status }: { status: "verified" | "review" }) {
  if (status === "verified") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-evergreen-soft px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-evergreen">
        <span className="h-1.5 w-1.5 rounded-full bg-evergreen" />
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-clay-soft px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-clay">
      <span className="h-1.5 w-1.5 rounded-full bg-clay" />
      Under review
    </span>
  );
}

export default async function Home() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-28 pb-8">
      {/* ── Hero: the thesis is the queue itself ── */}
      <section className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="flex flex-col items-start">
          <p className="kicker animate-rise">Harvard Computer Society — Tech for Social Good</p>

          <h1
            className="mt-6 max-w-2xl animate-rise font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]"
            style={{ animationDelay: "60ms" }}
          >
            An open queue of problems <span className="text-primary">worth solving.</span>
          </h1>

          <p
            className="mt-7 max-w-xl animate-rise text-lg leading-relaxed text-muted-foreground"
            style={{ animationDelay: "120ms" }}
          >
            Nonprofits post the tech they actually need — dashboards, data pipelines, tools that ship. Student engineers
            read the queue and take one on.
          </p>

          <div className="mt-9 flex animate-rise flex-wrap items-center gap-4" style={{ animationDelay: "180ms" }}>
            {user ? (
              <Button asChild size="lg" className="group">
                <Link href="/dashboard">
                  Browse open projects
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            ) : (
              <LoginButton />
            )}
            <span className="font-mono text-xs text-muted-foreground">Free · GitHub sign-in</span>
          </div>
        </div>

        {/* ── Signature: the ledger ── */}
        <div
          className="w-full animate-rise overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_0_hsl(var(--border)),0_18px_50px_-24px_hsl(var(--foreground)/0.28)]"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">open&nbsp;queue</span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-evergreen opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-evergreen" />
              </span>
              live
            </span>
          </div>

          <ul className="divide-y divide-border">
            {previewRows.map((row) => (
              <li key={row.ref} className="flex flex-col gap-2 px-4 py-4 transition-colors hover:bg-muted/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      <span className="mr-2 font-mono text-xs text-muted-foreground">{row.ref}</span>
                      {row.title}
                    </p>
                    <p className="mt-1 font-mono text-xs text-primary">@{row.org}</p>
                  </div>
                  <StatusPill status={row.status} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {row.labels.map((label) => (
                    <span key={label} className="label-chip">
                      {label}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-border px-4 py-3">
            <span className="font-mono text-[11px] text-muted-foreground">…and more, once you&apos;re in</span>
          </div>
        </div>
      </section>

      {/* ── How it works: a genuine 3-step pipeline ── */}
      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">How it works</h2>
          <span className="kicker hidden sm:block">the path</span>
        </div>
        <div className="ledger-rule mt-4" />

        <ol className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.n} className="relative flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-primary">{step.n}</span>
                {i < steps.length - 1 && <span className="hidden h-px flex-1 bg-border md:block" />}
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Principles ── */}
      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Why it&apos;s built this way
          </h2>
          <span className="kicker hidden sm:block">principles</span>
        </div>
        <div className="ledger-rule mt-4" />

        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          {principles.map((p) => (
            <div key={p.title} className="flex flex-col gap-2 bg-card p-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">{p.tag}</span>
              <h3 className="font-display text-lg font-semibold text-foreground">{p.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Closing CTA ── */}
      {!user && (
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-16 text-center sm:px-16">
          <p className="kicker">Start now</p>
          <h2 className="mx-auto mt-4 max-w-lg font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Find a project that&apos;s worth your weekend.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Sign in with GitHub to read the full queue and connect with nonprofits who need exactly what you can build.
          </p>
          <div className="mt-8 flex justify-center">
            <LoginButton />
          </div>
        </section>
      )}
    </div>
  );
}
