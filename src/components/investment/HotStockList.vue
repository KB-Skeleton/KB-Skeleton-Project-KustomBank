<template>
  <div class="col-12 col-lg-6">
    <div class="kb-panel h-100 position-relative">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h3 class="h4 fw-black kb-text-charcoal mb-0">현재 인기 종목</h3>
        <button
          class="btn btn-sm text-white fw-bold"
          style="background: rgb(96, 88, 76)"
          :disabled="isFetching"
          @click="hotStocksStore.handleFetchStockInfo"
        >
          불러오기
        </button>
      </div>
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

      <div
        v-if="isFetching"
        class="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center rounded-3"
        style="
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(1px);
          z-index: 10;
        "
      >
        <div class="spinner-border text-dark mb-2" role="status"></div>
        <p class="mb-0 fw-bold text-dark">인기 종목 불러오는 중...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useHotStock } from "../../stores/hotStock.js";

const hotStocksStore = useHotStock();

const hotStocks = computed(() => hotStocksStore.hotStocks);
const isFetching = computed(() => hotStocksStore.isFetching);

const ensureHotStocks = async () => {
  if (hotStocksStore.hotStocks.length > 0) return hotStocksStore.hotStocks;

  return hotStocksStore.handleFetchStockInfo();
};

onMounted(() => {
  ensureHotStocks();
});
</script>
