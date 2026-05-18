'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/player-store';
import { useInterviewStore } from '@/store/interview-store';
import { getSubmission, getSession } from '@/lib/firestore-session';
import { CHARACTERS, CharacterId } from '@/lib/character-assets';
import type { Submission } from '@/types/game';
import { ensureAuth } from '@/lib/firebase';

export default function ResultPage() {
  const router = useRouter();
  const { sessionCode, clear } = usePlayerStore();
  const { resetGame, loadCatalog } = useInterviewStore();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    async function loadData() {
      if (!sessionCode) {
        router.replace('/entry');
        return;
      }
      
      try {
        const user = await ensureAuth();
        if (!user) throw new Error('인증 정보 없음');

        const session = await getSession(sessionCode);
        if (session?.status !== 'revealed') {
          router.replace('/waiting');
          return;
        }

        const sub = await getSubmission(sessionCode, user.uid);
        if (!sub) throw new Error('제출 기록을 찾을 수 없습니다.');
        
        setSubmission(sub);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sessionCode, router]);

  const handleRestart = () => {
    if(confirm('모든 기록을 초기화하고 다시 시작하시겠습니까?')) {
      clear();
      resetGame();
      router.replace('/entry');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#ede4d5] text-[#2a2520] font-[var(--font-serif)]">수사 결과 처리 중...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-black text-red-500 p-8 text-center">{error}</div>;
  if (!submission) return null;

  const { evaluation, answer, playDuration } = submission;
  const gradeColors = {
    S: 'bg-yellow-500',
    A: 'bg-blue-500',
    B: 'bg-green-600',
    C: 'bg-orange-500',
    D: 'bg-red-600'
  };

  const CORRECT_ANSWER = {
    culprit: 'jung-minho',
    accomplice: 'oh-sera',
  };

  const isCulpritCorrect = answer.culprit === CORRECT_ANSWER.culprit;
  const isAccompliceCorrect = answer.accomplice === CORRECT_ANSWER.accomplice;

  return (
    <div className="min-h-screen bg-[#ede4d5] text-[#2a2520] font-[var(--font-serif)] p-4 md:p-8 lg:p-16 relative">
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"></div>
      
      <div className="max-w-4xl mx-auto relative z-10 bg-white shadow-2xl p-6 md:p-12 border border-[#c0b8a8] rounded-sm">
        {/* 헤더 */}
        <header className="flex flex-col md:flex-row justify-between items-start border-b-2 border-black pb-6 mb-10 gap-4">
          <div>
            <div className="text-[10px] font-[var(--font-mono)] tracking-[0.3em] text-[#6b6660] mb-2 uppercase">NovaTech Ethics Investigation Division // Final Report</div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">심문 결과 분석 보고서</h1>
          </div>
          <div className="text-right text-xs md:text-sm font-[var(--font-main)] space-y-1">
            <p><strong>조사관:</strong> {submission.name}</p>
            <p><strong>소속:</strong> {submission.department}</p>
            <p><strong>세션:</strong> #{sessionCode}</p>
          </div>
        </header>

        {/* 종합 판정 섹션 */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-black/5 p-8 border border-black/10 rounded-sm">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-2">종합 평가</h2>
            <p className="text-[#6b6660] text-sm leading-relaxed">
              귀하의 추리 정확도와 수사 기여도를 종합한 최종 결과입니다. <br/>
              본 보고서는 노바테크 감사팀의 공식 기록으로 보존됩니다.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center relative">
            <div className={`w-32 h-32 rounded-full ${gradeColors[evaluation.grade]} text-white flex items-center justify-center text-6xl font-black shadow-xl transform -rotate-12 border-4 border-white z-10 animate-bounce-short`}>
              {evaluation.grade}
            </div>
            <div className="mt-4 text-center">
              <span className="text-3xl font-black font-[var(--font-mono)] text-black/80">{evaluation.totalScore}</span>
              <span className="text-sm font-bold text-[#6b6660] ml-1">/ 100</span>
            </div>
          </div>
        </section>

        {/* 채점 상세 내역 */}
        <section className="mb-12">
          <h2 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-black rounded-full" />
            Scoring Breakdown
          </h2>
          <div className="space-y-6">
            <ScoreBar label="범인 지목 (Culprit)" score={evaluation.breakdown.culpritScore} max={40} color="bg-black" />
            <ScoreBar label="협력자 식별 (Accomplice)" score={evaluation.breakdown.accompliceScore} max={20} color="bg-black" />
            <ScoreBar label="단서 수집 (Clue Collection)" score={evaluation.breakdown.clueScore} max={40} color="bg-[#5a8cc9]" />
          </div>
        </section>

        {/* 정답 공개 영역 */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#f9f7f2] p-6 border border-black/5 rounded-sm">
            <h3 className="text-xs font-black text-[#6b6660] uppercase mb-4 tracking-widest">Your Findings</h3>
            <ul className="space-y-4 font-[var(--font-main)]">
              <li className="flex items-center justify-between">
                <span className="text-sm text-[#6b6660]">가해자:</span>
                <span className="font-bold flex items-center gap-2">
                  {CHARACTERS[answer.culprit as CharacterId]?.name}
                  {isCulpritCorrect ? <span className="text-green-600 text-lg">✓</span> : <span className="text-red-500 text-lg">✗</span>}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm text-[#6b6660]">협력자:</span>
                <span className="font-bold flex items-center gap-2">
                  {CHARACTERS[answer.accomplice as CharacterId]?.name}
                  {isAccompliceCorrect ? <span className="text-green-600 text-lg">✓</span> : <span className="text-red-500 text-lg">✗</span>}
                </span>
              </li>
            </ul>
          </div>
          <div className="bg-black text-[#ede4d5] p-6 rounded-sm shadow-xl">
            <h3 className="text-xs font-black text-white/40 uppercase mb-4 tracking-widest">Canonical Truth</h3>
            <ul className="space-y-4 font-[var(--font-main)]">
              <li className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-sm opacity-60">정답 범인:</span>
                <span className="font-bold text-[var(--accent-amber)]">정민호 (기획팀장)</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm opacity-60">정답 협력자:</span>
                <span className="font-bold text-[var(--accent-amber)]">오세라 (티타니아 부사장)</span>
              </li>
            </ul>
          </div>
        </section>

        {/* AI 심사평 */}
        <section className="mb-12">
          <h2 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-black rounded-full" />
            AI Analytical Support
          </h2>
          <div className="italic text-lg leading-relaxed bg-[#fff8ee] p-8 border-l-8 border-[#8b6f47] shadow-inner font-[var(--font-serif)] text-[#3a3a3a]">
            "{evaluation.aiCommentary}"
          </div>
        </section>

        {/* 통계 섹션 */}
        <section className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="총 심문 횟수" value={`${evaluation.stats.totalTurns}회`} />
          <StatBox label="단서 확보" value={`${evaluation.stats.cluesCollected} / ${evaluation.stats.totalClues}`} />
          <StatBox label="수사 시간" value={`${Math.floor(playDuration / 60)}분 ${playDuration % 60}초`} />
          <StatBox label="수사 정확도" value={`${isCulpritCorrect && isAccompliceCorrect ? '100%' : isCulpritCorrect ? '60%' : '0%'}`} />
        </section>

        {/* 액션 버튼 */}
        <div className="flex flex-col md:flex-row justify-center gap-4 mt-16 print:hidden">
          <button 
            onClick={() => window.print()}
            className="px-10 py-3 border-2 border-black font-black hover:bg-black hover:text-white transition-all rounded-sm uppercase tracking-widest text-xs"
          >
            Print Full Report
          </button>
          <button 
            onClick={handleRestart}
            className="px-10 py-3 bg-[#8b6f47] text-white font-black hover:bg-[#6b5535] transition-all rounded-sm shadow-lg uppercase tracking-widest text-xs"
          >
            Restart Investigation
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0) rotate(-12deg); }
          50% { transform: translateY(-10px) rotate(-12deg); }
        }
        .animate-bounce-short {
          animation: bounce-short 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function ScoreBar({ label, score, max, color }: { label: string, score: number, max: number, color: string }) {
  const percentage = (score / max) * 100;
  return (
    <div>
      <div className="flex justify-between items-end mb-2 font-[var(--font-main)]">
        <span className="text-xs font-bold text-[#6b6660]">{label}</span>
        <span className="text-sm font-black">{score} <span className="text-[10px] text-[#999] font-normal">/ {max}</span></span>
      </div>
      <div className="h-2 bg-black/5 rounded-full overflow-hidden border border-black/5">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white p-4 border border-black/10 rounded-sm text-center">
      <div className="text-[9px] font-black text-[#6b6660] uppercase tracking-widest mb-1">{label}</div>
      <div className="text-sm font-black font-[var(--font-mono)]">{value}</div>
    </div>
  );
}
