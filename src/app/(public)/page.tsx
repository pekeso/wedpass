"use client"

import Link from "next/link"
import {
  ArrowRight,
  Check,
  Globe,
  Heart,
  ImageIcon,
  ScanLine,
  ShieldCheck,
  Users,
  WifiOff,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { WedPassWordmark } from "@/components/shared/wedpass-wordmark"
import { useTranslations } from "@/lib/i18n/use-translations"

/* ── inline W-mark SVG helpers (avoids clipPath ID collisions) ── */
function WMarkMono({ size, color = "#fff" }: { size: number; color?: string }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.92)}
      viewBox="0 0 100 96"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10,27 L31,90 L50,7 L69,90 L90,27"
        fill="none"
        stroke={color}
        strokeWidth={13}
        strokeLinejoin="miter"
        strokeLinecap="butt"
        strokeMiterlimit={20}
      />
    </svg>
  )
}

function WMarkDuo({ size }: { size: number }) {
  const id = "duo-home"
  return (
    <svg
      width={size}
      height={Math.round(size * 0.92)}
      viewBox="0 0 100 96"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={`${id}-l`}>
          <rect x="0" y="0" width="50" height="96" />
        </clipPath>
        <clipPath id={`${id}-r`}>
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
        <path d="M10,27 L31,90 L50,7 L69,90 L90,27" stroke="#172033" clipPath={`url(#${id}-l)`} />
        <path d="M10,27 L31,90 L50,7 L69,90 L90,27" stroke="#C8A45D" clipPath={`url(#${id}-r)`} />
      </g>
    </svg>
  )
}

