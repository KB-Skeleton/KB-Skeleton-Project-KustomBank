import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "../views/DashboardView.vue";
import CalendarView from "../views/CalendarView.vue";
import InvestmentView from "../views/InvestmentView.vue";
import StatisticsView from "../views/StatisticsView.vue";
import BudgetView from "../views/BudgetView.vue";
import ProfileView from "../views/ProfileView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: DashboardView,
    },
    {
      path: "/calendar",
      name: "calendar",
      component: CalendarView,
    },
    {
      path: "/investment",
      name: "investment",
      component: InvestmentView,
    },
    {
      path: "/statistics",
      name: "statistics",
      component: StatisticsView,
    },
    {
      path: "/budget",
      name: "budget",
      component: BudgetView,
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfileView,
    },
  ],
});

export default router;

