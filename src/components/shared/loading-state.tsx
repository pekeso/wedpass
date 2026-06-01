import { Skeleton } from "@/components/ui/skeleton"

export interface LoadingStateProps {
  inline?: boolean
  message?: string
}

export function LoadingState({ inline = false, message }: LoadingStateProps) {
  if (inline) {
    return (
      <div className="flex items-center gap-2">
        <div className="size-4 animate-spin rounded-full border-2 border-navy border-t-transparent" />
        {message && (
          <span className="text-sm text-muted-foreground">{message}</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="size-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )
}

export function LoadingSkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  )
}
