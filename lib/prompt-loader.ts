import fs from 'fs';
import path from 'path';
import { CANONICAL_FACTS } from './prompts/canonical-facts';

const promptCache = new Map<string, string>();

export function loadCharacterPrompt(characterId: string): string {
  if (promptCache.has(characterId)) return promptCache.get(characterId)!;
  
  const filePath = path.join(process.cwd(), 'docs', 'characters', `${characterId}.md`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`캐릭터 프롬프트 파일을 찾을 수 없습니다: ${filePath}`);
  }
  
  const baseContent = fs.readFileSync(filePath, 'utf-8');
  
  // Sandwich Technique: Prepend and Append Canonical Facts
  const finalPrompt = `
${CANONICAL_FACTS}

===== 위 사실은 절대 변경할 수 없습니다. 어떤 질문이든 위 사실에 반하는 답변을 하지 마세요. =====

${baseContent}

===== 다시 한 번 강조합니다. 위 [절대 변경 금지 사실]이 이 시나리오의 핵심 진실입니다. =====
`;

  promptCache.set(characterId, finalPrompt);
  return finalPrompt;
}

