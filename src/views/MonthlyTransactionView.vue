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
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import MonthSelector from '@/components/calendar/MonthSelector.vue';
import CalendarView from './CalendarView.vue';
import { useFinanceStore } from '@/stores/finance';
import MonthlyTransactionList from '@/components/spending/MonthlyTransactionList.vue';
import TransactionDetailModal from '@/components/spending/TransactionDetailModal.vue';

const financeStore = useFinanceStore();
const isModalOpen = ref(null);
const selectedItem = ref(null);

const handleOpenModal = (item) => {
  selectedItem.value = item;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedItem.value = null;
};

const deleteTransaction = () => {};
</script>
