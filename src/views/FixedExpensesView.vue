<template>
  <section class="d-grid gap-3">
    <FixedSummary :summary="summary" :month-label="monthLabel" />

    <article class="kb-panel">
      <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
        <div>
          <h3 class="h4 fw-black kb-text-charcoal mb-0">고정지출 설정</h3>
        </div>
      </div>

      <form class="row g-3" @submit.prevent="handleSubmit">
        <div class="col-12">
          <label for="fixed-title" class="form-label small text-secondary">항목명</label>
          <input
            id="fixed-title"
            v-model.trim="form.title"
            class="kb-input setup-input"
            placeholder="예: 월세"
          />
        </div>

        <div class="col-12 col-md-8">
          <label for="fixed-amount" class="form-label small text-secondary">금액</label>
          <input
            id="fixed-amount"
            :value="form.amountText"
            inputmode="numeric"
            class="kb-input setup-input"
            placeholder="예: 85,000"
            @input="onAmountInput"
          />
        </div>

        <div class="col-12 col-md-4">
          <label for="fixed-due-day" class="form-label small text-secondary">결제일</label>
          <select
            id="fixed-due-day"
            v-model.number="form.dueDay"
            class="kb-input setup-input"
          >
            <option v-for="day in dayOptions" :key="day" :value="day">{{ day }}일</option>
          </select>
        </div>

        <div class="col-12">
          <label class="form-label small text-secondary">카테고리</label>
          <div class="category-grid">
            <button
              v-for="category in expenseCategories"
              :key="category.id"
              type="button"
              class="category-btn"
              :class="{ active: form.categoryId === category.id }"
              @click="form.categoryId = category.id"
            >
              {{ category.name }}
            </button>
          </div>
        </div>

        <div class="col-12 d-flex justify-content-end">
          <button type="submit" class="kb-btn-dark submit-btn" :disabled="!isFormValid">
            고정지출 추가
          </button>
        </div>
      </form>
    </article>

    <FixedExpenseList :fixed-items="fixedItems" @changed="reloadFixedData" />
  </section>
</template>

<script setup>
import { computed, onMounted, reactive } from "vue";
import { storeToRefs } from "pinia";
import { useFinanceStore } from "@/stores/finance";
import { useAuthStores } from "@/stores/auth";
import FixedSummary from "@/components/fixed/FixedSummary.vue";
import FixedExpenseList from "@/components/fixed/FixedExpenseList.vue";

const store = useFinanceStore();
const authStore = useAuthStores();
const { fixedExpenseSetting, expenseCategories, transactions } = storeToRefs(store);
const { authState } = storeToRefs(authStore);
const { postFixed, getFixed, getTransaction, getCategoryById } = store;

const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

const form = reactive({
  title: "",
  amountText: "",
  dueDay: 10,
  categoryId: "exp_fixed",
});

const toDigits = (value) => String(value || "").replace(/[^\d]/g, "");
const formatNumber = (value) => Number(value || 0).toLocaleString("ko-KR");
const parsedAmount = computed(() => Number(toDigits(form.amountText) || 0));

const onAmountInput = (event) => {
  const digits = toDigits(event.target.value);
  form.amountText = digits ? formatNumber(digits) : "";
};

const isFormValid = computed(() => {
  return (
    !!form.title.trim() &&
    parsedAmount.value > 0 &&
    Number(form.dueDay) >= 1 &&
    Number(form.dueDay) <= 31 &&
    !!form.categoryId
  );
});

const resetForm = () => {
  form.title = "";
  form.amountText = "";
  form.dueDay = 10;
  form.categoryId = "exp_fixed";
};

const fixedItems = computed(() =>
  (fixedExpenseSetting.value || []).map((item) => ({
    ...item,
    categoryName: getCategoryById(item.categoryId)?.name || "기타",
  })),
);

const monthLabel = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
});

const summary = computed(() => {
  const items = fixedItems.value;
  const totalFixed = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return {
    totalFixed,
    itemCount: items.length,
  };
});

const reloadFixedData = async () => {
  await Promise.all([getFixed(), getTransaction()]);
};

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  const ok = await postFixed({
    userId: authState.value.userId || "user123",
    categoryId: form.categoryId,
    amount: parsedAmount.value,
    paymentDate: Number(form.dueDay),
    cycle: "monthly",
    description: form.title,
  });

  if (ok) {
    await reloadFixedData();
    resetForm();
  }
};

onMounted(async () => {
  await reloadFixedData();
});
</script>

<style scoped>
.setup-input {
  min-height: 54px;
  border-radius: 14px;
}

.setup-input:focus {
  border-color: #2f2f2f;
  box-shadow: 0 0 0 0.12rem rgba(47, 47, 47, 0.12);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 4px;
}

@media (min-width: 992px) {
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1400px) {
  .category-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.category-btn {
  min-height: 56px;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 14px;
  background-color: #fff;
  color: #111;
  font-size: 0.96rem;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 0.18s ease;
}

.category-btn:hover {
  border-color: #999;
}

.category-btn.active {
  background-color: #2f2f2f;
  border-color: #2f2f2f;
  color: #fff;
}

.submit-btn {
  min-height: 48px;
  min-width: 140px;
}

@media (max-width: 767.98px) {
  .submit-btn {
    width: 100%;
  }
}
</style>
