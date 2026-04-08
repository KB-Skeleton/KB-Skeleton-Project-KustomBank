<template>
  <section class="d-grid gap-3">
    <article class="kb-panel">
      <div
        class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3"
      >
        <h2 class="h2 fw-black kb-text-charcoal mb-0">투자 브리핑</h2>
        <button
          class="btn btn-sm text-white fw-bold"
          style="background: rgb(96, 88, 76)"
          :disabled="isFetching"
          @click="handleFetchStockInfo"
        >
          {{ isFetching ? "불러오는 중..." : "한국 인기 종목 5개 불러오기" }}
        </button>
      </div>
      <div class="row g-3 row-cols-1 row-cols-md-3">
        <div v-for="asset in assets" :key="asset.name" class="col">
          <div
            class="rounded-3 border p-3"
            style="
              border-color: rgba(34, 34, 34, 0.14);
              background: var(--kb-gray-100);
            "
          >
            <p class="small fw-bold text-uppercase text-secondary mb-1">
              {{ asset.type }}
            </p>
            <p class="h5 fw-black kb-text-charcoal mb-2">{{ asset.name }}</p>
            <p class="mb-1 small text-secondary">
              투자금 {{ formatCurrency(asset.principal) }}
            </p>
            <p class="mb-1 small text-secondary">
              예상 수익 {{ formatCurrency(asset.expectedProfit) }}
            </p>
            <p
              class="mb-0 small fw-bold"
              :class="asset.change >= 0 ? 'text-primary' : 'text-danger'"
            >
              수익률 {{ asset.change >= 0 ? "+" : "" }}{{ asset.change }}%
            </p>
          </div>
        </div>
      </div>
    </article>

    <article class="row g-3">
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
                <p class="mb-0 fs-5 fw-bold kb-text-charcoal">{{ stock.name }}</p>
                <p
                  class="mb-0 fw-black fs-6"
                  :class="stock.change >= 0 ? 'text-primary' : 'text-danger'"
                >
                  {{ stock.change >= 0 ? "+" : "" }}{{ stock.change }}%
                </p>
              </div>
              <p class="mb-0 text-secondary mt-2">{{ stock.reason }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <div class="kb-panel h-100">
          <h3 class="h4 fw-black kb-text-charcoal mb-3">
            투자 아이디어 & 상식
          </h3>
          <div class="d-grid gap-2">
            <div
              v-for="tip in tips"
              :key="tip.title"
              class="rounded-3 p-3"
              style="background: var(--kb-gray-100)"
            >
              <p class="mb-1 fw-bold kb-text-charcoal">{{ tip.title }}</p>
              <p class="mb-1 small text-secondary">{{ tip.description }}</p>
              <p class="mb-0 small fw-semibold kb-text-brown">
                예상수익 가이드: {{ tip.guide }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useFinanceStore } from "../stores/finance";

const { formatCurrency } = useFinanceStore();
const isFetching = ref(false);

const assets = [
  {
    type: "ETF",
    name: "KODEX 200",
    principal: 3000000,
    expectedProfit: 210000,
    change: 7.0,
  },
  {
    type: "해외주식",
    name: "NVIDIA",
    principal: 2200000,
    expectedProfit: 286000,
    change: 13.0,
  },
  {
    type: "채권",
    name: "국채혼합형",
    principal: 1400000,
    expectedProfit: 56000,
    change: 4.0,
  },
];

const hotStocks = ref([
  {
    name: "로딩 전",
    change: 0,
    reason: "버튼을 눌러 최신 한국 인기 종목을 조회하세요.",
  },
]);

const tips = [
  {
    title: "월말 자동 적립식 매수",
    description:
      "지출 후 남은 금액의 일정 비율을 자동 매수로 연결하면 감정적 매매를 줄일 수 있습니다.",
    guide: "연 5~8% 기대 범위",
  },
  {
    title: "고정지출 절감분 재투자",
    description:
      "통신비/구독비 절감분을 ETF에 분산하면 리스크를 낮춘 장기 복리가 가능합니다.",
    guide: "연 4~6% 기대 범위",
  },
  {
    title: "투자 전 기본 상식",
    description:
      "PER/PBR 같은 지표를 먼저 확인하고, 한 종목 비중을 30% 이상 넘기지 않는 것이 안전합니다.",
    guide: "리스크 관리 중심",
  },
];

const handleFetchStockInfo = async () => {
  if (isFetching.value) return;
  isFetching.value = true;

  try {
    const response = await fetch("/api/investing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: 5 }),
    });
    if (!response.ok) throw new Error(`Investing API 실패: ${response.status}`);

    const result = await response.json();
    hotStocks.value = (result.stocks || []).slice(0, 5);
    console.log("kr.investing.com Most Active 상위 5개:", result);
  } catch (error) {
    console.error("주식 정보 조회 실패:", error);
  } finally {
    isFetching.value = false;
  }
};
</script>
