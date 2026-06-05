import * as React from "react"

export interface PageHeaderProps {
  title: string
  description?: string
  badge?: React.ReactNode
  primaryAction?: React.ReactNode
  secondaryAction?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  badge,
  primaryAction,
  secondaryAction,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {(primaryAction ?? secondaryAction) && (
        <div className="flex shrink-0 items-center gap-2">
          {secondaryAction}
          {primaryAction}
        </div>
      )}
    </div>
  )
}
