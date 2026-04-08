# CORS 에러 원인 및 Middleware 해결 정리

## 1) 처음 CORS 에러가 난 이유

브라우저에서 `http://localhost:5173`(프론트)에서 외부 도메인으로 직접 `fetch`하면 동일 출처 정책 때문에 CORS 검사가 발생합니다.

- 프론트 출처: `http://localhost:5173`
- 대상 출처: `https://api.apify.com`, `https://kr.investing.com`

`POST + application/json` 요청은 preflight(OPTIONS)를 거치며, 서버가 CORS 허용 헤더를 주지 않으면 차단됩니다.

## 2) Middleware를 어디에 두고 어떻게 해결했는가

`vite.config.js`에 dev server middleware를 추가했습니다.

- 엔드포인트: `POST /api/investing`
- 프론트는 외부 사이트 대신 같은 출처(`/api/investing`)만 호출
- 미들웨어(Node)가 외부 사이트 스크래핑 후 JSON 응답

## 3) 왜 이렇게 해결되는가

CORS는 브라우저의 교차 출처 요청에 적용됩니다.

- 브라우저 요청: `localhost:5173 -> localhost:5173/api/investing` (동일 출처)
- 외부 요청: Vite 서버(Node)가 수행 (브라우저 CORS 차단 대상 아님)

그래서 브라우저 단계의 CORS 오류를 피할 수 있습니다.

## 4) 장단점

장점
- 개발 환경에서 빠르게 CORS 회피 가능
- 외부 호출 로직을 서버쪽에 집중 관리 가능

주의
- `vite.config.js` 미들웨어는 개발 중심
- 배포 환경은 백엔드/서버리스로 이전 필요
- 대상 사이트 구조 변경 시 파싱 코드 수정 필요

## 5) 관련 파일
- `vite.config.js`
- `src/views/InvestmentView.vue`
- `INVESTING_KR_TOP5_IMPLEMENTATION.md`
