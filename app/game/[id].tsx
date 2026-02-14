import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  Pressable,
  TextInput,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getGameDetails, getLeaderboardApi } from "../api/game";
import {
  getSentencesApi,
  nextRoundApi,
  reviewSentenceApi,
  submitSentenceApi,
} from "../api/sentences";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Clipboard from "expo-clipboard";
import { connectSocket, getSocket } from "../api/socket";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type WordItem = {
  word: string;
  definition: string;
};

type Sentence = {
  id: string;
  user_id: string;
  sentence: string;
  approved: boolean | null;
  username?: string;
  points?: number;
};
type LeaderboardItem = {
  username: string;
  points: number;
};

export default function Game() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadingWords, setLoadingWords] = useState(false);

  const [details, setDetails] = useState<any>(null);
  const [scores, setScores] = useState<LeaderboardItem[]>([]);

  const [words, setWords] = useState<WordItem[]>([]);
  const [selectedWord, setSelectedWord] = useState<WordItem | null>(null);

  const [sentence, setSentence] = useState("");
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [myStatus, setMyStatus] = useState<{
    approved: boolean | null;
    points?: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [showPlayerScore, setShowPlaerScore] = useState(false);
  const [pointsMap, setPointsMap] = useState<Record<string, string>>({});

  /* =============================
     API
  ============================= */

  const loadGame = async () => {
    if (!token || !id) return;

    try {
      setLoading(true);
      const data = await getGameDetails(id);
      setDetails(data);
    } catch {
      Alert.alert("Failed to load game");
    } finally {
      setLoading(false);
    }
  };

  const nextRound = async () => {
    try {
      setLoading(true);

      const data = await nextRoundApi(id!);

      console.log("NEXT ROUND RESPONSE:", data);

      Alert.alert("Next round started");
    } catch (error: any) {
      Alert.alert("Next round not started");
    } finally {
      setLoading(false);
    }
  };

  const loadSentences = async () => {
    const data = await getSentencesApi(id!);

    setSentences(data);

    // ⭐ restore my status if already submitted
    const mine = data.find((s) => s.user_id === user?.user_id);

    if (mine) {
      setMyStatus({
        approved: mine.approved,
        points: mine.points,
      });
    }
  };

  const loadLeaderboard = async () => {
    const data = await getLeaderboardApi(id!);
    setScores(data);
  };

  const requestWords = async () => {
    try {
      setError(null);
      setLoadingWords(true);

      const res = await fetch("http://10.0.2.2:3000/word/random-word");
      const data: WordItem[] = await res.json();

      setWords(data);
    } catch {
      setError("Failed to load words");
    } finally {
      setLoadingWords(false);
    }
  };

  /* =============================
     Actions
  ============================= */
  const chooseWord = (item: WordItem) => {
    setSelectedWord(item);

    getSocket()?.emit("word:choose", {
      roomId: id,
      word: item,
    });
  };

  const submitSentence = async () => {
    if (!sentence.trim() || submitting) return;

    try {
      setSubmitting(true);

      await submitSentenceApi(id!, sentence);

      setSentence("");
      setMyStatus({ approved: null });
    } catch (err) {
      Alert.alert("Error", "Failed to submit sentence");
    } finally {
      setSubmitting(false);
    }
  };

  const reviewSentence = async (
    game_id: string,
    sentence_owner_id: string,
    approved: boolean,
    points: number,
  ) => {
    try {
      await reviewSentenceApi(
        game_id!,
        sentence_owner_id,
        approved,
        Number(points || 0),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const copyIdClipboard = async () => {
    if (!id) return;

    await Clipboard.setStringAsync(id);
    Alert.alert("Copied!", "Game ID copied");
  };

  const toggleScores = () => {
    setShowPlaerScore(!showPlayerScore);
  };

  /* =============================
     Socket Handlers
  ============================= */

  const handleSentenceNew = (data: Sentence) => {
    setSentences((prev) => [...prev, data]);
  };

  const handleSentenceUpdate = (data: Sentence) => {
    setSentences((prev) =>
      prev.map((s) => (s.id === data.id ? { ...s, ...data } : s)),
    );
  };

  const handleSentenceResult = (data: any) => {
    if (data.user_id !== user?.user_id) return;

    setMyStatus({
      approved: data.approved,
      points: data.points,
    });
  };

  const handleWordSelected = (word: WordItem) => {
    setSelectedWord(word);
  };

  const handleRoundReset = () => {
    setSelectedWord(null);
    setSentences([]);
    setSentence("");
    setMyStatus(null);
  };

  const handleLeaderboardUpdate = (data: LeaderboardItem[]) => {
    setScores(data);
  };

  /* =============================
     Effects
  ============================= */

  useEffect(() => {
    loadGame();
  }, []);

  // load words automatically if chooser
  useEffect(() => {
    if (details?.is_word_chooser && !selectedWord) {
      requestWords();
    }
  }, [details, selectedWord]);
  // =========================================

  useEffect(() => {
    if (!user) return;

    connectSocket(user.user_id);
  }, [user]);
  // ===============================

  useEffect(() => {
    if (!user || !id || !details) return;

    const socket = getSocket();
    if (!socket) return;

    loadSentences();
    loadLeaderboard();

    socket.emit("room:join", {
      roomId: id,
      isChooser: details.is_word_chooser,
    });

    // =================================
    // listeners
    // =================================
    socket.on("word:selected", handleWordSelected);
    socket.on("sentence:new", handleSentenceNew);
    socket.on("sentence:update", handleSentenceUpdate);
    socket.on("leaderboard:update", handleLeaderboardUpdate);

    socket.on("sentence:result", handleSentenceResult);
    socket.on("round:reset", handleRoundReset);

    return () => {
      socket.off("sentence:new", handleSentenceNew);
      socket.off("sentence:update", handleSentenceUpdate);
      socket.off("leaderboard:update", handleLeaderboardUpdate);
      socket.off("sentence:result", handleSentenceResult);
      socket.off("word:selected", handleWordSelected);
      socket.off("round:reset", handleRoundReset);
    };
  }, [user, id, details]);

  /* =============================
     Loading
  ============================= */

  if (loading && !details)
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  const isChooser = details?.is_word_chooser;

  /* =============================
     Render
  ============================= */

  return (
    <SafeAreaView style={{ flex: 1, padding: 15 }}>
      <View style={styles.gameContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Game Lobby</Text>
        </View>
        <View style={{ marginBottom: 10 }}>
          <View style={styles.scoreHeader}>
            <View style={styles.scoreLeft}>
              <MaterialCommunityIcons name="podium-gold" size={22} />
              <Text style={styles.scoreTitle}>Player Scoreboard</Text>
            </View>

            <Pressable onPress={toggleScores}>
              <FontAwesome6
                name={showPlayerScore ? "chevron-down" : "chevron-up"}
                size={20}
              />
            </Pressable>
          </View>

          {showPlayerScore && (
            <View>
              <FlatList
                data={scores}
                keyExtractor={(item) => item.username}
                renderItem={({ item, index }) => (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text>
                      {index + 1}. {item.username}
                    </Text>
                    <Text>{item.points}</Text>
                  </View>
                )}
              />
            </View>
          )}
        </View>
        <View style={styles.idRow}>
          <Text>Id:{details?.invite_code}</Text>
          <Pressable onPress={copyIdClipboard}>
            <FontAwesome6 name="copy" size={18} />
          </Pressable>
        </View>
      </View>

      <View style={styles.Game}>
        {isChooser ? (
          !selectedWord ? (
            <>
              <Text style={styles.sectionTitle}>Select Word</Text>

              {loadingWords ? (
                <View style={{ padding: 30, alignItems: "center" }}>
                  <ActivityIndicator size="large" color="#2488ca" />
                  <Text style={{ marginTop: 10 }}>Fetching words...</Text>
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
                        <Text>{item.word}</Text>
                        <Text>{item.definition}</Text>
                      </Pressable>
                    )}
                    contentContainerStyle={{ paddingBottom: 20 }}
                  />

                  <Button title="Refresh Words" onPress={requestWords} />
                </>
              )}
            </>
          ) : (
            <>
              <View
                style={{
                  justifyContent: "space-between",
                  flexDirection: "row",
                }}
              >
                <Text style={styles.wordTitle}>
                  Selected Word: {selectedWord.word}
                </Text>
                {isChooser === true && (
                  <Pressable style={styles.nextRoundBtn} onPress={nextRound}>
                    <MaterialCommunityIcons
                      name="skip-next"
                      size={26}
                      color="white"
                    />
                  </Pressable>
                )}
              </View>
              <Text>{selectedWord.definition}</Text>
              <Text style={styles.sectionTitle}>Submitted Sentences</Text>

              <FlatList
                data={sentences}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 40 }}
                renderItem={({ item }) => (
                  <View style={styles.card}>
                    <Text>{item.sentence}</Text>
                    <Text>Submitted by {item.username ?? "Unknown"}</Text>

                    {item.approved === null && (
                      <View style={styles.actionsRow}>
                        <TextInput
                          placeholder="Points"
                          keyboardType="numeric"
                          value={pointsMap[item.id] || ""}
                          onChangeText={(val) =>
                            setPointsMap((prev) => ({
                              ...prev,
                              [item.id]: val,
                            }))
                          }
                          style={styles.pointsInput}
                        />
                        <FontAwesome6
                          name="check-circle"
                          size={30}
                          color="green"
                          onPress={() =>
                            reviewSentence(
                              id!,
                              item.user_id,
                              true,
                              Number(pointsMap[item.id] || 0),
                            )
                          }
                        />
                        <FontAwesome6
                          name="times-circle"
                          size={30}
                          color="red"
                          onPress={() =>
                            reviewSentence(id!, item.user_id, false, 0)
                          }
                        />
                      </View>
                    )}
                    {item.approved === true && (
                      <Text style={{ color: "green", marginTop: 6 }}>
                        Approved
                      </Text>
                    )}

                    {item.approved === false && (
                      <Text style={{ color: "red", marginTop: 6 }}>
                        Rejected
                      </Text>
                    )}
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={{ textAlign: "center", marginTop: 20 }}>
                    Waiting for players...
                  </Text>
                }
              />
            </>
          )
        ) : !selectedWord ? (
          <Text>Waiting for word chooser...</Text>
        ) : (
          <>
            <Text style={styles.wordTitle}>Word: {selectedWord.word}</Text>
            <Text style={{ textAlign: "center" }}>
              {selectedWord.definition}
            </Text>

            {/* Find the sentence submitted by THIS player */}
            {!myStatus && (
              <>
                <TextInput
                  placeholder="Type in your sentence"
                  style={styles.input}
                  value={sentence}
                  onChangeText={setSentence}
                />
                <Button
                  title={submitting ? "Submitting..." : "Submit Sentence"}
                  onPress={submitSentence}
                  disabled={submitting}
                />
              </>
            )}
            {myStatus?.approved === null && (
              <Text style={{ color: "orange", marginTop: 10 }}>
                Waiting Approval...
              </Text>
            )}
            {myStatus?.approved === true && (
              <View style={styles.viewApprovedRejected}>
                <Text style={{ alignSelf: "center", paddingRight: 15 }}>
                  <FontAwesome6 name="check-circle" size={24} color="green" />
                </Text>

                <Text style={{ marginTop: 6, fontSize: 16 }}>
                  Your sentence has bee n approved {`\n`} Points earned:{" "}
                  {myStatus.points ?? 0}
                </Text>
              </View>
            )}

            {myStatus?.approved === false && (
              <View style={styles.viewApprovedRejected}>
                <Text style={{ alignSelf: "center", paddingRight: 15 }}>
                  <FontAwesome6 name="times-circle" size={24} color="red" />
                </Text>
                <Text style={{ marginTop: 6, fontSize: 16 }}>
                  Your sentence has been rejected {`\n`} Points earned:{" "}
                  {myStatus.points ?? 0}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      <View style={{ marginTop: "auto", paddingBottom: 10 }}>
        <Button
          title="Leave Room"
          color="#e2615a"
          onPress={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
}

/* =============================
   Styles
============================= */

const styles = StyleSheet.create({
  gameContainer: { marginBottom: 10 },

  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },

  idRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },

  sectionTitle: {
    marginTop: 20,
    fontWeight: "bold",
  },

  card: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 6,
  },

  viewApprovedRejected: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 6,
    flexDirection: "row",
  },

  word: {
    fontWeight: "bold",
  },

  wordTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },

  sentence: {
    paddingVertical: 6,
  },

  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 6,
  },

  Game: {
    flex: 1,
    marginTop: 0,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 20,
  },

  scoreLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  scoreTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  nextRoundBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",

    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center", // ⭐ vertical alignment
    justifyContent: "center",
    gap: 12, // spacing (RN 0.71+)
    marginTop: 10,
  },

  pointsInput: {
    width: 70,
    height: 40, // ⭐ match icon height visually
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    textAlign: "center",
  },
});
