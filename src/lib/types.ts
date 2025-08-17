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

export type Profile = {
  id: string
  name: string
  role: string
  voice: string
  description: string
}

export type GlossaryTerm = {
  id: string
  source: string
  target: string
  notes?: string
}

export type AIProvider = "openai" | "xai" | "claude" | "gemini" | "local"

export type AIAgentSettings = {
  provider: AIProvider
  apiKey: string
  apiEndpoint?: string // For local LLM
  model: string
  promptTemplate: string
}

export type APIUsageRecord = {
  id: string
  timestamp: number
  provider: AIProvider
  model: string
  inputTokens: number
  outputTokens: number
  cost?: number // estimated cost in USD
}

export type DashboardWidget = {
  id: string
  type: "translation-progress" | "api-usage" | "recent-activity" | "glossary-stats"
  title: string
  enabled: boolean
  position: number
}

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
  dashboardWidgets?: DashboardWidget[]
}

export type ParsedRow = Record<string, any>
