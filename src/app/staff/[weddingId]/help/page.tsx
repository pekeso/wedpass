"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle, Wifi, WifiOff, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/i18n/use-translations"

type SectionProps = {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {children}
    </div>
  )
}

type StepListProps = {
  steps: string[]
}

function StepList({ steps }: StepListProps) {
  return (
    <ol className="space-y-2 pl-1">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3 text-sm text-foreground">
          <span className="shrink-0 flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
            {i + 1}
          </span>
          <span className="pt-0.5">{step}</span>
        </li>
      ))}
    </ol>
  )
}

type ScenarioCardProps = {
  icon: React.ReactNode
  title: string
  subtitle?: string
  steps: string[]
}

function ScenarioCard({ icon, title, subtitle, steps }: ScenarioCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{icon}</div>
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <StepList steps={steps} />
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
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 px-4 py-8 max-w-lg mx-auto w-full space-y-8">
        <div className="flex items-center gap-3">
          <Link
            href={`/staff/${weddingId}/download`}
            className="flex items-center justify-center size-10 rounded-full border border-border bg-card hover:bg-muted transition-colors shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="size-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("help.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("help.description")}</p>
          </div>
        </div>

        {/* Quick reminder card */}
        <div className="rounded-xl border border-border bg-card px-5 py-4 space-y-2">
          <p className="font-semibold text-foreground">{t("help.goldenRule")}</p>
          <div className="space-y-1">
            {[
              t("help.goldenStep1"),
              t("help.goldenStep2"),
              t("help.goldenStep3"),
              t("help.goldenStep4"),
              t("help.goldenStep5"),
              t("help.goldenStep6"),
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <ArrowRight className="size-4 text-success shrink-0 mt-0.5" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency scenarios */}
        <Section title={t("help.ifSomethingWrong")}>
          <ScenarioCard
            icon={<Wifi className="size-5 text-danger" />}
            title={t("help.qrDoesntWork")}
            subtitle={t("help.qrIssues")}
            steps={[
              t("help.qrFix1"),
              t("help.qrFix2"),
              t("help.qrFix3"),
              t("help.qrFix4"),
            ]}
          />

          <ScenarioCard
            icon={<WifiOff className="size-5 text-offline" />}
            title={t("help.internetOff")}
            subtitle={t("help.internetOff1")}
            steps={[
              t("help.internetOff2"),
              t("help.internetOff3"),
              t("help.internetOff4"),
              t("help.internetOff5"),
            ]}
          />

          <ScenarioCard
            icon={<CheckCircle className="size-5 text-muted-foreground" />}
            title={t("help.guestNotInList")}
            subtitle={t("help.notFoundSearch")}
            steps={[
              t("help.notFoundFix1"),
              t("help.notFoundFix2"),
              t("help.notFoundFix3"),
              t("help.notFoundFix4"),
            ]}
          />

          <ScenarioCard
            icon={<Smartphone className="size-5 text-warning" />}
            title={t("help.deviceCrash")}
            subtitle={t("help.deviceCrashRecovery")}
            steps={[
              t("help.deviceCrashFix1"),
              t("help.deviceCrashFix2"),
              t("help.deviceCrashFix3"),
              t("help.deviceCrashFix4"),
              t("help.deviceCrashFix5"),
            ]}
          />
        </Section>

        {/* Important rules */}
        <Section title={t("help.importantRules")}>
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">{t("help.doLabel")}</p>
            {[
              t("help.do1"),
              t("help.do2"),
              t("help.do3"),
              t("help.do4"),
              t("help.do5"),
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle className="size-4 text-success shrink-0 mt-0.5" />
                <span>{rule}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">{t("help.dontLabel")}</p>
            {[
              t("help.dont1"),
              t("help.dont2"),
              t("help.dont3"),
              t("help.dont4"),
              t("help.dont5"),
              t("help.dont6"),
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-danger font-bold shrink-0">✕</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Before leaving */}
        <Section title={t("help.beforeLeave")}>
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <StepList
              steps={[
                t("help.beforeLeave1"),
                t("help.beforeLeave2"),
                t("help.beforeLeave3"),
                t("help.beforeLeave4"),
                t("help.beforeLeave5"),
              ]}
            />
          </div>
        </Section>

        {/* Navigation footer */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 h-12 gap-2"
            onClick={() => history.back()}
          >
            <ArrowLeft className="size-4" />
            {t("help.back")}
          </Button>
          <Link href={`/staff/${weddingId}/checkin`} className="flex-1">
            <Button className="h-12 w-full gap-2">
              {t("help.goToCheckin")}
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
