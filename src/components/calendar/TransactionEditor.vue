<template>
  <form class="transaction-editor" @submit.prevent="handleSubmit">
    <div class="type-switch">
      <button
        type="button"
        class="type-button"
        :class="{ active: form.type === 'expense' }"
        @click="setType('expense')"
      >
        지출
      </button>
      <button
        type="button"
        class="type-button"
        :class="{ active: form.type === 'income' }"
        @click="setType('income')"
      >
        수입
      </button>
    </div>

    <button
      v-if="form.type === 'expense'"
      type="button"
      class="fixed-toggle-button"
      :class="{ active: form.isFixed }"
      @click="toggleFixedMode"
    >
      {{
        form.isFixed ? "일반 지출로 등록하기" : "고정지출로 등록하기"
      }}
    </button>

    <div class="form-group">
      <label for="amount">금액</label>
      <input
        id="amount"
        v-model.number="form.amount"
        type="number"
        min="0"
        class="kb-input"
        placeholder="금액을 입력하세요"
      />
    </div>

    <div class="form-group">
      <label for="category">카테고리</label>
      <select id="category" v-model="form.categoryId" class="kb-input">
        <option value="">카테고리를 선택하세요</option>
        <option
          v-for="category in currentCategories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
    </div>

    <div v-if="!form.isFixed" class="form-group">
      <label for="date">날짜</label>
      <input id="date" v-model="form.date" type="date" class="kb-input" />
    </div>

    <div v-else class="form-group">
      <label for="paymentDate">매달 결제일</label>
      <select
        id="paymentDate"
        v-model.number="form.paymentDate"
        class="kb-input"
      >
        <option :value="null">결제일을 선택하세요</option>
        <option v-for="day in paymentDays" :key="day" :value="day">
          매달 {{ day }}일
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="description">내용</label>
      <input
        id="description"
        v-model="form.description"
        type="text"
        class="kb-input"
        placeholder="예: 넷플릭스, 관리비, 월급"
      />
    </div>

    <div class="editor-actions">
      <BaseButton type="button" variant="light" @click="emit('cancel')">
        취소
      </BaseButton>
      <BaseButton type="submit" variant="dark" :loading="isSubmitting">
        {{ form.isFixed ? "고정지출 저장" : "저장" }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import BaseButton from "@/components/common/BaseButton.vue";
import { useAuthStores } from "@/stores/auth";
import { useFinanceStore } from "@/stores/finance";

const emit = defineEmits(["saved", "cancel"]);

const financeStore = useFinanceStore();
const authStore = useAuthStores();
const isSubmitting = ref(false);

const today = new Date().toISOString().slice(0, 10);
const todayDate = Number(today.slice(-2));
const paymentDays = Array.from({ length: 31 }, (_, index) => index + 1);

const form = reactive({
  type: "expense",
  isFixed: false,
  amount: null,
  categoryId: "",
  date: today,
  paymentDate: todayDate,
  description: "",
});

const currentCategories = computed(() =>
  form.type === "expense"
    ? financeStore.expenseCategories
    : financeStore.incomeCategories,
);

const setType = (type) => {
  form.type = type;
  form.categoryId = "";

  if (type === "income") {
    form.isFixed = false;
  }
};

const toggleFixedMode = () => {
  form.isFixed = !form.isFixed;
};

const resetForm = () => {
  form.type = "expense";
  form.isFixed = false;
  form.amount = null;
  form.categoryId = "";
  form.date = today;
  form.paymentDate = todayDate;
  form.description = "";
};

const validateForm = () => {
  if (!form.amount || form.amount <= 0) {
    alert("금액을 입력해주세요.");
    return false;
  }

  if (!form.categoryId) {
    alert("카테고리를 선택해주세요.");
    return false;
  }

  if (form.isFixed) {
    if (!form.paymentDate || form.paymentDate < 1 || form.paymentDate > 31) {
      alert("매달 결제일을 선택해주세요.");
      return false;
    }
    return true;
  }

  if (!form.date) {
    alert("날짜를 선택해주세요.");
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  let success = false;

  if (form.isFixed) {
    const fixedPayload = {
      userId: authStore.authState.userId,
      categoryId: form.categoryId,
      amount: Number(form.amount),
      paymentDate: Number(form.paymentDate),
      cycle: "monthly",
      description: form.description.trim(),
    };

    success = await financeStore.postFixed(fixedPayload);
  } else {
    const transactionPayload = {
      userId: authStore.authState.userId,
      type: form.type,
      isExpense: form.type === "expense",
      isFixed: false,
      amount: Number(form.amount),
      categoryId: form.categoryId,
      description: form.description.trim(),
      date: form.date,
      isRequired: false,
    };

    success = await financeStore.postTransaction(transactionPayload);
  }

  isSubmitting.value = false;

  if (!success) {
    alert(
      form.isFixed ? "고정지출 저장에 실패했습니다." : "거래 저장에 실패했습니다.",
    );
    return;
  }

  resetForm();
  emit("saved");
};
</script>

<style scoped>
.transaction-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.type-switch {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.type-button,
.fixed-toggle-button {
  border: 1px solid rgba(34, 34, 34, 0.15);
  border-radius: 12px;
  background: #f8f9fa;
  color: #495057;
  font-weight: 700;
  padding: 12px 16px;
}

.type-button.active,
.fixed-toggle-button.active {
  border-color: var(--kb-charcoal);
  background: var(--kb-charcoal);
  color: var(--kb-yellow);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--kb-charcoal);
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
</style>
