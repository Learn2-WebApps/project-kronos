---
last_updated: 2026-05-13
version: 1.0
---

# 섹션 1. 개요
- 프로젝트명: PROJECT KRONOS
- 목표: AI 기반 추리 인터뷰 게임, 50명 동시 접속 지원, 30~40분 플레이타임, 무료 요금제 최대 활용 + 종량제 폴백
- 제약사항: API 키 클라이언트 노출 금지, 회차당 비용 1,500원 이하 유지, MVP는 중도 이탈 시 처음부터 시작

# 섹션 2. 기술 스택
- 프론트엔드: Next.js 14 (App Router) + TypeScript 5 + Tailwind CSS 3
  - 이유: 최신 App Router를 통한 효율적인 라우팅 및 SSR/SSG 활용, 타입 안정성 확보, 생산성 높은 스타일링
- 폰트: Pretendard, Noto Serif KR, Gaegu, JetBrains Mono
  - 이유: 가독성 높은 본문, 클래식한 서류 느낌, 손글씨 감성, 코드/시스템 텍스트 구분
- 상태관리: Zustand 4
  - 이유: Redux보다 가벼우며 Next.js 환경에서 보일러플레이트 없이 직관적인 상태 관리 가능
- DB: Firebase Firestore (Spark 무료 플랜 시작, Blaze 종량제 폴백)
  - 이유: 실시간 데이터 동기화 및 NoSQL의 유연함, 무료 티어의 넉넉한 읽기/쓰기 한도
- 인증: Firebase Auth 익명 로그인
  - 이유: 복잡한 가입 절차 없이 세션 유지 및 보안 규칙 적용을 위한 최소한의 인증 장치
- AI: Google Gemini 1.5 Flash (모델 string: gemini-1.5-flash, 대화/평가 모두 사용)
  - 이유: 높은 속도와 낮은 비용(무료 티어 존재), 긴 컨텍스트 윈도우 지원
- 배포: Cloudflare Pages + Pages Functions
  - 이유: 글로벌 엣지 네트워크 배포, 서버리스 함수(Functions)를 통한 안전한 API 키 관리 및 무료 배포 티어
- 형상관리: GitHub
  - 이유: 업계 표준 협업 및 Cloudflare Pages와의 원활한 CI/CD 연동
- IDE: Antigravity + Gemini CLI
  - 이유: AI 어시스턴트 기반의 고속 개발 환경 구축

# 섹션 3. 시스템 아키텍처
사용자 브라우저 → Cloudflare Pages (정적) → Cloudflare Pages Functions (서버사이드, API 키 보유) → Gemini API / Firebase Firestore

데이터 흐름 4단계:
1. **세션 생성**: 사용자 접속 시 익명 로그인 후 Firestore에 고유 세션 ID 생성 및 초기화
2. **대화**: 사용자 메시지를 서버리스 함수로 전달, Gemini API 호출 시 프롬프트와 함께 컨텍스트 전달 및 응답 수신
3. **단서 저장**: Gemini 응답 내 단서 태그 파싱 후 해당 세션의 단서 인벤토리에 Firestore 저장
4. **평가**: 최종 제출 시 전체 대화 기록과 수집 단서를 바탕으로 Gemini가 루브릭에 따라 채점 및 결과 생성

# 섹션 4. 폴더 구조
```
/app
  /opening/page.tsx           # 오프닝 화면 (사건 브리핑)
  /interview/[characterId]/page.tsx # 메인 인터뷰 화면
  /inventory/page.tsx         # 추리 노트 모달/화면
  /submission/page.tsx        # 최종 제출 화면
  /evaluation/page.tsx        # 평가 보고서 화면
  /api
    /chat/route.ts            # Gemini 채팅 인터페이스
    /evaluate/route.ts        # 최종 평가 로직
    /session/route.ts         # 세션 생성 및 관리
/components
  /ui                         # Bubble, PaperCard, ClueToast 등 공통 UI
  /screens                    # MainScreen, InventoryScreen 등 도메인별 화면 컴포넌트
/lib
  /firebase.ts                # Firebase 클라이언트 SDK 초기화
  /gemini.ts                  # Gemini API 클라이언트 (Server-side)
  /clue-parser.ts             # <clues> 태그 및 응답 파싱 유틸리티
  /keyword-matcher.ts         # 키워드 기반 단서 백업 검증 로직
/store
  /gameStore.ts               # 게임 전체 상태 (세션, 현재 캐릭터 등)
  /conversationStore.ts       # 대화 기록 상태
  /clueStore.ts               # 수집된 단서 상태
/types
  /game.ts                    # Clue, Character, Session, Conversation 타입 정의
/prompts
  /characters                 # jung-minho.md 등 5인 시스템 프롬프트
  /echo.md                    # ECHO 시스템 프롬프트
  /evaluator.md               # 평가관 AI 시스템 프롬프트
/public                       # 오디오, 이미지 등 정적 에셋
/docs                         # 프로젝트 설계 및 기획 문서
```

