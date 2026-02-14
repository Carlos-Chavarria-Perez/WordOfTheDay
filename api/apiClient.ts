import { triggerLogout } from "@/context/AuthContext";
import axios from "axios";
import Toast from "react-native-toast-message";
import { router } from "expo-router";

let getToken: (() => string | null) | null = null;

export const injectTokenGetter = (fn: () => string | null) => {
  getToken = fn;
};

const apiClient = axios.create({
  baseURL: "http://10.0.2.2:3000",
});

// attach token
apiClient.interceptors.request.use((config) => {
  const token = getToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// handel expired session
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      error.response?.status === 401 &&
        error.response?.data?.error === "Session Expired";

      triggerLogout();
      Toast.show({
        type: "error",
        text1: "Session Expired",
        text2: "You were logged out because you logged in on another device.",
        position: "top",
        visibilityTime: 4000,
      });

      router.replace("/login");
      return new Promise(() => {});
    }
    return Promise.reject(error);
  },
);

export default apiClient;
