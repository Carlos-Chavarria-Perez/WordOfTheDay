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
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Welcome Back {user?.username}</Text>
      </View>
      <View style={styles.createGameContainer}>
        <Text style={styles.createGameText}>Start the party</Text>
        <Button title="Create Room" onPress={() => setModalVisible(true)} />
      </View>
      <View style={styles.activeGameContainer}>
        <View>
          <Text style={styles.activeGameText}>Your Current Games</Text>
        </View>
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
              <View
                style={{
                  justifyContent: "space-between",
                  flexDirection: "row",
                }}
              >
                <Text style={styles.gameItemText}>Game: {item.game_name}</Text>
                <Text style={styles.gameItemText}>
                  Round: {item.current_round}
                </Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: "center" }}>No active games</Text>
          }
        />
      </View>
      <TextInput
        placeholder="Paste game id"
        value={manualId}
        onChangeText={setManualId}
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 10,
          borderRadius: 6,
        }}
      />

      <Button title="Join Game" onPress={handleManualJoin} />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text>Room Name</Text>
            <TextInput
              placeholder="Enter Room Name"
              value={gameName}
              onChangeText={setGameName}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button
                title={creating ? "creating..." : "Creating Room"}
                onPress={handleCreateGame}
                disabled={creating}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingBottom: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  createGameContainer: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  createGameText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  activeGameContainer: {
    flex: 1,
    marginVertical: 10,
    borderWidth: 3,
    borderRadius: 10,
    padding: 10,
    borderColor: "#2488ca",
  },
  activeGameText: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  gameItem: {
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  gameItemText: {
    fontSize: 14,
    fontFamily: "monospace", // Good for IDs
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "white",
    width: "85%",
    padding: 20,
    borderRadius: 12,
  },
});
