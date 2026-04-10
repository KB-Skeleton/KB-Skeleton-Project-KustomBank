<template>
  <article class="kb-panel">
    <!-- 카테고리 내역 섹션 제목 -->
    <h3 class="h3 fw-black kb-text-charcoal mb-3">카테고리 내역</h3>

    <div class="d-grid gap-2">
      <!-- 지출 카테고리 목록을 카드 형태로 반복 렌더링 -->
      <div
        v-for="row in budgetRows"
        :key="row.categoryId"
        class="rounded-3 border p-3 bg-white"
        style="border-color: rgba(34, 34, 34, 0.15)"
      >
        <div
          class="d-flex justify-content-between align-items-center gap-2 kb-item-head"
        >
          <p class="mb-0 h6 fw-bold kb-text-charcoal">{{ row.category }}</p>
          <div class="d-flex align-items-center gap-2">
            <p class="mb-0 small fw-semibold text-secondary kb-item-spent">
              {{ formatCurrency(row.spent) }} / {{ formatCurrency(row.budget) }}
            </p>
            <!-- 카테고리별 수정 버튼 -->
            <button
              type="button"
              class="kb-btn-dark"
              @click="beginInlineEdit(row.categoryId)"
            >
              수정
            </button>
          </div>
        </div>

        <p
          class="mb-0 mt-2 small fw-semibold"
          :class="row.usage > 100 ? 'text-danger' : 'text-secondary'"
        >
          사용 {{ row.usage }}% · 남은 금액 {{ formatCurrency(row.remain) }}
        </p>

        <div
          class="progress mt-2"
          style="height: 0.75rem; background: var(--kb-gray-200)"
        >
          <div
            class="progress-bar"
            :style="{
              width: `${Math.min(row.usage, 100)}%`,
              backgroundColor: row.usage > 100 ? '#dc2626' : '#7A5C3F',
            }"
          />
        </div>

        <!-- 수정 버튼 클릭 시 카테고리별 예산 입력 영역 노출 -->
        <div
          v-if="editingCategoryId === row.categoryId"
          class="d-flex gap-2 mt-2 kb-item-edit"
        >
          <input
            v-model.number="inlineAmount"
            type="number"
            min="0"
            class="kb-input"
          />
          <button
            type="button"
            class="kb-btn-dark"
            :disabled="isSaving"
            @click="saveInline(row.categoryId)"
          >
            저장
          </button>
          <button
            type="button"
            class="kb-btn-light"
            :disabled="isSaving"
            @click="cancelInline"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useBudgetStores } from '@/stores/budget';
import { useFinanceStore } from '@/stores/finance';

const props = defineProps({
  reloadToken: {
    type: [Number, String],
    default: 0,
  },
});

const emit = defineEmits(['saved']);

const finance = useBudgetStores();
const transactionStore = useFinanceStore();
const { buildCategoryBudgetRows, patchCategoryBudgetByUserId } = finance;
const { formatCurrency } = transactionStore;

// 카테고리 내역 행 데이터(예산/사용, 사용률 . 남은금액)
const budgetRows = ref([]);
// 현재 사용자 카테고리별 예산
const categoryBudgets = ref({});
// 현재 인라인 수정 중인 카테고리 ID
const editingCategoryId = ref(null);
// 인라인 입력 금액
const inlineAmount = ref(0);
// 저장 상태
const isSaving = ref(false);

// 사용자 기준 카테고리별 행 데이터를 조회해 화면에 반영
const loadBudgetRows = async () => {
  const currentUserId = transactionStore?.authStore?.userId || 'user123';
  const result = await buildCategoryBudgetRows(currentUserId);
  budgetRows.value = Array.isArray(result?.rows) ? result.rows : [];
  categoryBudgets.value = budgetRows.value.reduce((acc, row) => {
    acc[row.categoryId] = Number(row.budget || 0);
    return acc;
  }, {});
};

// 카테고리별 인라인 편집 시작
const beginInlineEdit = (categoryId) => {
  editingCategoryId.value = categoryId;
  inlineAmount.value = Number(categoryBudgets.value[categoryId] || 0);
};

// 인라인 편집 취소
const cancelInline = () => {
  editingCategoryId.value = null;
};

// 카테고리별 변경값만 PATCH 요청 후 부모 component에 갱신 event 전달
const saveInline = async (categoryId) => {
  const nextAmount = Number(inlineAmount.value || 0);
  const prevAmount = Number(categoryBudgets.value[categoryId] || 0);

  // 값이 같다면 PATCH 요청 하지 않고 종료
  if (nextAmount === prevAmount) {
    cancelInline();
    return;
  }

  try {
    isSaving.value = true;
    // userId 기준 한 개의 카테고리 예산 업데이트
    const currentUserId = transactionStore?.authStore?.userId || 'user123';
    await patchCategoryBudgetByUserId(currentUserId, categoryId, nextAmount);
    categoryBudgets.value = {
      ...categoryBudgets.value,
      [categoryId]: nextAmount,
    };
    budgetRows.value = budgetRows.value.map((row) => {
      if (row.categoryId !== categoryId) {
        return row;
      }
      const usage = nextAmount ? Math.round((row.spent / nextAmount) * 100) : 0;
      return {
        ...row,
        budget: nextAmount,
        usage,
        remain: nextAmount - row.spent,
      };
    });
    emit('saved');
    cancelInline();
  } catch (error) {
    console.log('카테고리 예산 저장 실패: ', error);
  } finally {
    isSaving.value = false;
  }
};

// 컴포넌트가 마운트되면 카테고리 내역 행 데이터를 최초 1회 조회
onMounted(async () => {
  await loadBudgetRows();
});

// 상위에서 예산 변경이 반영되면 카테고리 내역도 다시 조회
watch(
  () => props.reloadToken,
  async () => {
    await loadBudgetRows();
  },
);
</script>

<style scoped>
@media (max-width: 768px) {
  .kb-item-head {
    align-items: flex-start !important;
  }
}

@media (max-width: 480px) {
  .kb-item-edit {
    flex-direction: column;
  }

  .kb-item-edit .kb-input,
  .kb-item-edit .kb-btn-dark,
  .kb-item-edit .kb-btn-light {
    width: 100%;
  }
}
</style>
