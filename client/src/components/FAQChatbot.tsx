import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, HelpCircle, Sparkles } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface FAQ {
  keywords: string[];
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  // 10대 안전수칙
  {
    keywords: ["10대", "안전수칙", "수칙", "기본수칙"],
    question: "kt MOS남부 10대 안전수칙",
    answer: `kt MOS남부 10대 안전수칙:

1. 작업 시작 전 개인별 위험요소를 숙지하고 전 직원에게 안전교육을 실시한다.
2. 작업장 주변환경을 파악하여 안전을 저해하는 위험요소는 작업 전에 제거하고 작업을 시행한다.
3. 적절한 보호구를 지급하고 보호구 착용방법에 따라 작업 시작 전 반드시 착용한다.
4. 작업에 필요한 보호구 및 작업 도구의 이상유무를 필히 확인한다.
5. 작업자는 작업 시 작업유형별 안전관리 절차를 반드시 준수한다.
6. 작업 유형별 적정인력 투입을 준수하고 평상 시 2인 1조를 기본으로 작업한다.
7. 작업 중에 위험이 판단되면 "작업중지권을 발동"하여 즉시 작업을 중단하고 안전조치를 취한다.
8. 작업 전후 작업장 주변환경의 정리정돈 및 청결상태를 유지한다.
9. 안전사고 발생 시 신속히 응급조치를 취하고 보고체계에 따라 즉각 보고한다.
10. 중대재해 발생 시 긴급대피 및 관계기관에 즉시 신고한다.`
  },
  // 작업중지권
  {
    keywords: ["작업중지권", "중지권", "작업중단", "위험발견"],
    question: "작업중지권이란?",
    answer: `작업중지권이란 작업 중에 위험이 판단되면 즉시 작업을 중단하고 안전조치를 취할 수 있는 근로자의 권리입니다.

• 작업 중 위험이 발견되면 즉시 "작업중지권을 발동"하여 작업을 중단합니다.
• 작업중지 후 안전조치를 취하고 위험요인을 제거합니다.
• 작업중지권 발동 시 보복으로부터 근로자를 보호받습니다.
• 안전한 작업환경이 확보된 후 작업을 재개합니다.

작업중지권은 kt MOS남부 10대 안전수칙 제7항에 명시되어 있습니다.`
  },
  // 중대재해 정의
  {
    keywords: ["중대재해", "중대", "재해정의", "사망"],
    question: "중대재해란?",
    answer: `중대재해란 다음 중 하나에 해당하는 재해를 말합니다:

1. 사망자가 1인 이상 발생한 재해
2. 3개월 이상의 요양을 요하는 부상자가 동시에 2인 이상 발생한 재해
3. 부상자 또는 직업성 질병자가 동시에 10인 이상 발생한 재해

중대재해 발생 시:
• 긴급대피를 실시합니다
• 관계기관(119, 노동청 등)에 즉시 신고합니다
• 사고 현장은 조사 완료 전까지 보존해야 합니다`
  },
  // 산업재해 정의
  {
    keywords: ["산업재해", "산재", "재해"],
    question: "산업재해란?",
    answer: `산업재해란 직원이 회사업무에 관계되는 건설물, 설비, 원재료, 가스, 증기, 분진 등에 의하거나 업무와 관련하여 사망 또는 부상하거나 질병에 걸리는 것을 말합니다.

산업재해 발생 시 보고체계:
1. 즉시 현장 안전 확보 및 응급조치
2. 팀장/파트장에게 즉각 보고
3. 본부 안전보건관리부서에 보고
4. 산업재해조사표 작성 및 제출`
  },
  // 안전모
  {
    keywords: ["안전모", "헬멧", "모자", "머리보호"],
    question: "안전모 착용 및 관리",
    answer: `[안전모 착용대상 작업]
• 물체의 떨어짐, 날아옴, 부딪힘으로부터 머리를 다칠 수 있는 작업
• 머리에 감전 재해를 입을 수 있는 전기작업
• 지지가 약한 바닥에서 낙상할 수 있는 작업

[안전모 착용방법]
1. 모체, 착장체, 충격흡수제 및 턱끈의 이상 유무를 확인
2. 머리 크기에 맞게 착장체의 머리 고정대를 조절
3. 귀의 양쪽에 턱끈이 위치하도록 착용
4. 안전모가 벗겨지지 않도록 턱끈을 견고히 조여서 고정

[안전모 관리방법]
• 착용 중에 모체가 충격을 받거나 변형되면 폐기
• 탄성감소, 색상변화, 균열 발생 시 교체
• 자동차 뒷 창문에 보관하지 않음 (노화방지)
• 오른쪽면에 소속, 이름, 혈액형, 긴급연락처 기재

[지급기준]
• 현장부서: 개인별 1개씩 지급
• 통신장비 포함 유인 운용실: 공동 사용용 3개 이상 지급
• 다목적용(ABE등급) 안전모 지급`
  },
  // 안전화
  {
    keywords: ["안전화", "신발", "작업화", "발보호"],
    question: "안전화 착용 및 관리",
    answer: `[안전화 착용대상 작업]
• 중량물의 떨어짐이나 끼임 등에 따른 발에 부상을 당할 수 있는 작업
• 날카로운 물체에 의한 발바닥을 찔릴 수 있는 바닥에서 작업
• 감전, 정전기의 인체 대전이 될 수 있는 환경에서 작업

[안전화 착용방법]
• 안전화는 훼손, 변형하지 않음
• 특히 뒤축을 꺾어 신지 않음
• 신발끈을 매어 발이 놀지 않도록 함

[안전화 관리방법]
• 안전화 내부가 항상 건조하도록 관리
• 가죽제 안전화는 물에 젖지 않도록 함
• 화학물질에 노출되었으면 물에 씻어 말림
• 절연화, 절연장화는 구멍이나 찢김이 있으면 즉시 폐기

[지급기준]
• 안전보호구 지급기준에 의거 지급
• 파손 또는 안전에 문제가 있다고 판단 시 즉시 교체`
  },
  // 안전대
  {
    keywords: ["안전대", "안전벨트", "추락", "고소작업", "안전그네"],
    question: "안전대 착용 및 관리",
    answer: `[안전대 착용대상 작업]
높이 2m 이상의 추락위험이 있는 작업:
• 작업발판(폭 40cm)이 없는 장소의 작업
• 작업발판이 있어도 난간대가 없는 장소의 작업
• 난간대로부터 상체를 내밀어 작업하는 경우
• 작업발판과 구조체 사이의 거리가 30cm 이상인 장소

[안전대 종류]
• 1종(U자걸이 전용): 전주용, 신체를 안전대에 지지하여 작업
• 2종(1개/2개걸이): 작업발판이 있고 추락 시 신체 보호 목적
• 3종(1개걸이/U자걸이 공용): 전주에서 신체 지지 작업
• 4종(안전블록): 자동 감김 장치 구비
• 5종(추락방지대): 고층사다리, 철골, 철탑 등 상·하행 시 사용

[안전대 착용방법 - 벨트식]
• 벨트는 허리띠 근처에 확실하게 착용
• 버클을 바르게 사용하고 벨트 끝이 벨트 통로를 확실히 통과
• 죔줄은 반드시 1.5m 이내의 범위에서 사용
• 죔줄 지지 구조물 위치는 벨트 위치보다 높아야 함

[지급기준]
• 철탑이나 전주에서 작업하는 직원: 조별로 차량당 1개 이상
• 파손 또는 안전 문제 시 즉시 교체`
  },
  // 절연장갑
  {
    keywords: ["절연", "장갑", "전기", "감전", "절연장갑"],
    question: "절연장갑 사용 및 관리",
    answer: `[절연장갑 종류]
• A종: 교류 600V 또는 직류 750V 이하 작업
• B종: 3,500V 이하 작업
• C종: 7,000V 이하 작업

[절연장갑 사용범위]
• 활선상태의 배전용 지지물에 누설전류 발생 우려 시
• 충전부의 접속, 절단 및 점검, 보수 등의 작업 시
• 습기가 많은 장소에서의 개폐기 개방, 투입의 경우
• 정전 작업 시 역 송전이 우려되는 선로나 기기

[사용 시 주의사항]
• B종, C종은 반드시 가죽장갑을 바깥쪽에 착용
• 사용 전 육안검사와 공기 주입검사 필수
• 안팎을 뒤집은 채 사용 금지
• 더운/추운 날씨에는 안에 면 장갑 착용
• 기름, 그리스 묻으면 즉시 닦아냄
• 내피와 외피를 함께 착용해야 완벽한 절연

[보관 방법]
• 서늘하고 어두운 장소에 한 켤레씩 박스에 보관
• 햇빛 직사되는 장소 피함
• 열이나 더운 공기가 직접 닿는 곳 피함
• 안쪽에 탤크(Talc)분을 발라둠

[정기검사]
• 최소 6개월에 1회 이상 정기적으로 수행`
  },
  // 절연안전모
  {
    keywords: ["절연안전모", "전기안전모", "ABE"],
    question: "절연안전모 사용",
    answer: `[절연안전모란?]
물체의 낙하·비래, 추락 등에 의한 위험을 방지하고, 작업자 머리 부분의 감전에 의한 위험으로부터 보호하기 위하여 전압 7,000V 이하에서 사용하는 안전모입니다.

[종류]
• AE형: 물체의 낙하/비래 방지 + 감전 방지
• ABE형: 물체의 낙하/비래/추락 방지 + 감전 방지 (권장)

[착용이 필요한 작업]
• 충전부에 근접하여 머리에 전기적 충격을 받을 우려가 있는 장소
• 활선과 근접한 주상, 철구상, 사다리, 나무 벌채 등 고소작업
• 건설현장 등 낙하물이 있는 장소

[사용 전 점검사항]
• 정기점검 여부 확인
• 흙, 기름, 물기 여부 및 건조 상태
• 충격의 흔적 여부
• 변색 또는 변형 여부
• 장착제, 충격 흡수재 등의 손상 여부`
  },
  // 방진마스크
  {
    keywords: ["마스크", "방진", "분진", "호흡"],
    question: "방진마스크 사용",
    answer: `[착용대상 작업]
• 분진이 많은 작업국소 및 기계적으로 분진이 발생하는 장소
• 호흡기 등의 건강장해가 우려되는 경우 예방 차원

[등급별 사용장소]
• 특급: 독성이 강한 물질을 함유한 분진 발생장소, 석면 취급장소
• 1급: 특급 착용장소를 제외한 분진 발생장소, 기계적으로 생기는 분진 발생장소
• 2급: 특급 및 1급 착용장소를 제외한 분진 발생장소

[사용방법 및 관리]
• 면체는 기름이나 유기용제, 직사광선을 피함
• 사용 전에 점검, 장착, 사용법을 교육하고 훈련
• 면체 접안부에 손수건 등을 덧대 사용하지 않음`
  },
  // 보호구 정의 및 관리
  {
    keywords: ["보호구", "PPE", "지급", "관리"],
    question: "보호구란?",
    answer: `[보호구의 정의]
보호구란 산업재해를 예방하기 위하여 작업자의 신체 일부 혹은 전부에 착용하는 각종 보호구들을 의미합니다. (안전모, 안전화, 안전대, 절연장갑, 추락방지대, 방진마스크 등)

[보호구의 구비 요건]
• 착용하여 작업하기 쉬워야 함
• 유해·위험물로부터 보호성능이 충분해야 함
• 사용되는 재료는 작업자에게 해로운 영향을 주지 않아야 함
• 외관이나 디자인이 양호해야 함

[보호구 관리]
• 보호구 관리는 관리감독자가 담당
• 지급수량과 지급주기 기준에 준하여 해당 직원에게 지급
• 파손 또는 안전에 문제가 있다고 판단될 시 즉시 교체
• 보호구 지급대장 작성 및 관리
• '안전점검의 날'에 관리책임자 주관 하에 전수점검 실시
• 노후, 불량 안전장비는 즉시 폐기 및 재구매`
  },
  // 안전관리 조직
  {
    keywords: ["조직", "책임자", "역할", "안전보건관리"],
    question: "안전관리 조직 및 역할",
    answer: `[안전관리 조직체계]
CEO → 총괄 안전보건관리책임자 → 안전보건관리책임자(본부장) → 관리감독자(부서장) → 직원

[역할과 임무]
• 안전보건관리책임자(본부장)
  - 산업안전보건업무를 총괄·관리
  - 연간 산업재해 예방계획 수립 및 시행
  - 안전점검의 날 행사 추진
  - 사업장 별 순회점검지도

• 관리감독자(실장/팀장/파트장)
  - 직원을 지휘·감독하고 안전교육 및 관리
  - 설비의 안전점검 및 이상유무 확인
  - 사업장 별 정리정돈 확인 및 감독
  - 사업장 별 순회점검지도

• 안전관리자/보건관리자(위탁)
  - 안전/보건에 관한 기술적인 사항에 대해 사업주나 관리책임자를 보좌
  - 관리감독자에게 조언·지도`
  },
  // 2인1조
  {
    keywords: ["2인1조", "이인일조", "인원", "투입"],
    question: "2인 1조 작업 원칙",
    answer: `kt MOS남부에서는 평상 시 2인 1조를 기본으로 작업합니다.

[2인 1조 작업의 목적]
• 상호 안전 감시 및 보조
• 사고 발생 시 신속한 대응 가능
• 고소작업, 밀폐공간 작업 등 위험작업 시 필수

[작업유형별 적정인력 투입]
• 작업 유형별 적정인력 투입을 준수
• 업무 유형별 작업인력 지침에 따름

이는 kt MOS남부 10대 안전수칙 제6항에 명시되어 있습니다.`
  },
  // 사고 보고
  {
    keywords: ["사고", "신고", "보고", "발생"],
    question: "사고 발생 시 보고체계",
    answer: `[사고 발생 시 대응절차]
1. 즉시 현장 안전 확보
2. 부상자 응급조치
3. 119 신고 (필요시)
4. 팀장/파트장에게 즉각 보고
5. 본부 안전보건관리부서에 보고
6. 사고보고서 작성 및 제출

[중대재해 발생 시]
• 긴급대피 실시
• 관계기관(119, 노동청 등)에 즉시 신고
• 사고 현장은 조사 완료 전까지 보존

[보고 시 필요 서류]
• 안전사고 및 재해 발생보고서
• 산업재해조사표

이는 kt MOS남부 10대 안전수칙 제9항, 제10항에 명시되어 있습니다.`
  },
  // 활선작업
  {
    keywords: ["활선", "충전", "통전", "전기작업"],
    question: "활선작업이란?",
    answer: `[활선작업 정의]
노출된 도체나 기기 등을 작업자의 보호구 착용 여부와 관계없이 손·발 또는 신체의 기타 부분으로 만지거나 시험기기로 접촉하는 작업을 말합니다.

[활선근접작업 정의]
전기적으로 안전하지 않은 노출된 충전도체 또는 기기 등의 접근한계 내에서 수행하는 작업을 말합니다.

[절연 보호구]
활선작업 또는 활선근접작업에서 감전을 방지하기 위하여 작업자가 신체에 착용하는 보호구:
• 절연 안전모
• 절연 고무장갑
• 절연장화
• 절연복

[전기 설비 기준]
• 저압: 1000V 이하 (현 설비: 380V 이하)
• 고압: 1000V 초과 7000V 이하
• 특고압: 7000V 초과`
  },
  // 소화기
  {
    keywords: ["소화기", "화재", "불", "진화"],
    question: "소화기 사용 방법",
    answer: `[소화기 사용법 (PASS)]
1. Pull - 안전핀 뽑기
2. Aim - 화점 아래쪽 조준
3. Squeeze - 손잡이 누르기
4. Sweep - 좌우로 분사

[사용 시 주의사항]
• 바람을 등지고 사용
• 3~4m 거리에서 시작
• 화점 아래쪽을 향해 분사
• 좌우로 빗자루 쓸듯이 분사

[화재발생 대응 행동지침]
• 화재 발견 시 큰 소리로 "불이야!" 외침
• 119 신고
• 초기 진화 시도 (가능한 경우)
• 진화 불가능 시 대피
• 대피 시 낮은 자세 유지`
  },
  // 응급처치
  {
    keywords: ["응급", "처치", "부상", "구급", "CPR"],
    question: "응급처치 기본 수칙",
    answer: `[응급처치 기본 수칙]
1. 현장 안전 확인
2. 의식 확인 (어깨를 가볍게 두드림)
3. 119 신고
4. 기도 확보 및 호흡 확인
5. 출혈 시 직접 압박 지혈
6. 골절 의심 시 움직이지 않기

[심폐소생술 (CPR)]
• 가슴 압박: 분당 100~120회
• 압박 깊이: 5~6cm
• 인공호흡: 가슴 압박 30회 후 2회

[주의사항]
• 환자를 함부로 움직이지 않음
• 의식이 있으면 편안한 자세 유지
• 전문 의료인 도착까지 응급처치 지속

응급처치 교육을 정기적으로 받으세요.`
  },
  // 안전교육
  {
    keywords: ["교육", "안전교육", "훈련"],
    question: "안전교육",
    answer: `[안전교육 시행]
• 작업 시작 전 개인별 위험요소를 숙지하고 전 직원에게 안전교육을 실시합니다.
• 안전담당자(작업조장 또는 선임자)가 작업 현장에서 직원 및 협력사 직원에 대하여 안전교육을 시행합니다.

[교육 종류]
• 정기교육: 월 1회
• 특별교육: 신규 장비 도입 시, 위험작업 시
• 법정교육: 분기별
• 신규입사자 교육

[교육 내용]
• 보호구 착용방법 및 관리
• 작업유형별 안전관리 절차
• 위험요소 식별 및 대응방법
• 응급처치 요령
• 사고 발생 시 보고체계

안전교육 일정은 좌측 메뉴의 '안전교육'에서 확인할 수 있습니다.`
  },
  // 안전점수
  {
    keywords: ["점수", "안전점수", "평가"],
    question: "안전점수 확인",
    answer: `팀별 안전점수는 대시보드에서 확인할 수 있습니다.

[점수 산정 기준]
• 기본점수: 100점 만점
• 사고: -40점
• 법규위반: -1~3점
• 제안활동: +3점
• 안전활동: +3점

[안전점수 관리 목적]
• 팀별 안전성과 비교
• 안전활동 촉진
• 사고 예방 인센티브

대시보드의 '안전점수 현황' 탭에서 팀별 점수와 상세 내역을 확인하세요.`
  },
  // 보호구 신청
  {
    keywords: ["신청", "요청", "필요", "구매"],
    question: "안전보호구 신청 방법",
    answer: `안전용품 신청은 좌측 메뉴의 '안전용품신청'에서 할 수 있습니다.

[신청 절차]
1. 필요한 품목 선택
2. 수량 입력
3. 신청 사유 작성
4. 신청서 제출

[보호구 교체 기준]
• 파손 또는 안전에 문제가 있다고 판단될 시 즉시 교체
• 관리감독자의 지급수량과 지급주기 기준에 따름

[긴급 신청]
긴급한 경우 팀장에게 직접 연락하세요.`
  },
  // 안전규정
  {
    keywords: ["규정", "규칙", "안전규정", "지침"],
    question: "안전규정 확인",
    answer: `안전규정은 좌측 메뉴의 '안전규정'에서 확인할 수 있습니다.

[주요 안전규정 문서]
• 안전보건경영시스템 매뉴얼
• 안전관리지침
• 작업유형별 안전관리 절차

[규정 준수 의무]
• 모든 작업자는 안전규정을 숙지하고 준수해야 합니다.
• kt MOS남부 임직원은 물론 작업에 참여하는 협력사 직원도 본 기준을 준수하여야 합니다.

[규정 변경]
• 규정 변경 시 공지사항을 통해 안내됩니다.
• 변경된 규정은 '안전공지' 메뉴에서 확인하세요.`
  },
  // 안전점검의 날
  {
    keywords: ["점검", "안전점검", "점검의날"],
    question: "안전점검의 날",
    answer: `[안전점검의 날]
모든 보호구는 '안전점검의 날'에 관리책임자 주관 하에 전수점검을 실시합니다.

[점검 내용]
• 보호구 상태 점검
• 노후, 불량 안전장비 확인
• 불량 장비 즉시 폐기 및 재구매
• 설비의 안전점검 및 이상유무 확인

[점검 책임]
• 안전보건관리책임자(본부장): 안전점검의 날 행사 추진
• 관리감독자(부서장): 사업장 별 순회점검지도

안전점검의 날 행사는 연간 산업재해 예방계획에 따라 시행됩니다.`
  },
  // ISO 45001
  {
    keywords: ["ISO", "45001", "인증", "시스템"],
    question: "ISO 45001 안전보건경영시스템",
    answer: `[ISO 45001 안전보건경영시스템]
kt MOS남부는 ISO 45001 표준 요구사항과 안전보건 법규에 따른 안전보건경영시스템을 운영하고 있습니다.

[목적]
• 안전위험성을 최소화
• 지속 가능한 발전이 가능하도록 함

[주요 구성]
• 리더십 및 실행의지
• 리스크 및 기회 관리
• 안전보건 목표 및 추진계획
• 자원 확보 및 교육
• 운용관리
• 비상사태 대비 및 대응
• 성과평가 및 개선

[지속적 개선]
안전보건경영시스템은 내부심사, 경영검토를 통해 지속적으로 개선됩니다.`
  }
];

