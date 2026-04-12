<template>
  <div class="d-grid gap-4">
    <transition name="fade">
      <article v-if="isAdding" class="kb-panel border-warning shadow-sm">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="h4 fw-black kb-text-charcoal mb-0">고정지출 설정</h3>
          <button class="btn-close" @click="closeAddForm"></button>
        </div>

        <div class="row g-3">
          <div class="col-12">
            <label class="kb-card-label d-block mb-1">내역 (항목명)</label>
            <input
              v-model.trim="addForm.title"
              class="kb-input"
              placeholder="예: 월세, 넷플릭스"
            />
          </div>
          <div class="col-12 col-md-7">
            <label class="kb-card-label d-block mb-1">금액</label>
            <div class="position-relative">
              <input
                :value="addForm.amountText"
                @input="onAddAmountInput"
                inputmode="numeric"
                class="kb-input pe-5"
                placeholder="0"
              />
              <span
                class="position-absolute end-0 top-50 translate-middle-y me-3 small fw-bold text-secondary"
                >원</span
              >
            </div>
          </div>
          <div class="col-12 col-md-5">
            <label class="kb-card-label d-block mb-1">결제일 (매달)</label>
            <div class="position-relative">
              <select v-model.number="addForm.dueDay" class="kb-input pe-5">
                <option v-for="day in 31" :key="day" :value="day">
                  {{ day }}일
                </option>
              </select>
            </div>
          </div>
          <div class="col-12">
            <label class="kb-card-label d-block mb-2">카테고리 선택</label>
            <div class="category-grid-edit">
              <button
                v-for="category in expenseCategories"
                :key="category.id"
                type="button"
                class="category-btn-sm"
                :class="{ active: addForm.categoryId === category.id }"
                @click="addForm.categoryId = category.id"
              >
                {{ category.name }}
              </button>
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
          <button class="kb-btn-dark" @click="handleCreate">
            고정지출 추가
          </button>
          <button class="kb-btn-light" @click="closeAddForm">취소</button>
        </div>
      </article>
    </transition>

    <article class="kb-panel">
      <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
        <div>
          <h3 class="h3 fw-black kb-text-charcoal mb-0">고정지출 관리</h3>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button v-if="!isAdding" class="kb-btn-dark" @click="isAdding = true">
            + 추가하기
          </button>
        </div>
      </div>

      <div
        v-if="fixedItems.length === 0"
        class="text-center py-5 text-secondary"
      >
        <p class="mb-2 fw-bold">아직 등록된 고정지출이 없습니다.</p>
        <button class="kb-btn-light mt-2" @click="isAdding = true">
          첫 고정지출 등록하기
        </button>
      </div>

      <div v-else class="d-grid gap-2">
        <div
          v-for="item in fixedItems"
          :key="item.uid || item.id"
          class="rounded-3 border p-3 bg-white"
          style="border-color: rgba(34, 34, 34, 0.15)"
        >
          <template v-if="editId === (item.uid || item.id)">
            <div class="row g-3">
              <div class="col-12">
                <label class="kb-card-label d-block mb-1">내역</label>
                <input v-model.trim="editForm.title" class="kb-input" />
              </div>
              <div class="col-12 col-md-7">
                <label class="kb-card-label d-block mb-1">금액</label>
                <div class="position-relative">
                  <input
                    :value="editForm.amountText"
                    @input="onEditAmountInput"
                    inputmode="numeric"
                    class="kb-input pe-5"
                  />
                  <span
                    class="position-absolute end-0 top-50 translate-middle-y me-3 small fw-bold text-secondary"
                    >원</span
                  >
                </div>
              </div>
              <div class="col-12 col-md-5">
                <label class="kb-card-label d-block mb-1">결제일</label>
                <select v-model.number="editForm.dueDay" class="kb-input">
                  <option v-for="day in 31" :key="day" :value="day">
                    {{ day }}일
                  </option>
                </select>
              </div>
              <div class="col-12">
                <label class="kb-card-label d-block mb-2">카테고리</label>
                <div class="category-grid-edit">
                  <button
                    v-for="category in expenseCategories"
                    :key="category.id"
                    type="button"
                    class="category-btn-sm"
                    :class="{ active: editForm.categoryId === category.id }"
                    @click="editForm.categoryId = category.id"
                  >
                    {{ category.name }}
                  </button>
                </div>
              </div>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <button class="kb-btn-dark" @click="save(item)">저장</button>
              <button class="kb-btn-light" @click="cancel">취소</button>
            </div>
          </template>

          <template v-else>
            <div class="d-flex justify-content-between align-items-start gap-3">
              <div>
                <p class="mb-1 fw-bold kb-text-charcoal">
                  {{ item.description }}
                </p>
                <p class="mb-0 small text-secondary">
                  {{ item.categoryName }} · 매월 {{ item.paymentDate }}일 결제
                </p>
              </div>
              <p class="mb-0 fw-black text-danger">
                {{ formatCurrency(item.amount) }}
              </p>
            </div>
            <div class="d-flex justify-content-end gap-2 mt-3">
              <button class="kb-btn-light" @click="begin(item)">수정</button>
              <button class="kb-btn-danger" @click="remove(item)">삭제</button>
            </div>
          </template>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useFinanceStore } from '@/stores/finance';
