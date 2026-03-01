export type WordItem = {
  word: string;
  definition: string;
};

export type LeaderboardItem = {
  username: string;
  points: number;
};

export interface Sentence {
  id: string;
  user_id: string;
  username: string;
  sentence: string;
  approved: boolean | null;
  points: number;
  round: number;
  created_at: string;
  review_comment?: string | null;
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

// Game Types
export interface Game {
  id: string;
  game_name: string;
  current_round: number;
  created_at: string;
}

export interface CreateGameResponse {
  message: string;
  game_id: string;
  invite_code: string;
}

export interface JoinGameResponse {
  message: string;
  game_id: string;
}

export interface GameDetailsResponse {
  game_id: string;
  is_word_chooser: boolean;
  players: {
    username: string;
    points: number;
  }[];
}

export interface LeaderboardPlayer {
  username: string;
  points: number;
}

export interface ResetRoundResponse {
  message: string;
}

// USer types
export interface AuthResponse {
  message: string;
  user: {
    user_id: string;
    username: string;
  };
  token: string;
}
