import { OpportunityCard } from "@/components/ui/opportunity-card";
import { TypographyH2, TypographyP } from "@/components/ui/typography";
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
    console.error("Error fetching opportunities:", error.message);
    return (
      <TypographyP>
        Failed to load opportunities. Please try again later.
      </TypographyP>
    );
  }

  return (
    <>
      <TypographyH2>Dashboard</TypographyH2>
      <TypographyP>
        Browse open nonprofit project opportunities below.
      </TypographyP>

      {opportunities && opportunities.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 p-6">
          {opportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              title={opportunity.title}
              nonprofit={opportunity.nonprofit}
              description={opportunity.description}
              skills={opportunity.skills}
            />
          ))}
        </div>
      ) : (
        <TypographyP>No opportunities found.</TypographyP>
      )}
    </>
  );
}
