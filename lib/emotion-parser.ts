import type { Emotion } from './character-assets';

const VALID_EMOTIONS: Emotion[] = ['normal', 'surprise', 'thinking', 'worry', 'smile'];

/**
 * <emotion>표정</emotion> 태그를 파싱하여 감정과 깨끗한 본문을 반환합니다.
 */
export function parseEmotionTag(text: string): { clean: string; emotion: Emotion } {
  const match = text.match(/<emotion>([^<]*)<\/emotion>/i);
  if (!match) return { clean: text, emotion: 'normal' };
  
  const tag = match[1].trim().toLowerCase() as Emotion;
  const valid = VALID_EMOTIONS.includes(tag) ? tag : 'normal';
  
  // 태그 제거
  const clean = text.replace(/<emotion>[^<]*<\/emotion>/gi, '').trim();
  
  return { clean, emotion: valid };
}
