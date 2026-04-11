import { computed, nextTick, reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStores } from './auth';

const BASE_URL = 'http://localhost:3000/';

export const useFinanceStore = defineStore('transactionList', () => {
  const transactions = ref([]);
  const fixedExpenseSetting = ref([]);
  const { authState } = useAuthStores();

  const state = reactive({
    currentMonth: new Date().toISOString().slice(0, 7),
    viewMode: 'calendar',
    selectedDate: new Date().toISOString().slice(0, 10),
    filter: {
      type: 'all',
      category: '',
      minAmount: 0,
      maxAmount: 0,
    },
  });

  const categories = reactive({
    expense: [
      { id: 'exp_food', name: '식비', icon: '🍴', color: '#FF6384' },
      { id: 'exp_trans', name: '교통', icon: '🚌', color: '#36A2EB' },
      { id: 'exp_medical', name: '의료/건강', icon: '🏥', color: '#FFCE56' },
      { id: 'exp_hobby', name: '취미/여가', icon: '🎨', color: '#4BC0C0' },
      { id: 'exp_edu', name: '자기계발/교육', icon: '📚', color: '#9966FF' },
      { id: 'exp_shop', name: '미용/쇼핑', icon: '🛍️', color: '#FF9F40' },
      {
        id: 'exp_fixed',
        name: '구독료/고정비',
        icon: '📅',
        color: '#C9CBCF',
      },
      { id: 'exp_etc', name: '기타', icon: '🎸', color: '#000000' },
    ],
    income: [
      { id: 'inc_salary', name: '급여', icon: '💰' },
      { id: 'inc_side', name: '부수입', icon: '📈' },
      { id: 'inc_interest', name: '이자/배당', icon: '🏦' },
      { id: 'inc_pocket', name: '용돈', icon: '🧧' },
      { id: 'inc_etc', name: '기타', icon: '🏷️' },
    ],
  });

  //공용 매서드 (데이터 포맷팅, 정렬 등)
  const toMonthKey = (dateString) => String(dateString || '').slice(0, 7);
  const toDate = (value) => new Date(`${value}T00:00:00`);

  //월 키
  const getCurrentMonthKey = computed(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  //원화 형태 포맷팅 매서드
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
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
          categoryName: category?.name || '기타',
          title: transaction.description,
          category: category?.name || '기타',
          note: transaction.isFixed ? '고정지출' : '변동지출',
        };
      });
  });

  //카테고리 ID 반환
  const getCategoryById = (categoryId) => {
    const allCategories = [...categories.expense, ...categories.income];
    return allCategories.find((category) => category.id === categoryId) || null;
  };

  //지출 카테고리 반환
  const expenseCategories = computed(() => categories.expense);
  //수입 카테고리 반환
  const incomeCategories = computed(() => categories.income);

  //불필요한 지출 부분 매서드---------------------------------------------------------
  const getBerquiredOutcome = (userId) => {
    const targetUserId = userId || authState.userId;
    return sortedTransactions.value.filter((transaction) => {
      const isExpense =
        transaction.type === 'expense' || transaction.isExpense === true;
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

  const setCurrentMonth = async (monthKey) => {
    state.currentMonth = monthKey;

    await nextTick();

    state.filter.maxAmount = currentMonthMaxAmount.value;
    state.filter.minAmount = 0;
  };
  const setSelectedDate = (date) => {
    state.selectedDate = date;
  };
  const setViewMode = (mode) => {
    state.viewMode = mode;
  };
  const setFilter = (newFilter) => {
    Object.assign(state.filter, newFilter);
  };
  const resetFilter = () => {
    state.filter = {
      type: 'all',
      category: '',
      minAmount: 0,
      maxAmount: currentMonthMaxAmount.value,
    };
  };

  const currentMonthMaxAmount = computed(() => {
    const monthItems = transactions.value.filter(
      (t) => toMonthKey(t.date) === state.currentMonth,
    );

    if (monthItems.length === 0) return 100000;

    const max = Math.max(...monthItems.map((t) => Number(t.amount || 0)));

    return max > 0 ? Math.ceil(max / 10000) * 10000 : 100000;
  });

  //Transaction CRUD-------------------------------------------
  //Create - post
  const postTransaction = async (transaction) => {
    try {
      const res = await axios.post(BASE_URL + 'transactions', transaction);

      if (res.status === 201) {
        transactions.value.push(res.data ?? transaction);
        return true;
      }
      console.log('거래 내역 추가 실패');
      return false;
    } catch (e) {
      console.log('거래 내역 추가 실패 : ', e);
      return false;
    }
  };

  //Read - get
  const getTransaction = async () => {
    try {
      const userId = authState.userId;
      const query = userId ? `?userId=${userId}` : '';
      const res = await axios.get(BASE_URL + `transactions${query}`);

      if (res.status === 200) {
        transactions.value = res.data;

        state.filter.maxAmount = currentMonthMaxAmount.value;
        return true;
      }
      console.log('거래 조회 실패');
      return false;
    } catch (e) {
      console.log('거래 조회 실패 : ', e);
      return false;
    }
  };

  const getTransactionsByDate = (dateString) =>
    sortedTransactions.value.filter((t) => t.date === dateString);

  const getTransactionsByMonth = (monthKey, applyFilter = false) => {
    const base = sortedTransactions.value.filter(
      (t) => toMonthKey(t.date) === monthKey,
    );
    if (!applyFilter) return base;

    return base.filter((t) => {
      const typeMathch =
        state.filter.type === 'all' || t.type === state.filter.type;
      const categoryMatch =
        !state.filter.category || t.categoryId === state.filter.category;
      const minMatch =
        !state.filter.minAmount || t.amount >= state.filter.minAmount;
      const maxMatch =
        !state.filter.maxAmount || t.amount <= state.filter.maxAmount;
      return typeMathch && categoryMatch && minMatch && maxMatch;
    });
  };

  const getDailyTotals = (monthKey) => {
    const totals = {};
    transactions.value
      .filter((t) => toMonthKey(t.date) === monthKey)
      .forEach((t) => {
        if (!totals[t.date]) totals[t.date] = { income: 0, expense: 0 };
        totals[t.date][t.type] += t.amount;
      });
    return totals;
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
      console.log('거래 정보 수정 실패');
      return false;
    } catch (e) {
      console.log('거래 정보 수정 실패 : ', e);
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
      console.log('거래 정보 삭제 실패');
      return false;
    } catch (e) {
      console.log('거래 정보 삭제 : ', e);
      return false;
    }
  };
  //--------------------------------------------------------------------------

  //FixedExpense CRUD------------------------------------------------
  //Create - post
  const postFixed = async (fixedData) => {
    try {
      const res = await axios.post(
        BASE_URL + 'fixed_expense_settings',
        fixedData,
      );

      if (res.status === 201) {
        fixedExpenseSetting.value.push(res.data ?? fixedData);
        return true;
      }
      console.log('고정지출 정보 추가 실패');
      return false;
    } catch (e) {
      console.log('고정지출 정보 추가 실패 : ', e);
      return false;
    }
  };

  //Read - get
  const getFixed = async () => {
    try {
      const userId = authState.userId;
      const query = userId ? `?userId=${userId}` : '';
      const res = await axios.get(BASE_URL + `fixed_expense_settings${query}`);

      if (res.status === 200) {
        fixedExpenseSetting.value = res.data;
        return true;
      }
      console.log('고정지출 조회 실패');
      return false;
    } catch (e) {
      console.log('고정지출 조회 실패 : ', e);
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
      console.log('고정지출 설정 수정 실패');
      return false;
    } catch (e) {
      console.log('고정지출 설정 수정 실패:', e);
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
      console.log('고정지출 정보 삭제 실패');
      return false;
    } catch (e) {
      console.log('고정지출 정보 삭제 : ', e);
      return false;
    }
  };

  //----------------------------------------------------------------------------

  //월별 총 소비 수익 합계
  const getMonthlySummary = (monthKey) => {
    const monthItems = transactions.value.filter(
      (transaction) => toMonthKey(transaction.date) === monthKey,
    );

    let income = 0;
    let expense = 0;

    monthItems.forEach((tx) => {
      const isExpense = tx.isExpense === true;
      const amount = Number(tx.amount || 0);
      if (isExpense) expense += amount;
      else income += amount;
    });

    return {
      income,
      expense,
      balance: income - expense,
      count: monthItems.length,
    };
  };

  //월별 카테고리별 지출 메서드
  const getMonthlyExpensesByCategory = (monthKey) => {
    const totals = {};

    transactions.value
      .filter((transaction) => {
        return (
          toMonthKey(transaction.date) === monthKey &&
          transaction.isExpense === true
        );
      })
      .forEach((transaction) => {
        const categoryName =
          getCategoryById(transaction.categoryId)?.name || '기타';
        totals[categoryName] = (totals[categoryName] || 0) + transaction.amount;
      });

    return totals;
  };

  //예산 임시 매서드 예산 연동 후 삭제 예정
  const monthlyBudgetTarget = computed(() => {
    const expenseIds = (categories?.expense || []).map((item) => item.id);
    const sourceBudgets =
      typeof state !== 'undefined' && state?.categoryBudgets
        ? state.categoryBudgets
        : {};

    const budgetSum = expenseIds.reduce(
      (sum, id) => sum + Number(sourceBudgets[id] || 0),
      0,
    );

    if (budgetSum > 0) {
      return budgetSum;
    }

    return fixedExpenseSetting.value.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );
  });

  return {
    state,
    transactions,
    fixedExpenseSetting,
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
    getTransactionsByDate,
    getTransactionsByMonth,
    getDailyTotals,
    putTransaction,
    deleteTransaction,
    postFixed,
    getFixed,
    putFixed,
    deleteFixed,
    setCurrentMonth,
    setSelectedDate,
    setViewMode,
    setFilter,
    resetFilter,
    currentMonthMaxAmount,
    getMonthlySummary,
    monthlyBudgetTarget,
    getMonthlyExpensesByCategory,
  };
});
