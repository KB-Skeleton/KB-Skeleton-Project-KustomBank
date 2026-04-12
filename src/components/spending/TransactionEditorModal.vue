<template>
  <div
    v-if="show && editForm"
    class="kb-modal-overlay"
    @click.self="handleClose"
  >
    <div class="kb-modal-card">
      <div class="d-flex align-items-center justify-content-between">
        <h4 class="fw-black">내역 수정</h4>
        <button class="btn-close" @click="handleClose"></button>
      </div>

      <div class="">
        <div>
          <input
            v-model="editForm.description"
            type="text"
            class="kb-input mt-3"
          />
        </div>
        <div>
          <input
            v-model="editForm.amount"
            type="number"
            class="kb-input mt-2"
          />
        </div>
        <div>
          <input
            v-model="editForm.date"
            type="date"
            class="kb-input mt-2"
            :max="today"
          />
        </div>
        <div>
          <select v-model="editForm.categoryId" class="kb-input mt-2">
            <option
              v-for="cat in currentCategories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>
        <div v-if="editForm.isExpense" class="mt-3">
          <label class="small fw-bold kb-text-charcoal mb-2 d-block"
            >이 소비, 어떠셨나요?</label
          >
          <div class="d-flex gap-2">
            <button
              type="button"
              class="evaluation-btn flex-fill"
              :class="{ 'active-good': !editForm.isRequired }"
              @click="editForm.isRequired = false"
            >
              😊 만족해요
            </button>
            <button
              type="button"
              class="evaluation-btn flex-fill"
              :class="{ 'active-bad': editForm.isRequired }"
              @click="editForm.isRequired = true"
            >
              💸 아까워요
            </button>
          </div>
          <p class="text-secondary small text-center mt-2 mb-0">
            '아까워요'를 선택하면 불필요한 지출로 분류돼요.
          </p>
        </div>
      </div>
      <div class="d-flex justify-content-end mt-3 gap-2">
        <button class="kb-btn-dark" @click="handleSave">저장</button>
        <button class="kb-btn-light" @click="handleClose">취소</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { reactive, watch, computed } from 'vue';
import { useFinanceStore } from '@/stores/finance';

const today = computed(() => new Date().toISOString().split('T')[0]);

const props = defineProps({
  show: Boolean,
  transaction: Object,
});

const emit = defineEmits(['close', 'save-success']);
const financeStore = useFinanceStore();

const editForm = reactive({
  id: null,
  userId: null,
  description: '',
  amount: 0,
  date: '',
  categoryId: null,
  type: 'expense',
  isExpense: true,
  isRequired: false,
});

watch(
  () => props.show,
  (isShown) => {
    if (isShown && props.transaction) {
      editForm.id = props.transaction.id;
      editForm.userId = props.transaction.userId;
      editForm.description = props.transaction.description;
      editForm.amount = props.transaction.amount;
      editForm.date = props.transaction.date;
      editForm.categoryId = props.transaction.categoryId;
      editForm.type = props.transaction.type;
      editForm.isExpense = props.transaction.isExpense;
      editForm.isRequired = props.transaction.isRequired || false;
    }
  },
);

const currentCategories = computed(() => {
  if (editForm.type === 'income' || editForm.isExpense === false) {
    return financeStore.incomeCategories;
  }
  return financeStore.expenseCategories;
});

const handleSave = async () => {
  if (!editForm.description || editForm.amount <= 0) {
    alert('내용과 금액을 정확히 입력해 주세요.');
    return;
  }
  if (editForm.date > today.value) {
    alert('미래 날짜는 선택할 수 없습니다.');
    return;
  }

  const success = await financeStore.putTransaction({ ...editForm });

  if (success) {
    emit('save-success');
    emit('close');
  } else {
    alert('수정에 실패했습니다. 다시 시도해 주세요.');
  }
};

const handleClose = () => {
  emit('close');
};
</script>

<style scoped>
.evaluation-btn {
  padding: 10px;
  border-radius: 12px;
  border: 1px solid rgba(34, 34, 34, 0.15);
  background: #f8f9fa;
  font-weight: 700;
  transition: all 0.2s;
  color: #495057;
}

.active-good {
  background: #e7f5ff;
  border-color: #228be6;
  color: #1c7ed6;
}

.active-bad {
  background: #fff5f5;
  border-color: #fa5252;
  color: #e03131;
}
</style>
