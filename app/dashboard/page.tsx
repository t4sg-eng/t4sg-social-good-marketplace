import { AddOpportunityModal } from "@/components/ui/add-opportunity-modal";
import { OpportunityCard } from "@/components/ui/opportunity-card";
import type { Database } from "@/lib/schema";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];

export default async function Dashboard() {
  // Create supabase server component client and obtain user session from Supabase Auth
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // this is a protected route - only users who are signed in can view this route

    /*
      Be careful when protecting pages. The server gets the user session from the cookies, which can be spoofed by anyone.
      Always use supabase.auth.getUser() to protect pages and user data.
      Never trust supabase.auth.getSession() inside server code such as middleware. It isn't guaranteed to revalidate the Auth token.
      It's safe to trust getUser() because it sends a request to the Supabase Auth server every time to revalidate the Auth token.
    */

    redirect("/");
  }

  // Fetch all opportunity listings from the database, ordered newest first
  const { data: opportunities, error } = await supabase
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Opportunity[]>();

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-destructive">Queue unavailable</p>
        <p className="mt-2 text-muted-foreground">
          The project queue couldn&apos;t load right now. Refresh the page to try again.
        </p>
      </div>
    );
  }

  const count = opportunities?.length ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">The open queue</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="mt-2 text-muted-foreground">
            Every open project a nonprofit has posted. Read one, then take it on.
          </p>
        </div>
        <AddOpportunityModal />
      </div>

      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground">
          {count} {count === 1 ? "project" : "projects"} open
        </span>
        <span className="ledger-rule flex-1" />
      </div>

      {count > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opportunity, i) => (
            <OpportunityCard
              key={opportunity.id}
              index={i}
              title={opportunity.title}
              nonprofit={opportunity.nonprofit}
              description={opportunity.description}
              skills={opportunity.skills}
              contact_email={opportunity.contact_email}
              t4sg_verified={opportunity.t4sg_verified}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card px-6 py-20 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">queue is empty</p>
          <p className="max-w-sm text-muted-foreground">
            No projects are open yet. If you work with a nonprofit that needs engineering help, post the first one.
          </p>
          <AddOpportunityModal />
        </div>
      )}
    </div>
  );
}
