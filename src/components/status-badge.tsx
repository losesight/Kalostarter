import { clsx } from "clsx";

type Status = "draft" | "ready" | "published" | "error" | "running" | "completed" | "failed" | "queued";

const statusConfig: Record<Status, { label: string; classes: string; dot: string }> = {
  draft: {
    label: "Draft",
    classes: "bg-text-muted/10 text-text-muted border-text-muted/20",
    dot: "bg-text-muted",
  },
  ready: {
    label: "Ready",
    classes: "bg-info/10 text-info border-info/20",
    dot: "bg-info",
  },
  published: {
    label: "Published",
    classes: "bg-success/10 text-success border-success/20",
    dot: "bg-success shadow-[0_0_6px_rgba(34,197,94,0.5)]",
  },
  error: {
    label: "Error",
    classes: "bg-error/10 text-error border-error/20",
    dot: "bg-error shadow-[0_0_6px_rgba(239,68,68,0.5)]",
  },
  running: {
    label: "Running",
    classes: "bg-accent-primary/10 text-accent-primary border-accent-primary/20",
    dot: "bg-accent-primary animate-pulse shadow-[0_0_6px_rgba(217,70,239,0.5)]",
  },
  completed: {
    label: "Completed",
    classes: "bg-success/10 text-success border-success/20",
    dot: "bg-success",
  },
  failed: {
    label: "Failed",
    classes: "bg-error/10 text-error border-error/20",
    dot: "bg-error",
  },
  queued: {
    label: "Queued",
    classes: "bg-warning/10 text-warning border-warning/20",
    dot: "bg-warning",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        config.classes
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
