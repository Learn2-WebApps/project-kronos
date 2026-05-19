'use client';

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CHARACTERS, getCharacterImage, getCharacterOrder, CharacterId } from "@/lib/character-assets";
import { useInterviewStore, MAX_TURNS_PER_CHARACTER } from "@/store/interview-store";
import { usePlayerStore } from "@/store/player-store";
import { useEchoStore } from "@/store/echo-store";

export default function Home() {
  const router = useRouter();
  const { isUnlocked, characterTurns, isCharacterExhausted } = useInterviewStore();
  const { sessionCode, name, department, hasSubmitted } = usePlayerStore();
  const { briefingShown, showBriefing } = useEchoStore();
  
  const order = getCharacterOrder();
  const hasStartedTutorial = isUnlocked('kang-hyerin'); // 한지훈과 1턴 이상 대화 시 해제됨

  // 자동 브리핑 트리거
  useEffect(() => {
    if (sessionCode && !hasSubmitted && !briefingShown) {
      showBriefing();
    }
  }, [sessionCode, hasSubmitted, briefingShown, showBriefing]);

  useEffect(() => {
    if (!sessionCode) {
      router.replace('/entry');
    } else if (hasSubmitted) {
      router.replace('/result');
    }
  }, [sessionCode, hasSubmitted, router]);

  if (!sessionCode) return null;

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-[var(--font-main)] relative overflow-hidden flex flex-col items-center p-8 lg:p-16">
      {/* 그레인 오버레이 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      
      {/* 비네팅 */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>

      <header className="z-10 w-full max-w-7xl flex flex-col md:flex-row md:justify-between items-center mb-12 gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--accent-amber)] uppercase font-[var(--font-mono)]">
          Project KRONOS <span className="text-[var(--text-muted)] ml-2 text-sm font-normal">v4.4 System Active</span>
        </h1>
        <div className="text-sm font-[var(--font-mono)] text-[var(--text-secondary)] bg-black/40 px-4 py-2 border border-[var(--border-subtle)] rounded-sm">
          {name} | {department} | Session: {sessionCode}
        </div>
      </header>

      <div className="z-10 w-full max-w-7xl">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-bold mb-2">용의자 선택</h2>
            <p className="text-[var(--text-secondary)] mb-4">조사할 캐릭터를 선택하여 인터뷰를 시작하십시오.</p>
            
            {!hasStartedTutorial && (
              <div className="tutorial-hint p-3 bg-amber-900/20 border border-amber-500/30 rounded-sm text-sm inline-block">
                먼저 <strong style={{ color: CHARACTERS['han-jihun'].color }}>한지훈</strong>과 대화하여 사건의 개요를 파악하세요.
              </div>
            )}
          </div>
          
          {hasStartedTutorial && (
            <Link 
              href="/submit"
              className="px-6 py-3 bg-[var(--accent-amber)] text-black font-bold uppercase tracking-widest text-sm rounded-sm hover:opacity-90 transition-opacity mb-4"
            >
              최종 답안 제출하기
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 h-[600px]">
          {order.map((id) => {
            const character = CHARACTERS[id];
            const unlocked = isUnlocked(id);
            const turns = characterTurns[id] || 0;
            const exhausted = isCharacterExhausted(id);

            const cardContent = (
              <>
                <div className={`turn-badge ${exhausted ? 'completed' : ''}`}>
                  {turns} / {MAX_TURNS_PER_CHARACTER}
                </div>
                <Image
                  src={getCharacterImage.background(id)}
                  alt={character.name}
                  fill
                  className={`object-cover transition-transform duration-500 ${unlocked && !exhausted ? 'group-hover:scale-105' : ''}`}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.9)] via-[rgba(10,10,10,0.3)] to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <div 
                    className="w-12 h-1 mb-3" 
                    style={{ backgroundColor: character.color }}
                  />
                  <h3 className="text-2xl font-bold mb-1">{character.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)] font-[var(--font-serif)]">{character.role}</p>
                </div>
                {!unlocked && (
                  <div className="lock-overlay">
                    <div className="lock-icon">🔒</div>
                    <div className="lock-message">한지훈과 먼저 대화하세요</div>
                  </div>
                )}
                {exhausted && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 px-4 py-2 border border-white/20 rounded-sm text-[10px] uppercase tracking-[0.2em] font-bold text-white/60 pointer-events-none z-30">
                    Interview Ended
                  </div>
                )}
                {unlocked && !exhausted && (
                  <div 
                    className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--accent-amber)] opacity-0 group-hover:opacity-40 transition-all duration-300 pointer-events-none"
                  />
                )}
              </>
            );

            if (unlocked) {
              return (
                <Link
                  key={id}
                  href={`/interview/${id}`}
                  className={`suspect-select-card relative group cursor-pointer overflow-hidden rounded-sm border border-[var(--border-subtle)] transition-all duration-300 ${!exhausted ? 'hover:translate-y-[-8px] hover:shadow-[0_0_32px_rgba(212,165,116,0.2)]' : 'exhausted opacity-70'}`}
                  data-character={id}
                >
                  {cardContent}
                </Link>
              );
            } else {
              return (
                <div
                  key={id}
                  className="suspect-select-card locked relative group overflow-hidden rounded-sm border border-[var(--border-subtle)] transition-all duration-300"
                  data-character={id}
                >
                  {cardContent}
                </div>
              );
            }
          })}
        </div>
      </div>

      <footer className="z-10 mt-16 flex justify-between w-full max-w-7xl text-[var(--text-muted)] text-sm font-[var(--font-mono)]">
        <span>SYSTEM READY // PHASE 4 ACTIVE: EVALUATION SYSTEM ENABLED</span>
      </footer>

      <Link 
        href="/admin/login" 
        className="admin-entry-link"
      >
        Instructor Access
      </Link>
      </main>
      );
      }
