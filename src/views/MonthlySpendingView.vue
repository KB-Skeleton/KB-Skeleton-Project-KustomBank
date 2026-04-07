<template>
  <section class="space-y-5">
    <article class="kb-panel">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="kb-card-label">월별 지출</p>
          <h2 class="text-3xl font-black text-kb-charcoal">{{ monthLabel }}</h2>
        </div>
        <div class="inline-flex rounded-xl bg-kb-gray-100 p-1 lg:hidden">
          <button class="rounded-lg px-3 py-2 text-sm font-bold" :class="mobileMode === 'calendar' ? 'bg-white text-kb-charcoal shadow' : 'text-slate-600'" @click="mobileMode = 'calendar'">캘린더</button>
          <button class="rounded-lg px-3 py-2 text-sm font-bold" :class="mobileMode === 'list' ? 'bg-white text-kb-charcoal shadow' : 'text-slate-600'" @click="mobileMode = 'list'">목록</button>
        </div>
      </div>
    </article>

    <div class="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <article class="kb-panel" :class="mobileMode === 'list' ? 'hidden lg:block' : ''">
        <div class="mb-3 grid grid-cols-7 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
        </div>

        <div class="grid grid-cols-7 gap-2">
          <button
            v-for="cell in calendarCells"
            :key="cell.key"
            class="min-h-28 rounded-xl border p-2 text-left transition"
            :class="[
              cell.current ? 'border-black/10 bg-white hover:border-kb-brown/40' : 'border-transparent bg-transparent',
              selectedDate === cell.date && cell.current ? 'ring-2 ring-kb-yellow' : ''
            ]"
            :disabled="!cell.current"
            @click="selectedDate = cell.date"
          >
            <p class="text-sm font-black text-kb-charcoal">{{ cell.day }}</p>
            <div v-if="cell.current" class="mt-2 space-y-1 text-xs">
              <p class="font-semibold text-sky-700">수입 {{ dailyTotals[cell.date]?.income ? shortCurrency(dailyTotals[cell.date].income) : '-' }}</p>
              <p class="font-semibold text-red-700">지출 {{ dailyTotals[cell.date]?.expense ? shortCurrency(dailyTotals[cell.date].expense) : '-' }}</p>
            </div>
          </button>
        </div>
      </article>

      <article class="kb-panel" :class="mobileMode === 'calendar' ? 'hidden lg:block' : ''">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-xl font-black text-kb-charcoal">{{ selectedDate }} 지출/수입 내역</h3>
          <span class="rounded-full bg-kb-yellow px-3 py-1 text-xs font-bold text-kb-charcoal">{{ selectedTransactions.length }}건</span>
        </div>

        <div class="space-y-3">
          <button
            v-for="item in selectedTransactions"
            :key="item.id"
            class="w-full rounded-xl border border-black/10 bg-white p-4 text-left hover:border-kb-brown/50"
            @click="openDetail(item)"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-lg font-bold text-kb-charcoal">{{ item.description }}</p>
                <p class="text-sm text-slate-500">{{ item.categoryName }} · {{ item.date }}</p>
              </div>
              <p class="text-base font-black" :class="item.type === 'expense' ? 'text-red-700' : 'text-sky-700'">
                {{ item.type === 'expense' ? '-' : '+' }}{{ formatCurrency(item.amount) }}
              </p>
            </div>
          </button>

          <div v-if="!selectedTransactions.length" class="rounded-xl bg-kb-gray-100 p-4 text-sm font-semibold text-slate-500">
            선택한 날짜의 내역이 없습니다.
          </div>
        </div>
      </article>
    </div>

    <div v-if="showDetail && activeTransaction" class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-3 sm:items-center" @click.self="closeDetail">
      <div class="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h4 class="text-2xl font-black text-kb-charcoal">지출 내역 상세</h4>
          <button class="kb-btn-light" @click="closeDetail">닫기</button>
        </div>

        <template v-if="editMode">
          <div class="space-y-3">
            <input v-model="editForm.description" class="kb-input" placeholder="설명" />
            <input v-model.number="editForm.amount" type="number" min="0" class="kb-input" placeholder="금액" />
            <input v-model="editForm.date" type="date" class="kb-input" />
            <select v-model.number="editForm.categoryId" class="kb-input">
              <option v-for="category in categoriesByType" :key="category.id" :value="category.id">{{ category.name }}</option>
            </select>
            <div class="flex gap-2">
              <button class="kb-btn-dark" @click="saveEdit">저장</button>
              <button class="kb-btn-light" @click="editMode = false">취소</button>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="space-y-2 text-sm">
            <p><strong>설명:</strong> {{ activeTransaction.description }}</p>
            <p><strong>유형:</strong> {{ activeTransaction.type === 'expense' ? '지출' : '수입' }}</p>
            <p><strong>카테고리:</strong> {{ activeTransaction.categoryName }}</p>
            <p><strong>금액:</strong> {{ formatCurrency(activeTransaction.amount) }}</p>
            <p><strong>날짜:</strong> {{ activeTransaction.date }}</p>
            <p><strong>추천 종목:</strong> {{ stockTip }}</p>
          </div>
          <div class="mt-4 flex gap-2">
            <button class="kb-btn-light" @click="beginEdit">편집</button>
            <button class="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white" @click="removeActive">삭제</button>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useFinanceStore } from "../stores/finance";

