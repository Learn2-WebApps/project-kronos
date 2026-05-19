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

이번 사건은 노바테크 내부에서 발생한 부당한 인사 조작 의혹에 관한 건입니다. 최근 주요 인사 결정 과정에서 특정 인물에게 유리하거나 불리한 조치가 취해졌다는 제보가 접수되었습니다. 당신은 조사관으로서 사건과 연관된 인물들을 신문하며 숨겨진 진실을 찾아내야 합니다. 현재로서는 모든 가능성이 열려 있으니 인물들의 진술에서 모순점을 찾아내는 데 집중해 주시기 바랍니다.

조사 대상은 한지훈 상무와 가까이 있던 4명입니다.

강혜린 인사팀장 — 이번 인사 조치를 직접 실행한 인물입니다. 익명의 제보를 받고 절차를 진행했다고 합니다.

윤서경 마케팅본부장 — 한지훈 상무의 징계로 공석이 된 자리를 차지했습니다. 입사 이후 한지훈 상무와 갈등이 잦았다는 사내 평이 있습니다.

정민호 기획팀장 — 한지훈 상무와 가장 많은 시간을 함께한 핵심 측근으로, 가장 두터운 신임을 받아왔습니다.

오세라 (경쟁사 티타니아 임원) — 최근 노바테크 신제품과 매우 유사한 제품 출시로 표절 의혹이 제기되고 있는 경쟁사의 임원입니다.

모든 인물이 동등한 용의선상에 있습니다. 진술의 모순점을 찾는 데 집중하십시오. 누구부터 조사하시겠습니까?`,
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
      name: 'kronos-echo-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ messages: state.messages, briefingShown: state.briefingShown }),
    }
  )
);
