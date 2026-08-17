import { emailShell, sendEmail } from "@/lib/email";
import type { Database } from "@/lib/schema";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { NextResponse } from "next/server";

type Signup = Database["public"]["Tables"]["signups"]["Row"];
type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];

const TEAM_EMAIL = process.env.EMAIL_TEAM ?? "engineering@t4sg.dev";

export async function PATCH(request: Request, { params }: { params: { signupId: string } }) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let decision: unknown;
  try {
    ({ decision } = (await request.json()) as { decision?: unknown });
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  if (decision !== "accept" && decision !== "reject") {
    return NextResponse.json({ error: "Invalid decision." }, { status: 400 });
  }

  const { data: signup, error: signupError } = await supabase
    .from("signups")
    .select("*")
    .eq("id", params.signupId)
    .maybeSingle<Signup>();

  if (signupError) {
    return NextResponse.json({ error: "Couldn't load the signup." }, { status: 500 });
  }

  if (!signup) {
    return NextResponse.json({ error: "Signup not found." }, { status: 404 });
  }

  const { data: opportunity, error: opportunityError } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", signup.opportunity_id)
    .maybeSingle<Opportunity>();

  if (opportunityError) {
    return NextResponse.json({ error: "Couldn't load the opportunity." }, { status: 500 });
  }

  if (!opportunity) {
    return NextResponse.json({ error: "Opportunity not found." }, { status: 404 });
  }

  // Never trust the browser to say which NPO owns a signup.
  if (opportunity.created_by !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (signup.status !== "interested") {
    return NextResponse.json({ error: "This signup has already been decided." }, { status: 409 });
  }

  const { data: volunteer, error: volunteerError } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", signup.volunteer_id)
    .maybeSingle();

  if (volunteerError) {
    return NextResponse.json({ error: "Couldn't load the volunteer." }, { status: 500 });
  }

  if (!volunteer?.email) {
    return NextResponse.json({ error: "Volunteer email not found." }, { status: 400 });
  }

  const status = decision === "accept" ? "onboarded" : "declined";
  const { data: updated, error: updateError } = await supabase
    .from("signups")
    .update({
      status,
      decided_at: new Date().toISOString(),
    })
    .eq("id", signup.id)
    .eq("status", "interested")
    .select("id")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: "Couldn't save the decision." }, { status: 500 });
  }

  if (!updated) {
    return NextResponse.json({ error: "This signup was already decided." }, { status: 409 });
  }

  const accepted = decision === "accept";
  const emailResult = await sendEmail({
    to: TEAM_EMAIL,
    cc: [volunteer.email, opportunity.contact_email],
    subject: accepted ? `Accepted to Project: ${opportunity.title}` : `Update on Project: ${opportunity.title}`,
    replyTo: opportunity.contact_email,
    html: emailShell(
      accepted ? "You have been accepted" : "Application update",
      accepted
        ? `<p>The volunteer has been accepted into <strong>${opportunity.title}</strong>.</p>
           <p>The SWE and nonprofit are CC'd so they can coordinate next steps.</p>`
        : `<p>The nonprofit has decided not to proceed with the volunteer's interest in <strong>${opportunity.title}</strong>.</p>
           <p>Questions can be directed to ${opportunity.contact_email}.</p>`,
    ),
  });

  return NextResponse.json({
    ok: true,
    status,
    emailSent: emailResult.ok,
    simulated: emailResult.ok && emailResult.simulated,
  });
}
