<template>
  <header class="kb-header py-3">
    <div
      class="container-xxl d-flex align-items-center justify-content-between"
    >
      <RouterLink
        to="/dashboard"
        class="d-flex align-items-center gap-3 text-decoration-none text-reset"
      >
        <img
          src="@/assets/logo.png"
          alt="KustomBank logo"
          class="kb-logo-img"
        />
        <div>
          <p
            class="mb-0 small fw-semibold text-uppercase"
            style="letter-spacing: 0.18em; color: var(--kb-brown)"
          >
            KB Smart Budget
          </p>
          <h1
            class="mb-0 h3 fw-black"
            style="color: var(--kb-charcoal); font-weight: 900"
          >
            <span style="color: var(--kb-brown)">K</span>ustom
            <span style="color: var(--kb-brown)">B</span>ank
          </h1>
        </div>
      </RouterLink>

      <div v-if="isLoggedIn" class="d-flex align-items-center gap-2">
        <KbButton
          variant="dark"
          customClass="rounded-pill user-btn text-btn d-none d-md-inline-flex"
          @click="goToProfile"
        >
          {{ buttonLabel }}
        </KbButton>
        <KbButton
          variant="light"
          customClass="rounded-pill user-btn text-btn d-none d-md-inline-flex"
          @click="handleLogout"
        >
          로그아웃
        </KbButton>

        <KbButton
          variant="dark"
          customClass="rounded-circle user-btn icon-btn d-inline-flex d-md-none"
          :title="buttonLabel"
          @click="goToProfile"
        >
          <FontAwesomeIcon :icon="faUser" />
          <span class="visually-hidden">{{ buttonLabel }}</span>
        </KbButton>
        <KbButton
          variant="light"
          customClass="rounded-circle user-btn icon-btn d-inline-flex d-md-none"
          title="로그아웃"
          @click="handleLogout"
        >
          <FontAwesomeIcon :icon="faRightFromBracket" />
          <span class="visually-hidden">로그아웃</span>
        </KbButton>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import KbButton from '@/components/common/BaseButton.vue';
import { useAuthStores } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStores();

const isLoggedIn = computed(() => !!authStore.authState.userId);

const buttonLabel = computed(() =>
  authStore.authState.name ? `${authStore.authState.name} \uB2D8` : '내 프로필',
);

const goToProfile = () => {
  router.push('/profile');
};

const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    authStore.logout();
    router.replace('/login');
  }
};
</script>

<style scoped>
.kb-header {
  position: sticky;
  top: 0;
  z-index: 1030;
  border-bottom: 1px solid rgba(122, 92, 63, 0.1);
  background: linear-gradient(
    120deg,
    rgba(255, 211, 56, 0.4) 0%,
    rgba(255, 233, 160, 0.2) 38%,
    rgba(255, 255, 255, 0.1) 100%
  );
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.05);
}

.kb-logo-img {
  width: 60px;
  height: auto;
  object-fit: contain;
}

.user-btn {
  font-size: 1rem !important;
  font-weight: 700 !important;
  padding: 0.65rem !important;
  transition: all 0.2s ease-in-out;
}

.user-btn:hover {
  transform: scale(1.03);
  background-color: var(--kb-brown) !important;
  border-color: var(--kb-brown) !important;
}

a {
  color: inherit;
}

.icon-btn {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.text-btn {
  padding: 7px 18px !important;
  font-size: 1.05rem !important;
}
</style>
