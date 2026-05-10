"use client";

import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { useState } from "react";

interface OpportunityCardProps {
  title: string;
  nonprofit: string;
  description: string;
  skills: string;
}

export function OpportunityCard({
  title,
  nonprofit,
  description,
  skills,
}: OpportunityCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="flex cursor-pointer flex-col gap-4 rounded-lg border border-t-8 border-slate-200 border-t-emerald-500 bg-white p-5 transition-colors hover:border-slate-400"
      >
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest text-slate-400">
            {nonprofit}
          </p>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        </div>
        <p className="text-sm leading-relaxed text-slate-500">{description}</p>
        <div className="flex items-center justify-between">
          <span className="border-l-2 border-slate-900 pl-2 text-xs text-slate-500">
            {skills}
          </span>
          <span className="text-xs font-medium text-slate-900 underline">
            Take on →
          </span>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        {/* Everything between <Modal ...> and </Modal> is bundled up and passed in as the children prop */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-emerald-600">
              {nonprofit}
            </p>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            {description}
          </p>
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-slate-400">
              Skills needed
            </p>
            <span className="border-l-2 border-emerald-500 pl-2 text-sm text-slate-700">
              {skills}
            </span>
          </div>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
            I&apos;m interested
          </Button>
        </div>
      </Modal>
    </>
  );
}
