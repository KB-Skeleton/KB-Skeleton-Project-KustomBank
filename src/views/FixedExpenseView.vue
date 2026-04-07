<template>
  <section class="space-y-5">
    <article class="kb-panel">
      <p class="kb-card-label">고정지출 관리</p>
      <h2 class="text-3xl font-black text-kb-charcoal">{{ monthLabel }} 고정지출</h2>
      <div class="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold">
        <span class="rounded-full bg-kb-gray-100 px-3 py-1 text-slate-700">전체 고정지출 {{ formatCurrency(summary.totalFixed) }}</span>
        <span class="rounded-full bg-kb-gray-100 px-3 py-1 text-red-700">현재까지 지출 {{ formatCurrency(summary.spentFixed) }}</span>
        <span class="rounded-full bg-kb-gray-100 px-3 py-1" :class="summary.availableFixed < 0 ? 'text-red-700' : 'text-sky-700'">잔여 {{ formatCurrency(summary.availableFixed) }}</span>
      </div>
      <div class="mt-3 h-4 overflow-hidden rounded-full bg-kb-gray-200">
        <div class="h-full" :style="{ width: `${Math.min(summary.usage, 100)}%`, backgroundColor: summary.usage > 100 ? '#dc2626' : '#222222' }"></div>
      </div>
    </article>

    <article class="kb-panel">
      <h3 class="mb-3 text-2xl font-black text-kb-charcoal">세부 내역</h3>
      <div class="space-y-3">
        <div v-for="item in fixedItems" :key="item.id" class="rounded-xl border border-black/10 bg-white p-4">
          <template v-if="editId === item.id">
            <div class="grid gap-2 sm:grid-cols-2">
              <input v-model="editForm.description" class="kb-input" placeholder="설명" />
              <input v-model.number="editForm.amount" type="number" min="0" class="kb-input" placeholder="금액" />
              <input v-model="editForm.date" type="date" class="kb-input" />
              <select v-model.number="editForm.categoryId" class="kb-input">
                <option v-for="category in expenseCategories" :key="category.id" :value="category.id">{{ category.name }}</option>
              </select>
            </div>
            <div class="mt-2 flex gap-2">
              <button class="kb-btn-dark" @click="save(item.id)">저장</button>
              <button class="kb-btn-light" @click="cancel">취소</button>
            </div>
          </template>

          <template v-else>
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-lg font-bold text-kb-charcoal">{{ item.description }}</p>
                <p class="text-sm text-slate-500">{{ item.categoryName }} · {{ item.date }}</p>
              </div>
              <p class="text-lg font-black text-red-700">{{ formatCurrency(item.amount) }}</p>
            </div>
            <div class="mt-2 flex gap-2">
              <button class="kb-btn-light" @click="begin(item)">수정</button>
              <button class="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white" @click="remove(item.id)">삭제</button>
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
  expenseCategories,
  getFixedExpenseSummary,
  getFixedTransactionsByMonth,
  updateTransaction,
  deleteTransaction,
} = useFinanceStore();

const monthKey = new Date().toISOString().slice(0, 7);
const monthLabel = monthKey.replace("-", "년 ") + "월";

const summary = computed(() => getFixedExpenseSummary(monthKey));
const fixedItems = computed(() => getFixedTransactionsByMonth(monthKey));

const editId = ref(null);
const editForm = reactive({
  description: "",
  amount: 0,
  date: "",
  categoryId: 1,
});

const begin = (item) => {
  editId.value = item.id;
  editForm.description = item.description;
  editForm.amount = item.amount;
  editForm.date = item.date;
  editForm.categoryId = item.categoryId;
};

const cancel = () => {
  editId.value = null;
};

const save = (id) => {
  updateTransaction(id, {
    description: editForm.description,
    amount: Number(editForm.amount),
    date: editForm.date,
    categoryId: Number(editForm.categoryId),
  });
  cancel();
};

const remove = (id) => {
  deleteTransaction(id);
  if (editId.value === id) cancel();
};
</script>