import { useAuthStores } from '@/stores/auth';

const emit = defineEmits(['changed']);
const props = defineProps({ fixedItems: { type: Array, default: () => [] } });

const store = useFinanceStore();
const authStore = useAuthStores();
const { expenseCategories } = storeToRefs(store);
const { authState } = storeToRefs(authStore);
const {
  formatCurrency,
  putFixed,
  deleteFixed,
  putTransaction,
  deleteTransaction,
  postFixed,
} = store;

const toDigits = (value) => String(value || '').replace(/[^\d]/g, '');
const formatNumber = (value) => Number(value || 0).toLocaleString('ko-KR');

const isAdding = ref(false);
const addForm = reactive({
  title: '',
  amountText: '',
  dueDay: 1,
  categoryId: 'exp_fixed',
});

const onAddAmountInput = (e) => {
  addForm.amountText = formatNumber(toDigits(e.target.value));
};
const closeAddForm = () => {
  isAdding.value = false;
  Object.assign(addForm, { title: '', amountText: '', dueDay: 1 });
};

const handleCreate = async () => {
  const amount = Number(toDigits(addForm.amountText));
  if (!addForm.title || amount <= 0)
    return alert('내용과 금액을 입력해주세요.');
  const ok = await postFixed({
    userId: authState.value.userId || 'user123',
    description: addForm.title,
    amount,
    paymentDate: addForm.dueDay,
    categoryId: addForm.categoryId,
    cycle: 'monthly',
  });
  if (ok) {
    closeAddForm();
    emit('changed');
  }
};

const editId = ref(null);
const editForm = reactive({
  title: '',
  amountText: '',
  dueDay: 1,
  categoryId: 'exp_fixed',
});

const onEditAmountInput = (e) => {
  editForm.amountText = formatNumber(toDigits(e.target.value));
};

const begin = (item) => {
  editId.value = item.uid || item.id;
  editForm.title = item.description;
  editForm.amountText = formatNumber(item.amount);
  editForm.dueDay = Number(item.paymentDate || 1);
  editForm.categoryId = item.categoryId || 'exp_fixed';
};

const cancel = () => {
  editId.value = null;
};

const save = async (item) => {
  const isTransactionSource = item.sourceType === 'transaction';
  const persistedItem = { ...item };
  delete persistedItem.uid;
  delete persistedItem.sourceType;
  delete persistedItem.categoryName;

  const payload = {
    ...persistedItem,
    userId: persistedItem.userId || authState.value.userId || 'user123',
    description: editForm.title,
    amount: Number(toDigits(editForm.amountText)),
    categoryId: editForm.categoryId,
    paymentDate: Number(editForm.dueDay),
  };

  const ok = isTransactionSource
    ? await putTransaction({
        ...payload,
        isExpense: true,
        isFixed: true,
        date: persistedItem.date || new Date().toISOString().slice(0, 10),
      })
    : await putFixed(payload);

  if (ok) {
    cancel();
    emit('changed');
  }
};

const remove = async (item) => {
  if (!confirm('삭제하시겠습니까?')) return;
  const ok =
    item.sourceType === 'transaction'
      ? await deleteTransaction(item.id)
      : await deleteFixed(item.id);
  if (ok) {
    if (editId.value === (item.uid || item.id)) cancel();
    emit('changed');
  }
};
</script>

<style scoped>
.category-grid-edit {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.category-btn-sm {
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 10px;
  background-color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.category-btn-sm.active {
  background-color: #222;
  border-color: #222;
  color: #ffcc00;
}
.border-warning {
  border: 2px solid #ffd338 !important;
}

/* 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
