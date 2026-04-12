<template>
  <BaseCard isPanel>
    <article>
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <p class="kb-card-label mb-0">이번 달</p>
          <h2 class="kb-text-charcoal fw-black h2-style mb-0">
            불필요한 지출 목록
          </h2>
        </div>

        <RouterLink to="/investment">
          <button
            class="kb-btn-brown d-flex align-items-center justify-content-center p-2"
            style="width: 32px; height: 32px"
          >
            <FontAwesomeIcon :icon="faAnglesLeft" />
          </button>
        </RouterLink>
      </div>

      <div class="mb-4 pb-3 border-bottom">
        <p class="small fw-bold text-secondary mb-1">총 지출 합계</p>
        <p class="kb-card-value text-danger mb-0">
          {{ formatCurrency(totalAmount) }}
        </p>
      </div>

      <div v-if="beRequiredList.length" class="d-grid gap-2">
        <div
          v-for="item in beRequiredList"
          :key="item.id"
          class="kb-transaction-item w-100"
        >
          <div class="kb-transaction-info">
            <p class="title">{{ item.description }}</p>
            <p class="category">{{ item.date }} · {{ item.categoryName }}</p>
          </div>
          <div class="kb-transaction-amount text-danger">
            {{ formatCurrency(item.amount) }}
          </div>
        </div>
      </div>

      <div
        v-else
        class="rounded-4 p-5 text-center small fw-bold text-secondary kb-bg-soft"
      >
        이번 달 불필요한 지출 내역이 없습니다. 😊
      </div>
    </article>
  </BaseCard>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useFinanceStore } from '@/stores/finance';
import { useAuthStores } from '@/stores/auth';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faAnglesLeft } from '@fortawesome/free-solid-svg-icons';
import BaseCard from '@/components/common/BaseCard.vue';

const financeStore = useFinanceStore();
const { authState } = useAuthStores();

const formatCurrency = (value) => financeStore.formatCurrency(value);

const beRequiredList = computed(() =>
  financeStore.getBerquiredOutcome(authState.userId),
);
const totalAmount = computed(() =>
  financeStore.getBerquiredOutcomeAmount(authState.userId),
);

onMounted(async () => {
  await financeStore.getTransaction();
});
</script>

<style scoped>
.be-required-view {
  width: 100%;
}

.kb-panel {
  padding: 1.5rem;
}

.h2-style {
  font-size: 1.75rem;
  letter-spacing: -0.02em;
}

.kb-card-value {
  font-size: 2rem;
  line-height: 1.1;
  font-weight: 900;
  font-family: 'Pretendard', sans-serif;
}

.kb-transaction-item {
  margin-bottom: 0.5rem;
  width: 100%;
}

@media (max-width: 768px) {
  .kb-panel {
    padding: 1.25rem;
  }
  .kb-card-value {
    font-size: 1.75rem;
  }
}
</style>
