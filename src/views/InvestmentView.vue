<template>
  <section class="space-y-5">
    <article class="kb-panel">
      <h2 class="mb-3 text-xl font-bold text-kb-charcoal">투자 포트폴리오</h2>
      <div class="grid gap-4 md:grid-cols-3">
        <div v-for="asset in assets" :key="asset.name" class="rounded-2xl border border-black/10 bg-kb-gray-100 p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ asset.type }}</p>
          <p class="mt-1 text-lg font-bold text-kb-charcoal">{{ asset.name }}</p>
          <p class="mt-3 text-sm text-slate-600">평가금액</p>
          <p class="text-lg font-black text-kb-brown">{{ formatCurrency(asset.value) }}</p>
          <p class="mt-1 text-sm font-semibold" :class="asset.change >= 0 ? 'text-sky-700' : 'text-red-700'">
            {{ asset.change >= 0 ? '+' : '' }}{{ asset.change }}%
          </p>
        </div>
      </div>
    </article>

    <article class="kb-panel">
      <h2 class="mb-3 text-xl font-bold text-kb-charcoal">추천 투자 아이디어</h2>
      <div class="space-y-3">
        <div v-for="idea in ideas" :key="idea.title" class="rounded-xl border border-black/10 bg-white p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-bold text-kb-charcoal">{{ idea.title }}</p>
              <p class="mt-1 text-sm text-slate-600">{{ idea.description }}</p>
            </div>
            <span class="rounded-full px-3 py-1 text-xs font-bold" :class="idea.risk === '낮음' ? 'bg-emerald-100 text-emerald-700' : idea.risk === '보통' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'">{{ idea.risk }}</span>
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
  { type: "ETF", name: "KODEX 200", value: 3850000, change: 1.3 },
  { type: "해외주식", name: "Apple", value: 2280000, change: 2.1 },
  { type: "채권", name: "국채혼합형", value: 1520000, change: -0.4 },
];

const ideas = [
  {
    title: "정기 분할매수 유지",
    description: "월 잔액의 30%를 매월 같은 날 ETF에 자동 투자합니다.",
    risk: "낮음",
  },
  {
    title: "고배당주 비중 확대",
    description: "현금흐름 강화를 위해 배당 수익률이 높은 종목을 10% 추가합니다.",
    risk: "보통",
  },
  {
    title: "단기 테마주",
    description: "변동성 높은 섹터로 수익 기회를 노리되 손절 기준을 명확히 둡니다.",
    risk: "높음",
  },
];
</script>

