<template>
  <section class="space-y-5">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article class="kb-card kb-card-accent-blue">
        <p class="kb-card-label">월 수입</p>
        <p class="kb-card-value text-sky-700">
          {{ formatCurrency(summary.income) }}
        </p>
      </article>
      <article class="kb-card kb-card-accent-red">
        <p class="kb-card-label">월 지출</p>
        <p class="kb-card-value text-red-700">
          {{ formatCurrency(summary.expense) }}
        </p>
      </article>
      <article class="kb-card kb-card-accent-yellow">
        <p class="kb-card-label">월 잔액</p>
        <p class="kb-card-value text-kb-charcoal">
          {{ formatCurrency(summary.balance) }}
        </p>
      </article>
      <article class="kb-card kb-card-accent-brown">
        <p class="kb-card-label">가용 금액</p>
        <p
          class="kb-card-value"
          :class="availableAmount < 0 ? 'text-red-700' : 'text-kb-brown'"
        >
          {{ formatCurrency(availableAmount) }}
        </p>
        <p class="mt-1 text-xs font-semibold text-slate-500">
          설정 금액 {{ formatCurrency(state.monthlyBudgetTarget) }}
        </p>
      </article>
    </div>

    <article class="kb-panel">
      <div class="mb-3 flex items-end justify-between">
        <div>
          <p class="kb-card-label">월 예산 및 월 소비</p>
          <h2 class="text-xl font-bold text-kb-charcoal">{{ monthLabel }}</h2>
        </div>
        <p
          class="text-sm font-semibold"
          :class="budgetUsage > 100 ? 'text-red-700' : 'text-kb-brown'"
        >
          {{ budgetUsage }}% 사용
        </p>
      </div>
      <div
        class="h-4 overflow-hidden rounded-full border border-black/10 bg-slate-200"
      >
        <div
          class="h-full transition-all duration-300"
          :style="{
            width: `${Math.min(budgetUsage, 100)}%`,
            backgroundColor: budgetUsage > 100 ? '#dc2626' : '#222222',
          }"
        ></div>
      </div>

      <p class="mt-3 text-sm text-slate-600">
        소비 {{ formatCurrency(summary.expense) }} / 예산
        {{ formatCurrency(state.monthlyBudgetTarget) }}
      </p>
    </article>

    <article class="kb-panel">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-bold text-kb-charcoal">최근 거래 내역</h2>
        <span
          class="rounded-full bg-kb-yellow px-3 py-1 text-xs font-bold text-kb-charcoal"
          >최신 {{ recentTransactions.length }}건</span
        >
      </div>
      <div class="overflow-auto">
        <table class="w-full min-w-[560px] text-sm">
          <thead>
            <tr
              class="border-b border-black/10 text-left text-xs uppercase tracking-wide text-slate-500"
            >
              <th class="pb-2">날짜</th>
              <th class="pb-2">내역</th>
              <th class="pb-2">카테고리</th>
              <th class="pb-2 text-right">금액</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in recentTransactions"
              :key="item.id"
              class="border-b border-black/5"
            >
              <td class="py-3">{{ item.date }}</td>
              <td class="py-3 font-semibold text-kb-charcoal">
                {{ item.title }}
              </td>
              <td class="py-3">
                <span
                  class="rounded-full bg-kb-gray-200 px-2 py-1 text-xs font-semibold text-kb-brown"
                  >{{ item.category }}</span
                >
              </td>
              <td
                class="py-3 text-right font-bold"
                :class="
                  item.type === 'expense' ? 'text-red-700' : 'text-sky-700'
                "
              >
                {{ item.type === "expense" ? "-" : "+"
                }}{{ formatCurrency(item.amount) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useFinanceStore } from "../stores/finance";

const { state, sortedTransactions, formatCurrency, getMonthlySummary } =
  useFinanceStore();

const currentMonth = new Date().toISOString().slice(0, 7);
const summary = computed(() => getMonthlySummary(currentMonth));
const monthLabel = computed(() => currentMonth.replace("-", "년 ") + "월");
const budgetUsage = computed(() =>
  Math.round((summary.value.expense / state.monthlyBudgetTarget) * 100 || 0),
);
const compareBase = computed(() =>
  Math.max(state.monthlyBudgetTarget, summary.value.expense, 1),
);
const budgetCompareWidth = computed(() =>
  Math.round((state.monthlyBudgetTarget / compareBase.value) * 100),
);
const expenseCompareWidth = computed(() =>
  Math.round((summary.value.expense / compareBase.value) * 100),
);
const availableAmount = computed(
  () => state.monthlyBudgetTarget - summary.value.expense,
);
const recentTransactions = computed(() => sortedTransactions.value.slice(0, 8));
</script>
