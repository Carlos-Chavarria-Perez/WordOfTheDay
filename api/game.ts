import { CreateGameResponse,Game,GameDetailsResponse,JoinGameResponse, LeaderboardPlayer, } from "@/types/game";
import apiClient from "./apiClient";

// ================= API =================
//

export async function createGame(
  game_name: string,
): Promise<CreateGameResponse> {
  const res = await apiClient.post<CreateGameResponse>("/game/create", {
    game_name,
  });

  return res.data;
}

//
// --------------------------------------
//

export async function getGames(): Promise<Game[]> {
  const res = await apiClient.get<Game[]>("/game/getgames");
  return res.data;
}

//
// --------------------------------------
//

export async function joinGame(game_id: string): Promise<JoinGameResponse> {
  const res = await apiClient.post<JoinGameResponse>(
    `/game/join/${game_id}`,
    {},
  );
  return res.data;
}

//
// --------------------------------------
//

export async function getGameDetails(id: string): Promise<GameDetailsResponse> {
  const res = await apiClient.get<GameDetailsResponse>(`/game/${id}`);
  return res.data;
}

//
// --------------------------------------
//

export async function getLeaderboardApi(
  game_id: string,
): Promise<LeaderboardPlayer[]> {
  const res = await apiClient.get<LeaderboardPlayer[]>(
    `/game/leaderboard/${game_id}`,
  );

  return res.data;
}
