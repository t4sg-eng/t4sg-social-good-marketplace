"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AppRole = Database["public"]["Enums"]["app_role"];

const ROLE_LABEL: Record<AppRole, string> = {
  member: "Member",
  swe: "Contributor (SWE)",
  npo: "Organizer (Nonprofit)",
  admin: "Admin",
};

const CHOICES: { value: AppRole; label: string; blurb: string }[] = [
  {
    value: "swe",
    label: "Contributor",
    blurb: "Express interest in projects and get introduced to nonprofits.",
  },
  {
    value: "npo",
    label: "Organizer",
    blurb: "Post projects on behalf of a nonprofit and manage your listings.",
  },
];

export default function RoleRequestForm({
  email,
  role,
  requestedRole,
  roleApproved,
}: {
  email: string | null;
  role: AppRole;
  requestedRole: AppRole | null;
  roleApproved: boolean;
}) {
  const router = useRouter();
  const [choice, setChoice] = useState<AppRole>(
    requestedRole && requestedRole !== "member" ? requestedRole : "swe",
  );
  const [submitting, setSubmitting] = useState(false);

  const pending =
    !!requestedRole && requestedRole !== role && !roleApproved;

  async function submit() {
    setSubmitting(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("profiles")
      .update({ requested_role: choice })
      .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "");
    setSubmitting(false);

    if (error) {
      toast({
        title: "Couldn't submit request",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Request submitted",
      description: `An admin will review your request to become a ${ROLE_LABEL[choice]}.`,
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Current standing */}
      <div className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border">
        <div className="bg-card p-4">
          <p className="caps">Signed in as</p>
          <p className="mt-1 font-serif text-base text-foreground">
            {email ?? "—"}
          </p>
        </div>
        <div className="bg-card p-4">
          <p className="caps">Current role</p>
          <p className="mt-1 font-serif text-base text-foreground">
            {ROLE_LABEL[role]}
          </p>
        </div>
      </div>

      {pending && (
        <p className="border-l-2 border-warning bg-warning-soft/50 px-3 py-2 text-sm text-foreground">
          Your request to become{" "}
          <strong>{requestedRole && ROLE_LABEL[requestedRole]}</strong> is
          awaiting admin approval.
        </p>
      )}

      {role === "admin" ? (
        <p className="annot">
          You&apos;re an admin — you can approve others and manage every project.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="caps">Request access</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CHOICES.map((c) => {
              const active = choice === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setChoice(c.value)}
                  className={`flex flex-col gap-1.5 border p-4 text-left transition-colors ${
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-foreground/30"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span className="font-serif text-lg font-medium text-foreground">
                      {c.label}
                    </span>
                    <span
                      className={`h-3 w-3 rounded-full border ${
                        active ? "border-primary bg-primary" : "border-border"
                      }`}
                    />
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {c.blurb}
                  </span>
                </button>
              );
            })}
          </div>
          <div>
            <Button onClick={() => void submit()} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit request"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
