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

  return (
    <nav
      className={cn("flex w-full items-center justify-between", className)}
      {...props}
    >
      <Link href="/" className="transition-opacity hover:opacity-75">
        <Image
          src="/t4sglogo.webp"
          alt="T4SG Home"
          width={300}
          height={300}
          priority
        />
      </Link>

      <div className="flex items-center space-x-4 lg:space-x-6">
        <Link
          href="/"
          className="text-xl font-medium transition-colors hover:text-primary"
        >
          Home
        </Link>

        {user && (
          <Link
            href="/dashboard"
            className="text-xl font-medium transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
        )}
      </div>
    </nav>
  );
}
