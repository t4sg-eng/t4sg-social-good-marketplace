"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

export function InterestButton({
  opportunityId,
  disabled,
  disabledReason,
}: {
  opportunityId: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function express() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        simulated?: boolean;
        alreadyInterested?: boolean;
      };

      if (!res.ok || !data.ok) {
        toast({
          title: "Couldn't send your interest",
          description: data.error ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }

      setDone(true);
      toast({
        title: data.alreadyInterested
          ? "You're already on this one"
          : "Interest sent",
        description: data.alreadyInterested
          ? "The nonprofit already has your interest for this project."
          : data.simulated
            ? "Recorded. Email delivery is simulated until a mail key is configured."
            : "The nonprofit has been emailed and will reach out to you.",
      });
    } catch {
      toast({
        title: "Network error",
        description: "Couldn't reach the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (disabled) {
    return (
      <div className="flex flex-col gap-1.5">
        <Button className="w-full" disabled>
          Express interest
        </Button>
        {disabledReason && (
          <p className="text-center text-xs text-muted-foreground">
            {disabledReason}
          </p>
        )}
      </div>
    );
  }

  return (
    <Button
      className="w-full"
      onClick={() => void express()}
      disabled={submitting || done}
    >
      {done ? "Interest sent ✓" : submitting ? "Sending…" : "I'm interested"}
    </Button>
  );
}
