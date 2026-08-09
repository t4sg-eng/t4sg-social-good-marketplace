import { createServerSupabaseClient } from "@/lib/server-utils";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default async function Navbar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  // Create supabase server component client and obtain user session from Supabase Auth
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className={cn("flex items-center gap-6", className)} {...props}>
      <Link href="/" aria-label="Tech for Social Good — home" className="shrink-0 transition-opacity hover:opacity-70">
        <Image
          src="/t4sglogo.webp"
          alt="Harvard Computer Society — Tech for Social Good"
          width={168}
          height={40}
          priority
          className="h-8 w-auto dark:invert"
        />
      </Link>

      <div className="hidden items-center gap-1 sm:flex">
        <Link
          href="/"
          className="rounded-md px-2.5 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
        >
          Home
        </Link>
        {user && (
          <Link
            href="/dashboard"
            className="rounded-md px-2.5 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Projects
          </Link>
        )}
      </div>
    </nav>
  );
}
