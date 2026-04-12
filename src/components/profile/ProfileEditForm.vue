<template>
  <article class="profile-form-card kb-panel">
    <div class="profile-form-head">
      <h3 class="profile-form-title">프로필 수정</h3>
      <p class="profile-form-subtitle">아래 정보를 수정하고 저장해 주세요.</p>
    </div>

    <form class="profile-form" @submit.prevent="submitForm">
      <div class="profile-form-field">
        <label class="profile-label" for="name">이름</label>
        <input
          id="name"
          v-model.trim="form.name"
          type="text"
          class="kb-input"
          required
        />
      </div>

      <div class="profile-form-field">
        <label class="profile-label" for="email">이메일</label>
        <input
          id="email"
          v-model.trim="form.email"
          type="email"
          class="kb-input"
          required
        />
      </div>

      <div class="profile-form-field">
        <label class="profile-label" for="phone">연락처</label>
        <input
          id="phone"
          v-model.trim="form.phone"
          type="text"
          class="kb-input"
          placeholder="010-0000-0000"
          required
        />
      </div>

      <p v-if="errorMessage" class="profile-error">{{ errorMessage }}</p>

      <div class="profile-form-actions">
        <KbButton
          type="submit"
          variant="dark"
          customClass="rounded-pill px-3"
          :disabled="isSaving"
          :loading="isSaving"
        >
          저장
        </KbButton>

        <KbButton
          type="button"
          variant="light"
          customClass="rounded-pill px-3"
          :disabled="isSaving"
          @click="$emit('cancel')"
        >
          취소
        </KbButton>
      </div>
    </form>
  </article>
</template>

<script setup>
import { reactive, watch, ref } from 'vue';
import KbButton from '@/components/common/BaseButton.vue';

const props = defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['save', 'cancel']);

const form = reactive({
  name: '',
  email: '',
  phone: '',
});

const errorMessage = ref('');

const syncForm = (user) => {
  form.name = user?.name ?? '';
  form.email = user?.email ?? '';
  form.phone = user?.phone ?? '';
};

watch(
  () => props.user,
  (nextUser) => {
    syncForm(nextUser);
  },
  { immediate: true, deep: true },
);

const submitForm = () => {
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const isValidPhone = /^[0-9-+\s]{7,20}$/.test(form.phone);

  if (!form.name || !isValidEmail || !isValidPhone) {
    errorMessage.value = '올바른 프로필 정보를 입력해 주세요.';
    return;
  }

  if (confirm('프로필 정보를 수정하시겠습니까?')) {
    errorMessage.value = '';
    emit('save', {
      name: form.name,
      email: form.email,
      phone: form.phone,
    });
  }
};
</script>

<style scoped>
.profile-form-card {
  border: 1px solid rgba(34, 34, 34, 0.1);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98),
    rgba(255, 243, 204, 0.35)
  );
  border-color: rgba(122, 92, 63, 0.15);
}

.profile-form-head {
  margin-bottom: 1rem;
}

.profile-form-title {
  margin: 0;
  font-size: 1.18rem;
  font-weight: 900;
  color: var(--kb-charcoal);
}

.profile-form-subtitle {
  margin: 0.3rem 0 0;
  font-size: 0.88rem;
  color: #6c757d;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.profile-form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.profile-label {
  font-size: 0.78rem;
  font-weight: 800;
  color: #6c757d;
}

.profile-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.45rem;
  margin-top: 0.25rem;
}

.profile-error {
  margin: 0;
  color: #dc3545;
  font-size: 0.85rem;
  font-weight: 700;
}
</style>
