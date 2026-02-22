export type LeaderboardItem = {
  username: string;
  points: number;
};


export type Sentence = {
  id: string;
  user_id: string;
  sentence: string;
  approved: boolean | null;
  username?: string;
  points?: number;
};