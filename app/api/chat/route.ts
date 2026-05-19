import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { loadCharacterPrompt } from '@/lib/prompt-loader';
import { parseAIResponse } from '@/lib/response-parser';
import { getCluesByOwner } from '@/lib/clue-catalog';
import { extractClues } from '@/lib/clue-parser';
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
    const { characterId, messages, userInput } = body;
    
    let systemPrompt = loadCharacterPrompt(characterId);
    
    // 캐릭터 보유 단서 목록 주입
    const myClues = getCluesByOwner(characterId);
    const cluesList = myClues.map(c => `[${c.id}] ${c.title}: ${c.content}`).join('\n');
    
    systemPrompt += `
\n응답이 다음 단서 중 하나 이상을 포함하는 경우, 응답 본문 마지막에 다음 형식으로 단서 ID를 명시하라:
<clues>F-12,L-06</clues>
학습자에게는 이 태그가 보이지 않는다. 단서 ID는 정확히 카탈로그의 ID를 사용하라.
당신이 보유한 단서 목록:
${cluesList}
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
    const cleanedContent = cleanMarkdown(textWithoutClues);
    const parsed = parseAIResponse(cleanedContent);
    
    // 최종 응답 텍스트 (길이 제한 200자)
    const finalContent = parsed.content.slice(0, 200);
    
    const result: ChatResponse = {
      content: finalContent,
      emotion: parsed.emotion,
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
