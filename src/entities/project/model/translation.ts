export type TranslationStatus = {
  id: string
  name: string
  color: string // token from palette
  order: number
}

export type TranslationEntry = {
  id: string
  key: string
  source: string
  target: string
  statusId: string
  notes?: string
  meta?: Record<string, any>
}

