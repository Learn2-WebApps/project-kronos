'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEchoStore } from '@/store/echo-store';
import { useInterviewStore } from '@/store/interview-store';
import { usePlayerStore } from '@/store/player-store';

export default function EchoPage() {
  const router = useRouter();
  const { messages, isLoading, error, sendToEcho, resetEcho } = useEchoStore();
  const { collectedClues, loadCatalog } = useInterviewStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);
  
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    const clueIds = collectedClues.map(c => c.id);
    sendToEcho(trimmed, clueIds);
    setInput('');
  };
  
  return (
    <div className="flex h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden font-[var(--font-main)]">
      {/* 상단 바 */}
      <header className="fixed top-0 left-0 right-0 h-[56px] border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 backdrop-blur-md z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[var(--text-secondary)] hover:text-white transition-colors">
            ← 목록으로
          </Link>
          <div className="h-4 w-[1px] bg-[var(--border-subtle)]" />
          <h1 className="font-bold flex items-center gap-2 text-[var(--accent-amber)] uppercase tracking-tighter">
            ECHO <span className="text-[var(--text-muted)] font-normal text-xs uppercase tracking-widest ml-1">Analytical Support</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/inventory" className="text-[var(--text-secondary)] hover:text-[var(--accent-amber)] transition-colors text-sm">
            📋 추리 노트
          </Link>
          <button 
            onClick={() => { if(confirm('대화 기록을 초기화하시겠습니까?')) resetEcho(); }}
            className="text-[var(--text-muted)] hover:text-red-400 transition-colors text-xs uppercase tracking-widest font-[var(--font-mono)]"
          >
            Reset
          </button>
        </div>
      </header>
      
      <main className="flex flex-1 pt-[56px]">
        {/* 좌측: ECHO 일러스트 & 상태 */}
        <div className="w-2/5 relative bg-gradient-to-br from-[#1a1a1a] to-black border-r border-[var(--border-subtle)] flex flex-col items-center justify-center p-12">
          {/* 글로우 효과 */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,165,116,0.05)_0%,transparent_70%)]" />
          
          <div className="relative w-full aspect-square max-w-[300px] mb-8 animate-pulse-slow">
            <Image src="/characters/echo.png" alt="ECHO" fill className="object-contain" priority />
          </div>
          
          <div className="relative z-10 w-full max-w-[300px] space-y-4">
            <div className="p-4 bg-black/40 border border-[var(--border-subtle)] rounded-sm">
              <span className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2 font-[var(--font-mono)]">System Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-bold font-[var(--font-mono)] text-green-500/80 uppercase">Active // Online</span>
              </div>
            </div>
            
            <div className="p-4 bg-black/40 border border-[var(--border-subtle)] rounded-sm">
              <span className="block text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2 font-[var(--font-mono)]">Data Context</span>
              <div className="flex justify-between items-end">
                <span className="text-2xl font-bold font-[var(--font-mono)]">{collectedClues.length}</span>
                <span className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-widest">Clues Found</span>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-8 left-8 right-8 text-[10px] text-[var(--text-muted)] font-[var(--font-mono)] uppercase tracking-[0.2em] leading-relaxed">
            ECHO Analytic Assistant // NovaTech Ethics Investigation Division // V1.0.42
          </div>
        </div>
        
        {/* 우측: 채팅창 */}
        <div className="w-3/5 flex flex-col bg-[var(--bg-base)] relative">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[var(--text-muted)]">
                <div className="w-12 h-12 rounded-full border border-[var(--border-subtle)] flex items-center justify-center mb-6 text-xl">?</div>
                <p className="mb-2 italic font-[var(--font-serif)] text-lg text-[var(--text-secondary)]">
                  "확보된 단서를 분석하고 가설을 검증하는 데 도움을 드릴 수 있습니다."
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {['지금까지 알아낸 걸 정리해줘', '정민호의 알리바이는?', '오세라와 정민호의 관계'].map(hint => (
                    <button 
                      key={hint}
                      onClick={() => setInput(hint)}
                      className="text-[10px] uppercase tracking-widest border border-[var(--border-subtle)] px-3 py-1.5 rounded-full hover:border-[var(--accent-amber)] hover:text-[var(--accent-amber)] transition-all"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] p-4 rounded-sm transition-all duration-300 ${
                    msg.role === 'user' 
                      ? 'bg-[var(--accent-amber)] text-black rounded-tr-none shadow-lg shadow-amber-900/10' 
                      : 'bg-[#1a1a1a] border border-[var(--border-subtle)] font-[var(--font-serif)] leading-relaxed rounded-tl-none'
                  }`}
                >
                  <p className="text-sm md:text-base whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#1a1a1a] border border-[var(--border-subtle)] p-4 rounded-sm rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[var(--accent-amber)] rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-[var(--accent-amber)] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-[var(--accent-amber)] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 text-red-200 text-sm rounded-sm">
                {error}
              </div>
            )}
            
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
              className="relative flex gap-4"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="ECHO에게 질문하거나 수사 방향을 상의하세요..."
                disabled={isLoading}
                className="flex-1 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-sm p-4 min-h-[60px] max-h-[150px] resize-none focus:outline-none focus:border-[var(--accent-amber)] transition-colors disabled:opacity-50 text-sm md:text-base"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-6 bg-[var(--accent-amber)] text-black font-bold rounded-sm hover:opacity-90 transition-all disabled:opacity-30 disabled:grayscale uppercase tracking-widest text-xs"
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
