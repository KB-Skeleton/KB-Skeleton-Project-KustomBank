# KR Most Active Top 5 구현 정리

## 목적
- 후보 종목 목록을 미리 두지 않고, `https://kr.investing.com/equities/most-active-stocks` 페이지에서 실제 상위 종목 5개를 가져오도록 변경.

## 변경 파일
- `vite.config.js`
- `src/views/InvestmentView.vue`

## 1) `vite.config.js` 변경 내용

### 1-1. 스크래핑 대상 URL 정의
```js
const MOST_ACTIVE_KR_URL = "https://kr.investing.com/equities/most-active-stocks";
```

### 1-2. 퍼센트 문자열 파싱 유틸
```js
const toNumberFromPercent = (rawPercent) => {
  if (!rawPercent) return 0;
  const cleaned = rawPercent.replace("%", "").trim();
  if (cleaned.includes(",") && !cleaned.includes(".")) {
    return Number(cleaned.replace(",", "."));
  }
  return Number(cleaned.replace(/,/g, ""));
};
```

### 1-3. 핵심 스크래퍼 함수
- `puppeteer`로 페이지 접속
- `table tbody tr`에서 종목명/등락률 추출
- 중복 제거 후 상위 `limit`개 반환

### 1-4. Vite 미들웨어 API
```js
server.middlewares.use("/api/investing", async (req, res) => {
  const topStocks = await scrapeMostActiveKrTopStocks(limit);
  res.end(JSON.stringify({ fetchedAt, count, stocks: topStocks }));
});
```

## 2) `src/views/InvestmentView.vue` 변경 내용
- 버튼 클릭 시 `POST /api/investing` 호출
- 응답 `stocks`를 `hotStocks`에 반영
- 콘솔에 결과 출력

## 동작 흐름
1. 버튼 클릭
2. `POST /api/investing`
3. Vite 미들웨어가 Investing 페이지 스크래핑
4. 상위 5개 반환
5. 화면 반영

## 주의사항
- 사이트 DOM 구조가 바뀌면 선택자 수정 필요
- `vite.config.js` 변경 후 dev 서버 재시작 필요
- dev 미들웨어 방식이므로 배포 시 별도 서버 전략 권장
