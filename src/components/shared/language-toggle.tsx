"use client"

import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

interface LanguageToggleProps {
  className?: string
  variant?: "default" | "cover"
}

export function LanguageToggle({ className, variant = "default" }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage()

  if (variant === "cover") {
    return (
      <div className={cn("flex items-center rounded-full bg-white/90 p-0.5", className)}>
        {(["en", "fr"] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLanguage(l)}
            className={cn(
              "rounded-full px-[11px] py-[5px] text-[11.5px] font-bold transition-colors",
              language === l ? "bg-navy text-white" : "text-navy/60 hover:text-navy"
            )}
            aria-pressed={language === l}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center rounded-lg border border-border bg-muted p-0.5", className)}>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
          language === "en"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-pressed={language === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("fr")}
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
          language === "fr"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-pressed={language === "fr"}
      >
        FR
      </button>
    </div>
  )
}
