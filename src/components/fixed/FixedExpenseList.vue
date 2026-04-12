<template>
  <article class="kb-panel">
    <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
      <div>
        <h3 class="h3 fw-black kb-text-charcoal mb-0">고정지출 관리</h3>
      </div>
      <span class="kb-pill">총 {{ fixedItems.length }}건</span>
    </div>

    <div v-if="fixedItems.length === 0" class="text-center py-5 text-secondary">
      <p class="mb-2 fw-bold">아직 등록된 고정지출이 없습니다.</p>
      <p class="mb-0 small">
        월세, 통신비, 구독료처럼 반복되는 지출을 먼저 등록해보세요.
      </p>
    </div>

    <div v-else class="d-grid gap-2">
      <div
        v-for="item in fixedItems"
        :key="item.id"
        class="rounded-3 border p-3 bg-white"
        style="border-color: rgba(34, 34, 34, 0.15)"
      >
        <template v-if="editId === item.id">
          <div class="row g-2">
            <div class="col-12 col-lg-4">
              <input
                v-model.trim="editForm.title"
                class="kb-input"
                placeholder="항목명"
              />
            </div>
            <div class="col-12 col-sm-6 col-lg-3">
              <input
                v-model.number="editForm.amount"
                type="number"
                min="0"
                class="kb-input"
                placeholder="금액"
              />
            </div>
            <div class="col-12 col-sm-6 col-lg-2">
              <input
                v-model.number="editForm.dueDay"
                type="number"
                min="1"
                max="31"
                class="kb-input"
                placeholder="결제일"
              />
            </div>
            <div class="col-12 col-lg-3">
              <select v-model="editForm.categoryId" class="kb-input">
                <option
                  v-for="category in expenseCategories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="d-flex gap-2 mt-3">
            <button class="kb-btn-dark" @click="save(item)">저장</button>
            <button class="kb-btn-light" @click="cancel">취소</button>
          </div>
        </template>

        <template v-else>
          <div class="d-flex justify-content-between align-items-start gap-3">
            <div>
              <p class="mb-1 fw-bold kb-text-charcoal">{{ item.description }}</p>
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
            <button class="kb-btn-light danger" @click="remove(item.id)">
              삭제
            </button>
          </div>
        </template>
      </div>
    </div>
  </article>
</template>

<script setup>
import { reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { useFinanceStore } from "@/stores/finance";
import { useAuthStores } from "@/stores/auth";

const emit = defineEmits(["changed"]);
const props = defineProps({
  fixedItems: {
    type: Array,
    default: () => [],
  },
});

const store = useFinanceStore();
const authStore = useAuthStores();
const { expenseCategories } = storeToRefs(store);
const { authState } = storeToRefs(authStore);
const { formatCurrency, putFixed, deleteFixed } = store;

const editId = ref(null);
const editForm = reactive({
  title: "",
  amount: 0,
  dueDay: 1,
  categoryId: "exp_fixed",
});

const begin = (item) => {
  editId.value = item.id;
  editForm.title = item.description;
  editForm.amount = Number(item.amount || 0);
  editForm.dueDay = Number(item.paymentDate || 1);
  editForm.categoryId = item.categoryId || "exp_fixed";
};

const cancel = () => {
  editId.value = null;
};

const save = async (item) => {
  const ok = await putFixed({
    ...item,
    userId: item.userId || authState.value.userId || "user123",
    description: editForm.title,
    amount: Number(editForm.amount),
    paymentDate: Number(editForm.dueDay),
    categoryId: editForm.categoryId,
  });

  if (ok) {
    cancel();
    emit("changed");
  }
};

const remove = async (id) => {
  if (!confirm("이 고정지출 설정을 삭제하시겠습니까?")) return;
  const ok = await deleteFixed(id);
  if (ok) {
    if (editId.value === id) cancel();
    emit("changed");
  }
};
</script>

<style scoped>
.kb-btn-light.danger {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.kb-btn-light.danger:hover {
  background-color: #ff4d4f;
  color: #fff;
}
</style>
