'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { watchSubmissions, getSession } from '@/lib/firestore-session';
import { ensureAuth, db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Session, Submission } from '@/types/game';
import { CHARACTERS, CharacterId } from '@/lib/character-assets';
import { CORRECT_ANSWER } from '@/lib/correct-answer';

export default function SessionDetailPage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('admin-token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }

    // 초기 세션 상태 로드
    getSession(params.code).then(s => {
      setSession(s);
      setLoading(false);
    });

    // 실시간 제출 목록 로드
    const unsubscribe = watchSubmissions(params.code, (subs) => {
      setSubmissions(subs.sort((a, b) => b.submittedAt - a.submittedAt));
    });

    return () => unsubscribe();
  }, [params.code, router]);

  const handleReveal = async () => {
    if (!confirm('정답을 공개하시겠습니까? 공개 후에는 모든 학습자의 화면이 결과 페이지로 강제 전환됩니다.')) return;
    
    setRevealing(true);
    try {
      const token = sessionStorage.getItem('admin-token');
      // 1) 관리자 인증 확인
      const authRes = await fetch(`/api/admin/sessions/${params.code}/reveal`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!authRes.ok) throw new Error('관리자 인증에 실패했습니다.');
      
      // 2) 익명 로그인 보장
      await ensureAuth();

      // 3) 클라이언트에서 직접 status 변경
      const sessionRef = doc(db, 'sessions', params.code);
      await updateDoc(sessionRef, {
        status: 'revealed',
        revealedAt: serverTimestamp(),
      });
      
      setSession(prev => prev ? { ...prev, status: 'revealed' } : null);
      alert('정답이 공개되었습니다. 학습자 화면이 자동 전환됩니다.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRevealing(false);
    }
  };

  const getCharName = (id: string) => CHARACTERS[id as CharacterId]?.name || id;

  if (loading) return <div className="min-h-screen bg-[var(--bg-base)] text-white p-8">Loading...</div>;
  if (!session) return <div className="min-h-screen bg-[var(--bg-base)] text-white p-8">Session not found.</div>;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] p-8 md:p-16 font-[var(--font-main)]">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-end border-b border-[var(--border-subtle)] pb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--accent-amber)] uppercase tracking-widest font-[var(--font-mono)] flex items-center gap-4">
              Session #{session.code}
              <span className={`px-3 py-1 text-xs font-bold rounded-sm ${session.status === 'open' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                {session.status}
              </span>
            </h1>
            <p className="text-[var(--text-secondary)] mt-2 text-lg">{session.title}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => router.push('/admin')} className="px-4 py-2 border border-[var(--border-subtle)] hover:bg-white/5 transition-colors rounded-sm text-sm">
              목록으로
            </button>
            <button 
              onClick={handleReveal}
              disabled={session.status === 'revealed' || revealing}
              className="px-6 py-2 bg-[var(--accent-amber)] text-black font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-30 rounded-sm text-sm"
            >
              {revealing ? '...' : session.status === 'revealed' ? '공개 완료됨' : '정답 공개'}
            </button>
          </div>
        </header>

        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold">제출 현황 <span className="text-[var(--text-muted)] ml-2">({submissions.length}명)</span></h2>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center p-12 text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-sm">
              아직 제출한 학습자가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submissions.map(sub => (
                <div key={sub.userUid} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{sub.name} <span className="text-sm text-[var(--text-muted)] font-normal ml-2">{sub.department}</span></h3>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{new Date(sub.submittedAt).toLocaleTimeString()}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl bg-black border-2 border-white text-white">
                      {sub.evaluation?.grade || '?'}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-black/20 p-3 rounded-sm text-sm space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-muted)]">Q1. 가해자:</span>
                        <span className="font-bold">
                          {getCharName(sub.answer.culprit)}{' '}
                          {sub.answer.culprit === CORRECT_ANSWER.culprit ? 
                            <span className="text-green-500">✓</span> : <span className="text-red-500">✗</span>}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-muted)]">Q2. 협력자:</span>
                        <span className="font-bold">
                          {getCharName(sub.answer.accomplice)}{' '}
                          {sub.answer.accomplice === CORRECT_ANSWER.accomplice ? 
                            <span className="text-green-500">✓</span> : <span className="text-red-500">✗</span>}
                        </span>
                      </div>
                    </div>

                    {sub.evaluation ? (
                      <div className="grid grid-cols-2 gap-2 text-sm bg-black/30 p-3 rounded-sm">
                        <div>
                          <span className="text-[var(--text-muted)]">등급:</span>{' '}
                          <span className="text-[var(--accent-amber)] font-bold">
                            {sub.evaluation.grade}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)]">총점:</span>{' '}
                          {sub.evaluation.totalScore}/100
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)]">범인:</span>{' '}
                          {sub.evaluation.breakdown?.culpritScore ?? 0}/40
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)]">협력자:</span>{' '}
                          {sub.evaluation.breakdown?.accompliceScore ?? 0}/20
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)]">단서:</span>{' '}
                          {sub.evaluation.breakdown?.clueScore ?? 0}/40
                        </div>
                        <div>
                          <span className="text-[var(--text-muted)]">소요시간:</span>{' '}
                          {Math.floor((sub.evaluation.stats?.playDurationSec ?? 0) / 60)}분
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-[var(--text-muted)] bg-black/30 p-3 rounded-sm italic">
                        평가 대기 중...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
