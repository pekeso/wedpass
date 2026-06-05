import { useId } from "react"

export type WMarkVariant = "duo" | "mono-ivory" | "mono-navy" | "mono-gold"

interface WMarkProps {
  size?: number
  variant?: WMarkVariant
  className?: string
}

export function WMark({ size = 40, variant = "duo", className }: WMarkProps) {
  const uid = useId()
  const path = "M10,27 L31,90 L50,7 L69,90 L90,27"

  const colors: Record<WMarkVariant, { left: string; right: string }> = {
    duo: { left: "#172033", right: "#C8A45D" },
    "mono-navy": { left: "#172033", right: "#172033" },
    "mono-gold": { left: "#C8A45D", right: "#C8A45D" },
    "mono-ivory": { left: "#FAF7F1", right: "#FAF7F1" },
  }
  const { left, right } = colors[variant]

  return (
    <svg
      width={size}
      height={size * 0.92}
      viewBox="0 0 100 96"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="WedPass"
      className={className}
    >
      <defs>
        <clipPath id={`${uid}-L`}>
          <rect x="0" y="0" width="50" height="96" />
        </clipPath>
        <clipPath id={`${uid}-R`}>
          <rect x="50" y="0" width="50" height="96" />
        </clipPath>
      </defs>
      <g
        fill="none"
        strokeWidth={13}
        strokeLinejoin="miter"
        strokeLinecap="butt"
        strokeMiterlimit={20}
      >
        <path d={path} stroke={left} clipPath={`url(#${uid}-L)`} />
        <path d={path} stroke={right} clipPath={`url(#${uid}-R)`} />
      </g>
    </svg>
  )
}
