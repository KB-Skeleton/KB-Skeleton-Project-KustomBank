<template>
  <div v-if="open" class="modal-backdrop" @click="handleBackdropClick">
    <div class="modal-panel" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title-text">{{ title }}</h2>
        <button
          type="button"
          class="btn-close"
          aria-label="닫기"
          @click="closeModal"
        ></button>
      </div>

      <div class="modal-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

const handleBackdropClick = () => {
  emit('close');
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-panel {
  width: min(90vw, 560px);
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-title-text {
  font-size: 1.45rem;
  font-weight: 900;
  color: var(--kb-charcoal, #222);
  letter-spacing: -0.03em;
  margin: 0;
}
</style>
