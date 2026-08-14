import { getViewer } from "@/lib/roles";
import LoginButton from "./login-button";
import UserNav from "./user-nav";

export default async function AuthStatus() {
  const viewer = await getViewer();

  if (!viewer) {
    return <LoginButton />;
  }

  const meta = viewer.user.user_metadata ?? {};
  const displayName =
    ((meta.full_name as string | undefined) ??
      (meta.user_name as string | undefined) ??
      viewer.user.email?.split("@")[0] ??
      "You").trim() || "You";

  return (
    <UserNav
      displayName={displayName}
      email={viewer.user.email ?? null}
      avatarUrl={(meta.avatar_url as string | undefined) ?? null}
      role={viewer.role}
    />
  );
}
