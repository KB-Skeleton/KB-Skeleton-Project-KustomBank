<template>
  <section class="profile-page">
    <article class="profile-hero kb-panel">
      <p class="profile-hero-eyebrow">MY PROFILE</p>
      <h2 class="profile-hero-title">{{ profileTitle }}</h2>
    </article>

    <ProfileInfo
      v-if="!isEditMode"
      :user="profile"
      :is-loading="isLoading"
      @edit="startEdit"
    />

    <ProfileEditForm
      v-else
      :user="profile"
      :is-saving="isSaving"
      @cancel="cancelEdit"
      @save="handleSave"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import ProfileInfo from "@/components/profile/ProfileInfo.vue";
import ProfileEditForm from "@/components/profile/ProfileEditForm.vue";
import { useAuthStores } from "@/stores/auth";

const authStore = useAuthStores();

const isLoading = ref(false);
const isSaving = ref(false);
const isEditMode = ref(false);

const profile = computed(() => authStore.authState);
const profileTitle = computed(() =>
  profile.value.name ? `${profile.value.name} 님` : "내 프로필",
);

const loadProfile = async () => {
  isLoading.value = true;
  try {
    await authStore.getMyProfile();
  } finally {
    isLoading.value = false;
  }
};

const startEdit = () => {
  isEditMode.value = true;
};

const cancelEdit = () => {
  isEditMode.value = false;
};

const handleSave = async (form) => {
  isSaving.value = true;
  try {
    const updated = await authStore.updateMyProfile(form);
    if (updated) {
      isEditMode.value = false;
    }
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  authStore.restoreAuth();
  loadProfile();
});
</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-hero {
  background: linear-gradient(
    130deg,
    rgba(255, 211, 56, 0.2),
    rgba(255, 255, 255, 0.95)
  );
  border: 1px solid rgba(122, 92, 63, 0.18);
}

.profile-hero-eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: var(--kb-brown);
}

.profile-hero-title {
  margin: 0 0 0.4rem;
  font-size: clamp(1.45rem, 2vw, 2rem);
  font-weight: 900;
  color: var(--kb-charcoal);
}

.profile-hero-subtitle {
  margin: 0.45rem 0 0;
  color: #6c757d;
  font-size: 0.95rem;
}

.profile-hero-meta {
  margin-top: 0.85rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.profile-chip {
  border-radius: 999px;
  padding: 0.33rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: #5f4a34;
  background: rgba(122, 92, 63, 0.1);
  border: 1px solid rgba(122, 92, 63, 0.2);
}
</style>
