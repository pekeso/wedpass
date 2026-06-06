"use client"

import { use, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Papa from "papaparse"
import { FileText, Download, Sparkles, Check } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/stores/auth-store"
import type { ImportGuestsResponseDTO } from "@/modules/guests/guests.dto"
import type { ApiResponse } from "@/types/api"

interface ParsedRow {
  fullName: string
  phoneNumber?: string
  email?: string
  numberOfAllowedGuests: number
  tableName?: string
  seatNumber?: string
}

type RowStatus = "ok" | "dup" | "err"

interface ValidatedRow extends ParsedRow {
  status: RowStatus
}

const SAMPLE_CSV =
  "fullName,phoneNumber,email,numberOfAllowedGuests,tableName,seatNumber\n" +
  "Michael Okoro,+2348012345678,michael@example.com,2,Table 1,3\n" +
  "Sarah Adebayo,+2348099876543,,1,Table 2,\n"

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[\s_-]/g, "")
}

function parseAndValidate(raw: Record<string, string>[]): ValidatedRow[] {
  const seenNames = new Set<string>()
  return raw.map((r) => {
    const n = Object.fromEntries(Object.entries(r).map(([k, v]) => [normalizeKey(k), v.trim()]))
    const fullName = n["fullname"] ?? n["name"] ?? ""
    const phoneNumber = n["phonenumber"] ?? n["phone"] ?? ""
    const email = n["email"] ?? ""
    const allowedRaw = n["numberofallowedguests"] ?? n["allowedguests"] ?? n["guests"] ?? ""
    const numberOfAllowedGuests = Math.max(1, parseInt(allowedRaw) || 1)

    const tableNameRaw = n["tablename"] ?? n["table"] ?? ""
    const seatNumberRaw = n["seatnumber"] ?? n["seat"] ?? ""

    const row: ParsedRow = {
      fullName,
      phoneNumber: phoneNumber || undefined,
      email: email || undefined,
      numberOfAllowedGuests,
      tableName: tableNameRaw || undefined,
      seatNumber: seatNumberRaw || undefined,
    }

    if (!fullName) return { ...row, status: "err" }
    const key = fullName.toLowerCase()
    if (seenNames.has(key)) return { ...row, status: "dup" }
    seenNames.add(key)
    return { ...row, status: "ok" }
  })
}

