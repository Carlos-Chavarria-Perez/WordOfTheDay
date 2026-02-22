import {
  View,
  Text,
  Button,
  Alert,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { createGame, Game, getGames, joinGame } from "@/api/game";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Home() {
  const { user, token } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [manualId, setManualId] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [gameName, setGameName] = useState("");
  const [creating, setCreating] = useState(false);

  const loadgames = async () => {
    if (!token) return;
    try {
      const data = await getGames();
      setGames(data);
    } catch (error) {
      Alert.alert("Error loading games");
    }
  };

  const handleCreateGame = async () => {
    if (!token) return;

    if (!gameName.trim()) {
      Alert.alert("Please enter a room name");
      return;
    }

    try {
      setCreating(true);
      const res = await createGame(gameName);
      setModalVisible(false);
      setGameName("");

      router.push({
        pathname: "/game/[id]",
        params: { id: res.game_id },
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to create game",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleManualJoin = async () => {
    if (!token || !manualId.trim()) return;

    try {
      const res = await joinGame(manualId.trim());

      router.push({
        pathname: "/game/[id]",
        params: { id: res.game_id }, // UUID returned
      });
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Failed to join game");
      setManualId("");
    }finally{
    setManualId("");
  };
  }

  useFocusEffect(
    useCallback(() => {
      loadgames();

      return () => {
        console.log("Screen unfocused");
      };
    }, [token]),
  );

  return (
    <LinearGradient
      colors={["#001b74b9", "#007a43"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* 🔹 Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Welcome back, {user?.username}</Text>
        </View>

        {/* 🔹 Create Game Section */}
        <View style={styles.createSection}>
          <Text style={styles.sectionTitle}>Start the party 🎉</Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.primaryButtonText}>Create Room</Text>
          </Pressable>
        </View>

        {/* 🔹 Active Games */}
        <View style={styles.activeGameContainer}>
          <Text style={styles.activeTitle}>Your Current Games</Text>

          <FlatList
            data={games}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.gameItem}
                onPress={() =>
                  router.push({
                    pathname: "/game/[id]",
                    params: { id: item.id },
                  })
                }
              >
                <View style={styles.gameRow}>
                  <Text style={styles.gameName}>{item.game_name}</Text>
                  <Text style={styles.roundBadge}>
                    Round {item.current_round}
                  </Text>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No active games yet</Text>
            }
          />
        </View>

        {/* 🔹 Join By Code */}
        <View style={styles.joinSection}>
          <TextInput
            placeholder="Paste game invite code"
            value={manualId}
            onChangeText={setManualId}
            placeholderTextColor="#000"
            style={styles.input}
          />

          <Pressable style={styles.secondaryButton} onPress={handleManualJoin}>
            <Text style={styles.secondaryButtonText}>Join Game</Text>
          </Pressable>
        </View>

        {/* 🔹 Create Modal */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Create Room</Text>

              <TextInput
                placeholder="Enter Room Name"
                placeholderTextColor="#000"
                value={gameName}
                onChangeText={setGameName}
                style={styles.input}
              />

              <View style={styles.modalActions}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={styles.primaryButton}
                  onPress={handleCreateGame}
                  disabled={creating}
                >
                  <Text style={styles.primaryButtonText}>
                    {creating ? "Creating..." : "Create"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "transparent",
  },

  headerContainer: {
    marginBottom: 20,
  },

  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#ffffff", // 👈 important for gradient
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#ffffff",
  },
  activeTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#000000",
    textAlign: "center",
  },

  createSection: {
    marginBottom: 20,
    alignItems: "center",
    gap: 12,
  },

  activeGameContainer: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: 1,
    borderColor: "#e3e6ea",
    marginBottom: 20,
  },

  gameItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth:1,
    backgroundColor: "#d0d0d0",
    marginBottom: 12,
    borderColor:"#000",
    elevation:4
  },

  gameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  gameName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  roundBadge: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4CAF50",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 10,
    color: "#666",
  },

  joinSection: {
    marginBottom: 20,
    gap: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e3e6ea",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#ffffff",
    fontSize: 15,
    color: "#000",
  },

  primaryButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  secondaryButton: {
    backgroundColor: "#2488ca",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "85%",
    backgroundColor: "#ffffff",
    padding: 22,
    borderRadius: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 14,
    color: "#222",
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },

  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },

  cancelText: {
    color: "#e2615a",
    fontWeight: "600",
    fontSize: 15,
  },
});
