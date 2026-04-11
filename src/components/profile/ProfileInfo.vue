<template>
  <article class="profile-card kb-panel">
    <div class="profile-card-head">
      <div>
        <h2 class="profile-card-title">계정 정보</h2>
        <p class="profile-card-subtitle">현재 로그인된 계정 정보입니다.</p>
      </div>

      <KbButton
        variant="dark"
        customClass="rounded-pill px-3"
        :disabled="isLoading"
        @click="$emit('edit')"
      >
        수정
      </KbButton>
    </div>

    <div v-if="isLoading" class="profile-loading">
      프로필 정보를 불러오는 중...
    </div>

    <div v-else class="profile-grid">
      <div class="profile-item">
        <p class="profile-item-label">아이디</p>
        <p class="profile-item-value">{{ user.userId || "-" }}</p>
      </div>

      <div class="profile-item">
        <p class="profile-item-label">이메일</p>
        <p class="profile-item-value">{{ user.email || "-" }}</p>
      </div>

      <div class="profile-item">
        <p class="profile-item-label">연락처</p>
        <p class="profile-item-value">{{ user.phone || "-" }}</p>
      </div>
    </div>
  </article>
</template>

<script setup>
import KbButton from "@/components/common/BaseButton.vue";

defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["edit"]);
</script>

<style scoped>
.profile-card {
  border: 1px solid rgba(34, 34, 34, 0.1);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98),
    rgba(255, 243, 204, 0.35)
  );
  border-color: rgba(122, 92, 63, 0.15);
}

.profile-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.profile-card-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 900;
  color: var(--kb-charcoal);
}

.profile-card-subtitle {
  margin: 0.3rem 0 0;
  font-size: 0.88rem;
  color: #6c757d;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

.profile-item {
  border-radius: 0.9rem;
  border: 1px solid rgba(34, 34, 34, 0.1);
  background: #fff;
  padding: 0.8rem 0.9rem;
}

.profile-item-label {
  margin: 0;
  font-size: 0.78rem;
  color: #6c757d;
  font-weight: 700;
}

.profile-item-value {
  margin: 0.25rem 0 0;
  font-size: 0.98rem;
  color: var(--kb-charcoal);
  font-weight: 800;
}

.profile-loading {
  font-size: 0.92rem;
  color: #6c757d;
}

@media (max-width: 991.98px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
