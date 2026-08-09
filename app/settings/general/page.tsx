export default function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg font-semibold text-foreground">General</h3>
        <p className="text-sm text-muted-foreground">Account-wide settings live here.</p>
      </div>
      <div className="rounded-lg border border-dashed border-border bg-card px-5 py-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Nothing to configure yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          General settings will show up here as the marketplace grows.
        </p>
      </div>
    </div>
  );
}
