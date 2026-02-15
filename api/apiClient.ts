import { triggerLogout } from "@/context/AuthContext";
import axios from "axios";
import Toast from "react-native-toast-message";
import { router } from "expo-router";

let getToken: (() => string | null) | null = null;

export const injectTokenGetter = (fn: () => string | null) => {
  getToken = fn;
};

// ✅ Use your Render URL - React Native doesn't have proper NODE_ENV support
const API_BASE_URL_Prod = "https://wordofthedaybackend.onrender.com";
const API_BASE_URL_Dev = "http://10.0.2.2:3000";



console.log("🔵 API Client initialized with URL:", API_BASE_URL_Prod);

const apiClient = axios.create({
  baseURL: API_BASE_URL_Prod,
  timeout: 10000, // 10 second timeout
});

// attach token
apiClient.interceptors.request.use((config) => {
  console.log("🔵 API Request:", config.method?.toUpperCase(), config.url);
  const token = getToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// handle expired session
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.log("❌ API Error:", error.message);
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
