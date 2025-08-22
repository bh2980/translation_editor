export const LANGUAGE_CODE_LIST = ["en", "ja", "ko"] as const;

export type LanguageCode = (typeof LANGUAGE_CODE_LIST)[number];

export const LANGUAGE_CODE_MAP: Record<LanguageCode, string> = {
  en: "영어",
  ja: "일본어",
  ko: "한국어",
};

import { z } from "zod";

export const LanguageCodeSchema = z.enum(LANGUAGE_CODE_LIST);
