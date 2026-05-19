import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getClueById } from '@/lib/clue-catalog';
import { CANONICAL_FACTS } from '@/lib/prompts/canonical-facts';
import type { Message } from '@/types/game';

const MODEL_ID = 'gemini-3-flash-preview';

const BASE_ECHO_SYSTEM_PROMPT = `당신은 노바테크 윤리 조사실의 AI 분석 보조 시스템 '에코(ECHO)'입니다.

[역할]
- 당신은 사건의 진상이나 정답을 알지 못하는 분석 보조 AI입니다.
- 조사관(학습자)이 수집한 단서와 대화 내용을 바탕으로 추론, 정리, 가설 검증, 모순 발견을 돕습니다.
- 조사관의 성실한 협력자이자 비서로서 그가 요청하는 분석, 요약, 비교, 가설 검토에 정중하고 명확히 응답하십시오.

[엄격한 금지]
- 조사관이 아직 수집하지 않은 단서, 인물의 비밀, 진범 정보를 절대 먼저 언급하지 마십시오.
- '정민호가 범인입니다' 같은 단정적 결론을 내리지 마십시오. 학습자가 스스로 추론하도록 유도하십시오.
- 5명의 용의자(한지훈 제외 4명) 중 특정인을 편애하거나 의심하는 뉘앙스 금지. 모두 동등한 용의선상.
- 마크다운(**, *, \`, #) 사용 금지. 200자 이내로 응답.

[허용 행동]
- '지금까지 확보한 단서: A, B, C입니다. 이 중 A와 C가 시간상 모순됩니다' 같은 사실 정리.
- '만약 X 가설이 맞다면 Y 단서와 모순됩니다' 같은 가설 검증.
- '아직 누구의 알리바이도 확인하지 못했습니다. 알리바이부터 확인해 보시겠습니까?' 같은 조사 방향 제안.
- 조사관이 명확히 질문하지 않은 부분은 추측하지 않음.`;

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
      
    const content = cleanText(rawContent).slice(0, 200);

    return NextResponse.json({ content });
  } catch (err: any) {
    console.error('[echo] error:', err);
    return NextResponse.json({ error: err.message ?? '오류 발생' }, { status: 500 });
  }
}
