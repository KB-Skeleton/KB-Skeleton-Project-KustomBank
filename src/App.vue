<template>
  <div class="kb-bg">
    <header class="kb-header py-3">
      <div
        class="container-xxl d-flex align-items-center justify-content-between"
      >
        <div class="d-flex align-items-center gap-3">
          <div class="kb-logo-mark">KB</div>
          <div>
            <p
              class="mb-0 small fw-semibold text-uppercase"
              style="letter-spacing: 0.18em; color: var(--kb-brown)"
            >
              KB Smart Budget
            </p>
            <h1 class="mb-0 h3 fw-black kb-text-charcoal">KB 머니플로우</h1>
          </div>
        </div>
        <RouterLink
          to="/profile"
          class="rounded-pill px-3 py-2 text-decoration-none fw-bold"
          style="background: var(--kb-charcoal); color: var(--kb-yellow)"
        >
          홍길동 님
        </RouterLink>
      </div>
    </header>

    <div class="container-xxl py-3">
      <div class="row g-3">
        <aside class="col-12 col-lg-3 col-xl-2">
          <nav class="kb-nav-wrap p-2 d-flex d-lg-block gap-2 overflow-auto">
            <RouterLink
              v-for="item in menu"
              :key="item.to"
              :to="item.to"
              class="kb-nav-item text-nowrap"
              :class="{ 'kb-nav-item-active': route.path === item.to }"
            >
              <span>{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </RouterLink>
          </nav>
        </aside>

        <main class="col-12 col-lg-9 col-xl-10 pb-5">
          <RouterView />
        </main>
      </div>
    </div>

    <button class="kb-fab" @click="openAddModal">+ 지출/수입 추가</button>

    <div
      v-if="showAddModal"
      class="kb-modal-overlay"
      @click.self="closeAddModal"
    >
      <div class="kb-modal-card">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h2 class="h3 mb-0 fw-black kb-text-charcoal">지출/수입 등록</h2>
          <button class="kb-btn-light" @click="closeAddModal">닫기</button>
        </div>

        <div class="d-grid gap-3">
          <div class="row g-2">
            <div class="col-6">
              <button
                class="w-100 rounded-3 py-2 fw-bold border-0"
                :class="
                  addForm.type === 'expense'
                    ? 'text-white bg-danger'
                    : 'bg-light text-secondary'
                "
                @click="addForm.type = 'expense'"
              >
                지출
              </button>
            </div>
            <div class="col-6">
              <button
                class="w-100 rounded-3 py-2 fw-bold border-0"
                :class="
                  addForm.type === 'income'
                    ? 'text-white bg-primary'
                    : 'bg-light text-secondary'
                "
                @click="addForm.type = 'income'"
              >
                수입
              </button>
            </div>
          </div>

          <input
            v-model.number="addForm.amount"
            type="number"
            min="0"
            class="kb-input"
            placeholder="금액"
          />
          <input v-model="addForm.date" type="date" class="kb-input" />

          <select v-model.number="addForm.categoryId" class="kb-input">
            <option
              v-for="item in activeCategories"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </option>
          </select>

          <button
            v-if="addForm.type === 'expense'"
            class="w-100"
            :class="addForm.isFixed ? 'kb-btn-brown' : 'kb-btn-brown-soft'"
            @click="addForm.isFixed = !addForm.isFixed"
          >
            {{ addForm.isFixed ? "고정지출로 등록됨" : "고정지출로 등록" }}
          </button>

          <textarea
            v-model="addForm.description"
            rows="3"
            class="kb-input"
            placeholder="설명"
          ></textarea>

          <button class="kb-btn-brown w-100" @click="submitAdd">
            등록하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { useFinanceStore } from "./stores/finance";
import { useAuthStores } from "./stores/auth";

const route = useRoute();

const { expenseCategories, incomeCategories, postTransaction } =
  useFinanceStore();

// const authStore = useAuthStores();

const { state } = useAuthStores();

const menu = [
  { to: "/", label: "대시보드", icon: "▣" },
  { to: "/monthly-spending", label: "월별 지출", icon: "◫" },
  { to: "/fixed-expenses", label: "고정지출", icon: "◉" },
  { to: "/investment", label: "투자", icon: "◍" },
  { to: "/statistics", label: "통계", icon: "◔" },
  { to: "/budget", label: "예산", icon: "◎" },
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
  addForm.type === "expense" ? expenseCategories : incomeCategories,
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
  addForm.categoryId = activeCategories.value[0]?.id || 1;
};

const closeAddModal = () => {
  showAddModal.value = false;
};

const submitAdd = () => {
  if (
    !addForm.amount ||
    !addForm.date ||
    !addForm.description ||
    !addForm.categoryId
  ) {
    return;
  }

  postTransaction({
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
