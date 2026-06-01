"use client"

import { useState, useRef } from "react"
import Papa from "papaparse"
import { Upload, Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/stores/auth-store"
import type { ImportGuestsResponseDTO } from "@/modules/guests/guests.dto"
import type { ApiResponse } from "@/types/api"

interface ParsedRow {
  fullName: string
  phoneNumber?: string
  email?: string
  numberOfAllowedGuests: number
}

const SAMPLE_CSV =
  "fullName,phoneNumber,email,numberOfAllowedGuests\n" +
  "Michael Okoro,+2348012345678,michael@example.com,2\n" +
  "Sarah Adebayo,+2348099876543,,1\n"

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[\s_-]/g, "")
}

function parseRows(raw: Record<string, string>[]): ParsedRow[] {
  return raw.map((r) => {
    const n = Object.fromEntries(Object.entries(r).map(([k, v]) => [normalizeKey(k), v.trim()]))
    const fullName = n["fullname"] ?? n["name"] ?? ""
    const phoneNumber = n["phonenumber"] ?? n["phone"] ?? ""
    const email = n["email"] ?? ""
    const allowedRaw = n["numberofallowedguests"] ?? n["allowedguests"] ?? n["guests"] ?? ""
    const numberOfAllowedGuests = Math.max(1, parseInt(allowedRaw) || 1)
    return {
      fullName,
      phoneNumber: phoneNumber || undefined,
      email: email || undefined,
      numberOfAllowedGuests,
    }
  })
}

interface CsvImportDialogProps {
  weddingId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported: () => void
}

export function CsvImportDialog({ weddingId, open, onOpenChange, onImported }: CsvImportDialogProps) {
  const { accessToken } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportGuestsResponseDTO | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  function handleReset() {
    setParsedRows([])
    setParseError(null)
    setFileName(null)
    setImportResult(null)
    setImportError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) handleReset()
    onOpenChange(nextOpen)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
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
          setParsedRows([])
          return
        }
        const rows = parseRows(results.data)
        if (rows.length === 0) {
          setParseError("No data rows found in the CSV file.")
          setParsedRows([])
          return
        }
        const hasAnyName = rows.some((r) => r.fullName.length > 0)
        if (!hasAnyName) {
          setParseError('Required column "fullName" was not found. Check that your CSV headers match the template.')
          setParsedRows([])
          return
        }
        setParsedRows(rows)
      },
      error: (err) => {
        setParseError(`Failed to read file: ${err.message}`)
        setParsedRows([])
      },
    })
  }

  async function handleImport() {
    if (!parsedRows.length || !accessToken) return
    setIsImporting(true)
    setImportError(null)

    try {
      const res = await fetch(`/api/v1/weddings/${weddingId}/guests/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ guests: parsedRows }),
      })
      const json: ApiResponse<ImportGuestsResponseDTO> = await res.json()
      if (!json.success) {
        setImportError(json.error.message)
        return
      }
      setImportResult(json.data)
      if (json.data.importedCount > 0) onImported()
    } catch {
      setImportError("An unexpected error occurred. Please try again.")
    } finally {
      setIsImporting(false)
    }
  }

  function downloadSample() {
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Guests from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your guest list. Required column: <strong>fullName</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sample template download */}
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <span className="text-sm text-muted-foreground">Need a template?</span>
            <Button variant="ghost" size="sm" onClick={downloadSample}>
              <Download className="mr-1.5 size-4" />
              Download sample CSV
            </Button>
          </div>

          {/* File drop zone */}
          {!importResult && (
            <div
              className="flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed px-4 py-6 transition-colors hover:border-primary/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-8 text-muted-foreground" />
              {fileName ? (
                <p className="text-sm font-medium">{fileName}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Click to select a .csv file</p>
              )}
              {parsedRows.length > 0 && (
                <Badge variant="secondary">{parsedRows.length} rows ready to import</Badge>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {parseError && <p className="text-sm text-danger">{parseError}</p>}

          {/* Row preview */}
          {parsedRows.length > 0 && !importResult && (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Preview (first 3 rows)
              </p>
              <div className="overflow-auto rounded-md border text-xs">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-medium">Name</th>
                      <th className="px-2 py-1.5 text-left font-medium">Phone</th>
                      <th className="px-2 py-1.5 text-left font-medium">Guests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 3).map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-2 py-1.5">
                          {row.fullName || <span className="text-danger">missing</span>}
                        </td>
                        <td className="px-2 py-1.5">{row.phoneNumber ?? "—"}</td>
                        <td className="px-2 py-1.5">{row.numberOfAllowedGuests}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  …and {parsedRows.length - 3} more rows
                </p>
              )}
            </div>
          )}

          {importError && <p className="text-sm text-danger">{importError}</p>}

          {/* Import results */}
          {importResult && (
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 rounded-md bg-success/10 px-3 py-2 text-center">
                  <p className="text-2xl font-bold text-success">{importResult.importedCount}</p>
                  <p className="text-xs text-muted-foreground">Imported</p>
                </div>
                {importResult.failedCount > 0 && (
                  <div className="flex-1 rounded-md bg-danger/10 px-3 py-2 text-center">
                    <p className="text-2xl font-bold text-danger">{importResult.failedCount}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                )}
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
          )}

          <Separator />

          <div className="flex justify-between">
            {importResult ? (
              <>
                <Button variant="outline" onClick={handleReset}>
                  Import Another
                </Button>
                <Button onClick={() => handleClose(false)}>Done</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => handleClose(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={parsedRows.length === 0 || isImporting}
                >
                  {isImporting
                    ? "Importing…"
                    : parsedRows.length > 0
                      ? `Import ${parsedRows.length} Guests`
                      : "Import"}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
