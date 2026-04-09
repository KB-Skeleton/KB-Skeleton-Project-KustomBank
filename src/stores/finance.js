import { computed, reactive } from 'vue';

const state = reactive({
  userId: 'user123',
  categories: { expense: [], income: [] },
  budgets: [],
  transactions: [],
  fixed_expense_settings: [],
});

/**
 * 유틸
 */
const toMonthKey = (date) => date.slice(0, 7);

const formatCurrency = (amount) =>
  new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount || 0);

/**
 * 카테고리 조회
 */
const getCategoryById = (id) => {
  return (
    state.categories.expense.find((c) => c.id === id) ||
    state.categories.income.find((c) => c.id === id)
  );
};

/**
 * 전체 예산 (합계)
 */
const monthlyBudgetTarget = computed(() => {
  return Object.values(state.budgets.categoryBudgets).reduce(
    (sum, v) => sum + Number(v || 0),
    0,
  );
});

/**
 * 월 요약
 */
const getMonthlySummary = (monthKey) => {
  const list = state.transactions.filter(
    (t) => toMonthKey(t.date) === monthKey,
  );

  const income = list
    .filter((t) => !t.isExpense)
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = list
    .filter((t) => t.isExpense)
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    income,
    expense,
    balance: income - expense,
  };
};

/**
 * 카테고리별 지출
 */
const getMonthlyExpensesByCategory = (monthKey) => {
  const result = {};

  state.transactions
    .filter((t) => t.isExpense && toMonthKey(t.date) === monthKey)
    .forEach((t) => {
      result[t.categoryId] = (result[t.categoryId] || 0) + t.amount;
    });

  return result;
};

/**

 */
const getBudgetRows = (monthKey) => {
  const spendMap = getMonthlyExpensesByCategory(monthKey);

  return state.categories.expense.map((cat) => {
    const budget = Number(state.budgets.categoryBudgets[cat.id] || 0);

    const spent = Number(spendMap[cat.id] || 0);

    const usage = budget ? Math.round((spent / budget) * 100) : 0;

    return {
      categoryId: cat.id,
      category: cat.name,
      budget,
      spent,
      usage,
      remain: budget - spent,
    };
  });
};

/**
 * 단일 수정
 */
const updateCategoryBudget = (categoryId, amount) => {
  state.budgets.categoryBudgets[categoryId] = Number(amount) || 0;
};

/**
 * 일괄 수정
 */
const updateCategoryBudgetsBulk = (payload) => {
  Object.entries(payload).forEach(([key, value]) => {
    state.budgets.categoryBudgets[key] = Number(value) || 0;
  });
};

export function useFinanceStore() {
  return {
    state,
    formatCurrency,
    monthlyBudgetTarget,
    getMonthlySummary,
    getBudgetRows,
    updateCategoryBudget,
    updateCategoryBudgetsBulk,
  };
}
