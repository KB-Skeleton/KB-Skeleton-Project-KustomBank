// Statistics 페이지에서 자주 사용되는 로직을 methods로 구현해 재사용성 용이

import { defineStore } from 'pinia';
import { useFinanceStore } from './finance';

export const useStatisticsStore = defineStore('statisticsStore', () => {
  const financeStore = useFinanceStore();

  // 통계에서 사용: 기준 월 기준 현재/전달 월 키 계산
  const getMonthKeys = (baseMonthKey) => {
    const targetMonthKey = String(
      baseMonthKey || financeStore.getCurrentMonthKey,
    );
    const [yearText, monthText] = targetMonthKey.split('-');
    const baseYear = Number(yearText);
    const baseMonth = Number(monthText);

    if (!Number.isFinite(baseYear) || !Number.isFinite(baseMonth)) {
      return {
        currentMonthKey: String(financeStore.getCurrentMonthKey),
        previousMonthKey: '',
      };
    }

    const currentDate = new Date(baseYear, baseMonth - 1, 1);
    const previousDate = new Date(baseYear, baseMonth - 2, 1);
    const currentMonthKey = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1,
    ).padStart(2, '0')}`;
    const previousMonthKey = `${previousDate.getFullYear()}-${String(
      previousDate.getMonth() + 1,
    ).padStart(2, '0')}`;

    return { currentMonthKey, previousMonthKey };
  };

  // 통계에서 사용: 거래 데이터 최신화(공통 재사용)
  const ensureStatisticsData = async () => {
    await financeStore.getTransaction();
    return true;
  };

  // 통계에서 사용: 기준 월의 최고 지출 카테고리 반환
  const getTopExpenseCategory = (monthKey) => {
    const categoryMap = financeStore.getMonthlyExpensesByCategory(monthKey);
    const entries = Object.entries(categoryMap);

    if (!entries.length) {
      return '데이터 없음';
    }

    const [categoryName] = entries.sort(
      (a, b) => Number(b[1] || 0) - Number(a[1] || 0),
    )[0];
    return categoryName;
  };

  // 통계에서 사용: 전달 대비 지출 증감 반환
  const getExpenseDiff = (currentMonthKey, previousMonthKey) => {
    const currentSummary = financeStore.getMonthlySummary(currentMonthKey);
    const previousSummary = financeStore.getMonthlySummary(previousMonthKey);
    return (
      Number(currentSummary.expense || 0) - Number(previousSummary.expense || 0)
    );
  };

  // 통계에서 사용: 기준 월 포함 최근 N개월 월별 지출 추이 반환
  const getMonthlyExpenseTrend = (baseMonthKey, months = 6) => {
    const targetMonthKey = String(
      baseMonthKey || financeStore.getCurrentMonthKey,
    );
    const [yearText, monthText] = targetMonthKey.split('-');
    const baseYear = Number(yearText);
    const baseMonth = Number(monthText);

    if (!Number.isFinite(baseYear) || !Number.isFinite(baseMonth)) {
      return [];
    }

    const count = Math.max(1, Number(months || 6));
    const result = [];
    const txList = Array.isArray(financeStore.transactions)
      ? financeStore.transactions
      : [];

    for (let i = 0; i < count; i += 1) {
      const currentDate = new Date(baseYear, baseMonth - 1 - i, 1);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;

      const expense = txList
        .filter(
          (transaction) =>
            financeStore.toMonthKey(transaction.date) === monthKey &&
            transaction.isExpense === true,
        )
        .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

      result.push({ month: monthKey, expense });
    }

    return result.reverse();
  };

  // 통계에서 사용: 막대 그래프용 추이 데이터와 최대값 반환
  const getMonthlyComparisonChartData = (baseMonthKey, months = 6) => {
    const trend = getMonthlyExpenseTrend(baseMonthKey, months);
    const maxExpense = trend.length
      ? Math.max(...trend.map((item) => Number(item.expense || 0)), 1)
      : 1;

    return { trend, maxExpense };
  };

  // 통계에서 사용: 전달 대비 이번 달 카테고리별 지출 비교
  const getCategoryComparisonWithPrevious = (monthKey) => {
    const { currentMonthKey, previousMonthKey } = getMonthKeys(monthKey);
    const currentMap =
      financeStore.getMonthlyExpensesByCategory(currentMonthKey);
    const previousMap =
      financeStore.getMonthlyExpensesByCategory(previousMonthKey);

    const categorySet = new Set([
      ...Object.keys(currentMap),
      ...Object.keys(previousMap),
    ]);

    const rows = Array.from(categorySet).map((category) => {
      const current = Number(currentMap[category] || 0);
      const previous = Number(previousMap[category] || 0);
      const diff = current - previous;

      return {
        category,
        current,
        previous,
        diff,
      };
    });

    return rows.sort((a, b) => b.current - a.current);
  };

  // 통계에서 사용: 카테고리별 전달 대비 비교 행 반환(별칭)
  const getCategoryComparisonRows = (monthKey) =>
    getCategoryComparisonWithPrevious(monthKey);

  return {
    getMonthKeys,
    ensureStatisticsData,
    getTopExpenseCategory,
    getExpenseDiff,
    getMonthlyExpenseTrend,
    getMonthlyComparisonChartData,
    getCategoryComparisonWithPrevious,
    getCategoryComparisonRows,
  };
});
