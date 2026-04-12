<template>
  <!-- store 메서드로 조회한 budgets 기준 월 정보를 data 속성으로 보존 -->
  <section class="d-grid gap-3" :data-month-key="monthKey">
    <category-budget-list
      :format-currency="formatCurrency"
      :monthly-budget-target="monthlyBudgetTargetValue"
      @budget-updated="loadBudgets"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import CategoryBudgetList from '../components/budget/CategoryBudgetList.vue';
import { useBudgetStores } from '../stores/budget';
import { useFinanceStore } from '../stores/finance';
import { useAuthStores } from '../stores/auth';

const budgetStore = useBudgetStores();
const transactionStore = useFinanceStore();
const authStore = useAuthStores();
const { getBudget, sumCategoryBudgets } = budgetStore;
const { formatCurrency } = transactionStore;

const selectedBudget = ref(null);

// 현재 로그인된 사용자의 budget 데이터 불러오기
const loadBudgets = async () => {
  const currentUserId = authStore.authState.userId;
  const [budgetResult] = await Promise.allSettled([getBudget(currentUserId)]);
  selectedBudget.value =
    budgetResult.status === 'fulfilled' ? budgetResult.value : null;
};

onMounted(async () => {
  await loadBudgets();
});

// 최신 예산의 month를 화면 기준 월로 사용
const monthKey = computed(() => {
  return selectedBudget.value?.month || '';
});

// 카테고리별 예산 합산(총 예산)
const monthlyBudgetTargetValue = computed(() => {
  return sumCategoryBudgets(selectedBudget.value?.categoryBudgets);
});
</script>
