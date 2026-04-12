<template>
  <div class="d-flex justify-content-between align-items-end mb-2">
    <div>
      <p class="kb-card-label mb-0">월 예산 및 소비</p>
      <h2 class="h3 fw-black kb-text-charcoal mb-0">{{ monthLabel }}</h2>
    </div>
    <p
      class="mb-0 fw-bold"
      :class="budgetUsage > 100 ? 'text-danger' : 'kb-text-brown'"
    >
      {{ budgetUsage }}% 사용
    </p>
  </div>

  <div class="d-flex justify-content-between small fw-semibold mb-1">
    <span class="text-secondary">사용 금액</span>
    <span :class="budgetUsage > 100 ? 'text-danger' : 'kb-text-brown'">
      {{ financeStore.formatCurrency(summary.expense) }} ({{ budgetUsage }}%)
    </span>
  </div>

  <ProgressBar :value="budgetUsage" height="1.1rem" />

  <p v-if="budgetUsage > 100" class="budget-alert-text">
    예산액을 초과하셨습니다
  </p>
  <p v-else-if="budgetUsage > 70" class="budget-alert-text">
    돈을 아끼셔야 합니다
  </p>
</template>

<script setup>
import { useFinanceStore } from "@/stores/finance";
import ProgressBar from "../common/ProgressBar.vue";
import { computed } from "vue";

const props = defineProps({
  monthlyBudgetTarget: {
    type: Number,
    required: true,
  },
});

const financeStore = useFinanceStore();

const currentMonth = new Date().toISOString().slice(0, 7);
const monthLabel = currentMonth.replace("-", "년 ") + "월";
const summary = computed(() => financeStore.getMonthlySummary(currentMonth));

const monthlyBudgetTarget = computed(() => props.monthlyBudgetTarget);

const budgetUsage = computed(() =>
  Math.round((summary.value.expense / monthlyBudgetTarget.value) * 100 || 0),
);
</script>

<style scoped>
.budget-alert-text {
  margin-top: 0.42rem;
  margin-bottom: 0;
  font-size: inherit;
  font-weight: 900;
  line-height: 1.2;
}
</style>
