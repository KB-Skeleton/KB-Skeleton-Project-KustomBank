<template>
  <div class="col-12 col-lg-6">
    <div class="kb-panel h-100">
      <h3 class="h4 fw-black kb-text-charcoal mb-3">현재 인기 종목</h3>
      <div class="d-grid gap-2">
        <div
          v-for="stock in hotStocks"
          :key="stock.name"
          class="rounded-3 border p-4 bg-white"
          style="border-color: rgba(34, 34, 34, 0.15)"
        >
          <div class="d-flex justify-content-between align-items-center">
            <p class="mb-0 fs-5 fw-bold kb-text-charcoal">
              {{ stock.name }}
            </p>
            <p
              class="mb-0 fw-black fs-6"
              :class="stock.change >= 0 ? 'text-primary' : 'text-danger'"
            >
              {{ stock.change >= 0 ? "+" : "" }}{{ stock.change }}%
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const hotStocks = [
  {
    name: "삼성전자",
    change: 2.14,
    reason: "AI 반도체 수요 기대",
  },
  {
    name: "SK하이닉스",
    change: 3.27,
    reason: "HBM 공급 확대 이슈",
  },
  {
    name: "현대차",
    change: 1.42,
    reason: "전기차 판매 회복 기대",
  },
  {
    name: "NAVER",
    change: -0.86,
    reason: "광고 성장 둔화 우려",
  },
  {
    name: "카카오",
    change: 0.95,
    reason: "신규 서비스 모멘텀",
  },
];
</script>
