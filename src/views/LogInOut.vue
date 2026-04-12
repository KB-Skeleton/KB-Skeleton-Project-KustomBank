<template>
  <div
    class="d-flex align-items-center justify-content-center"
    style="min-height: 60vh"
  >
    <div class="kb-modal-card w-100" style="max-width: 400px; padding: 2rem">
      <div class="text-center mb-4">
        <div class="kb-logo-mark mx-auto mb-2">KB</div>
        <h1 class="h4 fw-black kb-text-charcoal">Kustom Bank</h1>
        <p class="text-secondary small mt-1">
          서비스를 이용하려면 로그인해 주세요.
        </p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="userId" class="form-label fw-bold small text-secondary">
            아이디
          </label>
          <input
            id="userId"
            v-model="loginForm.userId"
            type="text"
            class="kb-input w-100"
            placeholder="아이디를 입력하세요"
            required
            autofocus
          />
        </div>

        <div class="mb-4">
          <label for="password" class="form-label fw-bold small text-secondary">
            비밀번호
          </label>
          <input
            id="password"
            v-model="loginForm.password"
            type="password"
            class="kb-input w-100"
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>

        <button
          type="submit"
          class="kb-btn-brown w-100 py-2 fw-bold"
          :disabled="isLoading"
        >
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </button>
      </form>

      <div
        v-if="errorMessage"
        class="text-danger mt-3 text-center small fw-bold"
      >
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStores } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStores();

const loginForm = reactive({
  userId: '',
  password: '',
});

const isLoading = ref(false);
const errorMessage = ref('');

const getRedirectPath = () => {
  if (typeof route.query.redirect === 'string') {
    return route.query.redirect;
  }
  return '/dashboard';
};

const handleLogin = async () => {
  if (!loginForm.userId || !loginForm.password) {
    errorMessage.value = '아이디와 비밀번호를 입력해 주세요.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const user = await authStore.login({
      userId: loginForm.userId,
      password: loginForm.password,
    });

    if (!user) {
      errorMessage.value = '아이디 또는 비밀번호가 올바르지 않습니다.';
      return;
    }

    router.replace(getRedirectPath());
  } catch (error) {
    errorMessage.value =
      '로그인 서버에 연결하지 못했습니다. json-server 실행 상태를 확인해 주세요.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  authStore.restoreAuth();
  if (authStore.isAuthenticated) {
    router.replace('/dashboard');
  }
});
</script>
