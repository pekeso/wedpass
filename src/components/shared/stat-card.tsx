import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type StatCardVariant = "default" | "success" | "warning" | "danger" | "info"

export interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  variant?: StatCardVariant
}

const variantClasses: Record<StatCardVariant, string> = {
  default: "",
  success: "bg-success-light/40",
  warning: "bg-warning-light/40",
  danger: "bg-danger-light/40",
  info: "bg-sync-light/40",
}

export function StatCard({
  title,
  value,
  description,
  icon,
  variant = "default",
}: StatCardProps) {
  return (
    <Card className={cn(variantClasses[variant])}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && (
            <div className="shrink-0 text-muted-foreground">{icon}</div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