export default function HomePage() {
  const { t } = useTranslations()

  const steps = [
    [Users, t("home.step1Title"), t("home.step1Desc")],
    [ScanLine, t("home.step2Title"), t("home.step2Desc")],
    [Heart, t("home.step3Title"), t("home.step3Desc")],
  ] as const

  const benefits = [
    [WifiOff, t("home.benefit1Title"), t("home.benefit1Desc")],
    [ShieldCheck, t("home.benefit2Title"), t("home.benefit2Desc")],
    [ImageIcon, t("home.benefit3Title"), t("home.benefit3Desc")],
  ] as const

  const trustFeatures = [
    [WifiOff, t("home.featureOffline")],
    [Globe, t("home.featureBilingual")],
    [Users, t("home.featureNoAccounts")],
  ] as const

  const tags = [
    t("home.tagCouples"),
    t("home.tagPlanners"),
    t("home.tagFamily"),
    t("home.tagStaff"),
  ]

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-ivory px-6 pb-12 pt-16 md:pt-20 md:px-10" id="hero">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-8 md:grid-cols-[1.05fr_0.95fr]">
          {/* Left column */}
          <div>
            <h1 className="mb-4 text-[clamp(34px,4.5vw,50px)] font-extrabold leading-[1.05] tracking-[-0.025em] text-navy">
              {t("home.heroLine1")}
              <br />
              <span className="font-display font-semibold italic">
                {t("home.heroLine2")}
              </span>
            </h1>

            <p className="mb-7 max-w-[480px] text-[17px] leading-[1.55] text-[#45506b]">
              {t("home.heroDesc")}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/beta">
                <Button
                  variant="navy"
                  className="h-[54px] gap-2 rounded-2xl px-6 text-base font-semibold"
                >
                  {t("home.joinBeta")}
                  <ArrowRight className="size-[18px] text-champagne" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="h-[54px] rounded-2xl border-[#e7e1d6] bg-white px-6 text-base font-medium text-navy"
                >
                  {t("nav.login")}
                </Button>
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-5">
              {trustFeatures.map(([Icon, label], i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-[#6b7589]"
                >
                  <Icon className="size-4 flex-none text-champagne-deep" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Right column: phone mock on navy panel */}
          <div className="relative flex h-[400px] items-center justify-center overflow-hidden rounded-2xl bg-navy md:h-[420px]">
            <div className="absolute -bottom-10 -right-12 opacity-[0.08]">
              <WMarkMono size={280} />
            </div>

            <div
              className="relative w-[220px] rounded-[22px] bg-ivory p-3.5"
              style={{ boxShadow: "0 12px 34px rgba(23,32,51,0.28)" }}
            >
              <div className="mb-3 flex items-center gap-2 rounded-[9px] bg-[#0f3d24] px-3 py-2">
                <span className="size-[7px] flex-none rounded-full bg-[#3ddc84]" />
                <span className="text-[11px] font-semibold text-white">
                  {t("syncBar.allSynced")}
                </span>
              </div>

              <div className="mb-3 flex items-center gap-2">
                <WMarkDuo size={18} />
                <span className="text-[12px] font-bold text-navy">Ada &amp; Kofi</span>
              </div>

              <div className="mb-2.5 rounded-xl bg-navy px-2.5 py-5 text-center">
                <ScanLine className="mx-auto mb-1.5 size-7 text-champagne" />
                <div className="text-[12px] font-semibold text-white">{t("scan.title")}</div>
              </div>

              {[
                ["Adaeze N.", "2s"],
                ["Kojo M.", "48s"],
              ].map(([name, time], i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 py-1.5 ${i > 0 ? "border-t border-[#e7e1d6]" : ""}`}
                >
                  <Check className="size-3.5 flex-none text-success" strokeWidth={3} />
                  <span className="text-[11px] font-medium text-[#45506b]">
                    {name} · {time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="px-6 pb-12 pt-5 md:px-10" id="how-it-works">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-8 text-center">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-champagne-deep">
              {t("home.howItWorksEyebrow")}
            </p>
            <h2 className="text-[30px] font-bold tracking-[-0.01em] text-navy">
              {t("home.howItWorksHeading")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {steps.map(([Icon, heading, body], i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#efeae0] bg-white p-6"
                style={{
                  boxShadow:
                    "0 1px 2px rgba(23,32,51,0.06), 0 1px 1px rgba(23,32,51,0.04)",
                }}
              >
                <div className="mb-4 flex size-[46px] items-center justify-center rounded-xl bg-navy">
                  <Icon className="size-[22px] text-champagne" />
                </div>
                <h3 className="mb-2 text-[17px] font-bold text-navy">{heading}</h3>
                <p className="text-[14px] leading-[1.5] text-[#45506b]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits band (navy) ─────────────────────────────────────── */}
      <section className="bg-navy px-6 py-12 md:px-10" id="for-staff">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 sm:grid-cols-3">
          {benefits.map(([Icon, heading, body], i) => (
            <div key={i}>
              <Icon className="mb-3.5 size-[26px] text-champagne" />
              <h3 className="mb-2 text-[18px] font-bold text-white">{heading}</h3>
              <p className="text-[14px] leading-[1.55] text-white/65">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who it's for + CTA ───────────────────────────────────────── */}
      <section className="px-6 py-12 text-center md:px-10" id="memories">
        <div className="mx-auto max-w-[1180px]">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-champagne-deep">
            {t("home.whoItsForEyebrow")}
          </p>

          <div className="mb-9 flex flex-wrap justify-center gap-2.5">
            {tags.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full border border-[#e7e1d6] bg-white px-4 py-2 text-[14px] font-medium text-[#45506b]"
              >
                {label}
              </span>
            ))}
          </div>

          <div
            className="mx-auto max-w-[720px] rounded-2xl px-10 py-11"
            style={{ background: "#FBEDEB" }}
          >
            <div className="mb-4 flex justify-center">
              <WedPassWordmark size={40} />
            </div>
            <h2 className="mb-2.5 text-[30px] font-bold tracking-[-0.01em] text-navy">
              {t("home.ctaHeading")}
            </h2>
            <p className="mb-6 text-[15.5px] text-[#45506b]">
              {t("home.ctaDesc")}
            </p>
            <Link href="/beta">
              <Button
                variant="navy"
                className="h-[54px] gap-2 rounded-2xl px-6 text-base font-semibold"
              >
                {t("home.joinBeta")}
                <ArrowRight className="size-[18px] text-champagne" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
