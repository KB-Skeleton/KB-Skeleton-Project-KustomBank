<template>
  <section class="d-grid gap-3">
    <article class="kb-panel">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div>
          <p class="kb-card-label mb-0">월별 지출</p>
          <h2 class="h2 fw-black kb-text-charcoal mb-0">{{ monthLabel }}</h2>
        </div>
        <div class="btn-group d-lg-none" role="group">
          <button class="btn btn-sm" :class="mobileMode === 'calendar' ? 'btn-dark' : 'btn-outline-secondary'" @click="mobileMode = 'calendar'">캘린더</button>
          <button class="btn btn-sm" :class="mobileMode === 'list' ? 'btn-dark' : 'btn-outline-secondary'" @click="mobileMode = 'list'">목록</button>
        </div>
      </div>
    </article>

    <div class="row g-3">
      <div class="col-12 col-lg-8" :class="mobileMode === 'list' ? 'd-none d-lg-block' : ''">
        <article class="kb-panel">
          <div class="kb-month-weekdays">
            <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
          </div>

          <div class="kb-month-grid">
            <button
              v-for="cell in calendarCells"
              :key="cell.key"
              class="kb-month-cell"
              :class="[
                cell.current ? 'is-current' : 'is-empty',
                selectedDate === cell.date && cell.current ? 'is-selected' : '',
                isToday(cell.date) && cell.current ? 'is-today' : ''
              ]"
              :disabled="!cell.current"
              @click="selectedDate = cell.date"
            >
              <div class="kb-month-cell-head">
                <span class="kb-month-day">{{ cell.day }}</span>
                <span v-if="cell.current && hasSpending(cell.date)" class="kb-month-dot"></span>
              </div>
              <div v-if="cell.current" class="kb-month-meta">
                <p v-if="hasAmount(cell.date, 'income')" class="income">
                  + {{ getDayAmount(cell.date, "income") }}
                </p>
                <p v-if="hasAmount(cell.date, 'expense')" class="expense">
                  - {{ getDayAmount(cell.date, "expense") }}
                </p>
              </div>
            </button>
          </div>
        </article>
      </div>

      <div class="col-12 col-lg-4" :class="mobileMode === 'calendar' ? 'd-none d-lg-block' : ''">
        <article class="kb-panel">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h3 class="h5 fw-black mb-0 kb-text-charcoal">{{ selectedDate }} 내역</h3>
            <span class="kb-pill">{{ selectedTransactions.length }}건</span>
          </div>
          <div class="d-grid gap-2">
            <button
              v-for="item in selectedTransactions"
              :key="item.id"
              class="w-100 rounded-3 border text-start p-3 bg-white"
              style="border-color: rgba(34,34,34,.15)"
              @click="openDetail(item)"
            >
              <div class="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <p class="mb-0 fw-bold kb-text-charcoal">{{ item.description }}</p>
                  <p class="mb-0 small text-secondary">{{ item.categoryName }} · {{ item.date }}</p>
                </div>
                <p class="mb-0 fw-black" :class="item.type === 'expense' ? 'text-danger' : 'text-primary'">{{ item.type === 'expense' ? '-' : '+' }}{{ formatCurrency(item.amount) }}</p>
              </div>
            </button>

            <div v-if="!selectedTransactions.length" class="rounded-3 p-3 small fw-semibold text-secondary" style="background: var(--kb-gray-100)">
              선택한 날짜의 내역이 없습니다.
            </div>
          </div>
        </article>
      </div>
    </div>

    <div v-if="showDetail && activeTransaction" class="kb-modal-overlay" @click.self="closeDetail">
      <div class="kb-modal-card" style="max-width: 860px">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h4 class="h4 fw-black mb-0 kb-text-charcoal">지출 내역 상세</h4>
          <button class="kb-btn-light" @click="closeDetail">닫기</button>
        </div>

        <template v-if="editMode">
          <div class="d-grid gap-2">
            <input v-model="editForm.description" class="kb-input" placeholder="설명" />
            <input v-model.number="editForm.amount" type="number" min="0" class="kb-input" placeholder="금액" />
            <input v-model="editForm.date" type="date" class="kb-input" />
            <select v-model.number="editForm.categoryId" class="kb-input">
              <option v-for="category in categoriesByType" :key="category.id" :value="category.id">{{ category.name }}</option>
            </select>
            <div class="d-flex gap-2">
              <button class="kb-btn-dark" @click="saveEdit">저장</button>
              <button class="kb-btn-light" @click="editMode = false">취소</button>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="d-grid gap-1 small">
            <p class="mb-0"><strong>설명:</strong> {{ activeTransaction.description }}</p>
            <p class="mb-0"><strong>유형:</strong> {{ activeTransaction.type === 'expense' ? '지출' : '수입' }}</p>
            <p class="mb-0"><strong>카테고리:</strong> {{ activeTransaction.categoryName }}</p>
            <p class="mb-0"><strong>금액:</strong> {{ formatCurrency(activeTransaction.amount) }}</p>
            <p class="mb-0"><strong>날짜:</strong> {{ activeTransaction.date }}</p>
            <p class="mb-0"><strong>추천 종목:</strong> {{ stockTip }}</p>
          </div>
          <div class="d-flex gap-2 mt-3">
            <button class="kb-btn-light" @click="beginEdit">편집</button>
            <button class="btn btn-danger btn-sm fw-bold" @click="removeActive">삭제</button>
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

const { state, formatCurrency, getDailyTotals, getTransactionsByDate, updateTransaction, deleteTransaction } = useFinanceStore();

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
  for (let i = 0; i < leadingBlank; i += 1) cells.push({ key: `blank-${i}`, day: "", date: "", current: false });
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
    if (typeof date === "string" && date.length === 10) selectedDate.value = date;
  },
  { immediate: true },
);

const shortCurrency = (amount) => (amount >= 10000 ? `${Math.round(amount / 10000)}만` : `${Math.round(amount)}`);

const getDayAmount = (date, type) => {
  const value = dailyTotals.value[date]?.[type] || 0;
  return shortCurrency(value);
};

const hasAmount = (date, type) => (dailyTotals.value[date]?.[type] || 0) > 0;

const hasSpending = (date) => {
  const day = dailyTotals.value[date];
  return Boolean((day?.income || 0) + (day?.expense || 0));
};

const isToday = (date) => date === today;

const showDetail = ref(false);
const activeTransaction = ref(null);
const editMode = ref(false);

const editForm = reactive({ description: "", amount: 0, date: today, categoryId: 1 });

const categoriesByType = computed(() => state.categories.filter((item) => item.type === (activeTransaction.value?.type || "expense")));

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
  activeTransaction.value = getTransactionsByDate(selectedDate.value).find((item) => item.id === activeTransaction.value.id);
  editMode.value = false;
};

const removeActive = () => {
  if (!activeTransaction.value) return;
  deleteTransaction(activeTransaction.value.id);
  closeDetail();
};
</script>
