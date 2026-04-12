<template>
  <div class="kb-bg">
    <TheHeader />

    <div class="container-xxl py-3">
      <div class="row g-3">
        <TheSideBar />

        <main class="col-12 col-lg-9 col-xl-10 custom-main">
          <RouterView />
        </main>
      </div>
    </div>

    <BaseButton
      variant="fab"
      type="button"
      aria-label="Open transaction modal"
      @click="openTransactionModal"
    >
      <span class="fab-mobile-label">+</span>
      <span class="fab-desktop-label">+지출/수입 내역 추가</span>
    </BaseButton>

    <BaseModal
      :open="isTransactionModalOpen"
      class="fw-black mb-0 kb-text-charcoal"
      title="지출/수입 내역 추가"
      @close="closeTransactionModal"
    >
      <TransactionEditor
        @cancel="closeTransactionModal"
        @saved="closeTransactionModal"
      />
    </BaseModal>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router';

import BaseButton from './components/common/BaseButton.vue';
import BaseModal from './components/common/BaseModal.vue';
import TransactionEditor from './components/calendar/TransactionEditor.vue';
import TheHeader from './components/layout/TheHeader.vue';
import TheSideBar from './components/layout/TheSideBar.vue';

const isTransactionModalOpen = ref(false);

const openTransactionModal = () => {
  isTransactionModalOpen.value = true;
};

const closeTransactionModal = () => {
  isTransactionModalOpen.value = false;
};
</script>

<style>
.custom-main {
  padding: 24px 24px 60px 24px;
}

.fab-mobile-label {
  display: none;
}

.fab-desktop-label {
  display: inline;
}

@media (max-width: 767.98px) {
  .custom-main {
    padding: 0 16px 80px 16px;
  }

  .fab-mobile-label {
    display: inline;
  }

  .fab-desktop-label {
    display: none;
  }
}
</style>