export default function ImportGuestsPage({
  params,
}: {
  params: Promise<{ weddingId: string }>
}) {
  const { weddingId } = use(params)
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [rows, setRows] = useState<ValidatedRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportGuestsResponseDTO | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  function handleFile(file: File) {
    setFileName(file.name)
    setParseError(null)
    setImportResult(null)
    setImportError(null)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError(`CSV parse error: ${results.errors[0].message}`)
          setRows([])
          return
        }
        const validated = parseAndValidate(results.data)
        if (validated.length === 0) {
          setParseError("No data rows found in the CSV file.")
          setRows([])
          return
        }
        const hasAnyName = validated.some((r) => r.fullName.length > 0)
        if (!hasAnyName) {
          setParseError('Required column "fullName" was not found. Check that your CSV headers match the template.')
          setRows([])
          return
        }
        setRows(validated)
      },
      error: (err: { message: string }) => {
        setParseError(`Failed to read file: ${err.message}`)
        setRows([])
      },
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  async function handleImport() {
    const okRows = rows.filter((r) => r.status === "ok")
    if (!okRows.length || !accessToken) return
    setIsImporting(true)
    setImportError(null)

    try {
      const res = await fetch(`/api/v1/weddings/${weddingId}/guests/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          guests: okRows.map(({ status: _s, ...r }) => r),
        }),
      })
      const json: ApiResponse<ImportGuestsResponseDTO> = await res.json()
      if (!json.success) {
        setImportError(json.error.message)
        return
      }
      setImportResult(json.data)
    } catch {
      setImportError("An unexpected error occurred. Please try again.")
    } finally {
      setIsImporting(false)
    }
  }

  function downloadTemplate() {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "wedpass-guests-template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const guestsPath = `/dashboard/wedding/${weddingId}/guests`
  const okCount = rows.filter((r) => r.status === "ok").length
  const dupCount = rows.filter((r) => r.status === "dup").length

  return (
    <div className="space-y-6">
      <PageHeader title="Import Guests" description="Bulk-add from a spreadsheet" />

      <div className="max-w-[720px] space-y-[18px]">
        {/* Info banner */}
        <div className="flex gap-2.5 rounded-xl bg-sync-light px-3.5 py-3.5">
          <Sparkles className="mt-px size-[18px] shrink-0 text-sync" />
          <p className="text-[13px] leading-[1.45] text-[#1e40af]">
            Clean guest data makes event-day check-in smoother. Match names exactly as on invitations.
          </p>
        </div>

        {!importResult ? (
          <>
            {/* Dropzone */}
            <div
              className={`rounded-2xl border-2 border-dashed bg-white px-5 py-9 text-center transition-colors${
                isDragging ? " border-navy bg-navy-soft/30" : " border-border"
              } cursor-pointer`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="mx-auto mb-3.5 flex size-14 items-center justify-center rounded-[14px] bg-ivory-dark text-navy">
                <FileText className="size-[26px]" />
              </div>
              <p className="text-base font-bold text-navy">Drop your CSV here</p>
              <p className="mb-4 mt-1 text-[13px] text-muted-foreground">or browse to upload</p>
              <Button
                variant="outline"
                size="sm"
                className="bg-muted/40"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                Choose file
              </Button>
              <div className="mt-3.5">
                <button
                  className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-champagne hover:text-champagne-deep"
                  onClick={(e) => {
                    e.stopPropagation()
                    downloadTemplate()
                  }}
                >
                  <Download className="size-[13px]" />
                  Download template
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {parseError && <p className="text-sm text-danger">{parseError}</p>}

            {/* Preview table */}
            {rows.length > 0 && (
              <div className="overflow-hidden rounded-xl border bg-white">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <span className="text-sm font-semibold text-navy">
                    {fileName} · {rows.length} rows
                  </span>
                  {dupCount > 0 && (
                    <Badge className="border-warning bg-warning-light text-warning hover:bg-warning-light">
                      {dupCount} duplicate{dupCount !== 1 ? "s" : ""} found
                    </Badge>
                  )}
                </div>
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-muted/40">
                      {(["Name", "Table", "Seat", "Allowed", ""] as const).map((h, i) => (
                        <th
                          key={i}
                          className="px-4 py-[9px] text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 8).map((row, i) => (
                      <tr
                        key={i}
                        className={`border-t${
                          row.status === "dup"
                            ? " bg-warning-light"
                            : row.status === "err"
                              ? " bg-danger-light"
                              : " bg-white"
                        }`}
                      >
                        <td className="px-4 py-[9px] font-medium">
                          {row.fullName || <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-[9px] tabular-nums text-muted-foreground">
                          {row.tableName ?? "—"}
                        </td>
                        <td className="px-4 py-[9px] tabular-nums text-muted-foreground">
                          {row.seatNumber ?? "—"}
                        </td>
                        <td className="px-4 py-[9px] tabular-nums">{row.numberOfAllowedGuests}</td>
                        <td className="px-4 py-[9px] text-right">
                          {row.status === "ok" ? (
                            <Check className="ml-auto size-[15px] stroke-[3] text-success" />
                          ) : row.status === "dup" ? (
                            <span className="text-[11.5px] font-semibold text-warning">Duplicate</span>
                          ) : (
                            <span className="text-[11.5px] font-semibold text-danger">Missing name</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 8 && (
                  <div className="border-t px-4 py-2.5 text-[12.5px] text-muted-foreground">
                    …and {rows.length - 8} more rows
                  </div>
                )}
              </div>
            )}

            {importError && <p className="text-sm text-danger">{importError}</p>}

            {/* Action buttons */}
            <div className="flex gap-2.5">
              <Button
                variant="outline"
                className="bg-white"
                onClick={() => router.push(guestsPath)}
              >
                Cancel
              </Button>
              <Button
                className="ml-auto bg-navy text-white hover:bg-navy-hover"
                disabled={okCount === 0 || isImporting}
                onClick={handleImport}
              >
                {isImporting ? "Importing…" : `Import ${okCount} Guest${okCount !== 1 ? "s" : ""}`}
              </Button>
            </div>
          </>
        ) : (
          /* Import result */
          <>
            <div className="overflow-hidden rounded-xl border bg-white">
              <div className="flex gap-4 p-5">
                <div className="flex-1 rounded-xl bg-success-light px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-success">{importResult.importedCount}</p>
                  <p className="text-xs text-muted-foreground">Imported</p>
                </div>
                {importResult.failedCount > 0 && (
                  <div className="flex-1 rounded-xl bg-danger-light px-4 py-3 text-center">
                    <p className="text-2xl font-bold text-danger">{importResult.failedCount}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                )}
              </div>
              {importResult.errors.length > 0 && (
                <div className="space-y-1 border-t px-5 py-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Row errors
                  </p>
                  <div className="max-h-36 space-y-1 overflow-y-auto">
                    {importResult.errors.map((e, i) => (
                      <p key={i} className="text-xs text-danger">
                        Row {e.row}: {e.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              <Button
                variant="outline"
                className="bg-white"
                onClick={() => {
                  setRows([])
                  setFileName(null)
                  setImportResult(null)
                  setImportError(null)
                  setParseError(null)
                }}
              >
                Import Another
              </Button>
              <Button
                className="ml-auto bg-navy text-white hover:bg-navy-hover"
                onClick={() => router.push(guestsPath)}
              >
                Done
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
