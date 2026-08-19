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
 * `actions` and `footer` stay slots rather than being rendered inline so their
 * contents remain server components, and so clicks on them never reach the
 * row's own click target. `footer` sits below the row for per-row detail, such
 * as the applicant list an organizer sees under each project they posted.
 */
export function ProjectListRow({
  index,
  opportunity,
  subtitle,
  actions,
  footer,
  className,
}: {
  index: number;
  opportunity: CardOpportunity;
  /** Defaults to the nonprofit name. */
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  /** Rendered beneath the row, inside the same list item. */
  footer?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className={cn("flex flex-col gap-4 p-4", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
      </div>

      {footer}

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
