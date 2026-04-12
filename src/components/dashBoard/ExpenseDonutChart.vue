<template>
  <h3 class="h3 fw-black kb-text-charcoal mb-3">카테고리별 지출</h3>
  <div class="d-flex flex-column flex-sm-row align-items-center chart-layout">
    <div class="position-relative donut-shell">
      <svg viewBox="0 0 120 120" class="w-100 h-100">
        <g transform="rotate(-90 60 60)">
          <!-- 도넛 배경 트랙(라이트 그레이) -->
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
      <div
        class="position-absolute top-50 start-50 translate-middle rounded-circle d-flex flex-column align-items-center justify-content-center bg-white donut-inner"
      >
        <p class="small fw-semibold text-secondary mb-0">총 지출</p>
        <p class="fw-black mb-0 kb-text-charcoal">
          {{ financeStore.formatCurrency(summary.expense) }}
        </p>
      </div>
    </div>

    <ul class="list-unstyled w-100 d-grid legend-list mb-0">
      <li
        v-for="slice in pieSlices"
        :key="slice.category"
        class="rounded-3 legend-item"
      >
        <div class="d-flex justify-content-between legend-head">
          <p class="mb-0 fw-bold kb-text-charcoal legend-label">
            {{ slice.category }}
          </p>
          <p class="mb-0 fw-bold kb-text-brown legend-ratio">
            {{ slice.ratio }}%
          </p>
        </div>
        <div class="progress legend-progress">
          <div
            class="progress-bar"
            :style="{ width: `${slice.ratio}%`, backgroundColor: slice.color }"
          ></div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useFinanceStore } from "@/stores/finance";

const financeStore = useFinanceStore();

const pieColors = [
  "#FFD338", // KB 옐로우
  "#B2C700", // 라임 그린
  "#59B7AF", // 틸 민트
  "#0E88AE", // 딥 아쿠아 블루
  "#D6AA74", // 샌드 브라운
  "#6F7F99", // 뮤트 스틸 블루
  "#8F98A6", // 스모키 블루그레이
  "#6E727B", // 미디엄 슬레이트 그레이
  "#C2C7CF", // 실버 그레이
  "#D3D5D8", // 페일 라이트 그레이
];

const currentMonth = new Date().toISOString().slice(0, 7);

const summary = computed(() => financeStore.getMonthlySummary(currentMonth));

const pieSlices = computed(() => {
  const data = financeStore.getMonthlyExpensesByCategory(currentMonth);
  const total = Object.values(data).reduce((sum, value) => sum + value, 0) || 1;

  const sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return sortedEntries.map(([category, value], index) => ({
    category,
    value,
    color: pieColors[index % pieColors.length],
    ratio: Math.round((value / total) * 100),
  }));
});

const DONUT_RADIUS = 42;
const DONUT_STROKE = 24;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

const donutSlices = computed(() => {
  let cursor = 0;
  return pieSlices.value.map((slice) => {
    const dash = (slice.ratio / 100) * DONUT_CIRCUMFERENCE;
    const offset = cursor;
    cursor += dash;
    return { ...slice, dash, gap: DONUT_CIRCUMFERENCE - dash, offset };
  });
});
</script>

<style scoped>
.chart-layout {
  gap: 1rem;
}

.donut-shell {
  width: 19rem;
  height: 19rem;
}

.donut-inner {
  width: 6.9rem;
  height: 6.4rem;
}

.legend-list {
  gap: 0.35rem;
}

.legend-item {
  background: var(--kb-gray-100);
  padding: 0.45rem 0.6rem;
}

.legend-head {
  margin-bottom: 0.25rem;
}

.legend-label,
.legend-ratio {
  font-size: 0.78rem;
}

.legend-progress {
  height: 0.35rem;
  background: #fff; /* 레전드 진행바 트랙(화이트) */
}
</style>
