import "server-only";

import { createServerSupabaseClient } from "@/lib/server-utils";
import type { Database } from "@/lib/schema";
import type { User } from "@supabase/supabase-js";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface Viewer {
  user: User;
  profile: Profile | null;
  role: AppRole;
  isAdmin: boolean;
  canPost: boolean; // may create opportunities
  canJoin: boolean; // may express interest in opportunities
  showJoinCta: boolean; // the interest CTA is rendered at all
}

/**
 * Resolve the current signed-in user together with their effective role.
 *
 * Role is read from the `profiles` row. If the profile can't be read (e.g. a
 * select policy isn't applied yet), we fall back to `member` rather than
 * locking the whole dashboard — the database's RLS is still the real gate on
 * every write, so a generous default here is safe.
 */
export async function getViewer(): Promise<Viewer | null> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = (data as Profile | null) ?? null;
  const role: AppRole = profile?.role ?? "member";
  const approved = profile?.role_approved ?? true;

  return {
    user,
    profile,
    role,
    isAdmin: role === "admin",
    canPost: role === "admin" || (role === "npo" && approved),
    // Approved SWEs only — admins deliberately excluded. The real gate is the
    // `approved_swe_express_interest` policy on `signups`, which admits
    // `role = 'swe'` alone, so an admin granted the button here would only
    // earn themselves a 403.
    canJoin: role === "swe" && approved,
    // Hidden outright for the roles that never sign up: NPOs post projects and
    // admins review them. A `member` still sees it disabled — for them it's a
    // working prompt to request contributor access, not dead UI.
    showJoinCta: role !== "npo" && role !== "admin",
  };
}
