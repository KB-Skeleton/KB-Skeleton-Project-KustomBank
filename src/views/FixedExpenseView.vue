<template>
  <section class="d-grid gap-3">
    <article class="kb-panel">
      <p class="kb-card-label mb-1">고정지출 관리</p>
      <h2 class="h2 fw-black kb-text-charcoal mb-2">{{ monthLabel }} 고정지출</h2>
      <div class="d-flex flex-wrap gap-2 small fw-semibold mb-2">
        <span class="kb-pill">전체 {{ formatCurrency(summary.totalFixed) }}</span>
        <span class="kb-pill text-danger">현재까지 {{ formatCurrency(summary.spentFixed) }}</span>
        <span class="kb-pill" :class="summary.availableFixed < 0 ? 'text-danger' : 'text-primary'">잔여 {{ formatCurrency(summary.availableFixed) }}</span>
      </div>
      <div class="progress" style="height: 1rem; background: var(--kb-gray-200)">
        <div class="progress-bar" :style="{ width: `${Math.min(summary.usage, 100)}%`, backgroundColor: summary.usage > 100 ? '#dc2626' : '#222222' }"></div>
      </div>
    </article>

    <article class="kb-panel">
      <h3 class="h3 fw-black kb-text-charcoal mb-3">세부 내역</h3>
      <div class="d-grid gap-2">
        <div v-for="item in fixedItems" :key="item.id" class="rounded-3 border p-3 bg-white" style="border-color: rgba(34,34,34,.15)">
          <template v-if="editId === item.id">
            <div class="row g-2">
              <div class="col-12 col-md-6"><input v-model="editForm.description" class="kb-input" placeholder="설명" /></div>
              <div class="col-12 col-md-6"><input v-model.number="editForm.amount" type="number" min="0" class="kb-input" placeholder="금액" /></div>
              <div class="col-12 col-md-6"><input v-model="editForm.date" type="date" class="kb-input" /></div>
              <div class="col-12 col-md-6">
                <select v-model.number="editForm.categoryId" class="kb-input">
                  <option v-for="category in expenseCategories" :key="category.id" :value="category.id">{{ category.name }}</option>
                </select>
              </div>
            </div>
            <div class="d-flex gap-2 mt-2">
              <button class="kb-btn-dark" @click="save(item.id)">저장</button>
              <button class="kb-btn-light" @click="cancel">취소</button>
            </div>
          </template>
          <template v-else>
            <div class="d-flex justify-content-between align-items-start gap-2">
              <div>
                <p class="mb-0 fw-bold kb-text-charcoal">{{ item.description }}</p>
                <p class="mb-0 small text-secondary">{{ item.categoryName }} · {{ item.date }}</p>
              </div>
              <p class="mb-0 fw-black text-danger">{{ formatCurrency(item.amount) }}</p>
            </div>
            <div class="d-flex gap-2 mt-2">
              <button class="kb-btn-light" @click="begin(item)">수정</button>
              <button class="btn btn-danger btn-sm fw-bold" @click="remove(item.id)">삭제</button>
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

const { formatCurrency, expenseCategories, getFixedExpenseSummary, getFixedTransactionsByMonth, updateTransaction, deleteTransaction } = useFinanceStore();

const monthKey = new Date().toISOString().slice(0, 7);
const monthLabel = monthKey.replace("-", "년 ") + "월";

const summary = computed(() => getFixedExpenseSummary(monthKey));
const fixedItems = computed(() => getFixedTransactionsByMonth(monthKey));

const editId = ref(null);
const editForm = reactive({ description: "", amount: 0, date: "", categoryId: 1 });

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
