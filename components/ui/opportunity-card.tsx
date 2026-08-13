"use client";

import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { useState } from "react";

interface OpportunityCardProps {
  title: string;
  nonprofit: string;
  description: string;
  skills: string;
  contact_email: string;
  t4sg_verified: boolean;
}

export function OpportunityCard({
  title,
  nonprofit,
  description,
  skills,
  contact_email,
  t4sg_verified,
}: OpportunityCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="flex cursor-pointer flex-col gap-4 overflow-hidden rounded-lg border border-t-8 border-border border-t-emerald-500 bg-card p-5 text-card-foreground transition-colors hover:border-muted-foreground dark:bg-secondary dark:text-secondary-foreground"
      >
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">
            {nonprofit}
          </p>
          <h3 className="line-clamp-2 text-base font-semibold text-foreground">{title}</h3>
        </div>
        <p className="line-clamp-3 break-words text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="flex items-center justify-between">
          <span className="border-l-2 border-foreground pl-2 text-xs text-muted-foreground">
            {skills}
          </span>
          <div className="flex items-center gap-2">
            {t4sg_verified ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                ✓ Verified
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                Under Review
              </span>
            )}
            <span className="text-xs font-medium text-foreground underline">
              Take on →
            </span>
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              {nonprofit}
            </p>
            <h2 className="break-words text-2xl font-bold text-foreground">{title}</h2>
          </div>
          <p className="break-words text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
              Skills needed
            </p>
            <span className="break-words border-l-2 border-emerald-500 pl-2 text-sm text-foreground">
              {skills}
            </span>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
              Contact
            </p>
            <a
              href={`mailto:${contact_email}`}
              className="break-all text-sm text-emerald-600 underline hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              {contact_email}
            </a>
          </div>
          <div className="flex items-center gap-2">
            {t4sg_verified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <span>✓</span> Verified by T4SG
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <span>⏳</span> Under Review by T4SG
              </span>
            )}
          </div>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700">I&apos;m interested</Button>
        </div>
      </Modal>
    </>
  );
}
