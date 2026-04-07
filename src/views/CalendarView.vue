<template>
  <section class="grid gap-5 lg:grid-cols-[2fr_1fr]">
    <article class="kb-panel">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-bold text-kb-charcoal">{{ monthLabel }} 캘린더</h2>
        <p class="text-sm font-semibold text-slate-500">수입 파란색 / 지출 빨간색</p>
      </div>

      <div class="mb-2 grid grid-cols-7 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
      </div>
      <div class="grid grid-cols-7 gap-2">
        <button
          v-for="cell in calendarCells"
          :key="cell.key"
          class="min-h-24 rounded-xl border p-2 text-left transition"
          :class="[
            cell.current ? 'border-black/10 bg-white hover:border-kb-brown/40' : 'border-transparent bg-transparent',
            selectedDate === cell.date && cell.current ? 'ring-2 ring-kb-yellow' : ''
          ]"
          :disabled="!cell.current"
          @click="selectDate(cell.date)"
        >
          <p class="text-xs font-bold text-kb-charcoal">{{ cell.day }}</p>
          <div v-if="cell.current" class="mt-2 space-y-1 text-[11px]">
            <p class="font-semibold text-sky-700">+ {{ dailyTotals[cell.date]?.income ? shortCurrency(dailyTotals[cell.date].income) : '-' }}</p>
            <p class="font-semibold text-red-700">- {{ dailyTotals[cell.date]?.expense ? shortCurrency(dailyTotals[cell.date].expense) : '-' }}</p>
          </div>
        </button>
      </div>
    </article>

    <article class="kb-panel">
      <h3 class="text-lg font-bold text-kb-charcoal">{{ selectedDate }} 상세</h3>
      <p class="mt-1 text-sm text-slate-600">거래를 클릭해 수정하거나 바로 삭제할 수 있습니다.</p>

      <div class="mt-4 space-y-3">
        <div v-if="selectedTransactions.length === 0" class="rounded-xl bg-kb-gray-100 p-4 text-sm text-slate-500">해당 날짜 거래가 없습니다.</div>

        <div v-for="item in selectedTransactions" :key="item.id" class="rounded-xl border border-black/10 bg-white p-3">
          <template v-if="editId === item.id">
            <div class="space-y-2">
              <input v-model="editForm.title" class="kb-input" placeholder="내역" />
              <input v-model="editForm.category" class="kb-input" placeholder="카테고리" />
              <input v-model.number="editForm.amount" type="number" min="0" class="kb-input" placeholder="금액" />
              <textarea v-model="editForm.note" rows="2" class="kb-input" placeholder="메모"></textarea>
              <div class="flex gap-2">
                <button class="kb-btn-dark" @click="saveEdit(item.id)">저장</button>
                <button class="kb-btn-light" @click="cancelEdit">취소</button>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="font-bold text-kb-charcoal">{{ item.title }}</p>
                <p class="text-xs text-slate-500">{{ item.category }} · {{ item.note }}</p>
                <p class="mt-1 text-sm font-bold" :class="item.type === 'expense' ? 'text-red-700' : 'text-sky-700'">
                  {{ item.type === 'expense' ? '-' : '+' }}{{ formatCurrency(item.amount) }}
                </p>
              </div>
              <div class="flex gap-2">
                <button class="kb-btn-light" @click="startEdit(item)">수정</button>
                <button class="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white" @click="remove(item.id)">삭제</button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useFinanceStore } from "../stores/finance";

const {
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

const selectedDate = ref(today);
const editId = ref(null);
const editForm = reactive({
  title: "",
  category: "",
  amount: 0,
  note: "",
});

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

const dailyTotals = computed(() => getDailyTotals(monthKey));

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

const shortCurrency = (amount) => {
  if (amount >= 10000) {
    return `${Math.round(amount / 10000)}만`;
  }
  return `${Math.round(amount)}`;
};

const selectDate = (date) => {
  selectedDate.value = date;
  cancelEdit();
};

const startEdit = (transaction) => {
  editId.value = transaction.id;
  editForm.title = transaction.title;
  editForm.category = transaction.category;
  editForm.amount = transaction.amount;
  editForm.note = transaction.note;
};

const cancelEdit = () => {
  editId.value = null;
  editForm.title = "";
  editForm.category = "";
  editForm.amount = 0;
  editForm.note = "";
};

const saveEdit = (id) => {
  if (!editForm.title || !editForm.category || editForm.amount <= 0) {
    return;
  }

  updateTransaction(id, {
    title: editForm.title,
    category: editForm.category,
    amount: Number(editForm.amount),
    note: editForm.note,
  });

  cancelEdit();
};

const remove = (id) => {
  deleteTransaction(id);
  if (editId.value === id) {
    cancelEdit();
  }
};
</script>

