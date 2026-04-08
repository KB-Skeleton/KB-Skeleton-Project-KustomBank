import { computed, reactive } from "vue";

const EXPENSE_CATEGORY_NAMES = [
  "식비",
  "교통비",
  "여가/취미",
  "미용/쇼핑",
  "의료/건강",
  "교육/자기계발",
  "기타",
];

const INCOME_CATEGORY_NAMES = ["급여", "부수입", "이자/배당"];

const categories = [
  { id: 1, name: "식비", type: "expense" },
  { id: 2, name: "교통비", type: "expense" },
  { id: 3, name: "여가/취미", type: "expense" },
  { id: 4, name: "미용/쇼핑", type: "expense" },
  { id: 5, name: "의료/건강", type: "expense" },
  { id: 6, name: "교육/자기계발", type: "expense" },
  { id: 7, name: "기타", type: "expense" },
  { id: 101, name: "급여", type: "income" },
  { id: 102, name: "부수입", type: "income" },
  { id: 103, name: "이자/배당", type: "income" },
  { id: 104, name: "용돈", type: "income" },
  { id: 105, name: "기타", type: "income" },
];

const fixedPlans = [
  { id: 1, title: "월세", amount: 620000, categoryId: 7, dueDay: 5 },
  { id: 2, title: "통신비", amount: 85000, categoryId: 7, dueDay: 10 },
  { id: 3, title: "보험료", amount: 140000, categoryId: 5, dueDay: 12 },
  { id: 4, title: "OTT", amount: 17000, categoryId: 3, dueDay: 15 },
];

const state = reactive({
  userId: "user01",
  categories,
  categoryBudgets: {
    1: 520000,
    2: 200000,
    3: 260000,
    4: 340000,
    5: 180000,
    6: 220000,
    7: 280000,
  },
  fixedPlans,
  transactions: [
    {
      id: 1,
      userId: "user01",
      amount: 3500000,
      date: "2026-04-01",
      categoryId: 101,
      description: "4월 월급",
      type: "income",
      isFixed: false,
      isRequired: true,
    },
    {
      id: 4,
      userId: "user01",
      amount: 5900,
      date: "2026-04-02",
      categoryId: 1,
      description: "스타벅스 라떼",
      type: "expense",
      isFixed: false,
      isRequired: false,
    },
    {
      id: 5,
      userId: "user01",
      amount: 1400,
      date: "2026-04-02",
      categoryId: 2,
      description: "지하철",
      type: "expense",
      isFixed: false,
      isRequired: true,
    },
    {
      id: 6,
      userId: "user01",
      amount: 42300,
      date: "2026-04-03",
      categoryId: 4,
      description: "생활용품 쇼핑",
      type: "expense",
      isFixed: false,
      isRequired: false,
    },
    {
      id: 7,
      userId: "user01",
      amount: 280000,
      date: "2026-04-03",
      categoryId: 102,
      description: "프리랜서 디자인",
      type: "income",
      isFixed: false,
      isRequired: true,
    },
    {
      id: 8,
      userId: "user01",
      amount: 17000,
      date: "2026-04-15",
      categoryId: 3,
      description: "넷플릭스",
      type: "expense",
      isFixed: true,
      isRequired: false,
    },
    {
      id: 9,
      userId: "user01",
      amount: 11000,
      date: "2026-04-07",
      categoryId: 1,
      description: "점심 식사",
      type: "expense",
      isFixed: false,
      isRequired: true,
    },
    {
      id: 10,
      userId: "user01",
      amount: 18200,
      date: "2026-04-07",
      categoryId: 2,
      description: "택시",
      type: "expense",
      isFixed: false,
      isRequired: false,
    },
    {
      id: 11,
      userId: "user01",
      amount: 97000,
      date: "2026-03-12",
      categoryId: 5,
      description: "치과 치료",
      type: "expense",
      isFixed: false,
      isRequired: true,
    },
    {
      id: 12,
      userId: "user01",
      amount: 156000,
      date: "2026-03-25",
      categoryId: 4,
      description: "봄 옷 쇼핑",
      type: "expense",
      isFixed: false,
      isRequired: false,
    },
    {
      id: 13,
      userId: "user01",
      amount: 2140000,
      date: "2026-03-01",
      categoryId: 101,
      description: "3월 월급",
      type: "income",
      isFixed: false,
      isRequired: true,
    },
    {
      id: 14,
      userId: "user01",
      amount: 80000,
      date: "2026-02-11",
      categoryId: 2,
      description: "교통카드 충전",
      type: "expense",
      isFixed: false,
      isRequired: true,
    },
  ],
});

