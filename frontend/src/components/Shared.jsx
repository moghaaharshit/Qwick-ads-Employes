import * as Icons from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-slate-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon = "Inbox", title, subtitle }) {
  const Icon = Icons[icon] || Icons.Inbox;
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-purple-200 bg-white/50 py-16 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-primary">
        <Icon className="h-7 w-7" />
      </div>
      <p className="font-heading text-lg font-bold text-slate-800">{title}</p>
      {subtitle && <p className="mt-1 max-w-xs text-sm text-slate-400">{subtitle}</p>}
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-3xl bg-white p-5 shadow-soft">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="mt-2 h-4 w-1/2" />
          <Skeleton className="mt-4 h-10 w-full rounded-2xl" />
        </div>
      ))}
    </div>
  );
}
