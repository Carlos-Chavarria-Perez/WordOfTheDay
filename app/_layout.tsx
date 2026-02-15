import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import Toast from "react-native-toast-message";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function RootLayout() {
  return (
    <LinearGradient
      colors={["#001b74b9", "#007a43"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Toast />
      </AuthProvider>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
