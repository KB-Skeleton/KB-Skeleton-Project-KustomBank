<template>
  <article class="kb-panel">
    <p class="kb-card-label mb-1">고정지출 관리</p>
    <div
      class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-2"
    >
      <div>
        <h2 class="h2 fw-black kb-text-charcoal mb-2">고정지출 현황</h2>

        <div class="d-flex flex-wrap gap-2 small fw-semibold">
          <span class="kb-pill">
            이번 달 고정지출 {{ formatCurrency(summary.totalFixed || 0) }}
          </span>
          <span class="kb-pill">등록 {{ summary.itemCount || 0 }}건</span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { useFinanceStore } from '@/stores/finance';

const { formatCurrency } = useFinanceStore();

defineProps({
  summary: {
    type: Object,
    default: () => ({
      totalFixed: 0,
      itemCount: 0,
    }),
  },
  monthLabel: {
    type: String,
    default: '',
  },
});
</script>
