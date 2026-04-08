<template>
  <section class="d-grid gap-3">
    <div class="row g-3 row-cols-1 row-cols-md-2 row-cols-xl-4">
      <div class="col">
        <article class="kb-card kb-card-accent-blue kb-clickable h-100 d-flex flex-column justify-content-between" @click="router.push('/monthly-spending')">
          <p class="kb-card-label mb-0">월 수입</p>
          <p class="kb-card-value text-primary mb-0">{{ formatCurrency(summary.income) }}</p>
          <p class="small fw-semibold text-secondary mb-0 invisible">설정 금액</p>
        </article>
      </div>
      <div class="col">
        <article class="kb-card kb-card-accent-red kb-clickable h-100 d-flex flex-column justify-content-between" @click="router.push('/monthly-spending')">
          <p class="kb-card-label mb-0">월 지출</p>
          <p class="kb-card-value text-danger mb-0">{{ formatCurrency(summary.expense) }}</p>
          <p class="small fw-semibold text-secondary mb-0 invisible">설정 금액</p>
        </article>
      </div>
      <div class="col">
        <article class="kb-card kb-card-accent-yellow kb-clickable h-100 d-flex flex-column justify-content-between" @click="router.push('/budget')">
          <p class="kb-card-label mb-0">가용 금액</p>
          <p class="kb-card-value mb-0" :class="availableAmount < 0 ? 'text-danger' : 'kb-text-charcoal'">{{ formatCurrency(availableAmount) }}</p>
          <p class="small fw-semibold text-secondary mb-0">설정 금액 {{ formatCurrency(monthlyBudgetTarget) }}</p>
        </article>
      </div>
      <div class="col">
        <article class="kb-card kb-card-accent-brown kb-clickable h-100 d-flex flex-column justify-content-between" @click="router.push('/fixed-expenses')">
          <p class="kb-card-label mb-0">고정지출</p>
          <p class="kb-card-value kb-text-brown mb-0">{{ formatCurrency(fixedSummary.spentFixed) }}</p>
          <p class="small fw-semibold text-secondary mb-0">전체 {{ formatCurrency(fixedSummary.totalFixed) }} 중 {{ fixedSummary.usage }}%</p>
        </article>
      </div>
    </div>

    <article class="kb-panel kb-clickable" @click="router.push('/budget')">
      <div class="d-flex justify-content-between align-items-end mb-2">
        <div>
          <p class="kb-card-label mb-0">월 예산 및 월 소비</p>
          <h2 class="h3 fw-black kb-text-charcoal mb-0">{{ monthLabel }}</h2>
        </div>
        <p class="mb-0 fw-bold" :class="budgetUsage > 100 ? 'text-danger' : 'kb-text-brown'">{{ budgetUsage }}% 사용</p>
      </div>
      <div class="d-flex justify-content-between small fw-semibold mb-1">
        <span class="text-secondary">사용 금액</span>
        <span :class="budgetUsage > 100 ? 'text-danger' : 'kb-text-charcoal'">{{ formatCurrency(summary.expense) }} ({{ budgetUsage }}%)</span>
      </div>
      <div class="progress" style="height: 1.1rem; background: var(--kb-gray-200)">
        <div class="progress-bar" :style="{ width: `${Math.min(budgetUsage, 100)}%`, backgroundColor: budgetUsage > 100 ? '#dc2626' : '#222222' }"></div>
      </div>
    </article>

    <div class="row g-3">
      <div class="col-12 col-xl-6">
        <article class="kb-panel kb-clickable" @click="router.push('/statistics')">
          <h3 class="h3 fw-black kb-text-charcoal mb-3">카테고리별 지출</h3>
          <div class="d-flex flex-column flex-sm-row align-items-center gap-3">
            <div class="position-relative" style="width: 14rem; height: 14rem">
              <svg viewBox="0 0 120 120" class="w-100 h-100">
                <g transform="rotate(-90 60 60)">
                  <circle cx="60" cy="60" :r="DONUT_RADIUS" fill="none" stroke="#e5e7eb" :stroke-width="DONUT_STROKE" />
                  <circle v-for="slice in donutSlices" :key="slice.category" cx="60" cy="60" :r="DONUT_RADIUS" fill="none" :stroke="slice.color" :stroke-width="DONUT_STROKE" :stroke-dasharray="`${slice.dash} ${slice.gap}`" :stroke-dashoffset="`${-slice.offset}`" />
                </g>
              </svg>
              <div class="position-absolute top-50 start-50 translate-middle rounded-circle d-flex flex-column align-items-center justify-content-center bg-white" style="width: 7rem; height: 7rem;">
                <p class="small fw-semibold text-secondary mb-0">총 지출</p>
                <p class="fw-black mb-0 kb-text-charcoal">{{ formatCurrency(summary.expense) }}</p>
              </div>
            </div>
            <ul class="list-unstyled w-100 d-grid gap-2 mb-0">
              <li v-for="slice in pieSlices" :key="slice.category" class="rounded-3 px-3 py-2" style="background: var(--kb-gray-100)">
                <div class="d-flex justify-content-between mb-1">
                  <p class="mb-0 fw-bold kb-text-charcoal">{{ slice.category }}</p>
                  <p class="mb-0 fw-bold kb-text-brown">{{ slice.ratio }}%</p>
                </div>
                <div class="progress" style="height: .5rem; background: #fff">
                  <div class="progress-bar" :style="{ width: `${slice.ratio}%`, backgroundColor: slice.color }"></div>
                </div>
              </li>
            </ul>
          </div>
        </article>
      </div>

      <div class="col-12 col-xl-6">
        <article class="kb-panel">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h3 class="h3 fw-black kb-text-charcoal mb-0">최근거래내역</h3>
          </div>
          <div class="d-grid gap-2">
            <button
              v-for="item in recentTransactions"
              :key="item.id"
              class="w-100 rounded-3 border text-start px-3 py-2 bg-white"
              style="border-color: rgba(34,34,34,.15)"
              @click="goMonthlyWithDate(item.date)"
            >
              <div class="d-flex justify-content-between align-items-center gap-2">
                <div>
                  <p class="mb-0 fw-bold kb-text-charcoal">{{ item.description }}</p>
                  <p class="mb-0 small fw-semibold text-secondary">{{ item.date }} · {{ item.categoryName }}</p>
                </div>
                <p class="mb-0 fw-black" :class="item.type === 'expense' ? 'text-danger' : 'text-primary'">{{ item.type === 'expense' ? '-' : '+' }}{{ formatCurrency(item.amount) }}</p>
              </div>
            </button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useFinanceStore } from "../stores/finance";

