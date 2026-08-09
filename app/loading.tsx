export default function Loading() {
  return (
    <div className="flex items-center gap-3 py-20">
      <span className="h-2.5 w-2.5 animate-ping rounded-full bg-primary" />
      <span className="font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground">Loading the queue…</span>
    </div>
  );
}
