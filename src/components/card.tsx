import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export function Card({
  children,
  className,
  title,
  subtitle,
  action,
  noPadding,
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-border-primary bg-bg-card",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-border-primary px-5 py-3.5">
          <div>
            {title && (
              <h3 className="micro-label text-[0.7rem]">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-[0.65rem] font-light text-text-muted">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={noPadding ? "" : "p-5"}>{children}</div>
    </div>
  );
}
