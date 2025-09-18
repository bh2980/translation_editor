import type { LanguageCode } from "@/shared/constants/language-codes";

export type Status = {
  id: string;
  name: string;
  color: string;
};

export type Entry = {
  id: string;
  key: string;
  source: string;
  target: string;
  meta?: Record<string, unknown>;
  statusId: string;
  projectId?: number;
  targetLang?: LanguageCode;
  unitId?: number;
};
