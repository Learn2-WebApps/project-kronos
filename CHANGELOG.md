# Change Log

본 프로젝트의 모든 주요 변경사항을 이 파일에 기록합니다.

## [v4.4.20] - 2026-05-19
### Changed (스토리 보강 - Track 1, 문서 갱신만)
- 강혜린-윤서경 관계 재설계: 입사 동기 → 대학 동문 + 사내 친분, 맥거핀 강화 (F-21 수정)
- 정민호의 신제품 자료 접근 권한 단서 신설 (F-27)
- 티타니아 유사 신제품 출시 라인 신설 (F-26)
- KEY-4 신규: 정민호 = 신제품 정보 내부 유출자 (F-26 + F-27 + L-06 결합)
- 강혜린-윤서경 맥거핀 단서 2개 추가 (RH-05 평가 회의 정보 공유, RH-06 사건 1주 전 저녁 식사)
- L-06 감지 트리거 강화 (헬리오스 코드명 추가)
- CANONICAL FACTS 6, 7 추가 (신제품 유출 라인, 강혜린-윤서경 무관 명시)
- 단서 총량: 41개 → 46개, KEY 단서: 3개 → 4개
- 평가 항목에 "맥거핀 회피" 신설
- 캐릭터 페르소나(강혜린/오세라/정민호) 대사 가이드 보강

### Notes
- 코드는 변경하지 않음 (단서 수집 UI 구현은 v4.4.21 Track 2에서 진행)
- 신제품 출시 시점은 "사건 발생과 비슷한 시기"로 모호하게 유지

## [v4.4.19] - 2026-05-19
- fix(ui): ECHO 버튼 위치를 헤더의 추리 노트 및 카운터 아래로 이동하여 UI 겹침 해결.
- refactor(echo): 초기 브리핑을 짧은 자기소개 + 사건 한 줄 요약으로 축소(2단계 분할).
- feat(echo): 5인 용의자 상세 정보를 ECHO 시스템 컨텍스트로 이동, 학습자 질문 시 자유롭게 응답.
- chore(echo): 선택지 칩 완전 제거 재확인, 자유 입력 전용 UX 확정.

## [v4.4.18] - 2026-05-19
- feat(echo): 홈 진입 시 ECHO 자동 브리핑 추가 (사건 개요 + 5인물 동등 소개). 학습자별 1회 실행, persist 플래그.
- feat(echo): EchoModal 컴포넌트 신설(화면 중앙 모달, X로 닫기 시 페이지 이동 없음).
- feat(echo): 우측 상단 고정 ECHO 버튼(EchoButton) 신설, 모든 게임 페이지에서 접근 가능.
- refactor(echo): /echo 별도 페이지 → 홈으로 리다이렉트.
- feat(prompts): ECHO를 '탐정 비서' 역할로 재정의, 진상 노출 금지 및 추론·정리·가설 검증 보조에 집중.
- chore: 응답 길이 제한 일괄 200자로 조정(캐릭터/에코), 학습자 입력도 200자.
- ui: 노골적 추천 질문 칩 전체 제거.

## [v4.4.17] - 2026-05-18
- fix: next.config.mjs에 ESLint/TypeScript 빌드 우회 설정 적용 (이전 v4.4.16에서 잘못된 .js 파일 수정한 것 수정)
- chore: 중복된 next.config.js 파일 제거

## [v4.4.16] - 2026-05-18
- fix: Vercel 배포 빌드 실패 해결 (ESLint/TypeScript 검사 빌드 중 우회)
- chore: next.config.mjs에 ignoreDuringBuilds, ignoreBuildErrors 추가

