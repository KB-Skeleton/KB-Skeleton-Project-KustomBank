<template>
  <!--불필요한 투자 지출-->
  <section>
    <InvestSummary> </InvestSummary>
  </section>

  <article class="row g-3 mt-1">
    <!--인기 종목 리스트-->
    <HotStockList></HotStockList>

    <!--투자 아이디어 & 상식-->
    <InvestmentTips></InvestmentTips>
  </article>
</template>
<script setup>
import HotStockList from '@/components/investment/HotStockList.vue';
import InvestmentTips from '@/components/investment/InvestmentTips.vue';
import InvestSummary from '@/components/investment/InvestSummary.vue';
</script>
