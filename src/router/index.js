import { createRouter, createWebHistory } from "vue-router";
import StatisticsView from "../views/StatisticsView.vue";
import BudgetView from "../views/BudgetView.vue";
import CalendarView from "@/views/CalendarView.vue";
import DashBoardView from "@/views/DashBoardView.vue";
import FixedExpensesView from "@/views/FixedExpensesView.vue";
import InvestmentView from "../views/InvestmentView.vue";
import LogInOut from "@/views/LogInOut.vue";
import MonthlyTransactionView from "@/views/MonthlyTransactionView.vue";
import ProfileView from "../views/ProfileView.vue";
import BeRequiredView from "@/views/BeRequiredView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "dashboard", component: DashBoardView },
    {
      path: "/monthly-spending",
      name: "monthly-spending",
      component: MonthlyTransactionView,
    },
    { path: "/investment", name: "investment", component: InvestmentView },
    { path: "/beRequired", name: "beRequired", component: BeRequiredView }, //불필요한 지출 페이지 추가 #2
    { path: "/statistics", name: "statistics", component: StatisticsView },
    { path: "/budget", name: "budget", component: BudgetView },
    { path: "/profile", name: "profile", component: ProfileView },
    {
      path: "/fixed-expenses",
      name: "fixed-expenses",
      component: FixedExpensesView,
    },
    { path: "/calendar", redirect: "/monthly-spending" },
  ],
});

export default router;
