<template>
  <div class="kb-bg">
    <template v-if="isLoginPage">
      <main class="container-xxl login-main">
        <RouterView />
      </main>
    </template>

    <template v-else>
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
        <span class="fab-desktop-label">+ 입력하기</span>
      </BaseButton>

      <BaseModal
        :open="isTransactionModalOpen"
        title="지출/수입 내역 추가"
        @close="closeTransactionModal"
      >
        <TransactionForm
          @cancel="closeTransactionModal"
          @saved="closeTransactionModal"
        />
      </BaseModal>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterView, useRoute } from "vue-router";

import BaseButton from "./components/common/BaseButton.vue";
import BaseModal from "./components/common/BaseModal.vue";
import TransactionForm from "./components/calendar/TransactionForm.vue";
import TheHeader from "./components/layout/TheHeader.vue";
import TheSideBar from "./components/layout/TheSideBar.vue";
import { useAuthStores } from "./stores/auth";

const route = useRoute();
const authStore = useAuthStores();
const isTransactionModalOpen = ref(false);

const isLoginPage = computed(() => route.path === "/login");

const openTransactionModal = () => {
  isTransactionModalOpen.value = true;
};

const closeTransactionModal = () => {
  isTransactionModalOpen.value = false;
};

onMounted(() => {
  authStore.restoreAuth();
});
</script>

<style>
.custom-main {
  padding: 24px 24px 60px 24px;
}

.login-main {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 1rem;
  padding-bottom: 1rem;
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
    font-size: 1.8rem;
    line-height: 1;
    font-weight: 800;
    display: inline;
  }

  .fab-desktop-label {
    display: none;
  }
}
</style>