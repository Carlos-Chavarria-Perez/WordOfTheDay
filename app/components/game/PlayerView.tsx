import React from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

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
};

export default function PlayerView({
  selectedWord,
  sentence,
  setSentence,
  submitSentence,
  submitting,
  myStatus,
}: Props) {
  // 🟡 Waiting for chooser
  if (!selectedWord) {
    return (
      <Text style={styles.waitingText}>
        Waiting for word chooser...
      </Text>
    );
  }

  return (
    <>
      {/* 🔹 Word Display */}
      <Text style={styles.wordTitle}>
        Word: {selectedWord.word}
      </Text>

      {selectedWord.definition && (
        <Text style={styles.definition}>
          {selectedWord.definition}
        </Text>
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
        <Text style={styles.waitingText}>
          Waiting for approval...
        </Text>
      )}

      {/* 🟢 Approved */}
      {myStatus?.approved === true && (
        <View style={[styles.resultCard, styles.approved]}>
          <FontAwesome6
            name="check-circle"
            size={26}
            color="green"
          />
          <Text style={styles.resultText}>
            Approved — Points: {myStatus.points ?? 0}
          </Text>
        </View>
      )}

      {/* 🔴 Rejected */}
      {myStatus?.approved === false && (
        <View style={[styles.resultCard, styles.rejected]}>
          <FontAwesome6
            name="times-circle"
            size={26}
            color="red"
          />
          <Text style={styles.resultText}>
            Rejected
          </Text>
        </View>
      )}
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
    color: "#555",
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
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

  rejected: {
    borderColor: "red",
    backgroundColor: "#fff5f5",
  },
});
