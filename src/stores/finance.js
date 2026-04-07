import { computed, reactive } from "vue";

const state = reactive({
  monthlyBudgetTarget: 2500000,
  categoryBudgets: {
    식비: 600000,
    교통: 180000,
    쇼핑: 450000,
    주거: 900000,
    여가: 220000,
    기타: 150000,
  },
  transactions: [
    {
      id: 1,
      date: "2026-04-01",
      title: "월급",
      category: "급여",
      type: "income",
      amount: 3500000,
      note: "4월 급여",
    },
    {
      id: 2,
      date: "2026-04-02",
      title: "스타벅스",
      category: "식비",
      type: "expense",
      amount: 5900,
      note: "아이스 라떼",
    },
    {
      id: 3,
      date: "2026-04-02",
      title: "지하철",
      category: "교통",
      type: "expense",
      amount: 1400,
      note: "출근",
    },
    {
      id: 4,
      date: "2026-04-03",
      title: "쿠팡",
      category: "쇼핑",
      type: "expense",
      amount: 42300,
      note: "생활용품",
    },
    {
      id: 5,
      date: "2026-04-03",
      title: "프리랜서 수입",
      category: "부수입",
      type: "income",
      amount: 280000,
      note: "디자인 작업",
    },
    {
      id: 6,
      date: "2026-04-04",
      title: "관리비",
      category: "주거",
      type: "expense",
      amount: 160000,
      note: "아파트 관리비",
    },
    {
      id: 7,
      date: "2026-04-05",
      title: "넷플릭스",
      category: "여가",
      type: "expense",
      amount: 17000,
      note: "정기결제",
    },
    {
      id: 8,
      date: "2026-04-06",
      title: "편의점",
      category: "식비",
      type: "expense",
      amount: 12800,
      note: "간식",
    },
    {
      id: 9,
      date: "2026-04-07",
      title: "점심",
      category: "식비",
      type: "expense",
      amount: 11000,
      note: "회사 근처",
    },
    {
      id: 10,
      date: "2026-04-07",
      title: "택시",
      category: "교통",
      type: "expense",
      amount: 18200,
      note: "야근 귀가",
    },
    {
      id: 11,
      date: "2026-03-05",
      title: "외식",
      category: "식비",
      type: "expense",
      amount: 53000,
      note: "가족모임",
    },
    {
      id: 12,
      date: "2026-03-13",
      title: "전기요금",
      category: "주거",
      type: "expense",
      amount: 96000,
      note: "자동이체",
    },
    {
      id: 13,
      date: "2026-03-22",
      title: "주말 쇼핑",
      category: "쇼핑",
      type: "expense",
      amount: 185000,
      note: "옷 구매",
    },
    {
      id: 14,
      date: "2026-02-11",
      title: "교통카드 충전",
      category: "교통",
      type: "expense",
      amount: 80000,
      note: "월 충전",
    },
  ],
});

const toMonthKey = (dateString) => dateString.slice(0, 7);

const formatCurrency = (amount) =>
  new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);

const sortedTransactions = computed(() =>
  [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)),
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
        toMonthKey(transaction.date) === monthKey && transaction.type === "expense",
    )
    .forEach((transaction) => {
      totals[transaction.category] = (totals[transaction.category] || 0) + transaction.amount;
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
  sortedTransactions.value.filter((transaction) => transaction.date === dateString);

const updateTransaction = (id, payload) => {
  const index = state.transactions.findIndex((transaction) => transaction.id === id);
  if (index === -1) {
    return false;
  }

  state.transactions[index] = {
    ...state.transactions[index],
    ...payload,
    amount: Number(payload.amount ?? state.transactions[index].amount),
  };

  return true;
};

const deleteTransaction = (id) => {
  const index = state.transactions.findIndex((transaction) => transaction.id === id);
  if (index === -1) {
    return false;
  }

  state.transactions.splice(index, 1);
  return true;
};

const monthlySeries = [
  { month: "2025-11", expense: 1890000 },
  { month: "2025-12", expense: 2010000 },
  { month: "2026-01", expense: 1730000 },
  { month: "2026-02", expense: 1840000 },
  { month: "2026-03", expense: 2160000 },
  { month: "2026-04", expense: 0 },
];

const getMonthlyExpenseTrend = (currentMonth) => {
  const currentExpense = getMonthlySummary(currentMonth).expense;
  return monthlySeries.map((item) =>
    item.month === currentMonth ? { ...item, expense: currentExpense } : item,
  );
};

export function useFinanceStore() {
  return {
    state,
    sortedTransactions,
    formatCurrency,
    getMonthlySummary,
    getMonthlyExpensesByCategory,
    getDailyTotals,
    getTransactionsByDate,
    updateTransaction,
    deleteTransaction,
    getMonthlyExpenseTrend,
  };
}

