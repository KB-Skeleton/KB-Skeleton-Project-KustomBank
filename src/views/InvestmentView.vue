<template>
  <section class="space-y-6">
    <article class="kb-panel">
      <h2 class="mb-3 text-3xl font-black text-kb-charcoal">투자 브리핑</h2>
      <div class="grid gap-4 md:grid-cols-3">
        <div v-for="asset in assets" :key="asset.name" class="rounded-2xl border border-black/10 bg-kb-gray-100 p-4">
          <p class="text-xs font-bold uppercase tracking-wide text-slate-500">{{ asset.type }}</p>
          <p class="mt-1 text-xl font-black text-kb-charcoal">{{ asset.name }}</p>
          <p class="mt-2 text-sm text-slate-600">투자금 {{ formatCurrency(asset.principal) }}</p>
          <p class="text-sm text-slate-600">예상 수익 {{ formatCurrency(asset.expectedProfit) }}</p>
          <p class="mt-2 text-sm font-bold" :class="asset.change >= 0 ? 'text-sky-700' : 'text-red-700'">
            수익률 {{ asset.change >= 0 ? '+' : '' }}{{ asset.change }}%
          </p>
        </div>
      </div>
    </article>

    <article class="grid gap-5 lg:grid-cols-2">
      <div class="kb-panel">
        <h3 class="mb-3 text-2xl font-black text-kb-charcoal">현재 인기 종목</h3>
        <div class="space-y-3">
          <div v-for="stock in hotStocks" :key="stock.name" class="rounded-xl border border-black/10 bg-white p-4">
            <div class="flex items-center justify-between">
              <p class="text-lg font-bold text-kb-charcoal">{{ stock.name }}</p>
              <p class="text-sm font-black" :class="stock.change >= 0 ? 'text-sky-700' : 'text-red-700'">{{ stock.change >= 0 ? '+' : '' }}{{ stock.change }}%</p>
            </div>
            <p class="mt-1 text-sm text-slate-600">인기 이유: {{ stock.reason }}</p>
          </div>
        </div>
      </div>

      <div class="kb-panel">
        <h3 class="mb-3 text-2xl font-black text-kb-charcoal">투자 아이디어 & 상식</h3>
        <div class="space-y-3">
          <div v-for="tip in tips" :key="tip.title" class="rounded-xl bg-kb-gray-100 p-4">
            <p class="text-lg font-bold text-kb-charcoal">{{ tip.title }}</p>
            <p class="mt-1 text-sm text-slate-700">{{ tip.description }}</p>
            <p class="mt-2 text-xs font-semibold text-kb-brown">예상수익 가이드: {{ tip.guide }}</p>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup>
import { useFinanceStore } from "../stores/finance";

const { formatCurrency } = useFinanceStore();

const assets = [
  { type: "ETF", name: "KODEX 200", principal: 3000000, expectedProfit: 210000, change: 7.0 },
  { type: "해외주식", name: "NVIDIA", principal: 2200000, expectedProfit: 286000, change: 13.0 },
  { type: "채권", name: "국채혼합형", principal: 1400000, expectedProfit: 56000, change: 4.0 },
];

const hotStocks = [
  { name: "삼성전자", change: 1.8, reason: "AI 반도체 수요와 실적 개선 기대" },
  { name: "SK하이닉스", change: 3.2, reason: "HBM 공급 확대 이슈" },
  { name: "테슬라", change: -0.9, reason: "신차 발표와 로보택시 뉴스" },
];

const tips = [
  {
    title: "월말 자동 적립식 매수",
    description: "지출 후 남은 금액의 일정 비율을 자동 매수로 연결하면 감정적 매매를 줄일 수 있습니다.",
    guide: "연 5~8% 기대 범위",
  },
  {
    title: "고정지출 절감분 재투자",
    description: "통신비/구독비 절감분을 ETF에 분산하면 리스크를 낮춘 장기 복리가 가능합니다.",
    guide: "연 4~6% 기대 범위",
  },
  {
    title: "투자 전 기본 상식",
    description: "PER/PBR 같은 지표를 먼저 확인하고, 한 종목 비중을 30% 이상 넘기지 않는 것이 안전합니다.",
    guide: "리스크 관리 중심",
  },
];
</script>
