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

