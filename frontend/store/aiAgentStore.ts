import { create } from "zustand";

interface AIAgentState {
  isActive: boolean;
  toggleActive: () => void;
  setActive: (active: boolean) => void;
}

export const useAIAgentStore = create<AIAgentState>((set) => ({
  isActive: false,
  toggleActive: () => set((state) => ({ isActive: !state.isActive })),
  setActive: (active) => set({ isActive: active }),
}));
