<template>
  <section class="dashboard-layout d-flex flex-column">
    <SummaryCards />

    <article class="kb-panel kb-clickable" @click="router.push('/budget')">
      <BudgetProgress />
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
import { onMounted } from "vue";
import { useFinanceStore } from "@/stores/finance";

const financeStore = useFinanceStore();

const router = useRouter();

onMounted(() => {
  financeStore.getFixed();
  financeStore.getTransaction();
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
