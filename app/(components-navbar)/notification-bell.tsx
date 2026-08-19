"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

const POLL_MS = 30_000;
const LIMIT = 20;

/** "just now", "4m ago", "3h ago", "2d ago" — enough for a dropdown. */
function age(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86_400)}d ago`;
}

export function NotificationBell({ initial }: { initial: Notification[] }) {
  const [items, setItems] = useState<Notification[]>(initial);

  // RLS restricts this to the signed-in user's own rows, so no filter needed.
  const refresh = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(LIMIT)
      .returns<Notification[]>();
    if (data) setItems(data);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => void refresh(), POLL_MS);
    // Catch up on focus too, so returning to a long-idle tab doesn't wait out
    // the full interval.
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  const unreadIds = items.filter((n) => !n.read).map((n) => n.id);

  async function markRead(ids: string[]) {
    if (ids.length === 0) return;
    // Optimistic: the badge should clear on click, not a round trip later.
    setItems((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)),
    );
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", ids);
    if (error) void refresh(); // put the badge back if the write didn't land
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          // Sized to match the theme toggle beside it, so the two hover
          // squares are identical. px-0 is load-bearing: Button's default size
          // adds px-4, which would leave a 4px content box and squash the icon
          // flat. Shape comes from buttonVariants' base rounded-md.
          className="relative h-8 w-8 px-0"
          aria-label={
            unreadIds.length > 0
              ? `Notifications (${unreadIds.length} unread)`
              : "Notifications"
          }
        >
          {/* 24px to match Icons.sun/moon in the theme toggle, which take
              lucide's default size. */}
          <Bell className="h-6 w-6" />
          {unreadIds.length > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 font-sans text-[0.6rem] font-semibold leading-none text-background">
              {unreadIds.length > 9 ? "9+" : unreadIds.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[340px] p-0" align="end" forceMount>
        <div className="flex items-baseline justify-between border-b border-border px-4 py-3">
          <span className="caps">Notifications</span>
          {unreadIds.length > 0 && (
            <button
              onClick={() => void markRead(unreadIds)}
              className="font-serif text-xs italic text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
            >
              Mark all read
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <p className="annot px-4 py-8 text-center">Nothing yet.</p>
        ) : (
          <ul className="max-h-[380px] divide-y divide-border overflow-y-auto">
            {items.map((n) => {
              const body = (
                <div className="flex gap-3 px-4 py-3">
                  <span
                    className={
                      n.read
                        ? "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-transparent"
                        : "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    }
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p
                      className={
                        n.read
                          ? "font-serif text-sm text-muted-foreground"
                          : "font-serif text-sm text-foreground"
                      }
                    >
                      {n.message}
                    </p>
                    <p className="caps mt-1">{age(n.created_at)}</p>
                  </div>
                </div>
              );

              return (
                <li key={n.id} className="transition-colors hover:bg-accent">
                  {n.link ? (
                    <Link
                      href={n.link}
                      onClick={() => void markRead([n.id])}
                      className="block"
                    >
                      {body}
                    </Link>
                  ) : (
                    <button
                      onClick={() => void markRead([n.id])}
                      className="block w-full text-left"
                    >
                      {body}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
