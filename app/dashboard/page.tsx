import { AddOpportunityModal } from "@/components/ui/add-opportunity-modal";
import { OpportunityCard } from "@/components/ui/opportunity-card";
import { ProjectListRow } from "@/components/ui/project-list-row";
import {
  AdminReviewActions,
  DeleteProjectButton,
} from "@/components/ui/project-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { getViewer } from "@/lib/roles";
import type { Database } from "@/lib/schema";
import { createServerSupabaseClient } from "@/lib/server-utils";
import Link from "next/link";
import { redirect } from "next/navigation";

type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];

function SectionHeading({
  eyebrow,
  title,
  annotation,
}: {
  eyebrow: string;
  title: string;
  annotation?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-foreground/80 pb-3">
      <div className="flex items-baseline gap-3">
        <span className="caps">{eyebrow}</span>
        <h2 className="font-serif text-xl font-medium text-foreground">
          {title}
        </h2>
      </div>
      {annotation && <span className="annot">{annotation}</span>}
    </div>
  );
}

export default async function Dashboard() {
  const supabase = createServerSupabaseClient();
  const viewer = await getViewer();

  if (!viewer) {
    // Protected route — server-verified session. See note in the home page.
    redirect("/");
  }

  const [approvedRes, mineRes, pendingRes] = await Promise.all([
    supabase
      .from("opportunities")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .returns<Opportunity[]>(),
    supabase
      .from("opportunities")
      .select("*")
      .eq("created_by", viewer.user.id)
      .order("created_at", { ascending: false })
      .returns<Opportunity[]>(),
    viewer.isAdmin
      ? supabase
          .from("opportunities")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: true })
          .returns<Opportunity[]>()
      : Promise.resolve({ data: [] as Opportunity[], error: null }),
  ]);

  const approved = approvedRes.data ?? [];
  const mine = mineRes.data ?? [];
  const pending = pendingRes.data ?? [];

  // NPOs and admins never see the CTA at all, so the only reason left to
  // explain is a viewer who may look but not yet join.
  const joinReason = viewer.canJoin
    ? undefined
    : "Request contributor access in your profile to sign up.";

  return (
    <div className="flex flex-col gap-16">
      {/* Masthead */}
      <header className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="caps">The collection</p>
            <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
              Projects seeking{" "}
              <span className="font-script text-[1.15em] text-primary">
                engineers
              </span>
            </h1>
            <p className="annot mt-3 max-w-md">
              A curated queue of real nonprofit work. Read one, then take it on.
            </p>
          </div>

          {viewer.canPost ? (
            <AddOpportunityModal />
          ) : (
            <Link
              href="/settings/profile"
              className="font-serif text-sm italic text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
            >
              Want to post? Request organizer access →
            </Link>
          )}
        </div>
      </header>

      {/* Admin review queue */}
      {viewer.isAdmin && (
        <section className="flex flex-col gap-5">
          <SectionHeading
            eyebrow="Admin"
            title="Review queue"
            annotation={`(${pending.length} awaiting)`}
          />
          {pending.length > 0 ? (
            <ul className="flex flex-col divide-y divide-border border border-border bg-card">
              {pending.map((p, i) => (
                <ProjectListRow
                  key={p.id}
                  index={i}
                  opportunity={p}
                  subtitle={`${p.nonprofit} · ${p.skills}`}
                  className="gap-3"
                  actions={
                    <AdminReviewActions opportunityId={p.id} title={p.title} />
                  }
                />
              ))}
            </ul>
          ) : (
            <p className="annot">Nothing waiting. The queue is clear.</p>
          )}
        </section>
      )}

      {/* Your projects */}
      {mine.length > 0 && (
        <section className="flex flex-col gap-5">
          <SectionHeading
            eyebrow="Yours"
            title="Projects you posted"
            annotation={`(${mine.length})`}
          />
          <ul className="flex flex-col divide-y divide-border border border-border bg-card">
            {mine.map((p, i) => (
              <ProjectListRow
                key={p.id}
                index={i}
                opportunity={p}
                actions={
                  <>
                    <StatusBadge status={p.status} />
                    <DeleteProjectButton opportunityId={p.id} title={p.title} />
                  </>
                }
              />
            ))}
          </ul>
        </section>
      )}

      {/* The gallery — approved projects */}
      <section className="flex flex-col gap-6">
        <SectionHeading
          eyebrow="Browse"
          title="Open projects"
          annotation={`(${approved.length})`}
        />

        {approvedRes.error ? (
          <p className="annot">
            The collection couldn&apos;t load right now. Refresh to try again.
          </p>
        ) : approved.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {approved.map((opportunity, i) => (
              <OpportunityCard
                key={opportunity.id}
                index={i}
                opportunity={opportunity}
                // Nobody is invited to sign up for their own posting. The
                // roles that can post are already excluded above, so this only
                // catches a viewer whose role changed after they posted.
                showJoin={
                  viewer.showJoinCta &&
                  opportunity.created_by !== viewer.user.id
                }
                canJoin={viewer.canJoin}
                joinReason={joinReason}
              />
            ))}
          </div>
        ) : (
          <div className="dot-field border border-dashed border-border bg-card px-6 py-20 text-center">
            <p className="font-serif text-xl italic text-foreground">
              The gallery is empty for now.
            </p>
            <p className="annot mt-2">
              Approved projects will appear here as nonprofits post them.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
