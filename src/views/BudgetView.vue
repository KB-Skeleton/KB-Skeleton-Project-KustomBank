<template>
  <section class="space-y-5">
    <article class="kb-panel">
      <p class="kb-card-label">목표 소비액</p>
      <h2 class="text-4xl font-black text-kb-charcoal">{{ formatCurrency(state.monthlyBudgetTarget) }}</h2>

      <p class="mt-2 text-sm text-slate-600">가용 금액</p>
      <p class="text-2xl font-black" :class="availableAmount < 0 ? 'text-red-700' : 'text-sky-700'">
        {{ formatCurrency(availableAmount) }}
      </p>

      <div
        v-if="availableAmount <= 0"
        class="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
      >
        예산을 초과했습니다. 지출 항목을 조정해 가용 금액을 확보해 주세요.
      </div>

      <div class="mt-4 flex items-center justify-between text-sm font-semibold">
        <p class="text-slate-600">사용 금액</p>
        <p :class="totalUsage > 100 ? 'text-red-700' : 'text-slate-700'">
          {{ formatCurrency(summary.expense) }} ({{ totalUsage }}%)
        </p>
      </div>
      <div class="mt-2 h-5 overflow-hidden rounded-full border border-black/10 bg-slate-200">
        <div
          class="h-full transition-all duration-300"
          :style="{ width: `${usedBarWidth}%`, backgroundColor: totalUsage > 100 ? '#dc2626' : '#222222' }"
        ></div>
      </div>
      <p class="mt-2 text-xs text-slate-500">목표 대비 사용 금액을 가로 막대그래프로 표시합니다.</p>
    </article>

    <article class="kb-panel">
      <h3 class="mb-4 text-xl font-bold text-kb-charcoal">카테고리별 소비액</h3>
      <div class="space-y-4">
        <div
          v-for="item in categoryRows"
          :key="item.category"
          class="rounded-xl border border-black/10 bg-[#efece6] p-4"
        >
          <div class="mb-2 flex items-center justify-between text-sm">
            <p class="font-bold text-kb-charcoal">{{ item.category }}</p>
            <p class="font-semibold text-slate-600">
              {{ formatCurrency(item.spent) }} / {{ formatCurrency(item.budget) }}
            </p>
          </div>

          <div class="mb-2 flex items-center justify-between text-xs font-semibold">
            <p :class="item.usage > 100 ? 'text-red-700' : 'text-slate-700'">사용 {{ item.usage }}%</p>
            <p class="text-slate-500">남음 {{ item.remainingRatio }}%</p>
          </div>

          <div class="h-3 overflow-hidden rounded-full border border-black/10 bg-white">
            <div
              class="h-full transition-all duration-300"
              :style="{ width: `${item.barWidth}%`, backgroundColor: item.usage > 100 ? '#dc2626' : '#7A5C3F' }"
            ></div>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useFinanceStore } from "../stores/finance";

const { state, formatCurrency, getMonthlySummary, getMonthlyExpensesByCategory } = useFinanceStore();

const currentMonth = new Date().toISOString().slice(0, 7);
const summary = computed(() => getMonthlySummary(currentMonth));
const categorySpend = computed(() => getMonthlyExpensesByCategory(currentMonth));

const totalUsage = computed(() =>
  Math.round((summary.value.expense / state.monthlyBudgetTarget) * 100 || 0),
);
const usedBarWidth = computed(() => Math.min(totalUsage.value, 100));
const availableAmount = computed(() => state.monthlyBudgetTarget - summary.value.expense);

const categoryRows = computed(() =>
  Object.entries(state.categoryBudgets).map(([category, budget]) => {
    const spent = categorySpend.value[category] || 0;
    const usage = Math.round((spent / budget) * 100 || 0);
    return {
      category,
      budget,
      spent,
      usage,
      barWidth: Math.min(usage, 100),
      remainingRatio: Math.max(0, 100 - Math.min(usage, 100)),
    };
  }),
);
</script>
