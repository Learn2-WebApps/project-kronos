'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useInterviewStore } from '@/store/interview-store';
import { CHARACTERS, type CharacterId } from '@/lib/character-assets';
import type { ClueMetadata, ClueCategory } from '@/lib/clue-catalog';

const CATEGORY_COLORS: Record<ClueCategory, { bg: string; label: string; text: string }> = {
  F: { bg: '#6b6660', label: '사실', text: '#fff' },
  L: { bg: '#c9483d', label: '거짓', text: '#fff' },
  T: { bg: '#5a8cc9', label: '진술', text: '#fff' },
  RH: { bg: '#d4a574', label: '함정', text: '#000' },
  KEY: { bg: '#8b6f47', label: '핵심', text: '#fff' },
};

export default function InventoryPage() {
  const router = useRouter();
  const { clueCatalog, collectedClues, loadCatalog } = useInterviewStore();
  const [activeTab, setActiveTab] = useState<CharacterId | 'all' | 'common'>('all');
  
  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);
  
  const collectedIds = new Set(collectedClues.map(c => c.id));
  const totalCount = clueCatalog.length;
  const foundCount = collectedIds.size;
  const percentage = totalCount > 0 ? Math.round((foundCount / totalCount) * 100) : 0;
  
  const filterClues = (clues: ClueMetadata[]) => {
    if (activeTab === 'all') return clues;
    if (activeTab === 'common') return clues.filter(c => !c.characterId);
    return clues.filter(c => c.characterId === activeTab);
  };
  
  const visibleClues = filterClues(clueCatalog);
  
  return (
    <div className="min-h-screen inventory-theme font-[var(--font-serif)] p-8 lg:p-16 relative overflow-x-hidden">
      {/* 종이 질감 오버레이 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"></div>
      
      {/* 상단 헤더 */}
      <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight">추리 노트</h1>
          <p className="text-[#6b6660] font-[var(--font-main)] text-sm">확보된 모든 단서와 진술을 기록합니다.</p>
        </div>
        
        <div className="flex items-center gap-8 bg-black/5 p-4 rounded-sm border border-black/10 backdrop-blur-sm">
          <div className="text-center">
            <span className="block text-xs uppercase tracking-widest text-[#6b6660] font-[var(--font-mono)] mb-1">Coverage</span>
            <span className="text-2xl font-bold font-[var(--font-mono)]">{percentage}%</span>
          </div>
          <div className="h-10 w-[1px] bg-black/10" />
          <div className="text-center">
            <span className="block text-xs uppercase tracking-widest text-[#6b6660] font-[var(--font-mono)] mb-1">Clues</span>
            <span className="text-2xl font-bold font-[var(--font-mono)]">{foundCount} / {totalCount}</span>
          </div>
          <button 
            onClick={() => router.back()}
            className="ml-4 w-10 h-10 flex items-center justify-center rounded-full bg-black text-white hover:bg-[#c9483d] transition-colors"
          >
            ✕
          </button>
        </div>
      </header>
      
      {/* 탭 네비게이션 */}
      <nav className="relative z-10 flex flex-wrap gap-2 mb-8 border-b border-black/10 pb-4">
        {[
          { id: 'all', label: '전체' },
          { id: 'han-jihun', label: '한지훈' },
          { id: 'kang-hyerin', label: '강혜린' },
          { id: 'oh-sera', label: '오세라' },
          { id: 'jung-minho', label: '정민호' },
          { id: 'yoon-seokyung', label: '윤서경' },
          { id: 'common', label: '공통' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2 text-sm font-bold transition-all rounded-sm ${
              activeTab === tab.id 
                ? 'bg-black text-[#ede4d5] shadow-lg' 
                : 'text-black/60 hover:text-black hover:bg-black/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      
      {/* 단서 그리드 */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleClues.map(clue => {
          const isFound = collectedIds.has(clue.id);
          const cat = CATEGORY_COLORS[clue.category];
          
          return (
            <ClueCard 
              key={clue.id} 
              clue={clue} 
              isFound={isFound} 
              cat={cat} 
            />
          );
        })}
      </div>
      
      {/* 우하단 에코 버튼 */}
      <Link 
        href="/echo"
        className="fixed bottom-12 right-12 z-20 group"
      >
        <div className="relative w-24 h-24 rounded-full border-4 border-black bg-white shadow-2xl overflow-hidden transition-transform group-hover:scale-110 active:scale-95">
          <Image src="/characters/echo.png" alt="ECHO" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
        <div className="absolute -top-2 -left-2 bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
          Consult Echo
        </div>
      </Link>
    </div>
  );
}

function ClueCard({ clue, isFound, cat }: { clue: ClueMetadata; isFound: boolean; cat: { bg: string; label: string; text: string } }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!isFound) {
    return (
      <div className="p-6 bg-black/5 border border-dashed border-black/20 rounded-sm opacity-60 grayscale">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b6660] font-[var(--font-mono)]">
            {clue.id}
          </span>
          <span className="w-1 h-1 rounded-full bg-black/20" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b6660] font-[var(--font-mono)]">
            Locked
          </span>
        </div>
        <div className="h-6 w-3/4 bg-black/10 rounded-sm animate-pulse" />
      </div>
    );
  }
  
  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`p-6 bg-white border border-black/10 rounded-sm shadow-sm transition-all cursor-pointer hover:shadow-md hover:translate-y-[-2px] ${
        expanded ? 'ring-2 ring-black/5 md:col-span-2' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span 
            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest font-[var(--font-mono)]"
            style={{ backgroundColor: cat.bg, color: cat.text }}
          >
            {cat.label}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b6660] font-[var(--font-mono)]">
            {clue.id}
          </span>
        </div>
        {expanded && <span className="text-xs text-[#6b6660]">▲</span>}
        {!expanded && <span className="text-xs text-[#6b6660]">▼</span>}
      </div>
      
      <h3 className="text-xl font-bold mb-2 leading-tight">{clue.name}</h3>
      
      {expanded ? (
        <div className="mt-4 pt-4 border-t border-black/5">
          <p className="text-[#3a3a3a] leading-relaxed text-base italic mb-4">
            "{clue.content}"
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-black/5 px-3 py-1.5 rounded-sm">
              <span className="block text-[9px] uppercase tracking-widest text-[#6b6660] mb-1">Source</span>
              <span className="text-xs font-bold">{clue.characterId || 'Common'}</span>
            </div>
            {clue.truthValue && (
              <div className="bg-black/5 px-3 py-1.5 rounded-sm">
                <span className="block text-[9px] uppercase tracking-widest text-[#6b6660] mb-1">Truth Value</span>
                <span className={`text-xs font-bold ${clue.truthValue === '거짓' ? 'text-[#c9483d]' : ''}`}>
                  {clue.truthValue}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#6b6660] line-clamp-1 italic">
          "{clue.content}"
        </p>
      )}
    </div>
  );
}
