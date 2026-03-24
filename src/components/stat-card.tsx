import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  accentColor?: "magenta" | "purple" | "indigo" | "green" | "yellow" | "red" | "blue";
}

const accentMap = {
  magenta: {
    bg: "from-accent-primary/15 to-accent-primary/5",
    icon: "text-accent-primary",
    border: "border-accent-primary/20",
    glow: "shadow-[0_0_15px_rgba(217,70,239,0.1)]",
  },
  purple: {
    bg: "from-accent-secondary/15 to-accent-secondary/5",
    icon: "text-accent-secondary",
    border: "border-accent-secondary/20",
    glow: "shadow-[0_0_15px_rgba(168,85,247,0.1)]",
  },
  indigo: {
    bg: "from-accent-tertiary/15 to-accent-tertiary/5",
    icon: "text-accent-tertiary",
    border: "border-accent-tertiary/20",
    glow: "shadow-[0_0_15px_rgba(99,102,241,0.1)]",
  },
  green: {
    bg: "from-success/15 to-success/5",
    icon: "text-success",
    border: "border-success/20",
    glow: "shadow-[0_0_15px_rgba(34,197,94,0.1)]",
  },
  yellow: {
    bg: "from-warning/15 to-warning/5",
    icon: "text-warning",
    border: "border-warning/20",
    glow: "shadow-[0_0_15px_rgba(234,179,8,0.1)]",
  },
  red: {
    bg: "from-error/15 to-error/5",
    icon: "text-error",
    border: "border-error/20",
    glow: "shadow-[0_0_15px_rgba(239,68,68,0.1)]",
  },
  blue: {
    bg: "from-info/15 to-info/5",
    icon: "text-info",
    border: "border-info/20",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.1)]",
  },
};

export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  accentColor = "magenta",
}: StatCardProps) {
  const accent = accentMap[accentColor];

  return (
    <div
      className={clsx(
        "group relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 transition-all duration-300 hover:scale-[1.02]",
        accent.bg,
        accent.border,
        accent.glow
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="micro-label">{label}</p>
          <p className="mt-2 text-[1.75rem] dash-value text-text-primary">
            {value}
          </p>
          {change && (
            <p
              className={clsx("mt-1 text-[0.65rem] font-medium", {
                "text-success": changeType === "positive",
                "text-error": changeType === "negative",
                "text-text-muted": changeType === "neutral",
              })}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={clsx(
            "flex h-10 w-10 items-center justify-center rounded-lg bg-bg-card/50",
            accent.icon
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-accent-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}
