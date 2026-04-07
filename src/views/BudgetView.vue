<template>
  <section class="space-y-6">
    <article class="kb-panel">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="kb-card-label">전체 예산 (카테고리 합산)</p>
          <h2 class="text-4xl font-black text-kb-charcoal">{{ formatCurrency(monthlyBudgetTarget) }}</h2>
          <p class="mt-1 text-sm text-slate-500">카테고리별 예산을 더한 값이 자동으로 전체 예산이 됩니다.</p>
        </div>
        <div class="flex gap-2">
          <button class="kb-btn-light" @click="showBulkEdit = true">카테고리별 예산 설정</button>
          <button class="kb-btn-dark" @click="showTotalGuide = !showTotalGuide">수정</button>
        </div>
      </div>
      <p v-if="showTotalGuide" class="mt-3 rounded-xl bg-kb-gray-100 px-3 py-2 text-sm text-slate-700">전체 예산은 아래 카테고리별 예산을 변경하면 자동 반영됩니다.</p>

      <div class="mt-4 flex items-center justify-between text-sm font-semibold">
        <p class="text-slate-600">사용 금액</p>
        <p :class="totalUsage > 100 ? 'text-red-700' : 'text-kb-charcoal'">{{ formatCurrency(summary.expense) }} ({{ totalUsage }}%)</p>
      </div>
      <div class="mt-2 h-5 overflow-hidden rounded-full bg-kb-gray-200">
        <div class="h-full" :style="{ width: `${Math.min(totalUsage, 100)}%`, backgroundColor: totalUsage > 100 ? '#dc2626' : '#222222' }"></div>
      </div>
    </article>

    <article class="kb-panel">
      <h3 class="mb-4 text-2xl font-black text-kb-charcoal">카테고리 내역</h3>
      <div class="space-y-3">
        <div v-for="row in budgetRows" :key="row.categoryId" class="rounded-xl border border-black/10 bg-white p-4">
          <div class="mb-2 flex items-center justify-between gap-2">
            <p class="text-lg font-bold text-kb-charcoal">{{ row.category }}</p>
            <div class="flex items-center gap-2">
              <p class="text-sm font-semibold text-slate-600">{{ formatCurrency(row.spent) }} / {{ formatCurrency(row.budget) }}</p>
              <button class="kb-btn-light" @click="beginInlineEdit(row)">수정</button>
            </div>
          </div>

          <div class="mb-2 h-3 overflow-hidden rounded-full bg-kb-gray-200">
            <div class="h-full" :style="{ width: `${Math.min(row.usage, 100)}%`, backgroundColor: row.usage > 100 ? '#dc2626' : '#7A5C3F' }"></div>
          </div>
          <p class="text-xs font-semibold" :class="row.usage > 100 ? 'text-red-700' : 'text-slate-600'">사용 {{ row.usage }}% · 남은 금액 {{ formatCurrency(row.remain) }}</p>

          <div v-if="editingCategoryId === row.categoryId" class="mt-3 flex items-center gap-2">
            <input v-model.number="inlineAmount" type="number" min="0" class="kb-input" />
            <button class="kb-btn-dark" @click="saveInline(row.categoryId)">저장</button>
            <button class="kb-btn-light" @click="cancelInline">취소</button>
          </div>
        </div>
      </div>
    </article>

    <div v-if="showBulkEdit" class="fixed inset-0 z-40 flex items-end justify-center bg-black/35 p-3 sm:items-center" @click.self="showBulkEdit = false">
      <div class="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
        <div class="mb-3 flex items-center justify-between">
          <h4 class="text-2xl font-black text-kb-charcoal">카테고리별 예산 설정</h4>
          <button class="kb-btn-light" @click="showBulkEdit = false">닫기</button>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div v-for="row in budgetRows" :key="row.categoryId" class="rounded-xl bg-kb-gray-100 p-3">
            <p class="mb-2 text-sm font-bold text-kb-charcoal">{{ row.category }}</p>
            <input v-model.number="bulkForm[row.categoryId]" type="number" min="0" class="kb-input" />
          </div>
        </div>

        <div class="mt-4 flex justify-end gap-2">
          <button class="kb-btn-light" @click="showBulkEdit = false">취소</button>
          <button class="kb-btn-dark" @click="saveBulk">일괄 저장</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useFinanceStore } from "../stores/finance";

const {
  formatCurrency,
  monthlyBudgetTarget,
  getMonthlySummary,
  getBudgetRows,
  updateCategoryBudget,
  updateCategoryBudgetsBulk,
} = useFinanceStore();

const monthKey = new Date().toISOString().slice(0, 7);
const summary = computed(() => getMonthlySummary(monthKey));
const budgetRows = computed(() => getBudgetRows(monthKey));
const totalUsage = computed(() => Math.round((summary.value.expense / monthlyBudgetTarget.value) * 100 || 0));

const showTotalGuide = ref(false);
const showBulkEdit = ref(false);
const bulkForm = reactive({});

watch(
  budgetRows,
  (rows) => {
    rows.forEach((row) => {
      bulkForm[row.categoryId] = row.budget;
    });
  },
  { immediate: true },
);

const editingCategoryId = ref(null);
const inlineAmount = ref(0);

const beginInlineEdit = (row) => {
  editingCategoryId.value = row.categoryId;
  inlineAmount.value = row.budget;
};

const cancelInline = () => {
  editingCategoryId.value = null;
};

const saveInline = (categoryId) => {
  updateCategoryBudget(categoryId, inlineAmount.value);
  cancelInline();
};

const saveBulk = () => {
  updateCategoryBudgetsBulk(bulkForm);
  showBulkEdit.value = false;
};
</script>
