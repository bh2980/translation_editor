import type { TranslationEntry } from "../translate/types";
import type { Profile } from "../profiles/types";
import type { GlossaryTerm } from "../glossary/types";
import type { AIAgentSettings, APIUsageRecord } from "../ai/types";

export type Project = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  sourceLang: string;
  targetLang: string;
  statuses: TranslationStatus[];
  entries: TranslationEntry[];
  profiles: Profile[];
  glossary: GlossaryTerm[];
  aiAgent: AIAgentSettings;
  columnMapping?: { key: string; source: string; target?: string; status?: string };
  apiUsage?: APIUsageRecord[];
  dashboardWidgets?: DashboardWidget[];
};

export type TranslationStatus = {
  id: string;
  name: string;
  color: string; // token from palette
  order: number;
};

export type DashboardWidget = {
  id: string;
  type: "translation-progress" | "api-usage" | "recent-activity" | "glossary-stats";
  title: string;
  enabled: boolean;
  position: number;
};
