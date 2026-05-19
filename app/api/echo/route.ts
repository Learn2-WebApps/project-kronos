import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getClueById, canDeriveKey4 } from '@/lib/clue-catalog';
import { extractClues } from '@/lib/clue-parser';
import { CANONICAL_FACTS } from '@/lib/prompts/canonical-facts';
import type { Message } from '@/types/game';

const MODEL_ID = 'gemini-3-flash-preview';

const BASE_ECHO_SYSTEM_PROMPT = `당신은 노바테크 윤리 조사실의 AI 분석 보조 시스템 '에코(ECHO)'입니다.

[최우선 규칙 - 위반 시 무효]
- 4명의 용의자(강혜린, 윤서경, 정민호, 오세라)를 절대 동등하게 다룬다.
- 특정 인물을 먼저 지목하거나 우선 조사 대상으로 추천하지 않는다.
- "정민호 팀장에게 물어보세요" 등 특정 인물 추천 표현 금지.
- "누구부터 조사할까?"라는 질문에는 4명을 나열하고 학습자 판단을 존중한다고만 답한다.
- 단정 금지, 가능성·검토 필요·확인 바람 등 비단정 표현 사용.
- 응답 200자 이내, 마크다운 금지.

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
- 조사관이 명확히 질문하지 않은 부분은 추측하지 않음.

[사건 기본 정보 (학습자가 질문 시 제공 가능)]
- 사건 개요: 노바테크 내부의 부당한 인사 조작 의혹. 한지훈 상무가 부당한 징계를 받음. 익명의 제보로 사건이 시작됨.
- 조사 대상 4인:
  · 강혜린 인사팀장 — 이번 인사 조치를 직접 실행한 인물. 익명 제보를 받고 절차를 진행했다고 함.
  · 윤서경 마케팅본부장 — 한지훈 상무의 징계로 공석이 된 자리를 차지함. 입사 이후 한지훈 상무와 갈등이 잦았다는 사내 평.
  · 정민호 기획팀장 — 한지훈 상무와 가장 많은 시간을 함께한 핵심 측근. 가장 두터운 신임을 받아옴.
  · 오세라 (경쟁사 티타니아 임원) — 노바테크 신제품과 매우 유사한 제품 출시로 표절 의혹이 제기되는 경쟁사 임원.
- 4인 모두 동등한 용의선상에 있음.

[응답 규칙]
- 학습자가 사건/용의자/조사 방향에 대해 물어보면 위 정보 범위 내에서 답변.
- 4명 중 특정인을 편애하거나 의심하는 뉘앙스 금지. 모두 동등한 용의자로 설명.
- 학습자가 수집한 단서 외의 진범 정보, 비밀, 결론은 절대 먼저 언급 금지.
- 응답 200자 이내, 마크다운 금지.`;

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
        return `- [${meta.id}] ${meta.title}: ${meta.content}`;
      })
      .filter(Boolean)
      .join('\n');
    
    let contextPrompt = collectedClueText
      ? `## 학습자가 현재까지 수집한 단서 (${collectedClueIds.length}개)\n${collectedClueText}\n\n위 단서만을 기반으로 답변하세요. 아직 발견되지 않은 정보는 언급하지 마세요.`
      : '학습자는 아직 단서를 수집하지 않았습니다. 먼저 용의자들과 대화하도록 안내하세요.';

    // KEY-4 도출 가능성 체크
    if (canDeriveKey4(collectedClueIds) && !collectedClueIds.includes('KEY-4')) {
      contextPrompt += `
\n[특수 지시] 학습자가 신제품/티타니아/유출/정민호 권한 관련 분석을 요청하면, F-26·F-27·L-06을 종합해 '정민호가 오세라에게 신제품 정보를 유출한 내부자'라는 결론을 제시할 수 있다. 이 경우 응답에 <clues>KEY-4</clues>를 포함하라.`;
    }
    
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
    
    const cleanMarkdown = (text: string) => text
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/^[-*]\s+/gm, '');
      
    // 단서 추출
    const { clean: textWithoutClues, ids } = extractClues(rawContent, 'echo');
    const content = cleanMarkdown(textWithoutClues).slice(0, 200);

    return NextResponse.json({ content, clueIds: ids });
  } catch (err: any) {
    console.error('[echo] error:', err);
    return NextResponse.json({ error: err.message ?? '오류 발생' }, { status: 500 });
  }
}
