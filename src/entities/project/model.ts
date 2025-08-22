import { LanguageCodeSchema } from "@/shared/constants/language-codes";
import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.number(),
  createdAt: z.number(),
  name: z.string(),
  updatedAt: z.number(),
  sourceLang: LanguageCodeSchema.optional(),
  targetLang: LanguageCodeSchema.optional(),
});

export type Project = z.infer<typeof ProjectSchema>;