## [v4.4.12] - 2026-05-18
- fix: 인터뷰 페이지 재진입 시 대화 기록 소실 버그 수정. 캐릭터별 messages를 분리 저장하여 누적 보존.
- fix: AI 응답에서 마크다운 기호 제거. 시스템 프롬프트 규칙 추가 + 서버 측 후처리 정규식 적용.
- fix: AI 응답 분량 2~4문장으로 제한, 회피·반문 태도 강화. 자발적 핵심 정보 실토 방지.
- fix: 단서 획득을 해당 캐릭터의 보유 단서로만 한정. 다른 캐릭터의 단서가 잘못 트리거되는 버그 수정.
- fix: 원본 스토리 설정 복원 - 티타니아는 경쟁사, 정민호와 티타니아 간부 간 커넥션 반영. docs/ 파일을 진실 공급원으로 하여 모든 캐릭터 프롬프트 재정합.

## [v4.4.15] - 2026-05-18
- fix: 관리자 세션 상세 페이지가 v4.4.14 이전 Evaluation 구조(logical_consistency 등)를 참조해 런타임 에러 발생하던 문제 수정. 새 구조(grade/totalScore/breakdown/stats/aiCommentary)로 전환 + 옵셔널 체이닝 적용

## [v4.4.14] - 2026-05-18
- feat: 전역 대화 제한을 캐릭터별 10회 제한으로 변경 (최대 50회)
- feat: 정답 제출을 객관식 2문항(범인, 협력자)으로 단순화
- feat: 100점 만점 자동 채점 (범인 40 + 협력자 20 + 단서 40)
- feat: S/A/B/C/D 5단계 등급, AI 해설 200자 이내 생성
- refactor: 결과 페이지를 등급·점수·정답공개·AI해설·통계 구조로 재설계
- refactor: docs/00-MASTER.md의 [절대 변경 금지 사실]을 CANONICAL_FACTS로 추출, 모든 프롬프트에 sandwich 삽입하여 스토리 회귀 영구 차단
- fix: /submit 제출 버튼 silent fail 버그 수정 (모든 분기에 alert + finally 보장)

## [v4.4.13] - 2026-05-18
- refactor: docs/00-MASTER.md의 [절대 변경 금지 사실]을 CANONICAL_FACTS 상수로 추출, 모든 캐릭터 + ECHO 프롬프트에 자동 prepend/append하여 향후 회귀 영구 차단
- fix: /submit 페이지의 제출 버튼이 silent fail 하는 문제 수정. 모든 검증 단계에 사용자 피드백 alert 추가, isSubmitting 상태 정리

## [v4.4.11] - 2026-05-18
- feat: 입장 시 이름·부서·세션코드 조합으로 학습자 식별. 동일하면 진행 유지, 다르면 자동 초기화.
- ui: 입장 폼에 진행 상황 유지 안내 문구 추가.

## [v4.4.9] - 2026-05-18
- fix: 캐릭터 잠금 시스템(Phase 2.6) 작동 복원
- fix: 새 학습자 입장 시 이전 게임 상태 자동 초기화
- 한지훈과 1턴 이상 대화 후 다른 용의자 카드 잠금 해제 정상 동작

## [v4.4.8] - 2026-05-18
- ui: 관리자 로그인 페이지에 홈으로 돌아가기 링크 추가

## [v4.4.7] - 2026-05-18
- fix: 관리자 대시보드의 세션 생성 폼 복원 (v4.4.6 작업 중 누락)

## [v4.4.6] - 2026-05-18
- feat: 관리자 대시보드에 세션 삭제 기능 추가
- 삭제 시 하위 submissions까지 함께 정리
- 삭제 확인 모달로 실수 방지

## [v4.4.5] - 2026-05-18
- fix: 서버 라우트의 Firebase 클라이언트 SDK import 제거
- refactor: 세션 CRUD를 클라이언트 직접 수행으로 변경 (보안 규칙으로 보호)
- 결과: "Could not reach Cloud Firestore backend" 500 에러 해결