const router = useRouter();
const {
  sortedTransactions,
  formatCurrency,
  getMonthlySummary,
  getMonthlyExpensesByCategory,
  getFixedExpenseSummary,
  monthlyBudgetTarget,
} = useFinanceStore();

const currentMonth = new Date().toISOString().slice(0, 7);
const monthLabel = currentMonth.replace("-", "년 ") + "월";
const summary = computed(() => getMonthlySummary(currentMonth));
const availableAmount = computed(() => monthlyBudgetTarget.value - summary.value.expense);
const fixedSummary = computed(() => getFixedExpenseSummary(currentMonth));

const budgetUsage = computed(() => Math.round((summary.value.expense / monthlyBudgetTarget.value) * 100 || 0));
const recentTransactions = computed(() => sortedTransactions.value.slice(0, 6));

const pieColors = ["#ffd338", "#222222", "#7a5c3f", "#b99562", "#5fa5d9", "#e87a5d", "#7c8695"];
const pieSlices = computed(() => {
  const data = getMonthlyExpensesByCategory(currentMonth);
  const total = Object.values(data).reduce((sum, value) => sum + value, 0) || 1;
  return Object.entries(data)
    .map(([category, value], index) => ({
      category,
      value,
      color: pieColors[index % pieColors.length],
      ratio: Math.round((value / total) * 100),
    }))
    .sort((a, b) => b.value - a.value);
});

const DONUT_RADIUS = 42;
const DONUT_STROKE = 20;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
const donutSlices = computed(() => {
  let cursor = 0;
  return pieSlices.value.map((slice) => {
    const dash = (slice.ratio / 100) * DONUT_CIRCUMFERENCE;
    const offset = cursor;
    cursor += dash;
    return { ...slice, dash, gap: DONUT_CIRCUMFERENCE - dash, offset };
  });
});

const goMonthlyWithDate = (date) => {
  router.push({ path: "/monthly-spending", query: { date } });
};
</script>
