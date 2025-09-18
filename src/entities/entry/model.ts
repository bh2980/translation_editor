export type Data = {
  id?: number;
  projectId: number;
  key: string;
  source: string;
  meta?: Record<string, unknown>;
  rawData?: unknown;
  createdAt: number;
  updatedAt: number;
};