const suggestedQuestions = [
  "kt MOS남부 10대 안전수칙",
  "작업중지권이란?",
  "안전모 착용 및 관리",
  "사고 발생 시 보고체계"
];

export function FAQChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const findAnswer = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    for (const faq of faqs) {
      for (const keyword of faq.keywords) {
        if (lowerQuery.includes(keyword)) {
          return faq.answer;
        }
      }
    }
    
    return `죄송합니다. 해당 질문에 대한 답변을 찾지 못했습니다.

아래 주제에 대해 질문해 보세요:
• 10대 안전수칙
• 작업중지권
• 중대재해
• 안전모/안전화/안전대 착용법
• 절연장갑 사용법
• 보호구 관리
• 사고 신고 방법
• 안전교육
• 안전점수`;
  };

  const handleSend = (text?: string) => {
    const query = text || message.trim();
    if (!query) return;

    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setMessage("");

    setTimeout(() => {
      const answer = findAnswer(query);
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    }, 300);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      {!isOpen && (
        <button
          data-testid="button-open-faq-chatbot"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 h-16 w-16 rounded-2xl shadow-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 transition-all duration-500 hover:scale-110 hover:rotate-3 flex items-center justify-center group overflow-visible"
        >
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 opacity-0 group-hover:opacity-75 blur-lg transition-all duration-500 group-hover:animate-pulse" />
          <div className="absolute inset-0 rounded-2xl bg-white/10 backdrop-blur-sm" />
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '2s' }} />
            </div>
            <Sparkles className="h-8 w-8 text-white drop-shadow-lg relative z-10" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white" />
          </span>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 px-2 py-1 rounded-full backdrop-blur-sm">
            도움이 필요하세요?
          </span>
        </button>
      )}

      {isOpen && (
        <Card className="fixed bottom-4 right-4 z-50 w-[380px] h-[560px] flex flex-col shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between gap-2 py-3 px-4 border-b bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              <CardTitle className="text-base font-medium">안전 FAQ 도우미</CardTitle>
            </div>
            <Button
              data-testid="button-close-faq-chatbot"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ScrollArea className="flex-1 px-4" ref={scrollRef}>
              <div className="py-4 space-y-4">
                {messages.length === 0 && (
                  <div className="space-y-4">
                    <div className="text-center py-4 text-muted-foreground">
                      <Sparkles className="h-10 w-10 mx-auto mb-3 text-purple-500 opacity-70" />
                      <p className="text-sm font-medium">안녕하세요!</p>
                      <p className="text-sm">kt MOS남부 안전지침을 안내해드려요.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground px-1">자주 묻는 질문</p>
                      {suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(q)}
                          className="w-full text-left px-3 py-2 text-sm bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                          data-testid={`suggested-question-${idx}`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                          : "bg-muted"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-3 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  data-testid="input-faq-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="안전 관련 질문을 입력하세요..."
                  className="flex-1"
                />
                <Button
                  data-testid="button-send-faq"
                  type="submit"
                  size="icon"
                  disabled={!message.trim()}
                  className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
