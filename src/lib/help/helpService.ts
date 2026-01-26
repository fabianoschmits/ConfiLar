/**
 * Help service - Business logic for help system
 */

import { supabase as createClient } from "@/lib/supabase";
import { findBestMatch } from "./keywordMatcher";
import type { HelpArticle, HelpSearchResult, HelpLogEntry } from "@/types/help";

/**
 * Search for help articles matching user query
 * @param query - User's question
 * @returns Best matching article or null
 */
export async function searchHelpArticles(
  query: string,
): Promise<HelpSearchResult | null> {
  try {
    const supabase = createClient;

    // Fetch all enabled articles
    const { data: articles, error } = await supabase
      .from("help_articles")
      .select("*")
      .eq("enabled", true)
      .order("priority", { ascending: false });

    if (error) {
      console.error("Error fetching help articles:", error);
      return null;
    }

    if (!articles || articles.length === 0) {
      return null;
    }

    // Find best match using keyword matcher
    const result = findBestMatch(query, articles as HelpArticle[]);

    return result;
  } catch (error) {
    console.error("Error searching help articles:", error);
    return null;
  }
}

/**
 * Log help interaction for metrics
 * @param logEntry - Log entry data
 */
export async function logHelpInteraction(
  logEntry: HelpLogEntry,
): Promise<void> {
  try {
    const supabase = createClient;

    // Get current user ID if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("help_logs").insert({
      user_id: user?.id || null,
      user_message: logEntry.user_message,
      matched_article_id: logEntry.matched_article_id || null,
    });

    if (error) {
      console.error("Error logging help interaction:", error);
    }
  } catch (error) {
    console.error("Error logging help interaction:", error);
  }
}

/**
 * Get all help articles (for admin or display purposes)
 * @param enabledOnly - Whether to fetch only enabled articles
 * @returns Array of help articles
 */
export async function getAllHelpArticles(
  enabledOnly = true,
): Promise<HelpArticle[]> {
  try {
    const supabase = createClient;

    let query = supabase
      .from("help_articles")
      .select("*")
      .order("priority", { ascending: false });

    if (enabledOnly) {
      query = query.eq("enabled", true);
    }

    const { data: articles, error } = await query;

    if (error) {
      console.error("Error fetching help articles:", error);
      return [];
    }

    return (articles as HelpArticle[]) || [];
  } catch (error) {
    console.error("Error fetching help articles:", error);
    return [];
  }
}

/**
 * Get help articles by category
 * @param category - Category to filter by
 * @returns Array of help articles
 */
export async function getHelpArticlesByCategory(
  category: string,
): Promise<HelpArticle[]> {
  try {
    const supabase = createClient;

    const { data: articles, error } = await supabase
      .from("help_articles")
      .select("*")
      .eq("category", category)
      .eq("enabled", true)
      .order("priority", { ascending: false });

    if (error) {
      console.error("Error fetching help articles by category:", error);
      return [];
    }

    return (articles as HelpArticle[]) || [];
  } catch (error) {
    console.error("Error fetching help articles by category:", error);
    return [];
  }
}
