import { create } from "zustand";
import type { Project, GenerationProgress } from "@/types";

interface ProjectState {
  currentProject: Project | null;
  generationProgress: GenerationProgress[];
  isGenerating: boolean;
  previewCode: string;
  deviceView: "desktop" | "tablet" | "mobile";

  setCurrentProject: (project: Project | null) => void;
  addProgress: (progress: GenerationProgress) => void;
  clearProgress: () => void;
  setIsGenerating: (val: boolean) => void;
  setPreviewCode: (code: string) => void;
  setDeviceView: (view: "desktop" | "tablet" | "mobile") => void;
}

export const useProjectStore = create<ProjectState>()((set) => ({
  currentProject: null,
  generationProgress: [],
  isGenerating: false,
  previewCode: "",
  deviceView: "desktop",

  setCurrentProject: (project) => set({ currentProject: project }),

  addProgress: (progress) =>
    set((state) => ({
      generationProgress: [...state.generationProgress, progress],
    })),

  clearProgress: () => set({ generationProgress: [] }),

  setIsGenerating: (val) => set({ isGenerating: val }),

  setPreviewCode: (code) => set({ previewCode: code }),

  setDeviceView: (view) => set({ deviceView: view }),
}));
