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

const normalizeUser = (user) => ({
  id: user?.id ?? "",
  userId: user?.userId ?? "",
  email: user?.email ?? "",
  password: user?.password ?? "",
  name: user?.name ?? "",
  phone: user?.phone ?? "",
});

export const useAuthStores = defineStore("authStore", () => {
  const authState = reactive(createInitialAuthState());
  const accessToken = ref("");
  const isHydrated = ref(false);

  const isAuthenticated = computed(() => Boolean(accessToken.value));

  const setUser = (user) => {
    Object.assign(authState, normalizeUser(user));
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

  const getMyProfile = async () => {
    if (!authState.userId) return null;

    const response = await axios.get(`${BASE_URL}/users`, {
      params: { userId: authState.userId },
    });
    const user = response.data?.[0] ?? null;
    if (!user) return null;

    setUser(user);
    if (accessToken.value) {
      persistAuth(accessToken.value, normalizeUser(user));
    }
    return user;
  };

  const updateMyProfile = async (payload) => {
    const hasId = Boolean(authState.id);
    const targetId = authState.id;
    const safePayload = {
      name: payload?.name ?? "",
      email: payload?.email ?? "",
      phone: payload?.phone ?? "",
    };

    let user = null;

    if (hasId) {
      const response = await axios.patch(
        `${BASE_URL}/users/${encodeURIComponent(targetId)}`,
        safePayload,
      );
      user = response.data ?? null;
    } else if (authState.userId) {
      const lookupResponse = await axios.get(`${BASE_URL}/users`, {
        params: { userId: authState.userId },
      });
      const found = lookupResponse.data?.[0];
      if (!found?.id) return null;

      const updateResponse = await axios.patch(
        `${BASE_URL}/users/${encodeURIComponent(found.id)}`,
        safePayload,
      );
      user = updateResponse.data ?? null;
    }

    if (!user) return null;

    const merged = {
      ...normalizeUser(authState),
      ...normalizeUser(user),
    };
    setUser(merged);
    if (accessToken.value) {
      persistAuth(accessToken.value, merged);
    }
    return merged;
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
    getMyProfile,
    updateMyProfile,
    logout,
  };
});

export const useAuthStore = useAuthStores;
