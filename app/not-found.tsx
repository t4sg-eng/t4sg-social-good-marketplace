import { Button } from "@/components/ui/button";
import Link from "next/link";

// https://nextjs.org/docs/app/api-reference/file-conventions/not-found

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-5 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Error 404</p>
      <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
        This page isn&apos;t in the queue.
      </h1>
      <p className="max-w-md text-muted-foreground">
        The page you&apos;re after doesn&apos;t exist or has moved. Head back to the open projects.
      </p>
      <Button asChild className="mt-1">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