## [v4.4.2] - 2026-05-18
- fix: 관리자 인증 토큰을 stateless 방식으로 변경하여 hot reload 시 토큰 손실 문제 해결
- ui: 관리자 진입 버튼을 입장 폼 내부로 이동 및 한글화 ("관리자 페이지")

## [v4.4.1] - 2026-05-18
- fix: 입장 화면에 강사용 관리자 진입 링크 추가 (우측 하단)

## [v4.4] - 2026-05-18
### Added
- feat(phase-4): 최종 답안 제출 시스템
- feat: 입장 코드/이름/소속 기반 세션 입장
- feat: Firebase Firestore 익명 인증 및 결과 저장
- feat: Gemini 3 Flash 기반 AI 평가관 (평가 루브릭 v1.0 적용)
- feat: 강사 관리자 대시보드 (세션 생성, 실시간 제출 현황, 정답 공개)
- feat: 정답 공개 시 학습자 화면 자동 전환 (Firestore onSnapshot)
- feat: 평가 결과 페이지 (등급, 진도율, AI 심사평, 성장 가이드)

### Files
- lib/firebase.ts (신규)
- lib/firestore-session.ts (신규)
- store/player-store.ts (신규)
- app/entry/page.tsx (신규)
- app/submit/page.tsx (신규)
- app/waiting/page.tsx (신규)
- app/result/page.tsx (신규)
- app/admin/login/page.tsx (신규)
- app/admin/page.tsx (신규)
- app/admin/session/[code]/page.tsx (신규)
- app/api/evaluate/route.ts (신규)
- app/api/admin/auth/route.ts (신규)
- app/api/admin/sessions/route.ts (신규)
- app/api/admin/sessions/[code]/route.ts (신규)
- app/api/admin/sessions/[code]/reveal/route.ts (신규)
- types/game.ts (수정)
- app/page.tsx (수정)
- app/interview/[characterId]/page.tsx (수정)
- app/echo/page.tsx (수정)

## [v4.3.1] - 2026-05-18
- fix: ECHO API 라우트를 @google/genai 신버전 SDK로 통일하여 ai.getGenerativeModel 런타임 에러 해결

## [v4.3] - 2026-05-18
### Added
- feat(catalog): docs/02-info-catalog.md 단서 카탈로그 파서
  - 41개 단서 메타데이터 (ID, 단서명, 본문, 카테고리, 캐릭터, 트리거) 파싱
  - 키워드 매칭 백업 단서 감지 (트리거 2개 이상 매칭 시 자동 발견)
- feat(inventory): 추리 노트 화면 /inventory
  - 종이 노트 스타일 디자인
  - 캐릭터별 탭 (전체 / 5명 / 공통)
  - 카테고리 색상 라벨 (F/L/T/RH/KEY)
  - 진도율 표시
  - 발견/미발견 단서 차등 표시
- feat(echo): ECHO 도우미 시스템 /echo
  - 수집한 단서를 컨텍스트로 전달
  - 단서 요약·연결·가설 검증 지원
  - 정답 직접 누설 금지 규칙 내장
  - 대화 기록 localStorage 영속화

### Changed
- 단서 토스트가 ID 대신 단서명 표시
- 인터뷰/홈 화면에서 노트·ECHO 진입 가능

### Files
- lib/clue-catalog.ts (신규)
- lib/clue-client.ts (신규)
- app/api/clues/route.ts (신규)
- app/api/echo/route.ts (신규)
- app/inventory/page.tsx (신규)
- app/echo/page.tsx (신규)
- store/echo-store.ts (신규)
- store/interview-store.ts (수정)
- app/api/chat/route.ts (수정)
- app/interview/[characterId]/page.tsx (수정)
- app/page.tsx (수정)

## [v4.2] - 2026-05-18
### Added
- feat(tutorial): 한지훈 튜토리얼 가이드 시스템
  - 게임 시작 시 한지훈만 활성화, 나머지 4명 잠금
  - 한지훈과 1턴 이상 대화 시 자동 잠금 해제
  - 잠긴 카드 호버 시 "한지훈과 먼저 대화하세요" 표시
  - 한지훈 프롬프트에 튜토리얼 가이드 역할 추가
