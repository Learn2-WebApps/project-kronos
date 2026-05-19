import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getAllClues } from '@/lib/clue-catalog';
import { CHARACTERS, CharacterId } from '@/lib/character-assets';

// 정답 정의
const CORRECT_ANSWER = {
  culprit: 'jung-minho' as CharacterId,
  accomplice: 'oh-sera' as CharacterId,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      answer, // { culprit, accomplice }
      collectedClues, 
      characterTurns,
      playDuration 
    } = body;

    if (!answer || !answer.culprit || !answer.accomplice) {
      return NextResponse.json({ error: '답변 데이터가 누락되었습니다.' }, { status: 400 });
    }

    // 1. 채점 로직 (서버 결정적 계산)
    const culpritScore = answer.culprit === CORRECT_ANSWER.culprit ? 40 : 0;
    const accompliceScore = answer.accomplice === CORRECT_ANSWER.accomplice ? 20 : 0;
    
    const allClues = getAllClues();
    const totalClueCount = allClues.length || 41;
    const clueRate = (collectedClues?.length || 0) / totalClueCount;
    const clueScore = Math.round(clueRate * 40);
    
    const totalScore = culpritScore + accompliceScore + clueScore;

    // 2. 등급 산정
    const grade = 
      totalScore >= 90 ? 'S' :
      totalScore >= 75 ? 'A' :
      totalScore >= 60 ? 'B' :
      totalScore >= 40 ? 'C' : 'D';

    // 3. AI 해설 생성 (Gemini)
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const model = ai.models;
    
    const learnerCulpritName = CHARACTERS[answer.culprit as CharacterId]?.name || answer.culprit;
    const learnerAccompliceName = CHARACTERS[answer.accomplice as CharacterId]?.name || answer.accomplice;
    
    const totalTurns = Object.values(characterTurns || {}).reduce((acc: number, cur: any) => acc + (cur || 0), 0);

    const commentaryPrompt = `
다음 추리 게임 결과에 대한 해설을 한국어로 작성하세요. 반드시 200자 이내 평문으로 작성하고 마크다운 문법을 절대 사용하지 마세요.

- 학습자 답: 범인 [${learnerCulpritName}], 협력자 [${learnerAccompliceName}]
- 정답: 범인 정민호, 협력자 오세라
- 수집한 단서: ${collectedClues?.length || 0} / ${totalClueCount}
- 점수: ${totalScore}/100, 등급: ${grade}

해설 내용 포함 필수 사항:
1) 학습자가 맞춘 부분과 놓친 부분을 짧게 설명
2) 정답 근거를 핵심 모순(식사 시간 등) 1~2개로 요약
3) 격려 또는 다음에 시도할 추리 방향 한 문장
`;

    let aiCommentary = "";
    try {
      const result = await model.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: commentaryPrompt }] }],
        config: {
          temperature: 0.7,
        }
      });
      aiCommentary = (result.text || "").replace(/[*_`#]/g, '').trim();
    } catch (err) {
      console.error('[evaluate] AI Commentary generation failed:', err);
      aiCommentary = `정답은 범인 정민호, 협력자 오세라입니다. 수집한 단서를 바탕으로 범행 시간대의 알리바이 모순을 다시 한번 확인해 보세요.`;
    }

    const evaluation = {
      totalScore,
      grade,
      breakdown: {
        culpritScore,
        accompliceScore,
        clueScore,
      },
      stats: {
        cluesCollected: collectedClues?.length || 0,
        totalClues: totalClueCount,
        totalTurns,
        playDurationSec: playDuration,
      },
      aiCommentary: aiCommentary.slice(0, 200),
    };

    return NextResponse.json({ evaluation });
  } catch (err: any) {
    console.error('[evaluate] Error:', err);
    return NextResponse.json({ error: err.message || '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
