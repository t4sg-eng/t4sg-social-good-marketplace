import type { Database } from "@/lib/schema";
import { cn } from "@/lib/utils";

type Status = Database["public"]["Enums"]["opportunity_status"];

const MAP: Record<Status, { label: string; className: string }> = {
  approved: {
    label: "Approved",
    className: "bg-success-soft text-success",
  },
  pending: {
    label: "Under review",
    className: "bg-warning-soft text-warning",
  },
  rejected: {
    label: "Rejected",
    className: "bg-danger-soft text-danger",
  },
  closed: {
    label: "Closed",
    className: "bg-muted text-muted-foreground",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const { label, className: tone } = MAP[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 font-sans text-[0.7rem] font-medium uppercase tracking-[0.1em]",
        tone,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
