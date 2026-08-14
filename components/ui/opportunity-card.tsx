"use client";

import { InterestButton } from "@/components/ui/interest-button";
import Modal from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Database } from "@/lib/schema";
import { useState } from "react";

type Status = Database["public"]["Enums"]["opportunity_status"];

export interface CardOpportunity {
  id: string;
  title: string;
  nonprofit: string;
  description: string;
  skills: string;
  contact_email: string;
  status: Status;
}

interface OpportunityCardProps {
  index: number;
  opportunity: CardOpportunity;
  canJoin: boolean;
  joinReason?: string;
}

function parseSkills(skills: string): string[] {
  return skills
    .split(/[,/]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function OpportunityCard({
  index,
  opportunity,
  canJoin,
  joinReason,
}: OpportunityCardProps) {
  const [open, setOpen] = useState(false);
  const skillList = parseSkills(opportunity.skills);
  const catalogue = String(index + 1).padStart(2, "0");

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
          </div>
          <span className="annot shrink-0 pt-1">({catalogue})</span>
        </div>

        <p className="line-clamp-2 px-4 text-sm leading-relaxed text-muted-foreground">
          {opportunity.description}
        </p>

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

      <Modal open={open} onClose={() => setOpen(false)}>
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

          <InterestButton
            opportunityId={opportunity.id}
            disabled={!canJoin}
            disabledReason={joinReason}
          />
        </div>
      </Modal>
    </>
  );
}
