import { computed, reactive, ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import { useAuthStores } from "./auth";

const BASE_URL = "http://localhost:3000/";

export const useFinanceStore = defineStore("transactionList", () => {
  const transactions = ref([]);
  const fixedExpenseSetting = ref([]);
  const authStore = useAuthStores();

  const categories = reactive({
    expense: [
      { id: "exp_food", name: "식비", icon: "🍴", color: "#FF6384" },
      { id: "exp_trans", name: "교통", icon: "🚌", color: "#36A2EB" },
      { id: "exp_medical", name: "의료/건강", icon: "🏥", color: "#FFCE56" },
      { id: "exp_hobby", name: "취미/여가", icon: "🎨", color: "#4BC0C0" },
      { id: "exp_edu", name: "자기계발/교육", icon: "📚", color: "#9966FF" },
      { id: "exp_shop", name: "미용/쇼핑", icon: "🛍️", color: "#FF9F40" },
      {
        id: "exp_fixed",
        name: "구독료/고정비",
        icon: "📅",
        color: "#C9CBCF",
      },
      { id: "exp_etc", name: "기타", icon: "🎸", color: "#000000" },
    ],
    income: [
      { id: "inc_salary", name: "급여", icon: "💰" },
      { id: "inc_side", name: "부수입", icon: "📈" },
      { id: "inc_interest", name: "이자/배당", icon: "🏦" },
      { id: "inc_pocket", name: "용돈", icon: "🧧" },
      { id: "inc_etc", name: "기타", icon: "🏷️" },
    ],
  });

  //공용 매서드 (데이터 포맷팅, 정렬 등)
  const toMonthKey = (dateString) => String(dateString || "").slice(0, 7);
  const toDate = (value) => new Date(`${value}T00:00:00`);
  //월 키
  const getCurrentMonthKey = computed(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  const sortedTransactions = computed(() => {
    const allCategories = [...categories.expense, ...categories.income];

    return [...transactions.value]
      .sort((a, b) => toDate(b.date) - toDate(a.date))
      .map((transaction) => {
        const category = allCategories.find(
          (item) => item.id === transaction.categoryId,
        );
        return {
          ...transaction,
          categoryName: category?.name || "기타",
          title: transaction.description,
          category: category?.name || "기타",
          note: transaction.isFixed ? "고정지출" : "변동지출",
        };
      });
  });

  const getCategoryById = (categoryId) => {
    const allCategories = [...categories.expense, ...categories.income];
    return allCategories.find((category) => category.id === categoryId) || null;
  };

  const expenseCategories = computed(() => categories.expense);
  const incomeCategories = computed(() => categories.income);

  //불필요한 지출 부분 매서드
  const getBerquiredOutcome = (userId) => {
    const targetUserId = userId || authStore.userId;
    return sortedTransactions.value.filter((transaction) => {
      const isExpense =
        transaction.type === "expense" || transaction.isExpense === true;
      return (
        transaction.userId === targetUserId &&
        (transaction.isRequired ?? false) === false &&
        isExpense &&
        toMonthKey(transaction.date) === getCurrentMonthKey.value
      );
    });
  };

  const getBerquiredOutcomeAmount = (userId) =>
    getBerquiredOutcome(userId).reduce(
      (sum, transaction) => sum + Number(transaction.amount || 0),
      0,
    );

  //Transaction CRUD-------------------------------------------
  //Create - post
  const postTransaction = async (transaction) => {
    try {
      const res = await axios.post(BASE_URL + "transactions", transaction);

      if (res.status === 201) {
        transactions.value.push(res.data ?? transaction);
        return true;
      }
      console.log("거래 내역 추가 실패");
      return false;
    } catch (e) {
      console.log("거래 내역 추가 실패 : ", e);
      return false;
    }
  };

  //Read - get
  const getTransaction = async () => {
    try {
      const userId = authStore.userId;
      const query = userId ? `?userId=${userId}` : "";
      const res = await axios.get(BASE_URL + `transactions${query}`);

      if (res.status === 200) {
        transactions.value = res.data;
        return true;
      }
      console.log("거래 조회 실패");
      return false;
    } catch (e) {
      console.log("거래 조회 실패 : ", e);
      return false;
    }
  };

  //Update - put
  const putTransaction = async (updatedtransaction) => {
    try {
      const res = await axios.put(
        BASE_URL + `transactions/${updatedtransaction.id}`,
        updatedtransaction,
      );

      if (res.status === 200 || res.status === 204) {
        const index = transactions.value.findIndex(
          (item) => item.id === updatedtransaction.id,
        );
        if (index === -1) {
          return false;
        }

        transactions.value[index] = {
          ...transactions.value[index],
          ...updatedtransaction,
          amount: Number(
            updatedtransaction.amount ?? transactions.value[index].amount,
          ),
          categoryId:
            updatedtransaction.categoryId ??
            transactions.value[index].categoryId,
        };
        return true;
      }
      console.log("거래 정보 수정 실패");
      return false;
    } catch (e) {
      console.log("거래 정보 수정 실패 : ", e);
      return false;
    }
  };

  //Delete - delete
  const deleteTransaction = async (id) => {
    try {
      const res = await axios.delete(BASE_URL + `transactions/${id}`);

      if (res.status === 200 || res.status === 204) {
        const index = transactions.value.findIndex((item) => item.id === id);
        if (index === -1) {
          return false;
        }
        transactions.value.splice(index, 1);
        return true;
      }
      console.log("거래 정보 삭제 실패");
      return false;
    } catch (e) {
      console.log("거래 정보 삭제 : ", e);
      return false;
    }
  };

  //FixedExpense CRUD------------------------------------------------
  //Create - post
  const postFixed = async (fixedData) => {
    try {
      const res = await axios.post(
        BASE_URL + "fixed_expense_settings",
        fixedData,
      );

      if (res.status === 201) {
        fixedExpenseSetting.value.push(res.data ?? fixedData);
        return true;
      }
      console.log("고정지출 정보 추가 실패");
      return false;
    } catch (e) {
      console.log("고정지출 정보 추가 실패 : ", e);
      return false;
    }
  };

  //Read - get
  const getFixed = async () => {
    try {
      const userId = authStore.userId;
      const query = userId ? `?userId=${userId}` : "";
      const res = await axios.get(BASE_URL + `fixed_expense_settings${query}`);

      if (res.status === 200) {
        fixedExpenseSetting.value = res.data;
        return true;
      }
      console.log("고정지출 조회 실패");
      return false;
    } catch (e) {
      console.log("고정지출 조회 실패 : ", e);
      return false;
    }
  };

  // Update - put (fixed_expense_settings)
  const putFixed = async (updatedFixedData) => {
    try {
      const res = await axios.put(
        `${BASE_URL}fixed_expense_settings/${updatedFixedData.id}`,
        updatedFixedData,
      );

      if (res.status === 200 || res.status === 204) {
        const index = fixedExpenseSetting.value.findIndex(
          (item) => item.id === updatedFixedData.id,
        );
        if (index === -1) return false;

        fixedExpenseSetting.value[index] = {
          ...fixedExpenseSetting.value[index],
          ...updatedFixedData,
          amount: Number(
            updatedFixedData.amount ?? fixedExpenseSetting.value[index].amount,
          ),
          paymentDate: Number(
            updatedFixedData.paymentDate ??
              fixedExpenseSetting.value[index].paymentDate,
          ),
        };

        return true;
      }
      console.log("고정지출 설정 수정 실패");
      return false;
    } catch (e) {
      console.log("고정지출 설정 수정 실패:", e);
      return false;
    }
  };

  //Delete - delete
  const deleteFixed = async (id) => {
    try {
      const res = await axios.delete(BASE_URL + `fixed_expense_settings/${id}`);

      if (res.status === 200 || res.status === 204) {
        const index = fixedExpenseSetting.value.findIndex(
          (item) => item.id === id,
        );
        if (index === -1) {
          return false;
        }
        fixedExpenseSetting.value.splice(index, 1);
        return true;
      }
      console.log("고정지출 정보 삭제 실패");
      return false;
    } catch (e) {
      console.log("고정지출 정보 삭제 : ", e);
      return false;
    }
  };

  return {
    transactions,
    fixedExpenseSetting,
    authStore,
    categories,
    toMonthKey,
    toDate,
    getCurrentMonthKey,
    formatCurrency,
    sortedTransactions,
    getCategoryById,
    expenseCategories,
    incomeCategories,
    getBerquiredOutcome,
    getBerquiredOutcomeAmount,
    postTransaction,
    getTransaction,
    putTransaction,
    deleteTransaction,
    postFixed,
    getFixed,
    putFixed,
    deleteFixed,
  };
});
