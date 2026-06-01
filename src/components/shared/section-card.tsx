import * as React from "react"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export interface SectionCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  action?: React.ReactNode
}

export function SectionCard({
  title,
  description,
  children,
  action,
}: SectionCardProps) {
  const hasHeader = title ?? description ?? action
  return (
    <Card>
      {hasHeader && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
          {action && <CardAction>{action}</CardAction>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}
