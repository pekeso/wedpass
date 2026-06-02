"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type HelpItem = {
  question: string
  answer: string
  steps?: string[]
}

const helpItems: HelpItem[] = [
  {
    question: "What if QR scanning does not work?",
    answer: "Use Manual Search instead.",
    steps: [
      "Tap Search Guest at the bottom of the scanner screen.",
      "Type the guest's name or phone number.",
      "Select the correct guest from the results.",
      "Tap Check In Guest.",
    ],
  },
  {
    question: "What if I lose internet?",
    answer:
      "Keep checking in. Your check-ins are saved on this device and will sync automatically when internet returns.",
    steps: [
      "You will see an orange \"Offline\" status bar at the top.",
      "Continue scanning and checking in guests as normal.",
      "When internet returns, check-ins sync automatically.",
      "Tap Sync Now on the Sync screen to force a sync.",
    ],
  },
  {
    question: "What if a guest is not in the list?",
    answer: "Try different search terms, then send the guest to the organizer if still not found.",
    steps: [
      "Try a shorter version of their name.",
      "Try searching by phone number.",
      "Try alternate spellings.",
      "If still not found, send the guest to the organizer or manual desk.",
      "Do not block the entrance — keep the line moving.",
    ],
  },
  {
    question: "What if my device crashes or runs out of battery?",
    answer:
      "Use another device. Your check-ins are not lost — they are tied to this device's staff token.",
    steps: [
      "Ask the organizer for another phone or device.",
      "Log in using the same staff access token.",
      "Download the offline pack on the new device.",
      "Continue checking in guests.",
      "Retrieve the original device later — it still has local check-ins that need syncing.",
    ],
  },
]

type HelpItemRowProps = {
  item: HelpItem
  isOpen: boolean
  onToggle: () => void
}

function HelpItemRow({ item, isOpen, onToggle }: HelpItemRowProps) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left bg-card hover:bg-muted transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-foreground text-base leading-snug">
          {item.question}
        </span>
        {isOpen ? (
          <ChevronDown className="size-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="size-5 text-muted-foreground shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 space-y-3 bg-card border-t border-border">
          <p className="text-sm text-foreground font-medium">{item.answer}</p>
          {item.steps && item.steps.length > 0 && (
            <ol className="space-y-1 pl-1">
              {item.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="shrink-0 font-semibold text-foreground">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  )
}

type StaffHelpMessagesProps = {
  className?: string
}

export function StaffHelpMessages({ className }: StaffHelpMessagesProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <HelpCircle className="size-5 text-muted-foreground shrink-0" />
        <h2 className="font-semibold text-foreground text-lg">Help &amp; Troubleshooting</h2>
      </div>

      <div className="space-y-2">
        {helpItems.map((item, index) => (
          <HelpItemRow
            key={index}
            item={item}
            isOpen={openIndex === index}
            onToggle={() => toggle(index)}
          />
        ))}
      </div>
    </div>
  )
}
