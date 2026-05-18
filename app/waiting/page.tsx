'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { usePlayerStore } from '@/store/player-store';
import { watchSession } from '@/lib/firestore-session';

export default function WaitingPage() {
  const router = useRouter();
  const { sessionCode, hasSubmitted } = usePlayerStore();

  useEffect(() => {
    if (!sessionCode) {
      router.replace('/entry');
      return;
    }
    if (!hasSubmitted) {
      router.replace('/');
      return;
    }

    const unsubscribe = watchSession(sessionCode, (session) => {
      if (session?.status === 'revealed') {
        router.replace('/result');
      }
    });

    return () => unsubscribe();
  }, [sessionCode, hasSubmitted, router]);

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col items-center justify-center p-8 relative overflow-hidden font-[var(--font-main)]">
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 border-4 border-dashed border-[var(--accent-amber)] rounded-full animate-spin [animation-duration:8s]"></div>
          <Image src="/characters/echo.png" alt="ECHO" fill className="object-contain p-4 opacity-80" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4 tracking-widest text-[var(--accent-amber)] uppercase font-[var(--font-mono)]">
          Evaluation in Progress
        </h1>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          답안 제출이 완료되었습니다.<br/>
          강사가 정답을 공개할 때까지 대기해주십시오.
        </p>
      </div>
    </main>
  );
}
