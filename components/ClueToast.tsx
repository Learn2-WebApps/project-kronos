'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useClueStore } from '@/store/clue-store';
import { getClueById } from '@/lib/clue-catalog';

/**
 * 신규 단서 획득 시 우상단에 표시되는 알림 토스트 컴포넌트입니다.
 */
export default function ClueToast() {
  const pathname = usePathname();
  const collected = useClueStore(s => s.collected);
  const markAsRead = useClueStore(s => s.markAsRead);
  const [queue, setQueue] = useState<string[]>([]);

  // 신규 단서(isNew)가 발생하면 큐에 추가
  useEffect(() => {
    const newOnes = collected
      .filter(c => c.isNew)
      .map(c => c.id);
      
    if (newOnes.length > 0) {
      setQueue(q => {
        // 이미 큐에 있거나 처리 중인 단서는 제외
        const filtered = newOnes.filter(id => !q.includes(id));
        return [...q, ...filtered];
      });
    }
  }, [collected]);

  // 큐의 첫 번째 단서를 순차적으로 표시
  useEffect(() => {
    if (queue.length === 0) return;
    
    const currentId = queue[0];
    
    // 3.5초 후 표시 종료 및 읽음 처리
    const timer = setTimeout(() => {
      markAsRead(currentId);
      setQueue(q => q.slice(1));
    }, 3500);
    
    return () => clearTimeout(timer);
  }, [queue, markAsRead]);

  // 제외 경로 처리
  const HIDDEN_PATHS = ['/entry', '/admin'];
  const isHidden = HIDDEN_PATHS.some(p => pathname?.startsWith(p));
  if (isHidden) return null;

  if (queue.length === 0) return null;
  
  const currentClue = getClueById(queue[0]);
  if (!currentClue) return null;

  return (
    <div className="fixed top-32 right-4 z-[60] w-80 pointer-events-none">
      <div className="animate-slide-in-right rounded-lg border border-amber-500/40 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                📋 New Clue Acquired
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                [{currentClue.id}]
              </span>
            </div>
            <div className="text-sm font-bold text-zinc-100 mb-1">
              {currentClue.title}
            </div>
            <div className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
              {currentClue.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