# 섹션 5. 데이터 모델
```typescript
// 단서 정의
export interface Clue {
  id: string;
  code: string;
  category: 'F' | 'L' | 'KEY' | 'RH';
  characterId: string;
  content: string;
  timestamp: number;
  triggerKeywords: string[];
}

// 캐릭터 정의
export interface Character {
  id: string;
  name: string;
  role: string;
  color: string;
  totalClues: number;
}

// 세션 정의
export interface Session {
  id: string;
  userId: string;
  userName: string;
  startedAt: number;
  status: 'playing' | 'submitted' | 'evaluated';
  turnsUsed: Record<string, number>; // characterId -> turn count
}

// 메시지 정의
export interface Message {
  id: string;
  sessionId: string;
  characterId: string;
  role: 'user' | 'character' | 'echo' | 'system';
  content: string;
  emotion?: string;
  cluesFound?: string[];
  timestamp: number;
}

// 최종 제출 데이터
export interface Submission {
  sessionId: string;
  accusedCharacterId: string;
  selectedEvidence: string[]; // Clue codes
  narrative: string;
  submittedAt: number;
}

// 평가 결과
export interface Evaluation {
  sessionId: string;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  progressRate: number;
  categoryScores: Record<string, number>;
  characterScores: Record<string, number>;
  narrativeScore: number;
  feedback: string;
  evaluatedAt: number;
}
```

**Firestore 컬렉션 구조:**
- `/sessions/{sessionId}` (문서): 세션 기본 정보
  - `/sessions/{sessionId}/messages/{messageId}` (하위 컬렉션): 대화 이력
  - `/sessions/{sessionId}/clues/{clueId}` (하위 컬렉션): 발견된 단서 목록
  - `/sessions/{sessionId}/result` (단일 문서): 제출 및 평가 결과
- `/analytics/{date}` (문서): 일별 통계 수집용

# 섹션 6. AI 연동 사양
- **6.1 프롬프트 로딩**: 캐릭터별 `.md` 프롬프트 파일을 빌드 타임에 문자열로 로드하여, 런타임 시 Gemini API의 `system_instruction`으로 주입합니다.
- **6.2 컨텍스트 관리**: 토큰 비용 및 정확도를 위해 캐릭터별 슬라이딩 윈도우를 적용합니다. 최근 20턴의 대화만 전달하며, 그 이전 기록은 필요시 요약하여 주입합니다.
- **6.3 응답 태그 파싱**: Gemini 응답에서 `<emotion>...</emotion>`, `<clues>code1,code2</clues>`, `<scene>...</scene>` 등을 정규식으로 추출하여 상태를 업데이트하고, 본문 텍스트에서는 해당 태그를 제거한 후 사용자에게 표시합니다.
- **6.4 키워드 백업 검증**: AI가 단서 태그를 누락할 경우를 대비하여, `keyword-matcher.ts`가 응답 텍스트 내 `triggerKeywords`를 검사해 단서를 자동 감지하고 인벤토리에 추가합니다.
- **6.5 ECHO 호출**: `echo.md` 프롬프트를 사용하여 현재 세션에서 수집된 모든 단서 목록과 마지막 5개 메시지를 컨텍스트로 전달하여 조언을 생성합니다.
- **6.6 평가 호출**: `evaluator.md` 시스템 프롬프트에 `docs/05-evaluation-rubric.md` 내용을 포함하여 최종 제출 데이터(지목, 증거, 서술)를 종합 채점합니다.
- **6.7 Gemini API 호출 예시**:
```typescript
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

const chat = model.startChat({
  history: history,
  systemInstruction: systemPrompt,
});

const result = await chat.sendMessage(userMessage);
const response = await result.response;
const text = response.text();
```

