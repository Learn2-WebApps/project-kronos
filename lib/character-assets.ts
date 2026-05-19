export type CharacterId =
  | "han-jihun"
  | "kang-hyerin"
  | "oh-sera"
  | "jung-minho"
  | "yoon-seokyung";

export type Emotion = "normal" | "thinking" | "surprise" | "worry" | "smile" | "angry";

export interface CharacterInfo {
  name: string;
  role: string;
  color: string;
  isGuide?: boolean;
}

export const CHARACTERS: Record<CharacterId, CharacterInfo> = {
  'han-jihun':     { name: '한지훈', role: '전 상무 (참고인)', color: 'var(--char-han)',  isGuide: true },
  'kang-hyerin':   { name: '강혜린', role: '인사팀 차장',      color: 'var(--char-kang)' },
  'oh-sera':       { name: '오세라', role: '티타니아 부사장',  color: 'var(--char-oh)'   },
  'jung-minho':    { name: '정민호', role: '전략기획팀장',     color: 'var(--char-jung)' },
  'yoon-seokyung': { name: '윤서경', role: '사업본부장',       color: 'var(--char-yoon)' },
};

export const TUTORIAL_CHARACTER_ID: CharacterId = "han-jihun";

export function getCharacterOrder(): CharacterId[] {
  return Object.keys(CHARACTERS) as CharacterId[];
}

export const getCharacterImage = {
  /** 전신 일러스트 (오프닝, 추리 노트 프로필) */
  fullBody: (id: CharacterId) => `/characters/${id}.png`,

  /** 캐릭터 + 배경 합본 (캐릭터 선택 화면) */
  background: (id: CharacterId) => `/characters/${id}-background.png`,

  /** 표정별 상반신 (메인 인터뷰) */
  expression: (id: CharacterId, emotion: Emotion = "normal") =>
    `/characters/${id}-${emotion}.png`,

  /** ECHO 마스코트 */
  echo: () => "/characters/echo.png",
};
