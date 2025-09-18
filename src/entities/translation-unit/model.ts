import type { LanguageCode } from "@/shared/constants/language-codes";

export type TranslationUnit = {
  id?: number;
  projectId: number;
  key: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  target?: string;
  statusId?: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
};

