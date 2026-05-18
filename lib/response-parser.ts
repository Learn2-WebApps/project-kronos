import type { Emotion } from '@/types/game';

const VALID_EMOTIONS: Emotion[] = ['normal', 'thinking', 'surprise', 'worry'];

export function parseAIResponse(raw: string): { content: string; emotion: Emotion; clueIds: string[] } {
  // emotion 추출
  const emotionMatch = raw.match(/<emotion>(.*?)<\/emotion>/i);
  const rawEmotion = emotionMatch?.[1]?.trim().toLowerCase() as Emotion;
  const emotion: Emotion = VALID_EMOTIONS.includes(rawEmotion) ? rawEmotion : 'normal';
  
  // clues 추출
  const cluesMatch = raw.match(/<clues>(.*?)<\/clues>/i);
  const clueIds = cluesMatch?.[1]
    ?.split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0) ?? [];
  
  // 태그 제거한 본문
  const content = raw
    .replace(/<emotion>.*?<\/emotion>/gi, '')
    .replace(/<clues>.*?<\/clues>/gi, '')
    .trim();
  
  return { content, emotion, clueIds };
}
