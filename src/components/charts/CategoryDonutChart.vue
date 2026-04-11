<template>
  <div class="kb-panel h-100 d-flex flex-column justify-content-center w-100">
    <h2 class="h4 fw-black kb-text-charcoal mb-3">카테고리별 지출</h2>

    <div v-if="pieSlices.length" class="category-layout">
      <div class="donut-wrap">
        <svg
          viewBox="0 0 120 120"
          class="donut-svg"
          aria-label="카테고리별 지출 원형 그래프"
        >
          <g transform="rotate(-90 60 60)">
            <circle
              cx="60"
              cy="60"
              :r="DONUT_RADIUS"
              fill="none"
              stroke="#e5e7eb"
              :stroke-width="DONUT_STROKE"
            />
            <circle
              v-for="slice in donutSlices"
              :key="slice.category"
              cx="60"
              cy="60"
              :r="DONUT_RADIUS"
              fill="none"
              :stroke="slice.color"
              :stroke-width="DONUT_STROKE"
              :stroke-dasharray="`${slice.dash} ${slice.gap}`"
              :stroke-dashoffset="`${-slice.offset}`"
            />
          </g>
        </svg>

        <div class="donut-center">
          <p class="mb-0 small fw-semibold text-secondary">총 지출</p>
          <p class="mb-0 fw-black kb-text-charcoal">
            {{ formatCurrency(totalCategoryExpense) }}
          </p>
        </div>
      </div>

      <ul class="list-unstyled w-100 d-grid gap-2 mb-0">
        <li
          v-for="slice in pieSlices"
          :key="slice.category"
          class="rounded-3 px-2 py-2"
          style="background: var(--kb-gray-100)"
        >
          <div class="d-flex justify-content-between mb-1">
            <span class="small fw-semibold kb-text-charcoal">{{
              slice.category
            }}</span>
            <span class="small fw-bold kb-text-brown">{{ slice.ratio }}%</span>
          </div>
          <div class="progress" style="height: 0.35rem; background: #fff">
            <div
              class="progress-bar"
              :style="{
                width: `${slice.ratio}%`,
                backgroundColor: slice.color,
              }"
            ></div>
          </div>
          <p
            class="mb-0 mt-1 fw-semibold text-secondary text-end"
            style="font-size: 0.8rem"
          >
            {{ formatCurrency(slice.value) }}
          </p>
        </li>
      </ul>
    </div>

    <div
      v-else
      class="rounded-3 p-4 text-center small fw-semibold text-secondary"
      style="background: var(--kb-gray-100)"
    >
      이번 달 지출 데이터가 없습니다.
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useFinanceStore } from '@/stores/finance';
import { useStatisticsStore } from '@/stores/statistics';

// finance 스토어 메서드 사용
const { getMonthlyExpensesByCategory, formatCurrency } = useFinanceStore();
// statistics 스토어 메서드 사용
const { getMonthKeys, ensureStatisticsData } = useStatisticsStore();

// 현재 월 키(공통 메서드 재사용)
const currentMonthKey = computed(() => getMonthKeys().currentMonthKey);

// 카테고리별 고정 색상 맵
const categoryColorMap = {
  식비: '#ffd338',
  교통: '#222222',
  '의료/건강': '#7a5c3f',
  '취미/여가': '#b99562',
  '자기계발/교육': '#e87a5d',
  '미용/쇼핑': '#5fa5d9',
  '구독료/고정비': '#6b7280',
  기타: '#000000',
};

// 현재 월 카테고리별 지출 맵 조회
const categoryMap = computed(() =>
  getMonthlyExpensesByCategory(currentMonthKey.value),
);

// 카테고리 지출 총합 계산
const totalCategoryExpense = computed(() =>
  Object.values(categoryMap.value).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  ),
);

// 템플릿 렌더링용(비율/색상 포함) 슬라이스 데이터 가공
const pieSlices = computed(() => {
  const entries = Object.entries(categoryMap.value);
  const total = totalCategoryExpense.value || 1;

  return entries
    .map(([category, value]) => ({
      category,
      value: Number(value || 0),
      color: categoryColorMap[category] || '#222222',
      ratio: Math.round((Number(value || 0) / total) * 100),
    }))
    .sort((a, b) => b.value - a.value);
});

const DONUT_RADIUS = 42;
const DONUT_STROKE = 30;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

// 비율을 SVG 원형 차트의 dash/gap 값으로 변환
const donutSlices = computed(() => {
  let cursor = 0;

  return pieSlices.value.map((slice) => {
    const dash = (slice.ratio / 100) * DONUT_CIRCUMFERENCE;
    const offset = cursor;
    cursor += dash;

    return {
      ...slice,
      dash,
      gap: DONUT_CIRCUMFERENCE - dash,
      offset,
    };
  });
});

onMounted(async () => {
  // 컴포넌트 마운트 시 거래 데이터 조회(페이지 진입 시 최신값으로 갱신)
  await ensureStatisticsData();
});
</script>

<style scoped>
.category-layout {
  display: grid;
  grid-template-columns: 17.5rem 1fr;
  align-items: center;
  gap: 1rem;
}

.donut-wrap {
  position: relative;
  width: 17.5rem;
  height: 17.5rem;
  margin: 0 auto;
}

.donut-svg {
  width: 100%;
  height: 100%;
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12rem;
  height: 12rem;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
}

@media (max-width: 991.98px) {
  .category-layout {
    grid-template-columns: 1fr;
  }
}
</style>
