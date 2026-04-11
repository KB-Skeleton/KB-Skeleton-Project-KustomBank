<template>
  <article class="kb-panel">
    <h2 class="h4 fw-black kb-text-charcoal mb-3">지출 인사이트</h2>
    <ul class="list-unstyled d-grid gap-2 mb-0 small">
      <li class="rounded-3 px-3 py-2" style="background: var(--kb-gray-100)">
        이번 달 최고 지출 카테고리는
        <strong>{{ topCategory }}</strong> 입니다.
      </li>
      <li class="rounded-3 px-3 py-2" style="background: var(--kb-gray-100)">
        지난달 대비 지출은
        <strong :class="expenseDiff >= 0 ? 'text-danger' : 'text-primary'">
          {{ expenseDiff >= 0 ? '+' : '' }}{{ formatCurrency(expenseDiff) }}
        </strong>
        변화했습니다.
      </li>
      <li class="rounded-3 px-3 py-2" style="background: var(--kb-gray-100)">
        지난달 대비 사용률은
        <strong :class="usageDiff >= 0 ? 'text-danger' : 'text-primary'">
          {{ usageDiff >= 0 ? '+' : '' }}{{ usageDiff }}%
        </strong>
        입니다.
      </li>
    </ul>
  </article>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStores } from '@/stores/auth';
import { useBudgetStores } from '@/stores/budget';
import { useFinanceStore } from '@/stores/finance';
import { useStatisticsStore } from '@/stores/statistics';

// finance/budget/auth 스토어 사용
const { getMonthlySummary, formatCurrency } = useFinanceStore();
// statistics 스토어 메서드 사용
const { getMonthKeys, ensureStatisticsData, getTopExpenseCategory, getExpenseDiff } =
  useStatisticsStore();
const { getBudget, sumCategoryBudgets } = useBudgetStores();
const { authState } = useAuthStores();

// 예산 1건 저장
const selectedBudget = ref(null);

// 현재/전달 월 키 계산(공통 메서드 재사용)
const monthKeys = computed(() => getMonthKeys());
const currentMonthKey = computed(() => monthKeys.value.currentMonthKey);
const previousMonthKey = computed(() => monthKeys.value.previousMonthKey);

// 이번 달 최고 지출 카테고리 계산
const topCategory = computed(() => getTopExpenseCategory(currentMonthKey.value));

// 지난달 대비 지출 증감
const expenseDiff = computed(() =>
  getExpenseDiff(currentMonthKey.value, previousMonthKey.value),
);

// 월별 요약(수입/지출) 계산
const currentSummary = computed(() => getMonthlySummary(currentMonthKey.value));
const previousSummary = computed(() =>
  getMonthlySummary(previousMonthKey.value),
);

// 총 예산 계산
const totalBudget = computed(() =>
  sumCategoryBudgets(selectedBudget.value?.categoryBudgets || {}),
);

// 이번 달/지난달 사용률 계산
const currentUsage = computed(() => {
  const budget = Number(totalBudget.value || 0);
  if (!budget) {
    return 0;
  }
  return Math.round((Number(currentSummary.value.expense || 0) / budget) * 100);
});

const previousUsage = computed(() => {
  const budget = Number(totalBudget.value || 0);
  if (!budget) {
    return 0;
  }
  return Math.round(
    (Number(previousSummary.value.expense || 0) / budget) * 100,
  );
});

// 지난달 대비 사용률 증감(%p)
const usageDiff = computed(() => currentUsage.value - previousUsage.value);

// 예산 데이터 조회
const loadBudget = async () => {
  const currentUserId = authState?.userId || 'user123';
  selectedBudget.value = await getBudget(currentUserId);
};

onMounted(async () => {
  // 컴포넌트 진입 시 거래/예산 최신화
  await Promise.all([ensureStatisticsData(), loadBudget()]);
});
</script>
