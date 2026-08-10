import { Button } from "@/components/ui/button";
import Link from "next/link";

// https://nextjs.org/docs/app/api-reference/file-conventions/not-found

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-5 py-20">
      <p className="caps text-primary">Error 404</p>
      <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground">
        This page isn&apos;t in the collection.
      </h1>
      <p className="annot max-w-md">
        The page you&apos;re after doesn&apos;t exist or has moved. Head back to
        the open projects.
      </p>
      <Button asChild className="mt-1">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
