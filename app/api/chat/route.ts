import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { loadCharacterPrompt } from '@/lib/prompt-loader';
import { parseAIResponse } from '@/lib/response-parser';
import { getCluesByOwner, CLUE_CATALOG } from '@/lib/clue-catalog';
import { extractClues } from '@/lib/clue-parser';
import { parseEmotionTag } from '@/lib/emotion-parser';
import { CHARACTER_EMOTIONS, CharacterId } from '@/lib/character-assets';
import type { ChatRequest, ChatResponse, Message } from '@/types/game';

const MODEL_ID = 'gemini-3-flash-preview';
const MAX_HISTORY = 40; // 최근 20턴 (user + assistant = 40 메시지)

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: '.env.local 에 GEMINI_API_KEY 를 설정해주세요.' },
        { status: 500 }
      );
    }
    const body: ChatRequest = await req.json();
    const { characterId, messages, userInput, collectedClueIds } = body;

    let systemPrompt = loadCharacterPrompt(characterId);

    // 수집한 단서 요약 주입
    const collectedSummary = (collectedClueIds || [])
      .map(id => {
        const clue = CLUE_CATALOG[id];
        return clue ? `- ${id}: ${clue.content}` : null;
      })
      .filter(Boolean)
      .join('\n');

    systemPrompt += `
    \n[학습자가 현재까지 수집한 단서]
    ${collectedSummary || '(아직 수집한 단서 없음)'}

    [증거 인지 규칙]
    - 학습자의 질문에 위 단서 내용이 직접 언급되거나 강하게 암시되면, 당신은 "그 정보를 이미 알고 있는 상대"로 인식하고 방어선을 한 단계 낮추세요.
    - 예: 학습자가 "4월 컨퍼런스" 또는 "정민호 승진 누락"을 언급하면, 완전 부인 → 부분 인정으로 전환.
    `;

    // 캐릭터 보유 단서 목록 주입 (태깅용)
    const myClues = getCluesByOwner(characterId);
    const cluesList = myClues.map(c => `[${c.id}] ${c.title}: ${c.content}`).join('\n');
    
    const availableEmotions = CHARACTER_EMOTIONS[characterId as CharacterId] || ['normal'];

    systemPrompt += `
\n[단서 태그 지침]
응답이 다음 단서 중 하나 이상을 포함하는 경우, 응답 본문 마지막에 다음 형식으로 단서 ID를 명시하라:
<clues>F-12,L-06</clues>
학습자에게는 이 태그가 보이지 않는다. 단서 ID는 정확히 카탈로그의 ID를 사용하라.
당신이 보유한 단서 목록:
${cluesList}

[표정 태그 지침]
응답의 가장 마지막에 현재 감정을 다음 형식으로 추가하라:
<emotion>표정</emotion>

당신이 사용 가능한 표정:
${availableEmotions.join(", ")}

각 표정의 사용 기준:
- thinking: 신중히 답할 때, 회상할 때, 질문이 어려울 때
- surprise: 예상 못한 질문이나 모순이 지적될 때
- worry: 동요, 불안, 거짓이 들킬 위기, 곤란한 상황
- smile: 여유, 자신감, 협조적 태도 (주로 긍정적/여유로운 상황)
- normal: 위 어디에도 해당하지 않는 평이한 대화

표정 태그는 학습자에게 보이지 않는다. 응답 내용과 일치해야 한다.
※ 'angry' 표정은 사용 금지 (시나리오 전용).
`;

    // 런타임 검증: 핵심 사실 주입 여부 확인
    if (!systemPrompt.includes('티타니아는 노바테크의 **경쟁사**')) {
      console.error('[CRITICAL] Canonical facts missing in system prompt!');
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // 최근 메시지만 context 로 사용
    const recentMessages = messages.slice(-MAX_HISTORY);
    const contents = [
      ...recentMessages.map((m: Message) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
      {
        role: 'user',
        parts: [{ text: userInput }],
      },
    ];
    
    // 디버그용 로그
    console.log('[chat] character:', characterId, '| input:', userInput);
    
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      },
    });
    
    const rawText = response.text ?? '';
    console.log('[chat] raw response:', rawText);
    
    // 마크다운 제거 유틸
    const cleanMarkdown = (text: string) => text
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/^[-*]\s+/gm, '');
      
    // 단서 추출 (태그 + 키워드 백업)
    const { clean: textWithoutClues, ids } = extractClues(rawText, characterId);
    
    // 표정 추출
    const { clean: finalText, emotion } = parseEmotionTag(textWithoutClues);
    
    const cleanedContent = cleanMarkdown(finalText);
    
    // 최종 응답 텍스트 (길이 제한 200자)
    const finalContent = cleanedContent.slice(0, 200);
    
    const result: ChatResponse = {
      content: finalContent,
      emotion: emotion,
      clueIds: ids,
      raw: rawText,
    };
    
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[chat] error:', err);
    return NextResponse.json(
      { error: err.message ?? 'AI 응답 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
