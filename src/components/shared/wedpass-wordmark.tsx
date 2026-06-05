interface WedPassWordmarkProps {
  size?: number
  textColor?: string
  tagline?: boolean
  markOnly?: boolean
}

export function WedPassWordmark({
  size = 28,
  textColor = "var(--color-navy)",
  tagline = false,
  markOnly = false,
}: WedPassWordmarkProps) {
  const path = "M10,27 L31,90 L50,7 L69,90 L90,27"

  const svg = (
    <svg
      width={size}
      height={size * 0.92}
      viewBox="0 0 100 96"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="wp-left-0">
          <rect x="0" y="0" width="50" height="96" />
        </clipPath>
        <clipPath id="wp-right-0">
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
        <path d={path} stroke="#172033" clipPath="url(#wp-left-0)" />
        <path d={path} stroke="#C8A45D" clipPath="url(#wp-right-0)" />
      </g>
    </svg>
  )

  if (markOnly) return svg

  return (
    <div style={{ display: "flex", alignItems: "center", gap: `${Math.round(size * 0.4)}px` }}>
      {svg}
      <div style={{ lineHeight: 1 }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: `${size * 0.66}px`,
            letterSpacing: "-0.01em",
            color: textColor,
          }}
        >
          Wed<span style={{ color: "var(--color-champagne-deep)" }}>Pass</span>
        </div>
        {tagline && (
          <div
            style={{
              fontSize: `${size * 0.235}px`,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--color-champagne-deep)",
              marginTop: "5px",
              fontWeight: 600,
            }}
          >
            Smart Wedding Check&#8209;In
          </div>
        )}
      </div>
    </div>
  )
}
