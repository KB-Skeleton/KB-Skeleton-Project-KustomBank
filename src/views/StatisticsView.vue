<template>
  <section class="d-grid gap-3">
    <article class="row g-3">
      <div class="col-12 col-lg-6 d-flex">
        <div
          class="kb-panel h-100 d-flex flex-column justify-content-center w-100"
        >
          <h2 class="h4 fw-black kb-text-charcoal mb-3">
            카테고리별 지출 (원형 그래프)
          </h2>
          <div
            v-if="pieSlices.length"
            class="d-flex flex-column flex-sm-row align-items-center gap-3"
          >
            <div
              class="position-relative flex-shrink-0"
              style="width: 17.5rem; height: 17.5rem"
            >
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
                class="position-absolute top-50 start-50 translate-middle rounded-circle d-flex flex-column align-items-center justify-content-center bg-white text-center"
                style="width: 12rem; height: 12rem"
              >
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
                  <span class="small fw-bold kb-text-brown"
                    >{{ slice.ratio }}%</span
                  >
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
      </div>

      <div class="col-12 col-lg-6">
        <div class="kb-panel h-100">
          <h2 class="h4 fw-black kb-text-charcoal mb-3">
            지난달 비교 (선 그래프)
          </h2>
          <div class="position-relative w-100">
            <svg
              :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`"
              style="
                height: 20rem;
                width: 100%;
                border-radius: 1rem;
                background: transparent;
                padding: 0.75rem;
              "
              @mouseleave="hoveredIndex = null"
            >
              <line
                :x1="0"
                :y1="CHART_HEIGHT - BOTTOM_PADDING"
                :x2="CHART_WIDTH"
                :y2="CHART_HEIGHT - BOTTOM_PADDING"
                stroke="#cbd5e1"
                stroke-width="1"
              />
              <polyline
                fill="none"
                stroke="#222222"
                stroke-width="9"
                :points="linePoints"
              />
              <line
                v-if="hoveredPoint"
                :x1="hoveredPoint.x"
                :y1="TOP_PADDING"
                :x2="hoveredPoint.x"
                :y2="CHART_HEIGHT - BOTTOM_PADDING"
                stroke="#94a3b8"
                stroke-dasharray="3 3"
                stroke-width="1"
              />
              <g v-for="(point, index) in pointList" :key="point.month">
                <circle
                  :cx="point.x"
                  :cy="point.y"
                  r="18"
                  fill="#ffd338"
                  stroke="#222222"
                  stroke-width="3.5"
                />
                <circle
                  :cx="point.x"
                  :cy="point.y"
                  r="32"
                  fill="transparent"
                  class="cursor-pointer"
                  @mouseenter="hoveredIndex = index"
                />
                <text
                  :x="point.x"
                  :y="CHART_HEIGHT - 42"
                  text-anchor="middle"
                  fill="#64748b"
                  font-size="64"
                  font-weight="900"
                >
                  {{ point.month.slice(5) }}월
                </text>
              </g>
            </svg>

            <div
              v-if="hoveredPoint"
              class="position-absolute translate-middle-x rounded-3 border bg-white px-3 py-2 small fw-bold shadow"
              style="border-color: rgba(34, 34, 34, 0.15)"
              :style="{
                left: `${(hoveredPoint.x / CHART_WIDTH) * 100}%`,
                top: `${(hoveredPoint.y / CHART_HEIGHT) * 100 - 10}%`,
              }"
            >
              {{ hoveredPoint.month.slice(5) }}월 ·
              {{ formatCurrency(hoveredPoint.expense) }}
            </div>
          </div>
        </div>
      </div>
    </article>

    <article class="kb-panel">
      <h2 class="h4 fw-black kb-text-charcoal mb-3">지출 인사이트</h2>
      <ul class="list-unstyled d-grid gap-2 mb-0 small">
        <li class="rounded-3 px-3 py-2" style="background: var(--kb-gray-100)">
          이번 달 최고 지출 카테고리는
          <strong>{{ topCategory }}</strong> 입니다.
        </li>
        <li class="rounded-3 px-3 py-2" style="background: var(--kb-gray-100)">
          지난달 대비 지출은
          <strong :class="expenseDiff >= 0 ? 'text-danger' : 'text-primary'"
            >{{ expenseDiff >= 0 ? "+" : ""
            }}{{ formatCurrency(expenseDiff) }}</strong
          >
          변화했습니다.
        </li>
        <li class="rounded-3 px-3 py-2" style="background: var(--kb-gray-100)">
          예산 대비 사용률은 <strong>{{ budgetUsage }}%</strong> 입니다.
        </li>
      </ul>
    </article>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { useFinanceStore } from "../stores/finance";

const {
  state,
  formatCurrency,
  getMonthlySummary,
  getMonthlyExpensesByCategory,
  getMonthlyExpenseTrend,
} = useFinanceStore();

const currentMonth = new Date().toISOString().slice(0, 7);
const previousMonthDate = new Date();
previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
const previousMonth = previousMonthDate.toISOString().slice(0, 7);

const summary = computed(() => getMonthlySummary(currentMonth));
const previousSummary = computed(() => getMonthlySummary(previousMonth));
const categoryMap = computed(() => getMonthlyExpensesByCategory(currentMonth));

const palette = [
  "#ffd338",
  "#222222",
  "#7a5c3f",
  "#b99562",
  "#e87a5d",
  "#5fa5d9",
];
const totalCategoryExpense = computed(() =>
  Object.values(categoryMap.value).reduce((sum, value) => sum + value, 0),
);

const pieSlices = computed(() => {
  const total = totalCategoryExpense.value || 1;
  return Object.entries(categoryMap.value)
    .map(([category, value], index) => ({
      category,
      value,
      color: palette[index % palette.length],
      ratio: Math.round((value / total) * 100),
    }))
    .sort((a, b) => b.value - a.value);
});

const DONUT_RADIUS = 42;
const DONUT_STROKE = 30;
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

const trend = computed(() => getMonthlyExpenseTrend(currentMonth));
const hoveredIndex = ref(null);
const CHART_WIDTH = 1500;
const CHART_HEIGHT = 500;
const TOP_PADDING = 56;
const BOTTOM_PADDING = 110;

const pointList = computed(() => {
  const values = trend.value.map((item) => item.expense);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const gap = max - min || 1;
  const innerWidth = CHART_WIDTH;
  const innerHeight = CHART_HEIGHT - TOP_PADDING - BOTTOM_PADDING;
  const step = trend.value.length > 0 ? innerWidth / trend.value.length : 0;

  return trend.value.map((item, index) => ({
    x: step * (index + 0.5),
    y: TOP_PADDING + (1 - (item.expense - min) / gap) * innerHeight,
    month: item.month,
    expense: item.expense,
  }));
});

const linePoints = computed(() =>
  pointList.value.map((point) => `${point.x},${point.y}`).join(" "),
);
const hoveredPoint = computed(() =>
  hoveredIndex.value === null
    ? null
    : pointList.value[hoveredIndex.value] || null,
);

const topCategory = computed(
  () => pieSlices.value[0]?.category || "데이터 없음",
);
const expenseDiff = computed(
  () => summary.value.expense - previousSummary.value.expense,
);
const budgetUsage = computed(() =>
  Math.round((summary.value.expense / state.monthlyBudgetTarget) * 100 || 0),
);
</script>
