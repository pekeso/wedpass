"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Inter, sans-serif", background: "#FAF7F1" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            textAlign: "center",
            padding: "1.5rem",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#172033" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#6B7280" }}>An unexpected error occurred. Please try again.</p>
          {error.digest && (
            <code style={{ fontSize: "0.75rem", color: "#9CA3AF", fontFamily: "monospace" }}>
              Error: {error.digest}
            </code>
          )}
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1.5rem",
              background: "#172033",
              color: "white",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
