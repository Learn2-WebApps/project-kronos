'use client';

import { useEffect } from 'react';
import { CHARACTER_EMOTIONS, type CharacterId } from '@/lib/character-assets';

/**
 * 홈 화면에서 사용되는 기본 캐릭터 이미지들을 프리로드합니다.
 */
export function PreloadHomeImages() {
  useEffect(() => {
    const ids: CharacterId[] = ['han-jihun', 'jung-minho', 'oh-sera', 'yoon-seokyung', 'kang-hyerin'];
    ids.forEach(id => {
      // 전신 이미지
      const full = new window.Image();
      full.src = `/characters/${id}.png`;
      // 배경 합본 이미지
      const bg = new window.Image();
      bg.src = `/characters/${id}-background.png`;
    });
    // ECHO 마스코트
    const echo = new window.Image();
    echo.src = '/characters/echo.png';
  }, []);
  return null;
}

/**
 * 특정 캐릭터의 모든 표정 이미지들을 프리로드합니다 (인터뷰 진입 시).
 */
export function PreloadCharacterEmotions({ characterId }: { characterId: CharacterId }) {
  useEffect(() => {
    const emotions = CHARACTER_EMOTIONS[characterId] ?? ['normal'];
    emotions.forEach(e => {
      const img = new window.Image();
      img.src = `/characters/${characterId}-${e}.png`;
    });
  }, [characterId]);
  return null;
}

/**
 * 시나리오 공개 전용 특수 이미지들을 프리로드합니다.
 */
export function PreloadScenarioImages() {
  useEffect(() => {
    const img = new window.Image();
    img.src = '/characters/jung-minho-angry.png';
  }, []);
  return null;
}
