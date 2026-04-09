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
        <div class="summary-stat-card rounded-3 p-4 text-end">
          <p class="small fw-bold text-secondary mb-1">불필요 지출 건수</p>
          <p class="summary-value fw-black mb-0 kb-text-charcoal">
            {{ berquiredExpenseCount }}건
          </p>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
import { useFinanceStore } from "@/stores/finance";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faAnglesRight } from "@fortawesome/free-solid-svg-icons";

const { state, formatCurrency, getBerquiredOutcome } = useFinanceStore();

const berquiredExpenses = computed(() => getBerquiredOutcome(state.userId));

const totalBerquiredExpenseAmount = computed(() =>
  berquiredExpenses.value.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  ),
);

const berquiredExpenseCount = computed(() => berquiredExpenses.value.length);
</script>

<style scoped>
.invest-summary {
  font-family:
    "Nunito",
    "Quicksand",
    "SF Pro Rounded",
    "Arial Rounded MT Bold",
    "Pretendard",
    sans-serif;
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

.summary-arrow-btn {
  padding: 0.45rem 0.8rem;
  font-size: 0.8rem;
}
</style>
