<template>
  <BaseCard isPanel>
    <h2 class="fw-black">월별 상세 내역</h2>

    <div v-if="Object.keys(monthlyTransactions).length === 0">
      이번 달 거래 내역이 없습니다.
    </div>

    <template v-else>
      <div v-for="(transactions, date) in monthlyTransactions" :key="date">
        <div class="mb-3">
          <span class="fw-bold text-secondary">{{ formatDate(date) }}</span>
        </div>
        <div
          v-for="item in transactions"
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
    </template>
  </BaseCard>
</template>
<script setup>
import { computed } from 'vue';
import { useFinanceStore } from '@/stores/finance';
import BaseCard from '../common/BaseCard.vue';

const financeStore = useFinanceStore();

const monthlyTransactions = computed(() => {
  const totalData = financeStore.getTransactionsByMonth(
    financeStore.state.currentMonth,
    true,
  );

  return totalData.reduce((groups, item) => {
    const date = item.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
    return groups;
  }, {});
});

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
};

defineEmits(['open-modal']);
</script>
