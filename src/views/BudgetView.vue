<template>
  <section v-if="isLoading" class="budget-loading kb-panel">
    <div class="spinner-border text-dark" role="status" aria-hidden="true"></div>
    <p class="mb-0 fw-bold text-secondary">예산 데이터를 불러오는 중...</p>
  </section>

  <!-- store 메서드로 조회한 budgets 기준 월 정보를 data 속성으로 보존 -->
  <section v-else class="d-grid gap-3" :data-month-key="monthKey">
    <category-budget-list
      :format-currency="formatCurrency"
      :monthly-budget-target="monthlyBudgetTargetValue"
      @budget-updated="reloadBudget"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import CategoryBudgetList from "../components/budget/CategoryBudgetList.vue";
import { useBudgetStores } from "../stores/budget";
import { useFinanceStore } from "../stores/finance";
import { useAuthStores } from "../stores/auth";
import { storeToRefs } from "pinia";

const budgetStore = useBudgetStores();
const transactionStore = useFinanceStore();
const authStore = useAuthStores();
const { getBudget } = budgetStore;
const { formatCurrency } = transactionStore;
const { userBudget } = storeToRefs(budgetStore);
const selectedBudget = computed(() => userBudget.value);
const isLoading = ref(true);

const reloadBudget = async () => {
  isLoading.value = true;
  try {
    const currentUserId = authStore.authState.userId || "user123";
    await getBudget(currentUserId);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await reloadBudget();
});

// 최신 예산의 month를 화면 기준 월로 사용
const monthKey = computed(() => {
  return selectedBudget.value?.month || "";
});

// 카테고리별 예산 합산(총 예산)
const monthlyBudgetTargetValue = computed(() => {
  return budgetStore.sumCategoryBudgets();
});
</script>

<style scoped>
.budget-loading {
  min-height: 240px;
  display: grid;
  place-items: center;
  gap: 0.75rem;
  text-align: center;
}
</style>
