export type ClueType = 'F' | 'L' | 'KEY' | 'RH' | 'T';
export type ClueCategory = ClueType; // Alias for compatibility
export type ClueLevel = 1 | 2 | 3;

export interface ClueDefinition {
  id: string;
  type: ClueType;
  title: string;
  content: string;
  owners: string[];
  triggers: string[];
  level: ClueLevel;
  note?: string;
  name?: string; // Compatibility
}

export type ClueMetadata = ClueDefinition; // Alias for compatibility

export const CLUE_CATALOG: Record<string, ClueDefinition> = {
  // --- 사건 객관 사실 ---
  'F-01': {
    id: 'F-01',
    type: 'F',
    title: '제보 메일 수신 시각',
    name: '제보 메일 수신 시각',
    content: '익명 제보 메일은 10월 15일 23:47에 수신되었습니다.',
    owners: ['kang-hyerin', 'han-jihun', 'jung-minho', 'oh-sera', 'yoon-seokyung'],
    triggers: ['23:47', '11시 47분', '제보 시각', '메일 수신'],
    level: 1
  },
  'F-02': {
    id: 'F-02',
    type: 'F',
    title: '제보 메일 발신 IP',
    name: '제보 메일 발신 IP',
    content: '제보 메일의 발신 IP는 외부 카페의 공용 와이파이로 확인되었습니다.',
    owners: ['kang-hyerin'],
    triggers: ['외부 카페', '와이파이', 'IP 추적', '카페 IP'],
    level: 1
  },
  'F-03': {
    id: 'F-03',
    type: 'F',
    title: '제보 메일 발신 위치',
    name: '제보 메일 발신 위치',
    content: '메일 발신 위치는 정민호 팀장의 자택 근처 카페로 특정되었습니다.',
    owners: ['kang-hyerin'],
    triggers: ['자택 근처', '집 근처 카페', '카페 위치', '자택 부근'],
    level: 2
  },
  'F-04': {
    id: 'F-04',
    type: 'F',
    title: '위조 영수증 존재',
    name: '위조 영수증 존재',
    content: '첨부된 영수증 12장 중 4장이 정교하게 위조된 것으로 확인되었습니다.',
    owners: ['han-jihun'],
    triggers: ['12장', '4장 위조', '영수증 위조', '위조 증거'],
    level: 1
  },
  'F-05': {
    id: 'F-05',
    type: 'F',
    title: '한지훈 권고사직 처리',
    name: '한지훈 권고사직 처리',
    content: '한지훈 상무는 인사 발표 3일 전에 전격적으로 권고사직 처리되었습니다.',
    owners: ['han-jihun', 'kang-hyerin', 'oh-sera', 'jung-minho', 'yoon-seokyung'],
    triggers: ['권고사직', '3일 전', '인사 발표', '퇴사 처리'],
    level: 1
  },
  'F-06': {
    id: 'F-06',
    type: 'F',
    title: '정민호의 직속 발탁',
    name: '정민호의 직속 발탁',
    content: '윤서경 본부장 승진 직후, 정민호 팀장이 그녀의 직속으로 발탁되었습니다.',
    owners: ['han-jihun', 'kang-hyerin', 'oh-sera', 'jung-minho', 'yoon-seokyung'],
    triggers: ['본부장 승진', '윤서경 승진', '직속 발탁', '인사 발령'],
    level: 1
  },
  'F-26': {
    id: 'F-26',
    type: 'F',
    title: '티타니아 유사 제품 출시',
    name: '티타니아 유사 제품 출시',
    content: '노바테크의 신제품(헬리오스)과 유사한 컨셉의 제품이 비슷한 시기에 티타니아에서 먼저 출시되었습니다.',
    owners: ['yoon-seokyung', 'han-jihun'],
    triggers: ['티타니아 신제품', '유사 제품', '정보 유출', '표절', '헬리오스'],
    level: 1
  },
  'F-27': {
    id: 'F-27',
    type: 'F',
    title: '정민호의 자료 접근 권한',
    name: '정민호의 자료 접근 권한',
    content: '정민호는 임원 보좌 업무를 겸하며 신제품 기획 자료에 대한 이례적인 열람 권한을 보유했었습니다.',
    owners: ['kang-hyerin', 'jung-minho'],
    triggers: ['정민호 권한', '신제품 자료 접근', '기획 자료', '열람 권한'],
    level: 2
  },

  // --- 정민호 관련 ---
  'F-07': {
    id: 'F-07',
    type: 'F',
    title: '정민호의 외부 접촉 기록',
    name: '정민호의 외부 접촉 기록',
    content: '작년 가을부터 정민호 팀장에게 외부 헤드헌터들의 비공식 접촉이 있었다는 보고가 있었습니다.',
    owners: ['kang-hyerin'],
    triggers: ['헤드헌터', '비공식 접촉', '외부 접촉', '스카우트'],
    level: 1
  },
  'F-08': {
    id: 'F-08',
    type: 'F',
    title: '컨퍼런스 참석 사실',
    name: '컨퍼런스 참석 사실',
    content: '정민호 팀장은 4월 업계 컨퍼런스에 회사 대표로 참석하여 오세라 부사장을 만났습니다.',
    owners: ['kang-hyerin'],
    triggers: ['컨퍼런스', '노바테크', '대표 참석', '업계 행사'],
    level: 1
  },
  'KEY-3': {
    id: 'KEY-3',
    type: 'KEY',
    title: '임원 제외 사유 문의',
    name: '임원 제외 사유 문의',
    content: '정민호가 강혜린 차장에게 본인이 임원 후보에서 제외된 사유를 비공식적으로 문의했었습니다.',
    owners: ['kang-hyerin'],
    triggers: ['5개월 전', '한 상무 배제', '비공식 문의', '정민호가 물어봤'],
    level: 2
  },
  'F-23': {
    id: 'F-23',
    type: 'F',
    title: '비밀 회동 (삼성동 호텔)',
    name: '비밀 회동 (삼성동 호텔)',
    content: '사건 당일 밤, 정민호와 오세라는 삼성동 호텔 라운지에서 비밀리에 회동했습니다.',
    owners: ['jung-minho'],
    triggers: ['오세라 만남', '호텔 라운지', '비밀 회동', '삼성동'],
    level: 3,
    note: '자백 시 노출'
  },
  'F-24': {
    id: 'F-24',
    type: 'F',
    title: '정민호 귀가 시각 추정',
    name: '정민호 귀가 시각 추정',
    content: '메일 발송 시각을 고려할 때 정민호는 약 23:30경에 자택 근처에 도착한 것으로 보입니다.',
    owners: ['echo'],
    triggers: ['23:30', '귀가 시각', '11시 30분', '도착 시간'],
    level: 2
  },

  // --- 정민호 거짓말 ---
  'L-01': {
    id: 'L-01',
    type: 'L',
    title: '식사 종료 시각 거짓말',
    name: '식사 종료 시각 거짓말',
    content: '정민호는 사건 당일 밤 11시까지 한지훈 상무와 식사했다고 주장하고 있습니다.',
    owners: ['jung-minho'],
    triggers: ['11시', '23시', '11시까지', '늦게까지 같이'],
    level: 1
  },
  'L-02': {
    id: 'L-02',
    type: 'L',
    title: '식사 장소 진술 번동',
    name: '식사 장소 진술 번동',
    content: '정민호는 식사 장소를 강남이라고 했다가 여의도라고 하는 등 진술이 엇갈리고 있습니다.',
    owners: ['jung-minho'],
    triggers: ['강남', '여의도', '장소 변경', '장소 진술'],
    level: 2
  },
  'L-03': {
    id: 'L-03',
    type: 'L',
    title: '오세라와 면식 부인',
    name: '오세라와 면식 부인',
    content: '정민호는 오세라 부사장과 일면식도 없는 사이라고 주장합니다.',
    owners: ['jung-minho', 'oh-sera'],
    triggers: ['일면식 없다', '모르는 사람', '오세라 누구', '처음 듣는'],
    level: 1
  },
  'KEY-2': {
    id: 'KEY-2',
    type: 'KEY',
    title: '위조 영수증 개수 누설',
    name: '위조 영수증 개수 누설',
    content: '정민호가 비공개 정보인 위조 영수증 개수(4장)를 무심결에 언급했습니다.',
    owners: ['jung-minho'],
    triggers: ['4장', '네 장', '영수증 4', '넉 장'],
    level: 2
  },
  'L-07': {
    id: 'L-07',
    type: 'L',
    title: '귀가 동선 거짓말',
    name: '귀가 동선 거짓말',
    content: '정민호는 식사 후 곧장 집으로 귀가했다고 주장하고 있습니다.',
    owners: ['jung-minho'],
    triggers: ['곧장 귀가', '바로 집에', '헤어진 후 바로', '바로 갔습니다'],
    level: 1
  },

  // --- 한지훈 관련 ---
  'F-10': {
    id: 'F-10',
    type: 'F',
    title: '임원 제외 사유',
    name: '임원 제외 사유',
    content: '한지훈 상무는 정민호에게 아직 "더 다듬어질 시간이 필요하다"고 판단했었습니다.',
    owners: ['han-jihun'],
    triggers: ['더 다듬어져야', '임원 제외 사유', '후보 제외', '아직 부족'],
    level: 1
  },
  'F-11': {
    id: 'F-11',
    type: 'F',
    title: '정민호 육성 계획',
    name: '정민호 육성 계획',
    content: '한지훈은 사실 본부장 승진 후 정민호를 자신의 후계자로 키울 계획을 가지고 있었습니다.',
    owners: ['han-jihun'],
    triggers: ['직접 키울 계획', '본부장 승진 후', '정민호 육성', '후계자'],
    level: 1
  },
  'F-12': {
    id: 'F-12',
    type: 'F',
    title: '실제 식사 종료 시각',
    name: '실제 식사 종료 시각',
    content: '사건 당일 한지훈 상무와 정민호 팀장은 저녁 9시에 식사를 마치고 헤어졌습니다.',
    owners: ['han-jihun'],
    triggers: ['9시', '21시', '9시쯤', '저녁 9시', '헤어진 게 9시'],
    level: 2
  },
  'F-13': {
    id: 'F-13',
    type: 'F',
    title: '법인카드 사용 패턴',
    name: '법인카드 사용 패턴',
    content: '한지훈 상무 본인이 사용한 8장의 영수증은 모두 업무상 정당한 사용이었습니다.',
    owners: ['han-jihun'],
    triggers: ['8장 정상', '내 영수증', '문제 없는', '본인 사용'],
    level: 1
  },
  'F-14': {
    id: 'F-14',
    type: 'F',
    title: '정민호에 대한 신뢰',
    name: '정민호에 대한 신뢰',
    content: '한지훈 상무는 현재까지도 정민호가 자신을 배신했을 것이라고는 상상도 하지 못하고 있습니다.',
    owners: ['han-jihun'],
    triggers: ['의심하지 않음', '절대 아님', '믿고 있는', '정 팀장이 그럴 리'],
    level: 1
  },

  // --- 윤서경 관련 ---
  'F-15': {
    id: 'F-15',
    type: 'F',
    title: '윤서경의 부산 출장',
    name: '윤서경의 부산 출장',
    content: '윤서경 상무는 사건 발생 당시 10월 14일부터 17일까지 부산 출장 중이었습니다.',
    owners: ['han-jihun', 'kang-hyerin', 'oh-sera', 'jung-minho', 'yoon-seokyung'],
    triggers: ['부산 출장', '14~17일', '일정표', '부산에 있었다'],
    level: 1
  },
  'F-16': {
    id: 'F-16',
    type: 'F',
    title: '알리바이 입증자 없음',
    name: '알리바이 입증자 없음',
    content: '사건 당일 밤 9시부터 자정 사이, 윤서경의 행적을 직접 목격한 사람은 없습니다.',
    owners: ['yoon-seokyung'],
    triggers: ['알리바이 없음', '혼자 있었', '객실에', '증명할 사람'],
    level: 2
  },
  'F-17': {
    id: 'F-17',
    type: 'F',
    title: '비서의 진술',
    name: '비서의 진술',
    content: '비서는 윤 상무가 호텔 객실에서 자료를 검토 중이니 방해하지 말라는 지시를 받았다고 진술했습니다.',
    owners: ['kang-hyerin'],
    triggers: ['자료 검토', '방해 금지', '비서 진술', '객실 대기'],
    level: 2
  },
  'F-18': {
    id: 'F-18',
    type: 'F',
    title: '과거 사업성 분석 자료',
    name: '과거 사업성 분석 자료',
    content: '3년 전 부결된 프로젝트에 대해 윤서경이 제시한 자료는 정당한 사업성 분석에 기반한 것이었습니다.',
    owners: ['yoon-seokyung'],
    triggers: ['정당한 분석', '3년 전', '사업성', '객관적 자료'],
    level: 1
  },
  'F-19': {
    id: 'F-19',
    type: 'F',
    title: '한지훈의 라이벌 인정',
    name: '한지훈의 라이벌 인정',
    content: '한지훈 상무는 사석에서 과거 윤서경의 판단이 옳았을지도 모른다고 인정한 바 있습니다.',
    owners: ['han-jihun'],
    triggers: ['판단이 맞았다', '한지훈 인정', '윤 상무 평가', '그때 그 판단'],
    level: 1
  },
  'F-20': {
    id: 'F-20',
    type: 'F',
    title: '정상적인 인력 이동',
    name: '정상적인 인력 이동',
    content: '작년 팀원 이동은 직원의 요청과 한지훈 상무의 사전 양해 하에 이루어진 정상적인 인사였습니다.',
    owners: ['yoon-seokyung'],
    triggers: ['팀원 이동', '사전 양해', '라인 이동', '본인 희망'],
    level: 1
  },

  // --- 강혜린 관련 ---
  'F-21': {
    id: 'F-21',
    type: 'F',
    title: '대학 동문 관계',
    name: '대학 동문 관계',
    content: '강혜린 차장과 윤서경 본부장은 대학 동문이며 사내에서도 평소 가까운 사이입니다.',
    owners: ['kang-hyerin', 'yoon-seokyung'],
    triggers: ['강혜린 윤서경', '두 사람 관계', '친분', '대학'],
    level: 1
  },
  'F-22': {
    id: 'F-22',
    type: 'F',
    title: '인사팀 표준 절차',
    name: '인사팀 표준 절차',
    content: '영수증의 진위를 일일이 검증하는 것은 인사팀의 표준 업무 매뉴얼에 포함되어 있지 않습니다.',
    owners: ['kang-hyerin'],
    triggers: ['표준 절차 아님', '검증 절차', '인사팀 매뉴얼', '특별 조사'],
    level: 1
  },
  'F-25': {
    id: 'F-25',
    type: 'F',
    title: '오세라의 개인 일정',
    name: '오세라의 개인 일정',
    content: '공식 기록상 오세라 부사장의 사건 당일 밤 일정은 개인 일정으로 비어 있습니다.',
    owners: ['kang-hyerin'],
    triggers: ['개인 일정', '비서실 자료', '10월 15일 밤', '일정 비어있음'],
    level: 2
  },

  // --- 오세라 관련 ---
  'T-03': {
    id: 'T-03',
    type: 'T',
    title: '면식 정도 진술',
    name: '면식 정도 진술',
    content: '오세라는 정민호 팀장과 4월에 잠깐 인사만 나눈 정도의 사이라고 주장합니다.',
    owners: ['oh-sera'],
    triggers: ['4월에 잠깐', '인사만', '거의 모르는', '면식만'],
    level: 1
  },
  'T-04': {
    id: 'T-04',
    type: 'T',
    title: '압박 후 면식 시인',
    name: '압박 후 면식 시인',
    content: '추궁 끝에 오세라는 컨퍼런스에서 정민호와 30분 정도 차를 마시며 대화했음을 시인했습니다.',
    owners: ['oh-sera'],
    triggers: ['30분 정도', '차 한잔', '시인', '만나긴 했다'],
    level: 2
  },
  'T-05': {
    id: 'T-05',
    type: 'T',
    title: '티타니아 무관 주장',
    name: '티타니아 무관 주장',
    content: '오세라는 한지훈 사건과 티타니아는 아무런 연관이 없다고 강력히 주장하고 있습니다.',
    owners: ['oh-sera'],
    triggers: ['우리 회사는 무관', '티타니아 무관', '사건 무관', '연관성 없다'],
    level: 1
  },
  'T-06': {
    id: 'T-06',
    type: 'T',
    title: '거짓 알리바이 주장',
    name: '거짓 알리바이 주장',
    content: '오세라는 사건 당일 밤 집에서 혼자 쉬었다고 주장하고 있습니다.',
    owners: ['oh-sera'],
    triggers: ['혼자 쉬었다', '집에서', '알리바이', '외출 안 함'],
    level: 1
  },
  'L-05': {
    id: 'L-05',
    type: 'L',
    title: '영입 협상 부인',
    name: '영입 협상 부인',
    content: '오세라는 정민호 팀장에게 어떤 영입 제안도 한 적이 없다고 거짓말하고 있습니다.',
    owners: ['oh-sera'],
    triggers: ['영입 협상 없었다', '제안 안 함', '협상 부인', '접촉 안 함'],
    level: 2
  },
  'L-06': {
    id: 'L-06',
    type: 'L',
    title: '비공개 사양 누설',
    name: '비공개 사양 누설',
    content: '오세라가 노바테크 신제품의 비공개 디테일(코드명 헬리오스 등)을 무심결에 언급했습니다.',
    owners: ['oh-sera'],
    triggers: ['헬리오스', 'Helios', '사양', '어떻게 알았', '2분기', '내년 출시'],
    level: 2
  },

  // --- 함정 (Red Herring) ---
  'RH-01': {
    id: 'RH-01',
    type: 'RH',
    title: '과거 프로젝트 방해 소문',
    name: '과거 프로젝트 방해 소문',
    content: '3년 전 윤서경이 한지훈의 프로젝트를 정치적으로 막았다는 사내 소문이 있습니다.',
    owners: ['yoon-seokyung'],
    triggers: ['정치적으로 막았다', '프로젝트 방해', '소문', '뒷공작'],
    level: 2
  },
  'RH-02': {
    id: 'RH-02',
    type: 'RH',
    title: '팀원 가로채기 의혹',
    name: '팀원 가로채기 의혹',
    content: '작년 한지훈 상무의 핵심 팀원이 윤서경 상무 라인으로 이동한 정황이 있습니다.',
    owners: ['yoon-seokyung'],
    triggers: ['라인 이동', '팀원 가로채기', '이동 사실', '사람 빼가기'],
    level: 2
  },
  'RH-03': {
    id: 'RH-03',
    type: 'RH',
    title: '절차적 과실 시인',
    name: '절차적 과실 시인',
    content: '강혜린 차장은 익명 제보 메일을 별도 검증 없이 인사위원회로 회부했음을 인정했습니다.',
    owners: ['kang-hyerin'],
    triggers: ['진위 검증 없이', '과실', '바로 보고', '서둘렀다'],
    level: 1
  },
  'RH-04': {
    id: 'RH-04',
    type: 'RH',
    title: '내부 공모 의혹',
    name: '내부 공모 의혹',
    content: '윤서경과 강혜린이 한패라는 근거 없는 사내 의심이 존재합니다.',
    owners: ['yoon-seokyung', 'kang-hyerin'],
    triggers: ['한패', '강혜린 윤서경', '짜고 치는', '내부 공모'],
    level: 2
  },
  'RH-05': {
    id: 'RH-05',
    type: 'RH',
    title: '회의 정보 공유 정황',
    name: '회의 정보 공유 정황',
    content: '강혜린이 한지훈 임원 평가 회의 정보를 윤서경에게 비공식 공유했다는 의혹이 있습니다.',
    owners: ['kang-hyerin'],
    triggers: ['평가 회의', '윤서경에게 공유', '정보 흘림', '비공식 보고'],
    level: 2
  },
  'RH-06': {
    id: 'RH-06',
    type: 'RH',
    title: '사건 전 주 저녁 식사',
    name: '사건 전 주 저녁 식사',
    content: '사건 약 1주 전, 강혜린과 윤서경이 외부에서 단둘이 저녁 식사를 한 사실이 포착되었습니다.',
    owners: ['kang-hyerin', 'yoon-seokyung'],
    triggers: ['최근 만남', '저녁 식사', '둘이서', '1주 전'],
    level: 2
  },

  // --- 핵심 단서 (KEY) ---
  'KEY-1a': {
    id: 'KEY-1a',
    type: 'KEY',
    title: '식사 시간 모순 확인',
    name: '식사 시간 모순 확인',
    content: '한지훈과 정민호의 식사 종료 시각에 대한 진술이 정면으로 충돌합니다.',
    owners: ['echo'],
    triggers: ['9시', '21시', '식사 종료', '헤어진 시간'],
    level: 2
  },
  'KEY-1b': {
    id: 'KEY-1b',
    type: 'KEY',
    title: '2시간의 행적 공백',
    name: '2시간의 행적 공백',
    content: '정민호가 한지훈과 헤어진 21:00부터 메일 발송 23:47 사이의 행적이 불분명합니다.',
    owners: ['echo'],
    triggers: ['공백', '2시간', '행적', '9시부터 11시'],
    level: 2
  },
  'KEY-4': {
    id: 'KEY-4',
    type: 'KEY',
    title: '내부 유출자 확정',
    name: '내부 유출자 확정',
    content: '티타니아의 제품 정보와 정민호의 권한을 종합할 때, 정민호가 신제품 정보를 유출한 내부자임이 확정되었습니다.',
    owners: ['echo'],
    triggers: ['헬리오스 유출', '기획 자료 유출', '오세라에게 넘긴'],
    level: 3
  },

  // --- 기타 주관 진술 ---
  'T-01': {
    id: 'T-01',
    type: 'T',
    title: '한지훈에 대한 옹호',
    name: '한지훈에 대한 옹호',
    content: '정민호 팀장은 한 상무님이 절대 그럴 분이 아니라며 겉으로 강력히 옹호하고 있습니다.',
    owners: ['jung-minho'],
    triggers: ['절대 그럴 분', '옹호', '한 상무님은', '신뢰합니다'],
    level: 1
  },
  'T-02': {
    id: 'T-02',
    type: 'T',
    title: '정정당당한 라이벌 의식',
    name: '정정당당한 라이벌 의식',
    content: '윤서경 상무는 한지훈을 존중했으며, 정정당당하게 이기고 싶었다고 진술했습니다.',
    owners: ['yoon-seokyung'],
    triggers: ['존중했다', '정정당당', '이기고 싶었다', '비겁하게'],
    level: 1
  }
};

export function getAllClues(): ClueDefinition[] {
  return Object.values(CLUE_CATALOG);
}

export function getCluesByOwner(characterId: string): ClueDefinition[] {
  return Object.values(CLUE_CATALOG).filter(c => c.owners.includes(characterId));
}

export function getClueById(id: string): ClueDefinition | undefined {
  return CLUE_CATALOG[id];
}

export function canDeriveKey4(collectedIds: string[]): boolean {
  const required = ['F-26', 'F-27', 'L-06'];
  const owned = required.filter(id => collectedIds.includes(id));
  return owned.length >= 2;
}
