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
      <div class="d-flex align-items-center gap-2 mb-4">
        <div class="kb-input-wrap">
          <input
            type="number"
            v-model.number="filter.minAmount"
            @input="checkMinAmount"
            class="kb-input-sm"
          />
          <span class="unit">원</span>
        </div>
        <span class="text-secondary">~</span>
        <div class="kb-input-wrap">
          <input
            type="number"
            v-model.number="filter.maxAmount"
            @input="checkMaxAmount"
            class="kb-input-sm"
          />
          <span class="unit">원</span>
        </div>
      </div>

      <div class="kb-range-container mb-3">
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

      <div class="filter-row">
        <div class="quick-filter-grid">
          <label
            v-for="range in quickRanges"
            :key="range.label"
            class="quick-item"
          >
            <input
              type="radio"
              name="quickRange"
              @change="applyQuickRange(range.min, range.max)"
            />
            <span class="quick-text">{{ range.label }}</span>
          </label>
        </div>
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

const maxCount = computed(() => Math.max(...histogramData.value, 1));

const isBarInRange = (index) => {
  const step = maxLimit.value / 28;
  const barStart = index * step;
  return (
    barStart >= filter.value.minAmount && barStart <= filter.value.maxAmount
  );
};

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

const quickRanges = computed(() => [
  { label: '전체 금액', min: 0, max: maxLimit.value },
  { label: '5만원 이하', min: 0, max: 50000 },
  { label: '5만 ~ 15만', min: 50000, max: 150000 },
  { label: '15만 ~ 30만', min: 150000, max: 300000 },
  { label: '30만 ~ 50만', min: 300000, max: 500000 },
  { label: '50만원 이상', min: 500000, max: maxLimit.value },
]);

const applyQuickRange = (min, max) => {
  financeStore.setFilter({ minAmount: min, maxAmount: max });
};

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
  width: 18px;
  height: 18px;
  background: #fff;
  border: 3px solid #ffcc00; /* 테두리 노란색 */
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.kb-input-wrap {
  position: relative;
  flex: 1;
}
.kb-input-sm {
  width: 100%;
  border: 1px solid #e1ddd4;
  border-radius: 8px;
  padding: 8px 30px 8px 12px;
  font-size: 0.9rem;
  font-weight: 700;
  text-align: right;
  outline: none;
}
.unit {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  color: #888;
}

.kb-histogram-container {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 40px;
  margin-bottom: -11px;
  padding: 0 10px;
}
.kb-bar {
  flex: 1;
  background: #efece6;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  transition: background 0.3s;
}
.kb-bar.is-active {
  background: #ffd338;
}

.quick-filter-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.quick-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}
.quick-item:hover {
  background: #f6f4ee;
}
.quick-item input[type='radio'] {
  accent-color: #222;
  width: 17px;
  height: 17px;
}
.quick-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;
}

.kb-range-container {
  position: relative;
  width: 100%;
  height: 20px;
}
.kb-range-track {
  position: absolute;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  top: 8px;
}
input[type='range'] {
  position: absolute;
  width: 100%;
  pointer-events: none;
  appearance: none;
  background: none;
  top: 0;
}

@media (max-width: 767px) {
  .quick-filter-grid {
    display: none;
  }
}
</style>
