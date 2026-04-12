<template>
  <div class="row g-3 row-cols-1 row-cols-md-2 row-cols-xl-4 summary-cards">
    <div class="col">
      <BaseCard
        accent="blue"
        label="월 수입"
        type="button"
        customClass="h-100 d-flex flex-column justify-content-between"
        @click="router.push('/monthly-spending')"
      >
        <p class="kb-card-value summary-main-value text-primary mb-0">
          {{ financeStore.formatCurrency(summary.income) }}
        </p>
        <p class="summary-subtext fw-semibold text-secondary mb-0 invisible">
          설정 금액
        </p>
      </BaseCard>
    </div>

    <div class="col">
      <BaseCard
        accent="red"
        label="월 지출"
        type="button"
        customClass="h-100 d-flex flex-column justify-content-between"
        @click="router.push('/monthly-spending')"
      >
        <p class="kb-card-value summary-main-value text-danger mb-0">
          {{ financeStore.formatCurrency(summary.expense) }}
        </p>
        <p class="summary-subtext fw-semibold text-secondary mb-0 invisible">
          설정 금액
        </p>
      </BaseCard>
    </div>

    <div class="col">
      <BaseCard
        accent="yellow"
        label="가용 금액"
        type="button"
        customClass="h-100 d-flex flex-column justify-content-between"
        @click="router.push('/budget')"
      >
        <p
          class="kb-card-value summary-main-value mb-0"
          :class="availableAmount < 0 ? 'text-danger' : 'kb-text-charcoal'"
        >
          {{ financeStore.formatCurrency(availableAmount) }}
        </p>
        <p class="summary-subtext fw-semibold text-secondary mb-0">
          월 예산: {{ financeStore.formatCurrency(monthlyBudgetTarget) }}
        </p>
      </BaseCard>
    </div>

    <div class="col">
      <BaseCard
        accent="brown"
        label="고정지출"
        customClass="h-100 d-flex flex-column justify-content-between"
        @click="router.push('/fixed-expenses')"
      >
        <p class="kb-card-value summary-main-value kb-text-brown mb-0">
          {{ financeStore.formatCurrency(fixedSummary.spentFixed) }}
        </p>
        <p class="summary-subtext fw-semibold text-secondary mb-0">
          예상 지출액:
          {{ financeStore.formatCurrency(fixedSummary.totalFixed) }}
        </p>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import BaseCard from "@/components/common/BaseCard.vue";
import { useFinanceStore } from "@/stores/finance";
import { useAuthStores } from "@/stores/auth";

const props = defineProps({
  monthlyBudgetTarget: {
    type: Number,
    required: true,
  },
});

const financeStore = useFinanceStore();
const authStore = useAuthStores();

const router = useRouter();

const currentMonth = new Date().toISOString().slice(0, 7);

const currentMonthKey = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
});

const summary = computed(() => financeStore.getMonthlySummary(currentMonth));

const monthlyBudgetTarget = computed(() => {
  return props.monthlyBudgetTarget;
});

const availableAmount = computed(
  () => monthlyBudgetTarget.value - summary.value.expense,
);

const fixedSummary = computed(() => {
  const userId = authStore.authState.userId || "";

  const spentFixed = financeStore.transactions
    .filter((tx) => String(tx.userId || "") === String(userId))
    .filter((tx) => financeStore.toMonthKey(tx.date) === currentMonthKey.value)
    .filter((tx) => tx.isExpense === true || tx.type === "expense")
    .filter((tx) => tx.isFixed === true || tx.categoryId === "exp_fixed")
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const settingFixed = financeStore.fixedExpenseSetting
    .filter((item) => String(item.userId || "") === String(userId))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalFixed = spentFixed + settingFixed;

  return {
    spentFixed,
    settingFixed,
    totalFixed,
    usage: settingFixed > 0 ? Math.round((spentFixed / settingFixed) * 100) : 0,
  };
});
</script>

<style scoped>
.summary-main-value {
  margin-top: -0.18rem !important;
}

.summary-subtext {
  margin-top: 0.16rem !important;
}

@media (max-width: 767.98px) {
  .summary-cards {
    --bs-gutter-x: 0.65rem;
    --bs-gutter-y: 0.65rem;
  }

  .summary-cards > .col {
    flex: 0 0 50%;
    max-width: 50%;
  }

  .summary-cards :deep(.kb-card-label) {
    font-size: 0.78rem;
  }

  .summary-cards :deep(.kb-card-value) {
    font-size: 1.28rem;
    line-height: 1.15;
    margin-bottom: 0.15rem !important;
  }

  .summary-subtext {
    font-size: 0.72rem !important;
    line-height: 1.2;
    margin-top: 0.12rem !important;
  }
}
</style>
