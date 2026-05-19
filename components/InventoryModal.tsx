'use client';

import { useEffect, useRef, useState } from 'react';
import { useClueStore } from '@/store/clue-store';
import { CLUE_CATALOG, getClueById, canDeriveKey4 } from '@/lib/clue-catalog';
import { CHARACTERS, CharacterId } from '@/lib/character-assets';
import { useEchoStore } from '@/store/echo-store';

interface InventoryModalProps {
  onClose: () => void;
}

type TabId = 'all' | CharacterId | 'key';

export default function InventoryModal({ onClose }: InventoryModalProps) {
  const { collected } = useClueStore();
  const { openModal: openEcho } = useEchoStore();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [selectedClueId, setSelectedClueId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const collectedIds = collected.map(c => c.id);
  
  // 현재 탭에 해당하는 단서들 필터링
  const getVisibleClues = () => {
    const allClues = Object.values(CLUE_CATALOG);
    if (activeTab === 'all') return allClues;
    if (activeTab === 'key') return allClues.filter(c => c.type === 'KEY');
    return allClues.filter(c => c.owners.includes(activeTab));
  };

  const visibleClues = getVisibleClues();
  const selectedClue = selectedClueId ? getClueById(selectedClueId) : null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      onClick={handleOutsideClick}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-5xl h-[85vh] bg-[#0c0c0c] border border-zinc-800 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-amber-500 uppercase tracking-[0.3em] font-[var(--font-serif)]">
              Investigation Notes
            </h2>
            <div className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-400 font-mono">
              CONFIDENTIAL // {collected.length} / 46
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* 좌측 사이드바 (탭) */}
          <aside className="w-56 border-r border-zinc-800 bg-[#0f0f0f] p-4 flex flex-col gap-1">
            <TabButton 
              id="all" label="전체 기록" active={activeTab === 'all'} 
              onClick={() => setActiveTab('all')} 
            />
            <div className="my-2 h-px bg-zinc-800" />
            <TabButton 
              id="key" label="결정적 단서" active={activeTab === 'key'} 
              onClick={() => setActiveTab('key')} 
              icon="💎"
            />
            <div className="my-2 h-px bg-zinc-800" />
            {(Object.entries(CHARACTERS) as [CharacterId, any][]).map(([id, info]) => (
              <TabButton 
                key={id} id={id} label={info.name} active={activeTab === id} 
                onClick={() => setActiveTab(id)} 
              />
            ))}
          </aside>

          {/* 메인 리스트 영역 */}
          <main className="flex-1 overflow-y-auto p-8 bg-[url('/textures/paper-dark.png')] bg-repeat">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleClues.map((clue) => {
                const isCollected = collectedIds.includes(clue.id);
                return (
                  <div 
                    key={clue.id}
                    onClick={() => isCollected && setSelectedClueId(clue.id)}
                    className={`
                      relative p-4 rounded-sm border transition-all
                      ${isCollected 
                        ? 'cursor-pointer border-zinc-700 bg-zinc-900/40 hover:border-amber-500/50 hover:bg-zinc-800/60 shadow-lg' 
                        : 'border-zinc-800/50 bg-black/20 opacity-40 grayscale'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${getTypeColor(clue.type)}`}>
                        {clue.type}
                      </span>
                      {isCollected && (
                        <span className="text-[10px] text-zinc-600 font-mono">#{clue.id}</span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-zinc-200 mb-1 line-clamp-1">
                      {isCollected ? clue.title : '??????'}
                    </div>
                    {!isCollected && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 특수 섹션: KEY-4 분석 제안 */}
            {activeTab === 'key' && !collectedIds.includes('KEY-4') && (
              <div className="mt-12 p-8 border-2 border-dashed border-zinc-800 rounded-lg flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-700">
                  <span className="text-2xl grayscale opacity-50">💎</span>
                </div>
                <h3 className="text-lg font-bold text-zinc-400 mb-2">내부 유출자 정보 분석 중...</h3>
                <p className="text-sm text-zinc-500 max-w-md mb-6">
                  티타니아 신제품 정보(F-26), 정민호의 권한(F-27), 오세라의 누설(L-06) 중 2개 이상의 단서를 확보하면 ECHO가 정보를 종합 분석할 수 있습니다.
                </p>
                {canDeriveKey4(collectedIds) ? (
                  <button 
                    onClick={() => { onClose(); openEcho(); }}
                    className="px-6 py-3 bg-amber-600 text-white font-bold rounded-sm hover:bg-amber-500 transition-colors shadow-xl animate-pulse"
                  >
                    ECHO에 분석 요청하기
                  </button>
                ) : (
                  <button disabled className="px-6 py-3 bg-zinc-800 text-zinc-600 font-bold rounded-sm cursor-not-allowed">
                    단서 부족 (분석 불가)
                  </button>
                )}
              </div>
            )}
          </main>

          {/* 우측 상세 패널 */}
          <aside className={`
            w-80 border-l border-zinc-800 bg-[#0a0a0a] flex flex-col transition-transform duration-300
            ${selectedClue ? 'translate-x-0' : 'translate-x-full absolute right-0 top-0 bottom-0'}
          `}>
            {selectedClue && (
              <div className="flex-1 p-8 flex flex-col">
                <div className="mb-6 flex justify-between items-center">
                  <span className={`text-xs font-mono px-2 py-1 rounded ${getTypeColor(selectedClue.type)}`}>
                    {selectedClue.type} CATEGORY
                  </span>
                  <button 
                    onClick={() => setSelectedClueId(null)}
                    className="text-zinc-600 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-4 leading-tight font-[var(--font-serif)]">
                  {selectedClue.title}
                </h3>
                <div className="h-px bg-zinc-800 mb-6" />
                <div className="flex-1 text-zinc-300 leading-relaxed space-y-4">
                  <p className="text-lg italic text-zinc-400">"{selectedClue.content}"</p>
                </div>
                <div className="mt-auto pt-8 space-y-3">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest border-t border-zinc-900 pt-4">Metadata</div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600">ID</span>
                    <span className="text-zinc-400 font-mono">{selectedClue.id}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600">Source</span>
                    <span className="text-zinc-400">
                      {collected.find(c => c.id === selectedClue.id)?.source === 'echo' 
                        ? 'ECHO Analysis' 
                        : CHARACTERS[collected.find(c => c.id === selectedClue.id)?.source as CharacterId]?.name ?? 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600">Level</span>
                    <span className="text-zinc-400">{'★'.repeat(selectedClue.level)}</span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function TabButton({ id, label, active, onClick, icon }: { id: string, label: string, active: boolean, onClick: () => void, icon?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full text-left px-4 py-3 text-sm transition-all rounded-sm flex items-center gap-2
        ${active 
          ? 'bg-amber-500 text-black font-bold shadow-[0_4px_12px_rgba(217,119,6,0.2)]' 
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}
      `}
    >
      {icon && <span className={active ? 'grayscale-0' : 'grayscale'}>{icon}</span>}
      {label}
    </button>
  );
}

function getTypeColor(type: string) {
  switch (type) {
    case 'F': return 'bg-blue-900/50 text-blue-300 border border-blue-800/50';
    case 'L': return 'bg-red-900/50 text-red-300 border border-red-800/50';
    case 'KEY': return 'bg-amber-900/50 text-amber-300 border border-amber-800/50';
    case 'RH': return 'bg-zinc-800 text-zinc-400 border border-zinc-700';
    case 'T': return 'bg-purple-900/50 text-purple-300 border border-purple-800/50';
    default: return 'bg-zinc-800 text-zinc-300';
  }
}
