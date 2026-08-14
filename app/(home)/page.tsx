import LoginButton from "@/app/(components-navbar)/login-button";
import { createServerSupabaseClient } from "@/lib/server-utils";
import Link from "next/link";

const steps = [
  {
    n: "01",
    title: "Sign in with GitHub",
    body: "Your GitHub account is your identity here — no forms, no new password.",
  },
  {
    n: "02",
    title: "Read the collection",
    body: "Every project names the nonprofit behind it, the stack, and the skills it needs.",
  },
  {
    n: "03",
    title: "Take one on",
    body: "Signal interest and the nonprofit is emailed to reach out to you directly.",
  },
];

// Static gallery preview for the frontispiece — a taste of the collection.
const collection = [
  { no: "01", title: "Rebuild the donor dashboard", org: "Food Bank Boston" },
  { no: "02", title: "Volunteer shift scheduler", org: "City Year" },
  { no: "03", title: "Intake data pipeline", org: "Shelter Network" },
];

export default async function Home() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-28">
      {/* ── Hero ── */}
      <section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col items-start">
          <p className="caps animate-rise">
            Harvard Computer Society — Tech for Social Good
          </p>

          <h1
            className="animate-rise mt-6 font-serif text-5xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "60ms" }}
          >
            A marketplace for{" "}
            <span className="font-script text-[1.15em] text-primary">
              doing good.
            </span>
          </h1>

          <p
            className="animate-rise mt-7 max-w-md font-serif text-lg italic leading-relaxed text-muted-foreground"
            style={{ animationDelay: "120ms" }}
          >
            Nonprofits post the tech they actually need. Student engineers browse
            the collection and take one on.
          </p>

          <div
            className="animate-rise mt-9 flex flex-wrap items-center gap-6"
            style={{ animationDelay: "180ms" }}
          >
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="font-serif text-lg text-foreground underline decoration-primary decoration-2 underline-offset-[6px] transition-colors hover:text-primary"
                >
                  Browse the collection →
                </Link>
                <Link
                  href="/dashboard"
                  className="font-serif text-lg italic text-muted-foreground underline decoration-border underline-offset-[6px] transition-colors hover:text-foreground"
                >
                  Post a project
                </Link>
              </>
            ) : (
              <>
                <LoginButton />
                <span className="caps">Free · GitHub sign-in</span>
              </>
            )}
          </div>
        </div>

        {/* Frontispiece plate */}
        <div className="animate-rise" style={{ animationDelay: "240ms" }}>
          <div className="tile">
            <div className="t4sg-gradient relative flex aspect-[4/5] items-center justify-center overflow-hidden">
              <div className="dot-field absolute inset-0 opacity-60" />
              <div className="relative text-center">
                <p className="font-serif text-2xl italic text-foreground/80">
                  Tech for
                </p>
                <p className="font-serif text-5xl font-semibold leading-tight text-foreground">
                  Social Good
                </p>
              </div>
              <span className="absolute bottom-3 left-3 caps text-foreground/70">
                The collection
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="caps">Est. 2025</span>
              <span className="annot">(frontispiece)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="flex flex-col gap-8">
        <div className="flex items-baseline justify-between border-b border-foreground/80 pb-3">
          <h2 className="font-serif text-2xl font-medium text-foreground">
            How it works
          </h2>
          <span className="annot">(three steps)</span>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3">
          {steps.map((step, i) => (
            <li
              key={step.n}
              className={`flex flex-col gap-3 py-4 md:px-7 ${
                i > 0 ? "border-t border-border md:border-l md:border-t-0" : "md:pl-0"
              }`}
            >
              <span className="font-serif text-3xl font-medium text-primary">
                {step.n}
              </span>
              <h3 className="font-serif text-lg font-medium text-foreground">
                {step.title}
              </h3>
              <p className="annot not-italic text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Collection preview ── */}
      <section className="flex flex-col gap-8">
        <div className="flex items-baseline justify-between border-b border-foreground/80 pb-3">
          <h2 className="font-serif text-2xl font-medium text-foreground">
            From the collection
          </h2>
          <span className="annot">(selected works)</span>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
          {collection.map((item) => (
            <div key={item.no} className="tile">
              <div className="t4sg-gradient relative flex aspect-[5/3] items-center justify-center overflow-hidden border-b border-border">
                <div className="dot-field absolute inset-0 opacity-60" />
                <span className="relative font-serif text-5xl font-medium text-foreground/85">
                  {item.no}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2 px-4 py-4">
                <div>
                  <h3 className="font-serif text-base font-medium text-foreground">
                    {item.title}
                  </h3>
                  <p className="caps mt-1">{item.org}</p>
                </div>
                <span className="annot shrink-0">({item.no})</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Closing ── */}
      {!user && (
        <section className="dot-field border border-border bg-card px-6 py-16 text-center">
          <p className="caps">Start now</p>
          <h2 className="mx-auto mt-4 max-w-xl font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl">
            Find a project that&apos;s{" "}
            <span className="font-script text-[1.15em] text-primary">
              worth your weekend.
            </span>
          </h2>
          <p className="annot mx-auto mt-3 max-w-md">
            Sign in with GitHub to read the full collection and connect with
            nonprofits who need what you can build.
          </p>
          <div className="mt-8 flex justify-center">
            <LoginButton />
          </div>
        </section>
      )}
    </div>
  );
}
