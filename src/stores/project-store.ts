import { Project } from "@/features/project/types";
import { loadProject, saveProject } from "@/lib/storage";
import { create } from "zustand";

type ProjectState = {
  project: Project | null;
  isLoading: boolean;
  load: (id: string) => void;
  set: (p: Project | null, persist?: boolean) => void;
  update: (updater: (p: Project) => Project) => void;
  clear: () => void;
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  isLoading: false,
  load: (id: string) => {
    set({ isLoading: true });
    const p = loadProject(id);
    set({ project: p ?? null, isLoading: false });
  },
  set: (p, persist = true) => {
    if (p && persist) saveProject(p);
    set({ project: p });
  },
  update: (updater) => {
    const current = get().project;
    if (!current) return;
    const next = updater({ ...current });
    next.updatedAt = Date.now();
    saveProject(next);
    set({ project: next });
  },
  clear: () => set({ project: null }),
}));
