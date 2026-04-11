<template>
  <h3 class="h3 fw-black kb-text-charcoal mb-3">카테고리별 지출</h3>
  <div class="d-flex flex-column flex-sm-row align-items-center gap-3">
    <div class="position-relative" style="width: 14rem; height: 14rem">
      <svg viewBox="0 0 120 120" class="w-100 h-100">
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
      <div
        class="position-absolute top-50 start-50 translate-middle rounded-circle d-flex flex-column align-items-center justify-content-center bg-white"
        style="width: 7rem; height: 7rem"
      >
        <p class="small fw-semibold text-secondary mb-0">총 지출</p>
        <p class="fw-black mb-0 kb-text-charcoal">
          {{ formatCurrency(summary.expense) }}
        </p>
      </div>
    </div>
    <ul class="list-unstyled w-100 d-grid gap-2 mb-0">
      <li
        v-for="slice in pieSlices"
        :key="slice.category"
        class="rounded-3 px-3 py-2"
        style="background: var(--kb-gray-100)"
      >
        <div class="d-flex justify-content-between mb-1">
          <p class="mb-0 fw-bold kb-text-charcoal">{{ slice.category }}</p>
          <p class="mb-0 fw-bold kb-text-brown">{{ slice.ratio }}%</p>
        </div>
        <div class="progress" style="height: 0.5rem; background: #fff">
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

const { formatCurrency, getMonthlySummary, getMonthlyExpensesByCategory } =
  useFinanceStore();

const pieColors = [
  "#ffd338",
  "#222222",
  "#7a5c3f",
  "#b99562",
  "#5fa5d9",
  "#e87a5d",
  "#7c8695",
];

const currentMonth = new Date().toISOString().slice(0, 7);

const summary = computed(() => getMonthlySummary(currentMonth));

const pieSlices = computed(() => {
  const data = getMonthlyExpensesByCategory(currentMonth);

  const total = Object.values(data).reduce((sum, value) => sum + value, 0) || 1;

  return Object.entries(data)
    .map(([category, value], index) => ({
      category,
      value,
      color: pieColors[index % pieColors.length],
      ratio: Math.round((value / total) * 100),
    }))
    .sort((a, b) => b.value - a.value);
});

const DONUT_RADIUS = 42;
const DONUT_STROKE = 20;
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
