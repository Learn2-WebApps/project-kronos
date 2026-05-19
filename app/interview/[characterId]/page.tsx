'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CHARACTERS, getCharacterImage, CharacterId } from '@/lib/character-assets';
import { useInterviewStore, MAX_TURNS_PER_CHARACTER } from '@/store/interview-store';
import { usePlayerStore } from '@/store/player-store';
import { useClueStore } from '@/store/clue-store';
import { syncClueToFirestore } from '@/lib/firestore-clue';
import { getCluesByOwner } from '@/lib/clue-catalog';

export default function InterviewPage({ params }: { params: { characterId: string } }) {
  const router = useRouter();
  const characterId = params.characterId as CharacterId;
  const charInfo = CHARACTERS[characterId];

  const {
    messages: allMessages,
    characterTurns,
    currentEmotion,
    isLoading,
    error,
    isUnlocked,
    startInterview,
    sendMessage,
    isCharacterExhausted,
  } = useInterviewStore();
  
  const { addClues, collected } = useClueStore();
  const { sessionCode, learnerId } = usePlayerStore();

  const messages = allMessages[characterId] || [];
  const currentTurns = characterTurns[characterId] || 0;
  const isExhausted = isCharacterExhausted(characterId);

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 캐릭터별 보유 단서 수 계산 (인디케이터용)
  const myClues = getCluesByOwner(characterId);
  const collectedFromMe = collected.filter(c => c.source === characterId).length;

  // 캐릭터 유효성 검사 및 초기화
  useEffect(() => {
    if (!charInfo) {
      router.replace('/');
      return;
    }
    
    // 잠금 상태 검증: URL 직접 입력으로 우회 시도 차단
    if (!isUnlocked(characterId)) {
      alert('먼저 한지훈과 대화해주세요.');
      router.replace('/');
      return;
    }

    startInterview(characterId);
  }, [characterId, charInfo, router, startInterview, isUnlocked]);

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!charInfo) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || isExhausted) return;
    const currentInput = input;
    setInput('');
    
    const data = await sendMessage(currentInput);
    
    if (data && data.clueIds && data.clueIds.length > 0) {
      const newOnes = addClues(data.clueIds, characterId);
      if (sessionCode && learnerId) {
        newOnes.forEach(id => syncClueToFirestore(sessionCode, learnerId, id, characterId));
      }
    }
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
          <h1 className="font-bold flex items-center gap-2">
            <span style={{ color: charInfo.color }}>●</span>
            {charInfo.name}
            <span className="text-[var(--text-muted)] font-normal text-sm">{charInfo.role}</span>
          </h1>
          <div className="ml-4 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-[10px] text-zinc-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            수집된 단서: <span className="text-amber-500 font-bold">{collectedFromMe} / {myClues.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-[var(--font-mono)]">Interview</span>
            <span className={`font-bold font-[var(--font-mono)] ${isExhausted ? 'text-red-500' : 'text-[var(--accent-amber)]'}`}>
              {currentTurns} / {MAX_TURNS_PER_CHARACTER}
            </span>
          </div>
        </div>
      </header>

      {/* 메인 레이아웃 */}
      <main className="flex flex-1 pt-[56px]">
        {/* 좌측: 캐릭터 일러스트 */}
        <div className="w-1/2 relative bg-gradient-to-b from-[var(--bg-elevated)] to-black flex items-end justify-center overflow-hidden">
          {/* 캐릭터 컬러 후광 */}
          <div 
            className="absolute bottom-0 w-[120%] h-[60%] blur-[120px] opacity-20 pointer-events-none"
            style={{ backgroundColor: charInfo.color }}
          />
          
          <div className="relative w-full h-[90%] transition-opacity duration-300">
            <Image
              src={getCharacterImage.expression(characterId, currentEmotion)}
              alt={charInfo.name}
              fill
              priority
              className="object-contain object-bottom transition-opacity duration-300"
            />
          </div>

          {/* 비네팅/그레인 */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-50" />
        </div>

        {/* 우측: 채팅창 */}
        <div className="w-1/2 flex flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-base)] relative">
          {/* 메시지 영역 */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
          >
            {messages.length === 0 && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[var(--text-muted)]">
                <p className="mb-2 italic font-[var(--font-serif)] text-lg">&quot;무엇이든 물어보십시오. 조사가 시작되었습니다.&quot;</p>
                <p className="text-xs uppercase tracking-widest">Awaiting interaction</p>
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
                      ? 'bg-[var(--accent-amber)] text-black rounded-tr-none' 
                      : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] font-[var(--font-serif)] leading-relaxed rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 rounded-sm rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 입력 영역 */}
          <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 text-red-200 text-sm rounded-sm flex justify-between items-center">
                <span>{error}</span>
              </div>
            )}

            {isExhausted && (
              <div className="mb-4 p-3 bg-amber-900/20 border border-amber-500/30 text-amber-200 text-xs rounded-sm">
                이 인물과의 대화 기회를 모두 사용했습니다. (10/10) <br/>
                이전 대화 내용은 계속 열람할 수 있습니다.
              </div>
            )}
            
            <form onSubmit={handleSend} className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isExhausted ? "대화 한도 도달 - 더 이상 질문할 수 없습니다" : `${charInfo.name}에게 질문을 입력하세요...`}
                disabled={isLoading || isExhausted}
                maxLength={200}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-sm p-4 pr-24 min-h-[80px] max-h-[200px] resize-none focus:outline-none focus:border-[var(--accent-amber)] transition-colors disabled:opacity-50"
              />
              <div className="absolute top-2 right-4 flex flex-col items-end gap-1">
                <span className={`text-[10px] font-[var(--font-mono)] ${input.length >= 180 ? 'text-[var(--accent-amber)]' : 'text-[var(--text-muted)]'}`}>
                  {input.length} / 200
                </span>
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading || isExhausted}
                className="absolute bottom-4 right-4 px-4 py-2 bg-[var(--accent-amber)] text-black font-bold rounded-sm hover:opacity-90 transition-opacity disabled:opacity-30 disabled:grayscale"
              >
                {isLoading ? '...' : '전송'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
