<template>
  <section class="dashboard-layout d-flex flex-column">
    <SummaryCards :monthly-budget-target="monthlyBudgetTargetValue" />

    <article class="kb-panel kb-clickable" @click="router.push('/budget')">
      <BudgetProgress :monthly-budget-target="monthlyBudgetTargetValue" />
    </article>

    <div class="row dashboard-chart-row">
      <div class="col-12 col-xl-6">
        <article
          class="kb-panel kb-clickable h-100"
          @click="router.push('/statistics')"
        >
          <ExpenseDonutChart />
        </article>
      </div>

      <div class="col-12 col-xl-6">
        <article
          class="kb-panel h-100"
          @click="router.push('/monthly-spending')"
        >
          <RecentTransactions />
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import BudgetProgress from "@/components/dashBoard/BudgetProgress.vue";
import SummaryCards from "@/components/dashBoard/SummaryCards.vue";
import ExpenseDonutChart from "@/components/dashBoard/ExpenseDonutChart.vue";
import RecentTransactions from "@/components/dashBoard/RecentTransactions.vue";
import { onMounted, ref, computed } from "vue";
import { useFinanceStore } from "@/stores/finance";
import { useBudgetStores } from "@/stores/budget";
import { useAuthStores } from "@/stores/auth";

const financeStore = useFinanceStore();
const budgetStore = useBudgetStores();
const authStore = useAuthStores();

const router = useRouter();

const selectedBudget = ref(null);

// 현재 사용자 예산 1건을 다시 읽어 화면 계산값을 최신으로 유지
const loadBudgets = async () => {
  const currentUserId = authStore.authState.userId || "user123";

  const [budgetResult] = await Promise.allSettled([
    budgetStore.getBudget(currentUserId),
  ]);
  selectedBudget.value =
    budgetResult.status === "fulfilled" ? budgetResult.value : null;
};

// 카테고리별 예산 합산(총 예산)
const monthlyBudgetTargetValue = computed(() => {
  {
    return budgetStore.sumCategoryBudgets(
      selectedBudget.value?.categoryBudgets,
    );
  }
});

onMounted(() => {
  financeStore.getFixed();
  financeStore.getTransaction();
  loadBudgets();
});
</script>

<style scoped>
.dashboard-layout {
  gap: 1.25rem;
}

.dashboard-chart-row {
  --bs-gutter-x: 1.25rem;
  --bs-gutter-y: 1.25rem;
}
</style>
