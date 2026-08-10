"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Admin-only: approve or reject a pending project. */
export function AdminReviewActions({
  opportunityId,
  title,
}: {
  opportunityId: string;
  title: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

  async function setStatus(status: "approved" | "rejected") {
    setBusy(status === "approved" ? "approve" : "reject");
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("opportunities")
      .update({ status })
      .eq("id", opportunityId);
    setBusy(null);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: status === "approved" ? "Project approved" : "Project rejected",
      description: `"${title}" is now ${status}.`,
    });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={() => void setStatus("approved")}
        disabled={busy !== null}
      >
        {busy === "approve" ? "…" : "Approve"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => void setStatus("rejected")}
        disabled={busy !== null}
      >
        {busy === "reject" ? "…" : "Reject"}
      </Button>
    </div>
  );
}

/** Owner-only: delete a project you created. */
export function DeleteProjectButton({
  opportunityId,
  title,
}: {
  opportunityId: string;
  title: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function remove() {
    setBusy(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("opportunities")
      .delete()
      .eq("id", opportunityId);
    setBusy(false);

    if (error) {
      toast({
        title: "Couldn't delete",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Project deleted", description: `"${title}" was removed.` });
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs font-medium text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-danger hover:decoration-danger"
      >
        Delete
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">Sure?</span>
      <button
        onClick={() => void remove()}
        disabled={busy}
        className="font-medium text-danger underline underline-offset-4 disabled:opacity-50"
      >
        {busy ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="text-muted-foreground underline underline-offset-4"
      >
        Cancel
      </button>
    </span>
  );
}
