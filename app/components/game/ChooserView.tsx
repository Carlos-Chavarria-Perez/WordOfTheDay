import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Button,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type Props = {
  words: any[];
  selectedWord: any;
  loadingWords: boolean;
  sentences: any[];
  pointsMap: Record<string, string>;
  setPointsMap: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  chooseWord: (item: any) => void;
  reviewSentence: (
    game_id: string,
    sentence_owner_id: string,
    approved: boolean,
    points: number
  ) => void;
  requestWords: () => void;
  nextRound: () => void;
  gameId: string;
};

export default function ChooserView({
  words,
  selectedWord,
  loadingWords,
  sentences,
  pointsMap,
  setPointsMap,
  chooseWord,
  reviewSentence,
  requestWords,
  nextRound,
  gameId,
}: Props) {
  // 🟢 WORD SELECTION STATE
  if (!selectedWord) {
    return (
      <>
        <Text style={styles.sectionTitle}>Select a Word</Text>

        {loadingWords ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <>
            <FlatList
              data={words}
              keyExtractor={(item) => item.word}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.card}
                  onPress={() => chooseWord(item)}
                >
                  <Text style={styles.wordTitle}>{item.word}</Text>
                  <Text style={styles.definition}>
                    {item.definition}
                  </Text>
                </Pressable>
              )}
            />

            <Button title="Refresh Words" onPress={requestWords} />
          </>
        )}
      </>
    );
  }

  // 🔵 REVIEW STATE
  return (
    <>
      <View style={styles.wordHeader}>
        <Text style={styles.wordTitle}>
          Selected Word: {selectedWord.word}
        </Text>

        <Pressable
          style={styles.nextRoundBtn}
          onPress={nextRound}
        >
          <MaterialCommunityIcons
            name="skip-next"
            size={26}
            color="#fff"
          />
        </Pressable>
      </View>

      <FlatList
        data={sentences}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{item.sentence}</Text>

            {item.approved === null && (
              <View style={styles.actionsRow}>
                <TextInput
                  style={styles.pointsInput}
                  placeholder="Pts"
                  keyboardType="numeric"
                  value={pointsMap[item.id] || ""}
                  onChangeText={(val) =>
                    setPointsMap((prev) => ({
                      ...prev,
                      [item.id]: val,
                    }))
                  }
                />

                <FontAwesome6
                  name="check-circle"
                  size={26}
                  color="green"
                  onPress={() =>
                    reviewSentence(
                      gameId,
                      item.user_id,
                      true,
                      Number(pointsMap[item.id] || 0)
                    )
                  }
                />

                <FontAwesome6
                  name="times-circle"
                  size={26}
                  color="red"
                  onPress={() =>
                    reviewSentence(
                      gameId,
                      item.user_id,
                      false,
                      0
                    )
                  }
                />
              </View>
            )}

            {item.approved === true && (
              <Text style={styles.approvedText}>
                Approved
              </Text>
            )}

            {item.approved === false && (
              <Text style={styles.rejectedText}>
                Rejected
              </Text>
            )}
          </View>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginTop: 20,
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    color:"#ffffff"
  },

  wordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },

  wordTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  definition: {
    marginTop: 4,
    color: "#555",
  },

  card: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginVertical: 6,
    backgroundColor: "#fff",
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginTop: 10,
  },

  pointsInput: {
    width: 70,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    textAlign: "center",
  },

  approvedText: {
    color: "green",
    marginTop: 6,
    fontWeight: "600",
  },

  rejectedText: {
    color: "red",
    marginTop: 6,
    fontWeight: "600",
  },

  nextRoundBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",

    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  loadingContainer: {
    padding: 30,
    alignItems: "center",
  },
});
