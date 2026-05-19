import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Message } from '@/types/game';

interface EchoState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  briefingShown: boolean;
  isModalOpen: boolean;
  sendToEcho: (userInput: string, collectedClueIds: string[]) => Promise<void>;
  resetEcho: () => void;
  showBriefing: () => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useEchoStore = create<EchoState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      error: null,
      briefingShown: false,
      isModalOpen: false,
      
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
            // @ts-ignore
            clueIds: data.clueIds,
          };
          
          set(s => ({ messages: [...s.messages, aiMsg], isLoading: false }));
        } catch (err: any) {
          set({ isLoading: false, error: err.message ?? 'ECHO와 통신 실패' });
        }
      },
      
      resetEcho: () => set({ messages: [], error: null, briefingShown: false }),

      showBriefing: () => {
        if (get().briefingShown) return;
        
        const briefingMsg: Message = {
          id: `briefing-${Date.now()}`,
          role: 'assistant',
          content: `반갑습니다. 저는 노바테크 윤리 조사실의 AI 분석 보조 시스템 에코입니다.

이번 사건은 노바테크 내부에서 발생한 부당한 인사 조작 의혹 건입니다. 한지훈 상무가 부당한 징계를 받았다는 제보가 접수되었습니다. 당신은 조사관으로서 사건과 연관된 인물들을 신문하며 모순점을 찾아 진실을 밝혀내야 합니다.

자유롭게 질문해 주십시오. 사건 상세, 용의자 정보, 조사 방향 등 무엇이든 도와드리겠습니다.

각 인물에 대해 더 자세히 알고 싶으시면 이름을 말씀해 주십시오.`,
          timestamp: Date.now(),
          // @ts-ignore - isBriefing 플래그 추가
          isBriefing: true,
        };
        
        set(s => ({ 
          messages: [...s.messages, briefingMsg], 
          briefingShown: true,
          isModalOpen: true 
        }));
      },

      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false }),
    }),
    {
      name: 'kronos-echo-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        messages: state.messages, 
        briefingShown: state.briefingShown 
      }),
    }
  )
);
