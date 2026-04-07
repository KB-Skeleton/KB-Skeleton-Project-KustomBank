# KB Skeleton Project 작업 정리

작성일: 2026-04-07
브랜치: feature/Lee (원격: feature/lee)

## 1) 전역 구조 및 테마
- Tailwind v4 적용 (`@import "tailwindcss"`, `@tailwindcss/vite` 연동)
- KB 테마 기반 색상/스타일 확장
- 공통 UI 클래스 정리 (`kb-panel`, `kb-card`, `kb-btn-*`, `kb-input` 등)
- 상단 로고(`KB`)와 네비게이션 레이아웃 구성

## 2) 라우팅/페이지 구성
- 대시보드
- 월별 지출 (기존 캘린더 라우트는 리다이렉트)
- 고정지출 (신규)
- 투자
- 통계
- 예산
- 프로필

## 3) 데이터 스토어 개편 (`src/stores/finance.js`)
- 거래 모델을 `userId`, `categoryId`, `description` 중심으로 정리
- 카테고리(지출/수입) 체계화
- 월별 요약/카테고리 집계/일별 집계/월별 추이 함수 보강
- 카테고리별 예산 합산으로 전체 예산 계산
- 고정지출 요약 및 월별 고정지출 조회 기능 추가
- 거래 추가 시 `isFixed` 옵션 반영 및 고정 플랜 자동 반영

## 4) 대시보드 개선
- 월 수입/지출/가용금액/고정지출 카드 구성
- `월 예산 및 월 소비`를 예산 페이지와 동일한 사용금액 진행바 형식으로 통일
- 카테고리별 지출 그래프를 SVG 도넛으로 구현
- 최근 거래 내역 클릭 시 월별 지출 페이지로 이동(날짜 쿼리 전달)

## 5) 월별 지출 페이지 (`MonthlySpendingView`)
- 월 달력 + 상세 목록 UI
- 모바일 `캘린더/목록` 토글 지원
- 날짜별 수입/지출 요약 표시
- 거래 상세 팝업(조회/편집/삭제)
- 상세 팝업에 주식 추천 문구 추가

## 6) 고정지출 페이지 (`FixedExpenseView`)
- 월별 고정지출 합계/사용/잔여/사용률 표시
- 고정지출 세부 내역 편집/삭제 지원

## 7) 투자 페이지 개선
- 포트폴리오 카드 확장 (예상 수익 포함)
- 인기 종목/투자 아이디어/투자 상식 섹션 추가

## 8) 통계 페이지 개선
- 카테고리 지출: SVG 도넛 + 범례/비율/금액
- 지난달 비교: 인터랙션 선 그래프(툴팁, 월 라벨, hover 가이드)
- 그래프 가독성 개선(점/선/레이블 크기 조정)
- 지출 인사이트 문구 조건 분기(지출 감소 시 투자 권유, 증가 시 절약 권유)

## 9) 예산 페이지 개선
- 카테고리별 예산 합산이 전체 예산으로 반영
- 사용 금액 진행바 및 초과 시 경고
- 카테고리 내역별 사용률/남은 금액 표시
- 개별 수정 + 일괄 수정(카테고리별 예산 설정) 지원

## 10) 지출/수입 추가 팝업 (`App.vue`)
- 플로팅 버튼으로 전역 어디서나 추가 가능
- 지출/수입 타입 전환 및 카테고리 자동 전환
- 지출 등록 시 `고정지출로 등록` 토글 추가
- 토글/등록 버튼 색상 커스터마이징 (`rgb(96,88,76)`)
- 주의: 사용자 입력 항목에서는 `isFixed`, `isRequired`를 직접 받지 않고,
  내부 로직으로만 처리

## 11) 신규/주요 변경 파일
- `src/App.vue`
- `src/router/index.js`
- `src/stores/finance.js`
- `src/views/DashboardView.vue`
- `src/views/MonthlySpendingView.vue` (신규)
- `src/views/FixedExpenseView.vue` (신규)
- `src/views/InvestmentView.vue`
- `src/views/StatisticsView.vue`
- `src/views/BudgetView.vue`
- `src/assets/main.css`
- `tailwind.config.js`
- `vite.config.js`
- `package.json`, `package-lock.json`

## 12) 검증
- 다수 단계에서 `npm run build` 수행
- 최신 상태 기준 빌드 성공
