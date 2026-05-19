'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useEchoStore } from '@/store/echo-store';
import { useInterviewStore } from '@/store/interview-store';

export default function EchoModal() {
  const { messages, isLoading, error, sendToEcho, isModalOpen, closeModal } = useEchoStore();
  const { collectedClues } = useInterviewStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeModal]);

  if (!isModalOpen) return null;

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || trimmed.length > 200) return;
    const clueIds = collectedClues.map(c => c.id);
    sendToEcho(trimmed, clueIds);
    setInput('');
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleOutsideClick}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-[600px] h-[80vh] bg-[var(--bg-base)] border border-[var(--border-subtle)] flex flex-col shadow-2xl overflow-hidden animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 relative rounded-full overflow-hidden border border-[var(--accent-amber)]/50">
              <Image src="/characters/echo.png" alt="ECHO" fill className="object-cover" />
            </div>
            <h2 className="font-bold text-[var(--accent-amber)] uppercase tracking-widest text-sm">
              ECHO <span className="text-[var(--text-muted)] font-normal text-[10px] ml-1">Analytical Support</span>
            </h2>
          </div>
          <button 
            onClick={closeModal}
            className="text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </header>

        {/* 메시지 영역 */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth bg-[radial-gradient(circle_at_center,rgba(212,165,116,0.03)_0%,transparent_70%)]"
        >
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[90%] p-4 rounded-sm transition-all duration-300 ${
                  msg.role === 'user' 
                    ? 'bg-[var(--accent-amber)] text-black rounded-tr-none shadow-lg' 
                    : 'bg-[#1a1a1a] border border-[var(--border-subtle)] font-[var(--font-serif)] leading-relaxed rounded-tl-none'
                } ${
                  // @ts-ignore
                  msg.isBriefing ? 'bg-[var(--bg-card)] border-double border-4' : ''
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

        {/* 입력 영역 */}
        <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          {error && (
            <div className="mb-4 p-2 bg-red-900/50 border border-red-500/50 text-red-200 text-xs rounded-sm">
              {error}
            </div>
          )}
          
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="relative"
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
              placeholder="질문이나 수사 방향을 입력하세요 (200자)..."
              disabled={isLoading}
              maxLength={200}
              className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-sm p-4 pr-16 min-h-[60px] max-h-[120px] resize-none focus:outline-none focus:border-[var(--accent-amber)] transition-colors disabled:opacity-50 text-sm"
            />
            <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
              <span className={`text-[10px] font-[var(--font-mono)] ${input.length >= 180 ? 'text-[var(--accent-amber)]' : 'text-[var(--text-muted)]'}`}>
                {input.length}/200
              </span>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute bottom-4 right-4 text-[var(--accent-amber)] hover:text-white disabled:opacity-30 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
