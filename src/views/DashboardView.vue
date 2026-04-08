<template>
  <section class="space-y-6">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        class="kb-card kb-card-accent-blue"
        @click="router.push('/monthly-spending')"
      >
        <p class="kb-card-label">월 수입</p>
        <p class="kb-card-value text-sky-700">
          {{ formatCurrency(summary.income) }}
        </p>
      </article>
      <article
        class="kb-card kb-card-accent-red"
        @click="router.push('/monthly-spending')"
      >
        <p class="kb-card-label">월 지출</p>
        <p class="kb-card-value text-red-700">
          {{ formatCurrency(summary.expense) }}
        </p>
      </article>

      <article
        class="kb-card kb-card-accent-yellow"
        @click="router.push('/budget')"
      >
        <p class="kb-card-label">가용 금액</p>
        <p
          class="kb-card-value"
          :class="availableAmount < 0 ? 'text-red-700' : 'text-kb-charcoal'"
        >
          {{ formatCurrency(availableAmount) }}
        </p>
        <p class="mt-1 text-sm font-semibold text-slate-500">
          설정 금액 {{ formatCurrency(monthlyBudgetTarget) }}
        </p>
      </article>
      <button
        class="kb-card kb-card-accent-brown text-left"
        @click="router.push('/fixed-expenses')"
      >
        <p class="kb-card-label">고정지출</p>
        <p class="kb-card-value text-kb-brown">
          {{ formatCurrency(fixedSummary.spentFixed) }}
        </p>
        <p class="mt-1 text-sm font-semibold text-slate-500">
          전체 {{ formatCurrency(fixedSummary.totalFixed) }} 중
          {{ fixedSummary.usage }}%
        </p>
      </button>
    </div>

    <article class="kb-panel">
      <div class="mb-3 flex items-end justify-between">
        <div>
          <p class="kb-card-label">월 예산 및 월 소비</p>
          <h2 class="text-2xl font-black text-kb-charcoal">{{ monthLabel }}</h2>
        </div>
        <p
          class="text-base font-bold"
          :class="budgetUsage > 100 ? 'text-red-700' : 'text-kb-brown'"
        >
          {{ budgetUsage }}% 사용
        </p>
      </div>
      <div class="mt-3 flex items-center justify-between text-sm font-semibold">
        <p class="text-slate-600">사용 금액</p>
        <p :class="budgetUsage > 100 ? 'text-red-700' : 'text-kb-charcoal'">
          {{ formatCurrency(summary.expense) }} ({{ budgetUsage }}%)
        </p>
      </div>
      <div class="mt-2 h-5 overflow-hidden rounded-full bg-kb-gray-200">
        <div
          class="h-full"
          :style="{
            width: `${Math.min(budgetUsage, 100)}%`,
            backgroundColor: budgetUsage > 100 ? '#dc2626' : '#222222',
          }"
        ></div>
      </div>
    </article>

    <div class="grid gap-5 xl:grid-cols-2">
      <article class="kb-panel">
        <h3 class="mb-3 text-2xl font-black text-kb-charcoal">
          카테고리별 지출
        </h3>
        <div
          class="flex flex-col items-center gap-4 sm:flex-row sm:items-center"
        >
          <div class="relative h-56 w-56 shrink-0">
            <svg viewBox="0 0 120 120" class="h-full w-full">
              <g transform="rotate(-90 60 60)">
                <circle
                  cx="60"
                  cy="60"
                  :r="DONUT_RADIUS"
                  fill="none"
                  stroke="#e5e7eb"
                  :stroke-width="DONUT_STROKE"
                />
                <circle
                  v-for="slice in donutSlices"
                  :key="slice.category"
                  cx="60"
                  cy="60"
                  :r="DONUT_RADIUS"
                  fill="none"
                  :stroke="slice.color"
                  :stroke-width="DONUT_STROKE"
                  :stroke-dasharray="`${slice.dash} ${slice.gap}`"
                  :stroke-dashoffset="`${-slice.offset}`"
                />
              </g>
            </svg>
            <div
              class="absolute inset-10 flex flex-col items-center justify-center rounded-full bg-white"
            >
              <p class="text-xs font-semibold text-slate-500">총 지출</p>
              <p class="text-lg font-black text-kb-charcoal">
                {{ formatCurrency(summary.expense) }}
              </p>
            </div>
          </div>
          <ul class="w-full space-y-2">
            <li
              v-for="slice in pieSlices"
              :key="slice.category"
              class="rounded-xl bg-kb-gray-100 px-3 py-3 text-sm"
            >
              <div class="mb-1 flex items-center justify-between">
                <p class="font-bold text-kb-charcoal">{{ slice.category }}</p>
                <p class="font-bold text-kb-brown">{{ slice.ratio }}%</p>
              </div>
              <div class="h-2 rounded-full bg-white">
                <div
                  class="h-full rounded-full"
                  :style="{
                    width: `${slice.ratio}%`,
                    backgroundColor: slice.color,
                  }"
                ></div>
              </div>
            </li>
          </ul>
        </div>
      </article>

      <article class="kb-panel">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-2xl font-black text-kb-charcoal">최근거래내역</h3>
          <button
            class="kb-btn-light"
            @click="router.push('/monthly-spending')"
          >
            월별지출로 이동
          </button>
        </div>
        <div class="space-y-3">
          <button
            v-for="item in recentTransactions"
            :key="item.id"
            class="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-left hover:border-kb-brown/40"
            @click="goMonthlyWithDate(item.date)"
          >
            <div class="flex items-center justify-between gap-2">
              <div>
                <p class="text-base font-bold text-kb-charcoal">
                  {{ item.description }}
                </p>
                <p class="text-xs font-semibold text-slate-500">
                  {{ item.date }} · {{ item.categoryName }}
                </p>
              </div>
              <p
                class="text-sm font-black"
                :class="
                  item.type === 'expense' ? 'text-red-700' : 'text-sky-700'
                "
              >
                {{ item.type === "expense" ? "-" : "+"
                }}{{ formatCurrency(item.amount) }}
              </p>
            </div>
          </button>
        </div>
      </article>
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
const availableAmount = computed(
  () => monthlyBudgetTarget.value - summary.value.expense,
);
const fixedSummary = computed(() => getFixedExpenseSummary(currentMonth));

const budgetUsage = computed(() =>
  Math.round((summary.value.expense / monthlyBudgetTarget.value) * 100 || 0),
);

const recentTransactions = computed(() => sortedTransactions.value.slice(0, 6));

const pieColors = [
  "#ffd338",
  "#222222",
  "#7a5c3f",
  "#b99562",
  "#5fa5d9",
  "#e87a5d",
  "#7c8695",
];
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
    return {
      ...slice,
      dash,
      gap: DONUT_CIRCUMFERENCE - dash,
      offset,
    };
  });
});

const goMonthlyWithDate = (date) => {
  router.push({ path: "/monthly-spending", query: { date } });
};
</script>
