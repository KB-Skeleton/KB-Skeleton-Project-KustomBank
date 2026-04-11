<template>
  <div
    v-if="show && editForm"
    class="kb-modal-overlay"
    @click.self="handleClose"
  >
    <div class="kb-modal-card">
      <div class="d-flex align-items-center justify-content-between">
        <h4 class="fw-black">내역 수정</h4>
        <button class="kb-btn-light" @click="handleClose">닫기</button>
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
              v-for="cat in financeStore.expenseCategories.value"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>
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
  description: '',
  amount: 0,
  date: '',
  categoryId: null,
  type: 'expense',
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
    }
  },
);

const handleSave = () => {
  if (!editForm.description || editForm.amount <= 0) {
    alert('내용과 금액을 정확히 입력해 주세요.');
    return;
  }
  if (editForm.date > today.value) {
    alert('미래 날짜는 선택할 수 없습니다.');
  }

  const success = financeStore.updateTransaction(editForm.id, { ...editForm });

  if (success) {
    emit('save-success');
    emit('close');
  }
};

const handleClose = () => {
  emit('close');
};
</script>
