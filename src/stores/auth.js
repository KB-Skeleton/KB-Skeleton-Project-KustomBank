import { reactive, ref } from "vue";
import { defineStore } from "pinia";

export const useAuthStores = defineStore("authStore", () => {
  const authState = reactive({
    id: "",
    userId: "",
    email: "",
    password: "",
    name: "",
    phone: "",
  });

  return {
    authState,
  };
});
