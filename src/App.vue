<template>
  <div class="min-h-screen kb-bg text-slate-900">
    <header class="sticky top-0 z-20 border-b border-black/10 bg-kb-yellow/95 backdrop-blur">
      <div class="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-kb-brown">KB Smart Budget</p>
          <h1 class="text-xl font-black text-kb-charcoal">KB 가계부</h1>
        </div>
        <div class="rounded-full bg-kb-charcoal px-4 py-2 text-xs font-bold text-kb-yellow">홍길동 님</div>
      </div>
    </header>

    <div class="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:px-8">
      <aside class="lg:w-56 lg:shrink-0">
        <nav class="flex gap-2 overflow-x-auto rounded-2xl border border-black/10 bg-white p-2 shadow-sm lg:flex-col lg:overflow-visible">
          <RouterLink
            v-for="item in menu"
            :key="item.to"
            :to="item.to"
            class="kb-nav-item"
            :class="{ 'kb-nav-item-active': route.path === item.to }"
          >
            <span class="text-lg">{{ item.icon }}</span>
            <span class="text-sm font-semibold">{{ item.label }}</span>
          </RouterLink>
        </nav>
      </aside>

      <main class="flex-1 pb-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { RouterLink, RouterView, useRoute } from "vue-router";

const route = useRoute();

const menu = [
  { to: "/", label: "대시보드", icon: "▣" },
  { to: "/calendar", label: "캘린더", icon: "?" },
  { to: "/investment", label: "투자", icon: "?" },
  { to: "/statistics", label: "통계", icon: "?" },
  { to: "/budget", label: "예산", icon: "?" },
  { to: "/profile", label: "프로필", icon: "◎" },
];
</script>