const toMonthKey = (dateString) => dateString.slice(0, 7);
const toDate = (value) => new Date(`${value}T00:00:00`);

const formatCurrency = (amount) =>
  new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const getCategoryById = (categoryId) =>
  state.categories.find((category) => category.id === Number(categoryId)) ||
  null;

const normalizeTransaction = (transaction) => {
  const category = getCategoryById(transaction.categoryId);
  return {
    ...transaction,
    categoryName: category?.name || "기타",
    title: transaction.description,
    category: category?.name || "기타",
    note: transaction.isFixed ? "고정지출" : "변동지출",
  };
};

const sortedTransactions = computed(() =>
  [...state.transactions]
    .sort((a, b) => toDate(b.date) - toDate(a.date))
    .map(normalizeTransaction),
);

const monthlyBudgetTarget = computed(() =>
  EXPENSE_CATEGORY_NAMES.reduce((sum, name) => {
    const category = state.categories.find((item) => item.name === name);
    return sum + Number(state.categoryBudgets[category?.id] || 0);
  }, 0),
);

const getMonthlySummary = (monthKey) => {
  const monthItems = state.transactions.filter(
    (transaction) => toMonthKey(transaction.date) === monthKey,
  );

  const income = monthItems
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expense = monthItems
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    income,
    expense,
    balance: income - expense,
    count: monthItems.length,
  };
};

const getMonthlyExpensesByCategory = (monthKey) => {
  const totals = {};

  state.transactions
    .filter(
      (transaction) =>
        toMonthKey(transaction.date) === monthKey &&
        transaction.type === "expense",
    )
    .forEach((transaction) => {
      const categoryName =
        getCategoryById(transaction.categoryId)?.name || "기타";
      totals[categoryName] = (totals[categoryName] || 0) + transaction.amount;
    });

  return totals;
};

const getDailyTotals = (monthKey) => {
  const totals = {};

  state.transactions
    .filter((transaction) => toMonthKey(transaction.date) === monthKey)
    .forEach((transaction) => {
      if (!totals[transaction.date]) {
        totals[transaction.date] = { income: 0, expense: 0 };
      }
      totals[transaction.date][transaction.type] += transaction.amount;
    });

  return totals;
};

const getTransactionsByDate = (dateString) =>
  sortedTransactions.value.filter(
    (transaction) => transaction.date === dateString,
  );

const getTransactionsByMonth = (monthKey) =>
  sortedTransactions.value.filter(
    (transaction) => toMonthKey(transaction.date) === monthKey,
  );

const getFixedExpenseSummary = (monthKey) => {
  const totalFixed = state.fixedPlans.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const spentFixed = state.transactions
    .filter(
      (item) =>
        item.type === "expense" &&
        item.isFixed &&
        toMonthKey(item.date) === monthKey,
    )
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    totalFixed,
    spentFixed,
    availableFixed: totalFixed - spentFixed,
    usage: totalFixed ? Math.round((spentFixed / totalFixed) * 100) : 0,
  };
};

const getFixedTransactionsByMonth = (monthKey) =>
  sortedTransactions.value.filter(
    (item) =>
      item.isFixed &&
      item.type === "expense" &&
      toMonthKey(item.date) === monthKey,
  );

