<template>
  <section class="d-grid gap-3">
    <article class="kb-panel">
      <div class="d-flex flex-wrap align-items-start justify-content-between gap-2">
        <div>
          <p class="kb-card-label mb-0">전체 예산 (카테고리 합산)</p>
          <h2 class="display-6 fw-black kb-text-charcoal mb-0">{{ formatCurrency(monthlyBudgetTarget) }}</h2>
          <p class="small text-secondary mb-0">카테고리별 예산 합계가 전체 예산입니다.</p>
        </div>
        <button class="kb-btn-dark" @click="showBulkEdit = true">카테고리별 예산 설정</button>
      </div>

      <div class="d-flex justify-content-between mt-3 small fw-semibold">
        <span class="text-secondary">사용 금액</span>
        <span :class="totalUsage > 100 ? 'text-danger' : 'kb-text-charcoal'">{{ formatCurrency(summary.expense) }} ({{ totalUsage }}%)</span>
      </div>
      <div class="progress mt-2" style="height: 1.1rem; background: var(--kb-gray-200)">
        <div class="progress-bar" :style="{ width: `${Math.min(totalUsage, 100)}%`, backgroundColor: totalUsage > 100 ? '#dc2626' : '#222222' }"></div>
      </div>
    </article>

    <article class="kb-panel">
      <h3 class="h3 fw-black kb-text-charcoal mb-3">카테고리 내역</h3>
      <div class="d-grid gap-2">
        <div v-for="row in budgetRows" :key="row.categoryId" class="rounded-3 border p-3 bg-white" style="border-color: rgba(34,34,34,.15)">
          <div class="d-flex justify-content-between align-items-center gap-2 mb-2">
            <p class="mb-0 h6 fw-bold kb-text-charcoal">{{ row.category }}</p>
            <div class="d-flex align-items-center gap-2">
              <p class="mb-0 small fw-semibold text-secondary">{{ formatCurrency(row.spent) }} / {{ formatCurrency(row.budget) }}</p>
              <button class="kb-btn-dark" @click="beginInlineEdit(row)">수정</button>
            </div>
          </div>

          <div class="progress mb-2" style="height: .75rem; background: var(--kb-gray-200)">
            <div class="progress-bar" :style="{ width: `${Math.min(row.usage, 100)}%`, backgroundColor: row.usage > 100 ? '#dc2626' : '#7A5C3F' }"></div>
          </div>

          <p class="mb-0 small fw-semibold" :class="row.usage > 100 ? 'text-danger' : 'text-secondary'">사용 {{ row.usage }}% · 남은 금액 {{ formatCurrency(row.remain) }}</p>

          <div v-if="editingCategoryId === row.categoryId" class="d-flex gap-2 mt-2">
            <input v-model.number="inlineAmount" type="number" min="0" class="kb-input" />
            <button class="kb-btn-dark" @click="saveInline(row.categoryId)">저장</button>
            <button class="kb-btn-light" @click="cancelInline">취소</button>
          </div>
        </div>
      </div>
    </article>

    <div v-if="showBulkEdit" class="kb-modal-overlay" @click.self="showBulkEdit = false">
      <div class="kb-modal-card">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h4 class="h4 fw-black kb-text-charcoal mb-0">카테고리별 예산 설정</h4>
          <button class="kb-btn-light" @click="showBulkEdit = false">닫기</button>
        </div>

        <div class="row g-2">
          <div v-for="row in budgetRows" :key="row.categoryId" class="col-12 col-md-6">
            <div class="rounded-3 p-3" style="background: var(--kb-gray-100)">
              <p class="mb-2 small fw-bold kb-text-charcoal">{{ row.category }}</p>
              <input v-model.number="bulkForm[row.categoryId]" type="number" min="0" class="kb-input" />
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-3">
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

const { formatCurrency, monthlyBudgetTarget, getMonthlySummary, getBudgetRows, updateCategoryBudget, updateCategoryBudgetsBulk } = useFinanceStore();

const monthKey = new Date().toISOString().slice(0, 7);
const summary = computed(() => getMonthlySummary(monthKey));
const budgetRows = computed(() => getBudgetRows(monthKey));
const totalUsage = computed(() => Math.round((summary.value.expense / monthlyBudgetTarget.value) * 100 || 0));

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
