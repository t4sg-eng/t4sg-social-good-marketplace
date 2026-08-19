import type { Database } from "@/lib/schema";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { NotificationBell } from "./notification-bell";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

/**
 * Renders the bell for signed-in users only, seeded with a server-side read so
 * the badge is correct on first paint rather than one poll later.
 */
export default async function NotificationsNav() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<Notification[]>();

  return <NotificationBell initial={data ?? []} />;
}
