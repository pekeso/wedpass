import { AlertTriangle } from "lucide-react"

export interface ErrorStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function ErrorState({
  title,
  description,
  actionLabel,
  onAction,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-danger-light">
        <AlertTriangle className="size-6 text-danger" />
      </div>
      <div className="space-y-1">
        <h3 className="font-medium text-foreground">{title}</h3>
        {description && (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
