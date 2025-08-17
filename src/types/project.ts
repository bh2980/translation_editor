import type { TranslationStatus, TranslationEntry } from "./translation"
import type { Profile } from "./profile"
import type { GlossaryTerm } from "./glossary"
import type { AIAgentSettings, APIUsageRecord } from "./ai"

export type Project = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  sourceLang: string
  targetLang: string
  statuses: TranslationStatus[]
  entries: TranslationEntry[]
  profiles: Profile[]
  glossary: GlossaryTerm[]
  aiAgent: AIAgentSettings
  columnMapping?: { key: string; source: string; target?: string; status?: string }
  apiUsage?: APIUsageRecord[]
  dashboardWidgets?: import("./dashboard").DashboardWidget[]
}

