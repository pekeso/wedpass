"use client"

import { use, useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, Shield, ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WMark } from "@/components/shared/wmark"
import { verifyStaffToken } from "@/lib/api/staff-client"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useLanguage } from "@/lib/i18n/language-context"

const STAFF_TOKEN_KEY = (weddingId: string) => `wedpass-staff-token-${weddingId}`

function StaffLoginForm({ weddingId }: { weddingId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language, setLanguage } = useLanguage()

  const [token, setToken] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const urlToken = searchParams.get("token")
    if (urlToken) setToken(urlToken)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslations()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = token.trim()
    if (!trimmed) {
      setError(t("login.tokenRequired"))
      return
    }

    setError("")
    setIsLoading(true)

    try {
      await verifyStaffToken(weddingId, trimmed)
      localStorage.setItem(STAFF_TOKEN_KEY(weddingId), trimmed)
      router.push(`/staff/${weddingId}/download`)
    } catch {
      setError(t("login.tokenInvalid"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-navy text-white">
      {/* decorative background W mark */}
      <div className="pointer-events-none absolute right-[-60px] top-10 opacity-[0.05]">
        <WMark size={300} variant="mono-ivory" />
      </div>

      {/* top bar – language toggle */}
      <div className="relative flex justify-end px-[18px] py-[14px]">
        <div className="flex rounded-full p-[3px]" style={{ background: "rgba(255,255,255,0.08)" }}>
          {(["en", "fr"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLanguage(l)}
              className="rounded-full px-3 py-[5px] text-xs font-semibold transition-colors"
              style={{
                background: language === l ? "var(--color-champagne)" : "transparent",
                color: language === l ? "var(--color-navy)" : "rgba(255,255,255,0.7)",
                border: 0,
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* main content */}
      <div className="relative flex flex-1 flex-col justify-center px-[26px] pb-10">
        {/* W mark logo */}
        <div className="mb-[18px] flex justify-center">
          <WMark size={62} variant="duo" />
        </div>

        <h1 className="mb-[6px] text-center text-[23px] font-bold leading-tight">
          {t("login.title")}
        </h1>
        <p className="mb-[30px] text-center text-sm leading-[1.45] text-white/60">
          {t("login.description")}
        </p>

        <form onSubmit={handleSubmit}>
          {/* wedding access code */}
          <label
            htmlFor="staff-token"
            className="mb-2 block text-[12.5px] font-semibold tracking-[0.02em] text-white/60"
          >
            {t("login.tokenLabel")}
          </label>
          <div
            className="flex items-center gap-[11px] rounded-[13px] px-[15px] py-[14px]"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            <Lock className="size-[18px] shrink-0 text-white/45" />
            <input
              id="staff-token"
              type="text"
              placeholder={t("login.tokenPlaceholder")}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="flex-1 border-0 bg-transparent text-base font-semibold tracking-[0.03em] text-white outline-none placeholder:text-white/30"
            />
          </div>

          {/* device PIN */}
          <label
            htmlFor="staff-pin"
            className="mb-2 mt-4 block text-[12.5px] font-semibold tracking-[0.02em] text-white/60"
          >
            {t("login.pinLabel")}
          </label>
          <div
            className="flex items-center gap-[11px] rounded-[13px] px-[15px] py-[14px]"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            <Shield className="size-[18px] shrink-0 text-white/45" />
            <input
              id="staff-pin"
              type="password"
              placeholder="••••"
              autoComplete="off"
              className="flex-1 border-0 bg-transparent text-base font-semibold tracking-[0.03em] text-white outline-none placeholder:text-white/30"
            />
          </div>

          {error && (
            <p className="mt-3 text-sm text-danger">{error}</p>
          )}

          <Button
            type="submit"
            variant="gold"
            size="xl"
            disabled={isLoading}
            className="mt-[26px] w-full"
          >
            {isLoading ? t("login.verifying") : t("login.button")}
            {!isLoading && <ArrowRight className="size-[18px]" />}
          </Button>
        </form>

        {/* security note */}
        <div className="mt-5 flex items-center justify-center gap-[7px] text-xs text-white/50">
          <ShieldCheck className="size-3.5 text-champagne" />
          {t("login.securityNote")}
        </div>
      </div>
    </div>
  )
}

export default function StaffLoginPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)

  return (
    <Suspense fallback={<div className="min-h-screen bg-navy" />}>
      <StaffLoginForm weddingId={weddingId} />
    </Suspense>
  )
}
