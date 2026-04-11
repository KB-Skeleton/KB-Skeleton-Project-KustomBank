import { defineStore } from 'pinia';
import axios from 'axios';
import { useFinanceStore } from './finance';
import { useAuthStores } from './auth';

const BASE_URL = 'http://localhost:3000';

export const useBudgetStores = defineStore('budgetStore', () => {
  // 카테고리 예산 합산 (budget 전용)
  const sumCategoryBudgets = (categoryBudgets = {}) => {
    return Object.values(categoryBudgets || {}).reduce((sum, value) => {
      const parsed = Number(value || 0);
      return Number.isFinite(parsed) ? sum + parsed : sum;
    }, 0);
  };

  // 예산/사용, 사용률 . 남은금액  (budget 전용)
  const buildCategoryBudgetRows = async (userId, monthKey) => {
    const financeStore = useFinanceStore();
    // finance의 userid를 우선 사용, 없다면 auth id 사용
    const currentUserId =
      financeStore?.authState?.userId || useAuthStores()?.authState?.userId;
    const normalizedUserId = String(userId || currentUserId).trim();

    const expenseCategories = Array.isArray(financeStore?.categories?.expense)
      ? financeStore.categories.expense
          .filter((category) => category.id !== 'exp_fixed')
          .map((category) => ({ id: category.id, name: category.name }))
      : [];

    const transactionsPromise =
      normalizedUserId === String(currentUserId)
        ? (async () => {
            await financeStore.getTransaction();
            if (Array.isArray(financeStore.transactions)) {
              return financeStore.transactions;
            }
            return Array.isArray(financeStore.transactions?.value)
              ? financeStore.transactions.value
              : [];
          })()
        : (async () => {
            const { data } = await axios.get(`${BASE_URL}/transactions`, {
              params: { userId: normalizedUserId, _t: Date.now() },
            });
            return Array.isArray(data) ? data : [];
          })();

    const [budget, transactions] = await Promise.all([
      getBudget(normalizedUserId),
      transactionsPromise,
    ]);

    const txList = Array.isArray(transactions) ? transactions : [];
    const sortedMonthKeys = txList
      .map((item) => financeStore.toMonthKey(item?.date))
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a));
    const targetMonthKey = String(monthKey || sortedMonthKeys[0] || '');

    const monthlyExpenses = txList.filter((item) => {
      const isExpense =
        item?.isExpense === true || String(item?.type || '') === 'expense';
      return (
        isExpense && financeStore.toMonthKey(item?.date) === targetMonthKey
      );
    });

    const spentByCategory = {};
    monthlyExpenses.forEach((item) => {
      const categoryId = String(item?.categoryId || '');
      spentByCategory[categoryId] =
        Number(spentByCategory[categoryId] || 0) + Number(item?.amount || 0);
    });

    const categoryBudgets = budget?.categoryBudgets || {};
    const rows = expenseCategories.map((category) => {
      const categoryId = String(category.id);
      const budgetAmount = Number(categoryBudgets[categoryId] || 0);
      const spentAmount = Number(spentByCategory[categoryId] || 0);
      const usage = budgetAmount
        ? Math.round((spentAmount / budgetAmount) * 100)
        : 0;

      return {
        categoryId,
        category: category.name,
        budget: budgetAmount,
        spent: spentAmount,
        usage,
        remain: budgetAmount - spentAmount,
      };
    });

    return {
      monthKey: targetMonthKey,
      rows,
    };
  };

  // Budgets의 CRUD -----------------------------
  // budget에서의 GET
  const getBudget = async (userId) => {
    try {
      const normalizedUserId = String(userId || '').trim();
      const { data } = await axios.get(
        `${BASE_URL}/budgets?userId=${normalizedUserId}`,
      );

      if (Array.isArray(data) && data.length > 0) {
        return data[data.length - 1];
      }
      return null;
    } catch (error) {
      console.error('예산 조회 실패:', error);
      return null;
    }
  };

  // budget에서의 PUT(카테고리 예산 일괄 수정)
  const updateBudgetByUserId = async (userId, categoryBudgets) => {
    const budget = await getBudget(userId);
    if (!budget || budget.id === undefined || budget.id === null) {
      throw new Error('예산 데이터가 없어 PUT 업데이트를 수행할 수 없습니다.');
    }

    const payload = {
      ...budget,
      userId: String(userId || '').trim(),
      categoryBudgets: { ...(categoryBudgets || {}) },
    };
    const { data } = await axios.put(
      `${BASE_URL}/budgets/${encodeURIComponent(budget.id)}`,
      payload,
    );
    return data;
  };

  // budget에서의 PATCH (단일 카테고리 예산 수정)
  const patchCategoryBudgetByUserId = async (userId, categoryId, amount) => {
    const budget = await getBudget(userId);
    if (!budget || budget.id === undefined || budget.id === null) {
      throw new Error(
        '예산 데이터가 없어 PATCH 업데이트를 수행할 수 없습니다.',
      );
    }

    const nextCategoryBudgets = {
      ...(budget.categoryBudgets || {}),
      [categoryId]: Number(amount || 0),
    };

    const { data } = await axios.patch(
      `${BASE_URL}/budgets/${encodeURIComponent(budget.id)}`,
      { categoryBudgets: nextCategoryBudgets },
    );
    return data;
  };

  return {
    sumCategoryBudgets,
    buildCategoryBudgetRows,
    // budget의 get, put, patch
    getBudget,
    updateBudgetByUserId,
    patchCategoryBudgetByUserId,
  };
});
