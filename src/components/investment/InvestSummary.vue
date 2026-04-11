<template>
  <article class="kb-panel invest-summary">
    <div
      class="d-flex flex-wrap align-items-center justify-content-between gap-2"
    >
      <h2 class="h2 fw-black kb-text-charcoal mb-0">불필요한 지출 요약</h2>
      <RouterLink to="/beRequired">
        <button
          class="summary-arrow-btn btn btn-sm text-white fw-bold"
          style="background: rgb(96, 88, 76)"
        >
          <FontAwesomeIcon :icon="faAnglesRight" />
        </button>
      </RouterLink>
    </div>

    <div class="row g-3 row-cols-1 row-cols-md-2">
      <div class="col">
        <div
          class="summary-stat-card summary-stat-total rounded-3 p-4 text-start"
        >
          <p class="small fw-bold text-secondary mb-1">불필요 지출 총액</p>
          <p class="summary-value fw-black mb-0 text-danger">
            {{ formatCurrency(totalBerquiredExpenseAmount) }}
          </p>
        </div>
      </div>

      <div class="col">
        <div
          class="summary-stat-card summary-stat-count rounded-3 p-4 text-end"
        >
          <p class="summary-label small fw-bold text-secondary mb-1">
            불필요 지출 건수
          </p>
          <p class="summary-value fw-black mb-0 kb-text-charcoal">
            {{ berquiredExpenseCount }}건
          </p>
        </div>
      </div>
    </div>

    <div class="summary-invest-hint mt-3">
      이 금액을 아끼셨다면 아래의 주식들을 살 수 있었어요
    </div>

    <div v-if="isStockLoading" class="summary-loading mt-2">
      <div
        class="spinner-border spinner-border-sm text-dark"
        role="status"
      ></div>
      <span>종가 데이터 불러오는 중...</span>
    </div>
  </article>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useFinanceStore } from "@/stores/finance";
import { useHotStock } from "@/stores/hotStock";
import { useAuthStores } from "@/stores/auth";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faAnglesRight } from "@fortawesome/free-solid-svg-icons";

const { getBerquiredOutcome, transactions, formatCurrency, getTransaction } =
  useFinanceStore();
const { authState } = useAuthStores();

const hotStockStore = useHotStock();

const berquiredExpenses = computed(() => getBerquiredOutcome(authState.userId));

const totalBerquiredExpenseAmount = computed(() =>
  berquiredExpenses.value.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  ),
);

const berquiredExpenseCount = computed(() => {
  return berquiredExpenses.value.length;
});
const isStockLoading = computed(() => hotStockStore.isFetching);

onMounted(() => {
  if (!hotStockStore.hotStocks.length) {
    hotStockStore.handleFetchStockInfo();
  }

  getTransaction();
});
</script>

<style scoped>
.invest-summary {
  font-family:
    "Nunito", "Quicksand", "SF Pro Rounded", "Arial Rounded MT Bold",
    "Pretendard", sans-serif;
}

.summary-stat-card {
  background: transparent;
}

.summary-stat-total {
  border: none;
}

.summary-value {
  font-size: 2.5rem;
  line-height: 1.2;
}

.summary-label {
  min-height: 1.25rem;
}

.summary-arrow-btn {
  padding: 0.45rem 0.8rem;
  font-size: 0.8rem;
}

.summary-invest-hint {
  font-size: 1rem;
  font-weight: 700;
  color: #444;
}

.summary-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #475569;
}

.summary-stock-list {
  display: grid;
  gap: 0.5rem;
}

.summary-stock-item {
  border: 1px solid rgba(34, 34, 34, 0.12);
  border-radius: 0.75rem;
  padding: 0.65rem 0.85rem;
  background: rgba(255, 255, 255, 0.6);
}

@media (max-width: 768px) {
  .invest-summary .row {
    --bs-gutter-y: 0.5rem;
  }

  .summary-stat-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0.1rem !important;
  }

  .summary-stat-count {
    text-align: left !important;
  }

  .summary-value {
    line-height: 1.1;
    min-height: 1.2em;
  }
}
</style>
