"use client";

import type { CardOpportunity } from "@/components/ui/opportunity-detail-modal";
import { OpportunityDetailModal } from "@/components/ui/opportunity-detail-modal";
import { cn } from "@/lib/utils";
import { useState } from "react";

/**
 * One row of a dashboard project list — "Projects you posted" and the admin
 * review queue both use it.
 *
 * The title opens the same read-only detail modal the gallery uses, so an NPO
 * reads their own listing, and an admin reads a submission awaiting review,
 * exactly as an engineer would. The interest CTA is always hidden here: both
 * lists are only ever shown to roles that don't sign up.
 *
 * `actions` stays a slot rather than being rendered inline so its contents
 * remain server components, and so clicks on them never reach the row's own
 * click target.
 */
export function ProjectListRow({
  index,
  opportunity,
  subtitle,
  actions,
  className,
}: {
  index: number;
  opportunity: CardOpportunity;
  /** Defaults to the nonprofit name. */
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li
      className={cn(
        "flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <p className="font-serif text-base font-medium text-foreground underline decoration-transparent underline-offset-4 transition-colors hover:decoration-border">
          {opportunity.title}
        </p>
        <p className="caps mt-0.5">{subtitle ?? opportunity.nonprofit}</p>
      </button>

      {actions && <div className="flex items-center gap-4">{actions}</div>}

      <OpportunityDetailModal
        open={open}
        onClose={() => setOpen(false)}
        index={index}
        opportunity={opportunity}
        showJoin={false}
      />
    </li>
  );
}
