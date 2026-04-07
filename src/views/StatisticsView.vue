<template>
  <section class="space-y-5">
    <article class="grid gap-5 lg:grid-cols-2">
      <div class="kb-panel">
        <h2 class="mb-3 text-xl font-bold text-kb-charcoal">
          카테고리별 지출 (원형 그래프)
        </h2>
        <div v-if="pieSlices.length" class="space-y-4">
          <div
            class="flex flex-col items-center gap-4 sm:flex-row sm:items-center"
          >
            <div
              class="relative h-64 w-64 shrink-0"
            >
              <svg viewBox="0 0 120 120" class="h-full w-full">
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
                class="absolute inset-10 flex flex-col items-center justify-center rounded-full bg-white text-center"
              >
                <p
                  class="text-[11px] font-semibold tracking-wide text-slate-500"
                >
                  총 지출
                </p>
                <p class="text-sm font-black text-kb-charcoal">
                  {{ formatCurrency(totalCategoryExpense) }}
                </p>
              </div>
            </div>
            <ul class="w-full space-y-2">
              <li
                v-for="slice in pieSlices"
                :key="slice.category"
                class="rounded-lg bg-kb-gray-100 px-3 py-2 text-sm"
              >
                <div class="mb-1 flex items-center justify-between">
                  <span class="flex items-center gap-2">
                    <span
                      class="h-3 w-3 rounded-full"
                      :style="{ background: slice.color }"
                    ></span>
                    <span class="font-semibold text-kb-charcoal">{{
                      slice.category
                    }}</span>
                  </span>
                  <span class="font-bold text-kb-brown"
                    >{{ slice.ratio }}%</span
                  >
                </div>
                <div class="mb-1 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    class="h-full rounded-full"
                    :style="{
                      width: `${slice.ratio}%`,
                      backgroundColor: slice.color,
                    }"
                  ></div>
                </div>
                <p class="text-right text-xs font-semibold text-slate-600">
                  {{ formatCurrency(slice.value) }}
                </p>
              </li>
            </ul>
          </div>
        </div>
        <div
          v-else
          class="rounded-xl bg-kb-gray-100 px-4 py-8 text-center text-sm font-semibold text-slate-500"
        >
          이번 달 지출 데이터가 없습니다.
        </div>
      </div>

      <div class="kb-panel">
        <h2 class="mb-3 text-2xl font-black text-kb-charcoal">
          지난달 비교 (선 그래프)
        </h2>
        <div class="relative w-full">
          <svg
            :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`"
            class="h-[26rem] w-full rounded-xl bg-kb-gray-100 p-3"
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
                @focus="hoveredIndex = index"
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
            class="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-bold text-kb-charcoal shadow"
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
    </article>

    <article class="kb-panel">
      <h2 class="mb-3 text-xl font-bold text-kb-charcoal">지출 인사이트</h2>
      <ul class="space-y-2 text-sm text-slate-700">
        <li class="rounded-lg bg-kb-gray-100 px-3 py-2">
          이번 달 최고 지출 카테고리는
          <strong>{{ topCategory }}</strong> 입니다.
        </li>
        <li class="rounded-lg bg-kb-gray-100 px-3 py-2">
          지난달 대비 지출은
          <strong :class="expenseDiff >= 0 ? 'text-red-700' : 'text-sky-700'"
            >{{ expenseDiff >= 0 ? "+" : ""
            }}{{ formatCurrency(expenseDiff) }}</strong
          >
          변화했습니다.
        </li>
        <li class="rounded-lg bg-kb-gray-100 px-3 py-2">
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
  const entries = Object.entries(categoryMap.value)
    .map(([category, value], index) => ({
      category,
      value,
      color: palette[index % palette.length],
      ratio: Math.round((value / total) * 100),
    }))
    .sort((a, b) => b.value - a.value);

  return entries;
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
    return {
      ...slice,
      dash,
      gap: DONUT_CIRCUMFERENCE - dash,
      offset,
    };
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

  return trend.value.map((item, index) => {
    const x = step * (index + 0.5);
    const y = TOP_PADDING + (1 - (item.expense - min) / gap) * innerHeight;
    return { x, y, month: item.month, expense: item.expense };
  });
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
