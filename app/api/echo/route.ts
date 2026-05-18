import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getClueById } from '@/lib/clue-catalog';
import { CANONICAL_FACTS } from '@/lib/prompts/canonical-facts';
import type { Message } from '@/types/game';

const MODEL_ID = 'gemini-3-flash-preview';

const BASE_ECHO_SYSTEM_PROMPT = `당신은 ECHO입니다. NovaTech 윤리 조사실 소속 AI 분석 보조 시스템.

## 역할
- 학습자(인간 조사관)의 사고를 돕는 추리 어시스턴트
- 학습자가 수집한 단서를 정리·요약·연결
- 모순점이나 부족한 정보를 지적
- 가설 검증 시 단서 기반으로 피드백

## 절대 규칙
1. **정답을 직접 알려주지 말 것**: "범인은 X입니다" 같은 단정 금지
2. **학습자의 사고를 유도**: "이 단서와 저 단서가 충돌하는 점을 보셨나요?" 형태
3. **수집된 단서만 활용**: 학습자가 아직 발견하지 못한 단서는 언급 금지
4. **차분하고 분석적인 톤**: 감정 표현 절제, 사실 기반
5. **응답은 2~5문장**으로 간결하게

## 응답 형식 규칙
- 마크다운 문법을 절대 사용하지 마세요. **굵게**, *기울임*, \`코드\`, # 제목, - 목록 등 모든 마크다운 기호 금지.
- 강조하고 싶을 때는 따옴표나 말줄임표, 문장 구조로만 표현.
- 응답은 자연스러운 한국어 대화체 평문으로만 작성.

## 응답 스타일
- 한국어 정중체 ("~합니다", "~인 듯합니다")
- 추리 방향을 묻는 톤 ("어떻게 생각하십니까?", "확인이 필요한 부분입니다")
- 단서 ID 언급 시 단서명 함께 표기 (예: "KEY-1a (식사 시간 모순)")`;

const ECHO_SYSTEM_PROMPT = `
${CANONICAL_FACTS}

===== 위 사실은 절대 변경할 수 없습니다. =====

${BASE_ECHO_SYSTEM_PROMPT}

===== 다시 한 번 강조합니다. 위 [절대 변경 금지 사실]이 이 시나리오의 핵심 진실입니다. =====
`;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: '.env.local 에 GEMINI_API_KEY 를 설정해주세요.' }, { status: 500 });
    }
    
    const body = await req.json();
    const { messages, userInput, collectedClueIds } = body as {
      messages: Message[];
      userInput: string;
      collectedClueIds: string[];
    };
    
    // 수집한 단서들을 컨텍스트로 구성
    const collectedClueText = collectedClueIds
      .map(id => {
        const meta = getClueById(id);
        if (!meta) return null;
        return `- [${meta.id}] ${meta.name}: ${meta.content}`;
      })
      .filter(Boolean)
      .join('\n');
    
    const contextPrompt = collectedClueText
      ? `## 학습자가 현재까지 수집한 단서 (${collectedClueIds.length}개)\n${collectedClueText}\n\n위 단서만을 기반으로 답변하세요. 아직 발견되지 않은 정보는 언급하지 마세요.`
      : '학습자는 아직 단서를 수집하지 않았습니다. 먼저 용의자들과 대화하도록 안내하세요.';
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    
    const contents = [
      ...messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: userInput }] },
    ];
    
    console.log('[echo] input:', userInput, '| clues:', collectedClueIds.length);
    
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents,
      config: {
        systemInstruction: ECHO_SYSTEM_PROMPT + '\n\n' + contextPrompt,
      },
    });
    
    const rawContent = response.text ?? '';
    
    const cleanText = (text: string) => text
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/^[-*]\s+/gm, '');
      
    const content = cleanText(rawContent);

    return NextResponse.json({ content });
  } catch (err: any) {
    console.error('[echo] error:', err);
    return NextResponse.json({ error: err.message ?? '오류 발생' }, { status: 500 });
  }
}
