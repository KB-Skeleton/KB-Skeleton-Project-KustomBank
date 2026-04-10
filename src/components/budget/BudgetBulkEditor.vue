<template>
  <!-- 부모에서 전달받은 modelValue가 true일 때만 모달 렌더링 -->
  <div v-if="modelValue" class="kb-modal-overlay" @click.self="closeModal">
    <div class="kb-modal-card">
      <div class="d-flex align-items-center justify-content-between mb-3 kb-modal-head">
        <h4 class="h4 fw-black kb-text-charcoal mb-0">카테고리별 예산 설정</h4>
      </div>

      <div class="row g-2">
        <!-- 카테고리별 조회 -->
        <div
          v-for="row in budgetFormRows"
          :key="row.categoryId"
          class="col-12 col-md-6"
        >
          <!-- 카테고리별 카드 렌더링 -->
          <div class="rounded-3 p-3" style="background: var(--kb-gray-100)">
            <p class="mb-2 small fw-bold kb-text-charcoal">
              {{ row.category }}
            </p>
            <!-- input값과 bulkForm 양방향 바인딩 -->
            <input
              v-model.number="bulkForm[row.categoryId]"
              type="number"
              min="0"
              class="kb-input"
            />
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-3 kb-modal-actions">
        <button type="button" class="kb-btn-light" @click="closeModal">
          취소
        </button>
        <button type="button" class="kb-btn-dark" @click="saveBulkBudgets">
          일괄 저장
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { useBudgetStores } from '@/stores/budget';
import { useFinanceStore } from '@/stores/finance';

// v-model 바인딩용 prop (부모의 showBulkEditModal과 연결)
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

// 부모에게 보낼 event
const emit = defineEmits(['update:modelValue', 'saved']);

const finance = useBudgetStores();
const transactionStore = useFinanceStore();
const {
  getBudget,
  updateBudgetByUserId,
} = finance;

// 모달에 렌더링할 카테고리 카드 목록
const budgetFormRows = ref([]);

// 카테고리별 입력값 폼 객체
const bulkForm = reactive({});

// closeModal 이벤트 감지되면 부모(CategoryBudgetList)에게 update:modelValue에 false를 담아 전송
// 부모 컴포넌트 showBulkEditModal이 false가 되어 창 닫힘
const closeModal = () => {
  emit('update:modelValue', false);
};

// 입력한 카테고리별 금액을 userId 기준 budgets 1건에 PUT 반영
const saveBulkBudgets = async () => {
  try {
    const currentUserId = transactionStore?.authState?.userId || 'user123';
    await updateBudgetByUserId(currentUserId, bulkForm);
    // 저장 완료를 부모에 알리고, 상위 화면에서 총예산 재조회 트리거
    emit('saved');
    closeModal();
  } catch (error) {
    // 저장 실패 원인을 개발 중 바로 확인할 수 있도록 콘솔에 노출
    console.error('카테고리 예산 일괄 저장 실패:', error);
  }
};

// 모달 오픈 시 categories/budgets를 읽어 input 초기값을 구성
const loadFormData = async () => {
  // 카테고리 목록과 예산 데이터를 동시에 조회
  const [budgetResult, categoriesResult] = await Promise.allSettled([
    getBudget(transactionStore?.authState?.userId || 'user123'),
    Promise.resolve({
      expense: Array.isArray(transactionStore?.categories?.expense)
        ? transactionStore.categories.expense
            .filter((category) => category.id !== 'exp_fixed')
            .map((category) => ({ id: category.id, name: category.name }))
        : [],
    }),
  ]);

  // categories API 응답이 실패하면 빈 객체로 대체
  const categoriesPayload =
    categoriesResult.status === 'fulfilled' ? categoriesResult.value : {};

  // 지출 카테고리만 카드로 노출
  const expenseCategories = Array.isArray(categoriesPayload?.expense)
    ? categoriesPayload.expense.filter(
        (category) => category.id !== 'exp_fixed',
      )
    : [];

  // 현재 사용자 예산 1건 조회 결과를 input 초기값에 반영
  const selectedBudget =
    budgetResult.status === 'fulfilled' ? budgetResult.value : null;
  const categoryBudgets = selectedBudget?.categoryBudgets || {};

  // 카테고리 카드 렌더링용 rows 생성
  budgetFormRows.value = expenseCategories.map((category) => ({
    categoryId: category.id,
    category: category.name,
  }));

  // 이전 폼 입력값 초기화
  Object.keys(bulkForm).forEach((key) => {
    delete bulkForm[key];
  });

  // 카테고리별 예산값을 input 초기값으로 주입
  budgetFormRows.value.forEach((row) => {
    bulkForm[row.categoryId] = Number(categoryBudgets[row.categoryId] || 0);
  });
};

// 모달이 열리는 시점에만 폼 데이터를 새로 로드
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      loadFormData();
    }
  },
);
</script>

<style scoped>
@media (max-width: 768px) {
  .kb-modal-card {
    width: min(92vw, 640px);
    max-height: 82vh;
    overflow-y: auto;
  }
}

@media (max-width: 480px) {
  .kb-modal-head {
    margin-bottom: 0.75rem !important;
  }

  .kb-modal-actions {
    flex-direction: column;
  }

  .kb-modal-actions .kb-btn-light,
  .kb-modal-actions .kb-btn-dark {
    width: 100%;
  }
}
</style>