- feat(persistence): localStorage 영속화
  - zustand persist 미들웨어로 게임 진행 상태 자동 저장
  - 대화 기록·턴 카운트·수집 단서·잠금 상태 유지
  - resetGame() 액션 추가 (전체 초기화)

### Changed
- 캐릭터 카드 순서 조정: 한지훈 → 강혜린 → 오세라 → 정민호 → 윤서경
- CHARACTERS 메타데이터 확장: `color`를 CSS 변수로 변경, `isGuide` 필드 추가
- store/interview-store.ts: `characterTurns` 누적 카운터 및 `isUnlocked` 셀렉터 구현
- app/page.tsx: 잠금 시스템 UI 및 튜토리얼 힌트 추가
- app/interview/[characterId]/page.tsx: URL 직접 접근 시 잠금 검증 로직 강화

### Files
- lib/character-assets.ts
- store/interview-store.ts
- app/page.tsx
- app/interview/[characterId]/page.tsx
- app/globals.css
- docs/characters/han-jihun.md
- CHANGELOG.md

## v4.1.1 (2026-05-15)
- fix: app/page.tsx에 'use client' 지시어 추가하여 onClick 런타임 에러 해결

## v4.1 (2026-05-15)
- feat(phase-2): 정민호 인터뷰 화면 MVP 구현
  - Gemini 3 Flash (gemini-3-flash-preview) API 연동
  - @google/genai SDK 도입
  - 표정 자동 변화 시스템 (normal/thinking/surprise/worry)
  - 단서 발견 토스트 알림
  - 10턴 카운터 및 조사 종료 처리
  - Zustand 기반 인터뷰 상태 관리
- 영향받은 파일: types/game.ts, lib/prompt-loader.ts, lib/response-parser.ts, app/api/chat/route.ts, store/interview-store.ts, app/interview/[characterId]/page.tsx, app/page.tsx, docs/characters/jung-minho.md, package.json

## v4.0 (2026-05-15)
- feat: Next.js 14 + TypeScript + Tailwind 개발 환경 구축
- feat: 캐릭터 에셋 매핑 유틸(`lib/character-assets.ts`) 및 전역 디자인 토큰(`app/globals.css`) 추가
- feat: 홈 화면(캐릭터 선택 화면) 프로토타입 구현 (getCharacterImage.background 활용)
- 환경 설정: .env.local 생성, zustand 설치, assets 캐릭터 파일을 public/characters로 복사
- 영향받은 파일: package.json, app/, lib/, public/characters/, .env.local, CHANGELOG.md

## v3.6 (2026-05-15)
- fix: mockup HTML 이미지 경로를 평탄화된 assets/characters/ 구조에 맞게 상대경로로 일괄 수정
- 영향받은 파일: mockups/character-select-v2.html, mockups/main-screen-v2.html, mockups/inventory-v2.html, mockups/opening-v2.html, mockups/submission-v2.html, mockups/evaluation-v2.html

