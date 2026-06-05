"use client"

import { useLanguage } from "@/lib/i18n/language-context"

export function LangToggle() {
  const { language, setLanguage } = useLanguage()
  return (
    <div className="hidden items-center rounded-full border border-[#e7e1d6] bg-white p-0.5 sm:flex">
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLanguage(l)}
          className={`rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors ${
            language === l ? "bg-navy text-white" : "text-[#97a0b2] hover:text-navy"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
