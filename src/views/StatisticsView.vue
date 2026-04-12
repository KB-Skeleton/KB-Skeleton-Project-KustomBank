<template>
  <section class="d-grid gap-3">
    <article class="row g-3">
      <div class="col-12 col-lg-6 d-flex">
        <CategoryDonutChart />
      </div>
      <div class="col-12 col-lg-6 d-flex">
        <MonthlyComparisonChart />
      </div>
    </article>

    <SpendingInsight />
  </section>
</template>

<script setup>
import CategoryDonutChart from '@/components/charts/CategoryDonutChart.vue';
import MonthlyComparisonChart from '@/components/charts/MonthlyComparisonChart.vue';
import SpendingInsight from '@/components/charts/SpendingInsight.vue';
</script>
