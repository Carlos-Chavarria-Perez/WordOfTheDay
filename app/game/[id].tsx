import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getGameDetails, getLeaderboardApi } from "../../api/game";
import {
  getSentencesApi,
  nextRoundApi,
  reviewSentenceApi,
  submitSentenceApi,
} from "../../api/sentences";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LeaderboardItem } from "@/types/game";
import * as Clipboard from "expo-clipboard";
import { connectSocket, getSocket } from "../../api/socket";
import LobbyHeader from "../components/game/LobbyHeader";
import ScoreBoard from "../components/game/ScoreBoard";
import ChooserView from "../components/game/ChooserView";
import PlayerView from "../components/game/PlayerView";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

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

export default function Game() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadingWords, setLoadingWords] = useState(false);

  const [details, setDetails] = useState<any>(null);
  const [inviteCode, setInviteCode] = useState<any>(null);
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

      const res = await fetch(
        "https://wordofthedaybackend.onrender.com/word/random-word",
      );
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
    if (!details?.invite_code) return;

    await Clipboard.setStringAsync(details.invite_code);
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

  const handleSentenceResult = (data: Sentence) => {
    // Update sentences list
    setSentences((prev) =>
      prev.map((s) =>
        s.user_id === data.user_id
          ? { ...s, approved: data.approved, points: data.points }
          : s,
      ),
    );

    // If it's me, also update myStatus
    if (data.user_id === user?.user_id) {
      setMyStatus({
        approved: data.approved,
        points: data.points,
      });
    }
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
    <SafeAreaView style={styles.safeArea}>
      {/* Top Section */}
      <View style={styles.headerSection}>
        <LobbyHeader
          game_name={details?.game_name}
          invite_code={details?.invite_code}
          onCopy={copyIdClipboard}
        />

        <ScoreBoard scores={scores} />
      </View>

      {/* Main Game Section */}
      <View style={styles.contentSection}>
        {isChooser ? (
          <ChooserView
            words={words}
            selectedWord={selectedWord}
            loadingWords={loadingWords}
            sentences={sentences}
            pointsMap={pointsMap}
            setPointsMap={setPointsMap}
            chooseWord={chooseWord}
            reviewSentence={reviewSentence}
            requestWords={requestWords}
            nextRound={nextRound}
            gameId={id!}
          />
        ) : (
          <PlayerView
            selectedWord={selectedWord}
            sentence={sentence}
            setSentence={setSentence}
            submitSentence={submitSentence}
            submitting={submitting}
            myStatus={myStatus}
            sentences={sentences}
          />
        )}
      </View>

      {/* <View style={{flexDirection: "row", justifyContent: "flex-end", padding:20 }}>
        <Pressable style={styles.chat}>
          <FontAwesome6 name="message" size={27} color="white" />
        </Pressable>
      </View> */}

      {/* Bottom Section */}
      <View style={styles.footer}>
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
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "transparent",
  },

  headerSection: {
    marginBottom: 12,
  },

  contentSection: {
    flex: 1,
  },

  footer: {
    marginTop: 20,
    paddingBottom: 10,
  },
  chat: {
    backgroundColor: "#385541c5",
    padding: 20,
    borderRadius: 50,
    borderWidth: 1,
  },
});
