<template>
  <div class="d-flex justify-content-between align-items-end mb-2">
    <div>
      <p class="kb-card-label mb-0">월 예산 및 월 소비</p>
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
    <span :class="budgetUsage > 100 ? 'text-danger' : 'kb-text-brown'"
      >{{ formatCurrency(summary.expense) }} ({{ budgetUsage }}%)</span
    >
  </div>
  <ProgressBar :value="budgetUsage" height="1.1rem" />
</template>

<script setup>
import { useFinanceStore } from "@/stores/finance";
import ProgressBar from "../common/ProgressBar.vue";
import { computed, onMounted } from "vue";

const { formatCurrency, getMonthlySummary, getTransaction } = useFinanceStore();

const currentMonth = new Date().toISOString().slice(0, 7);
const monthLabel = currentMonth.replace("-", "년 ") + "월";
const summary = computed(() => getMonthlySummary(currentMonth));

//예산 설정 개발 끝내고 수정
const monthlyBudgetTarget = 1000000;

const budgetUsage = computed(() =>
  Math.round((summary.value.expense / monthlyBudgetTarget) * 100 || 0),
);

onMounted(() => {
  getTransaction();
});
</script>
