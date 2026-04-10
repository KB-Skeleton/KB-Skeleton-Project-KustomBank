<template>
  <article class="kb-panel">
    <div class="d-flex flex-wrap align-items-start justify-content-between gap-2 kb-summary-head">
      <div>
        <p class="kb-card-label mb-0">전체 예산 (카테고리 합산)</p>
        <h2 class="display-6 fw-black kb-text-charcoal mb-0 kb-summary-amount">
          {{ formatCurrency(monthlyBudgetTarget) }}
        </h2>
        <p class="small text-secondary mb-0">
          카테고리별 예산 합계가 전체 예산입니다.
        </p>
      </div>
      <button type="button" class="kb-btn-dark" @click="$emit('open-bulk-edit')">
        카테고리별 예산 설정
      </button>
    </div>

    <div class="d-flex justify-content-between mt-3 small fw-semibold kb-summary-usage">
      <span class="text-secondary">사용 금액</span>
      <span :class="totalUsage > 100 ? 'text-danger' : 'kb-text-charcoal'">
        {{ formatCurrency(totalSpent) }} ({{ totalUsage }}%)
      </span>
    </div>
    <div class="progress mt-2" style="height: 1.1rem; background: var(--kb-gray-200)">
      <div
        class="progress-bar"
        :style="{
          width: `${Math.min(totalUsage, 100)}%`,
          backgroundColor: totalUsage > 100 ? '#dc2626' : '#222222',
        }"
      />
    </div>
  </article>
</template>

<script setup>
defineProps({
  formatCurrency: {
    type: Function,
    required: true,
  },
  monthlyBudgetTarget: {
    type: Number,
    required: true,
  },
  totalSpent: {
    type: Number,
    required: true,
  },
  totalUsage: {
    type: Number,
    required: true,
  },
});

defineEmits(['open-bulk-edit']);
</script>

<style scoped>
@media (max-width: 768px) {
  .kb-summary-head {
    flex-direction: column;
    align-items: stretch !important;
  }

  .kb-summary-head .kb-btn-dark {
    width: 100%;
  }

  .kb-summary-amount {
    font-size: 1.6rem !important;
    line-height: 1.25;
  }
}

@media (max-width: 480px) {
  .kb-summary-usage {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 0.25rem;
  }

  .kb-summary-amount {
    font-size: 1.35rem !important;
  }
}
</style>
