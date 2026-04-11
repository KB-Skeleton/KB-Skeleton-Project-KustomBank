import { computed, reactive, ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";

const BASE_URL = "http://localhost:3000";
const ACCESS_TOKEN_KEY = "accessToken";
const AUTH_USER_KEY = "authUser";
const DEV_DEFAULT_PASSWORD = "kb1234";

const createInitialAuthState = () => ({
  id: "",
  userId: "",
  email: "",
  password: "",
  name: "",
  phone: "",
});

export const useAuthStores = defineStore("authStore", () => {
  const authState = reactive(createInitialAuthState());
  const accessToken = ref("");
  const isHydrated = ref(false);

  const isAuthenticated = computed(() => Boolean(accessToken.value));

  const setUser = (user) => {
    authState.id = user?.id ?? "";
    authState.userId = user?.userId ?? "";
    authState.email = user?.email ?? "";
    authState.password = user?.password ?? "";
    authState.name = user?.name ?? "";
    authState.phone = user?.phone ?? "";
  };

  const clearAuthState = () => {
    Object.assign(authState, createInitialAuthState());
    accessToken.value = "";
  };

  const persistAuth = (token, user) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  };

  const restoreAuth = () => {
    if (isHydrated.value) return;

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        accessToken.value = token;
        setUser(user);
      } catch (error) {
        clearAuthState();
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }

    isHydrated.value = true;
  };

  const authenticateUser = async ({ userId, password }) => {
    const response = await axios.get(`${BASE_URL}/users`, {
      params: { userId },
    });

    const user = response.data?.[0];
    if (!user) return null;

    const isPasswordMatched =
      user.password === password ||
      (user.password === "hashed_password" && password === DEV_DEFAULT_PASSWORD);

    if (!isPasswordMatched) return null;

    return user;
  };

  const login = async ({ userId, password }) => {
    const user = await authenticateUser({ userId, password });
    if (!user) return null;

    const token = `local-token-${user.userId}-${Date.now()}`;
    accessToken.value = token;
    setUser(user);
    persistAuth(token, user);
    return user;
  };

  const logout = () => {
    clearAuthState();
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  return {
    authState,
    accessToken,
    isAuthenticated,
    restoreAuth,
    authenticateUser,
    login,
    logout,
  };
});

export const useAuthStore = useAuthStores;
