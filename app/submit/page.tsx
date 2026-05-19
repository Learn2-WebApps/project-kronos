'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { usePlayerStore } from '@/store/player-store';
import { useInterviewStore } from '@/store/interview-store';
import { CHARACTERS, getCharacterImage, getCharacterOrder, CharacterId } from '@/lib/character-assets';
import { ensureAuth } from '@/lib/firebase';
import { submitAnswer } from '@/lib/firestore-session';
import { PreloadScenarioImages } from '@/components/ImagePreloader';

export default function SubmitPage() {
  const router = useRouter();
  const { sessionCode, name, department, startedAt, markSubmitted } = usePlayerStore();
  const { collectedClues, characterTurns } = useInterviewStore();

  const [culprit, setCulprit] = useState<CharacterId | ''>('');
  const [accomplice, setAccomplice] = useState<CharacterId | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const order = getCharacterOrder();
  const isFormValid = culprit !== '' && accomplice !== '';

  const handleFinalSubmit = async () => {
    console.log('[submit] Starting submission process...');
    
    if (!culprit || !accomplice) { 
      const msg = '모든 문항에 답변해주세요.';
      alert(msg);
      return; 
    }
    
    setLoading(true);
    setError('');

    try {
      console.log('[submit] Step 1: Ensuring authentication...');
      const user = await ensureAuth();
      if (!user) throw new Error('인증 정보가 없습니다. 다시 로그인해주세요.');

      const playDuration = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
      const answer = { culprit, accomplice };

      console.log('[submit] Step 2: Calling evaluation API...');
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionCode,
          name,
          department,
          playDuration,
          characterTurns,
          collectedClues: collectedClues.map(c => c.id),
          answer
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '평가 API 호출 실패');
      }

      const { evaluation } = await response.json();
      console.log('[submit] Step 3: Evaluation received. Grade:', evaluation.grade);

      console.log('[submit] Step 4: Saving to Firestore...');
      await submitAnswer(sessionCode!, user.uid, {
        userUid: user.uid,
        name: name!,
        department: department!,
        submittedAt: Date.now(),
        playDuration,
        answer,
        evaluation
      });

      markSubmitted();
      console.log('[submit] Step 5: Redirecting to /waiting');
      router.replace('/waiting');
    } catch (err: any) {
      console.error('[submit] Error:', err);
      const errMsg = err.message || '알 수 없는 오류가 발생했습니다.';
      alert('제출 실패: ' + errMsg);
      setError(errMsg);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-[var(--font-main)] p-8 lg:p-16 relative overflow-x-hidden">
      <PreloadScenarioImages />
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      
      <header className="relative z-10 max-w-4xl mx-auto mb-12 border-b border-[var(--border-subtle)] pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight text-[var(--accent-amber)] uppercase font-[var(--font-mono)]">최종 결론 제출</h1>
          <p className="text-[var(--text-secondary)]">NovaTech Ethics Investigation Division // Final Decision</p>
        </div>
        <button onClick={() => router.back()} className="text-[var(--text-muted)] hover:text-white transition-colors text-sm uppercase tracking-widest font-[var(--font-mono)]">
          ← Back
        </button>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto space-y-16">
        {/* Q1. 범인 지목 */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--accent-amber)] text-black flex items-center justify-center text-sm font-bold font-[var(--font-mono)]">01</span>
              사건의 실행자(범인)는 누구입니까?
            </h2>
            <p className="text-[var(--text-muted)] text-sm ml-11">직접 익명 제보를 조작하고 한지훈 상무를 함정에 빠뜨린 인물을 선택하십시오.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {order.map(id => (
              <CharacterSelectCard 
                key={id} 
                id={id} 
                isSelected={culprit === id} 
                onSelect={() => setCulprit(id)} 
              />
            ))}
          </div>
        </section>

        {/* Q2. 협력자 지목 */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--accent-amber)] text-black flex items-center justify-center text-sm font-bold font-[var(--font-mono)]">02</span>
              범인과 내통한 외부 협력자는 누구입니까?
            </h2>
            <p className="text-[var(--text-muted)] text-sm ml-11">범행을 설계하거나 뒤에서 지원한 핵심 공모자를 선택하십시오.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {order.map(id => (
              <CharacterSelectCard 
                key={id} 
                id={id} 
                isSelected={accomplice === id} 
                onSelect={() => setAccomplice(id)} 
              />
            ))}
          </div>
        </section>

        {/* 제출 버튼 */}
        <div className="pt-12 border-t border-[var(--border-subtle)] flex flex-col items-center">
          {!isFormValid && (
            <p className="text-red-500/70 text-xs mb-4 uppercase tracking-widest font-[var(--font-mono)] animate-pulse">
              * Please answer all questions to proceed
            </p>
          )}
          <button 
            onClick={() => setShowConfirm(true)}
            disabled={!isFormValid || loading}
            className="px-12 py-5 bg-[var(--accent-amber)] text-black font-bold uppercase tracking-[0.2em] rounded-sm hover:opacity-90 transition-all disabled:opacity-20 disabled:grayscale text-xl shadow-[0_0_30px_rgba(212,165,116,0.1)]"
          >
            Finalize Submission
          </button>
        </div>
      </main>

      {/* 제출 확인 모달 */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-[#111] border border-[var(--border-subtle)] p-10 max-w-md w-full rounded-sm text-center shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent-amber)]" />
            <div className="w-20 h-20 mx-auto border-2 border-[var(--accent-amber)] text-[var(--accent-amber)] rounded-full flex items-center justify-center text-4xl font-bold mb-8 animate-pulse">
              !
            </div>
            <h3 className="text-2xl font-bold mb-4 uppercase tracking-tighter">Confirm Decision</h3>
            <p className="text-[var(--text-secondary)] mb-10 leading-relaxed">
              제출 후에는 결과를 수정하거나 추가 조사를 진행할 수 없습니다. <br/>
              본인의 추리를 확정하시겠습니까?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 px-4 py-4 border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white hover:bg-white/5 rounded-sm transition-all uppercase tracking-widest text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handleFinalSubmit}
                disabled={loading}
                className="flex-1 px-4 py-4 bg-[var(--accent-amber)] text-black font-bold rounded-sm hover:opacity-90 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CharacterSelectCard({ id, isSelected, onSelect }: { id: CharacterId, isSelected: boolean, onSelect: () => void }) {
  const char = CHARACTERS[id];
  return (
    <div 
      onClick={onSelect}
      className={`relative cursor-pointer rounded-sm border-2 transition-all duration-300 group ${
        isSelected 
          ? 'border-[var(--accent-amber)] bg-[var(--accent-amber)]/5 shadow-[0_0_20px_rgba(212,165,116,0.15)]' 
          : 'border-[var(--border-subtle)] opacity-40 hover:opacity-80 hover:border-white/20'
      }`}
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-black/40">
        <Image 
          src={getCharacterImage.expression(id, 'normal')} 
          alt={char.name} 
          fill 
          className={`object-contain object-bottom pt-4 transition-transform duration-500 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`} 
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60`} />
      </div>
      <div className={`p-3 text-center transition-colors duration-300 ${isSelected ? 'bg-[var(--accent-amber)] text-black' : 'bg-black text-[var(--text-muted)]'}`}>
        <div className="text-sm font-black tracking-tight">{char.name}</div>
        <div className={`text-[9px] uppercase tracking-widest mt-0.5 opacity-70 font-[var(--font-mono)]`}>
          {isSelected ? 'Selected' : 'Select'}
        </div>
      </div>
    </div>
  );
}
