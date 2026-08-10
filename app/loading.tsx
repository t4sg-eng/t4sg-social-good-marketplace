export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center gap-3">
      <span className="h-2.5 w-2.5 animate-ping rounded-full bg-primary" />
      <span className="font-serif text-2xl italic text-muted-foreground">
        Loading the collection…
      </span>
    </div>
  );
}
