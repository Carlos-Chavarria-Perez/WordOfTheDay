import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import Toast from "react-native-toast-message";
import { ImageBackground, StyleSheet } from "react-native";
export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </AuthProvider>
  );
}
