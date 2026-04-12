<template>
  <div class="kb-panel h-100 d-flex flex-column w-100">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h2 class="h4 fw-black kb-text-charcoal mb-0 chart-title">월별 지출</h2>
      <button
        type="button"
        class="kb-btn-brown"
        @click="isDetailModalOpen = true"
      >
        자세히
      </button>
    </div>

    <!-- trend(데이터) 없으면 렌더링 안되게 -->
    <div v-if="visibleTrend.length" class="chart-wrap rounded-3">
      <div class="bars-wrap">
        <div v-for="item in visibleTrend" :key="item.month" class="bar-item">
          <p class="bar-value mb-1">{{ formatCurrency(item.expense) }}</p>
          <div
            class="bar-fill"
            :style="{ height: `${toHeightPercent(item.expense)}%` }"
          ></div>
          <p class="bar-label mb-0">{{ item.month.slice(5) }}월</p>
        </div>
      </div>
    </div>

    <div
      v-else
      class="rounded-3 p-4 text-center small fw-semibold text-secondary"
      style="background: var(--kb-gray-100)"
    >
      비교할 지출 데이터가 없습니다.
    </div>

    <CategoryComparisonModal v-model="isDetailModalOpen" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useFinanceStore } from "@/stores/finance";
import { useStatisticsStore } from "@/stores/statistics";
import CategoryComparisonModal from "@/components/charts/CategoryComparisonModal.vue";

// finance 스토어 메서드 사용
const { formatCurrency } = useFinanceStore();
// statistics 스토어 메서드 사용
const { getMonthKeys, ensureStatisticsData, getMonthlyComparisonChartData } =
  useStatisticsStore();

// 현재 월(YYYY-MM) 키
const currentMonth = computed(() => getMonthKeys().currentMonthKey);
// 자세히 보기 모달 열림/닫힘 상태
const isDetailModalOpen = ref(false);
// 모바일 뷰포트 여부
const isMobile = ref(false);

// 최근 6개월 지출 추이/최대값 조회(막대 그래프 데이터)
const chartData = computed(() =>
  getMonthlyComparisonChartData(currentMonth.value, 6),
);
const trend = computed(() => chartData.value.trend || []);
// 모바일에서는 최근 3개만 표시
const visibleTrend = computed(() =>
  isMobile.value ? trend.value.slice(-3) : trend.value,
);
const maxExpense = computed(() => {
  if (!visibleTrend.value.length) {
    return 1;
  }

  return Math.max(
    ...visibleTrend.value.map((item) => Number(item.expense || 0)),
    1,
  );
});

// 지출 금액을 퍼센트 높이로 변환
const toHeightPercent = (expense) => {
  const value = Number(expense || 0);
  const max = Number(maxExpense.value || 1);
  return Math.max(8, Math.round((value / max) * 100));
};

let mobileMediaQuery = null;
const handleMobileChange = (event) => {
  isMobile.value = event.matches;
};

onMounted(async () => {
  // 컴포넌트 마운트 시 거래 데이터 최신화
  await ensureStatisticsData();

  mobileMediaQuery = window.matchMedia("(max-width: 575.98px)");
  isMobile.value = mobileMediaQuery.matches;
  mobileMediaQuery.addEventListener("change", handleMobileChange);
});

onBeforeUnmount(() => {
  if (mobileMediaQuery) {
    mobileMediaQuery.removeEventListener("change", handleMobileChange);
  }
});
</script>

<style scoped>
.chart-wrap {
  flex: 1;
  min-height: 22rem;
  background: var(--kb-gray-100);
  padding: 1rem;
  display: flex;
}

.bars-wrap {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.75rem;
}

.bar-item {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-height: 0;
}

.bar-value {
  font-size: 0.72rem;
  font-weight: 700;
  color: #6b7280;
  text-align: center;
}

.bar-fill {
  width: 100%;
  max-width: 2.8rem;
  border-radius: 0.75rem;
  background: #ffd338;
  transition: height 0.25s ease;
}

.bar-label {
  margin-top: 0.5rem;
  font-size: 0.82rem;
  font-weight: 800;
  color: #4b5563;
}

.chart-title {
  font-size: 2rem;
}

@media (max-width: 991.98px) {
  .bars-wrap {
    gap: 0.5rem;
  }

  .bar-fill {
    max-width: 2.2rem;
  }

  .bar-value {
    font-size: 0.65rem;
  }
}

@media (max-width: 575.98px) {
  .chart-wrap {
    padding: 0.75rem;
  }

  .bars-wrap {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    min-height: 14rem;
  }

  .bar-fill {
    max-width: 2.4rem;
  }
}
</style>
