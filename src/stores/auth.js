import { defineStore } from "pinia";

export const useAuthStores = defineStore("authStore", {
  state: () => ({
    id: 0,
    userId: "user123",
    email: "",
    password: "",
    name: "",
    phone: "",
  }),
  getters: {},
  actions: {},
});
