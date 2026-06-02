"use client"

interface UploadProgressProps {
  progress: number
  label?: string
}

export function UploadProgress({ progress, label = "Uploading..." }: UploadProgressProps) {
  const clamped = Math.min(100, Math.max(0, progress))

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-navy/70">
        <span>{label}</span>
        <span>{clamped}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-navy/10">
        <div
          className="h-full rounded-full bg-champagne transition-all duration-300"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
