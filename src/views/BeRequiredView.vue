<template>
  <section class="be-required-view d-grid gap-3">
    <article class="kb-panel">
      <div
        class="be-required-header d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3"
      >
        <div class="be-required-title-block">
          <p class="kb-card-label mb-0">이번 달</p>
          <h2 class="h2 fw-black kb-text-charcoal mb-0">불필요한 지출 목록</h2>
        </div>
        <RouterLink to="/investment" class="be-required-back">
          <button
            class="summary-arrow-btn btn btn-sm text-white fw-bold"
            style="background: rgb(96, 88, 76)"
          >
            <FontAwesomeIcon :icon="faAnglesLeft" />
          </button>
        </RouterLink>
        <p class="be-required-total mb-0 fw-black text-danger">
          총 {{ formatCurrency(totalAmount) }}
        </p>
      </div>

      <div v-if="beRequiredList.length" class="d-grid gap-2">
        <div
          v-for="item in beRequiredList"
          :key="item.id"
          class="rounded-3 border p-3 bg-white"
          style="border-color: rgba(34, 34, 34, 0.15)"
        >
          <div class="d-flex justify-content-between align-items-start gap-2">
            <div>
              <p
                class="be-required-item-description mb-0 fw-bold kb-text-charcoal"
              >
                {{ item.description }}
              </p>
              <p class="mb-0 small text-secondary">
                {{ item.date }} · {{ item.categoryName }}
              </p>
            </div>
            <p class="mb-0 fw-black text-danger">
              {{ formatCurrency(item.amount) }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-else
        class="rounded-3 p-4 text-center small fw-semibold text-secondary"
        style="background: var(--kb-gray-100)"
      >
        이번 달 불필요 지출 내역이 없습니다.
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useFinanceStore } from "@/stores/finance";
import { useAuthStores } from "@/stores/auth";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";

const {
  getBerquiredOutcome,
  getBerquiredOutcomeAmount,
  formatCurrency,
  getTransaction,
} = useFinanceStore();
const { authState } = useAuthStores();

const beRequiredList = computed(() => getBerquiredOutcome(authState.userId));
const totalAmount = computed(() => getBerquiredOutcomeAmount(authState.userId));

onMounted(() => {
  getTransaction();
});
</script>

<style scoped>
.be-required-view {
  font-family:
    "Nunito", "Quicksand", "SF Pro Rounded", "Arial Rounded MT Bold",
    "Pretendard", sans-serif;
  font-size: 1.08rem;
}

.be-required-view .kb-card-label {
  font-size: 1rem !important;
}

.be-required-view h2 {
  font-size: 2.4rem;
  font-family: bold;
}

.be-required-view .summary-arrow-btn {
  font-size: 0.8rem;
  padding: 0.5rem 0.9rem;
}

.be-required-view .text-danger.fw-black {
  font-size: 1.5rem;
}

.be-required-view .rounded-3.border.p-3.bg-white p.small {
  font-size: 0.95rem;
}

.be-required-header {
  margin-top: -0.25rem;
}

.be-required-title-block {
  transform: translateY(-0.8rem);
}

.be-required-item-description {
  font-size: 1.6rem;
  font-family: bold;
}

@media (max-width: 768px) {
  .be-required-header {
    display: grid !important;
    grid-template-columns: 1fr auto;
    align-items: center !important;
    margin-top: 0;
    gap: 0.55rem 0.75rem !important;
  }

  .be-required-title-block {
    transform: none;
  }

  .be-required-back {
    justify-self: end;
    align-self: center;
    margin-top: -1.8rem;
  }

  .be-required-total {
    grid-column: 1 / -1;
    margin-top: 0.15rem;
  }
}
</style>
