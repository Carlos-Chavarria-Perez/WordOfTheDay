import apiClient from "./apiClient";

//
// ================= TYPES =================
//

export interface Sentence {
  id: string;
  user_id: string;
  sentence: string;
  approved: boolean | null;
  points: number;
  round: number;
  created_at: string;
}

export interface SubmitSentenceResponse {
  message: string;
}

export interface ReviewSentenceResponse {
  message: string;
}

export interface ResetRoundResponse {
  message: string;
}

//
// ================= API =================
//

export async function getSentencesApi(game_id: string): Promise<Sentence[]> {
  const res = await apiClient.get<Sentence[]>(`/sentence/${game_id}`);

  return res.data;
}

//
// --------------------------------------
//

export async function submitSentenceApi(
  game_id: string,
  sentence: string,
): Promise<SubmitSentenceResponse> {
  const res = await apiClient.post<SubmitSentenceResponse>(`/sentence`, {
    game_id,
    sentence,
  });

  return res.data;
}

//
// --------------------------------------
//

export async function reviewSentenceApi(
  game_id: string,
  sentence_owner_id: string,
  approved: boolean,
  points: number,
): Promise<ReviewSentenceResponse> {
  const res = await apiClient.post<ReviewSentenceResponse>("/sentence/review", {
    game_id,
    sentence_owner_id,
    approved,
    points,
  });

  return res.data;
}

//
// --------------------------------------
//

export async function nextRoundApi(
  game_id: string,
): Promise<ResetRoundResponse> {
  const res = await apiClient.post<ResetRoundResponse>(
    `/sentence/reset/${game_id}`,
    {},
  );

  return res.data;
}
