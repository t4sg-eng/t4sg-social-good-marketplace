import { TypographyH2, TypographyP } from "@/components/ui/typography";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { OpportunityCard } from "@/components/ui/opportunity-card";


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

  const userEmail = user.email;

  return (
    <>
      <TypographyH2>Dashboard</TypographyH2>
      <TypographyP>This is a protected route accessible only to signed-in users.</TypographyP>
      {userEmail && <TypographyP>{`Your email is ${userEmail}`}</TypographyP>}
      <div></div>



      <div className="grid grid-cols-3 gap-4 p-6">
        <OpportunityCard
      title="Build a donor portal"
      nonprofit="Green Future"
      description="Help us create a web portal for tracking donations."
      skills="React, TypeScript"/>
      <OpportunityCard
      title="Build a donor portal"
      nonprofit="Green Future"
      description="Help us create a web portal for tracking donations."
      skills="React, TypeScript"/>
      <OpportunityCard
      title="Build a donor portal"
      nonprofit="Green Future"
      description="Help us create a web portal for tracking donations."
      skills="React, TypeScript"/>
      </div>
    </>
  );
}
