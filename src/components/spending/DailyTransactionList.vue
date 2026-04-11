<template>
  <BaseCard isPanel class="mt-3">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h3 class="h5 fw-black mb-0 kb-text-charcoal">
        {{ financeStore.state.selectedDate }} 내역
      </h3>
      <span class="kb-pill">{{ selectedTransactions.length }}건</span>
    </div>

    <div
      v-if="selectedTransactions.length === 0"
      class="bg-secondary-subtle text-secondary rounded-4 py-4 text-center fw-bold"
    >
      해당 날짜의 거래가 없습니다.
    </div>

    <div v-else>
      <div
        v-for="item in selectedTransactions"
        :key="item.id"
        class="kb-transaction-item kb-clickable"
        @click="$emit('open-modal', item)"
      >
        <div class="kb-transaction-info">
          <p class="title">{{ item.title }}</p>
          <p class="category">{{ item.category }}</p>
        </div>

        <div
          class="kb-transaction-amount"
          :class="item.type === 'expense' ? 'text-danger' : 'text-primary'"
        >
          {{ item.type === 'expense' ? '- ₩' : '+ ₩'
          }}{{ item.amount.toLocaleString() }}
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { useFinanceStore } from '@/stores/finance';
import { computed } from 'vue';
import BaseCard from '../common/BaseCard.vue';

const financeStore = useFinanceStore();

const selectedTransactions = computed(() =>
  financeStore.getTransactionsByDate(financeStore.state.selectedDate),
);

defineEmits(['open-modal']);
</script>
