<template>
  <section class="d-grid gap-3">
    <BudgetSummary
      :format-currency="props.formatCurrency"
      :monthly-budget-target="props.monthlyBudgetTarget"
      :total-spent="totalSpent"
      :total-usage="totalUsage"
      @open-bulk-edit="showBulkEditModal = true"
    />

    <!-- showBulkEditModal이 true일 경우 BudgetBulkEditor 렌더링 -->
    <BudgetBulkEditor v-model="showBulkEditModal" @saved="handleBudgetSaved" />

    <!-- 카테고리 내역 카드 -->
    <CategoryBudgetItems
      :reload-token="props.monthlyBudgetTarget"
      @saved="handleBudgetSaved"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useBudgetStores } from '@/stores/budget';
import { useFinanceStore } from '@/stores/finance';
import BudgetSummary from './BudgetSummary.vue';
import BudgetBulkEditor from './BudgetBulkEditor.vue';
import CategoryBudgetItems from './CategoryBudgetItems.vue';

const props = defineProps({
  formatCurrency: {
    type: Function,
    required: true,
  },
  monthlyBudgetTarget: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['budget-updated']);

const showBulkEditModal = ref(false);
const totalSpent = ref(0);

const finance = useBudgetStores();
const transactionStore = useFinanceStore();
const { buildCategoryBudgetRows } = finance;

// 전체 예산 대비 사용률(%) 계산
const totalUsage = computed(() => {
  const budget = Number(props.monthlyBudgetTarget || 0);
  if (!budget) {
    return 0;
  }
  return Math.round((Number(totalSpent.value || 0) / budget) * 100);
});

// 카테고리 내역 행 데이터를 합산해 총 지출 금액 계산
const loadSummaryUsage = async () => {
  const currentUserId = transactionStore?.authStore?.userId || 'user123';
  const result = await buildCategoryBudgetRows(currentUserId);
  const rows = Array.isArray(result?.rows) ? result.rows : [];
  totalSpent.value = rows.reduce((sum, row) => sum + Number(row.spent || 0), 0);
};

// 자식 컴포넌트 저장 완료 이벤트를 상위(BudgetView)로 전달
const handleBudgetSaved = () => {
  loadSummaryUsage();
  emit('budget-updated');
};

onMounted(async () => {
  await loadSummaryUsage();
});

watch(
  () => props.monthlyBudgetTarget,
  async () => {
    await loadSummaryUsage();
  },
);
</script>

