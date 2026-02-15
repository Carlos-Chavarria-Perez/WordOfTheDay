import { registerUser } from "@/api/Auth";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Username and password are required");
      return;
    }

    try {
      const res = await registerUser(username, password);
      Alert.alert("Success", res.message, [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Registration failed",
        error.response?.data?.error || error.message
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the party</Text>

        <TextInput
          placeholder="Username"
          placeholderTextColor="#000"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#000"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable style={styles.primaryButton} onPress={handleRegister}>
          <Text style={styles.primaryButtonText}>Register</Text>
        </Pressable>

        <View style={styles.redirectContainer}>
          <Pressable onPress={() => router.replace("/login")}>
            <Text style={styles.redirectText}>
              Already registered? Login
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
    color: "#222",
  },

  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
  },

  input: {
    borderWidth: 1,
    borderColor: "#e3e6ea",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
    marginBottom: 16,
    fontSize: 15,
  },

  primaryButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  redirectContainer: {
    marginTop: 18,
    alignItems: "center",
  },

  redirectText: {
    color: "#2488ca",
    fontWeight: "600",
  },
});
