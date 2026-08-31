import { STATUS_META, PRIORITY_META } from "@/lib/qwick";
import { cn } from "@/lib/utils";

export function StatusPill({ status, className }) {
  const m = STATUS_META[status] || STATUS_META.new;
  return (
    <span data-testid={`status-pill-${status}`}
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", m.cls, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

export function PriorityBadge({ priority, className }) {
  const m = PRIORITY_META[priority] || PRIORITY_META.warm;
  return (
    <span data-testid={`priority-badge-${priority}`}
      className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold", m.cls, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}
