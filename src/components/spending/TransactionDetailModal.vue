<template>
  <div
    v-if="show && transaction"
    class="kb-modal-overlay"
    @click.self="$emit('close')"
  >
    <div class="kb-modal-card">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h4 class="fw-black">내역 상세</h4>
        <button class="btn-close" @click="$emit('close')"></button>
      </div>

      <div class="">
        <p><strong>설명:</strong> {{ transaction.description }}</p>
        <p>
          <strong>유형:</strong>
          {{ transaction.type === 'expense' ? '지출' : '수입' }}
        </p>
        <p><strong>카테고리:</strong> {{ transaction.categoryName }}</p>
        <p><strong>금액:</strong> ₩{{ transaction.amount.toLocaleString() }}</p>
        <p><strong>날짜:</strong> {{ transaction.date }}</p>
      </div>

      <div class="d-flex justify-content-end gap-2">
        <button class="kb-btn-light" @click="$emit('edit')">편집</button>
        <button class="kb-btn-danger" @click="handleDelete">삭제</button>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  show: Boolean,
  transaction: Object,
});

const emit = defineEmits(['close', 'edit', 'delete']);

const handleDelete = () => {
  if (confirm('삭제하시겠습니까?')) {
    emit('delete', props.transaction.id);
    emit('close');
  }
};
</script>
