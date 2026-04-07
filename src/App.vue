<template>
  <div class="min-h-screen kb-bg text-slate-900">
    <header class="sticky top-0 z-30 border-b border-black/10 bg-kb-yellow/95 backdrop-blur">
      <div class="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <div class="kb-logo-mark">
            <span>KB</span>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-kb-brown">KB Smart Budget</p>
            <h1 class="text-2xl font-black text-kb-charcoal">KB 머니플로우</h1>
          </div>
        </div>
        <div class="rounded-full bg-kb-charcoal px-4 py-2 text-sm font-bold text-kb-yellow">홍길동 님</div>
      </div>
    </header>

    <div class="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:px-8">
      <aside class="lg:w-64 lg:shrink-0">
        <nav class="flex gap-2 overflow-x-auto rounded-2xl border border-black/10 bg-white p-2 shadow-sm lg:flex-col lg:overflow-visible">
          <RouterLink
            v-for="item in menu"
            :key="item.to"
            :to="item.to"
            class="kb-nav-item"
            :class="{ 'kb-nav-item-active': route.path === item.to }"
          >
            <span class="text-lg">{{ item.icon }}</span>
            <span class="text-base font-semibold">{{ item.label }}</span>
          </RouterLink>
        </nav>
      </aside>

      <main class="flex-1 pb-24 lg:pb-10">
        <RouterView />
      </main>
    </div>

    <button class="kb-fab" @click="openAddModal">
      + 지출/수입 추가
    </button>

    <div v-if="showAddModal" class="fixed inset-0 z-40 flex items-end justify-center bg-black/35 p-3 sm:items-center" @click.self="closeAddModal">
      <div class="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-5 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-2xl font-black text-kb-charcoal">지출/수입 등록</h2>
          <button class="kb-btn-light" @click="closeAddModal">닫기</button>
        </div>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <button class="rounded-xl px-3 py-2 text-sm font-bold" :class="addForm.type === 'expense' ? 'bg-red-600 text-white' : 'bg-kb-gray-100 text-slate-700'" @click="addForm.type = 'expense'">지출</button>
            <button class="rounded-xl px-3 py-2 text-sm font-bold" :class="addForm.type === 'income' ? 'bg-sky-600 text-white' : 'bg-kb-gray-100 text-slate-700'" @click="addForm.type = 'income'">수입</button>
          </div>

          <input v-model.number="addForm.amount" type="number" min="0" class="kb-input" placeholder="금액" />
          <input v-model="addForm.date" type="date" class="kb-input" />
          <select v-model.number="addForm.categoryId" class="kb-input">
            <option v-for="item in activeCategories" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
          <button
            v-if="addForm.type === 'expense'"
            class="w-full rounded-xl border px-3 py-2 text-sm font-bold transition"
            :class="addForm.isFixed ? 'border-[rgb(96,88,76)] bg-[rgb(96,88,76)] text-white' : 'border-[rgb(96,88,76)] bg-[rgba(96,88,76,0.14)] text-[rgb(96,88,76)]'"
            @click="addForm.isFixed = !addForm.isFixed"
          >
            {{ addForm.isFixed ? "고정지출로 등록됨" : "고정지출로 등록" }}
          </button>
          <textarea v-model="addForm.description" rows="3" class="kb-input" placeholder="설명"></textarea>

          <button class="w-full rounded-xl bg-[rgb(96,88,76)] py-3 text-sm font-bold text-white" @click="submitAdd">등록하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { useFinanceStore } from "./stores/finance";

const route = useRoute();
const { expenseCategories, incomeCategories, addTransaction, state } = useFinanceStore();

const menu = [
  { to: "/", label: "대시보드", icon: "▣" },
  { to: "/monthly-spending", label: "월별 지출", icon: "◫" },
  { to: "/fixed-expenses", label: "고정지출", icon: "◉" },
  { to: "/investment", label: "투자", icon: "◍" },
  { to: "/statistics", label: "통계", icon: "◔" },
  { to: "/budget", label: "예산", icon: "◎" },
  { to: "/profile", label: "프로필", icon: "◌" },
];

const showAddModal = ref(false);
const today = new Date().toISOString().slice(0, 10);

const addForm = reactive({
  type: "expense",
  amount: null,
  date: today,
  categoryId: 1,
  description: "",
  isFixed: false,
});

const activeCategories = computed(() =>
  addForm.type === "expense" ? expenseCategories.value : incomeCategories.value,
);

watch(
  () => addForm.type,
  () => {
    addForm.categoryId = activeCategories.value[0]?.id || 1;
    if (addForm.type !== "expense") {
      addForm.isFixed = false;
    }
  },
);

const openAddModal = () => {
  showAddModal.value = true;
  const firstCategory = activeCategories.value[0];
  addForm.categoryId = firstCategory?.id || 1;
};

const closeAddModal = () => {
  showAddModal.value = false;
};

const submitAdd = () => {
  if (!addForm.amount || !addForm.date || !addForm.description || !addForm.categoryId) {
    return;
  }

  addTransaction({
    userId: state.userId,
    type: addForm.type,
    amount: addForm.amount,
    date: addForm.date,
    categoryId: addForm.categoryId,
    description: addForm.description,
    isFixed: addForm.type === "expense" ? addForm.isFixed : false,
  });

  addForm.amount = null;
  addForm.description = "";
  addForm.date = today;
  addForm.type = "expense";
  addForm.categoryId = expenseCategories.value[0]?.id || 1;
  addForm.isFixed = false;
  closeAddModal();
};
</script>
