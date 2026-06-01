import { cn } from "@/lib/utils"

export type StatusBadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "offline"
  | "neutral"

export interface StatusBadgeProps {
  label: string
  variant: StatusBadgeVariant
  className?: string
}

const variantClasses: Record<StatusBadgeVariant, string> = {
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  danger: "bg-danger-light text-danger",
  info: "bg-sync-light text-sync",
  offline: "bg-offline-light text-offline",
  neutral: "bg-muted text-muted-foreground",
}

export function StatusBadge({ label, variant, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {label}
    </span>
  )
}
