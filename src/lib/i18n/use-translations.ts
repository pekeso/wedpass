"use client"

import { useLanguage } from "./language-context"
import { en, type TranslationKey } from "./translations/en"
import { fr } from "./translations/fr"

const dictionaries = { en, fr }

export function useTranslations() {
  const { language } = useLanguage()
  const dict = dictionaries[language]

  function t(key: TranslationKey, params?: Record<string, string | number>): string {
    let str: string = dict[key] ?? en[key] ?? key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(`{${k}}`, String(v))
      }
    }
    return str
  }

  return { t, language }
}
