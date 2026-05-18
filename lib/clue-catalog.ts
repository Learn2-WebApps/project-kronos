import fs from 'fs';
import path from 'path';
import type { CharacterId } from './character-assets';

export type ClueCategory = 'F' | 'L' | 'T' | 'RH' | 'KEY';
export type ClueClassification = '일반' | '거짓말' | '함정' | '숨겨진 핵심';

export interface ClueMetadata {
  id: string;              // 예: "F-01", "KEY-1a", "L-04"
  name: string;            // 단서명 (요약 제목)
  content: string;         // 본문 내용
  category: ClueCategory;  // F/L/T/RH/KEY
  classification: ClueClassification;
  characterId?: string;    // 1차 보유 캐릭터 (있으면)
  triggers: string[];      // 감지 트리거 키워드
  truthValue?: string;     // 진위 (진실/거짓/부분 거짓 등)
}

let cachedCatalog: Map<string, ClueMetadata> | null = null;

const CHARACTER_NAME_MAP: Record<string, CharacterId> = {
  '강혜린': 'kang-hyerin',
  '한지훈': 'han-jihun',
  '정민호': 'jung-minho',
  '윤서경': 'yoon-seokyung',
  '오세라': 'oh-sera',
  'ECHO 분석': 'han-jihun', // 가이드상 'echo'인데 현재 CharacterId 타입에 없으므로 임시로 한지훈(피해자측) 또는 무소속 처리
};

const CATEGORY_FROM_ID: Record<string, ClueCategory> = {
  'F': 'F', 'L': 'L', 'T': 'T', 'RH': 'RH', 'KEY': 'KEY',
};

export function loadClueCatalog(): Map<string, ClueMetadata> {
  if (cachedCatalog) return cachedCatalog;
  
  const filePath = path.join(process.cwd(), 'docs', '02-info-catalog.md');
  const raw = fs.readFileSync(filePath, 'utf-8');
  
  const catalog = new Map<string, ClueMetadata>();
  const lines = raw.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    
    // ID 추출 패턴: **F-01**, **KEY-1a** 등
    const idMatch = trimmed.match(/\|\s*\*\*(KEY|F|L|T|RH)-([\w\d]+)\*\*\s*\|/);
    if (!idMatch) continue;
    
    const id = `${idMatch[1]}-${idMatch[2]}`;
    const category = CATEGORY_FROM_ID[idMatch[1]];
    const cells = trimmed.split('|').map(c => c.trim()).filter((_, i) => i > 0);
    // cells[0] is **ID**, cells[1] is Content or Name
    
    let name = '';
    let content = '';
    let truthValue = '';
    let ownerName = '';
    let triggersRaw = '';
    let classRaw = '';
    
    if (category === 'KEY') {
      // KEY: | 코드 | 단서명 | 내용 | 발견 경로 | 감지 트리거 | 분류 |
      name = cells[1] || '';
      content = cells[2] || '';
      triggersRaw = cells[4] || '';
      classRaw = cells[5] || '';
    } else {
      // Others have different column counts but generally:
      // Facts: | ID | 내용 | 진위 | 1차 보유 | 노출 조건 | 감지 트리거 | 분류 | (7 cols)
      // Lies: | ID | 내용 | 반증 짝 | 노출 조건 | 감지 트리거 | 분류 | (6 cols)
      // Testimony: | ID | 내용 | 진위 | 노출 조건 | 감지 트리거 | 분류 | (6 cols)
      
      content = cells[1] || '';
      name = content.length > 30 ? content.slice(0, 30) + '...' : content;
      
      // Determine columns by counting
      if (cells.length >= 7) {
        // Facts style
        truthValue = cells[2];
        ownerName = cells[3];
        triggersRaw = cells[5];
        classRaw = cells[6];
      } else if (cells.length === 6) {
        // Lies/Testimony/RH style
        // We can't be 100% sure which is which without header context, but usually triggers are in the 2nd to last cell
        triggersRaw = cells[4];
        classRaw = cells[5];
      }
    }
    
    const triggers = Array.from(triggersRaw.matchAll(/"([^"]+)"/g)).map(m => m[1]);
    const characterId = CHARACTER_NAME_MAP[ownerName] || undefined;
    
    catalog.set(id, {
      id,
      name: name.replace(/\*\*/g, ''),
      content: content.replace(/\*\*/g, ''),
      category,
      classification: (classRaw.replace(/\*\*/g, '') as ClueClassification) || '일반',
      characterId,
      triggers,
      truthValue: truthValue.replace(/\*\*/g, ''),
    });
  }
  
  console.log(`[clue-catalog] Loaded ${catalog.size} clues from docs/02-info-catalog.md`);
  cachedCatalog = catalog;
  return catalog;
}

export function getClueById(id: string): ClueMetadata | undefined {
  return loadClueCatalog().get(id);
}

export function getAllClues(): ClueMetadata[] {
  return Array.from(loadClueCatalog().values());
}

export function getCluesByCharacter(characterId: CharacterId): ClueMetadata[] {
  return getAllClues().filter(c => c.characterId === characterId);
}

// 키워드 매칭 백업 감지
export function detectCluesByKeywords(text: string): string[] {
  const all = getAllClues();
  const detected: string[] = [];
  
  for (const clue of all) {
    if (clue.triggers.length < 1) continue;
    // 트리거 중 2개 이상 포함 시 발견 (단, 트리거가 1개뿐인 경우는 1개만으로도 인정)
    const matchCount = clue.triggers.filter(t => text.includes(t)).length;
    const required = Math.min(clue.triggers.length, 2);
    
    if (matchCount >= required) {
      detected.push(clue.id);
    }
  }
  return detected;
}
