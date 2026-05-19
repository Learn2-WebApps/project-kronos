export type Emotion = 'normal' | 'thinking' | 'surprise' | 'worry' | 'smile';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  emotion?: Emotion;
  timestamp: number;
}

export interface Clue {
  id: string;
  text: string;
  foundAt: number;
  characterId: string;
}

export interface ChatRequest {
  characterId: string;
  messages: Message[];
  userInput: string;
}

export interface ChatResponse {
  content: string;
  emotion: Emotion;
  clueIds: string[];
  raw: string;
}

export interface Session {
  code: string;
  title: string;
  createdAt: number;
  status: 'open' | 'revealed' | 'closed';
  revealedAt?: number;
}

export interface FinalAnswer {
  culprit: string;      // Q1: 누가 범인인가?
  accomplice: string;   // Q2: 누가 협력자(또는 커넥션 상대)인가?
}

export interface Evaluation {
  totalScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  breakdown: {
    culpritScore: number;
    accompliceScore: number;
    clueScore: number;
  };
  stats: {
    cluesCollected: number;
    totalClues: number;
    totalTurns: number;
    playDurationSec: number;
  };
  aiCommentary: string;
}

export interface Submission {
  userUid: string;
  name: string;
  department: string;
  submittedAt: number;
  playDuration: number;
  answer: FinalAnswer;
  evaluation: Evaluation;
}

export interface PlayerInfo {
  sessionCode: string;
  name: string;
  department: string;
  startedAt: number;
}
