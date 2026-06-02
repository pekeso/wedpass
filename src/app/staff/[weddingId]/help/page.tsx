"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle, Wifi, WifiOff, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

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
            <h1 className="text-2xl font-bold text-foreground">Staff Help Guide</h1>
            <p className="text-sm text-muted-foreground">Emergency procedures and troubleshooting</p>
          </div>
        </div>

        {/* Quick reminder card */}
        <div className="rounded-xl border border-border bg-card px-5 py-4 space-y-2">
          <p className="font-semibold text-foreground">The golden rule</p>
          <div className="space-y-1">
            {[
              "Scan or search the guest.",
              "Confirm the name.",
              "Tap Check In.",
              "Move to the next guest.",
              "If offline, continue — check-ins are saved.",
              "Before leaving, make sure pending sync is 0.",
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <ArrowRight className="size-4 text-success shrink-0 mt-0.5" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency scenarios */}
        <Section title="If something goes wrong">
          <ScenarioCard
            icon={<Wifi className="size-5 text-danger" />}
            title="QR scan does not work"
            subtitle="Camera issues, blurry code, bad lighting"
            steps={[
              "Tap Search Guest instead.",
              "Type the guest's name or phone number.",
              "Select the correct guest from the list.",
              "Tap Check In Guest.",
            ]}
          />

          <ScenarioCard
            icon={<WifiOff className="size-5 text-offline" />}
            title="Internet goes offline"
            subtitle='You will see an orange "Offline" bar at the top'
            steps={[
              "Do not stop. Keep checking in guests.",
              "Check-ins are saved safely on this device.",
              "When internet returns, sync happens automatically.",
              "Tap Sync Now on the Sync screen to force a sync.",
            ]}
          />

          <ScenarioCard
            icon={<CheckCircle className="size-5 text-muted-foreground" />}
            title="Guest is not in the list"
            subtitle="Not found after searching by name"
            steps={[
              "Try a shorter name or different spelling.",
              "Search by phone number if available.",
              "If still not found, send guest to the organizer desk.",
              "Do not block the entrance — keep the line moving.",
            ]}
          />

          <ScenarioCard
            icon={<Smartphone className="size-5 text-warning" />}
            title="Device crashes or battery dies"
            subtitle="You can recover using another device"
            steps={[
              "Ask the organizer for another phone or tablet.",
              "Log in using the same staff access token.",
              "Download the offline pack on the new device.",
              "Continue checking in guests normally.",
              "Retrieve the original device later — it still has check-ins that need syncing.",
            ]}
          />
        </Section>

        {/* Important rules */}
        <Section title="Very important rules">
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">Do:</p>
            {[
              "Keep the entrance moving.",
              "Use manual search if QR fails.",
              "Continue if offline mode is active.",
              "Check Sync Status before leaving.",
              "Ask the organizer for exception cases.",
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle className="size-4 text-success shrink-0 mt-0.5" />
                <span>{rule}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">Do not:</p>
            {[
              "Clear browser data.",
              "Use private browsing mode.",
              "Leave with pending sync count above 0.",
              "Create new guests during Event Mode.",
              "Panic when internet goes offline.",
              "Spend too long on one problematic guest.",
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-danger font-bold shrink-0">✕</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Before leaving */}
        <Section title="Before you leave the wedding">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <StepList
              steps={[
                "Open the Sync screen.",
                "Tap Sync Now and wait for it to complete.",
                "Confirm that pending sync count is 0.",
                "If it is not 0, do not close the app — inform the organizer.",
                "Once at 0, you may leave.",
              ]}
            />
          </div>
        </Section>

        {/* French section */}
        <div className="border-t border-border pt-6 space-y-6">
          <h2 className="text-xl font-bold text-foreground">Version Française</h2>

          <div className="rounded-xl border border-border bg-card px-5 py-4 space-y-2">
            <p className="font-semibold text-foreground">La règle d&apos;or</p>
            <div className="space-y-1">
              {[
                "Scanner ou rechercher l'invité.",
                "Confirmer le nom.",
                "Appuyer sur Enregistrer l'arrivée.",
                "Passer à l'invité suivant.",
                "Si hors ligne, continuer — les présences sont sauvegardées.",
                "Avant de partir, vérifiez que les éléments en attente sont à 0.",
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="size-4 text-success shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <p className="font-semibold text-foreground">Si le scan QR ne fonctionne pas</p>
            <StepList
              steps={[
                "Appuyez sur Rechercher un invité.",
                "Tapez le nom ou le numéro de téléphone.",
                "Sélectionnez le bon invité.",
                "Appuyez sur Enregistrer l'arrivée.",
              ]}
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <p className="font-semibold text-foreground">Si Internet ne fonctionne plus</p>
            <StepList
              steps={[
                "Ne vous arrêtez pas. Continuez à enregistrer les invités.",
                "Les présences sont sauvegardées sur cet appareil.",
                "La synchronisation se fait automatiquement quand Internet revient.",
                "Appuyez sur Synchroniser maintenant pour forcer la synchronisation.",
              ]}
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <p className="font-semibold text-foreground">Si l&apos;invité n&apos;est pas trouvé</p>
            <StepList
              steps={[
                "Essayez un nom plus court ou une autre orthographe.",
                "Recherchez par numéro de téléphone.",
                "Si toujours introuvable, envoyez l'invité au bureau de l'organisateur.",
                "Ne bloquez pas l'entrée — gardez la file fluide.",
              ]}
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <p className="font-semibold text-foreground">Si l&apos;appareil tombe en panne</p>
            <StepList
              steps={[
                "Demandez un autre téléphone ou appareil à l'organisateur.",
                "Connectez-vous avec le même token d'accès.",
                "Téléchargez le pack hors ligne sur le nouvel appareil.",
                "Continuez à enregistrer les invités normalement.",
                "Récupérez l'appareil d'origine plus tard pour synchroniser ses présences.",
              ]}
            />
          </div>
        </div>

        {/* Navigation footer */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 h-12 gap-2"
            onClick={() => history.back()}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Link href={`/staff/${weddingId}/checkin`} className="flex-1">
            <Button className="h-12 w-full gap-2">
              Go to Check-In
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
