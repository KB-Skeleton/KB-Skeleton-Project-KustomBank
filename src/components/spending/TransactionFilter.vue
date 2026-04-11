<template>
  <BaseCard isPanel class="kb-filter-card mb-3">
    <div class="filter-row mb-3">
      <div class="kb-toggle-full mb-3">
        <button
          class="kb-toggle-btn"
          :class="{ 'is-active': filter.type === 'all' }"
          @click="setType('all')"
        >
          전체
        </button>
        <button
          class="kb-toggle-btn"
          :class="{ 'is-active': filter.type === 'expense' }"
          @click="setType('expense')"
        >
          지출
        </button>
        <button
          class="kb-toggle-btn"
          :class="{ 'is-active': filter.type === 'income' }"
          @click="setType('income')"
        >
          수입
        </button>
      </div>

      <div class="filter-row d-flex gap-2 mb-4">
        <select v-model="filter.category" class="kb-select flex-grow-1">
          <option value="">전체</option>

          <template v-if="filter.type === 'all' || filter.type === 'expense'">
            <optgroup label="지출">
              <option
                v-for="cat in financeStore.expenseCategories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.icon }} {{ cat.name }}
              </option>
            </optgroup>
          </template>

          <template v-if="filter.type === 'all' || filter.type === 'income'">
            <optgroup label="수입">
              <option
                v-for="cat in financeStore.incomeCategories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.icon }} {{ cat.name }}
              </option>
            </optgroup>
          </template>
        </select>
        <button class="kb-btn-light" @click="handleReset">초기화</button>
      </div>
    </div>
    <div class="filter-row">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <small class="text-secondary fw-bold">금액 범위</small>
        <small class="text-secondary">
          {{ filter.minAmount.toLocaleString() }}원 ~
          {{
            filter.maxAmount
              ? filter.maxAmount.toLocaleString() + '원'
              : '제한 없음'
          }}
        </small>
      </div>

      <div class="kb-range-container">
        <div class="kb-range-track" :style="trackStyle"></div>

        <input
          type="range"
          v-model.number="filter.minAmount"
          :min="0"
          :max="maxLimit"
          :step="10000"
          @input="checkMinAmount"
        />

        <input
          type="range"
          v-model.number="filter.maxAmount"
          :min="0"
          :max="maxLimit"
          :step="10000"
          @input="checkMaxAmount"
        />
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue';
import { useFinanceStore } from '@/stores/finance';
import BaseCard from '../common/BaseCard.vue';

const financeStore = useFinanceStore();

const filter = computed(() => financeStore.state.filter);
const maxLimit = computed(() => financeStore.currentMonthMaxAmount);

const checkMinAmount = () => {
  if (filter.value.minAmount > filter.value.maxAmount) {
    filter.value.minAmount = filter.value.maxAmount;
  }
};

const checkMaxAmount = () => {
  if (filter.value.maxAmount < filter.value.minAmount) {
    filter.value.maxAmount = filter.value.minAmount;
  }
};

const trackStyle = computed(() => {
  const minPercent = (filter.value.minAmount / maxLimit.value) * 100;
  const maxPercent = (filter.value.maxAmount / maxLimit.value) * 100;

  return {
    background: `linear-gradient(to right, #ddd ${minPercent}%, #ffcc00 ${minPercent}%, #ffcc00 ${maxPercent}%, #ddd ${maxPercent}%)`,
  };
});

const setType = (type) => {
  financeStore.setFilter({ type, category: '' });
};

const handleReset = () => {
  financeStore.resetFilter();
  financeStore.setFilter({ maxAmount: maxLimit.value });
};
</script>
<style scoped>
.kb-filter-card {
  padding: 1.5rem;
  background: #ffffff;
}

.kb-toggle-full {
  display: flex;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 4px;
}
.kb-toggle-btn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px 0;
  font-size: 1rem;
  font-weight: 700;
  color: #666;
  border-radius: 10px;
  transition: all 0.2s;
}
.kb-toggle-btn.is-active {
  background: #ffffff;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.kb-select {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 10px 15px;
  font-size: 0.95rem;
  outline: none;
  background-color: #fcfcfc;
}
.kb-btn-reset {
  background: #f1f3f5;
  border: none;
  border-radius: 10px;
  padding: 0 15px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}

.label {
  font-size: 0.85rem;
  color: #888;
  font-weight: 600;
}
.value {
  font-size: 0.9rem;
  color: #444;
}
.value strong {
  color: #333;
}

.kb-range-container {
  position: relative;
  width: 100%;
  height: 24px;
  display: flex;
  align-items: center;
}
.kb-range-track {
  position: absolute;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  z-index: 1;
}

input[type='range'] {
  position: absolute;
  width: 100%;
  pointer-events: none;
  appearance: none;
  background: none;
  z-index: 2;
  margin: 0;
}

input[type='range']::-webkit-slider-thumb {
  pointer-events: auto;
  appearance: none;
  width: 22px;
  height: 22px;
  background-color: #ffffff;
  border: 4px solid #ffcc00;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}
</style>
