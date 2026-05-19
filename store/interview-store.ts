import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CharacterId } from '@/lib/character-assets';
import type { Message, Emotion, Clue } from '@/types/game';
import { fetchClueCatalog } from '@/lib/clue-client';
import type { ClueMetadata } from '@/lib/clue-catalog';
import { useClueStore } from './clue-store';

export const MAX_TURNS_PER_CHARACTER = 10;

interface InterviewState {
  characterId: CharacterId | null;
  messages: Partial<Record<CharacterId, Message[]>>;
  turnsUsed: number; // 전역 카운터 (통계용으로 유지)
  currentEmotion: Emotion;
  collectedClues: Clue[];
  toastQueue: Clue[];
  isLoading: boolean;
  error: string | null;
  
  // 캐릭터별 누적 턴 수
  characterTurns: Partial<Record<CharacterId, number>>;
  
  // 단서 카탈로그 (메타데이터 조회용)
  clueCatalog: ClueMetadata[];
  loadCatalog: () => Promise<void>;
  
  startInterview: (characterId: CharacterId) => void;
  sendMessage: (userInput: string) => Promise<any>;
  dismissToast: (clueId: string) => void;
  resetInterview: () => void;
  resetGame: () => void;
  
  // 헬퍼
  isUnlocked: (characterId: CharacterId) => boolean;
  getTurnsLeft: (characterId: CharacterId) => number;
  isCharacterExhausted: (characterId: CharacterId) => boolean;
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      characterId: null,
      messages: {},
      turnsUsed: 0,
      currentEmotion: 'normal',
      collectedClues: [],
      toastQueue: [],
      isLoading: false,
      error: null,
      characterTurns: {},
      clueCatalog: [],
      
      loadCatalog: async () => {
        if (get().clueCatalog.length > 0) return;
        try {
          const catalog = await fetchClueCatalog();
          set({ clueCatalog: catalog });
        } catch (err: any) {
          console.error('[store] loadCatalog error:', err);
        }
      },

      isUnlocked: (characterId) => {
        const state = get();
        if (characterId === 'han-jihun') return true;
        return (state.characterTurns['han-jihun'] ?? 0) >= 1;
      },

      getTurnsLeft: (characterId) => {
        return MAX_TURNS_PER_CHARACTER - (get().characterTurns[characterId] ?? 0);
      },

      isCharacterExhausted: (characterId) => {
        return (get().characterTurns[characterId] ?? 0) >= MAX_TURNS_PER_CHARACTER;
      },

      startInterview: (characterId) => set({
        characterId,
        currentEmotion: 'normal',
        error: null,
      }),
      
      sendMessage: async (userInput) => {
        const state = get();
        const cid = state.characterId;
        if (!cid || state.isLoading) return;
        
        // 해당 캐릭터의 턴 한도 체크
        const currentTurns = state.characterTurns[cid] ?? 0;
        if (currentTurns >= MAX_TURNS_PER_CHARACTER) return;
        
        const userMessage: Message = {
          id: `u-${Date.now()}`,
          role: 'user',
          content: userInput,
          timestamp: Date.now(),
        };
        
        const prevMessages = state.messages[cid] || [];
        
        set(s => ({ 
          messages: {
            ...s.messages,
            [cid]: [...prevMessages, userMessage]
          },
          isLoading: true,
          error: null,
        }));
        
        try {
          const collectedClueIds = useClueStore.getState().getCollectedIds();

          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              characterId: cid,
              messages: prevMessages,
              userInput,
              collectedClueIds,
            }),
          });
          
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error ?? 'API 호출 실패');
          }
          
          const data = await res.json();
          
          const aiMessage: Message = {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: data.content,
            emotion: data.emotion,
            timestamp: Date.now(),
          };
          
          const newClues: Clue[] = data.clueIds
            .filter((id: string) => !get().collectedClues.some(c => c.id === id))
            .map((id: string) => ({
              id,
              text: id,
              foundAt: Date.now(),
              characterId: cid,
            }));
          
          set(s => {
            const currentMessages = s.messages[cid] || [];
            return {
              messages: {
                ...s.messages,
                [cid]: [...currentMessages, aiMessage]
              },
              currentEmotion: data.emotion,
              turnsUsed: s.turnsUsed + 1,
              collectedClues: [...s.collectedClues, ...newClues],
              toastQueue: [...s.toastQueue, ...newClues],
              isLoading: false,
              characterTurns: {
                ...s.characterTurns,
                [cid]: (s.characterTurns[cid] ?? 0) + 1,
              },
            };
          });
          return data;
        } catch (err: any) {
          set({ 
            isLoading: false, 
            error: err.message ?? 'AI 응답을 받지 못했습니다. 다시 시도해주세요.',
          });
          return null;
        }
      },
      
      dismissToast: (clueId) => set(s => ({
        toastQueue: s.toastQueue.filter(c => c.id !== clueId),
      })),
      
      resetInterview: () => set({
        characterId: null,
        currentEmotion: 'normal',
        error: null,
      }),

      resetGame: () => set({
        characterId: null,
        messages: {},
        turnsUsed: 0,
        currentEmotion: 'normal',
        collectedClues: [],
        toastQueue: [],
        error: null,
        characterTurns: {},
      }),
    }),
    {
      name: 'kronos-interview-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        characterId: state.characterId,
        messages: state.messages,
        turnsUsed: state.turnsUsed,
        currentEmotion: state.currentEmotion,
        collectedClues: state.collectedClues,
        characterTurns: state.characterTurns,
      }),
    }
  )
);
