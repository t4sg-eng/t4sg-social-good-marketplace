"use client";

import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { ArrowUpRight, Mail } from "lucide-react";
import { useState } from "react";

interface OpportunityCardProps {
  index: number;
  title: string;
  nonprofit: string;
  description: string;
  skills: string;
  contact_email: string;
  t4sg_verified: boolean;
}

// The single `skills` text field is authored as a comma-separated list;
// render each as its own label so the card reads like a tagged ticket.
function parseSkills(skills: string): string[] {
  return skills
    .split(/[,/]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Turn the org name into a handle: "Food Bank Boston" -> "food-bank-boston"
function toHandle(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function StatusPill({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-evergreen-soft px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-evergreen">
      <span className="h-1.5 w-1.5 rounded-full bg-evergreen" />
      Verified
    </span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-clay-soft px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-clay">
      <span className="h-1.5 w-1.5 rounded-full bg-clay" />
      Under review
    </span>
  );
}

export function OpportunityCard({
  index,
  title,
  nonprofit,
  description,
  skills,
  contact_email,
  t4sg_verified,
}: OpportunityCardProps) {
  const [open, setOpen] = useState(false);
  const skillList = parseSkills(skills);
  const ref = `PRJ-${String(index + 1).padStart(4, "0")}`;
  const handle = toHandle(nonprofit);

  return (
    <>
      <article
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="group flex cursor-pointer flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_14px_36px_-22px_hsl(var(--foreground)/0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="font-mono text-xs text-muted-foreground">{ref}</span>
          <StatusPill verified={t4sg_verified} />
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="font-display text-lg font-semibold leading-snug text-foreground">{title}</h3>
          <p className="font-mono text-xs text-primary">@{handle}</p>
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{description}</p>

        {skillList.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skillList.slice(0, 4).map((skill) => (
              <span key={skill} className="label-chip">
                {skill}
              </span>
            ))}
            {skillList.length > 4 && <span className="label-chip">+{skillList.length - 4}</span>}
          </div>
        )}

        <div className="mt-auto flex items-center gap-1.5 pt-1 font-mono text-xs font-medium text-foreground">
          Open project
          <ArrowUpRight className="h-3.5 w-3.5 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </article>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-muted-foreground">{ref}</span>
              <StatusPill verified={t4sg_verified} />
            </div>
            <h2 className="font-display text-2xl font-bold leading-tight text-foreground">{title}</h2>
            <p className="font-mono text-sm text-primary">@{handle}</p>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>

          {skillList.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="kicker">Skills needed</p>
              <div className="flex flex-wrap gap-1.5">
                {skillList.map((skill) => (
                  <span key={skill} className="label-chip">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <p className="kicker">Contact</p>
            <a
              href={`mailto:${contact_email}`}
              className="inline-flex w-fit items-center gap-2 font-mono text-sm text-foreground underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
            >
              <Mail className="h-3.5 w-3.5 text-primary" />
              {contact_email}
            </a>
          </div>

          <Button className="mt-1 w-full">I&apos;m interested</Button>
        </div>
      </Modal>
    </>
  );
}
