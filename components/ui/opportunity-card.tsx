"use client";

import type { CardOpportunity } from "@/components/ui/opportunity-detail-modal";
import {
  OpportunityDetailModal,
  formatTimeline,
  parseSkills,
} from "@/components/ui/opportunity-detail-modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { useState } from "react";

export type { CardOpportunity };

interface OpportunityCardProps {
  index: number;
  opportunity: CardOpportunity;
  /** Whether the interest CTA belongs on screen at all — see the modal. */
  showJoin: boolean;
  canJoin?: boolean;
  joinReason?: string;
}

export function OpportunityCard({
  index,
  opportunity,
  showJoin,
  canJoin = false,
  joinReason,
}: OpportunityCardProps) {
  const [open, setOpen] = useState(false);
  const skillList = parseSkills(opportunity.skills);
  const catalogue = String(index + 1).padStart(2, "0");
  const timeline = formatTimeline(opportunity.start_date, opportunity.end_date);

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
        className="tile group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {/* Catalogue plate — typographic "cover" in lieu of artwork */}
        <div className="t4sg-gradient relative flex aspect-[5/3] items-center justify-center overflow-hidden border-b border-border">
          <div className="dot-field absolute inset-0 opacity-60" />
          <span className="relative font-serif text-6xl font-medium text-foreground/85">
            {catalogue}
          </span>
          <span className="absolute left-3 top-3">
            <StatusBadge status={opportunity.status} />
          </span>
        </div>

        {/* Caption row, HOVN-style */}
        <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-4">
          <div className="min-w-0">
            <h3 className="font-serif text-lg font-medium leading-snug text-foreground">
              {opportunity.title}
            </h3>
            <p className="caps mt-1">{opportunity.nonprofit}</p>
            {opportunity.nonprofit_link && (
              <a
                href={opportunity.nonprofit_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-1 inline-block font-serif text-sm italic text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
              >
                Learn more →
              </a>
            )}
          </div>
          <span className="annot shrink-0 pt-1">({catalogue})</span>
        </div>

        <p className="line-clamp-2 px-4 text-sm leading-relaxed text-muted-foreground">
          {opportunity.description}
        </p>

        {timeline && <p className="annot mt-2 px-4">{timeline}</p>}

        <div className="flex flex-wrap gap-x-3 gap-y-1 px-4 pb-4 pt-3">
          {skillList.slice(0, 4).map((skill) => (
            <span key={skill} className="caps">
              {skill}
            </span>
          ))}
          {skillList.length > 4 && (
            <span className="caps">+{skillList.length - 4}</span>
          )}
        </div>
      </article>

      <OpportunityDetailModal
        open={open}
        onClose={() => setOpen(false)}
        index={index}
        opportunity={opportunity}
        showJoin={showJoin}
        canJoin={canJoin}
        joinReason={joinReason}
      />
    </>
  );
}
