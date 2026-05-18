'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePlayerStore } from '@/store/player-store';
import { useInterviewStore } from '@/store/interview-store';
import { useEchoStore } from '@/store/echo-store';
import { ensureAuth } from '@/lib/firebase';
import { validateSession, getSession, getSubmission } from '@/lib/firestore-session';

export default function EntryPage() {
  const router = useRouter();
  const { setPlayerInfo } = usePlayerStore();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.length !== 4) {
      setError('입장코드 4자리를 입력해주세요.');
      return;
    }
    if (!name.trim() || !department.trim()) {
      setError('이름과 소속 부서를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const isValid = await validateSession(code);
      if (!isValid) {
        setError('유효하지 않거나 닫힌 세션입니다.');
        setLoading(false);
        return;
      }

      const user = await ensureAuth();
      if (!user) {
        throw new Error('인증에 실패했습니다.');
      }

      const session = await getSession(code);
      const existingSub = await getSubmission(code, user.uid);
      
      const player = usePlayerStore.getState();
      const isSameLearner = 
        player.sessionCode === code &&
        player.name === name &&
        player.department === department;

      if (!isSameLearner) {
        // 새 학습자 → 모든 게임 상태 초기화
        useInterviewStore.getState().resetGame();
        useEchoStore.getState().resetEcho?.();
      }

      if (existingSub) {
        setPlayerInfo({ sessionCode: code, name, department });
        usePlayerStore.getState().markSubmitted();
        router.push('/result');
        return;
      }

      setPlayerInfo({ sessionCode: code, name, department });
      
      if (session?.status === 'revealed') {
        router.push('/result');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || '입장 처리 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-[var(--font-main)] flex items-center justify-center relative overflow-hidden">
      {/* 그레인 오버레이 */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      
      {/* 비네팅 */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>

      <div className="z-10 w-full max-w-md p-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-sm shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-widest text-[var(--accent-amber)] uppercase font-[var(--font-mono)] mb-2">
            Project KRONOS
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">NovaTech Ethics Investigation Division</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-200 text-sm text-center rounded-sm">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-[var(--font-mono)]">Session Code</label>
            <input 
              type="text" 
              maxLength={4}
              value={code}
              onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="4자리 숫자"
              className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-sm p-3 focus:outline-none focus:border-[var(--accent-amber)] transition-colors text-center text-xl tracking-widest font-[var(--font-mono)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-[var(--font-mono)]">Investigator Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="이름"
              className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-sm p-3 focus:outline-none focus:border-[var(--accent-amber)] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-[var(--font-mono)]">Department</label>
            <input 
              type="text" 
              value={department}
              onChange={e => setDepartment(e.target.value)}
              placeholder="소속 부서"
              className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-sm p-3 focus:outline-none focus:border-[var(--accent-amber)] transition-colors"
            />
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              * 동일한 정보로 입장하시면 이전 진행 상황이 유지됩니다.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 w-full bg-[var(--accent-amber)] text-black font-bold py-3 rounded-sm hover:opacity-90 transition-opacity uppercase tracking-widest text-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter System'}
          </button>
          
          <Link 
            href="/admin/login" 
            className="admin-page-link"
          >
            관리자 페이지
          </Link>
        </form>
      </div>
    </main>
  );
}
