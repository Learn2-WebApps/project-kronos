'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useClueStore } from '@/store/clue-store';
import InventoryModal from './InventoryModal';

/**
 * 우상단에 고정되어 추리 노트를 열 수 있는 버튼 컴포넌트입니다.
 */
export default function InventoryButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const collectedCount = useClueStore(s => s.collected.length);

  // 제외 경로 처리
  const excludedPaths = ['/entry', '/admin'];
  if (excludedPaths.some(path => pathname.startsWith(path))) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-zinc-900/90 border border-zinc-700 rounded-lg shadow-xl hover:bg-zinc-800 hover:border-zinc-500 transition-all group"
      >
        <div className="text-amber-500 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
        </div>
        <span className="text-[11px] font-bold text-zinc-100 uppercase tracking-widest">
          추리 노트
        </span>
        <div className="h-4 w-px bg-zinc-700 mx-1" />
        <span className="text-[11px] font-mono font-bold text-amber-500">
          {collectedCount} / 46
        </span>
      </button>

      {isOpen && <InventoryModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
