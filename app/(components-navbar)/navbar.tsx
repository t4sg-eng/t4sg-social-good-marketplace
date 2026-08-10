import { createServerSupabaseClient } from "@/lib/server-utils";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default async function Navbar({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  // Create supabase server component client and obtain user session from Supabase Auth
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const linkClass =
    "font-serif text-[0.95rem] text-muted-foreground transition-colors hover:text-primary";

  return (
    <nav className={cn("flex items-center gap-7", className)} {...props}>
      <Link
        href="/"
        aria-label="Tech for Social Good — home"
        className="shrink-0 transition-opacity hover:opacity-70"
      >
        <Image
          src="/t4sglogo.webp"
          alt="Harvard Computer Society — Tech for Social Good"
          width={160}
          height={38}
          priority
          className="h-[30px] w-auto dark:invert"
        />
      </Link>

      <div className="hidden items-center gap-6 sm:flex">
        <Link href="/" className={linkClass}>
          index
        </Link>
        {user && (
          <Link href="/dashboard" className={linkClass}>
            projects
          </Link>
        )}
        <Link href="/lab" className={linkClass}>
          lab
        </Link>
      </div>
    </nav>
  );
}
