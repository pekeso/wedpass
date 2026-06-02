"use client"

import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

interface LanguageToggleProps {
  className?: string
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage()

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
