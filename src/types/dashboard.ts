export type DashboardWidget = {
  id: string
  type: "translation-progress" | "api-usage" | "recent-activity" | "glossary-stats"
  title: string
  enabled: boolean
  position: number
}

