<template>
  <article class="kb-panel invest-summary">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h2 class="kb-text-charcoal fw-black h2-style mb-0">
        불필요한 지출 요약
      </h2>
      <RouterLink to="/beRequired">
        <button
          class="kb-btn-brown d-flex align-items-center justify-content-center p-2"
          style="width: 32px; height: 32px"
        >
          <FontAwesomeIcon :icon="faAnglesRight" />
        </button>
      </RouterLink>
    </div>

    <div class="row g-3">
      <div class="col-12 col-md-7">
        <div class="text-start">
          <p class="small fw-bold text-secondary mb-1">불필요 지출 총액</p>
          <p class="kb-card-value text-danger mb-0">
            {{ formatCurrency(totalBerquiredExpenseAmount) }}
          </p>
        </div>
      </div>

      <div class="col-12 col-md-5">
        <div class="text-md-end text-start mt-md-0 mt-3">
          <p class="small fw-bold text-secondary mb-1">지출 건수</p>
          <p class="kb-card-value kb-text-charcoal mb-0">
            {{ berquiredExpenseCount }}<span class="fs-5 fw-bold">건</span>
          </p>
        </div>
      </div>
    </div>

    <div class="summary-invest-hint mt-4 pt-3 border-top">
      <p class="mb-2">💡 이 금액을 아끼셨다면?</p>
      <div v-if="isStockLoading" class="summary-loading">
        <div
          class="spinner-border spinner-border-sm text-dark"
          role="status"
        ></div>
        <span class="ms-2">적절한 투자 종목 찾는 중...</span>
      </div>
      <div v-else class="text-secondary small">
        아래의 주식들을 살 수 있었어요
      </div>
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

const { getBerquiredOutcome, formatCurrency, getTransaction } =
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
const berquiredExpenseCount = computed(() => berquiredExpenses.value.length);
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
  position: relative;
  overflow: hidden;
}

.kb-card-value {
  font-size: 2rem;
  line-height: 1.1;
  font-weight: 900;
  font-family: "Pretendard", sans-serif;
}

.summary-invest-hint {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--kb-charcoal);
}

.summary-loading {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: #6c757d;
}

@media (max-width: 768px) {
  .invest-summary {
    padding: 1.25rem;
  }

  .kb-card-value {
    font-size: 1.75rem;
  }
}
</style>
