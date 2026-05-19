import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CollectedClue {
  id: string;              // 단서 ID
  collectedAt: number;     // 타임스탬프
  source: string;          // 캐릭터 ID 또는 'echo'
  isNew: boolean;          // 토스트 표시 후 false
}

interface ClueState {
  collected: CollectedClue[];
  addClues: (ids: string[], source: string) => string[]; // 신규 추가된 ID만 반환
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  hasClue: (id: string) => boolean;
  getCollectedIds: () => string[];
  reset: () => void;
}

export const useClueStore = create<ClueState>()(
  persist(
    (set, get) => ({
      collected: [],
      addClues: (ids, source) => {
        const existing = new Set(get().collected.map(c => c.id));
        const newOnes = ids.filter(id => !existing.has(id));
        
        if (newOnes.length === 0) return [];
        
        const additions = newOnes.map(id => ({
          id,
          collectedAt: Date.now(),
          source,
          isNew: true,
        }));
        
        set({ collected: [...get().collected, ...additions] });
        return newOnes;
      },
      markAsRead: (id) =>
        set({ 
          collected: get().collected.map(c => 
            c.id === id ? { ...c, isNew: false } : c
          ) 
        }),
      markAllAsRead: () =>
        set({ 
          collected: get().collected.map(c => ({ ...c, isNew: false })) 
        }),
      hasClue: (id) => get().collected.some(c => c.id === id),
      getCollectedIds: () => get().collected.map(c => c.id),
      reset: () => set({ collected: [] }),
    }),
    { 
      name: 'kronos-clue-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
