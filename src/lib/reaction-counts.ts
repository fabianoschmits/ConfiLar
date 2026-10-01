import type { ReactionCounts, ReactionType } from "@/types/reactions";

export function nextReactionCounts(
  counts: ReactionCounts,
  previous: ReactionType | null,
  requested: ReactionType,
): ReactionCounts {
  const next = { ...counts };
  if (previous) next[previous] = Math.max(0, next[previous] - 1);
  if (previous !== requested) next[requested] += 1;
  next.total = Math.max(
    0,
    counts.total + (previous === requested ? -1 : previous ? 0 : 1),
  );
  return next;
}
