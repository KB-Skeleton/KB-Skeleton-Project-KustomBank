<template>
  <div class="app-container">
    <MonthSelector />

    <div class="mt-3">
      <CalendarView
        v-if="financeStore.state.viewMode === 'calendar'"
        @open-modal="handleOpenModal"
      />
      <MonthlyTransactionList
        v-else-if="financeStore.state.viewMode === 'list'"
        @open-modal="handleOpenModal"
      />
    </div>
    <TransactionDetailModal
      :show="isModalOpen"
      :transaction="selectedItem"
      @close="closeModal"
      @delete="deleteTransaction"
      @edit="handleOpenEdit"
    />

    <TransactionEditorModal
      :show="isEditOpen"
      :transaction="selectedItem"
      @close="closeEdit"
      @save-success="handleSaveSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MonthSelector from '@/components/calendar/MonthSelector.vue';
import CalendarView from './CalendarView.vue';
import { useFinanceStore } from '@/stores/finance';
import MonthlyTransactionList from '@/components/spending/MonthlyTransactionList.vue';
import TransactionDetailModal from '@/components/spending/TransactionDetailModal.vue';
import TransactionEditorModal from '@/components/spending/TransactionEditorModal.vue';

const financeStore = useFinanceStore();
const isModalOpen = ref(false);
const isEditOpen = ref(false);
const selectedItem = ref(null);

onMounted(async () => {
  await financeStore.getTransaction();
});

const handleOpenModal = (item) => {
  selectedItem.value = item;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedItem.value = null;
};

const handleOpenEdit = () => {
  isModalOpen.value = false;
  isEditOpen.value = true;
};

const closeEdit = () => {
  isEditOpen.value = false;
};

const handleSaveSuccess = async () => {
  await financeStore.getTransaction();
  isEditOpen.value = false;
};

const deleteTransaction = async (id) => {
  try {
    const success = await financeStore.deleteTransaction(id);

    if (success) {
      closeModal();
    } else {
      alert('삭제에 실패하였습니다.');
    }
  } catch (error) {
    alert('서버와 통신 중 문제가 발생했습니다.');
  }
};
</script>
