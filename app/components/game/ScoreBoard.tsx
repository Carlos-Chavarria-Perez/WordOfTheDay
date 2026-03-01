import { LeaderboardItem } from "@/types/game";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
  StyleSheet,
} from "react-native";

type Props = {
  scores: LeaderboardItem[];
};

export default function ScoreBoard({ scores }: Props) {
  const [showPlayerScore, setShowPlayerScore] = useState(true);

  return (
    <View style={styles.container}>
      {/* 🔹 Header */}
      <Pressable
        style={styles.headerRow}
        onPress={() => setShowPlayerScore(!showPlayerScore)}
      >
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name="podium-gold"
            size={22}
            color="#DAA520"
          />
          <Text style={styles.title}>Player Scoreboard</Text>
        </View>

        <FontAwesome6
          name={showPlayerScore ? "chevron-down" : "chevron-up"}
          size={18}
        />
      </Pressable>

      {/* 🔹 Score List */}
      {showPlayerScore && (
        <View style={styles.listContainer}>
          <FlatList
            data={scores}
            keyExtractor={(item) => item.username}
            renderItem={({ item, index }) => (
              <View style={styles.scoreRow}>
                <Text style={styles.playerName}>
                  {index + 1}. {item.username}
                </Text>
                <Text style={styles.points}>
                  {item.points}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No scores yet
              </Text>
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
  },

  listContainer: {
    marginTop: 10,
  },

  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  playerName: {
    fontSize: 15,
  },

  points: {
    fontWeight: "bold",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 10,
    color: "#777",
  },
});
