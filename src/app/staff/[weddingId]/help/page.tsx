"use client"

import { use } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ScanLine,
  QrCode,
  Search,
  CheckCircle,
  WifiOff,
  Users,
} from "lucide-react"
import { useTranslations } from "@/lib/i18n/use-translations"

type HelpCardProps = {
  icon: React.ReactNode
  question: string
  answer: string
}

function HelpCard({ icon, question, answer }: HelpCardProps) {
  return (
    <div className="bg-white border border-border rounded-2xl p-4 flex gap-3">
      <div className="w-10 h-10 rounded-xl bg-ivory-dark text-navy flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-bold text-[14.5px] text-navy mb-0.5">{question}</p>
        <p className="text-[13px] text-muted-foreground leading-snug">{answer}</p>
      </div>
    </div>
  )
}

export default function StaffHelpPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const { t } = useTranslations()

  return (
    <div className="min-h-screen bg-ivory">
      <div className="bg-navy text-white px-[18px] pt-[18px] pb-[22px]">
        <div className="flex items-center gap-2.5">
          <Link
            href={`/staff/${weddingId}/checkin`}
            className="w-[38px] h-[38px] rounded-[10px] bg-white/10 border-0 flex items-center justify-center text-white shrink-0"
            aria-label={t("help.back")}
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="m-0 text-[19px] font-bold">{t("help.title")}</h1>
        </div>
        <p className="text-[13px] text-white/60 mt-2.5 mb-0">
          {t("help.subtitle")}
        </p>
      </div>

      <div className="p-4 flex flex-col gap-[11px]">
        <HelpCard
          icon={<ScanLine size={20} />}
          question={t("help.qrScannerQ")}
          answer={t("help.qrScannerA")}
        />
        <HelpCard
          icon={<QrCode size={20} />}
          question={t("help.noQrQ")}
          answer={t("help.noQrA")}
        />
        <HelpCard
          icon={<Search size={20} />}
          question={t("help.notFoundQ")}
          answer={t("help.notFoundA")}
        />
        <HelpCard
          icon={<CheckCircle size={20} />}
          question={t("help.alreadyCheckedInQ")}
          answer={t("help.alreadyCheckedInA")}
        />
        <HelpCard
          icon={<WifiOff size={20} />}
          question={t("help.offlineQ")}
          answer={t("help.offlineA")}
        />
        <HelpCard
          icon={<Users size={20} />}
          question={t("help.tooManyQ")}
          answer={t("help.tooManyA")}
        />
      </div>
    </div>
  )
}
