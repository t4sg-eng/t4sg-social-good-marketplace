import { emailShell, sendEmail } from "@/lib/email";
import type { Database } from "@/lib/schema";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { NextResponse } from "next/server";

type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let opportunityId: unknown;
  try {
    ({ opportunityId } = (await request.json()) as { opportunityId?: unknown });
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  if (typeof opportunityId !== "string") {
    return NextResponse.json(
      { error: "Missing opportunity." },
      { status: 400 },
    );
  }

  const { data: opportunity, error: oppErr } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", opportunityId)
    .maybeSingle<Opportunity>();

  if (oppErr != null || !opportunity) {
    return NextResponse.json(
      { error: "That project could not be found." },
      { status: 404 },
    );
  }

  // Record the expression of interest. The unique (opportunity_id, volunteer_id)
  // constraint means a repeat click surfaces as a duplicate — treat that as
  // "already interested" rather than an error, and don't email twice.
  const { error: signupErr } = await supabase.from("signups").insert({
    opportunity_id: opportunity.id,
    volunteer_id: user.id,
    status: "interested",
  });

  if (signupErr) {
    const duplicate = signupErr.code === "23505";
    if (duplicate) {
      return NextResponse.json({ ok: true, alreadyInterested: true });
    }
    return NextResponse.json(
      {
        error:
          "Couldn't record your interest. You may need approved contributor access to sign up.",
      },
      { status: 403 },
    );
  }

  const studentEmail = user.email ?? undefined;
  const studentName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.user_name as string | undefined) ??
    studentEmail ??
    "A student engineer";

  // Notify the nonprofit / project creator.
  const creatorResult = await sendEmail({
    to: opportunity.contact_email,
    subject: `New interest in "${opportunity.title}"`,
    replyTo: studentEmail,
    html: emailShell(
      `${studentName} is interested in your project`,
      `<p><strong>${studentName}</strong> just expressed interest in <strong>${opportunity.title}</strong> for ${opportunity.nonprofit}.</p>
       <p>Reply to this email to reach them and take the conversation forward.</p>
       <p style="color:#6f685a">Skills listed: ${opportunity.skills}</p>`,
    ),
  });

  // Confirm to the student.
  if (studentEmail) {
    await sendEmail({
      to: studentEmail,
      subject: `You're interested in "${opportunity.title}"`,
      replyTo: opportunity.contact_email,
      html: emailShell(
        `Interest sent to ${opportunity.nonprofit}`,
        `<p>We let <strong>${opportunity.nonprofit}</strong> know you'd like to help with <strong>${opportunity.title}</strong>.</p>
         <p>They'll reach out at this address. You can reply directly to them at ${opportunity.contact_email}.</p>`,
      ),
    });
  }

  // Best-effort stamp so the intro is never sent twice by a later batch job.
  await supabase
    .from("signups")
    .update({ intro_email_sent_at: new Date().toISOString() })
    .eq("opportunity_id", opportunity.id)
    .eq("volunteer_id", user.id);

  const simulated = "simulated" in creatorResult && creatorResult.simulated;
  return NextResponse.json({ ok: true, simulated });
}