# 섹션 7. 상태 관리 사양 (Zustand)
```typescript
// gameStore 골격
interface GameState {
  currentScreen: string;
  sessionId: string | null;
  currentCharacterId: string;
  turnsUsed: Record<string, number>;
  gameStatus: 'idle' | 'playing' | 'finished';
  startGame: (name: string) => Promise<void>;
  switchCharacter: (id: string) => void;
  endGame: () => void;
}

// clueStore 골격
interface ClueState {
  collectedClues: Set<string>; // code list
  addClue: (clue: Clue) => void;
  hasClue: (code: string) => boolean;
  getProgressByCategory: () => Record<string, number>;
}
```

# 섹션 8. 화면 라우팅
- `/` : 오프닝 (사건 브리핑 및 이름 입력)
- `/interview/[characterId]` : 메인 인터뷰 (5명 캐릭터 자유 전환)
- `/inventory` : 추리 노트 (모달 또는 별도 페이지)
- `/submission` : 최종 제출 (범인 지목 및 증거 선택)
- `/evaluation` : 평가 보고서 (최종 등급 및 피드백)

**중도 이탈 처리**: MVP 단계에서는 새로고침 시 현재 세션 데이터를 폐기하고 오프닝으로 리다이렉트하여 비용과 복잡도를 관리합니다.

# 섹션 9. API 사양
- **9.1 POST /api/session**: { userName } 요청 시 익명 로그인 후 세션 생성 및 ID 반환 (201 Created)
- **9.2 POST /api/chat**: { sessionId, characterId, message } 요청 시 Gemini 호출 및 파싱 결과 반환 (200 OK)
- **9.3 POST /api/evaluate**: { sessionId, accusedCharacterId, selectedEvidence, narrative } 요청 시 평가 수행 (200 OK)
- **9.4 GET /api/evaluation/{sessionId}**: 특정 세션의 평가 결과 조회 (200 OK)
- **에러 응답**: 400(잘못된 요청), 401(인증 실패), 429(속도 제한), 500(서버 오류) 형식 준수

# 섹션 10. 보안 및 비용 관리
- **10.1 Firestore 보안 규칙**: `request.auth != null` 확인 및 `resource.data.userId == request.auth.uid` 검증을 통해 본인 세션만 접근 가능하도록 설정합니다.
- **10.2 API 키 보호**: 모든 API 키는 `env` 변수로 관리하며 Cloudflare Pages Functions 환경에서만 사용됩니다. 클라이언트 사이드 SDK 키는 보안 규칙으로 보호합니다.
- **10.3 Rate Limiting**: IP 및 세션 ID 기반으로 분당 30회 이상의 호출을 제한하여 무분별한 API 비용 발생을 방지합니다.
- **10.4 비용 상한**: Google Cloud Console 및 Firebase Console에서 예산 알림(50%, 80%, 100%) 및 일일 할당량(Gemini API 등)을 설정하여 돌발 지출을 막습니다.

# 섹션 11. 배포 및 운영
- **11.1 초기 설정**: GitHub 리포 연동 및 Cloudflare Pages 자동 배포(CI/CD) 설정. Firebase 프로젝트 및 Firestore 인스턴스 생성.
- **11.2 빌드 환경**: Next.js 14 최적화 빌드 수행 (`npm run build`). Node.js 20+ 환경 권장.
- **11.3 도메인**: `project-kronos.pages.dev` 무료 도메인으로 시작 후 상용 서비스 시 커스텀 도메인 연결.
- **11.4 운영 모니터링**: Cloudflare Analytics 및 Firebase Usage Dashboard를 통해 실시간 트래픽 및 DB 읽기/쓰기량 상시 모니터링.
- **11.5 비용 시뮬레이션**: 1회 플레이(약 50턴 내외) 당 Gemini 3 Flash 비용은 매우 저렴하여, 동시 50명 접속 시에도 전체 운영비 2,000원 이하 유지가 가능할 것으로 예상됩니다.
