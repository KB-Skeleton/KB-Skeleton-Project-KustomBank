<template>
  <div v-if="modelValue" class="kb-modal-overlay" @click.self="closeModal">
    <div class="kb-modal-card comparison-modal">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h3 class="h5 fw-black kb-text-charcoal mb-0">카테고리별 비교</h3>
        <button
          type="button"
          class="btn-close"
          aria-label="닫기"
          @click="closeModal"
        ></button>
      </div>

      <div
        v-if="comparisonRows.length"
        class="rounded-3 p-3"
        style="background: var(--kb-gray-100)"
      >
        <div class="summary-box mb-3">
          지난달 대비 총 지출은
          <strong :class="totalDiff >= 0 ? 'text-danger' : 'text-primary'">
            {{ totalDiff >= 0 ? '+' : '' }}{{ formatCurrency(totalDiff) }}
          </strong>
          입니다.
        </div>

        <div class="comparison-head">
          <span>카테고리</span>
          <span>{{ previousMonthLabel }}월</span>
          <span>{{ currentMonthLabel }}월</span>
          <span>변화</span>
        </div>

        <div
          v-for="row in comparisonRows"
          :key="row.category"
          class="comparison-row"
        >
          <span class="comparison-cell cell-category fw-semibold kb-text-charcoal">
            {{ row.category }}
          </span>
          <span
            class="comparison-cell cell-previous text-secondary"
            :data-label="`${previousMonthLabel}월`"
          >
            {{ formatCurrency(row.previous) }}
          </span>
          <span
            class="comparison-cell cell-current text-secondary"
            :data-label="`${currentMonthLabel}월`"
          >
            {{ formatCurrency(row.current) }}
          </span>
          <span
            :class="[
              'comparison-cell cell-diff',
              row.diff >= 0 ? 'text-danger fw-bold' : 'text-primary fw-bold',
            ]"
            data-label="변화"
          >
            {{ row.diff >= 0 ? '+' : '' }}{{ formatCurrency(row.diff) }}
          </span>
        </div>
      </div>

      <div
        v-else
        class="rounded-3 p-4 text-center small fw-semibold text-secondary"
        style="background: var(--kb-gray-100)"
      >
        비교할 카테고리 데이터가 없습니다.
      </div>

      <div class="d-flex justify-content-end mt-3">
        <button type="button" class="kb-btn-light" @click="closeModal">
          닫기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useFinanceStore } from '@/stores/finance';
import { useStatisticsStore } from '@/stores/statistics';

// 부모에서 v-model로 modal 열고 닫는 상태 제어
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

// finance 스토어 메서드 사용
const { formatCurrency } = useFinanceStore();
// statistics 스토어 메서드 사용
const {
  getMonthKeys,
  ensureStatisticsData,
  getCategoryComparisonRows,
  getExpenseDiff,
} = useStatisticsStore();

// 현재/전달 월 키 계산
const monthKeys = computed(() => getMonthKeys());
const currentMonthKey = computed(() => monthKeys.value.currentMonthKey);
const previousMonthKey = computed(() => monthKeys.value.previousMonthKey);

// 모달 헤더에 표시할 월 텍스트
const currentMonthLabel = computed(() => currentMonthKey.value.slice(5));
const previousMonthLabel = computed(() => previousMonthKey.value.slice(5));

// 카테고리별 전달/이번달 비교 데이터
const comparisonRows = computed(() =>
  getCategoryComparisonRows(currentMonthKey.value),
);

// 총 지출 증감
const totalDiff = computed(() =>
  getExpenseDiff(currentMonthKey.value, previousMonthKey.value),
);

// 모달 열릴 때 최신 거래 데이터 다시 조회
watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      await ensureStatisticsData();
    }
  },
);

// modal 닫기 이벤트 전달
const closeModal = () => {
  emit('update:modelValue', false);
};
</script>

<style scoped>
.comparison-modal {
  width: min(100%, 720px);
}

.summary-box {
  border-radius: 0.75rem;
  background: #fff;
  padding: 0.7rem 0.8rem;
  font-size: 0.9rem;
  font-weight: 700;
}

.comparison-head,
.comparison-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1fr;
  gap: 0.5rem;
  align-items: center;
}

.comparison-head {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 700;
  padding: 0.2rem 0.15rem 0.45rem;
  border-bottom: 1px solid rgba(34, 34, 34, 0.1);
}

.comparison-row {
  padding: 0.7rem 0.15rem;
  border-bottom: 1px solid rgba(34, 34, 34, 0.08);
  font-size: 0.92rem;
}

.comparison-row:last-child {
  border-bottom: none;
}

@media (max-width: 575.98px) {
  .comparison-modal {
    width: min(90vw, 560px);
    max-height: 80vh;
    overflow-y: auto;
    padding: 1rem;
  }

  .comparison-head,
  .comparison-row {
    grid-template-columns: 1fr;
    gap: 0.3rem;
  }

  .comparison-head {
    display: none;
  }

  .comparison-row {
    border: 1px solid rgba(34, 34, 34, 0.1);
    border-radius: 0.75rem;
    padding: 0.65rem;
    margin-bottom: 0.5rem;
    background: #fff;
  }

  .comparison-cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    font-size: 0.88rem;
  }

  .cell-category {
    display: block;
    font-size: 0.92rem;
    margin-bottom: 0.2rem;
    padding-bottom: 0.35rem;
    border-bottom: 1px dashed rgba(34, 34, 34, 0.12);
  }

  .cell-previous::before,
  .cell-current::before,
  .cell-diff::before {
    content: attr(data-label);
    font-size: 0.78rem;
    color: #6b7280;
    font-weight: 700;
  }
}
</style>
