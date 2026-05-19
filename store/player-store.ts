import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PlayerState {
  sessionCode: string | null;
  name: string | null;
  department: string | null;
  learnerId: string | null;
  startedAt: number | null;
  hasSubmitted: boolean;
  setPlayerInfo: (info: { sessionCode: string; name: string; department: string; learnerId?: string }) => void;
  markSubmitted: () => void;
  clear: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      sessionCode: null,
      name: null,
      department: null,
      learnerId: null,
      startedAt: null,
      hasSubmitted: false,
      setPlayerInfo: (info) => set({
        ...info,
        startedAt: Date.now(),
        hasSubmitted: false,
      }),
      markSubmitted: () => set({ hasSubmitted: true }),
      clear: () => set({
        sessionCode: null,
        name: null,
        department: null,
        learnerId: null,
        startedAt: null,
        hasSubmitted: false,
      }),
    }),
    {
      name: 'kronos-player',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