const addTransaction = ({
  type,
  amount,
  date,
  categoryId,
  description,
  userId,
  isFixed = false,
}) => {
  const nextId =
    state.transactions.reduce((max, item) => Math.max(max, item.id), 0) + 1;

  const normalizedAmount = Number(amount);
  const normalizedCategoryId = Number(categoryId);
  const normalizedIsFixed = Boolean(isFixed);

  state.transactions.push({
    id: nextId,
    userId: userId || state.userId,
    type,
    amount: normalizedAmount,
    date,
    categoryId: normalizedCategoryId,
    description,
    isFixed: normalizedIsFixed,
    isRequired: false,
  });

  if (type === "expense" && normalizedIsFixed) {
    const nextPlanId =
      state.fixedPlans.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const dueDay = Number(date.slice(-2));

    const duplicate = state.fixedPlans.find(
      (plan) =>
        plan.title === description &&
        plan.amount === normalizedAmount &&
        plan.categoryId === normalizedCategoryId,
    );

    if (!duplicate) {
      state.fixedPlans.push({
        id: nextPlanId,
        title: description,
        amount: normalizedAmount,
        categoryId: normalizedCategoryId,
        dueDay,
      });
    }
  }
};

const updateTransaction = (id, payload) => {
  const index = state.transactions.findIndex(
    (transaction) => transaction.id === id,
  );
  if (index === -1) {
    return false;
  }

  state.transactions[index] = {
    ...state.transactions[index],
    ...payload,
    amount: Number(payload.amount ?? state.transactions[index].amount),
    categoryId: Number(
      payload.categoryId ?? state.transactions[index].categoryId,
    ),
  };
  return true;
};

const deleteTransaction = (id) => {
  const index = state.transactions.findIndex(
    (transaction) => transaction.id === id,
  );
  if (index === -1) {
    return false;
  }
  state.transactions.splice(index, 1);
  return true;
};

const buildRecentMonthKeys = (currentMonth) => {
  const [year, month] = currentMonth.split("-").map(Number);
  return Array.from({ length: 6 }).map((_, idx) => {
    const date = new Date(year, month - 1 - (5 - idx), 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
};

const getMonthlyExpenseTrend = (currentMonth) =>
  buildRecentMonthKeys(currentMonth).map((month) => ({
    month,
    expense: getMonthlySummary(month).expense,
  }));

const expenseCategories = computed(() =>
  state.categories.filter((category) => category.type === "expense"),
);
const incomeCategories = computed(() =>
  state.categories.filter((category) => category.type === "income"),
);

const getBudgetRows = (monthKey) => {
  const monthlyCategorySpend = getMonthlyExpensesByCategory(monthKey);

  return EXPENSE_CATEGORY_NAMES.map((name) => {
    const category = state.categories.find((item) => item.name === name);
    const budget = Number(state.categoryBudgets[category?.id] || 0);
    const spent = Number(monthlyCategorySpend[name] || 0);
    const usage = budget ? Math.round((spent / budget) * 100) : 0;

    return {
      categoryId: category?.id,
      category: name,
      budget,
      spent,
      usage,
      remain: budget - spent,
    };
  });
};

const updateCategoryBudget = (categoryId, amount) => {
  state.categoryBudgets[categoryId] = Number(amount) || 0;
};

const updateCategoryBudgetsBulk = (payload) => {
  Object.entries(payload).forEach(([key, value]) => {
    state.categoryBudgets[key] = Number(value) || 0;
  });
};

export function useFinanceStore() {
  return {
    state,
    expenseCategories,
    incomeCategories,
    monthlyBudgetTarget,
    sortedTransactions,
    formatCurrency,
    getCategoryById,
    getMonthlySummary,
    getMonthlyExpensesByCategory,
    getDailyTotals,
    getTransactionsByDate,
    getTransactionsByMonth,
    getFixedExpenseSummary,
    getFixedTransactionsByMonth,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getMonthlyExpenseTrend,
    getBudgetRows,
    updateCategoryBudget,
    updateCategoryBudgetsBulk,
  };
}
