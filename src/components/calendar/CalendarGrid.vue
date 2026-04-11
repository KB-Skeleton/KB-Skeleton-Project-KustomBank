<template>
  <BaseCard isPanel>
    <div class="kb-month-weekdays">
      <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
    </div>

    <div class="kb-month-grid">
      <button
        v-for="cell in calendarCells"
        :key="cell.key"
        class="kb-month-cell kb-calendar-cell"
        :class="{
          'is-empty': !cell.current,
          'is-current': cell.current,
          'is-selected': selectedDate === cell.date && cell.current,
          'is-today': today === cell.date && cell.current,
        }"
        :disabled="!cell.current"
        @click="selectDate(cell.date)"
      >
        <div v-if="cell.current" class="kb-month-cell-head">
          <span class="kb-month-day">{{ cell.day }}</span>

          <div v-if="today === cell.date" class="kb-month-dot"></div>
        </div>
        <div v-if="cell.current" class="kb-month-meta">
          <p v-if="dailyTotals[cell.date]?.income > 0" class="income">
            +
            {{ dailyTotals[cell.date].income.toLocaleString() }}
          </p>
          <p v-if="dailyTotals[cell.date]?.expense > 0" class="expense">
            - {{ dailyTotals[cell.date].expense.toLocaleString() }}
          </p>

          <div class="kb-mobile-dots">
            <span
              v-if="dailyTotals[cell.date]?.income > 0"
              class="kb-mobile-dot dot-income"
            ></span>
            <span
              v-if="dailyTotals[cell.date]?.expense > 0"
              class="kb-mobile-dot dot-expense"
            ></span>
          </div>
        </div>
      </button>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue';
import { useFinanceStore } from '@/stores/finance';
import BaseCard from '../common/BaseCard.vue';

const financeStore = useFinanceStore();
const now = new Date();
const todayYear = now.getFullYear();
const todayMonth = now.getMonth();
const todayDay = now.getDate();
const userId = computed(() => financeStore.state.userId);
const today = `${todayYear}-${String(todayMonth + 1).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`;

const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

const dailyTotals = computed(() =>
  financeStore.getDailyTotals(financeStore.state.currentMonth, userId.value),
);

const selectDate = (date) => {
  financeStore.setSelectedDate(date);
};

const selectedDate = computed(() => financeStore.state.selectedDate);

const calendarCells = computed(() => {
  const { year, month } = monthDetails.value;
  const currentMonthKey = financeStore.state.currentMonth;
  const lastDate = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1);
  const leadingBlank = firstDay.getDay();

  const cells = [];

  for (let i = 0; i < leadingBlank; i += 1) {
    cells.push({ key: `blank-${i}`, day: '', date: '', current: false });
  }

  for (let day = 1; day <= lastDate; day += 1) {
    const date = `${currentMonthKey}-${String(day).padStart(2, '0')}`;
    cells.push({ key: date, day, date, current: true });
  }

  return cells;
});

const monthDetails = computed(() => {
  const [y, m] = financeStore.state.currentMonth.split('-').map(Number);
  return { year: y, month: m - 1 };
});
</script>
