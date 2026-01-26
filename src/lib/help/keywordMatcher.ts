/**
 * Keyword matching algorithm for help system
 * Matches user queries against article keywords using scoring
 */

import { normalizeText } from "./textNormalizer";
import type { HelpArticle, HelpSearchResult } from "@/types/help";

/**
 * Calculate match score for an article based on user query
 * @param userWords - Normalized user query words
 * @param article - Help article to score
 * @returns Score (number of matched keywords)
 */
function calculateScore(userWords: string[], article: HelpArticle): number {
  let score = 0;

  // Normalize article keywords
  const articleKeywords = article.keywords.map((keyword) =>
    normalizeText(keyword, false).join(" "),
  );

  // Count matches
  for (const userWord of userWords) {
    for (const keyword of articleKeywords) {
      if (keyword.includes(userWord) || userWord.includes(keyword)) {
        score++;
      }
    }
  }

  return score;
}

/**
 * Find best matching article for user query
 * @param query - User's question/query
 * @param articles - Array of help articles to search
 * @returns Best matching article or null if no match
 */
export function findBestMatch(
  query: string,
  articles: HelpArticle[],
): HelpSearchResult | null {
  // Normalize user query
  const userWords = normalizeText(query, true);

  if (userWords.length === 0) {
    return null;
  }

  // Calculate scores for all articles
  const scoredArticles = articles.map((article) => ({
    article,
    score: calculateScore(userWords, article),
  }));

  // Filter out zero scores
  const matchedArticles = scoredArticles.filter((item) => item.score > 0);

  if (matchedArticles.length === 0) {
    return null;
  }

  // Sort by score (descending), then by priority (descending)
  matchedArticles.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    return b.article.priority - a.article.priority;
  });

  // Return best match
  const bestMatch = matchedArticles[0];

  return {
    article: bestMatch.article,
    score: bestMatch.score,
    confidence: calculateConfidence(bestMatch.score, userWords.length),
  };
}

/**
 * Calculate confidence level based on score and query length
 * @param score - Match score
 * @param queryWordCount - Number of words in query
 * @returns Confidence level (0-1)
 */
function calculateConfidence(score: number, queryWordCount: number): number {
  if (queryWordCount === 0) return 0;

  // Confidence is ratio of matched words to query words, capped at 1
  const confidence = Math.min(score / queryWordCount, 1);

  return Math.round(confidence * 100) / 100; // Round to 2 decimals
}

/**
 * Get suggested articles based on category
 * @param articles - All help articles
 * @param category - Category to filter by
 * @param limit - Maximum number of suggestions
 * @returns Array of suggested articles
 */
export function getSuggestedArticles(
  articles: HelpArticle[],
  category?: string,
  limit = 5,
): HelpArticle[] {
  let filtered = articles;

  if (category) {
    filtered = articles.filter((article) => article.category === category);
  }

  // Sort by priority
  const sorted = [...filtered].sort((a, b) => b.priority - a.priority);

  return sorted.slice(0, limit);
}
