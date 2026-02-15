import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
} from "react-native";

type Props = {
  game_name: string;
  invite_code: string;
  onCopy: () => void;
};

export default function LobbyHeader({
  game_name,
  invite_code,
  onCopy,
}: Props) {
  return (
    <View style={styles.container}>
      {/* 🔹 Game Name */}
      <Text style={styles.lobbyName}>{game_name}</Text>

      {/* 🔹 Invite Section */}
      <View style={styles.inviteCard}>
        <Text style={styles.inviteTitle}>
          Invite your friends!
        </Text>

        <View style={styles.inviteCTA}>
          <Text style={styles.inviteCode}>
            {invite_code}
          </Text>

          <Pressable
            style={styles.copyButton}
            onPress={onCopy}
          >
            <FontAwesome6
              name="copy"
              size={16}
              color="#fff"
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 16,
  },

  lobbyName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color:"#ffffff"
  },

  inviteCard: {
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
  },

  inviteTitle: {
    fontSize: 14,
    marginBottom: 8,
    color: "#555",
  },

  inviteCTA: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  inviteCode: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  copyButton: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 8,
  },
});
