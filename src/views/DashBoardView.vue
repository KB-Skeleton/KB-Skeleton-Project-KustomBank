<template>
  <!--대시보드 서머리-->
  <section class="d-gird gap-3">
    <SummaryCards />

    <!--예산 소진 바-->
    <article class="kb-panel kb-clickable" @click="router.push('/budget')">
      <BudgetProgress></BudgetProgress>
    </article>

    <!--소비 도넛 차트-->
    <div class="row g-3">
      <div class="col-12 col-xl-6">
        <article
          class="kb-panel kb-clickable"
          @click="router.push('/statistics')"
        >
          <ExpenseDonutChart></ExpenseDonutChart>
        </article>
      </div>
    </div>

    <!--최근 소비 내역-->
    <div class="col-12 col-xl-6">
      <article class="kb-panel">
        <RecentTransactions />
      </article>
    </div>
  </section>
</template>
<script setup>
import { useRouter } from "vue-router";
import BudgetProgress from "@/components/dashBoard/BudgetProgress.vue";
import SummaryCards from "@/components/dashBoard/SummaryCards.vue";
import ExpenseDonutChart from "@/components/dashBoard/ExpenseDonutChart.vue";
import RecentTransactions from "@/components/dashBoard/RecentTransactions.vue";

const router = useRouter();
</script>
