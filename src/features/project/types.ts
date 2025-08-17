import type { TranslationStatus } from "./settings/types"
import type { TranslationEntry } from "./translate/types"
import type { Profile } from "./profiles/types"
import type { GlossaryTerm } from "./glossary/types"
import type { AIAgentSettings, APIUsageRecord } from "./ai-agent/types"

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
  dashboardWidgets?: import("./dashboard/types").DashboardWidget[]
}