const {
  state,
  formatCurrency,
  getDailyTotals,
  getTransactionsByDate,
  updateTransaction,
  deleteTransaction,
} = useFinanceStore();

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
const monthLabel = `${year}년 ${month + 1}월`;

const firstDay = new Date(year, month, 1);
const lastDate = new Date(year, month + 1, 0).getDate();
const leadingBlank = firstDay.getDay();
const today = `${year}-${String(month + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
const dailyTotals = computed(() => getDailyTotals(monthKey));
const selectedDate = ref(today);
const mobileMode = ref("calendar");
const route = useRoute();

const calendarCells = computed(() => {
  const cells = [];
  for (let i = 0; i < leadingBlank; i += 1) {
    cells.push({ key: `blank-${i}`, day: "", date: "", current: false });
  }
  for (let day = 1; day <= lastDate; day += 1) {
    const date = `${monthKey}-${String(day).padStart(2, "0")}`;
    cells.push({ key: date, day, date, current: true });
  }
  return cells;
});

const selectedTransactions = computed(() => getTransactionsByDate(selectedDate.value));

watch(
  () => route.query.date,
  (date) => {
    if (typeof date === "string" && date.length === 10) {
      selectedDate.value = date;
    }
  },
  { immediate: true },
);

const shortCurrency = (amount) => {
  if (amount >= 10000) {
    return `${Math.round(amount / 10000)}만`;
  }
  return `${Math.round(amount)}`;
};

const showDetail = ref(false);
const activeTransaction = ref(null);
const editMode = ref(false);

const editForm = reactive({
  description: "",
  amount: 0,
  date: today,
  categoryId: 1,
});

const categoriesByType = computed(() =>
  state.categories.filter((item) => item.type === (activeTransaction.value?.type || "expense")),
);

const stockTip = computed(() => {
  const expense = activeTransaction.value?.amount || 0;
  if (expense > 100000) return "KODEX 200 - 변동성 완화용 적립식 추천";
  if (expense > 30000) return "삼성전자 - 분할매수 관점에서 체크";
  return "KBSTAR 단기채권 - 남는 소액 굴리기";
});

const openDetail = (item) => {
  activeTransaction.value = item;
  showDetail.value = true;
  editMode.value = false;
};

const closeDetail = () => {
  showDetail.value = false;
  activeTransaction.value = null;
  editMode.value = false;
};

const beginEdit = () => {
  if (!activeTransaction.value) return;
  editForm.description = activeTransaction.value.description;
  editForm.amount = activeTransaction.value.amount;
  editForm.date = activeTransaction.value.date;
  editForm.categoryId = activeTransaction.value.categoryId;
  editMode.value = true;
};

const saveEdit = () => {
  if (!activeTransaction.value) return;
  updateTransaction(activeTransaction.value.id, {
    description: editForm.description,
    amount: Number(editForm.amount),
    date: editForm.date,
    categoryId: Number(editForm.categoryId),
  });
  activeTransaction.value = getTransactionsByDate(selectedDate.value).find(
    (item) => item.id === activeTransaction.value.id,
  );
  editMode.value = false;
};

const removeActive = () => {
  if (!activeTransaction.value) return;
  deleteTransaction(activeTransaction.value.id);
  closeDetail();
};
</script>
