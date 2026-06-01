"use client"

import { useState, useEffect, useRef } from "react"
import type { LocalGuest } from "@/types/shared"
import { searchGuests } from "@/lib/offline/guests/guest-search"

export function useLocalGuestSearch(weddingId: string) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<LocalGuest[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const found = await searchGuests(weddingId, query)
        setResults(found)
      } finally {
        setIsSearching(false)
      }
    }, 150)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, weddingId])

  return { query, setQuery, results, isSearching }
}
