<template>
  <div class="app-container">
    <MonthSelector />

    <div class="mt-3">
      <CalendarView
        v-if="financeStore.state.viewMode === 'calendar'"
        @open-modal="handleOpenModal"
      />
      <template v-else-if="financeStore.state.viewMode === 'list'">
        <div class="responsive-layout">
          <main class="list-section">
            <MonthlyTransactionList
              @open-modal="handleOpenModal"
            ></MonthlyTransactionList>
          </main>
          <aside class="filter-section">
            <TransactionFilter></TransactionFilter>
          </aside>
        </div>
      </template>
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
import { ref } from "vue";
import MonthSelector from "@/components/calendar/MonthSelector.vue";
import CalendarView from "./CalendarView.vue";
import { useFinanceStore } from "@/stores/finance";
import MonthlyTransactionList from "@/components/spending/MonthlyTransactionList.vue";
import TransactionDetailModal from "@/components/spending/TransactionDetailModal.vue";
import TransactionEditorModal from "@/components/spending/TransactionEditorModal.vue";
import TransactionFilter from "@/components/spending/TransactionFilter.vue";

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

<style scoped>
.responsive-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 992px) {
  .responsive-layout {
    display: grid;
    grid-template-columns: 1fr 350px;
    align-items: start;
    gap: 1rem;
  }

  .filter-section {
    position: sticky;
    top: 20px;
  }
}
</style>
