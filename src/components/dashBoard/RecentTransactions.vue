<template>
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h3 class="h3 fw-black kb-text-charcoal mb-0">최근거래내역</h3>
  </div>
  <div class="d-grid gap-2">
    <button
      v-for="item in recentTransactions"
      :key="item.id"
      class="w-100 rounded-3 border text-start px-3 py-2 bg-white"
      style="border-color: rgba(34, 34, 34, 0.15)"
      @click="goMonthlyWithDate(item.date)"
    >
      <div class="d-flex justify-content-between align-items-center gap-2">
        <div>
          <p class="mb-0 fw-bold kb-text-charcoal">{{ item.description }}</p>
          <p class="mb-0 small fw-semibold text-secondary">
            {{ item.date }} · {{ item.categoryName }}
          </p>
        </div>
        <p
          class="mb-0 fw-black"
          :class="item.type === 'expense' ? 'text-danger' : 'text-primary'"
        >
          {{ item.type === "expense" ? "-" : "+"
          }}{{ formatCurrency(item.amount) }}
        </p>
      </div>
    </button>
  </div>
</template>
<script setup>
import { useFinanceStore } from "@/stores/finance";
import { computed } from "vue";

const { sortedTransactions, formatCurrency } = useFinanceStore();

const recentTransactions = computed(() => sortedTransactions.slice(0, 6));

const goMonthlyWithDate = (date) => {
  router.push({ path: "/monthly-spending", query: { date } });
};
</script>
