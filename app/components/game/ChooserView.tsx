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
import { Sentence } from "@/types/game";

type Props = {
  words: any[];
  selectedWord: any;
  loadingWords: boolean;
  sentences: Sentence[];
  pointsMap: Record<string, string>;
  setPointsMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  chooseWord: (item: any) => void;
  reviewSentence: (
    game_id: string,
    sentence_owner_id: string,
    approved: boolean,
    points: number,
    comment?: string,
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
  const [commentMap, setCommentMap] = React.useState<Record<string, string>>(
    {},
  );
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
                <Pressable style={styles.card} onPress={() => chooseWord(item)}>
                  <Text style={styles.wordTitle}>{item.word}</Text>
                  <Text style={styles.definition}>{item.definition}</Text>
                </Pressable>
              )}
            />

            <Button title="Refresh Words" onPress={requestWords} />
          </>
        )}
      </>
    );
  }
  if (selectedWord && sentences.length === 0) {
    return (
      <>
        <View style={styles.waitingHeader}>
          <Text style={styles.sectionTitle}>
            Selected Word: {selectedWord.word}
          </Text>
        </View>

        <View style={styles.card}>
          <ActivityIndicator size="large" />
          <Text style={styles.waitingText}>
            Waiting for players to submit...
          </Text>
        </View>
      </>
    );
  }

  // 🔵 REVIEW STATE
  return (
    <>
      <View style={styles.wordHeader}>
        <Text style={styles.sectionTitle}>
          Selected Word: {selectedWord.word}
        </Text>

        <Pressable style={styles.nextRoundBtn} onPress={nextRound}>
          <MaterialCommunityIcons name="skip-next" size={26} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={sentences}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const pointsValue = Number(pointsMap[item.id] || 0);

          const isValidPoints =
            !!pointsMap[item.id] && !isNaN(pointsValue) && pointsValue > 0;

          return (
            <View style={styles.card}>
              <View style={styles.submitterContainer}>
                <Text style={{ fontSize: 18 }}>Submitted by: </Text>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  {item.username}
                </Text>
              </View>

              <View style={styles.sentenceContainer}>
                <Text style={{ textAlign: "center", fontSize: 20 }}>
                  {item.sentence}
                </Text>
              </View>
              <View style={styles.feedbackcontainer}>
                <TextInput
                  style={[
                    styles.feedbackInput,
                    item.approved !== null && styles.disabledInput,
                  ]}
                  placeholder="Leave a Comment"
                  editable={item.approved === null}
                  placeholderTextColor="#000"
                  value={
                    item.approved === null
                      ? commentMap[item.id] || ""
                      : item.review_comment || ""
                  }
                  onChangeText={(val) =>
                    setCommentMap((prev) => ({
                      ...prev,
                      [item.id]: val,
                    }))
                  }
                />
              </View>

              {item.approved === null && (
                <View style={styles.actionsRow}>
                  <TextInput
                    style={styles.pointsInput}
                    placeholder="Pts"
                    placeholderTextColor="#000"
                    keyboardType="numeric"
                    value={pointsMap[item.id] || ""}
                    onChangeText={(val) =>
                      setPointsMap((prev) => ({
                        ...prev,
                        [item.id]: val,
                      }))
                    }
                  />

                  <Pressable
                    disabled={!isValidPoints}
                    onPress={() =>
                      reviewSentence(
                        gameId,
                        item.user_id,
                        true,
                        pointsValue,
                        commentMap[item.id] || "",
                      )
                    }
                    style={({ pressed }) => ({
                      opacity: !isValidPoints ? 0.3 : pressed ? 0.6 : 1,
                    })}
                  >
                    <FontAwesome6
                      name="check-circle"
                      size={26}
                      color={isValidPoints ? "green" : "#999"}
                    />
                  </Pressable>

                  <FontAwesome6
                    name="times-circle"
                    size={26}
                    color="red"
                    onPress={() =>
                      reviewSentence(
                        gameId,
                        item.user_id,
                        false,
                        0,
                        commentMap[item.id] || "",
                      )
                    }
                  />
                </View>
              )}

              {item.approved === true && (
                <View style={styles.statusOfSentence}>
                  <Text style={styles.stautstext}>Status: </Text>

                  <Text style={styles.approvedText}>Approved</Text>
                </View>
              )}

              {item.approved === false && (
                <View style={styles.statusOfSentence}>
                  <Text style={styles.stautstext}>Status: </Text>
                  <Text style={styles.rejectedText}>Rejected</Text>
                </View>
              )}
            </View>
          );
        }}
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
    color: "#ffffff",
  },

  wordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  waitingHeader: {
    flexDirection: "row",
    justifyContent: "center",
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
    borderColor: "#000000",
    borderRadius: 8,
    paddingHorizontal: 10,
    textAlign: "center",
  },
  feedbackcontainer: {
    justifyContent: "center",
  },
  feedbackInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 8,
    paddingHorizontal: 10,
  },

  stautstext: { fontSize: 20, fontWeight: "bold" },

  approvedText: {
    color: "green",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 20,
  },

  rejectedText: {
    color: "red",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 20,
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
  waitingContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  submitterContainer: { flexDirection: "row", textAlign: "center" },
  sentenceContainer: {
    padding: 10,
  },

  waitingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    color: "#000",
  },
  statusOfSentence: {
    flexDirection: "row",
    marginTop: 6,
    textAlign: "center",
    justifyContent: "center",
  },
  disabledInput: {
    backgroundColor: "#f2f2f2",
    color: "#555",
  },
});
