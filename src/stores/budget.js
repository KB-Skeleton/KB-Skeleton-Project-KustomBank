import { defineStore } from 'pinia';
import axios from 'axios';
import { useFinanceStore } from './finance';
import { useAuthStores } from './auth';

const BASE_URL = 'http://localhost:3000';

export const useBudgetStores = defineStore('budgetStore', () => {
  // budget API: 전체 조회 (budget 전용)
  const getAllBudgetsApi = async () => {
    const { data } = await axios.get(`${BASE_URL}/budgets`, {
      params: { _t: Date.now() },
    });
    return Array.isArray(data) ? data : [];
  };

  // budget API: 사용자 1건 조회 (budget 전용)
  const getBudgetByUserId = async (userId) => {
    const normalizedUserId = String(userId || '').trim();
    const { data } = await axios.get(`${BASE_URL}/budgets`, {
      params: { userId: normalizedUserId, _t: Date.now() },
    });
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }
    return data[data.length - 1];
  };

  // budget API: 화면에서 사용할 활성 예산 1건 조회
  const getActiveBudgetByUserId = async (userId) => {
    const normalizedUserId = String(userId || '').trim();
    const budget = await getBudgetByUserId(normalizedUserId);
    if (budget) {
      return budget;
    }

    const allBudgets = await getAllBudgetsApi();
    return Array.isArray(allBudgets) && allBudgets.length > 0
      ? allBudgets[allBudgets.length - 1]
      : null;
  };

  // 카테고리 예산 합산 (budget 전용)
  const sumCategoryBudgets = (categoryBudgets = {}) => {
    return Object.values(categoryBudgets || {}).reduce((sum, value) => {
      const parsed = Number(value || 0);
      return Number.isFinite(parsed) ? sum + parsed : sum;
    }, 0);
  };

  // 카테고리 일괄 수정 (budget 전용)
  const updateBudgetByUserId = async (userId, categoryBudgets) => {
    const budget = await getActiveBudgetByUserId(userId);
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

  // 단일 카테고리 예산 수정 (budget 전용)
  const patchCategoryBudgetByUserId = async (userId, categoryId, amount) => {
    const budget = await getActiveBudgetByUserId(userId);
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

  // 예산/사용, 사용률 . 남은금액  (budget 전용)
  const buildCategoryBudgetRows = async (userId, monthKey) => {
    const financeStore = useFinanceStore();
    // finance의 userid를 우선 사용, 없다면 auth id 사용
    const currentUserId =
      financeStore?.authStore?.userId || useAuthStores()?.userId;
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
            return Array.isArray(financeStore.transactions)
              ? financeStore.transactions
              : [];
          })()
        : (async () => {
            const { data } = await axios.get(`${BASE_URL}/transactions`, {
              params: { userId: normalizedUserId, _t: Date.now() },
            });
            return Array.isArray(data) ? data : [];
          })();

    const [budget, transactions] = await Promise.all([
      getActiveBudgetByUserId(normalizedUserId),
      transactionsPromise,
    ]);

    const txList = Array.isArray(transactions) ? transactions : [];
    const sortedMonthKeys = txList
      .map((item) => financeStore.toMonthKey(item?.date))
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a));
    const targetMonthKey = String(monthKey || sortedMonthKeys[0] || '');

    const monthlyExpenses = txList.filter(
      (item) =>
        item?.isExpense === true &&
        financeStore.toMonthKey(item?.date) === targetMonthKey,
    );

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

  return {
    getAllBudgetsApi,
    getBudgetByUserId,
    getActiveBudgetByUserId,
    sumCategoryBudgets,
    updateBudgetByUserId,
    patchCategoryBudgetByUserId,
    buildCategoryBudgetRows,
  };
});
