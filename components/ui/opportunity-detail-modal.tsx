"use client";

import { InterestButton } from "@/components/ui/interest-button";
import Modal from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Database } from "@/lib/schema";

type Status = Database["public"]["Enums"]["opportunity_status"];

export interface CardOpportunity {
  id: string;
  title: string;
  nonprofit: string;
  nonprofit_link: string | null;
  description: string;
  skills: string;
  start_date: string | null;
  end_date: string | null;
  contact_email: string;
  status: Status;
}

interface OpportunityDetailModalProps {
  open: boolean;
  onClose: () => void;
  index: number;
  opportunity: CardOpportunity;
  /** Whether the interest CTA belongs on screen at all. Hidden for NPOs, who
   *  post projects rather than sign up, and on a viewer's own postings. */
  showJoin: boolean;
  /** When the CTA is shown, whether the viewer may actually act on it. */
  canJoin?: boolean;
  joinReason?: string;
}

/**
 * Render a start/end pair as "Mar 3, 2026 – Jun 12, 2026".
 *
 * The columns are DATE, so the values arrive as bare yyyy-mm-dd with no zone.
 * Parsing them as UTC and formatting in UTC keeps the displayed day identical
 * for every viewer — parsing as local time would shift the date west of GMT.
 */
export function formatTimeline(
  start: string | null,
  end: string | null,
): string | null {
  if (!start || !end) return null;

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const from = formatter.format(new Date(`${start}T00:00:00Z`));
  const to = formatter.format(new Date(`${end}T00:00:00Z`));
  return `${from} – ${to}`;
}

export function parseSkills(skills: string): string[] {
  return skills
    .split(/[,/]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * The read-only detail view for one project.
 *
 * Split out of OpportunityCard so the gallery tile and the "Projects you
 * posted" list can open the same modal — an NPO reads their own listing
 * exactly as an engineer would, minus the interest CTA.
 */
export function OpportunityDetailModal({
  open,
  onClose,
  index,
  opportunity,
  showJoin,
  canJoin = false,
  joinReason,
}: OpportunityDetailModalProps) {
  const skillList = parseSkills(opportunity.skills);
  const catalogue = String(index + 1).padStart(2, "0");
  const timeline = formatTimeline(opportunity.start_date, opportunity.end_date);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="annot">Project no. {catalogue}</span>
            <StatusBadge status={opportunity.status} />
          </div>
          <h2 className="font-serif text-3xl font-medium leading-tight text-foreground">
            {opportunity.title}
          </h2>
          <p className="caps">{opportunity.nonprofit}</p>
        </div>

        <p className="text-[0.95rem] leading-relaxed text-foreground/80">
          {opportunity.description}
        </p>

        {timeline && (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <p className="caps">Timeline</p>
            <p className="font-serif text-sm italic text-foreground">
              {timeline}
            </p>
          </div>
        )}

        {opportunity.nonprofit_link && (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <p className="caps">About the nonprofit</p>
            <a
              href={opportunity.nonprofit_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit break-all font-serif text-sm italic text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
            >
              {opportunity.nonprofit_link}
            </a>
          </div>
        )}

        {skillList.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <p className="caps">Skills needed</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {skillList.map((skill) => (
                <span
                  key={skill}
                  className="font-serif text-sm italic text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <p className="caps">Contact</p>
          <a
            href={`mailto:${opportunity.contact_email}`}
            className="w-fit font-serif text-sm italic text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
          >
            {opportunity.contact_email}
          </a>
        </div>

        {showJoin && (
          <InterestButton
            opportunityId={opportunity.id}
            disabled={!canJoin}
            disabledReason={joinReason}
          />
        )}
      </div>
    </Modal>
  );
}
