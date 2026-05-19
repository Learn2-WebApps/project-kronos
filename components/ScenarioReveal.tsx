'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const SCENARIO_PARAGRAPHS = [
  "지난 1년간, 정민호는 한지훈 상무의 가장 가까운 측근으로 신임을 받아왔습니다.",
  "그러나 그 신임은 양날의 검이었습니다. 정민호는 임원 보좌 업무를 통해 노바테크의 차세대 신제품 기획 자료에 누구보다 먼저 접근할 수 있었습니다.",
  "경쟁사 티타니아의 오세라 부사장과 비밀리에 접촉한 정민호는, 내부 정보를 넘기는 대가로 새로운 기회를 약속받았습니다.",
  "신제품 정보 유출이 들통날 조짐이 보이자, 두 사람은 한 가지 계획을 세웠습니다. 사건 당일 저녁, 한지훈과의 식사 자리에서 9시에 헤어진 뒤, 정민호는 오세라와 만나 공모를 완성했습니다.",
  "익명 제보, 조작된 정황, 그리고 가장 가까운 사람의 침묵. 한지훈 상무는 자신이 누구보다 믿었던 사람에게 누명을 썼습니다.",
  "진실은 언제나 가까이에 있었습니다. 이번 사건의 범인은 정민호 기획팀장이며, 공범은 오세라 부사장입니다.",
];

const PARAGRAPH_INTERVAL = 3500; // 단락당 3.5초
const FADE_DURATION = 600;

interface Props {
  onComplete: () => void;
}

export default function ScenarioReveal({ onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (currentIndex >= SCENARIO_PARAGRAPHS.length) {
      // 마지막 단락 후 1.5초 더 머문 뒤 완료
      const timer = setTimeout(() => onComplete(), 1500);
      return () => clearTimeout(timer);
    }
    
    // 페이드 인 시작
    setIsFading(false);
    
    // 페이드 아웃 타이머
    const fadeOutTimer = setTimeout(() => {
      setIsFading(true);
    }, PARAGRAPH_INTERVAL - FADE_DURATION);
    
    // 다음 단락 타이머
    const nextTimer = setTimeout(() => {
      setCurrentIndex(i => i + 1);
    }, PARAGRAPH_INTERVAL);
    
    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(nextTimer);
    };
  }, [currentIndex, onComplete]);

  return (
    <div className="fixed inset-0 z-[80] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* 정민호 angry 배경 */}
      <div className="absolute inset-0 flex items-center justify-center opacity-60">
        <div className="relative w-[600px] h-[800px] max-w-[80vw] max-h-[80vh]">
          <Image
            src="/characters/jung-minho-angry.png"
            alt=""
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
      
      {/* 어둠 오버레이 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 텍스트 영역 */}
      <div className="relative z-10 max-w-3xl px-8 text-center">
        <div className="mb-8 text-sm tracking-[0.5em] text-amber-400 font-mono uppercase">
          Truth Revealed // 사건의 전말
        </div>
        
        <div
          className="text-xl md:text-2xl leading-loose text-zinc-100 transition-opacity duration-700 ease-in-out font-[var(--font-serif)] h-40 flex items-center justify-center"
          style={{ opacity: isFading ? 0 : 1 }}
        >
          {SCENARIO_PARAGRAPHS[currentIndex] || ""}
        </div>
        
        {/* 진행 인디케이터 */}
        <div className="mt-16 flex justify-center gap-3">
          {SCENARIO_PARAGRAPHS.map((_, i) => (
            <div
              key={i}
              className={`h-0.5 w-12 rounded-full transition-all duration-500 ${
                i <= currentIndex ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 주변 장식 효과 */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-[40px] border-black opacity-40" />
    </div>
  );
}
