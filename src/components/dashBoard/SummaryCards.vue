<template>
  <div class="row g-3 row-cols-1 row-cols-md-2 row-cols-xl-4">
    <div class="col">
      <BaseCard
        accent="blue"
        label="월 수입"
        customClass="h-100 d-flex flex-column justify-content-between"
        @click="router.push('/monthly-spending')"
      >
        <p class="kb-card-value text-primary mb-0">
          {{ formatCurrency(summary.income) }}
        </p>
        <p class="small fw-semibold text-secondary mb-0 invisible">설정 금액</p>
      </BaseCard>
    </div>

    <div class="col">
      <BaseCard
        accent="red"
        label="월 지출"
        customClass="h-100 d-flex flex-column justify-content-between"
        @click="router.push('/monthly-spending')"
      >
        <p class="kb-card-value text-danger mb-0">
          {{ formatCurrency(summary.expense) }}
        </p>
        <p class="small fw-semibold text-secondary mb-0 invisible">설정 금액</p>
      </BaseCard>
    </div>

    <div class="col">
      <BaseCard
        accent="yellow"
        label="가용 금액"
        customClass="h-100 d-flex flex-column justify-content-between"
        @click="router.push('/budget')"
      >
        <p
          class="kb-card-value mb-0"
          :class="availableAmount < 0 ? 'text-danger' : 'kb-text-charcoal'"
        >
          {{ formatCurrency(availableAmount) }}
        </p>
        <p class="small fw-semibold text-secondary mb-0">
          설정 금액 {{ formatCurrency(monthlyBudgetTarget) }}
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
        <p class="kb-card-value kb-text-brown mb-0">
          {{ formatCurrency(fixedSummary.spentFixed) }}
        </p>
        <p class="small fw-semibold text-secondary mb-0">
          전체 {{ formatCurrency(fixedSummary.totalFixed) }} 중
          {{ fixedSummary.usage }}%
        </p>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import BaseCard from "@/components/common/BaseCard.vue";
import { useFinanceStore } from "@/stores/finance";

const router = useRouter();
const {
  formatCurrency,
  getMonthlySummary,
  fixedExpenseSetting,
  transactions,
  toMonthKey,
  getTransaction,
  getFixed,
} = useFinanceStore();

const currentMonth = new Date().toISOString().slice(0, 7);

const currentMonthKey = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
});

const summary = computed(() => getMonthlySummary(currentMonth));

//예산 코딩 완료 시 수정 필요
const monthlyBudgetTarget = computed(() => {
  const totalFixed = fixedExpenseSetting.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );
  return totalFixed || 0;
});

const availableAmount = computed(
  () => monthlyBudgetTarget.value - summary.value.expense,
);

//고정 지출 완료 시 수정 필요
const fixedSummary = computed(() => {
  const spentFixed = transactions
    .filter((tx) => toMonthKey(tx.date) === currentMonthKey.value)
    .filter((tx) => tx.isFixed === true)
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const totalFixed = fixedExpenseSetting.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  return {
    spentFixed,
    totalFixed,
    usage: totalFixed > 0 ? Math.round((spentFixed / totalFixed) * 100) : 0,
  };
});
</script>
