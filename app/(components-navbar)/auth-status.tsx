import { createServerSupabaseClient } from "@/lib/server-utils";
import { getUserProfile } from "@/lib/utils";
import LoginButton from "./login-button";
import UserNav from "./user-nav";

export default async function AuthStatus() {
  // Create supabase server component client and obtain user session from Supabase Auth
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LoginButton />;
  }

  const { profile, error } = await getUserProfile(supabase, user);

  if (error) {
    const fallbackUsername = ((user.user_metadata?.user_name as string | undefined) ?? user.email?.split("@")[0] ?? "User")
      .trim() || "User";

    return (
      <UserNav
        profile={{
          id: user.id,
          username: fallbackUsername,
          avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
        }}
      />
    );
  }

  return <UserNav profile={profile} />;
}
