import { defineStore } from "pinia";

export const useAuthStores = defineStore("authStore", {
  state: () => ({
    userId: "",
    email: "",
    password: "",
    name: "",
    phone: "",
  }),
  getters: {},
  actions: {},
});
