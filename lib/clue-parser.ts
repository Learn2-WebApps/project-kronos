import { CLUE_CATALOG } from './clue-catalog';

/**
 * <clues>F-12,L-06</clues> 태그를 파싱하여 ID 리스트와 깨끗한 본문을 반환합니다.
 */
export function parseClueTags(text: string): { clean: string; ids: string[] } {
  const match = text.match(/<clues>([^<]*)<\/clues>/i);
  if (!match) return { clean: text, ids: [] };
  
  const ids = match[1]
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
    
  // 유효한 단서 ID만 필터링
  const valid = ids.filter(id => CLUE_CATALOG[id]);
  
  // 태그 제거
  const clean = text.replace(/<clues>[^<]*<\/clues>/gi, '').trim();
  
  return { clean, ids: valid };
}

/**
 * 텍스트에서 키워드를 매칭하여 단서를 감지합니다.
 * @param text 매칭할 텍스트
 * @param characterId 캐릭터 ID (보유한 단서 내에서만 매칭). 'echo'인 경우 모든 단서 매칭.
 * @param minMatches 감지 인정을 위한 최소 키워드 매칭 수
 */
export function detectCluesByKeywords(
  text: string,
  characterId: string,
  minMatches = 2
): string[] {
  const lower = text.toLowerCase();
  const detected: string[] = [];
  
  Object.values(CLUE_CATALOG).forEach(clue => {
    // 캐릭터가 보유한 단서이거나, 감지 대상이 'echo'인 경우 전체 검색
    if (characterId !== 'echo' && !clue.owners.includes(characterId)) return;
    
    const matchCount = clue.triggers.filter(t => 
      lower.includes(t.toLowerCase())
    ).length;
    
    if (matchCount >= minMatches) {
      detected.push(clue.id);
    }
  });
  
  return detected;
}

/**
 * 태그 파싱과 키워드 감지를 결합하여 최종 단서 리스트를 추출합니다.
 */
export function extractClues(text: string, characterId: string): { clean: string; ids: string[] } {
  const { clean, ids: tagged } = parseClueTags(text);
  const backup = detectCluesByKeywords(clean, characterId);
  
  // 합집합 및 중복 제거
  const merged = Array.from(new Set([...tagged, ...backup]));
  
  return { clean, ids: merged };
}
