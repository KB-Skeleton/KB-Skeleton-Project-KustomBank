import { defineStore } from "pinia";
import { computed, reactive } from "vue";
import { useAuthStores } from "./auth";
import axios from "axios";
import FixedExpenseList from "@/components/fixed/FixedExpenseList.vue";

const BASE_URL = "http://localhost:3000/";

export const useTransactionStore = defineStore("transactionList", {
  state: () => ({
    transactions: [],
    fixedExpenseSetting: [],
    authStore: useAuthStores(),

    categories: {
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
    },
  }),
  getters: {
    //공용 매서드 (데이터 포맷팅, 정렬 등)
    toMonthKey: () => (dateString) => String(dateString || "").slice(0, 7),
    toDate: () => (value) => new Date(`${value}T00:00:00`),
    //월 키
    getCurrentMonthKey() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    },

    formatCurrency: () => (amount) =>
      new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
        maximumFractionDigits: 0,
      }).format(amount || 0),

    sortedTransactions() {
      const allCategories = [
        ...this.categories.expense,
        ...this.categories.income,
      ];

      return [...this.transactions]
        .sort((a, b) => this.toDate(b.date) - this.toDate(a.date))
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
    },
    getCategoryById: (categoryId) =>
      state.categories.find((category) => category.id === Number(categoryId)) ||
      null,

    //불필요한 지출 부분 매서드
    getBerquiredOutcome() {
      return (userId) =>
        this.sortedTransactions.filter(
          (transaction) =>
            transaction.userId === userId &&
            transaction.isRequired === false &&
            transaction.type === "expense" &&
            this.toMonthKey(transaction.date) === this.getCurrentMonthKey(),
        );
    },

    getBerquiredOutcomeAmount() {
      return (userId) =>
        this.getBerquiredOutcome(userId).reduce(
          (sum, transaction) => sum + Number(transaction.amount || 0),
          0,
        );
    },
  },

  actions: {
    //Transaction CRUD-------------------------------------------
    //Create - post
    async postTransaction(transaction) {
      try {
        let res = await axios.post(BASE_URL + "transactions", transaction);

        if (res.status === 201) {
          this.transactions.push(transaction);
          return;
        } else {
          console.log("거래 내역 추가 실패");
        }
      } catch (e) {
        console.log("거래 내역 추가 실패 : ", e);
      }
    },

    //Read - get
    async getTransaction() {
      try {
        let userId = this.authStore.userId;
        let res = await axios.get(BASE_URL + `transactions?userId=${userId}`);

        if (res.status === 200) {
          this.transactions = res.data;
          return;
        } else {
          console.log("거래 조회 실패");
        }
      } catch (e) {
        console.log("거래 조회 실패 : ", e);
      }
    },

    //Update - put
    async putTransaction(updatedtransaction) {
      try {
        let res = await axios.put(
          BASE_URL + `transactions/${updatedtransaction.id}`,
          updatedtransaction,
        );

        if (res.status === 200) {
          const index = this.transactions.findIndex(
            (item) => item.id === updatedtransaction.id,
          );
          if (index === -1) {
            return false;
          }

          this.transactions[index] = {
            ...this.transactions[index],
            ...updatedtransaction,
            amount: Number(
              updatedtransaction.amount ?? this.transactions[index].amount,
            ),
            categoryId: Number(
              updatedtransaction.categoryId ??
                this.transactions[index].categoryId,
            ),
          };
          return true;
        } else {
          console.log("거래 정보 수정 실패");
        }
      } catch (e) {
        console.log("거래 정보 수정 실패 : ", e);
      }
    },

    //Delete - delete
    async deleteTransaction(id) {
      try {
        let res = await axios.delete(BASE_URL + `transactions/${id}`);

        if (res.status === 200) {
          const index = this.transactions.findIndex((item) => item.id === id);
          if (index === -1) {
            return false;
          }
          this.transactions.splice(index, 1);
          return;
        } else {
          console.log("거래 정보 삭제 실패");
        }
      } catch (e) {
        console.log("거래 정보 삭제 : ", e);
      }
    },

    //FixedExpense CRUD------------------------------------------------
    //Create - post
    async postFixed(fixedData) {
      try {
        let res = await axios.post(
          BASE_URL + "fixed_expense_settings",
          fixedData,
        );

        if (res.status === 201) {
          this.fixedExpenseSetting.push(fixedData);
          return;
        } else {
          console.log("고정지출 정보 추가 실패");
        }
      } catch (e) {
        console.log("고정지출 정보 추가 실패 : ", e);
      }
    },

    //Read - get
    async getFixed() {
      try {
        let userId = this.authStore.userId;
        let res = await axios.get(
          BASE_URL + `fixed_expense_settings?userId=${userId}`,
        );

        if (res.status === 200) {
          this.fixedExpenseSetting = res.data;
          return;
        } else {
          console.log("고정지출 조회 실패");
        }
      } catch (e) {
        console.log("고정지출 조회 실패 : ", e);
      }
    },

    // Update - put (fixed_expense_settings)
    async putFixed(updatedFixedData) {
      try {
        const res = await axios.put(
          `${BASE_URL}/fixed_expense_settings/${updatedFixedData.id}`,
          updatedFixedData,
        );

        if (res.status === 200 || res.status === 204) {
          const index = this.fixedExpenseSettings.findIndex(
            (item) => item.id === updatedFixedData.id,
          );
          if (index === -1) return false;

          this.fixedExpenseSettings[index] = {
            ...this.fixedExpenseSettings[index],
            ...updatedFixedData,
            amount: Number(
              updatedFixedData.amount ??
                this.fixedExpenseSettings[index].amount,
            ),
            paymentDate: Number(
              updatedFixedData.paymentDate ??
                this.fixedExpenseSettings[index].paymentDate,
            ),
          };

          return true;
        } else {
          console.log("고정지출 설정 수정 실패");
          return false;
        }
      } catch (e) {
        console.log("고정지출 설정 수정 실패:", e);
        return false;
      }
    },

    //Delete - delete
    async deleteFixed(id) {
      try {
        let res = await axios.delete(BASE_URL + `fixed_expense_settings/${id}`);

        if (res.status === 200) {
          const index = this.fixedExpenseSetting.findIndex(
            (item) => item.id === id,
          );
          if (index === -1) {
            return false;
          }
          this.fixedExpenseSetting.splice(index, 1);
          return;
        } else {
          console.log("고정지출 정보 삭제 실패");
        }
      } catch (e) {
        console.log("고정지출 정보 삭제 : ", e);
      }
    },
  },
});
