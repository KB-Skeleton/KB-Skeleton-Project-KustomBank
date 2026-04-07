import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "../views/DashboardView.vue";
import MonthlySpendingView from "../views/MonthlySpendingView.vue";
import InvestmentView from "../views/InvestmentView.vue";
import StatisticsView from "../views/StatisticsView.vue";
import BudgetView from "../views/BudgetView.vue";
import ProfileView from "../views/ProfileView.vue";
import FixedExpenseView from "../views/FixedExpenseView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "dashboard", component: DashboardView },
    {
      path: "/monthly-spending",
      name: "monthly-spending",
      component: MonthlySpendingView,
    },
    { path: "/investment", name: "investment", component: InvestmentView },
    { path: "/statistics", name: "statistics", component: StatisticsView },
    { path: "/budget", name: "budget", component: BudgetView },
    { path: "/profile", name: "profile", component: ProfileView },
    {
      path: "/fixed-expenses",
      name: "fixed-expenses",
      component: FixedExpenseView,
    },
    { path: "/calendar", redirect: "/monthly-spending" },
  ],
});

export default router;
