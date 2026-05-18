import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { loadCharacterPrompt } from '@/lib/prompt-loader';
import { parseAIResponse } from '@/lib/response-parser';
import { detectCluesByKeywords, getClueById } from '@/lib/clue-catalog';
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
    
    const systemPrompt = loadCharacterPrompt(characterId);
    
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
    
    // 마크다운 제거
    const cleanText = (text: string) => text
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/^[-*]\s+/gm, '');
      
    const cleanedRawText = cleanText(rawText);
    const parsed = parseAIResponse(cleanedRawText);
    
    // 키워드 매칭 백업 (AI가 <clues> 태그 빠뜨려도 자동 감지)
    const keywordClues = detectCluesByKeywords(parsed.content);
    const allClueIds = Array.from(new Set([...parsed.clueIds, ...keywordClues]));
    
    // 현재 캐릭터의 단서 또는 공통 단서만 필터링
    const validClueIds = allClueIds.filter(id => {
      const clue = getClueById(id);
      return clue && (!clue.characterId || clue.characterId === characterId);
    });
    
    const result: ChatResponse = {
      content: parsed.content,
      emotion: parsed.emotion,
      clueIds: validClueIds,
      raw: cleanedRawText,
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
