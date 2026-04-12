<template>
  <div class="col-12 col-lg-6 invest-font">
    <div class="kb-panel h-100">
      <h3 class="h4 fw-black kb-text-charcoal mb-3">투자 아이디어 & 상식</h3>
      <div class="d-grid gap-2">
        <div
          v-for="tip in tips"
          :key="tip.title"
          class="rounded-3 p-3"
          style="background: var(--kb-gray-100)"
        >
          <p class="mb-1 fw-bold kb-text-charcoal">{{ tip.title }}</p>
          <p class="mb-1 small text-secondary">{{ tip.description }}</p>
          <p class="mb-0 small fw-semibold kb-text-brown">
            예상수익 가이드: {{ tip.guide }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const tips = [
  {
    title: "월말 자동 적립식 매수",
    description:
      "지출 후 남은 금액의 일정 비율을 자동 매수로 연결하면 감정적 매매를 줄일 수 있습니다.",
    guide: "연 5~8% 기대 범위",
  },
  {
    title: "고정지출 절감분 재투자",
    description:
      "통신비/구독비 절감분을 ETF에 분산하면 리스크를 낮춘 장기 복리가 가능합니다.",
    guide: "연 4~6% 기대 범위",
  },
  {
    title: "투자 전 기본 상식",
    description:
      "PER/PBR 같은 지표를 먼저 확인하고, 한 종목 비중을 30% 이상 넘기지 않는 것이 안전합니다.",
    guide: "리스크 관리 중심",
  },
];
</script>

<style scoped>
.invest-font {
  font-family:
    "Nunito", "Quicksand", "SF Pro Rounded", "Arial Rounded MT Bold",
    "Pretendard", sans-serif;
}
</style>
