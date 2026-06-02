"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/lib/i18n/use-translations"

type HelpItem = {
  question: string
  answer: string
  steps?: string[]
}

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
  const { t } = useTranslations()

  const helpItems: HelpItem[] = [
    {
      question: t("helpFAQ.q1"),
      answer: t("helpFAQ.a1"),
      steps: [
        t("helpFAQ.q1s1"),
        t("helpFAQ.q1s2"),
        t("helpFAQ.q1s3"),
        t("helpFAQ.q1s4"),
      ],
    },
    {
      question: t("helpFAQ.q2"),
      answer: t("helpFAQ.a2"),
      steps: [
        t("helpFAQ.q2s1"),
        t("helpFAQ.q2s2"),
        t("helpFAQ.q2s3"),
        t("helpFAQ.q2s4"),
      ],
    },
    {
      question: t("helpFAQ.q3"),
      answer: t("helpFAQ.a3"),
      steps: [
        t("helpFAQ.q3s1"),
        t("helpFAQ.q3s2"),
        t("helpFAQ.q3s3"),
        t("helpFAQ.q3s4"),
        t("helpFAQ.q3s5"),
      ],
    },
    {
      question: t("helpFAQ.q4"),
      answer: t("helpFAQ.a4"),
      steps: [
        t("helpFAQ.q4s1"),
        t("helpFAQ.q4s2"),
        t("helpFAQ.q4s3"),
        t("helpFAQ.q4s4"),
        t("helpFAQ.q4s5"),
      ],
    },
  ]

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <HelpCircle className="size-5 text-muted-foreground shrink-0" />
        <h2 className="font-semibold text-foreground text-lg">{t("helpFAQ.title")}</h2>
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
