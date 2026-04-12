<template>
  <div class="col-12 col-lg-6">
    <div class="kb-panel h-100 position-relative">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h3 class="summary-title mb-0">현재 인기 종목</h3>
        <button
          class="kb-btn-brown p-2 py-1"
          style="font-size: 0.75rem"
          :disabled="isFetching"
          @click="hotStocksStore.handleFetchStockInfo"
        >
          불러오기
        </button>
      </div>

      <div class="d-grid gap-2">
        <div
          v-for="stock in affordableHotStocks"
          :key="stock.symbol || stock.name"
          class="kb-transaction-item"
        >
          <div class="kb-transaction-info">
            <p class="title fs-5 mb-1">{{ stock.name }}</p>
            <p class="mb-0 small text-primary fw-bold">
              {{ stock.change >= 0 ? '+' : '' }}{{ stock.change }}%
            </p>
          </div>

          <div class="text-end">
            <p class="mb-1 fw-black text-danger" style="font-size: 1.1rem">
              {{ formatCurrency(stock.close) }}
            </p>
            <p class="mb-0 small text-secondary fw-bold">
              약 {{ stock.count }}주 구매 가능
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="isFetching"
        class="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center rounded-4"
        style="
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(2px);
          z-index: 10;
        "
      >
        <div class="spinner-border text-dark mb-2" role="status"></div>
        <p class="mb-0 fw-bold text-dark">데이터 분석 중...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useFinanceStore } from '@/stores/finance';
import { useHotStock } from '../../stores/hotStock.js';
import { useAuthStores } from '@/stores/auth.js';

const { getBerquiredOutcome, formatCurrency } = useFinanceStore();
const { authState } = useAuthStores();
const hotStocksStore = useHotStock();

const hotStocks = computed(() => hotStocksStore.hotStocks);
const isFetching = computed(() => hotStocksStore.isFetching);

const totalBerquiredExpenseAmount = computed(() =>
  getBerquiredOutcome(authState.userId).reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0,
  ),
);

const affordableHotStocks = computed(() =>
  hotStocks.value.map((stock) => {
    const close = Number(stock.close || 0);
    const count =
      close > 0 ? Math.floor(totalBerquiredExpenseAmount.value / close) : 0;
    return { ...stock, close, count };
  }),
);

onMounted(() => {
  if (hotStocksStore.hotStocks.length === 0) {
    hotStocksStore.handleFetchStockInfo();
  }
});
</script>

<style scoped>
.summary-title {
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--kb-charcoal);
  letter-spacing: -0.03em;
}

.kb-transaction-item {
  background: #ffffff;
  border: 1px solid rgba(34, 34, 34, 0.08);
  transition: transform 0.2s ease;
}

.kb-transaction-item:hover {
  transform: translateY(-2px);
  border-color: rgba(34, 34, 34, 0.15);
}

.fw-black {
  font-weight: 900 !important;
}
</style>
