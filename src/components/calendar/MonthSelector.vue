<template>
  <BaseCard isPanel>
    <div class="d-flex justify-content-between align-items-center">
      <div class="fw-bold text-secondary">월별 지출</div>

      <div class="kb-toggle-wrapper mb-1">
        <button
          class="kb-toggle-btn"
          :class="{ 'is-active': financeStore.state.viewMode === 'calendar' }"
          @click="financeStore.setViewMode('calendar')"
        >
          캘린더
        </button>
        <button
          class="kb-toggle-btn"
          :class="{ 'is-active': financeStore.state.viewMode === 'list' }"
          @click="financeStore.setViewMode('list')"
        >
          목록
        </button>
      </div>
    </div>
    <div class="d-flex align-items-center gap-3">
      <button class="kb-btn-light" @click="changeMonth(-1)">&lt;</button>
      <span class="fw-black fs-1"> {{ monthLabel }} </span>
      <button
        class="kb-btn-light"
        @click="changeMonth(1)"
        :disabled="isCurrentMonth"
        :class="{ 'opacity-50': isCurrentMonth }"
      >
        &gt;
      </button>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useFinanceStore } from '@/stores/finance';
import BaseCard from '../common/BaseCard.vue';

const financeStore = useFinanceStore();
const now = new Date();

const monthLabel = computed(() => {
  const [year, month] = financeStore.state.currentMonth.split('-').map(Number);
  return `${year}년 ${month}월`;
});

const viewMode = ref('calendar');

const changeMonth = (offset) => {
  const [year, month] = financeStore.state.currentMonth.split('-').map(Number);
  const newDate = new Date(year, month - 1 + offset, 1);
  const newMonthKey = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;

  const currentLimit = new Date(now.getFullYear(), now.getMonth(), 1);
  if (newDate > currentLimit) return;

  financeStore.setCurrentMonth(newMonthKey);
};

const isCurrentMonth = computed(() => {
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return financeStore.state.currentMonth === todayKey;
});
</script>
