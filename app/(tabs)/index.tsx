import {
  View,
  Text,
  Button,
  Alert,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { createGame, Game, getGames, joinGame } from "@/api/game";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Modal } from "react-native";

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
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadgames();

      return () => {
        console.log("Screen unfocused");
      };
    }, [token]),
  );

  return (
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
        <Text style={styles.sectionTitle}>Your Current Games</Text>

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
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  headerContainer: {
    marginBottom: 20,
  },

  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  createSection: {
    marginBottom: 20,
    alignItems: "center",
    gap: 12,
  },

  activeGameContainer: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e3e6ea",
    marginBottom: 20,
  },

  gameItem: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#f1f4f8",
    marginBottom: 10,
  },

  gameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  gameName: {
    fontSize: 16,
    fontWeight: "500",
  },

  roundBadge: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 10,
    color: "#777",
  },

  joinSection: {
    marginBottom: 20,
    gap: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
  },

  primaryButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  secondaryButton: {
    backgroundColor: "#2488ca",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },

  cancelText: {
    color: "#e2615a",
    fontWeight: "600",
  },
});
