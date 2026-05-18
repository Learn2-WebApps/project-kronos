import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Message } from '@/types/game';

interface EchoState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendToEcho: (userInput: string, collectedClueIds: string[]) => Promise<void>;
  resetEcho: () => void;
}

export const useEchoStore = create<EchoState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      error: null,
      
      sendToEcho: async (userInput, collectedClueIds) => {
        const state = get();
        if (state.isLoading) return;
        
        const userMsg: Message = {
          id: `u-${Date.now()}`,
          role: 'user',
          content: userInput,
          timestamp: Date.now(),
        };
        
        set({ messages: [...state.messages, userMsg], isLoading: true, error: null });
        
        try {
          const res = await fetch('/api/echo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: state.messages,
              userInput,
              collectedClueIds,
            }),
          });
          
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error ?? 'ECHO 응답 실패');
          }
          
          const data = await res.json();
          
          const aiMsg: Message = {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: data.content,
            timestamp: Date.now(),
          };
          
          set(s => ({ messages: [...s.messages, aiMsg], isLoading: false }));
        } catch (err: any) {
          set({ isLoading: false, error: err.message ?? 'ECHO와 통신 실패' });
        }
      },
      
      resetEcho: () => set({ messages: [], error: null }),
    }),
    {
      name: 'kronos-echo-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);
