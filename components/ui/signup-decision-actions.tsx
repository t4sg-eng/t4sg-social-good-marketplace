"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Decision = "accept" | "reject";

export function SignupDecisionActions({ signupId }: { signupId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Decision | null>(null);

  async function decide(decision: Decision) {
    setBusy(decision);

    try {
      const response = await fetch(`/api/signups/${signupId}/decision`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        emailSent?: boolean;
        simulated?: boolean;
      };

      if (!response.ok || !result.ok) {
        toast({
          title: "Decision failed",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: decision === "accept" ? "SWE accepted" : "SWE declined",
        description: result.simulated
          ? "Decision saved. Email delivery is simulated until a mail key is configured."
          : result.emailSent
            ? "Decision saved and both parties were emailed."
            : "Decision saved, but the email could not be delivered.",
        variant: result.emailSent ? "default" : "destructive",
      });
      router.refresh();
    } catch {
      toast({
        title: "Network error",
        description: "Couldn't reach the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={() => void decide("accept")} disabled={busy !== null}>
        {busy === "accept" ? "Accepting…" : "Accept"}
      </Button>
      <Button size="sm" variant="outline" onClick={() => void decide("reject")} disabled={busy !== null}>
        {busy === "reject" ? "Rejecting…" : "Reject"}
      </Button>
    </div>
  );
}
