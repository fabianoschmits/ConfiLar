export type ReactionType = "like" | "heart" | "laugh" | "fire";

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface ReactionCounts {
  like: number;
  heart: number;
  laugh: number;
  fire: number;
  total: number;
}

export interface UserReaction {
  post_id: string;
  reaction_type: ReactionType | null;
}

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: "👍",
  heart: "❤️",
  laugh: "😂",
  fire: "🔥",
};

export const REACTION_COLORS: Record<ReactionType, string> = {
  like: "text-gray-600",
  heart: "text-gray-600",
  laugh: "text-gray-600",
  fire: "text-gray-600",
};
