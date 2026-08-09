import { cn } from "@workspace/ui/lib/utils";

const STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  HANDED_OVER: "bg-sky-100 text-sky-800",
  COMPLETED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-100 text-red-700",
  AVAILABLE: "bg-emerald-100 text-emerald-800",
  RENTED: "bg-orange-100 text-orange-800",
  MAINTENANCE: "bg-amber-100 text-amber-800",
  INACTIVE: "bg-slate-100 text-slate-600",
};

export function StatusPill({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        STYLES[status] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