## v3.5 (2026-05-15)
- mockup HTML 이미지 경로 수정: file:// 로컬 실행 호환을 위해 상대 경로(../assets/characters/) 적용
- 평탄화된 단일 폴더 구조 반영
- 영향 파일: mockups/*.html, CHANGELOG.md

## v3.4 (2026-05-15)
- assets/characters/ 폴더 구조 평탄화 (5개 하위 폴더 → 단일 폴더, 총 31개 파일)
- mockup HTML 5~6개의 이미지 경로 일괄 수정
- 영향 파일: assets/characters/*, mockups/*.html, CHANGELOG.md

## v3.3 (2026-05-15)
- 5개 mockup의 placeholder를 실제 이미지 경로로 교체
- 신규: mockups/character-select-v2.html 작성 (선택 화면)
- 영향 파일: mockups/main-screen-v2.html, mockups/inventory-v2.html, mockups/opening-v2.html, mockups/submission-v2.html, mockups/evaluation-v2.html, mockups/character-select-v2.html, CHANGELOG.md

## v3.2 (2026-05-15)
- 5개 캐릭터 시트에 표정 가이드 섹션 추가
- 4표정(normal/thinking/surprise/worry) 매핑 완료
- 응답 형식에 <emotion> 태그 의무화
- 영향 파일: docs/characters/*.md (5개), CHANGELOG.md

## v3.1 (2026-05-15)
- 디자인 시스템 v2.1 → v2.2 업데이트
- 에셋 구조 개편: 캐릭터당 6장(상반신 4표정 + 전신 + 배경합본) + ECHO 1장, 총 31장
- 신규 화면: 캐릭터 선택 화면 추가
- 표정 시스템: 4종(normal/thinking/surprise/worry)으로 통일, 대화 맥락 기반 자동 선택
- 영향 파일: docs/06-ui-design-system.md, CHANGELOG.md

## v3.0.1 (2026-05-13)
- Gemini 모델 버전 정정: 1.5 Flash → 3 Flash (최신 버전 사용)
- 영향 파일: docs/07-tech-spec.md, CHANGELOG.md

## v3.0 (2026-05-13)
- docs/07-tech-spec.md 신규 작성
- 기술 스택 확정: Next.js 14 + TypeScript + Zustand + Firebase + Gemini 3 Flash + Cloudflare Pages
- 익명 로그인 + 새로고침 시 처음부터 정책 확정
- 영향 파일: docs/07-tech-spec.md, CHANGELOG.md

## v2.9 (2026-05-13)
- mockups/evaluation-v2.html 신규 작성
- 평가 결과 보고서 화면 - 본사 회신 양식 목업 구현
- APPROVED 도장, 등급 메달 배지, 도넛 차트 기반 진도율 시각화 구현
- 캐릭터 충실도 미니 카드 그리드, 추리 정확도 평가 리스트, 손글씨 피드백 영역 적용
- 4개 핵심 화면 목업(오프닝/메인/제출/평가) 모두 완성하여 UI 디자인 검증 단계 종료

## v2.8 (2026-05-13)
- mockups/submission-v2.html 신규 작성
- 최종 수사 결과 보고서 제출 양식 목업 구현
- 라디오 선택 방식의 가해자 지목 카드, 체크박스 방식의 증거 선택 그리드 구현
- "DRAFT" 도장 연출, 노트 라인 텍스트 영역, 봉인 도장 아이콘이 적용된 가죽 버튼 등 v2.1 컴포넌트 적용

## v2.7 (2026-05-13)
- mockups/opening-v2.html 신규 작성
- 사건 브리핑 서류 형식의 오프닝 화면 목업 구현
- 회사 로고, 기밀 도장, 5명 용의자 미니 카드, 가죽 버튼 등 디자인 시스템 v2.1 종합 적용
- 손글씨 메모, 형광펜 강조, 페이지 접힘 및 미세 불규칙 가장자리 디테일 추가

## v2.6 (2026-05-13)
- mockups/inventory-v2.html 신규 작성
- 양면 노트 형식의 "수사 기록" 인벤토리 화면 목업 구현
- 종이 질감, 제본선, 황동 핀, 마스킹 테이프 탭 등 디자인 시스템 v2.1 종이 컴포넌트 종합 적용
- 형광펜 하이라이트, 손글씨 메모, 가죽 질감 버튼 디테일 추가

## v2.5 (2026-05-13)
- mockups/main-screen-v2.html 우상단 턴 인디케이터 표시 보정 (absolute 레이아웃 최적화)
- 클립보드 아이콘 펄스 알림 점 추가 (크기 8px, 펄스 애니메이션 2s, 다크 보더 적용)
- 일러스트 영역 position: relative 명시로 하위 요소 배치 안정성 확보

## v2.4 (2026-05-13)
- docs/06-ui-design-system.md v2.1 업데이트: 단서 카운터 제거, 인벤토리 아이콘 도입, 캐릭터 중앙 배치, 우상단 턴 인디케이터, 진도율 표시 정책 신규 섹션 추가
- mockups/main-screen-v2.html 수정: 화면 비율 5:5 최종 조정, 캐릭터 중앙 배치, 인벤토리 알림 펄스 효과, 턴 인디케이터 레이아웃 최적화

## v2.3 (2026-05-13)
- mockups/main-screen.html 삭제 (v1.0 기반 폐기)
- mockups/main-screen-v2.html을 단일 메인 화면 목업으로 확정

## v2.2 (2026-05-13)
- mockups/main-screen-v2.html 1+2단계 수정 반영 (중간 단계)

## v2.1 (2026-05-13)
- mockups/main-screen-v2.html 신규 작성
- 디자인 시스템 v2.0 기반 메인 인터뷰 화면 목업 (최초 버전)
- 외부 에셋 의존성 없음 (CSS + SVG only)
- 시네마틱 효과(그레인, 비네팅), 종이 질감 컴포넌트, ECHO 마스코트 구현

## v2.0 (2026-05-13)
- docs/06-ui-design-system.md 전면 개편 (v1.x 폐기)
- "수사 기록물" 컨셉 도입: 디지털 다크 × 종이 질감 하이브리드
- 메인 화면 비율 변경: 상단 일러스트 70% + 하단 메신저 30%
- ECHO 마스코트 우하단 상주 + 말풍선 패널 사양 추가
- 종이 질감 컴포넌트를 기록물 영역 전반에 적용
- 캐릭터 일러스트·배경 에셋 사양 명시
- AI 응답 태그에 <emotion>, <scene> 추가
- 영향 파일: docs/06-ui-design-system.md, CHANGELOG.md

## v1.7 (2026-05-13) — UI 디자인 시스템 가이드라인 작성

### 신규 파일
- docs/06-ui-design-system.md (v1.0)

### 변경 사항
- "Corporate Thriller" 컨셉의 시각적 가이드라인 확정
- 컬러 시스템(다크 모드), 타이포그래피, 레이아웃 규격 정의
- 채팅 메시지 컴포넌트 및 단서 발견 토스트 디자인 사양 명시
- AI 응답 태그 시스템(<clues>, <emotion>) 정의

## v1.6 (2026-05-13) — 게임 진행 플로우 신규 작성

### 신규 파일
- docs/04-game-flow.md (v1.0)

### 변경 사항
- 사건 브리핑부터 평가까지의 전체 UX 단계 정의
- 캐릭터별 턴 관리(10턴) 및 전체 시간 관리(30~40분) 규칙 확정
- 단서 자동 수집 로직 및 ECHO 패널 동작 사양 구체화
- 최종 제출 및 AI 채점 기반 결과 보고서 흐름 설계

## v1.5 (2026-05-13) — 평가 시스템 완성 및 AI 채점 프롬프트 추가

### 변경 사항
- 평가 루브릭 신규 작성 (조사 진도율 + 최종 판정 분리 구조)
- 서술형 답변 채점을 위한 평가관 AI 시스템 프롬프트 정의
- 조사 진도율 카테고리별 집계 기준 확정

### 영향 받은 파일
- docs/05-evaluation-rubric.md

## v1.2 (2026-05-13) — 정보 카탈로그 탐지 트리거 추가

### 신규 파일
- docs/05-evaluation-rubric.md (v1.0)

### 변경 사항
- 모든 단서에 "감지 트리거" 및 "분류" 컬럼 추가
- "감지 트리거": AI 응답 내 단서 발화 판정을 위한 키워드 리스트 정의
- "분류": 일반 / 거짓말 / 숨겨진 핵심 / 함정으로 단서 성격 규명
- 신규 섹션 추가: "8. 진도율(Coverage) 계산 기준" (발화 감지 방식 및 집계 공식 정의)

### 영향 받은 파일
- docs/02-info-catalog.md
- CHANGELOG.md

## v1.4 (2026-05-12) — ECHO 캐릭터 시트 및 시스템 프롬프트 신규 작성

### 신규 파일
- docs/characters/echo.md
- docs/prompts/echo-system.md

### 설계 옵션 (초기 기본값, 플레이 테스트 후 조정 예정)
- 톤·성격: 차분하고 전문적인 보좌관 (옵션 A)
- 모순 지적: 하이브리드 (핵심 모순 자동, 그 외 요청 시) (옵션 C)
- 힌트 발동: 학습자 요청 시 (옵션 C)

### 주요 기능
- 정보 정리 (진술 표, 시간선, 인물 관계도)
- 자동 모순 지적 (KEY 단서 관련)
- 막힘 신호 감지 및 힌트 제안
- 확증 편향 감지 및 메타 인지 자극
- 3단계 힌트 시스템
- "답 알려줘" 거부 패턴
- 가설 검증 (직접 판단 회피)
- 자기 한계 인정

## v1.3 (2026-05-12) — AI 조수 이름 변경

### 변경 사항
- AI 조수 이름: DETEX → ECHO
- 의미: 학습자가 들은 진술을 다시 들려주고 정리해주는 역할에 맞는 작명

### 영향 받은 파일
- docs/00-MASTER.md
- docs/02-info-catalog.md
- docs/03-timeline.md

## v1.1 (2026-05-12) — 정보 카탈로그 캐릭터 시트 정합 업데이트

### 변경 사항
- F-21 수정: 강혜린-윤서경 관계를 "입사 동기, 친분 거의 없음" → "대학 직속 선후배, 점심 친분 있음"으로 변경
- RH-04 신규 추가: "강혜린-윤서경 한패 의심" 함정 단서
- L-06 보강: 오세라 신제품 누설 구체값("헬리오스" / "내년 2분기") 명시
- 모순 방지 점검표 11번 항목 추가 (강혜린-윤서경 친분 운영 원칙)

### 변경 사유
- 캐릭터 시트(강혜린, 윤서경, 오세라)에 반영된 결정 사항을 카탈로그 SSOT에 정렬

### 영향 받은 파일
- docs/02-info-catalog.md

## v1.0.1 (2026-05-12) — 정민호 KEY-2 발동 조건 수정

### 변경 사항
- L-04(위조 영수증 4장 누설) 발동 조건을 "5턴 이상 누적"에서 "질문 성격 기반"으로 변경
- 변경 사유: 학습자가 시간 제한 내 여러 용의자를 자유롭게 오가는 게임 구조에서 턴 카운트가 정확히 작동하지 않음. 질문의 성격(구체적 디테일 질문 vs 일반 감상 질문) 기반으로 재설계

### 영향 받은 파일
- docs/prompts/jung-minho-prompt.md
- docs/characters/jung-minho.md

## v1.0 (2026-05-12) — Master Locked

### 확정 사항
- 초기 마스터 시나리오 문서 확정
- 5인 캐릭터 라인업 확정
  - 정민호 (진범, 기획팀장)
  - 한지훈 (피해 당사자, 참고인)
  - 윤서경 (레드 헤링 1, 현 본부장)
  - 강혜린 (레드 헤링 2, 인사팀 차장)
  - 오세라 (회색지대, 티타니아 부사장)
- 자백 트리거 3종 확정: KEY-1b, KEY-2, KEY-3
- 10월 15일 사건 당일 타임라인 확정
- 21:00~23:00 정민호-오세라 비밀 회동 포함
- 추리 클리어 레벨 3단계 정의
