import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Pressable,
  FlatList,
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Sentence } from "@/types/game";

type Props = {
  selectedWord: any;
  sentence: string;
  setSentence: (val: string) => void;
  submitSentence: () => void;
  submitting: boolean;
  myStatus: {
    approved: boolean | null;
    points?: number;
  } | null;
  sentences: Sentence[];
};

export default function PlayerView({
  selectedWord,
  sentence,
  setSentence,
  submitSentence,
  submitting,
  myStatus,
  sentences,
}: Props) {
  const [showSubmission, setShowSubmission] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );
  const [overflowItems, setOverflowItems] = useState<Record<string, boolean>>(
    {},
  );

  let statusText = "";
  let statusStyle = styles.noSubmissionToggleHeader; // default

  if (!myStatus) {
    statusText = "No sentence submitted";
  } else if (myStatus.approved === null) {
    statusText = "Waiting Approval...";
    statusStyle = styles.waitingToggleHeader;
  } else if (myStatus.approved === true) {
    statusText = "Approved";
    statusStyle = styles.approvedToggleHeader;
  } else if (myStatus.approved === false) {
    statusText = "Rejected";
    statusStyle = styles.rejectedToggleHeader;
  }

  // 🟡 Waiting for chooser
  if (!selectedWord) {
    return <Text style={styles.waitingText}>Waiting for word chooser...</Text>;
  }

  const toogleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      <View style={{ flex: 1 }}>
        {/* 🔹 Word Display */}
        <View style={styles.card}>
          <View style={styles.toogleHeader}>
            <View style={styles.side}>
              {!showSubmission && (
                <Text style={{ fontWeight: "bold" }}>Stauts</Text>
              )}
            </View>
            <View style={styles.submittionStatus}>
              {!showSubmission && <Text style={statusStyle}>{statusText}</Text>}
            </View>
            <View style={styles.side}>
              <Pressable onPress={() => setShowSubmission(!showSubmission)}>
                <FontAwesome6
                  name={showSubmission ? "chevron-down" : "chevron-up"}
                  size={18}
                />
              </Pressable>
            </View>
          </View>

          {showSubmission && (
            <>
              <Text style={styles.wordTitle}>Word: {selectedWord.word}</Text>
              {selectedWord.definition && (
                <Text style={styles.definition}>{selectedWord.definition}</Text>
              )}
              {/* 🔹 Submission Form */}
              {!myStatus && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Type in your sentence"
                    value={sentence}
                    onChangeText={setSentence}
                    multiline
                  />

                  <Button
                    title={submitting ? "Submitting..." : "Submit Sentence"}
                    onPress={submitSentence}
                    disabled={submitting}
                  />
                </>
              )}

              {/* 🟡 Waiting Approval */}
              {myStatus?.approved === null && (
                <Text style={styles.waitingText}>Waiting for approval...</Text>
              )}

              {/* 🟢 Approved */}
              {myStatus?.approved === true && (
                <View style={[styles.resultCard, styles.approved]}>
                  <FontAwesome6 name="check-circle" size={26} color="green" />
                  <Text style={styles.resultText}>
                    Approved — Points: {myStatus.points ?? 0}
                  </Text>
                </View>
              )}

              {/* 🔴 Rejected */}
              {myStatus?.approved === false && (
                <View style={[styles.resultCard, styles.rejected]}>
                  <FontAwesome6 name="times-circle" size={26} color="red" />
                  <Text style={styles.resultText}>Rejected</Text>
                </View>
              )}
            </>
          )}
        </View>

        <View style={[styles.card, { flex: 1 }]}>
          <View style={{ paddingBottom: 10 }}>
            <Text style={styles.playerSubmitions}>Submitted Senteces</Text>
          </View>
          <FlatList
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 10 }}
            data={sentences}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View>
                <View style={styles.sentenceItem}>
                  <View style={styles.sentenceRow}>
                    <Text style={styles.sentenceOwner}>{item.username}</Text>
                    {item.approved === null && (
                      <Text style={styles.waitingTextSubmitted}>
                        Waiting approval
                      </Text>
                    )}
                    {item.approved !== null && (
                      <Text
                        style={
                          item.approved
                            ? styles.approvedStatus
                            : styles.rejectedStatus
                        }
                      >
                        {item.approved
                          ? `Approved — ${item.points ?? 0} pts`
                          : "Rejected"}
                      </Text>
                    )}
                  </View>

                  <View style={styles.sentenceContainer}>
                    <Text
                      numberOfLines={
                        overflowItems[item.id]
                          ? expandedItems[item.id]
                            ? undefined
                            : 2
                          : undefined
                      }
                      onTextLayout={(e) => {
                        if (overflowItems[item.id] !== undefined) return;

                        const fullLineCount = e.nativeEvent.lines.length;

                        if (fullLineCount > 2) {
                          setOverflowItems((prev) => ({
                            ...prev,
                            [item.id]: true,
                          }));
                        } else {
                          setOverflowItems((prev) => ({
                            ...prev,
                            [item.id]: false,
                          }));
                        }
                      }}
                    >
                      {item.sentence}
                    </Text>
                  </View>
                  <View style={styles.toogleExpand}>
                    {overflowItems[item.id] && (
                      <Pressable
                        style={({ pressed }) => [
                          styles.toggleButton,
                          pressed && { opacity: 0.7 },
                        ]}
                        onPress={() => toogleExpand(item.id)}
                      >
                        <Text style={styles.toggleButtonText}>
                          {expandedItems[item.id] ? "Show less" : "Show more"}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wordTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
  },

  definition: {
    textAlign: "center",
    color: "#303030",
    marginBottom: 12,
    paddingTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#000000",
    padding: 14,
    marginVertical: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    minHeight: 60,
  },

  waitingText: {
    color: "orange",
    marginTop: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  waitingTextSubmitted: {
    color: "orange",
    textAlign: "center",
    fontWeight: "500",
  },
  waitingTextToogle: {
    color: "orange",
    textAlign: "center",
    fontWeight: "500",
  },

  resultCard: {
    padding: 14,
    borderWidth: 2,
    borderRadius: 12,
    marginVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  resultText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
  },

  approved: {
    borderColor: "green",
    backgroundColor: "#f0fff4",
  },
  noSubmissionToggleHeader: {
    color: "#000000",
    fontWeight: "bold",
  },
  waitingToggleHeader: {
    color: "orange",
    fontWeight: "bold",
  },
  approvedToggleHeader: {
    color: "green",
    fontWeight: "bold",
  },
  rejectedToggleHeader: {
    color: "red",
    fontWeight: "bold",
  },

  rejected: {
    borderColor: "red",
    backgroundColor: "#fff5f5",
  },
  card: {
    padding: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginVertical: 6,
    backgroundColor: "#fff",
  },
  toogleHeader: { flexDirection: "row", alignItems: "center" },

  side: {
    flex: 1,
    alignItems: "flex-end", // pushes icon right
  },
  submittionStatus: {
    flex: 2,
    alignItems: "center",
  },
  playerSubmitions: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
    textDecorationLine: "underline",
  },

  sentenceContainer: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
  },

  sentenceRow: {
    flexDirection: "row",
    marginBottom: 7,
    justifyContent: "space-between",
  },
  sentenceOwner: {
    fontWeight: "bold",
    color: "#ffff",
  },

  sentenceItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#585858",
    marginBottom: 12,
    borderColor: "#000",
    elevation: 4,
    // overflowX: "hidden",
  },
  toogleExpand: {
    alignItems: "flex-end",
  },
  toggleButton: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#00a116",
    borderRadius: 20,
    alignSelf: "flex-end",
  },

  toggleButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  approvedStatus: {
  color: "#00a116",
  fontWeight: "bold",
},

rejectedStatus: {
  color: "#ec0000",
  fontWeight: "bold",
},
});
